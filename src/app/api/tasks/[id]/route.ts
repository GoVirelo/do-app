import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: z.enum(["open", "done", "snoozed"]).optional(),
  priority: z.enum(["hot", "high", "medium", "low"]).optional(),
  bucket: z.enum(["inbox", "today", "upcoming", "waiting", "done"]).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
});

async function getTask(userId: string, id: string) {
  return prisma.task.findFirst({ where: { id, userId }, include: { aiDraft: true } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await getTask(session.user.id, id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getTask(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...parsed.data,
      dueAt: parsed.data.dueAt !== undefined
        ? (parsed.data.dueAt ? new Date(parsed.data.dueAt) : null)
        : undefined,
      scheduledStart: parsed.data.scheduledStart !== undefined
        ? (parsed.data.scheduledStart ? new Date(parsed.data.scheduledStart) : null)
        : undefined,
      scheduledEnd: parsed.data.scheduledEnd !== undefined
        ? (parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : null)
        : undefined,
    },
    include: { aiDraft: true },
  });

  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getTask(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
