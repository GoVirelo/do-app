import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GRANOLA_BASE = "https://public-api.granola.ai/v1";

export interface GranolaNote {
  id: string;
  title: string;
  created_at: string;
  summary?: string;
  transcript?: string;
  attendees?: { name: string; email: string }[];
}

export async function fetchRecentNotes(since?: Date): Promise<GranolaNote[]> {
  const apiKey = process.env.GRANOLA_API_KEY;
  if (!apiKey) throw new Error("GRANOLA_API_KEY not set");

  const url = new URL(`${GRANOLA_BASE}/notes`);
  if (since) url.searchParams.set("created_after", since.toISOString());

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Granola API error: ${res.status}`);
  const data = await res.json();
  return (data.notes ?? data) as GranolaNote[];
}

// Granola sends webhooks; this service processes them.
// Granola REST API docs: https://docs.granola.ai (not yet public)
// For now: inbound webhook validation + storage.

const GranolaWebhookSchema = z.object({
  event: z.enum(["meeting.completed", "meeting.updated"]),
  meetingId: z.string(),
  title: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  attendees: z.array(z.object({ name: z.string(), email: z.string() })).default([]),
  notes: z.string().optional(),
  actionItems: z
    .array(
      z.object({
        text: z.string(),
        assignee: z.string().optional(),
        dueDate: z.string().optional(),
      })
    )
    .default([]),
});

export type GranolaWebhookPayload = z.infer<typeof GranolaWebhookSchema>;

export function parseGranolaWebhook(body: unknown): GranolaWebhookPayload {
  return GranolaWebhookSchema.parse(body);
}

export async function upsertMeetingFromGranola(
  userId: string,
  payload: GranolaWebhookPayload
) {
  const meeting = await prisma.meeting.upsert({
    where: { granolaId: payload.meetingId },
    create: {
      userId,
      granolaId: payload.meetingId,
      title: payload.title,
      startAt: new Date(payload.startTime),
      endAt: payload.endTime ? new Date(payload.endTime) : undefined,
      attendees: payload.attendees as any,
      rawNotes: payload.notes,
    },
    update: {
      title: payload.title,
      endAt: payload.endTime ? new Date(payload.endTime) : undefined,
      rawNotes: payload.notes,
    },
  });

  // Create tasks from extracted action items
  const tasks = await Promise.all(
    payload.actionItems.map((item) =>
      prisma.task.create({
        data: {
          userId,
          title: item.text,
          source: "granola",
          sourceRef: payload.meetingId,
          bucket: "inbox",
          priority: "medium",
          meetingId: meeting.id,
          dueAt: item.dueDate ? new Date(item.dueDate) : undefined,
        },
      })
    )
  );

  return { meeting, tasks };
}
