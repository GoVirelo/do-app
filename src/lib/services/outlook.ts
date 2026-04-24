import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { prisma } from "@/lib/prisma";

function getClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

async function getToken(userId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "outlook" } },
  });
  if (!integration) throw new Error("Outlook not connected");

  // Token refresh when within 5 minutes of expiry
  if (integration.expiresAt && integration.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    if (!integration.refreshToken) throw new Error("No refresh token");

    const res = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? "common"}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: integration.refreshToken,
          scope: "Mail.Read Calendars.Read Tasks.ReadWrite offline_access",
        }),
      }
    );
    const data = await res.json();
    await prisma.integration.update({
      where: { userId_provider: { userId, provider: "outlook" } },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? integration.refreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });
    return data.access_token as string;
  }

  return integration.accessToken;
}

export interface OutlookEmail {
  id: string;
  subject: string;
  from: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
  webLink: string;
}

export interface OutlookEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
  bodyPreview: string;
  webLink: string;
}

export async function fetchUnreadEmails(userId: string): Promise<OutlookEmail[]> {
  const token = await getToken(userId);
  const client = getClient(token);

  const res = await client
    .api("/me/messages")
    .filter("isRead eq false")
    .select("id,subject,from,bodyPreview,receivedDateTime,webLink")
    .top(50)
    .orderby("receivedDateTime desc")
    .get();

  return (res.value ?? []).map((m: any) => ({
    id: m.id,
    subject: m.subject ?? "(no subject)",
    from: m.from?.emailAddress?.address ?? "",
    preview: m.bodyPreview ?? "",
    receivedAt: m.receivedDateTime,
    isRead: false,
    webLink: m.webLink,
  }));
}

export async function fetchTodayEvents(userId: string): Promise<OutlookEvent[]> {
  const token = await getToken(userId);
  const client = getClient(token);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const res = await client
    .api("/me/calendarView")
    .query({
      startDateTime: startOfDay.toISOString(),
      endDateTime: endOfDay.toISOString(),
    })
    .select("id,subject,start,end,attendees,bodyPreview,webLink")
    .orderby("start/dateTime")
    .get();

  return (res.value ?? []).map((e: any) => ({
    id: e.id,
    title: e.subject ?? "Untitled event",
    start: e.start?.dateTime,
    end: e.end?.dateTime,
    attendees: (e.attendees ?? []).map((a: any) => a.emailAddress?.address).filter(Boolean),
    bodyPreview: e.bodyPreview ?? "",
    webLink: e.webLink,
  }));
}

export async function markEmailRead(userId: string, messageId: string) {
  const token = await getToken(userId);
  const client = getClient(token);
  await client.api(`/me/messages/${messageId}`).patch({ isRead: true });
}

export async function replyToEmail(userId: string, messageId: string, body: string) {
  const token = await getToken(userId);
  const client = getClient(token);
  await client.api(`/me/messages/${messageId}/reply`).post({
    message: {},
    comment: body,
  });
}
