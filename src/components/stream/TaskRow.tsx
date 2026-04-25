"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/Checkbox";
import { PriorityBar } from "@/components/ui/PriorityBar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

const SCHEDULE_OPTIONS = [
  { label: "No date",   bucket: "inbox",    dueAt: null,        color: tokens.fg2 },
  { label: "Today",     bucket: "today",    dueAt: "today",     color: tokens.bronze },
  { label: "Tomorrow",  bucket: "upcoming", dueAt: "tomorrow",  color: "#8a9ab5" },
  { label: "This week", bucket: "upcoming", dueAt: null,        color: tokens.steel },
] as const;

function bucketLabel(bucket: string, dueAt?: Date | null): { label: string; color: string; active: boolean } {
  if (bucket === "today")    return { label: "Today",     color: tokens.bronze, active: true };
  if (bucket === "this_week") {
    if (dueAt) {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      if (dueAt.toDateString() === tomorrow.toDateString())
        return { label: "Tomorrow", color: "#8a9ab5", active: true };
    }
    return { label: "This week", color: tokens.steel, active: true };
  }
  return { label: "No date", color: tokens.fg2, active: false };
}

export function SchedulePill({ task }: { task: Task }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { label, color, active } = bucketLabel(task.bucket, task.dueAt);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function schedule(opt: typeof SCHEDULE_OPTIONS[number]) {
    setOpen(false);
    let dueAt: string | null = null;
    if (opt.dueAt === "today") {
      const d = new Date(); d.setHours(23, 59, 0, 0);
      dueAt = d.toISOString();
    } else if (opt.dueAt === "tomorrow") {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0);
      dueAt = d.toISOString();
    }
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket: opt.bucket, dueAt }),
    });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["meetings"] });
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="font-mono-do text-[10px] px-1.5 py-0.5 rounded border transition-colors"
        style={{
          color,
          borderColor: active ? `${color}66` : `${color}33`,
          background: active ? `${color}18` : "transparent",
          opacity: active ? 1 : 0.55,
        }}
      >
        {label}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 rounded-r2 overflow-hidden py-0.5"
          style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}`, minWidth: 110, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
        >
          {SCHEDULE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => schedule(opt)}
              className="w-full text-left px-3 py-1.5 text-[12px] transition-colors hover:bg-bg-4"
              style={{ color: opt.color }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = {
  task: Task;
  onToggle: () => void;
  onSkipDraft: () => void;
  onSendDraft: (editedBody?: string) => void;
};

export function TaskRow({ task, onToggle, onSkipDraft, onSendDraft }: Props) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const done = task.status === "done";
  const draft = task.aiDraft;
  const showDraft = draft && draft.state === "proposed";
  const isSlack = task.source === "slack";

  function startEdit() {
    setEditBody(draft?.body ?? "");
    setEditing(true);
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-start gap-2.5 px-2.5 py-[9px] border-b border-line transition-colors duration-100",
        hovered && !done ? "bg-bg-2" : "bg-transparent"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing transition-opacity"
        style={{ opacity: hovered ? 0.4 : 0, fontSize: 10, letterSpacing: "-1px", lineHeight: 1, color: "currentColor" }}
        title="Drag to reschedule"
      >
        ⠿
      </div>
      <div className="mt-0.5">
        <Checkbox checked={done} onChange={onToggle} />
      </div>
      <div className="mt-1">
        <PriorityBar level={task.priority} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[13.5px] font-medium", done ? "text-fg-3 line-through" : "text-fg-0")}>
            {task.title}
          </span>
          <SourceBadge kind={task.source} />
        </div>

        {task.meta && (
          <div className="font-mono-do text-[11px] text-fg-3 mt-0.5 tracking-[-0.01em]">{task.meta}</div>
        )}

        {showDraft && (
          <div
            className="mt-2 p-2 rounded-r2"
            style={{ background: `linear-gradient(135deg, ${tokens.bronzeSoft}, #2a1d0e)`, border: `1px solid ${tokens.bronzeLine}` }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkle size={10} />
              <span className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.bronze }}>
  {"AI Draft"}
              </span>
            </div>

            {editing ? (
              <textarea
                autoFocus
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                className="w-full bg-transparent text-[12.5px] text-fg-1 leading-relaxed resize-none outline-none border rounded-r1 p-1.5"
                style={{ borderColor: tokens.bronzeLine, minHeight: 72 }}
              />
            ) : (
              <p className="text-[12.5px] text-fg-1 leading-relaxed">{draft.body}</p>
            )}

            <div className="flex gap-1.5 mt-2">
              <Button variant="primary" size="sm" onClick={() => onSendDraft(editing ? editBody : undefined)}>
                {isSlack ? "Send reply" : "Send"}
              </Button>
              {!editing && (
                <Button variant="secondary" size="sm" onClick={startEdit}>Edit</Button>
              )}
              {editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              )}
              <Button variant="ghost" size="sm" onClick={onSkipDraft}>Skip</Button>
            </div>
          </div>
        )}

        {draft?.state === "sent" && (
          <div className="font-mono-do text-[10.5px] text-[#4a7a5e] mt-1">
            {isSlack ? "REPLIED IN SLACK" : `SENT VIA ${task.source.toUpperCase()}`} · {new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* Schedule pill — always visible, not just on hover */}
      {!done && <SchedulePill task={task} />}
    </div>
  );
}
