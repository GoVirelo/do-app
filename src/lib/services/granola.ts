import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GRANOLA_BASE = "https://public-api.granola.ai/v1";

export interface GranolaNote {
  id: string;
  title: string;
  created_at?: string;
  createdAt?: string;
  summary?: string;
  summary_text?: string;
  summary_markdown?: string;
  transcript?: { speaker?: string; text: string }[] | string;
  owner?: { name: string; email: string };
  attendees?: { name: string; email: string }[];
}

export function getNoteText(note: GranolaNote): string {
  if (note.summary_text) return note.summary_text;
  if (note.summary_markdown) return note.summary_markdown;
  if (note.summary) return note.summary;
  if (!note.transcript) return "";
  if (typeof note.transcript === "string") return note.transcript;
  return note.transcript.map(t => `${t.speaker ? t.speaker + ": " : ""}${t.text}`).join("\n");
}

export function getNoteDate(note: GranolaNote): string {
  return note.created_at ?? note.createdAt ?? new Date().toISOString();
}

export async function fetchRecentNotes(since?: Date): Promise<GranolaNote[]> {
  const apiKey = process.env.GRANOLA_API_KEY;
  if (!apiKey) throw new Error("GRANOLA_API_KEY not set");

  const url = new URL(`${GRANOLA_BASE}/notes`);
  if (since) url.searchParams.set("created_after", since.toISOString());

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Granola API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const notes = (data.notes ?? data) as GranolaNote[];

  // Fetch full note details to get summary/transcript
  const full = await Promise.all(
    notes.map(async (note) => {
      try {
        const r = await fetch(`${GRANOLA_BASE}/notes/${note.id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!r.ok) return note;
        return await r.json() as GranolaNote;
      } catch {
        return note;
      }
    })
  );

  return full;
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
