"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tokens } from "@/lib/tokens";
import { Icons } from "@/components/ui/Icons";

const PRIORITIES = [
  { value: "hot",    label: "Hot",    color: tokens.oxblood },
  { value: "high",   label: "High",   color: tokens.bronze },
  { value: "medium", label: "Medium", color: tokens.steel },
  { value: "low",    label: "Low",    color: tokens.fg3 },
] as const;

const BUCKETS = [
  { value: "inbox",    label: "No date" },
  { value: "today",    label: "Today" },
  { value: "upcoming", label: "Tomorrow", due: "tomorrow" },
  { value: "upcoming", label: "This week" },
] as const;

type Props = { onClose: () => void };

export function NewTaskModal({ onClose }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"hot"|"high"|"medium"|"low">("medium");
  const [bucket, setBucket] = useState<string>("inbox");
  const [dueLabel, setDueLabel] = useState("No date");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addSubtask() {
    const v = subtaskInput.trim();
    if (!v) return;
    setSubtasks(s => [...s, v]);
    setSubtaskInput("");
  }

  function removeSubtask(i: number) {
    setSubtasks(s => s.filter((_, idx) => idx !== i));
  }

  async function save() {
    if (!title.trim() || saving) return;
    setSaving(true);
    let dueAt: string | undefined;
    if (dueLabel === "Tomorrow") {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0);
      dueAt = d.toISOString();
    } else if (dueLabel === "Today") {
      const d = new Date(); d.setHours(23, 59, 0, 0);
      dueAt = d.toISOString();
    }
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), notes: notes || undefined, priority, bucket, subtasks, dueAt }),
    });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[560px] rounded-r2 flex flex-col overflow-hidden"
        style={{ background: tokens.bg1, border: `1px solid ${tokens.line2}`, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="font-mono-do text-[11px] text-fg-3 uppercase tracking-[0.08em]">New Task</span>
          <button onClick={onClose} className="text-fg-3 hover:text-fg-1 transition-colors">
            <Icons.close size={16} />
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) save(); }}
            placeholder="Task name"
            className="w-full bg-transparent text-[18px] font-semibold text-fg-0 outline-none placeholder:text-fg-3"
          />

          {/* Notes */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes or description…"
            rows={3}
            className="w-full bg-transparent text-[13px] text-fg-1 outline-none resize-none placeholder:text-fg-3 leading-relaxed"
          />

          <div className="border-t border-line" />

          {/* Priority + Date row */}
          <div className="flex gap-3 flex-wrap">
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em]">Priority</span>
              <div className="flex gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className="px-2.5 py-1 text-[11.5px] rounded-r2 border transition-colors"
                    style={{
                      borderColor: priority === p.value ? p.color : tokens.line,
                      color: priority === p.value ? p.color : tokens.fg3,
                      background: priority === p.value ? `${p.color}18` : "transparent",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em]">Date</span>
              <div className="flex gap-1.5">
                {BUCKETS.map(b => (
                  <button
                    key={b.label}
                    onClick={() => { setDueLabel(b.label); setBucket(b.value); }}
                    className="px-2.5 py-1 text-[11.5px] rounded-r2 border transition-colors"
                    style={{
                      borderColor: dueLabel === b.label ? tokens.bronze : tokens.line,
                      color: dueLabel === b.label ? tokens.bronze : tokens.fg3,
                      background: dueLabel === b.label ? `${tokens.bronze}18` : "transparent",
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-line" />

          {/* Subtasks */}
          <div className="flex flex-col gap-2">
            <span className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em]">Subtasks</span>
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <div className="w-3 h-3 rounded border flex-shrink-0" style={{ borderColor: tokens.line }} />
                <span className="flex-1 text-[13px] text-fg-1">{s}</span>
                <button
                  onClick={() => removeSubtask(i)}
                  className="opacity-0 group-hover:opacity-100 text-fg-3 hover:text-fg-1 transition-opacity"
                >
                  <Icons.close size={12} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border flex-shrink-0" style={{ borderColor: tokens.line }} />
              <input
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); } }}
                placeholder="Add subtask…"
                className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
              />
            </div>
          </div>

          <div className="border-t border-line" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-[12.5px] text-fg-2 hover:text-fg-1 transition-colors">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!title.trim() || saving}
              className="px-4 py-1.5 text-[12.5px] font-medium rounded-r2 transition-colors"
              style={{
                background: title.trim() ? tokens.bronze : tokens.bg3,
                color: title.trim() ? "#1a1108" : tokens.fg3,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "Create task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
