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

  // Get the bot/user ID to filter mentions
  const identity = await slack.auth.test();
  const meId = identity.user_id;

  const conversations = await slack.conversations.list({
    types: "public_channel,private_channel,im",
    limit: 20,
  });

  const mentions: SlackMessage[] = [];

  for (const channel of conversations.channels ?? []) {
    if (!channel.id) continue;
    try {
      const history = await slack.conversations.history({
        channel: channel.id,
        limit: 20,
      });

      for (const msg of history.messages ?? []) {
        if (!msg.text || !msg.ts) continue;
        const isMention = msg.text.includes(`<@${meId}>`);
        if (isMention || channel.is_im) {
          mentions.push({
            id: `${channel.id}-${msg.ts}`,
            channelId: channel.id,
            channelName: (channel.name ?? channel.id) as string,
            text: msg.text,
            userId: msg.user ?? "",
            username: msg.username ?? msg.user ?? "unknown",
            ts: msg.ts,
            threadTs: msg.thread_ts,
            isMention,
          });
        }
      }
    } catch {
      // Skip channels we can't read
    }
  }

  return mentions.slice(0, 50);
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
