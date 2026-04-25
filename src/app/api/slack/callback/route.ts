import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`);

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=slack_denied`);
  }

  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
    }),
  });

  const data = await res.json();
  if (!data.ok) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=slack_token`);
  }

  const userToken = data.authed_user?.access_token;
  if (!userToken) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?error=slack_no_user_token`);
  }

  await prisma.integration.upsert({
    where: { userId_provider: { userId: session.user.id, provider: "slack" } },
    create: { userId: session.user.id, provider: "slack", accessToken: userToken, scope: data.authed_user?.scope },
    update: { accessToken: userToken, scope: data.authed_user?.scope },
  });

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connections?connected=slack`);
}
