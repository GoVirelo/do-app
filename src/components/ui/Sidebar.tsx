"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Icons } from "./Icons";
import { sourceTokens } from "@/lib/tokens";
import type { Source } from "@/types";
import type { ReactNode } from "react";

function SidebarItem({
  icon, label, count, active, dim, onClick,
}: {
  icon: ReactNode; label: string; count?: number;
  active?: boolean; dim?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-[9px] px-2.5 py-1.5 text-[12.5px] rounded-r2 border transition-colors text-left",
        active ? "bg-bg-3 border-line-2 text-fg-0 font-medium"
          : dim ? "border-transparent text-fg-3 hover:bg-bg-2"
          : "border-transparent text-fg-1 hover:bg-bg-2"
      )}
    >
      <span className={cn("flex", active ? "text-bronze" : "")}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>
      )}
    </button>
  );
}

function SidebarSection({
  label, collapsed, onToggle, children,
}: {
  label: string; collapsed: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1 font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em] px-2.5 pt-3.5 pb-1.5 hover:text-fg-1 transition-colors"
      >
        <span className="flex-1 text-left">{label}</span>
        <span className="text-[9px]">{collapsed ? "▶" : "▼"}</span>
      </button>
      {!collapsed && children}
    </>
  );
}

function SidebarSource({ kind, label, count, active, onClick }: { kind: Source; label: string; count: number; active?: boolean; onClick?: () => void }) {
  const src = sourceTokens[kind];
  return (
    <button
      onClick={onClick}
      className={cn("w-full flex items-center gap-[9px] px-2.5 py-[5px] text-[12.5px] rounded-r2 transition-colors border",
        active ? "bg-bg-3 border-line-2 text-fg-0 font-medium" : "border-transparent text-fg-1 hover:bg-bg-2"
      )}
    >
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: src.fg }} />
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>}
    </button>
  );
}

export type SidebarFilter = { type: "bucket" | "source"; value: string } | null;

type Props = {
  activeItem?: string;
  filter?: SidebarFilter;
  onFilter?: (f: SidebarFilter) => void;
};

export function Sidebar({ activeItem = "Stream", filter, onFilter }: Props) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [viewsCollapsed, setViewsCollapsed] = useState(false);

  function toggle(type: "bucket" | "source", value: string) {
    if (filter?.type === type && filter.value === value) onFilter?.(null);
    else onFilter?.({ type, value });
  }

  // Fetch open tasks for counts
  const { data: openTasks = [] } = useQuery({
    queryKey: ["tasks", undefined],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) return [];
      return res.json() as Promise<{ bucket: string; source: string; status: string }[]>;
    },
  });

  // Fetch done count separately
  const { data: doneTasks = [] } = useQuery({
    queryKey: ["tasks", { status: "done" }],
    queryFn: async () => {
      const res = await fetch("/api/tasks?status=done");
      if (!res.ok) return [];
      return res.json() as Promise<{ status: string }[]>;
    },
  });

  const counts = {
    stream: openTasks.length,
    today: openTasks.filter(t => t.bucket === "inbox" || t.bucket === "today").length,
    upcoming: openTasks.filter(t => t.bucket === "upcoming" || t.bucket === "waiting").length,
    done: doneTasks.length,
    granola: openTasks.filter(t => t.source === "granola").length,
    slack: openTasks.filter(t => t.source === "slack").length,
    outlook: openTasks.filter(t => t.source === "outlook").length,
    personal: openTasks.filter(t => t.source === "manual").length,
  };

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-3.5 gap-4 flex-shrink-0 border-r border-line"
        style={{ width: 44, background: "var(--bg-1)" }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="text-fg-3 hover:text-fg-1 transition-colors"
          title="Expand nav"
        >
          <Icons.flash size={14} />
        </button>
        <div className="flex-1" />
        <button onClick={() => router.push("/connections")} className="text-fg-3 hover:text-fg-1 transition-colors" title="Connections">
          <Icons.flash size={13} />
        </button>
        <button onClick={() => router.push("/settings")} className="text-fg-3 hover:text-fg-1 transition-colors" title="Settings">
          <Icons.settings size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[200px] bg-bg-1 border-r border-line px-2.5 py-3.5 flex flex-col gap-0.5 overflow-auto flex-shrink-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em] px-2.5">Nav</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-fg-3 hover:text-fg-1 transition-colors px-2"
          title="Collapse"
        >
          ‹
        </button>
      </div>

      <SidebarItem icon={<Icons.flash />} label="Stream" count={counts.stream} active={activeItem === "Stream" && !filter} onClick={() => onFilter?.(null)} />
      <SidebarItem icon={<Icons.today />} label="Today" count={counts.today} active={filter?.type === "bucket" && filter.value === "today"} onClick={() => toggle("bucket", "today")} />
      <SidebarItem icon={<Icons.cal />} label="Upcoming" count={counts.upcoming} active={filter?.type === "bucket" && filter.value === "upcoming"} onClick={() => toggle("bucket", "upcoming")} />
      <SidebarItem icon={<Icons.done />} label="Done" count={counts.done || undefined} active={filter?.type === "bucket" && filter.value === "done"} dim onClick={() => toggle("bucket", "done")} />

      <SidebarSection label="Sources" collapsed={sourcesCollapsed} onToggle={() => setSourcesCollapsed(v => !v)}>
        <SidebarSource kind="granola" label="Granola" count={counts.granola} active={filter?.type === "source" && filter.value === "granola"} onClick={() => toggle("source", "granola")} />
        <SidebarSource kind="slack" label="Slack" count={counts.slack} active={filter?.type === "source" && filter.value === "slack"} onClick={() => toggle("source", "slack")} />
        <SidebarSource kind="outlook" label="Outlook" count={counts.outlook} active={filter?.type === "source" && filter.value === "outlook"} onClick={() => toggle("source", "outlook")} />
        <SidebarSource kind="personal" label="Personal" count={counts.personal} active={filter?.type === "source" && filter.value === "manual"} onClick={() => toggle("source", "manual")} />
      </SidebarSection>

      <SidebarSection label="Views" collapsed={viewsCollapsed} onToggle={() => setViewsCollapsed(v => !v)}>
        <SidebarItem icon={<Icons.user />} label="Delegated" />
        <SidebarItem icon={<Icons.meet />} label="From meetings" />
      </SidebarSection>

      <div className="flex-1" />

      <button
        onClick={() => router.push("/connections")}
        className={cn("flex items-center gap-2 px-2 py-2 text-[11.5px] transition-colors",
          activeItem === "Connections" ? "text-bronze" : "text-fg-2 hover:text-fg-1")}
      >
        <Icons.flash size={14} /><span>Connections</span>
      </button>
      <button
        onClick={() => router.push("/settings")}
        className={cn("flex items-center gap-2 px-2 py-2 text-[11.5px] transition-colors",
          activeItem === "Settings" ? "text-bronze" : "text-fg-2 hover:text-fg-1")}
      >
        <Icons.settings /><span>Settings</span>
      </button>
    </div>
  );
}
