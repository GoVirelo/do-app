import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  title: z.string().min(1).max(500),
  notes: z.string().optional(),
  priority: z.enum(["hot", "high", "medium", "low"]).optional().default("medium"),
  bucket: z.enum(["inbox", "today", "upcoming"]).optional().default("inbox"),
});

export async function POST(req: Request) {
  // Accept token via Authorization header or ?token= query param
  const url = new URL(req.url);
  const tokenParam = url.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const token = tokenParam ?? authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { shortcutToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      notes: parsed.data.notes,
      priority: parsed.data.priority,
      bucket: parsed.data.bucket,
      source: "manual",
    },
  });

  return NextResponse.json({ ok: true, taskId: task.id, title: task.title }, { status: 201 });
}
