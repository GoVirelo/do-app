import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const integrations = await prisma.integration.findMany({
    where: { userId: session.user.id },
    select: { provider: true, updatedAt: true, metadata: true },
  });

  return NextResponse.json(integrations);
}
