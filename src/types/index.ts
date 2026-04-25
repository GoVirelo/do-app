export type Source = "granola" | "slack" | "outlook" | "personal";

export type Task = {
  id: string;
  title: string;
  status: "open" | "done" | "snoozed";
  priority: "normal" | "hot";
  bucket: "inbox" | "now" | "today" | "this_week" | "scheduled";
  source: Source;
  sourceRef: {
    granola?: { meetingId: string; utteranceId?: string; quote?: string };
    slack?: { channelId: string; ts: string; threadTs?: string };
    outlook?: { messageId?: string; eventId?: string };
  };
  createdAt: Date;
  dueAt?: Date;
  scheduledBlock?: { start: Date; end: Date };
  assignee: string;
  meta?: string;
  aiDraft?: AIDraft;
};

export type AIDraft = {
  kind: "reply" | "email" | "slack_message";
  target: { channelId?: string; threadTs?: string; recipient?: string };
  body: string;
  provenance: string[];
  autoApprovable: boolean;
  state: "proposed" | "sending" | "sent" | "skipped";
};

export type Meeting = {
  id: string;
  provider: "granola";
  title: string;
  startedAt: Date;
  endedAt: Date;
  attendees: { id: string; name: string; initial: string }[];
  transcriptUrl: string;
  extractedActions: Array<{
    id: string;
    taskDraft: Partial<Task>;
    quote: string;
    speaker: string;
    confidence: number;
    accepted?: boolean;
  }>;
};

export type AISuggestion = {
  id: string;
  kind: "draft_ready" | "batch" | "turn_into_meeting" | "auto_handle" | "schedule";
  label: string;
  body: string;
  actions: Array<{ label: string; variant: "primary" | "secondary" | "ghost" }>;
  relatedTaskIds: string[];
  dashed?: boolean;
};
