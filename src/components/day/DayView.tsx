"use client";

import { useState, useRef, useEffect } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { PriorityBar } from "@/components/ui/PriorityBar";
import { Icons } from "@/components/ui/Icons";
import { DaySidebar } from "./DaySidebar";
import { NowLine } from "./NowLine";
import { TimelineBlock } from "./TimelineBlock";
import { tokens } from "@/lib/tokens";
import { useAppTasks } from "@/hooks/useAppTasks";
import { useMeetings, useUpdateTask } from "@/hooks/useTasks";
import type { Task } from "@/types";
import type { ApiMeeting } from "@/hooks/useTasks";

const HOURS = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6"];
const ROW_H = 56;
const START_HOUR = 8;

// ── Time helpers ───────────────────────────────────────────────────────────────
function topPx(date: Date) {
  const mins = (date.getHours() - START_HOUR) * 60 + date.getMinutes();
  return (mins / 60) * ROW_H;
}
function heightPx(start: Date, end: Date) {
  return Math.max(((end.getTime() - start.getTime()) / 3600000) * ROW_H, 24);
}
function fmtTime(date: Date) {
  const h = date.getHours(), m = date.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}
function isToday(d: Date) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function nextSlot(offsetMins = 0) {
  const d = new Date(Date.now() + offsetMins * 60000);
  const m = d.getMinutes();
  d.setMinutes(m <= 30 ? 30 : 0, 0, 0);
  if (m > 30) d.setHours(d.getHours() + 1);
  return d;
}

// ── Task classification ────────────────────────────────────────────────────────
// "Catch-up" = quick action words that suggest < 15 min of work
const CATCHUP_WORDS = [
  "reply", "respond", "send", "email", "call", "ping", "message", "dm",
  "follow up", "follow-up", "check in", "check-in", "confirm", "rsvp",
  "approve", "update", "quick", "remind", "invite", "schedule", "book",
  "ack", "acknowledge", "forward", "share", "post", "notify",
];

function isCatchup(task: Task): boolean {
  const lower = task.title.toLowerCase();
  if (CATCHUP_WORDS.some(w => lower.startsWith(w) || lower.includes(` ${w} `) || lower.includes(` ${w}`))) return true;
  // Slack tasks are usually quick replies
  if (task.source === "slack" && task.priority !== "hot") return true;
  return false;
}

// ── Slot picker ────────────────────────────────────────────────────────────────
const SLOTS = [
  { label: "Next 30 min",  start: () => nextSlot(), mins: 30  },
  { label: "Next 1 hour",  start: () => nextSlot(), mins: 60  },
  { label: "Next 2 hours", start: () => nextSlot(), mins: 120 },
  { label: "4 PM – 5 PM",  start: () => { const d = new Date(); d.setHours(16, 0, 0, 0); return d; }, mins: 60 },
  { label: "5 PM – 6 PM",  start: () => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; }, mins: 60 },
];

function SlotPicker({ onSelect, onClose }: { onSelect: (s: Date, e: Date) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 rounded-r2 py-1 min-w-[150px]"
      style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      {SLOTS.map(opt => (
        <button key={opt.label} onClick={() => {
          const s = opt.start();
          onSelect(s, new Date(s.getTime() + opt.mins * 60000));
        }} className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-bg-2 transition-colors" style={{ color: tokens.fg1 }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Catch-up group card ────────────────────────────────────────────────────────
function CatchupGroup({ tasks, onBlock }: { tasks: Task[]; onBlock: (ids: string[], s: Date, e: Date) => void }) {
  const [open, setOpen] = useState(false);
  // Estimate time: 10 min per task, round to nearest 30
  const estMins = Math.ceil((tasks.length * 10) / 30) * 30;

  return (
    <div className="mx-2 mb-2 rounded-r2 overflow-hidden" style={{ border: `1px solid ${tokens.bronzeLine}`, background: tokens.bronzeSoft }}>
      {/* Group header */}
      <div className="px-2.5 py-2 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkle size={9} />
            <span className="text-[11.5px] font-semibold" style={{ color: tokens.bronze }}>
              Catch-up block · {tasks.length} quick tasks
            </span>
          </div>
          <div className="font-mono-do text-[10px] mt-0.5" style={{ color: tokens.fg3 }}>
            ~{estMins} min together · replies, updates, sends
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpen(v => !v)}
            className="px-1.5 py-0.5 rounded text-[9.5px] font-mono-do font-semibold transition-colors"
            style={{ background: open ? tokens.bronze : "transparent", color: open ? "#1a1108" : tokens.bronze, border: `1px solid ${tokens.bronze}` }}
          >
            Block {estMins}m ▾
          </button>
          {open && (
            <SlotPicker
              onSelect={(s, e) => { onBlock(tasks.map(t => t.id), s, e); setOpen(false); }}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </div>
      {/* Task list */}
      <div className="border-t px-2.5 py-1.5 flex flex-col gap-0.5" style={{ borderColor: tokens.bronzeLine }}>
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-1.5 py-0.5">
            <SourceBadge kind={t.source} />
            <span className="text-[11px] truncate" style={{ color: tokens.fg1 }}>{t.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Focus task card (standalone) ───────────────────────────────────────────────
function FocusTask({ task, onBlock }: { task: Task; onBlock: (id: string, s: Date, e: Date) => void }) {
  const [open, setOpen] = useState(false);

  // Suggest effort based on source/priority
  const effort = task.priority === "hot" ? "~1–2 hrs" : task.source === "granola" ? "~45 min" : "~30–60 min";

  return (
    <div className="mx-2 mb-1.5 px-2.5 py-2.5 rounded-r2" style={{ border: `1px solid ${tokens.line}`, background: tokens.bg2 }}>
      <div className="flex items-start gap-2">
        <PriorityBar level={task.priority} className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-fg-0">{task.title}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <SourceBadge kind={task.source} />
            <span className="font-mono-do text-[10px]" style={{ color: tokens.fg3 }}>{effort} · needs own block</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpen(v => !v)}
            className="px-1.5 py-0.5 rounded text-[9.5px] font-mono-do font-semibold transition-colors"
            style={{ background: open ? tokens.bronze : tokens.bronzeSoft, color: open ? "#1a1108" : tokens.bronze, border: `1px solid ${tokens.bronzeLine}` }}
          >
            Block time ▾
          </button>
          {open && (
            <SlotPicker
              onSelect={(s, e) => { onBlock(task.id, s, e); setOpen(false); }}
              onClose={() => setOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Meeting prep card ──────────────────────────────────────────────────────────
function MeetingPrepCard({ meeting, onToggleTask }: { meeting: ApiMeeting; onToggleTask: (id: string, done: boolean) => void }) {
  const start = new Date(meeting.startAt);
  const end = meeting.endAt ? new Date(meeting.endAt) : null;
  const openTasks = meeting.tasks.filter((t: any) => t.status !== "done");
  const isPast = end ? end < new Date() : start < new Date();

  return (
    <div className="mx-2 mb-1.5 px-2.5 py-2.5 rounded-r2"
      style={{ background: tokens.bg2, border: `1px solid ${tokens.line}`, opacity: isPast && openTasks.length === 0 ? 0.55 : 1 }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-fg-0 truncate">{meeting.title}</div>
          <div className="font-mono-do text-[10.5px] mt-0.5" style={{ color: tokens.fg3 }}>
            {fmtTime(start)}{end ? ` – ${fmtTime(end)}` : ""}
          </div>
        </div>
        {openTasks.length > 0 && (
          <span className="flex-shrink-0 font-mono-do text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: tokens.bronzeSoft, color: tokens.bronze, border: `1px solid ${tokens.bronzeLine}` }}>
            {openTasks.length} open
          </span>
        )}
      </div>
      {meeting.tasks.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5">
          {meeting.tasks.slice(0, 4).map((t: any) => (
            <button key={t.id} onClick={() => onToggleTask(t.id, t.status !== "done")}
              className="flex items-center gap-2 text-left py-0.5 rounded hover:bg-bg-3 px-1 transition-colors w-full">
              <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center transition-colors"
                style={{ border: `1.5px solid ${t.status === "done" ? tokens.forest : tokens.line2}`, background: t.status === "done" ? tokens.forest : "transparent" }}>
                {t.status === "done" && <Icons.done size={9} />}
              </span>
              <span className="text-[11px] truncate flex-1"
                style={{ color: t.status === "done" ? tokens.fg3 : tokens.fg1, textDecoration: t.status === "done" ? "line-through" : "none" }}>
                {t.title}
              </span>
            </button>
          ))}
          {meeting.tasks.length > 4 && (
            <div className="text-[11px] pl-1" style={{ color: tokens.fg3 }}>+{meeting.tasks.length - 4} more</div>
          )}
        </div>
      )}
    </div>
  );
}

function RailSection({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-4 pb-1.5">
      <span className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: tokens.fg3 }}>{label}</span>
      {!!count && <span className="font-mono-do text-[10px]" style={{ color: tokens.fg3 }}>{count}</span>}
    </div>
  );
}

// ── Main DayView ───────────────────────────────────────────────────────────────
type Props = { onViewChange: (v: string) => void };

export function DayView({ onViewChange }: Props) {
  const { tasks } = useAppTasks();
  const { data: meetings = [] } = useMeetings();
  const updateTask = useUpdateTask();
  const [planning, setPlanning] = useState(false);
  const [planned, setPlanned] = useState(false);

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  const todayMeetings = (meetings as ApiMeeting[]).filter(m => isToday(new Date(m.startAt)));
  const timelineMeetings = todayMeetings.filter(m => {
    const h = new Date(m.startAt).getHours();
    return h >= START_HOUR && h < 19;
  });

  // Tasks that need scheduling (not done, not already scheduled)
  const unscheduled = tasks.filter(t =>
    t.status !== "done" &&
    (t.priority === "hot" || t.bucket === "today") &&
    !t.scheduledStart
  );

  // Split into catch-up vs focus
  const catchupTasks = unscheduled.filter(isCatchup);
  const focusTasks   = unscheduled.filter(t => !isCatchup(t));

  // Already scheduled today — show on timeline
  const scheduledTasks = tasks.filter(t =>
    t.scheduledStart && isToday(t.scheduledStart) && t.status !== "done"
  );

  const openCount = tasks.filter(t => t.status !== "done").length;

  // Block a single focus task
  function blockTask(taskId: string, start: Date, end: Date) {
    updateTask.mutate({ id: taskId, scheduledStart: start.toISOString(), scheduledEnd: end.toISOString(), bucket: "today" } as any);
  }

  // Block all catch-up tasks into the same slot
  function blockCatchup(ids: string[], start: Date, end: Date) {
    ids.forEach(id => {
      updateTask.mutate({ id, scheduledStart: start.toISOString(), scheduledEnd: end.toISOString(), bucket: "today" } as any);
    });
  }

  function handleToggleMeetingTask(taskId: string, markDone: boolean) {
    updateTask.mutate({ id: taskId, status: markDone ? "done" : "open" });
  }

  async function planDay() {
    if (planning || planned) return;
    setPlanning(true);
    try {
      await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Schedule my tasks into time blocks for the rest of today. Current time: ${fmtTime(new Date())}.
Group quick reply/send/update tasks together into one catch-up block. Give each complex or hot task its own block.
Use the update_task tool to set scheduledStart and scheduledEnd for each task. Fill slots from now until 6pm.`,
          }],
        }),
      });
      setPlanned(true);
    } catch { /* silent */ }
    finally { setPlanning(false); }
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Day"
        onView={onViewChange}
        right={
          <>
            <Button variant="ghost" size="sm">‹ Yesterday</Button>
            <Button variant="secondary" size="sm">{today.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })}</Button>
            <Button variant="ghost" size="sm">Tomorrow ›</Button>
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <DaySidebar />

        <div className="flex flex-1 min-w-0 overflow-hidden">

          {/* ── Timeline ── */}
          <div className="flex-1 overflow-auto px-5 py-[18px] pl-2.5">
            <div className="mb-3.5 pl-11">
              <h1>{todayLabel}</h1>
              <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
                {todayMeetings.length > 0 ? `${todayMeetings.length} meeting${todayMeetings.length !== 1 ? "s" : ""}` : "No meetings"}
                {unscheduled.length > 0 ? ` · ${unscheduled.length} need${unscheduled.length === 1 ? "s" : ""} time` : ""}
                {` · ${openCount} open`}
              </div>
            </div>

            <div className="relative">
              {HOURS.map((h, i) => (
                <div key={h} className="flex items-stretch" style={{ height: ROW_H, borderTop: `1px solid ${tokens.line}` }}>
                  <div className="font-mono-do text-[10.5px] text-fg-3 pt-1 text-right pr-2.5" style={{ width: 44 }}>
                    {h} {i < 4 ? "AM" : "PM"}
                  </div>
                  <div className="flex-1 relative" />
                </div>
              ))}

              <NowLine />

              {/* Meeting blocks */}
              {timelineMeetings.map(m => {
                const s = new Date(m.startAt);
                const e = m.endAt ? new Date(m.endAt) : new Date(s.getTime() + 3600000);
                const hasTasks = m.tasks.some((t: any) => t.status !== "done");
                return (
                  <TimelineBlock key={m.id}
                    top={topPx(s)} height={heightPx(s, e)}
                    title={m.title}
                    meta={`${fmtTime(s)} – ${fmtTime(e)}${m.attendees?.length ? ` · ${m.attendees.length} people` : ""}${hasTasks ? " · tasks pending" : ""}`}
                    tone={m.granolaId ? "granola" : "outlook"}
                    done={e < today && !hasTasks}
                    urgent={hasTasks && e > today}
                  />
                );
              })}

              {/* Scheduled task blocks */}
              {scheduledTasks.map(t => t.scheduledStart && t.scheduledEnd && (
                <TimelineBlock key={t.id}
                  top={topPx(t.scheduledStart!)}
                  height={heightPx(t.scheduledStart!, t.scheduledEnd!)}
                  title={t.title}
                  meta={`${fmtTime(t.scheduledStart!)} – ${fmtTime(t.scheduledEnd!)} · Task slot`}
                  tone="task"
                  dashed
                />
              ))}

              {timelineMeetings.length === 0 && scheduledTasks.length === 0 && (
                <div className="absolute font-mono-do text-[10.5px] text-fg-3" style={{ top: ROW_H * 1.5, left: 54 }}>
                  No events today — block time on the right to schedule
                </div>
              )}
            </div>
          </div>

          {/* ── AI Day Planner rail ── */}
          <div className="flex flex-col overflow-hidden flex-shrink-0"
            style={{ width: 288, background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}>

            {/* Header */}
            <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <div className="flex items-center gap-1.5">
                <Sparkle size={11} />
                <span className="font-semibold text-[13px]">Day Planner</span>
              </div>
              <div className="font-mono-do text-[10px] text-fg-3 mt-0.5 uppercase tracking-[0.06em]">
                AI-grouped focus &amp; catch-up
              </div>
            </div>

            <div className="flex-1 overflow-auto">

              {/* Catch-up group */}
              {catchupTasks.length > 0 && (
                <>
                  <RailSection label="Catch-up block" />
                  <CatchupGroup tasks={catchupTasks} onBlock={blockCatchup} />
                </>
              )}

              {/* Focus tasks */}
              {focusTasks.length > 0 && (
                <>
                  <RailSection label="Focus tasks" count={focusTasks.length} />
                  {focusTasks.map(t => (
                    <FocusTask key={t.id} task={t} onBlock={blockTask} />
                  ))}
                </>
              )}

              {/* Nothing unscheduled */}
              {unscheduled.length === 0 && (
                <div className="px-3 pt-5 text-[12px]" style={{ color: tokens.fg3 }}>
                  All tasks scheduled — great work.
                </div>
              )}

              {/* Today's meetings */}
              {todayMeetings.length > 0 && (
                <>
                  <RailSection label="Today's meetings" count={todayMeetings.length} />
                  {todayMeetings.map(m => (
                    <MeetingPrepCard key={m.id} meeting={m} onToggleTask={handleToggleMeetingTask} />
                  ))}
                </>
              )}
            </div>

            {/* Auto-schedule footer */}
            <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkle size={10} />
                <span className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.bronze }}>
                  Auto-schedule
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed mb-2" style={{ color: tokens.fg1 }}>
                {planned
                  ? "Day planned — tasks scheduled into open slots."
                  : catchupTasks.length > 0 && focusTasks.length > 0
                  ? `Group ${catchupTasks.length} quick tasks + block ${focusTasks.length} focus session${focusTasks.length !== 1 ? "s" : ""}?`
                  : unscheduled.length > 0
                  ? `Fit ${unscheduled.length} task${unscheduled.length !== 1 ? "s" : ""} into open slots today?`
                  : "Nothing left to schedule today."}
              </p>
              <Button variant="primary" size="sm" className="w-full justify-center"
                onClick={planDay} disabled={planning || planned || unscheduled.length === 0}>
                {planning ? "Planning…" : planned ? "✓ Scheduled" : "Plan my day"}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
