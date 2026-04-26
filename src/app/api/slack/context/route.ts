import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WebClient } from "@slack/web-api";
import { NextResponse } from "next/server";

export interface SlackContextMessage {
  ts: string;
  userId: string;
  username: string;
  text: string;
  isTarget: boolean; // the message that created this task
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  // Load the task
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id, source: "slack" },
  });
  if (!task) return NextResponse.json({ error: "Task not found or not a Slack task" }, { status: 404 });

  // Parse sourceRef — stored as JSON { channelId, threadTs }
  let channelId: string | null = null;
  let threadTs: string | null = null;
  let targetTs: string | null = null;

  try {
    if (task.sourceRef) {
      const ref = JSON.parse(task.sourceRef);
      channelId = ref.channelId ?? null;
      threadTs  = ref.threadTs ?? null;
      targetTs  = ref.threadTs ?? null;
    }
  } catch {
    return NextResponse.json({ error: "Invalid sourceRef on task" }, { status: 400 });
  }

  if (!channelId) return NextResponse.json({ error: "No channelId on task" }, { status: 400 });

  // Get Slack client
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "slack" } },
  });
  if (!integration) return NextResponse.json({ error: "Slack not connected" }, { status: 400 });

  const slack = new WebClient(integration.accessToken);

  // Helper: resolve user ID → display name (cached per request)
  const nameCache: Record<string, string> = {};
  async function resolveName(uid: string): Promise<string> {
    if (!uid) return "unknown";
    if (nameCache[uid]) return nameCache[uid];
    try {
      const info = await slack.users.info({ user: uid });
      const name = info.user?.real_name ?? info.user?.name ?? uid;
      nameCache[uid] = name;
      return name;
    } catch {
      return uid;
    }
  }

  let messages: SlackContextMessage[] = [];

  try {
    if (threadTs) {
      // This is a threaded message — fetch the full thread
      const thread = await slack.conversations.replies({
        channel: channelId,
        ts: threadTs,
        limit: 20,
      });

      const raw = thread.messages ?? [];
      for (const m of raw) {
        if (!m.ts || !m.text) continue;
        const username = await resolveName(m.user ?? "");
        messages.push({
          ts: m.ts,
          userId: m.user ?? "",
          username,
          text: m.text,
          isTarget: m.ts === targetTs,
        });
      }
    } else {
      // DM or channel message — get surrounding history
      const targetTsNum = parseFloat(targetTs ?? "0");
      const windowSecs = 60 * 60; // 1 hour window

      const history = await slack.conversations.history({
        channel: channelId,
        oldest: (targetTsNum - windowSecs).toString(),
        latest: (targetTsNum + windowSecs).toString(),
        limit: 20,
        inclusive: true,
      });

      const raw = (history.messages ?? []).reverse(); // API returns newest first
      for (const m of raw) {
        if (!m.ts || !m.text) continue;
        const username = await resolveName(m.user ?? "");
        messages.push({
          ts: m.ts,
          userId: m.user ?? "",
          username,
          text: m.text,
          isTarget: m.ts === targetTs,
        });
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  // Trim to ~3 before + target + ~3 after
  const targetIdx = messages.findIndex(m => m.isTarget);
  if (targetIdx >= 0) {
    const start = Math.max(0, targetIdx - 3);
    const end   = Math.min(messages.length, targetIdx + 4);
    messages = messages.slice(start, end);
  } else {
    // If we can't find the exact message, show last 7
    messages = messages.slice(-7);
  }

  return NextResponse.json({ messages, channelId, threadTs });
}
