import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchUnreadEmails } from "@/lib/services/outlook";
import { fetchMentions } from "@/lib/services/slack";
import { fetchRecentNotes, getNoteText, getNoteDate } from "@/lib/services/granola";
import { generateDraftReply, extractActionsFromNotes } from "@/lib/services/claude";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// POST /api/sync — pull latest from connected integrations
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const results: Record<string, { count: number; error?: string }> = {};

  // Sync Outlook emails
  const outlookIntegration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "outlook" } },
  });

  if (outlookIntegration) {
    try {
      const emails = await fetchUnreadEmails(userId);
      let created = 0;

      for (const email of emails) {
        const exists = await prisma.task.findFirst({
          where: { userId, sourceItemId: email.id },
        });
        if (exists) continue;

        const task = await prisma.task.create({
          data: {
            userId,
            title: email.subject,
            source: "outlook",
            sourceRef: email.webLink,
            sourceItemId: email.id,
            bucket: "inbox",
            priority: "medium",
          },
        });

        // Generate AI draft reply
        try {
          const draft = await generateDraftReply(
            email.subject,
            email.preview,
            "email",
            { email: session.user.email ?? undefined }
          );
          await prisma.aIDraft.create({
            data: { taskId: task.id, body: draft.body, channel: "email" },
          });
        } catch {
          // Draft generation is best-effort
        }

        created++;
      }

      await prisma.syncLog.create({
        data: { userId, provider: "outlook", status: "success", itemCount: created },
      });
      results.outlook = { count: created };
    } catch (err: any) {
      await prisma.syncLog.create({
        data: { userId, provider: "outlook", status: "error", error: err.message },
      });
      results.outlook = { count: 0, error: err.message };
    }
  }

  // Sync Slack mentions
  const slackIntegration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "slack" } },
  });

  if (slackIntegration) {
    try {
      const mentions = await fetchMentions(userId);
      let created = 0;

      for (const msg of mentions) {
        const exists = await prisma.task.findFirst({
          where: { userId, sourceItemId: msg.id },
        });
        if (exists) continue;

        const task = await prisma.task.create({
          data: {
            userId,
            title: msg.text.slice(0, 200),
            source: "slack",
            sourceRef: `https://slack.com/channels/${msg.channelId}/p${msg.ts.replace(".", "")}`,
            sourceItemId: msg.id,
            bucket: "inbox",
            priority: "medium",
          },
        });

        // Generate AI draft reply
        try {
          const draft = await generateDraftReply(
            msg.text,
            `Channel: #${msg.channelName}`,
            "slack",
            { email: session.user.email ?? undefined }
          );
          await prisma.aIDraft.create({
            data: {
              taskId: task.id,
              body: draft.body,
              channel: `#${msg.channelName}`,
            },
          });
        } catch {
          // Best-effort
        }

        created++;
      }

      await prisma.syncLog.create({
        data: { userId, provider: "slack", status: "success", itemCount: created },
      });
      results.slack = { count: created };
    } catch (err: any) {
      await prisma.syncLog.create({
        data: { userId, provider: "slack", status: "error", error: err.message },
      });
      results.slack = { count: 0, error: err.message };
    }
  }

  // Sync Granola meeting notes
  if (process.env.GRANOLA_API_KEY) {
    try {
      const notes = await fetchRecentNotes();
      console.log("Granola notes fetched:", notes.length, JSON.stringify(notes.slice(0,2)));
      let created = 0;

      for (const note of notes) {
        try {
          const exists = await prisma.meeting.findUnique({ where: { granolaId: note.id } });
          if (exists) continue;

          const allAttendees = [...(note.attendees ?? []), ...(note.owner ? [note.owner] : [])];
          const attendeeNames = allAttendees.map(a => a.name);
          const content = getNoteText(note);

          console.log(`Processing note ${note.id}: "${note.title}", content length: ${content.length}`);

          const meeting = await prisma.meeting.create({
            data: {
              user: { connect: { id: userId } },
              granolaId: note.id,
              title: note.title ?? "Untitled meeting",
              startAt: new Date(getNoteDate(note)),
              attendees: allAttendees as any,
              rawNotes: content,
            },
          });

          if (content) {
            const actions = await extractActionsFromNotes(content, note.title ?? "", attendeeNames);
            console.log(`Extracted ${actions.length} actions from "${note.title}"`);
            for (const action of actions) {
              await prisma.task.create({
                data: {
                  userId,
                  title: action.title,
                  source: "granola",
                  sourceRef: note.id,
                  bucket: "inbox",
                  priority: action.priority,
                  meetingId: meeting.id,
                  dueAt: action.dueDate ? new Date(action.dueDate) : undefined,
                },
              });
              created++;
            }
          }
        } catch (noteErr: any) {
          console.error(`Failed to process note ${note.id}:`, noteErr.message);
        }
      }

      results.granola = { count: created };
    } catch (err: any) {
      results.granola = { count: 0, error: err.message };
    }
  }

  return NextResponse.json({ ok: true, results });
}

// GET /api/sync — get last sync status per provider
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.syncLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(logs);
}
