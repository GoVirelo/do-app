import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // If no TOTP, sign in immediately via NextAuth credentials
  if (!user.totpEnabled) {
    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch {
      // signIn throws a redirect error on success in some Next.js versions — that's OK
    }
  }

  return NextResponse.json({ requiresTOTP: user.totpEnabled });
}
