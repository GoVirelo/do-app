import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WebClient } from "@slack/web-api";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: "slack" } },
  });

  if (!integration) return NextResponse.json({ connected: false, error: "No Slack integration found" });

  const tokenPrefix = integration.accessToken?.slice(0, 15) ?? "empty";
  const grantedScopes = (integration.scope ?? "").split(",").map(s => s.trim()).filter(Boolean);
  const neededScopes = ["im:read", "im:history", "channels:history", "search:read", "chat:write"];
  const missingScopes = neededScopes.filter(s => !grantedScopes.includes(s));

  const result: Record<string, any> = {
    connected: true,
    tokenPrefix,
    grantedScopes,
    missingScopes,
    needsReconnect: missingScopes.length > 0,
  };

  const slack = new WebClient(integration.accessToken);

  // Step 1: auth.test
  try {
    const authInfo = await slack.auth.test();
    result.workspace = authInfo.team;
    result.slackUser = authInfo.user;
    result.mySlackId = authInfo.user_id;
  } catch (e: any) {
    result.authTestError = e.message;
    return NextResponse.json(result);
  }

  const mySlackId = result.mySlackId ?? "";
  const sevenDaysAgo = (Date.now() / 1000 - 7 * 24 * 60 * 60).toString();

  // Step 2: DMs — check ALL channels (not just 10)
  const sampleDMs: any[] = [];
  try {
    const dms = await slack.conversations.list({ types: "im,mpim", limit: 200, exclude_archived: true });
    const channels = dms.channels ?? [];
    result.dmChannels = channels.length;

    let dmMessages = 0;
    for (const ch of channels) {
      if (!ch.id) continue;
      try {
        const history = await slack.conversations.history({ channel: ch.id, oldest: sevenDaysAgo, limit: 20 });
        const msgs = history.messages ?? [];
        const fromOthers = msgs.filter(m => m.user !== mySlackId && m.subtype !== "bot_message" && m.text);

        if (fromOthers.length > 0) {
          dmMessages += fromOthers.length;
          // Collect sample
          if (sampleDMs.length < 5) {
            sampleDMs.push({
              channelId: ch.id,
              otherUser: fromOthers[0].user,
              preview: fromOthers[0].text?.slice(0, 60),
              ts: fromOthers[0].ts,
            });
          }
        }
      } catch (e: any) {
        if (sampleDMs.length < 2) sampleDMs.push({ channelId: ch.id, error: e.message });
      }
    }
    result.dmMessagesLast7Days = dmMessages;
    result.sampleDMs = sampleDMs;
  } catch (e: any) {
    result.dmError = e.message;
    result.dmChannels = 0;
    result.dmMessagesLast7Days = 0;
  }

  // Step 3: Search for @mentions
  try {
    const searchResult = await (slack as any).search.messages({
      query: `<@${mySlackId}>`,
      sort: "timestamp",
      sort_dir: "desc",
      count: 20,
    });
    const matches = searchResult?.messages?.matches ?? [];
    // Filter to last 7 days
    const recentMatches = matches.filter(
      (m: any) => parseFloat(m.ts) * 1000 > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    result.mentionsLast7Days = recentMatches.length;
    result.mentionSamples = recentMatches.slice(0, 3).map((m: any) => ({
      channel: m.channel?.name,
      from: m.username,
      preview: m.text?.slice(0, 60),
    }));
  } catch (e: any) {
    result.searchError = e.message;
    result.mentionsLast7Days = 0;
  }

  // Step 4: DB count + sync logs
  result.slackTasksInDB = await prisma.task.count({ where: { userId: session.user.id, source: "slack" } });
  const logs = await prisma.syncLog.findMany({
    where: { userId: session.user.id, provider: "slack" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  result.recentSyncLogs = logs.map(l => ({ status: l.status, itemCount: l.itemCount, error: l.error, when: l.createdAt }));

  return NextResponse.json(result);
}
