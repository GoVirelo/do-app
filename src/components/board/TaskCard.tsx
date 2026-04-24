"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Props = {
  task: Task;
  onToggle: () => void;
};

export function TaskCard({ task, onToggle }: Props) {
  const [hovered, setHovered] = useState(false);
  const done = task.status === "done";
  const hot = task.priority === "hot";
  const hasDraft = task.aiDraft?.state === "proposed";

  return (
    <div
      className={cn("rounded-r2 p-2.5 transition-colors duration-100", hovered && !done && "brightness-110")}
      style={{
        background: hovered && !done ? tokens.bg3 : tokens.bg2,
        border: hot ? `1px solid ${tokens.line}` : `1px solid ${tokens.line}`,
        borderLeft: hot ? `2px solid ${tokens.oxblood}` : `1px solid ${tokens.line}`,
        opacity: done ? 0.55 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-[1px]">
          <Checkbox checked={done} onChange={onToggle} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={cn("text-[12.5px] font-medium leading-snug mb-1.5", done ? "line-through text-fg-3" : "text-fg-0")}
          >
            {task.title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <SourceBadge kind={task.source} />
            {task.meta && (
              <span className="font-mono-do text-[10.5px] text-fg-3">{task.meta}</span>
            )}
          </div>
          {hasDraft && (
            <div
              className="mt-2 px-2 py-1 rounded-r1 flex items-center gap-1.5"
              style={{ background: tokens.bronzeSoft, border: `1px solid ${tokens.bronzeLine}` }}
            >
              <Sparkle size={9} />
              <span
                className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: tokens.bronze }}
              >
                Draft ready
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
