import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  priority: z.enum(["hot", "high", "medium", "low"]).default("medium"),
  bucket: z.enum(["inbox", "today", "upcoming", "waiting", "done"]).default("inbox"),
  source: z.string().optional(),
  meetingId: z.string().optional(),
  notes: z.string().optional(),
  subtasks: z.array(z.string()).optional(),
  dueAt: z.string().datetime().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      ...(bucket ? { bucket } : {}),
      ...(status ? { status } : { status: { not: "done" } }),
      ...(source ? { source } : {}),
    },
    include: { aiDraft: true },
    orderBy: [
      { bucket: "asc" },
      { priority: "asc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { source, meetingId, notes, subtasks, dueAt, scheduledStart, scheduledEnd, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: {
      ...rest,
      userId: session.user.id,
      source: source ?? "manual",
      meetingId: meetingId ?? undefined,
      notes: notes ?? undefined,
      subtasks: subtasks ?? [],
      dueAt: dueAt ? new Date(dueAt) : undefined,
      scheduledStart: scheduledStart ? new Date(scheduledStart) : undefined,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
    },
    include: { aiDraft: true },
  });

  return NextResponse.json(task, { status: 201 });
}
