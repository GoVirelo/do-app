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

export async function fetchMentions(userId: string): Promise<SlackMessage[]> {
  const slack = await getClient(userId);

  const threeDaysAgo = (Date.now() / 1000 - 3 * 24 * 60 * 60).toString();

  // Only fetch DMs (im = direct messages)
  const conversations = await slack.conversations.list({
    types: "im",
    limit: 50,
  });

  const messages: SlackMessage[] = [];

  for (const channel of conversations.channels ?? []) {
    if (!channel.id) continue;
    try {
      const history = await slack.conversations.history({
        channel: channel.id,
        oldest: threeDaysAgo,
        limit: 50,
      });

      for (const msg of history.messages ?? []) {
        if (!msg.text || !msg.ts) continue;
        // Skip messages sent by the user themselves
        if (msg.subtype === "bot_message") continue;
        messages.push({
          id: `${channel.id}-${msg.ts}`,
          channelId: channel.id,
          channelName: channel.name ?? channel.id ?? "DM",
          text: msg.text,
          userId: msg.user ?? "",
          username: msg.username ?? msg.user ?? "unknown",
          ts: msg.ts,
          threadTs: msg.thread_ts,
          isMention: true,
        });
      }
    } catch {
      // Skip DMs we can't read
    }
  }

  return messages.slice(0, 100);
}

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

export async function resolveUsername(userId: string, slackUserId: string): Promise<string> {
  const slack = await getClient(userId);
  const info = await slack.users.info({ user: slackUserId });
  return info.user?.real_name ?? info.user?.name ?? slackUserId;
}
