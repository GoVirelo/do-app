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

  if (!integration) return NextResponse.json({ connected: false, error: "No Slack integration found — go to /connections to connect" });

  const tokenPrefix = integration.accessToken?.slice(0, 15) ?? "empty";
  const grantedScopes = (integration.scope ?? "").split(",");

  try {
    const slack = new WebClient(integration.accessToken);
    const authInfo = await slack.auth.test();
    const mySlackId = authInfo.user_id ?? "";

    const neededScopes = ["im:history", "channels:history", "search:read", "chat:write"];
    const missingScopes = neededScopes.filter(s => !grantedScopes.includes(s));

    const threeDaysAgo = (Date.now() / 1000 - 3 * 24 * 60 * 60).toString();

    // Test DMs
    const dms = await slack.conversations.list({ types: "im,mpim", limit: 50 });
    const dmChannels = dms.channels ?? [];
    let dmMessages = 0;
    for (const ch of dmChannels.slice(0, 10)) {
      if (!ch.id) continue;
      try {
        const history = await slack.conversations.history({ channel: ch.id, oldest: threeDaysAgo, limit: 20 });
        const fromOthers = (history.messages ?? []).filter(m => m.user !== mySlackId && m.subtype !== "bot_message");
        dmMessages += fromOthers.length;
      } catch { /* skip */ }
    }

    // Test search (mentions)
    let mentionCount = 0;
    let searchError: string | null = null;
    try {
      const searchResult = await (slack as any).search.messages({
        query: `<@${mySlackId}>`,
        sort: "timestamp",
        sort_dir: "desc",
        count: 20,
      });
      mentionCount = searchResult?.messages?.total ?? 0;
    } catch (e: any) {
      searchError = e.message;
    }

    // Recent sync logs
    const logs = await prisma.syncLog.findMany({
      where: { userId: session.user.id, provider: "slack" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Existing Slack tasks in DB
    const taskCount = await prisma.task.count({
      where: { userId: session.user.id, source: "slack" },
    });

    return NextResponse.json({
      connected: true,
      tokenPrefix,
      workspace: authInfo.team,
      slackUser: authInfo.user,
      mySlackId,
      grantedScopes,
      missingScopes,
      needsReconnect: missingScopes.length > 0,
      dmChannels: dmChannels.length,
      dmMessagesLast3Days: dmMessages,
      mentionsLast3Days: mentionCount,
      searchError,
      slackTasksInDB: taskCount,
      recentSyncLogs: logs.map(l => ({ status: l.status, itemCount: l.itemCount, error: l.error, when: l.createdAt })),
    });
  } catch (err: any) {
    return NextResponse.json({ tokenPrefix, connected: true, authError: err.message });
  }
}
