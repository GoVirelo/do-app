import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WebClient } from "@slack/web-api";
import { NextResponse } from "next/server";

export interface SlackContextMessage {
  ts: string;
  userId: string;
  username: string;
  text: string;
  isTarget: boolean;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id, source: "slack" },
  });
  if (!task) return NextResponse.json({ error: "Task not found or not a Slack task" }, { status: 404 });

  let channelId: string | null = null;
  let threadTs: string | null = null;
  let targetTs: string | null = null;
  let isThread = false;

  try {
    if (task.sourceRef) {
      const ref = JSON.parse(task.sourceRef);
      channelId = ref.channelId ?? null;
      threadTs  = ref.threadTs ?? null;
      targetTs  = ref.ts ?? ref.threadTs ?? null;
      isThread  = ref.isThread ?? false;
    }
  } catch {
    return NextResponse.json({ error: "Invalid sourceRef on task" }, { status: 400 });
  }

  if (!channelId || !targetTs) return NextResponse.json({ error: "Missing channelId or ts on task" }, { status: 400 });

  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "slack" } },
  });
  if (!integration) return NextResponse.json({ error: "Slack not connected" }, { status: 400 });

  const slack = new WebClient(integration.accessToken);

  // Resolve user names (cached per request)
  const nameCache: Record<string, string> = {};
  async function resolveName(uid: string): Promise<string> {
    if (!uid) return "unknown";
    if (nameCache[uid]) return nameCache[uid];
    try {
      const info = await slack.users.info({ user: uid });
      nameCache[uid] = info.user?.real_name ?? info.user?.name ?? uid;
    } catch {
      nameCache[uid] = uid;
    }
    return nameCache[uid];
  }

  let messages: SlackContextMessage[] = [];

  try {
    if (isThread && threadTs) {
      // ── Real Slack thread — load all replies ──────────────────────────────
      const thread = await slack.conversations.replies({
        channel: channelId,
        ts: threadTs,
        limit: 30,
      });

      for (const m of thread.messages ?? []) {
        if (!m.ts || !m.text) continue;
        messages.push({
          ts: m.ts,
          userId: m.user ?? "",
          username: await resolveName(m.user ?? ""),
          text: m.text,
          isTarget: m.ts === targetTs,
        });
      }
    } else {
      // ── DM or channel message — load surrounding history ──────────────────
      // Get a ±2 hour window around the target message for context
      const targetTsNum = parseFloat(targetTs);
      const windowSecs = 2 * 60 * 60; // 2 hours each side

      const history = await slack.conversations.history({
        channel: channelId,
        oldest: (targetTsNum - windowSecs).toString(),
        latest: (targetTsNum + windowSecs).toString(),
        limit: 30,
        inclusive: true,
      });

      // API returns newest-first, reverse to chronological order
      const raw = [...(history.messages ?? [])].reverse();
      for (const m of raw) {
        if (!m.ts || !m.text) continue;
        if (m.subtype === "bot_message") continue;
        messages.push({
          ts: m.ts,
          userId: m.user ?? "",
          username: await resolveName(m.user ?? ""),
          text: m.text,
          isTarget: m.ts === targetTs,
        });
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  // Trim to 3 before + target + 3 after
  const targetIdx = messages.findIndex(m => m.isTarget);
  if (targetIdx >= 0) {
    const start = Math.max(0, targetIdx - 3);
    const end   = Math.min(messages.length, targetIdx + 4);
    messages = messages.slice(start, end);
  } else {
    // Target not found — show last 7 and mark closest as target
    messages = messages.slice(-7);
  }

  return NextResponse.json({ messages, channelId, threadTs, isThread });
}
