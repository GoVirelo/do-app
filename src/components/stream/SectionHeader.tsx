import { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { getDraggingTaskId } from "./TaskRow";

type Props = {
  label: string;
  color: string;
  count: number;
  onAdd?: () => void;
  onDropTask?: (taskId: string) => void;
};

export function SectionHeader({ label, color, count, onAdd, onDropTask }: Props) {
  const [over, setOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    if (!onDropTask) return;
    e.preventDefault();
    setOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear when cursor truly leaves this element (not just a child)
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    const taskId = getDraggingTaskId() || e.dataTransfer.getData("text/plain");
    if (taskId && onDropTask) onDropTask(taskId);
  }

  return (
    <div
      className="flex items-center gap-2.5 px-6 pt-[18px] pb-3 border-b border-line transition-colors"
      style={{ background: over ? `${color}14` : "transparent" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="font-mono-do text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: over ? color : undefined }}>
        {label}
      </span>
      <span className="font-mono-do text-[11px] text-fg-3">{count}</span>
      {over && <span className="font-mono-do text-[10px]" style={{ color }}>drop to move here</span>}
      <div className="flex-1" />
      <Button variant="ghost" size="xs" onClick={onAdd}>
        <Icons.plus size={10} />
      </Button>
    </div>
  );
}
