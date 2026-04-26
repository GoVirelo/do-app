import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    // User token scopes — DMs + channel mentions + search + replies
    user_scope: [
      "im:history",        // DM messages
      "mpim:history",      // Group DM messages
      "channels:history",  // Public channel messages (for mentions)
      "groups:history",    // Private channel messages
      "channels:read",     // List channels
      "groups:read",       // List private channels
      "search:read",       // Search for @mentions across workspace
      "users:read",        // Resolve display names
      "chat:write",        // Post replies
    ].join(" "),
    scope: "",             // Bot scope unused — we use user tokens
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
