import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    user_scope: "im:history im:write chat:write",
    scope: "",
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
