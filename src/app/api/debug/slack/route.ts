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

  const tokenPrefix = integration.accessToken?.slice(0, 10) ?? "empty";

  try {
    const slack = new WebClient(integration.accessToken);
    const authInfo = await slack.auth.test();
    const mySlackId = authInfo.user_id ?? "";

    const threeDaysAgo = (Date.now() / 1000 - 3 * 24 * 60 * 60).toString();
    const dms = await slack.conversations.list({ types: "im", limit: 50 });
    const channels = dms.channels ?? [];

    const dmResults = [];
    for (const ch of channels.slice(0, 5)) {
      if (!ch.id) continue;
      try {
        const history = await slack.conversations.history({ channel: ch.id, oldest: threeDaysAgo, limit: 10 });
        const msgs = history.messages ?? [];
        dmResults.push({
          channelId: ch.id,
          messageCount: msgs.length,
          lastMessageFromMe: msgs[0]?.user === mySlackId,
          sample: msgs[0]?.text?.slice(0, 80),
        });
      } catch (e: any) {
        dmResults.push({ channelId: ch.id, error: e.message });
      }
    }

    return NextResponse.json({
      tokenPrefix,
      mySlackId,
      dmChannelCount: channels.length,
      dmResults,
    });
  } catch (err: any) {
    return NextResponse.json({ tokenPrefix, error: err.message });
  }
}
