"use client";

import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Meeting = {
  id: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  tasks: Task[];
};

type Props = { meeting: Meeting; onToggle: (id: string) => void };

export function MobileMeetingCard({ meeting, onToggle }: Props) {
  const endTime = meeting.endAt
    ? new Date(meeting.endAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
    : null;
  const openTasks = meeting.tasks.filter(t => t.status !== "done");

  return (
    <div
      className="rounded-r2 p-3.5 mb-3"
      style={{ background: tokens.bg2, border: `1px solid ${tokens.line}`, borderLeft: `2px solid ${tokens.amber}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <SourceBadge kind="granola" />
        <span className="font-mono-do text-[10px] text-fg-3 tracking-[0.04em] uppercase">
          Meeting · {endTime ? `Ended ${endTime}` : "In progress"}
        </span>
      </div>
      <div className="text-[15px] font-semibold text-fg-0 mb-2">{meeting.title}</div>

      <div className="border-t border-line pt-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkle size={9} />
          <span className="font-mono-do text-[9.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: tokens.bronze }}>
            {meeting.tasks.length} action{meeting.tasks.length !== 1 ? "s" : ""} extracted
          </span>
        </div>
        {meeting.tasks.map(t => {
          const done = t.status === "done";
          return (
            <div key={t.id} className="flex items-center gap-2 py-1.5" style={{ opacity: done ? 0.4 : 1 }}>
              <button
                onClick={() => onToggle(t.id)}
                className="flex-shrink-0 w-3.5 h-3.5 rounded border transition-colors"
                style={{ borderColor: done ? tokens.bronze : tokens.line, background: done ? tokens.bronze : "transparent" }}
              />
              <span className="text-[13px]" style={{ textDecoration: done ? "line-through" : "none", color: done ? tokens.fg3 : tokens.fg0 }}>
                {t.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
