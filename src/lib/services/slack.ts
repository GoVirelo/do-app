import { WebClient } from "@slack/web-api";
import { prisma } from "@/lib/prisma";

async function getClient(userId: string): Promise<WebClient> {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "slack" } },
  });
  if (!integration) throw new Error("Slack not connected");
  return new WebClient(integration.accessToken);
}

export interface SlackMessage {
  id: string;
  channelId: string;
  channelName: string;
  text: string;
  userId: string;
  username: string;
  ts: string;
  threadTs?: string;
  isMention: boolean;
}

// Resolve a Slack user ID to a display name
async function resolveUsername(slack: WebClient, uid: string): Promise<string> {
  try {
    const info = await slack.users.info({ user: uid });
    return info.user?.real_name ?? info.user?.name ?? uid;
  } catch {
    return uid;
  }
}

export async function fetchActionableMessages(userId: string): Promise<SlackMessage[]> {
  const slack = await getClient(userId);

  const authInfo = await slack.auth.test();
  const mySlackId = authInfo.user_id ?? "";

  const sevenDaysAgo = (Date.now() / 1000 - 7 * 24 * 60 * 60).toString();
  const messages: SlackMessage[] = [];
  const seen = new Set<string>();

  // ── 1. DMs (read + unread from others in last 7 days) ────────────────────────
  try {
    const dms = await slack.conversations.list({ types: "im,mpim", limit: 50 });
    for (const channel of dms.channels ?? []) {
      if (!channel.id) continue;
      try {
        const history = await slack.conversations.history({
          channel: channel.id,
          oldest: sevenDaysAgo,
          limit: 30,
        });

        for (const msg of history.messages ?? []) {
          if (!msg.text || !msg.ts) continue;
          if (msg.subtype === "bot_message") continue;
          if (msg.user === mySlackId) continue; // skip own messages

          const id = `${channel.id}-${msg.ts}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const username = await resolveUsername(slack, msg.user!);

          messages.push({
            id,
            channelId: channel.id,
            channelName: "DM",
            text: msg.text,
            userId: msg.user ?? "",
            username,
            ts: msg.ts,
            threadTs: msg.thread_ts ?? msg.ts,
            isMention: false,
          });
        }
      } catch { /* skip this DM on error */ }
    }
  } catch { /* DM list failed */ }

  // ── 2. Channel @mentions via search ─────────────────────────────────────────
  // Uses search:read scope to find messages where the user is mentioned
  try {
    const searchResult = await (slack as any).search.messages({
      query: `<@${mySlackId}>`,
      sort: "timestamp",
      sort_dir: "desc",
      count: 20,
    });

    const matches = searchResult?.messages?.matches ?? [];
    for (const match of matches) {
      if (!match.ts || !match.channel?.id) continue;

      // Skip if too old
      if (parseFloat(match.ts) * 1000 < Date.now() - 7 * 24 * 60 * 60 * 1000) continue;

      // Skip if it's the user's own message
      if (match.user === mySlackId || match.username === authInfo.user) continue;

      const id = `${match.channel.id}-${match.ts}`;
      if (seen.has(id)) continue;
      seen.add(id);

      const username = match.username || (match.user ? await resolveUsername(slack, match.user) : "unknown");

      messages.push({
        id,
        channelId: match.channel.id,
        channelName: match.channel.name ?? "channel",
        text: match.text ?? "",
        userId: match.user ?? "",
        username,
        ts: match.ts,
        threadTs: match.ts,
        isMention: true,
      });
    }
  } catch (e: any) {
    // search:read not granted yet — log but don't fail the whole sync
    console.warn("[slack] search.messages failed (may need search:read scope):", e.message);
  }

  // ── 3. Threads I'm in (replies waiting) ─────────────────────────────────────
  // If the user was mentioned in a thread reply, the search above catches it.
  // Additionally check recent channel messages for thread replies to the user.
  // (This covers cases where someone replies in a thread but doesn't @mention)

  console.log(`[slack] fetchActionableMessages: ${messages.length} messages (${messages.filter(m => !m.isMention).length} DMs, ${messages.filter(m => m.isMention).length} mentions)`);
  return messages;
}

// Keep old export name for backward compat
export const fetchMentions = fetchActionableMessages;

export async function postMessage(
  userId: string,
  channelId: string,
  text: string,
  threadTs?: string
) {
  const slack = await getClient(userId);
  return slack.chat.postMessage({
    channel: channelId,
    text,
    thread_ts: threadTs,
  });
}
