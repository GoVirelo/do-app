import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchUnreadEmails } from "@/lib/services/outlook";
import { fetchMentions } from "@/lib/services/slack";
import { fetchRecentNotes, getNoteText, getNoteDate } from "@/lib/services/granola";
import { generateDraftReply, extractActionsFromNotes } from "@/lib/services/claude";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// POST /api/sync — pull latest from connected integrations
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const results: Record<string, { count: number; meetings?: number; skipped?: number; error?: string }> = {};

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

        // Store channelId + threadTs + isThread as JSON so context endpoint knows how to load history
        const slackMeta = JSON.stringify({ channelId: msg.channelId, threadTs: msg.threadTs ?? msg.ts, ts: msg.ts, isThread: msg.isThread ?? false });
        const channelDisplay = msg.isMention ? msg.channelName : "DM";
        // Relative time string (e.g. "2h ago")
        const tsMs = parseFloat(msg.ts) * 1000;
        const diffMin = Math.round((Date.now() - tsMs) / 60000);
        const relTime = diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago` : `${Math.floor(diffMin / 1440)}d ago`;
        const metaLine = `${channelDisplay} · ${relTime}`;
        // Short subject from first meaningful line of message
        const subject = msg.text.split("\n")[0].slice(0, 60);
        const taskTitle = `Reply to ${msg.username} — ${subject}`;

        const task = await prisma.task.create({
          data: {
            userId,
            title: taskTitle,
            meta: metaLine,
            source: "slack",
            sourceRef: slackMeta,
            sourceItemId: msg.id,
            bucket: "inbox",
            priority: "medium",
          },
        });

        // Generate AI draft reply
        try {
          const draft = await generateDraftReply(
            msg.text,
            `From ${msg.username} in ${channelDisplay}`,
            "slack",
            { email: session.user.email ?? undefined }
          );
          await prisma.aIDraft.create({
            data: {
              taskId: task.id,
              body: draft.body,
              channel: msg.channelName,
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
      const { searchParams: sp } = new URL(req.url ?? "http://localhost", "http://localhost");
      const forceExtract = sp.get("force") === "1";

      const notes = await fetchRecentNotes();
      console.log(`[granola] fetched ${notes.length} notes, force=${forceExtract}, ANTHROPIC_KEY=${!!process.env.ANTHROPIC_API_KEY}`);
      let created = 0;
      let skipped = 0;
      let meetingsNew = 0;

      for (const note of notes) {
        try {
          const existing = await prisma.meeting.findUnique({
            where: { granolaId: note.id },
            include: { tasks: true },
          });

          // Skip if meeting exists and we're not force-re-extracting
          if (existing && !forceExtract) {
            skipped++;
            continue;
          }

          const allAttendees = [...(note.attendees ?? []), ...(note.owner ? [note.owner] : [])];
          const attendeeNames = allAttendees.map(a => a.name);
          const content = getNoteText(note);

          let meeting = existing;

          if (!existing) {
            console.log(`[granola] new note "${note.title}" content_len=${content.length}`);
            meeting = await prisma.meeting.create({
              data: {
                user: { connect: { id: userId } },
                granolaId: note.id,
                title: note.title ?? "Untitled meeting",
                startAt: new Date(getNoteDate(note)),
                attendees: allAttendees as any,
                rawNotes: content,
              },
              include: { tasks: true },
            });
            meetingsNew++;
          } else {
            console.log(`[granola] force re-extracting "${note.title}" — deleting ${existing.tasks.length} old tasks`);
            if (existing.tasks.length > 0) {
              await prisma.task.deleteMany({ where: { meetingId: existing.id } });
            }
          }

          let actions: Awaited<ReturnType<typeof extractActionsFromNotes>> = [];
          let claudeError: string | undefined;

          if (content && process.env.ANTHROPIC_API_KEY) {
            try {
              actions = await extractActionsFromNotes(content, note.title ?? "", attendeeNames, note.owner?.name);
              console.log(`[granola] extracted ${actions.length} actions from "${note.title}"`);
            } catch (claudeErr: any) {
              claudeError = claudeErr.message;
              console.error(`[granola] Claude extraction failed for "${note.title}":`, claudeErr.message);
            }
          } else if (!process.env.ANTHROPIC_API_KEY) {
            claudeError = "ANTHROPIC_API_KEY not set";
            console.warn("[granola] ANTHROPIC_API_KEY not set — skipping extraction");
          }

          const meetingDate = new Date(getNoteDate(note)).toLocaleDateString("en-AU", { day: "2-digit", month: "short" });
          const meetingMeta = `${note.title ?? "Meeting"} · ${meetingDate}`;

          if (actions.length > 0) {
            for (const action of actions) {
              await prisma.task.create({
                data: {
                  userId,
                  title: action.title,
                  meta: meetingMeta,
                  source: "granola",
                  sourceRef: note.id,
                  bucket: "inbox",
                  priority: action.priority,
                  meetingId: meeting!.id,
                  dueAt: action.dueDate ? new Date(action.dueDate) : undefined,
                },
              });
              created++;
            }
          } else if (!existing) {
            // Fallback only for brand-new meetings
            await prisma.task.create({
              data: {
                userId,
                title: `Review notes: ${note.title ?? "Meeting"}`,
                meta: meetingMeta,
                source: "granola",
                sourceRef: note.id,
                bucket: "inbox",
                priority: "medium",
                meetingId: meeting!.id,
              },
            });
            created++;
            console.log(`[granola] created fallback task for "${note.title}"`);
          }
        } catch (noteErr: any) {
          console.error(`[granola] failed to process note ${note.id}:`, noteErr.message);
        }
      }

      console.log(`[granola] done: ${notes.length} found, ${skipped} skipped, ${meetingsNew} new meetings, ${created} tasks created`);
      results.granola = { count: created, meetings: meetingsNew, skipped } as any;
    } catch (err: any) {
      console.error("[granola] sync error:", err.message);
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
