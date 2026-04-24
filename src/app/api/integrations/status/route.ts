import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    granola: !!process.env.GRANOLA_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
}
