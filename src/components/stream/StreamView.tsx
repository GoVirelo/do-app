"use client";

import { useState, useRef } from "react";
import { NewTaskModal } from "./NewTaskModal";
import { useAppTasks } from "@/hooks/useAppTasks";
import { useMeetings, useCreateTask } from "@/hooks/useTasks";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar, type SidebarFilter } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { SectionHeader } from "./SectionHeader";
import { TaskRow, SchedulePill } from "./TaskRow";
import { AIRail } from "./AIRail";
import { Avatar } from "@/components/ui/Avatar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { tokens } from "@/lib/tokens";
import type { Task, Source } from "@/types";

type Props = {
  onViewChange: (v: string) => void;
};

export function StreamView({ onViewChange }: Props) {
  const { tasks, toggleTask, skipDraft, sendDraft, triggerSync, isSyncing } = useAppTasks();
  const { data: meetings = [] } = useMeetings();
  const createTask = useCreateTask();
  const qc = useQueryClient();
  const [showNewTask, setShowNewTask] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<SidebarFilter>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAddTask(meetingId: string) {
    const title = newTitle.trim();
    if (!title) { setAddingTo(null); return; }
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, source: "granola", bucket: "inbox", priority: "medium", meetingId }),
    });
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["meetings"] });
    setNewTitle("");
    setAddingTo(null);
  }

  async function handleChangeMeetingSource(meetingId: string, taskIds: string[], source: Source) {
    await Promise.all(taskIds.map(id =>
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      })
    ));
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["meetings"] });
  }

  // Apply sidebar filter
  function applyFilter(t: Task) {
    if (!filter) return true;
    if (filter.type === "source") return t.source === filter.value;
    if (filter.value === "today") return t.bucket === "today";
    if (filter.value === "upcoming") return t.bucket === "this_week";
    if (filter.value === "done") return t.status === "done";
    return true;
  }

  const filteredTasks = tasks.filter(applyFilter);

  // Non-granola tasks go in the flat list
  const otherTasks = filteredTasks.filter((t) => t.source !== "granola");

  // Granola task IDs that belong to a meeting (we show those in meeting cards)
  const meetingTaskIds = new Set(meetings.flatMap((m) => m.tasks.map((t) => t.id)));
  const orphanGranolaTasks = filteredTasks.filter((t) => t.source === "granola" && !meetingTaskIds.has(t.id));

  // Show meeting cards unless a non-granola source filter is active
  const showMeetingCards = !filter || filter.type !== "source" || filter.value === "granola";

  const flatTasks = [...otherTasks, ...orphanGranolaTasks];
  const inboxTasks = flatTasks.filter((t) => t.bucket === "inbox");
  const todayTasks = flatTasks.filter((t) => t.bucket === "today");
  const weekTasks = flatTasks.filter((t) => t.bucket === "this_week");

  const openCount = tasks.filter((t) => t.status === "open").length;
  const replyCount = tasks.filter((t) => t.aiDraft?.state === "proposed").length;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Stream"
        onView={onViewChange}
        onSync={(force) => triggerSync(force)}
        isSyncing={isSyncing}
        right={
          <Button variant="primary" size="sm" onClick={() => setShowNewTask(true)}>
            <Icons.plus size={12} /> New task
          </Button>
        }
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Stream" filter={filter} onFilter={setFilter} />

        <div className="flex-1 min-w-0 overflow-auto" style={{ background: tokens.bg0 }}>
          <div className="px-6 pt-5 pb-3 flex items-baseline justify-between">
            <div>
              <h1>Stream</h1>
              <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
                Thu 24 Apr · {openCount} open · {replyCount} need reply
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm">Group: Priority</Button>
              <Button variant="ghost" size="sm">Sort</Button>
            </div>
          </div>

          {/* Meeting cards — hide when all tasks done or source filter excludes granola */}
          {showMeetingCards && meetings.filter((m) => {
            if (m.tasks.length === 0) return false;
            // Check current status from live tasks state; fall back to DB state
            return m.tasks.some((t) => {
              const live = tasks.find((ut) => ut.id === t.id);
              return (live?.status ?? t.status) !== "done";
            });
          }).map((meeting) => {
            const startTime = new Date(meeting.startAt).toLocaleTimeString("en-AU", {
              hour: "2-digit", minute: "2-digit",
            });
            const endTime = meeting.endAt
              ? new Date(meeting.endAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })
              : null;
            const durationMin = meeting.endAt
              ? Math.round((new Date(meeting.endAt).getTime() - new Date(meeting.startAt).getTime()) / 60000)
              : null;
            const initials = (meeting.attendees as { name: string; email: string }[])
              .slice(0, 5)
              .map((a) => a.name?.[0]?.toUpperCase() ?? "?");

            return (
              <div key={meeting.id} className="px-3.5 mt-3">
                <div
                  className="rounded-r2 p-3.5"
                  style={{
                    background: tokens.bg2,
                    border: `1px solid ${tokens.line}`,
                    borderLeft: `2px solid ${tokens.forest}`,
                  }}
                >
                  {/* Meeting header */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <SourceBadge
                      kind={(meeting.tasks[0] ? (tasks.find(t => t.id === meeting.tasks[0].id)?.source ?? "granola") : "granola")}
                      onChange={(src) => handleChangeMeetingSource(meeting.id, meeting.tasks.map(t => t.id), src)}
                    />
                    <span className="font-mono-do text-[10.5px] text-fg-3 tracking-[0.05em] uppercase">
                      Meeting · {endTime ? `Ended ${endTime}` : startTime}
                      {durationMin ? ` · ${durationMin} min` : ""}
                    </span>
                    <div className="flex-1" />
                  </div>

                  <h2 className="mb-2 text-[14px] font-semibold">{meeting.title}</h2>

                  {initials.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      {initials.map((initial, i) => (
                        <Avatar key={i} initial={initial} size={22} />
                      ))}
                      <span className="text-[11.5px] text-fg-2 ml-1">
                        {(meeting.attendees as any[]).length} attendee{(meeting.attendees as any[]).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Extracted actions */}
                  <div className="border-t border-line pt-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkle size={10} />
                      <span
                        className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.08em]"
                        style={{ color: tokens.bronze }}
                      >
                        Extracted for you · {meeting.tasks.length} action{meeting.tasks.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {meeting.tasks.map((t) => {
                      const live = tasks.find((ut) => ut.id === t.id);
                      const isDone = (live?.status ?? t.status) === "done";
                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-2.5 py-1.5 group transition-all"
                          style={{ opacity: isDone ? 0.4 : 1 }}
                        >
                          <button
                            onClick={() => toggleTask(t.id)}
                            className="flex-shrink-0 w-3.5 h-3.5 rounded border transition-colors"
                            style={{
                              borderColor: isDone ? tokens.bronze : tokens.line,
                              background: isDone ? tokens.bronze : "transparent",
                            }}
                          />
                          <span
                            className="flex-1 transition-all"
                            style={{
                              fontSize: isDone ? "11.5px" : "13px",
                              textDecoration: isDone ? "line-through" : "none",
                              color: isDone ? tokens.fg2 : tokens.fg0,
                            }}
                          >
                            {t.title}
                          </span>
                          {!isDone && live && <SchedulePill task={live} />}
                        </div>
                      );
                    })}

                    {/* Inline add task */}
                    {addingTo === meeting.id ? (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-3 h-3 rounded border border-line flex-shrink-0" />
                        <input
                          ref={inputRef}
                          autoFocus
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTask(meeting.id);
                            if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); }
                          }}
                          onBlur={() => { if (!newTitle.trim()) { setAddingTo(null); } }}
                          placeholder="Add a task…"
                          className="flex-1 bg-transparent text-[13px] text-fg-0 outline-none placeholder:text-fg-3"
                        />
                        <button
                          onClick={() => handleAddTask(meeting.id)}
                          className="text-[11px] text-fg-2 hover:text-fg-0 px-2 py-0.5 rounded border border-line"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingTo(meeting.id); setNewTitle(""); }}
                        className="flex items-center gap-1.5 mt-2 text-[11.5px] text-fg-3 hover:text-fg-1 transition-colors"
                      >
                        <Icons.plus size={11} /> Add task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Flat tasks from other sources */}
          {inboxTasks.length > 0 && (
            <>
              <SectionHeader label="Backlog" color={tokens.fg2} count={inboxTasks.filter(t => t.status === "open").length} />
              {inboxTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => toggleTask(t.id)}
                  onSkipDraft={() => skipDraft(t.id)}
                  onSendDraft={(body) => sendDraft(t.id, body)}
                />
              ))}
            </>
          )}

          {todayTasks.length > 0 && (
            <>
              <SectionHeader label="Today" color={tokens.bronze} count={todayTasks.filter(t => t.status === "open").length} />
              {todayTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => toggleTask(t.id)}
                  onSkipDraft={() => skipDraft(t.id)}
                  onSendDraft={(body) => sendDraft(t.id, body)}
                />
              ))}
            </>
          )}

          {weekTasks.length > 0 && (
            <>
              <SectionHeader label="This week" color={tokens.steel} count={weekTasks.filter(t => t.status === "open").length} />
              {weekTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => toggleTask(t.id)}
                  onSkipDraft={() => skipDraft(t.id)}
                  onSendDraft={(body) => sendDraft(t.id, body)}
                />
              ))}
            </>
          )}

          <div className="px-3.5 py-10 text-center">
            <span className="font-mono-do text-[11px] text-fg-3">— end of stream —</span>
          </div>
        </div>

        <AIRail />
      </div>

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
