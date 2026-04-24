import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keySet = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10) ?? "not set";

  if (!keySet) {
    return NextResponse.json({ ok: false, error: "ANTHROPIC_API_KEY not set", keyPrefix });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 64,
      messages: [{ role: "user", content: "Reply with just: ok" }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "(no text)";
    return NextResponse.json({ ok: true, keyPrefix, response: text, model: "claude-sonnet-4-6" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, keyPrefix, error: err.message });
  }
}
