"use client";

import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { PriorityBar } from "@/components/ui/PriorityBar";
import { DaySidebar } from "./DaySidebar";
import { NowLine } from "./NowLine";
import { TimelineBlock } from "./TimelineBlock";
import { tokens } from "@/lib/tokens";
import { useAppTasks } from "@/hooks/useAppTasks";
import { useMeetings } from "@/hooks/useTasks";
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

// AI hint for a task that needs time blocked
function aiHint(task: Task): string {
  if (task.source === "slack")   return "Reply needed";
  if (task.source === "granola") return "Meeting follow-up";
  if (task.source === "outlook") return "Deadline";
  if (task.priority === "hot")   return "High priority";
  return "Schedule today";
}

// ── Right-rail section header ────────────────────────────────────────────────
function RailSection({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-4 pb-1.5">
      <span
        className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: tokens.fg3 }}
      >
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="font-mono-do text-[10px]" style={{ color: tokens.fg3 }}>{count}</span>
      )}
    </div>
  );
}

// ── A task that needs focus time ──────────────────────────────────────────────
function FocusTask({ task }: { task: Task }) {
  return (
    <div
      className="mx-2 mb-1 px-2.5 py-2 rounded-r2 flex gap-2 items-start cursor-default hover:bg-bg-2 transition-colors"
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
      <div
        className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9.5px] font-mono-do font-semibold"
        style={{ background: tokens.bronzeSoft, color: tokens.bronze, border: `1px solid ${tokens.bronzeLine}` }}
      >
        Block time
      </div>
    </div>
  );
}

// ── A meeting in the prep section ─────────────────────────────────────────────
function MeetingPrepCard({ meeting }: { meeting: ApiMeeting }) {
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
        opacity: isPast ? 0.65 : 1,
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
          <div
            className="flex-shrink-0 px-1.5 py-0.5 rounded font-mono-do text-[9.5px] font-semibold"
            style={{ background: tokens.bronzeSoft, color: tokens.bronze, border: `1px solid ${tokens.bronzeLine}` }}
          >
            {openTasks.length} open
          </div>
        )}
      </div>
      {openTasks.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {openTasks.slice(0, 2).map((t: any) => (
            <div key={t.id} className="text-[11px] text-fg-2 truncate pl-0.5">
              · {t.title}
            </div>
          ))}
          {openTasks.length > 2 && (
            <div className="text-[11px]" style={{ color: tokens.fg3 }}>
              +{openTasks.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyRail({ label }: { label: string }) {
  return (
    <div className="mx-2 mb-1 px-2.5 py-2 text-[11.5px]" style={{ color: tokens.fg3 }}>
      {label}
    </div>
  );
}

type Props = { onViewChange: (v: string) => void };

export function DayView({ onViewChange }: Props) {
  const { tasks } = useAppTasks();
  const { data: meetings = [] } = useMeetings();

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });

  // Today's meetings (within visible hours)
  const todayMeetings = meetings.filter((m: ApiMeeting) => isToday(new Date(m.startAt)));

  // Meetings happening in visible range (8–7pm) for the timeline
  const timelineMeetings = todayMeetings.filter((m: ApiMeeting) => {
    const h = new Date(m.startAt).getHours();
    return h >= START_HOUR && h < 19;
  });

  // Tasks that need time blocked today
  const focusTasks = tasks.filter(
    t => t.status !== "done" && (t.priority === "hot" || t.bucket === "today")
  ).slice(0, 6);

  // Open task count
  const openCount = tasks.filter(t => t.status !== "done").length;
  const meetingCount = todayMeetings.length;
  const focusCount = focusTasks.length;

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

        {/* Timeline + right rail */}
        <div className="flex flex-1 min-w-0 overflow-hidden">

          {/* Timeline scroll area */}
          <div className="flex-1 overflow-auto px-5 py-[18px] pl-2.5">
            <div className="flex items-baseline justify-between mb-3.5 pl-11">
              <div>
                <h1>{todayLabel}</h1>
                <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
                  {meetingCount > 0 ? `${meetingCount} meeting${meetingCount !== 1 ? "s" : ""}` : "No meetings"}
                  {focusCount > 0 ? ` · ${focusCount} task${focusCount !== 1 ? "s" : ""} need time` : ""}
                  {` · ${openCount} open`}
                </div>
              </div>
            </div>

            {/* Hour grid */}
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

              {/* Live now line */}
              <NowLine />

              {/* Real meeting blocks */}
              {timelineMeetings.map((m: ApiMeeting) => {
                const start = new Date(m.startAt);
                const end = m.endAt ? new Date(m.endAt) : new Date(start.getTime() + 3600000);
                const t = topPx(start);
                const h = heightPx(start, end);
                const isPast = end < today;
                const hasTasks = m.tasks.some((t: any) => t.status !== "done");
                return (
                  <TimelineBlock
                    key={m.id}
                    top={t}
                    height={h}
                    title={m.title}
                    meta={`${fmtTime(start)} – ${fmtTime(end)}${m.attendees?.length ? ` · ${m.attendees.length} attendees` : ""}${hasTasks ? " · tasks pending" : ""}`}
                    tone={m.granolaId ? "granola" : "outlook"}
                    done={isPast && !hasTasks}
                    urgent={hasTasks && !isPast}
                  />
                );
              })}

              {/* Fallback placeholder when no meetings today */}
              {timelineMeetings.length === 0 && (
                <div
                  className="absolute font-mono-do text-[10.5px] text-fg-3"
                  style={{ top: ROW_H * 1.5, left: 54 }}
                >
                  No meetings scheduled today
                </div>
              )}
            </div>
          </div>

          {/* ── AI Day Planner rail ─────────────────────────────── */}
          <div
            className="flex flex-col overflow-hidden flex-shrink-0"
            style={{ width: 280, background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
          >
            {/* Rail header */}
            <div className="px-3 py-3" style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <div className="flex items-center gap-1.5">
                <Sparkle size={11} />
                <span className="font-semibold text-[13px]">Day Planner</span>
              </div>
              <div className="font-mono-do text-[10px] text-fg-3 mt-0.5 uppercase tracking-[0.06em]">
                AI-suggested focus &amp; prep
              </div>
            </div>

            <div className="flex-1 overflow-auto">

              {/* Section 1: Needs time blocked */}
              <RailSection label="Needs time blocked" count={focusTasks.length} />

              {focusTasks.length === 0 ? (
                <EmptyRail label="All tasks scheduled — nice." />
              ) : (
                focusTasks.map(t => <FocusTask key={t.id} task={t} />)
              )}

              {/* Section 2: Today's meetings */}
              <RailSection label="Today's meetings" count={todayMeetings.length} />

              {todayMeetings.length === 0 ? (
                <EmptyRail label="No meetings today." />
              ) : (
                todayMeetings.map((m: ApiMeeting) => (
                  <MeetingPrepCard key={m.id} meeting={m} />
                ))
              )}
            </div>

            {/* Plan footer */}
            <div
              className="p-3 flex-shrink-0"
              style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkle size={10} />
                <span
                  className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: tokens.bronze }}
                >
                  Auto-schedule
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed mb-2" style={{ color: tokens.fg1 }}>
                {focusTasks.length > 0
                  ? `Fit ${focusTasks.length} task${focusTasks.length !== 1 ? "s" : ""} into open slots today?`
                  : "Your day looks clear — want to pull in upcoming work?"}
              </p>
              <Button variant="primary" size="sm" className="w-full justify-center">
                Plan my day
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
