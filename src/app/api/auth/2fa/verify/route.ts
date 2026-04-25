import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTOTP } from "@/lib/totp";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user?.totpSecret) return NextResponse.json({ error: "No secret set" }, { status: 400 });

  const valid = await verifyTOTP(code, user.totpSecret);
  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: false, totpSecret: null },
  });

  return NextResponse.json({ ok: true });
}
