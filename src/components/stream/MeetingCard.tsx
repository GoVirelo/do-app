"use client";

import { Avatar } from "@/components/ui/Avatar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { tokens } from "@/lib/tokens";
import type { Meeting } from "@/types";
import { useTasksStore } from "@/store/tasks";

type Props = {
  meeting: Meeting;
};

export function MeetingCard({ meeting }: Props) {
  const { acceptExtractedAction, skipExtractedAction } = useTasksStore();
  const pendingActions = meeting.extractedActions.filter((a) => !a.accepted);

  if (pendingActions.length === 0) return null;

  const endTime = meeting.endedAt.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  const durationMin = Math.round((meeting.endedAt.getTime() - meeting.startedAt.getTime()) / 60000);

  return (
    <div
      className="rounded-r2 p-3.5"
      style={{
        background: tokens.bg2,
        border: `1px solid ${tokens.line}`,
        borderLeft: `2px solid ${tokens.forest}`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <SourceBadge kind="granola" />
        <span className="font-mono-do text-[10.5px] text-fg-3 tracking-[0.05em] uppercase">
          Meeting · Ended {endTime} · {durationMin} min
        </span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm">View notes ↗</Button>
      </div>

      <h2 className="mb-2">{meeting.title}</h2>

      <div className="flex items-center gap-1.5 mb-3">
        {meeting.attendees.slice(0, 5).map((a) => (
          <Avatar key={a.id} initial={a.initial} size={22} />
        ))}
        <span className="text-[11.5px] text-fg-2 ml-1">{meeting.attendees.length} attendees</span>
      </div>

      <div className="border-t border-line pt-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkle size={10} />
          <span
            className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: tokens.bronze }}
          >
            Extracted for you · {pendingActions.length} action{pendingActions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pendingActions.map((action) => (
          <div key={action.id} className="flex gap-2.5 py-2 items-start">
            <Checkbox checked={!!action.accepted} onChange={() => acceptExtractedAction(action.id)} />
            <div className="flex-1">
              <div className="text-[13px] text-fg-0">{action.taskDraft.title}</div>
              <div className="text-[11.5px] text-fg-2 italic mt-0.5">{action.quote}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => acceptExtractedAction(action.id)}>
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => skipExtractedAction(action.id)}>
              Skip
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
