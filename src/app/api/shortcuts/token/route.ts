import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { shortcutToken: true },
  });

  return NextResponse.json({ token: user?.shortcutToken ?? null });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { shortcutToken: token },
  });

  return NextResponse.json({ token });
}
