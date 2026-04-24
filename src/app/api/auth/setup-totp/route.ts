import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, createTOTPUri, verifyTOTP } from "@/lib/totp";
import { NextResponse } from "next/server";

// GET — generate a new TOTP secret + QR code URI
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = generateSecret();
  const uri = createTOTPUri(session.user.email ?? session.user.id, "do.", secret);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  return NextResponse.json({ secret, uri });
}

// POST — verify code and enable TOTP
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) return NextResponse.json({ error: "No secret" }, { status: 400 });

  const valid = await verifyTOTP(code, user.totpSecret);
  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: true },
  });

  return NextResponse.json({ ok: true });
}
