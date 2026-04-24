"use client";

import { PriorityBar } from "@/components/ui/PriorityBar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { tokens } from "@/lib/tokens";
import type { InboxItem } from "./inbox-data";

type Props = {
  item: InboxItem;
  active: boolean;
  onClick: () => void;
};

export function InboxRow({ item, active, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex gap-2.5 px-3.5 py-3 cursor-pointer transition-colors"
      style={{
        borderBottom: `1px solid ${tokens.line}`,
        borderLeft: `2px solid ${active ? tokens.bronze : "transparent"}`,
        background: active ? tokens.bg2 : "transparent",
      }}
    >
      <PriorityBar level={item.priority ?? "normal"} className="mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <SourceBadge kind={item.src} />
          <span className="text-[11.5px] font-medium text-fg-2 truncate flex-1">{item.from}</span>
          <span className="font-mono-do text-[10.5px] text-fg-3 flex-shrink-0">{item.time}</span>
        </div>
        <div className="text-[13px] font-medium text-fg-0 truncate mb-0.5">{item.title}</div>
        <div className="text-[11.5px] text-fg-2 truncate">{item.preview}</div>
      </div>
    </div>
  );
}
