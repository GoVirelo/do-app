import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDraftReply } from "@/lib/services/claude";
import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  taskId: z.string(),
  channel: z.enum(["slack", "email", "teams"]).default("slack"),
});

// POST /api/ai/draft — generate or regenerate a draft for a task
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.taskId, userId: session.user.id },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const draft = await generateDraftReply(
    task.title,
    task.sourceRef ?? "",
    parsed.data.channel,
    { email: session.user.email ?? undefined, name: session.user.name ?? undefined }
  );

  const saved = await prisma.aIDraft.upsert({
    where: { taskId: task.id },
    create: { taskId: task.id, body: draft.body, channel: parsed.data.channel },
    update: { body: draft.body, channel: parsed.data.channel, status: "proposed" },
  });

  return NextResponse.json(saved);
}

// PATCH /api/ai/draft — update draft status (sent / skipped)
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, status } = await req.json();
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const draft = await prisma.aIDraft.update({
    where: { taskId },
    data: {
      status,
      sentAt: status === "sent" ? new Date() : undefined,
    },
  });

  return NextResponse.json(draft);
}
