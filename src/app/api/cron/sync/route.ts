import { prisma } from "@/lib/prisma";
import { fetchUnreadEmails } from "@/lib/services/outlook";
import { fetchMentions } from "@/lib/services/slack";
import { fetchRecentNotes, getNoteText, getNoteDate } from "@/lib/services/granola";
import { generateDraftReply, extractActionsFromNotes } from "@/lib/services/claude";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      integrations: { some: { provider: { in: ["outlook", "slack"] } } },
    },
    select: { id: true, email: true },
  });

  const results: Record<string, unknown> = {};

  for (const user of users) {
    const userResults: Record<string, { count: number; error?: string }> = {};

    // Outlook
    const outlookIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "outlook" } },
    });

    if (outlookIntegration) {
      try {
        const emails = await fetchUnreadEmails(user.id);
        let created = 0;

        for (const email of emails) {
          const exists = await prisma.task.findFirst({
            where: { userId: user.id, sourceItemId: email.id },
          });
          if (exists) continue;

          const task = await prisma.task.create({
            data: {
              userId: user.id,
              title: email.subject,
              source: "outlook",
              sourceRef: email.webLink,
              sourceItemId: email.id,
              bucket: "inbox",
              priority: "medium",
            },
          });

          try {
            const draft = await generateDraftReply(
              email.subject,
              email.preview,
              "email",
              { email: user.email ?? undefined }
            );
            await prisma.aIDraft.create({
              data: { taskId: task.id, body: draft.body, channel: "email" },
            });
          } catch {}

          created++;
        }

        await prisma.syncLog.create({
          data: { userId: user.id, provider: "outlook", status: "success", itemCount: created },
        });
        userResults.outlook = { count: created };
      } catch (err: any) {
        await prisma.syncLog.create({
          data: { userId: user.id, provider: "outlook", status: "error", error: err.message },
        });
        userResults.outlook = { count: 0, error: err.message };
      }
    }

    // Slack
    const slackIntegration = await prisma.integration.findUnique({
      where: { userId_provider: { userId: user.id, provider: "slack" } },
    });

    if (slackIntegration) {
      try {
        const mentions = await fetchMentions(user.id);
        let created = 0;

        for (const msg of mentions) {
          const exists = await prisma.task.findFirst({
            where: { userId: user.id, sourceItemId: msg.id },
          });
          if (exists) continue;

          const task = await prisma.task.create({
            data: {
              userId: user.id,
              title: msg.text.slice(0, 200),
              source: "slack",
              sourceRef: `https://slack.com/channels/${msg.channelId}/p${msg.ts.replace(".", "")}`,
              sourceItemId: msg.id,
              bucket: "inbox",
              priority: "medium",
            },
          });

          try {
            const draft = await generateDraftReply(
              msg.text,
              `Channel: #${msg.channelName}`,
              "slack",
              { email: user.email ?? undefined }
            );
            await prisma.aIDraft.create({
              data: { taskId: task.id, body: draft.body, channel: `#${msg.channelName}` },
            });
          } catch {}

          created++;
        }

        await prisma.syncLog.create({
          data: { userId: user.id, provider: "slack", status: "success", itemCount: created },
        });
        userResults.slack = { count: created };
      } catch (err: any) {
        await prisma.syncLog.create({
          data: { userId: user.id, provider: "slack", status: "error", error: err.message },
        });
        userResults.slack = { count: 0, error: err.message };
      }
    }

    // Granola (shared API key, not per-user OAuth)
    if (process.env.GRANOLA_API_KEY) {
      try {
        const since = new Date(Date.now() - 31 * 60 * 1000); // last 31 min
        const notes = await fetchRecentNotes(since);
        let created = 0;

        for (const note of notes) {
          const exists = await prisma.meeting.findUnique({ where: { granolaId: note.id } });
          if (exists) continue;

          const allAttendees = [...(note.attendees ?? []), ...(note.owner ? [note.owner] : [])];
          const attendeeNames = allAttendees.map(a => a.name);
          const content = getNoteText(note);
          const actions = content ? await extractActionsFromNotes(content, note.title, attendeeNames) : [];

          const meeting = await prisma.meeting.create({
            data: {
              user: { connect: { id: user.id } },
              granolaId: note.id,
              title: note.title ?? "Untitled meeting",
              startAt: new Date(getNoteDate(note)),
              attendees: allAttendees as any,
              rawNotes: content,
            },
          });

          for (const action of actions) {
            await prisma.task.create({
              data: {
                userId: user.id,
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

        userResults.granola = { count: created };
      } catch (err: any) {
        userResults.granola = { count: 0, error: err.message };
      }
    }

    results[user.id] = userResults;
  }

  return NextResponse.json({ ok: true, results });
}
