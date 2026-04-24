import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description: "Fetch tasks for the user with optional filters.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["open", "done", "snoozed", "all"], description: "Filter by status. Use 'all' for everything." },
        source: { type: "string", enum: ["granola", "slack", "outlook", "manual"], description: "Filter by source" },
        bucket: { type: "string", enum: ["inbox", "today", "upcoming", "waiting", "done"], description: "Filter by bucket" },
        search: { type: "string", description: "Search task titles (case-insensitive substring)" },
      },
    },
  },
  {
    name: "update_task",
    description: "Update a task's status, bucket, or priority.",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Task ID" },
        status: { type: "string", enum: ["open", "done", "snoozed"] },
        bucket: { type: "string", enum: ["inbox", "today", "upcoming", "waiting"] },
        priority: { type: "string", enum: ["hot", "high", "medium", "low"] },
      },
      required: ["id"],
    },
  },
  {
    name: "bulk_update_tasks",
    description: "Update multiple tasks at once.",
    input_schema: {
      type: "object" as const,
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "Task IDs to update" },
        status: { type: "string", enum: ["open", "done", "snoozed"] },
        bucket: { type: "string", enum: ["inbox", "today", "upcoming", "waiting"] },
        priority: { type: "string", enum: ["hot", "high", "medium", "low"] },
      },
      required: ["ids"],
    },
  },
];

async function runTool(name: string, input: Record<string, any>, userId: string) {
  if (name === "list_tasks") {
    const where: any = { userId };
    if (input.status && input.status !== "all") where.status = input.status;
    if (input.source) where.source = input.source;
    if (input.bucket) where.bucket = input.bucket;
    if (input.search) where.title = { contains: input.search, mode: "insensitive" };
    const tasks = await prisma.task.findMany({
      where, orderBy: { createdAt: "desc" }, take: 50,
      select: { id: true, title: true, status: true, priority: true, bucket: true, source: true, dueAt: true, createdAt: true },
    });
    return tasks;
  }

  if (name === "update_task") {
    const data: any = {};
    if (input.status) data.status = input.status;
    if (input.bucket) data.bucket = input.bucket;
    if (input.priority) data.priority = input.priority;
    const task = await prisma.task.update({ where: { id: input.id }, data });
    return { updated: task.id, title: task.title, status: task.status };
  }

  if (name === "bulk_update_tasks") {
    const data: any = {};
    if (input.status) data.status = input.status;
    if (input.bucket) data.bucket = input.bucket;
    if (input.priority) data.priority = input.priority;
    const result = await prisma.task.updateMany({
      where: { id: { in: input.ids }, userId },
      data,
    });
    return { updated: result.count };
  }

  return { error: "Unknown tool" };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };
  if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

  const system = `You are a task assistant for ${session.user.name ?? session.user.email}. You have access to their task database and can query, update, restore, and analyse tasks. Tasks come from Granola (meeting notes), Slack, Outlook, and manual entry. Be concise and direct. Today is ${new Date().toDateString()}.`;

  let currentMessages = [...messages];

  // Agentic loop — let Claude call tools until it has a final answer
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system,
      tools: TOOLS,
      messages: currentMessages,
    });

    if (response.stop_reason === "end_turn") {
      const text = response.content.find(b => b.type === "text")?.text ?? "";
      return NextResponse.json({ reply: text });
    }

    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(b => b.type === "tool_use") as Anthropic.ToolUseBlock[];
      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (t) => ({
          type: "tool_result" as const,
          tool_use_id: t.id,
          content: JSON.stringify(await runTool(t.name, t.input as Record<string, any>, userId)),
        }))
      );
      currentMessages = [
        ...currentMessages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ];
      continue;
    }

    break;
  }

  return NextResponse.json({ reply: "Done." });
}
