"use client";

import { useAppTasks } from "@/hooks/useAppTasks";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { tokens } from "@/lib/tokens";
import type { Task } from "@/types";

type Props = {
  onViewChange: (v: string) => void;
};

export function BoardView({ onViewChange }: Props) {
  const { tasks, toggleTask } = useAppTasks();

  const byBucket = (bucket: Task["bucket"]) => tasks.filter((t) => t.bucket === bucket);
  const done = tasks.filter((t) => t.status === "done");

  const nowTasks = byBucket("now");
  const todayTasks = byBucket("today");
  const weekTasks = byBucket("this_week");

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Board"
        onView={onViewChange}
        right={
          <>
            <Button variant="ghost" size="sm">Filter</Button>
            <Button variant="primary" size="sm">
              <Icons.plus size={12} /> New
            </Button>
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Board" />

        <div className="flex-1 overflow-auto p-[18px]">
          <div className="mb-3.5">
            <h1>Board</h1>
            <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
              Thu 24 Apr · drag to reprioritise
            </div>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)", minHeight: 500 }}>
            <BoardColumn title="Now" color={tokens.oxblood} count={nowTasks.filter(t => t.status === "open").length}>
              {nowTasks.map((t) => (
                <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
              ))}
            </BoardColumn>

            <BoardColumn title="Today" color={tokens.bronze} count={todayTasks.filter(t => t.status === "open").length}>
              {todayTasks.map((t) => (
                <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
              ))}
            </BoardColumn>

            <BoardColumn title="This week" color={tokens.steel} count={weekTasks.filter(t => t.status === "open").length}>
              {weekTasks.map((t) => (
                <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
              ))}
            </BoardColumn>

            <BoardColumn title="Done" color={tokens.forest} count={done.length} muted>
              {done.map((t) => (
                <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} />
              ))}
            </BoardColumn>
          </div>
        </div>
      </div>
    </div>
  );
}
