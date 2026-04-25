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
  const isUserToken = integration.accessToken?.startsWith("xoxp-");
  const isBotToken = integration.accessToken?.startsWith("xoxb-");

  try {
    const slack = new WebClient(integration.accessToken);
    const auth = await slack.auth.test();
    const dms = await slack.conversations.list({ types: "im", limit: 5 });
    return NextResponse.json({
      connected: true,
      tokenPrefix,
      isUserToken,
      isBotToken,
      authedUser: auth.user,
      authedUserId: auth.user_id,
      dmCount: dms.channels?.length ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json({ connected: true, tokenPrefix, isUserToken, isBotToken, error: err.message });
  }
}
