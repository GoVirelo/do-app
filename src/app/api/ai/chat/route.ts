import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "list_tasks",
    description: "Fetch tasks for the user with optional filters. Returns id, title, status, priority, bucket, source, dueAt, scheduledStart, scheduledEnd.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["open", "done", "snoozed", "all"], description: "Filter by status. Use 'all' for everything." },
        source: { type: "string", enum: ["granola", "slack", "outlook", "manual", "personal"], description: "Filter by source" },
        bucket: { type: "string", enum: ["inbox", "today", "upcoming", "waiting", "done"], description: "Filter by bucket" },
        search: { type: "string", description: "Search task titles (case-insensitive substring)" },
      },
    },
  },
  {
    name: "update_task",
    description: "Update a single task — status, bucket, priority, or schedule it with a time block (scheduledStart + scheduledEnd as ISO 8601 strings).",
    input_schema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Task ID" },
        status: { type: "string", enum: ["open", "done", "snoozed"] },
        bucket: { type: "string", enum: ["inbox", "today", "upcoming", "waiting"] },
        priority: { type: "string", enum: ["hot", "high", "medium", "low"] },
        scheduledStart: { type: "string", description: "ISO 8601 datetime for when this task block starts, e.g. 2024-04-26T14:00:00.000Z" },
        scheduledEnd:   { type: "string", description: "ISO 8601 datetime for when this task block ends" },
      },
      required: ["id"],
    },
  },
  {
    name: "bulk_update_tasks",
    description: "Update multiple tasks at once (status, bucket, or priority). Does NOT support scheduling — use update_task per task for that.",
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
  {
    name: "schedule_tasks",
    description: "Schedule multiple tasks into time blocks in one call. Use this for 'plan my day' to schedule several tasks at once.",
    input_schema: {
      type: "object" as const,
      properties: {
        tasks: {
          type: "array",
          description: "List of tasks to schedule",
          items: {
            type: "object",
            properties: {
              id:             { type: "string", description: "Task ID" },
              scheduledStart: { type: "string", description: "ISO 8601 start datetime" },
              scheduledEnd:   { type: "string", description: "ISO 8601 end datetime" },
              bucket:         { type: "string", enum: ["inbox", "today", "upcoming", "waiting"], description: "Set to 'today' when scheduling for today" },
            },
            required: ["id", "scheduledStart", "scheduledEnd"],
          },
        },
      },
      required: ["tasks"],
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
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, title: true, status: true, priority: true,
        bucket: true, source: true, dueAt: true,
        scheduledStart: true, scheduledEnd: true,
        createdAt: true,
      },
    });
    return tasks;
  }

  if (name === "update_task") {
    const data: any = {};
    if (input.status)         data.status = input.status;
    if (input.bucket)         data.bucket = input.bucket;
    if (input.priority)       data.priority = input.priority;
    if (input.scheduledStart) data.scheduledStart = new Date(input.scheduledStart);
    if (input.scheduledEnd)   data.scheduledEnd   = new Date(input.scheduledEnd);
    const task = await prisma.task.update({ where: { id: input.id }, data });
    return { updated: task.id, title: task.title };
  }

  if (name === "bulk_update_tasks") {
    const data: any = {};
    if (input.status)   data.status   = input.status;
    if (input.bucket)   data.bucket   = input.bucket;
    if (input.priority) data.priority = input.priority;
    const result = await prisma.task.updateMany({
      where: { id: { in: input.ids }, userId },
      data,
    });
    return { updated: result.count };
  }

  if (name === "schedule_tasks") {
    const results: { id: string; title: string }[] = [];
    for (const t of input.tasks) {
      const data: any = {
        scheduledStart: new Date(t.scheduledStart),
        scheduledEnd:   new Date(t.scheduledEnd),
      };
      if (t.bucket) data.bucket = t.bucket;
      const task = await prisma.task.update({ where: { id: t.id }, data });
      results.push({ id: task.id, title: task.title });
    }
    return { scheduled: results.length, tasks: results };
  }

  return { error: "Unknown tool" };
}

function buildSystem(userName: string | null | undefined, userEmail: string | null | undefined) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return `You are a smart task assistant for ${userName ?? userEmail}. Today is ${dateStr} and the current time is ${timeStr}.

You have tools to list, update, and schedule tasks. Tasks come from Granola (meeting notes), Slack, Outlook, and manual entry.

When asked to "plan my day" or schedule tasks:
1. First call list_tasks with status="open" to see what's unscheduled
2. Identify task types:
   - QUICK tasks (~10-15 min): titles starting with reply, respond, send, email, call, ping, message, follow up, confirm, approve, update, check, notify, share, book — group these into a single catch-up block
   - FOCUS tasks (~30 min to 2 hrs): complex work, meeting follow-ups, analysis, building, writing — each gets its own block
3. Build a schedule starting from NOW (${timeStr}) filling slots until 6pm:
   - Leave 5-minute buffers between blocks
   - Group all quick tasks into one 30-60 min catch-up block
   - Give focus/hot tasks 45-90 min each
4. Use the schedule_tasks tool to apply all time blocks in one call, setting bucket="today"
5. Reply with a brief summary of what you scheduled

Be concise. Don't ask clarifying questions — just plan and schedule.`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };
  if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

  const system = buildSystem(session.user.name, session.user.email);
  let currentMessages = [...messages];

  // Agentic loop — up to 8 iterations for complex planning
  for (let i = 0; i < 8; i++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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
