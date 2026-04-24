import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface ExtractedAction {
  title: string;
  priority: "hot" | "high" | "medium" | "low";
  dueDate?: string;
  assignee?: string;
}

export async function extractActionsFromNotes(
  notes: string,
  meetingTitle: string,
  attendees: string[]
): Promise<ExtractedAction[]> {
  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extract all action items from these meeting notes. Return a JSON array.

Meeting: "${meetingTitle}"
Attendees: ${attendees.join(", ")}

Notes:
${notes}

Return ONLY valid JSON — an array of objects with fields:
- title: string (the action item, starting with a verb)
- priority: "hot" | "high" | "medium" | "low"
- dueDate: ISO date string or null
- assignee: email or name, or null`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]) as ExtractedAction[];
  } catch {
    return [];
  }
}

export interface DraftReply {
  body: string;
  channel: string;
}

export async function generateDraftReply(
  taskTitle: string,
  context: string,
  channel: "slack" | "email" | "teams",
  userProfile?: { name?: string; email?: string }
): Promise<DraftReply> {
  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a concise, professional reply for this task. Tone: direct and helpful, not sycophantic. Max 3 sentences.

Task: ${taskTitle}
Context: ${context}
Channel: ${channel}
Sender: ${userProfile?.name ?? "unknown"}

Return ONLY the reply text — no preamble, no quotes.`,
      },
    ],
  });

  const body = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  return { body, channel };
}

export async function triageTask(
  title: string,
  context: string
): Promise<{ priority: "hot" | "high" | "medium" | "low"; reasoning: string }> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Classify the priority of this task. Return JSON only.

Task: ${title}
Context: ${context}

Return: {"priority": "hot"|"high"|"medium"|"low", "reasoning": "one sentence"}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { priority: "medium", reasoning: "" };

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { priority: "medium", reasoning: "" };
  }
}
