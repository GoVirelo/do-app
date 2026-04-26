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
  isThread: boolean; // true = actual Slack thread, false = DM/channel message
  isMention: boolean;
}

// ── Actionability filter ──────────────────────────────────────────────────────
// Returns true if a message is likely to need a response/action.
// We skip one-word acks, pure emoji, and other non-actionable noise.

const ACK_PATTERNS = [
  /^(yes|no|ok|okay|yep|nope|yup|nah|sure|fine|great|perfect|awesome|cool|noted|got\s*it|makes\s*sense|sounds\s*good|will\s*do|done|thanks|thank\s*you|cheers|thx|ty|np|no\s*worries|no\s*problem|👍|✅|🙏|👌|💯|🔥)[\s!.]*$/i,
];

const PURE_EMOJI_RE = /^[\p{Emoji}\s]+$/u;

export function isActionable(text: string): boolean {
  const trimmed = text.trim();

  // Too short (< 3 words) and no question mark → not actionable
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3 && !trimmed.includes("?")) return false;

  // Common acknowledgments
  if (ACK_PATTERNS.some(p => p.test(trimmed))) return false;

  // Pure emoji
  if (PURE_EMOJI_RE.test(trimmed)) return false;

  return true;
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

  // ── 1. DMs ───────────────────────────────────────────────────────────────────
  try {
    const dms = await slack.conversations.list({ types: "im,mpim", limit: 200, exclude_archived: true });
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
          if (msg.user === mySlackId) continue;

          // Skip non-actionable noise
          if (!isActionable(msg.text)) {
            console.log(`[slack] skipping non-actionable DM: "${msg.text.slice(0, 40)}"`);
            continue;
          }

          const id = `${channel.id}-${msg.ts}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const username = await resolveUsername(slack, msg.user!);
          const isThread = !!(msg.thread_ts && msg.thread_ts !== msg.ts);

          messages.push({
            id,
            channelId: channel.id,
            channelName: "DM",
            text: msg.text,
            userId: msg.user ?? "",
            username,
            ts: msg.ts,
            // For real threads, store parent ts so replies loads correctly.
            // For plain DMs, store the message ts so history context works.
            threadTs: isThread ? msg.thread_ts! : msg.ts,
            isThread,
            isMention: false,
          });
        }
      } catch { /* skip this DM on error */ }
    }
  } catch { /* DM list failed */ }

  // ── 2. Channel @mentions via search ─────────────────────────────────────────
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
      if (parseFloat(match.ts) * 1000 < Date.now() - 7 * 24 * 60 * 60 * 1000) continue;
      if (match.user === mySlackId || match.username === authInfo.user) continue;
      if (!isActionable(match.text ?? "")) continue;

      const id = `${match.channel.id}-${match.ts}`;
      if (seen.has(id)) continue;
      seen.add(id);

      const username = match.username || (match.user ? await resolveUsername(slack, match.user) : "unknown");
      const isThread = !!(match.thread_ts && match.thread_ts !== match.ts);

      messages.push({
        id,
        channelId: match.channel.id,
        channelName: match.channel.name ?? "channel",
        text: match.text ?? "",
        userId: match.user ?? "",
        username,
        ts: match.ts,
        threadTs: isThread ? match.thread_ts : match.ts,
        isThread,
        isMention: true,
      });
    }
  } catch (e: any) {
    console.warn("[slack] search.messages failed (may need search:read scope):", e.message);
  }

  console.log(`[slack] ${messages.length} actionable messages (${messages.filter(m => !m.isMention).length} DMs, ${messages.filter(m => m.isMention).length} mentions)`);
  return messages;
}

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
