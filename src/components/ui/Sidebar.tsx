"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "./Icons";
import { sourceTokens } from "@/lib/tokens";
import type { Source } from "@/types";
import type { ReactNode } from "react";

function SidebarItem({
  icon,
  label,
  count,
  active,
  dim,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  dim?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-[9px] px-2.5 py-1.5 text-[12.5px] rounded-r2 border transition-colors text-left",
        active
          ? "bg-bg-3 border-line-2 text-fg-0 font-medium"
          : dim
          ? "border-transparent text-fg-3 hover:bg-bg-2"
          : "border-transparent text-fg-1 hover:bg-bg-2"
      )}
    >
      <span className={cn("flex", active ? "text-bronze" : "")}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>
      )}
    </button>
  );
}

function SidebarHeader({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em] px-2.5 pt-3.5 pb-1.5">
      {children}
    </div>
  );
}

function SidebarSource({
  kind,
  label,
  count,
}: {
  kind: Source;
  label: string;
  count: number;
}) {
  const src = sourceTokens[kind];
  return (
    <div className="flex items-center gap-[9px] px-2.5 py-[5px] text-[12.5px] text-fg-1 cursor-pointer rounded-r2 hover:bg-bg-2">
      <span
        className="w-[7px] h-[7px] rounded-full flex-shrink-0"
        style={{ background: src.fg }}
      />
      <span className="flex-1">{label}</span>
      <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>
    </div>
  );
}

type Props = {
  activeItem?: string;
};

export function Sidebar({ activeItem = "Stream" }: Props) {
  const router = useRouter();
  return (
    <div className="w-[200px] bg-bg-1 border-r border-line px-2.5 py-3.5 flex flex-col gap-0.5 overflow-auto flex-shrink-0">
      <SidebarItem icon={<Icons.flash />} label="Stream" count={23} active={activeItem === "Stream"} />
      <SidebarItem icon={<Icons.today />} label="Today" count={7} />
      <SidebarItem icon={<Icons.cal />} label="Upcoming" count={14} />
      <SidebarItem icon={<Icons.done />} label="Done" dim />

      <SidebarHeader>Sources</SidebarHeader>
      <SidebarSource kind="granola" label="Granola" count={12} />
      <SidebarSource kind="slack" label="Slack" count={7} />
      <SidebarSource kind="outlook" label="Outlook" count={4} />
      <SidebarSource kind="personal" label="Personal" count={5} />

      <SidebarHeader>Views</SidebarHeader>
      <SidebarItem icon={<Icons.user />} label="Delegated" />
      <SidebarItem icon={<Icons.meet />} label="From meetings" />

      <div className="flex-1" />

      <button
        onClick={() => router.push("/connections")}
        className={cn(
          "flex items-center gap-2 px-2 py-2 text-[11.5px] transition-colors",
          activeItem === "Connections" ? "text-bronze" : "text-fg-2 hover:text-fg-1"
        )}
      >
        <Icons.flash size={14} />
        <span>Connections</span>
      </button>
      <button
        onClick={() => router.push("/settings")}
        className={cn(
          "flex items-center gap-2 px-2 py-2 text-[11.5px] transition-colors",
          activeItem === "Settings" ? "text-bronze" : "text-fg-2 hover:text-fg-1"
        )}
      >
        <Icons.settings />
        <span>Settings</span>
      </button>
    </div>
  );
}
