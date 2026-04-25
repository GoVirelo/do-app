import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postMessage } from "@/lib/services/slack";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const task = await prisma.task.findFirst({
    where: { id: params.id, userId },
    include: { aiDraft: true },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.source !== "slack") return NextResponse.json({ error: "Not a Slack task" }, { status: 400 });

  const { body } = await req.json() as { body?: string };
  const text = body ?? task.aiDraft?.body;
  if (!text) return NextResponse.json({ error: "No reply body" }, { status: 400 });

  // Parse channelId + threadTs from sourceRef JSON
  let channelId: string | undefined;
  let threadTs: string | undefined;
  try {
    const meta = JSON.parse(task.sourceRef ?? "{}");
    channelId = meta.channelId;
    threadTs = meta.threadTs;
  } catch {}

  if (!channelId) return NextResponse.json({ error: "Missing Slack channel info" }, { status: 400 });

  await postMessage(userId, channelId, text, threadTs);

  // Mark draft as sent
  if (task.aiDraft) {
    await prisma.aIDraft.update({
      where: { id: task.aiDraft.id },
      data: { status: "sent", sentAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
