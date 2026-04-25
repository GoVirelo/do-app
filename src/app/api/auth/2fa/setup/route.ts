import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, createTOTPUri } from "@/lib/totp";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const secret = generateSecret();
  const uri = createTOTPUri(user.email ?? "user", "do.", secret);
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });

  // Store secret temporarily (not yet enabled)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: secret, totpEnabled: false },
  });

  return NextResponse.json({ secret, qrDataUrl });
}
