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

function topPx(date: Date) {
  const mins = (date.getHours() - START_HOUR) * 60 + date.getMinutes();
  return (mins / 60) * ROW_H;
}
function heightPx(startDate: Date, endDate: Date) {
  const diffMins = (endDate.getTime() - startDate.getTime()) / 60000;
  return Math.max((diffMins / 60) * ROW_H, 24);
}
function fmtTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}
function isToday(date: Date) {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

// Round up to the next 30-minute boundary
function nextSlot(offsetMins = 0) {
  const d = new Date(Date.now() + offsetMins * 60000);
  const m = d.getMinutes();
  const roundedM = m <= 30 ? 30 : 0;
  if (roundedM === 0) d.setHours(d.getHours() + 1);
  d.setMinutes(roundedM, 0, 0);
  return d;
}

const SLOT_OPTIONS = [
  { label: "Next 30 min",  start: () => nextSlot(0),   durationMins: 30  },
  { label: "Next 1 hour",  start: () => nextSlot(0),   durationMins: 60  },
  { label: "Next 2 hours", start: () => nextSlot(0),   durationMins: 120 },
  { label: "4 PM – 5 PM",  start: () => { const d = new Date(); d.setHours(16, 0, 0, 0); return d; }, durationMins: 60 },
  { label: "5 PM – 6 PM",  start: () => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; }, durationMins: 60 },
];

function aiHint(task: Task): string {
  if (task.source === "slack")   return "Reply needed";
  if (task.source === "granola") return "Meeting follow-up";
  if (task.source === "outlook") return "Deadline";
  if (task.priority === "hot")   return "High priority";
  return "Schedule today";
}

// ── Time slot picker popover ──────────────────────────────────────────────────
function SlotPicker({
  onSelect,
  onClose,
}: {
  onSelect: (start: Date, end: Date) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 rounded-r2 py-1 min-w-[150px]"
      style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
    >
      {SLOT_OPTIONS.map(opt => (
        <button
          key={opt.label}
          onClick={() => {
            const start = opt.start();
            const end = new Date(start.getTime() + opt.durationMins * 60000);
            onSelect(start, end);
          }}
          className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-bg-2 transition-colors"
          style={{ color: tokens.fg1 }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Focus task row ────────────────────────────────────────────────────────────
function FocusTask({
  task,
  onBlock,
}: {
  task: Task;
  onBlock: (taskId: string, start: Date, end: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mx-2 mb-1 px-2.5 py-2 rounded-r2 flex gap-2 items-start"
      style={{ border: `1px solid ${tokens.line}` }}
    >
      <PriorityBar level={task.priority} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-fg-0 truncate">{task.title}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <SourceBadge kind={task.source} />
          <span className="font-mono-do text-[10px]" style={{ color: tokens.bronze }}>
            {aiHint(task)}
          </span>
        </div>
      </div>
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setOpen(v => !v)}
          className="px-1.5 py-0.5 rounded text-[9.5px] font-mono-do font-semibold transition-colors"
          style={{
            background: open ? tokens.bronze : tokens.bronzeSoft,
            color: open ? "#1a1108" : tokens.bronze,
            border: `1px solid ${tokens.bronzeLine}`,
          }}
        >
          Block time ▾
        </button>
        {open && (
          <SlotPicker
            onSelect={(start, end) => {
              onBlock(task.id, start, end);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Meeting prep card ─────────────────────────────────────────────────────────
function MeetingPrepCard({
  meeting,
  onToggleTask,
}: {
  meeting: ApiMeeting;
  onToggleTask: (taskId: string, done: boolean) => void;
}) {
  const start = new Date(meeting.startAt);
  const end = meeting.endAt ? new Date(meeting.endAt) : null;
  const openTasks = meeting.tasks.filter((t: any) => t.status !== "done");
  const isPast = end ? end < new Date() : start < new Date();

  return (
    <div
      className="mx-2 mb-1.5 px-2.5 py-2.5 rounded-r2"
      style={{
        background: tokens.bg2,
        border: `1px solid ${tokens.line}`,
        opacity: isPast && openTasks.length === 0 ? 0.55 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-fg-0 truncate">{meeting.title}</div>
          <div className="font-mono-do text-[10.5px] mt-0.5" style={{ color: tokens.fg3 }}>
            {fmtTime(start)}{end ? ` – ${fmtTime(end)}` : ""}
          </div>
        </div>
        {openTasks.length > 0 && (
          <span
            className="flex-shrink-0 font-mono-do text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: tokens.bronzeSoft, color: tokens.bronze, border: `1px solid ${tokens.bronzeLine}` }}
          >
            {openTasks.length} open
          </span>
        )}
      </div>
      {meeting.tasks.length > 0 && (
        <div className="mt-2 flex flex-col gap-0.5">
          {meeting.tasks.slice(0, 4).map((t: any) => (
            <button
              key={t.id}
              onClick={() => onToggleTask(t.id, t.status !== "done")}
              className="flex items-center gap-2 text-left group py-0.5 rounded hover:bg-bg-3 px-1 transition-colors w-full"
            >
              <span
                className="w-3.5 h-3.5 rounded-sm flex-shrink-0 flex items-center justify-center transition-colors"
                style={{
                  border: `1.5px solid ${t.status === "done" ? tokens.forest : tokens.line2}`,
                  background: t.status === "done" ? tokens.forest : "transparent",
                }}
              >
                {t.status === "done" && (
                  <Icons.done size={9} className="text-fg-0" />
                )}
              </span>
              <span
                className="text-[11px] truncate flex-1"
                style={{
                  color: t.status === "done" ? tokens.fg3 : tokens.fg1,
                  textDecoration: t.status === "done" ? "line-through" : "none",
                }}
              >
                {t.title}
              </span>
            </button>
          ))}
          {meeting.tasks.length > 4 && (
            <div className="text-[11px] pl-1" style={{ color: tokens.fg3 }}>
              +{meeting.tasks.length - 4} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Scheduled task block (appears on the timeline) ───────────────────────────
function ScheduledBlock({ task }: { task: Task & { scheduledStart: Date; scheduledEnd: Date } }) {
  const t = topPx(task.scheduledStart);
  const h = heightPx(task.scheduledStart, task.scheduledEnd);
  return (
    <TimelineBlock
      top={t}
      height={h}
      title={task.title}
      meta={`${fmtTime(task.scheduledStart)} – ${fmtTime(task.scheduledEnd)} · Task slot`}
      tone="task"
      dashed
    />
  );
}

function RailSection({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-4 pb-1.5">
      <span className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: tokens.fg3 }}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="font-mono-do text-[10px]" style={{ color: tokens.fg3 }}>{count}</span>
      )}
    </div>
  );
}

function EmptyRail({ label }: { label: string }) {
  return (
    <div className="mx-2 mb-1 px-2.5 py-1.5 text-[11.5px]" style={{ color: tokens.fg3 }}>
      {label}
    </div>
  );
}

// ── AI Plan panel ─────────────────────────────────────────────────────────────
function PlanFooter({ focusCount }: { focusCount: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function planDay() {
    if (loading || done) return;
    setLoading(true);
    try {
      await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Schedule my hot and today tasks into time blocks for the rest of today.
Current time: ${new Date().toLocaleTimeString()}.
For each task, set scheduledStart and scheduledEnd using the update_task tool to fill open slots from now until 6pm.`,
          }],
        }),
      });
      setDone(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="p-3 flex-shrink-0"
      style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkle size={10} />
        <span className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.bronze }}>
          Auto-schedule
        </span>
      </div>
      <p className="text-[11.5px] leading-relaxed mb-2" style={{ color: tokens.fg1 }}>
        {done
          ? "Day planned! Tasks have been scheduled."
          : focusCount > 0
          ? `Fit ${focusCount} task${focusCount !== 1 ? "s" : ""} into open slots today?`
          : "Your day looks clear — want to pull in upcoming work?"}
      </p>
      <Button
        variant="primary"
        size="sm"
        className="w-full justify-center"
        onClick={planDay}
        disabled={loading || done}
      >
        {loading ? "Planning…" : done ? "✓ Day planned" : "Plan my day"}
      </Button>
    </div>
  );
}

// ── Main DayView ──────────────────────────────────────────────────────────────
type Props = { onViewChange: (v: string) => void };

export function DayView({ onViewChange }: Props) {
  const { tasks } = useAppTasks();
  const { data: meetings = [] } = useMeetings();
  const updateTask = useUpdateTask();

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  const todayMeetings = meetings.filter((m: ApiMeeting) => isToday(new Date(m.startAt)));
  const timelineMeetings = todayMeetings.filter((m: ApiMeeting) => {
    const h = new Date(m.startAt).getHours();
    return h >= START_HOUR && h < 19;
  });

  // Tasks needing time blocked (hot or today, not yet scheduled, not done)
  const focusTasks = tasks.filter(
    t => t.status !== "done" && (t.priority === "hot" || t.bucket === "today") && !(t as any).scheduledStart
  ).slice(0, 6);

  // Tasks already scheduled today — render on timeline
  const scheduledTasks = tasks.filter(t => {
    const s = (t as any).scheduledStart;
    return s && isToday(new Date(s)) && t.status !== "done";
  }) as (Task & { scheduledStart: Date; scheduledEnd: Date })[];

  const openCount = tasks.filter(t => t.status !== "done").length;
  const meetingCount = todayMeetings.length;

  function handleBlockTime(taskId: string, start: Date, end: Date) {
    updateTask.mutate({
      id: taskId,
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      bucket: "today",
    } as any);
  }

  function handleToggleMeetingTask(taskId: string, markDone: boolean) {
    updateTask.mutate({ id: taskId, status: markDone ? "done" : "open" });
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

          {/* Timeline */}
          <div className="flex-1 overflow-auto px-5 py-[18px] pl-2.5">
            <div className="flex items-baseline justify-between mb-3.5 pl-11">
              <div>
                <h1>{todayLabel}</h1>
                <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
                  {meetingCount > 0 ? `${meetingCount} meeting${meetingCount !== 1 ? "s" : ""}` : "No meetings"}
                  {focusTasks.length > 0 ? ` · ${focusTasks.length} need${focusTasks.length === 1 ? "s" : ""} time` : ""}
                  {` · ${openCount} open`}
                </div>
              </div>
            </div>

            <div className="relative">
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="flex items-stretch"
                  style={{ height: ROW_H, borderTop: `1px solid ${tokens.line}` }}
                >
                  <div
                    className="font-mono-do text-[10.5px] text-fg-3 pt-1 text-right pr-2.5"
                    style={{ width: 44 }}
                  >
                    {h} {i < 4 ? "AM" : "PM"}
                  </div>
                  <div className="flex-1 relative" />
                </div>
              ))}

              <NowLine />

              {/* Real meeting blocks */}
              {timelineMeetings.map((m: ApiMeeting) => {
                const start = new Date(m.startAt);
                const end = m.endAt ? new Date(m.endAt) : new Date(start.getTime() + 3600000);
                const hasTasks = m.tasks.some((t: any) => t.status !== "done");
                return (
                  <TimelineBlock
                    key={m.id}
                    top={topPx(start)}
                    height={heightPx(start, end)}
                    title={m.title}
                    meta={`${fmtTime(start)} – ${fmtTime(end)}${m.attendees?.length ? ` · ${m.attendees.length} people` : ""}${hasTasks ? " · tasks pending" : ""}`}
                    tone={m.granolaId ? "granola" : "outlook"}
                    done={end < today && !hasTasks}
                    urgent={hasTasks && end > today}
                  />
                );
              })}

              {/* Scheduled task blocks */}
              {scheduledTasks.map(t => (
                <ScheduledBlock key={t.id} task={t} />
              ))}

              {timelineMeetings.length === 0 && scheduledTasks.length === 0 && (
                <div
                  className="absolute font-mono-do text-[10.5px] text-fg-3"
                  style={{ top: ROW_H * 1.5, left: 54 }}
                >
                  No events today — use "Block time" to schedule tasks
                </div>
              )}
            </div>
          </div>

          {/* ── AI Day Planner rail ── */}
          <div
            className="flex flex-col overflow-hidden flex-shrink-0"
            style={{ width: 280, background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
          >
            <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <div className="flex items-center gap-1.5">
                <Sparkle size={11} />
                <span className="font-semibold text-[13px]">Day Planner</span>
              </div>
              <div className="font-mono-do text-[10px] text-fg-3 mt-0.5 uppercase tracking-[0.06em]">
                AI-suggested focus &amp; prep
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <RailSection label="Needs time blocked" count={focusTasks.length} />
              {focusTasks.length === 0
                ? <EmptyRail label="All tasks scheduled — nice." />
                : focusTasks.map(t => (
                    <FocusTask
                      key={t.id}
                      task={t}
                      onBlock={handleBlockTime}
                    />
                  ))
              }

              <RailSection label="Today's meetings" count={todayMeetings.length} />
              {todayMeetings.length === 0
                ? <EmptyRail label="No meetings today." />
                : todayMeetings.map((m: ApiMeeting) => (
                    <MeetingPrepCard
                      key={m.id}
                      meeting={m}
                      onToggleTask={handleToggleMeetingTask}
                    />
                  ))
              }
            </div>

            <PlanFooter focusCount={focusTasks.length} />
          </div>
        </div>
      </div>
    </div>
  );
}
