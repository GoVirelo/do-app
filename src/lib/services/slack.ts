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

  const authInfo = await slack.auth.test();
  const mySlackId = authInfo.user_id ?? "";

  const threeDaysAgo = (Date.now() / 1000 - 3 * 24 * 60 * 60).toString();
  const messages: SlackMessage[] = [];

  // DMs only — skip conversations where the last message is from me (already replied)
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
      // Skip entire DM if the most recent message is from me
      if (!msgs.length || msgs[0].user === mySlackId) continue;

      for (const msg of msgs) {
        if (!msg.text || !msg.ts) continue;
        if (msg.subtype === "bot_message" || msg.user === mySlackId) continue;

        let username = msg.user ?? "unknown";
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
          threadTs: msg.ts,
          isMention: false,
        });
      }
    } catch {}
  }

  return messages;
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
