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

export async function fetchActionableMessages(userId: string): Promise<SlackMessage[]> {
  const slack = await getClient(userId);

  // Get the authed user's Slack user ID so we can skip their own messages
  const authInfo = await slack.auth.test();
  const mySlackId = authInfo.user_id ?? "";

  const threeDaysAgo = (Date.now() / 1000 - 3 * 24 * 60 * 60).toString();
  const messages: SlackMessage[] = [];

  // 1. DMs — conversations where someone sent you a message you haven't replied to
  try {
    const dms = await slack.conversations.list({ types: "im", limit: 50 });
    for (const channel of dms.channels ?? []) {
      if (!channel.id) continue;
      try {
        const history = await slack.conversations.history({
          channel: channel.id,
          oldest: threeDaysAgo,
          limit: 30,
        });
        const msgs = history.messages ?? [];
        // Only include if the last message in thread is NOT from me (needs reply)
        for (const msg of msgs) {
          if (!msg.text || !msg.ts) continue;
          if (msg.subtype === "bot_message" || msg.user === mySlackId) continue;

          // Resolve real name for display
          let username = msg.username ?? msg.user ?? "unknown";
          try {
            const info = await slack.users.info({ user: msg.user! });
            username = info.user?.real_name ?? info.user?.name ?? username;
          } catch {}

          messages.push({
            id: `${channel.id}-${msg.ts}`,
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
      } catch {}
    }
  } catch {}

  // 2. @mentions in channels using search
  try {
    const search = await slack.search.messages({
      query: `<@${mySlackId}>`,
      count: 50,
    });
    for (const match of (search.messages as any)?.matches ?? []) {
      if (!match.text || !match.ts || !match.channel?.id) continue;
      if (match.username === mySlackId || match.user === mySlackId) continue;

      let username = match.username ?? match.user ?? "unknown";
      try {
        const info = await slack.users.info({ user: match.user });
        username = info.user?.real_name ?? info.user?.name ?? username;
      } catch {}

      const channelId = match.channel.id as string;
      const channelName = (match.channel.name as string) ?? channelId;
      const ts = match.ts as string;
      messages.push({
        id: `${channelId}-${ts}`,
        channelId,
        channelName: `#${channelName}`,
        text: match.text,
        userId: match.user ?? "",
        username,
        ts,
        threadTs: match.thread_ts ?? ts,
        isMention: true,
      });
    }
  } catch {}

  // Deduplicate by id
  const seen = new Set<string>();
  return messages.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

// Keep old export name as alias for backward compat
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
