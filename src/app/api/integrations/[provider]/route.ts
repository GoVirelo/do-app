import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider } = await params;

  await prisma.integration.deleteMany({
    where: { userId: session.user.id, provider },
  });

  return new NextResponse(null, { status: 204 });
}
