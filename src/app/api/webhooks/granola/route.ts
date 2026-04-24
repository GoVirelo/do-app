import { prisma } from "@/lib/prisma";
import { parseGranolaWebhook, upsertMeetingFromGranola } from "@/lib/services/granola";
import { NextResponse } from "next/server";
import { createHmac } from "crypto";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.GRANOLA_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if no secret configured
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${expected}` === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-granola-signature") ?? "";

  if (!verifySignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let payload;
  try {
    payload = parseGranolaWebhook(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  // Find user by email in the webhook metadata (Granola sends user email)
  const webhookBody = body as any;
  const userEmail = webhookBody.userEmail as string | undefined;
  if (!userEmail) {
    return NextResponse.json({ error: "Missing userEmail" }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    // Not a registered user — ignore silently
    return NextResponse.json({ ok: true });
  }

  const { meeting, tasks } = await upsertMeetingFromGranola(user.id, payload);

  return NextResponse.json({ ok: true, meetingId: meeting.id, tasksCreated: tasks.length });
}
