import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    // User token scopes — DMs + channel mentions + search + replies
    user_scope: [
      "im:read",           // List DM channels
      "im:history",        // Read DM messages
      "mpim:read",         // List group DM channels
      "mpim:history",      // Read group DM messages
      "channels:read",     // List public channels
      "channels:history",  // Read public channel messages (for mentions)
      "groups:read",       // List private channels
      "groups:history",    // Read private channel messages
      "search:read",       // Search @mentions across workspace
      "users:read",        // Resolve display names
      "chat:write",        // Post replies
    ].join(" "),
    scope: "",             // Bot scope unused — we use user tokens
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
