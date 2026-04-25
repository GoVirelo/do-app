"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/Checkbox";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Props = { task: Task; onToggle: () => void; onSendDraft: (body?: string) => void; onSkipDraft: () => void };

export function MobileTask({ task, onToggle, onSendDraft, onSkipDraft }: Props) {
  const [expanded, setExpanded] = useState(false);
  const done = task.status === "done";
  const hot = task.priority === "hot";
  const draft = task.aiDraft;
  const showDraft = draft?.state === "proposed";

  return (
    <div
      className="rounded-r2 p-3.5 mb-2"
      style={{
        background: tokens.bg2,
        border: `1px solid ${tokens.line}`,
        borderLeft: hot ? `2px solid ${tokens.oxblood}` : `1px solid ${tokens.line}`,
        opacity: done ? 0.5 : 1,
      }}
    >
      <div className="flex gap-2.5 items-start">
        <Checkbox checked={done} onChange={onToggle} className="w-[18px] h-[18px] mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0" onClick={() => !done && setExpanded(v => !v)}>
          <div className={`text-[14px] font-medium mb-1.5 ${done ? "line-through text-fg-3" : "text-fg-0"}`}>
            {task.title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <SourceBadge kind={task.source as any} />
            {task.meta && (
              <span className="font-mono-do text-[10.5px] text-fg-3">{task.meta}</span>
            )}
          </div>

          {expanded && showDraft && (
            <div
              className="mt-2.5 p-2.5 rounded-r2"
              style={{ background: `linear-gradient(135deg, ${tokens.bronzeSoft}, #2a1d0e)`, border: `1px solid ${tokens.bronzeLine}` }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkle size={10} />
                <span className="font-mono-do text-[9.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.bronze }}>
                  Draft reply
                </span>
              </div>
              <p className="text-[12.5px] text-fg-1 leading-relaxed">{draft.body}</p>
              <div className="flex gap-1.5 mt-2.5">
                <Button variant="primary" size="sm" className="flex-1 justify-center" onClick={() => onSendDraft()}>Send</Button>
                <Button variant="ghost" size="sm" className="flex-1 justify-center" onClick={onSkipDraft}>Skip</Button>
              </div>
            </div>
          )}

          {draft?.state === "sent" && (
            <div className="font-mono-do text-[10px] mt-1.5" style={{ color: tokens.forest }}>
              SENT · {new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
