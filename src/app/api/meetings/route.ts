import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meetings = await prisma.meeting.findMany({
    where: { userId: session.user.id },
    include: {
      tasks: {
        where: { status: { not: "done" } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { startAt: "desc" },
    take: 20,
  });

  return NextResponse.json(meetings);
}
