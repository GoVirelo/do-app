"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { PriorityBar } from "@/components/ui/PriorityBar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Props = {
  task: Task;
  onToggle: () => void;
  onSkipDraft: () => void;
  onSendDraft: () => void;
};

export function TaskRow({ task, onToggle, onSkipDraft, onSendDraft }: Props) {
  const [hovered, setHovered] = useState(false);
  const done = task.status === "done";
  const draft = task.aiDraft;
  const showDraft = draft && draft.state === "proposed";

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-2.5 py-[9px] border-b border-line transition-colors duration-100",
        hovered && !done ? "bg-bg-2" : "bg-transparent"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mt-0.5">
        <Checkbox checked={done} onChange={onToggle} />
      </div>
      <div className="mt-1">
        <PriorityBar level={task.priority} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-[13.5px] font-medium",
              done ? "text-fg-3 line-through" : "text-fg-0"
            )}
          >
            {task.title}
          </span>
          <SourceBadge kind={task.source} />
        </div>

        {task.meta && (
          <div className="font-mono-do text-[11px] text-fg-3 mt-0.5 tracking-[-0.01em]">
            {task.meta}
          </div>
        )}

        {showDraft && (
          <div
            className="mt-2 p-2 rounded-r2"
            style={{
              background: `linear-gradient(135deg, ${tokens.bronzeSoft}, #2a1d0e)`,
              border: `1px solid ${tokens.bronzeLine}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkle size={10} />
              <span
                className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: tokens.bronze }}
              >
                AI Draft
              </span>
            </div>
            <p className="text-[12.5px] text-fg-1 leading-relaxed">{draft.body}</p>
            <div className="flex gap-1.5 mt-2">
              <Button variant="primary" size="sm" onClick={onSendDraft}>Send</Button>
              <Button variant="secondary" size="sm">Edit</Button>
              <Button variant="ghost" size="sm" onClick={onSkipDraft}>Skip</Button>
            </div>
          </div>
        )}

        {draft?.state === "sent" && (
          <div className="font-mono-do text-[10.5px] text-[#4a7a5e] mt-1">
            SENT VIA {task.source.toUpperCase()} · {new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-70 mt-0.5">
        <Avatar initial="M" size={18} />
      </div>
    </div>
  );
}
