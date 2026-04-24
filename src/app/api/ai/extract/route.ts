import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractActionsFromNotes } from "@/lib/services/claude";
import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  meetingId: z.string(),
});

// POST /api/ai/extract — extract action items from meeting notes
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const meeting = await prisma.meeting.findFirst({
    where: { id: parsed.data.meetingId, userId: session.user.id },
  });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  if (!meeting.rawNotes) return NextResponse.json({ error: "No notes" }, { status: 400 });

  const attendees = (meeting.attendees as any[]).map((a) =>
    typeof a === "string" ? a : a.email ?? a.name ?? ""
  );

  const actions = await extractActionsFromNotes(
    meeting.rawNotes,
    meeting.title,
    attendees
  );

  const tasks = await Promise.all(
    actions.map((action) =>
      prisma.task.create({
        data: {
          userId: session.user!.id!,
          title: action.title,
          priority: action.priority,
          source: "granola",
          sourceRef: meeting.granolaId ?? meeting.id,
          bucket: "inbox",
          meetingId: meeting.id,
          dueAt: action.dueDate ? new Date(action.dueDate) : undefined,
        },
      })
    )
  );

  return NextResponse.json({ tasks, count: tasks.length });
}
