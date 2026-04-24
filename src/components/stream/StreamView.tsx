"use client";

import { useTasksStore } from "@/store/tasks";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { SectionHeader } from "./SectionHeader";
import { TaskRow } from "./TaskRow";
import { MeetingCard } from "./MeetingCard";
import { AIRail } from "./AIRail";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Props = {
  onViewChange: (v: string) => void;
};

export function StreamView({ onViewChange }: Props) {
  const { tasks, meeting, toggleTask, skipDraft, sendDraft } = useTasksStore();

  const byBucket = (bucket: Task["bucket"]) =>
    tasks.filter((t) => t.bucket === bucket);

  const nowTasks = byBucket("now");
  const todayTasks = byBucket("today");
  const weekTasks = byBucket("this_week");

  const openCount = tasks.filter((t) => t.status === "open").length;
  const replyCount = tasks.filter((t) => t.aiDraft?.state === "proposed").length;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Stream"
        onView={onViewChange}
        right={
          <>
            <Button variant="ghost" size="sm">Filter</Button>
            <Button variant="primary" size="sm">
              <Icons.plus size={12} /> New task
            </Button>
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Stream" />

        {/* Main stream */}
        <div className="flex-1 min-w-0 overflow-auto" style={{ background: tokens.bg0 }}>
          {/* Page header */}
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

          {/* NOW */}
          <SectionHeader label="Now" color={tokens.oxblood} count={nowTasks.filter(t => t.status === "open").length} />
          {nowTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onSkipDraft={() => skipDraft(t.id)}
              onSendDraft={() => sendDraft(t.id)}
            />
          ))}

          {/* Meeting card */}
          {meeting && (
            <div className="px-3.5 mt-2">
              <MeetingCard meeting={meeting} />
            </div>
          )}

          {/* TODAY */}
          <SectionHeader label="Today" color={tokens.bronze} count={todayTasks.filter(t => t.status === "open").length} />
          {todayTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onSkipDraft={() => skipDraft(t.id)}
              onSendDraft={() => sendDraft(t.id)}
            />
          ))}

          {/* THIS WEEK */}
          <SectionHeader label="This week" color={tokens.steel} count={weekTasks.filter(t => t.status === "open").length} />
          {weekTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggleTask(t.id)}
              onSkipDraft={() => skipDraft(t.id)}
              onSendDraft={() => sendDraft(t.id)}
            />
          ))}

          <div className="px-3.5 py-10 text-center">
            <span className="font-mono-do text-[11px] text-fg-3">— end of stream —</span>
          </div>
        </div>

        <AIRail />
      </div>
    </div>
  );
}
