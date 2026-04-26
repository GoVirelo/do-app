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
    // Can't do much else without knowing the user ID
    return NextResponse.json(result);
  }

  const mySlackId = result.mySlackId ?? "";
  const sevenDaysAgo = (Date.now() / 1000 - 7 * 24 * 60 * 60).toString();

  // Step 2: list DM channels (needs im:read)
  try {
    const dms = await slack.conversations.list({ types: "im,mpim", limit: 50 });
    result.dmChannels = dms.channels?.length ?? 0;

    let dmMessages = 0;
    for (const ch of (dms.channels ?? []).slice(0, 10)) {
      if (!ch.id) continue;
      try {
        const history = await slack.conversations.history({ channel: ch.id, oldest: sevenDaysAgo, limit: 30 });
        const fromOthers = (history.messages ?? []).filter(m => m.user !== mySlackId && m.subtype !== "bot_message");
        dmMessages += fromOthers.length;
      } catch { /* skip */ }
    }
    result.dmMessagesLast7Days = dmMessages;
  } catch (e: any) {
    result.dmError = `conversations.list failed: ${e.message}`;
    result.dmChannels = 0;
    result.dmMessagesLast7Days = 0;
  }

  // Step 3: search for @mentions (needs search:read)
  try {
    const searchResult = await (slack as any).search.messages({
      query: `<@${mySlackId}>`,
      sort: "timestamp",
      sort_dir: "desc",
      count: 20,
    });
    result.mentionsLast7Days = searchResult?.messages?.total ?? 0;
  } catch (e: any) {
    result.searchError = `search failed: ${e.message}`;
    result.mentionsLast7Days = 0;
  }

  // Step 4: tasks in DB
  result.slackTasksInDB = await prisma.task.count({
    where: { userId: session.user.id, source: "slack" },
  });

  // Step 5: recent sync logs
  const logs = await prisma.syncLog.findMany({
    where: { userId: session.user.id, provider: "slack" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  result.recentSyncLogs = logs.map(l => ({
    status: l.status,
    itemCount: l.itemCount,
    error: l.error,
    when: l.createdAt,
  }));

  return NextResponse.json(result);
}
