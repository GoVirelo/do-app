"use client";

import { useState } from "react";
import { Icons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

function SidebarItem({
  icon, label, count, active, dim,
}: {
  icon: React.ReactNode; label: string; count?: number; active?: boolean; dim?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-[9px] px-2.5 py-1.5 text-[12.5px] rounded-r2 border cursor-pointer",
      active ? "bg-bg-3 border-line-2 text-fg-0 font-medium"
             : dim ? "border-transparent text-fg-3"
             : "border-transparent text-fg-1 hover:bg-bg-2",
    )}>
      <span className={cn("flex", active && "text-bronze")}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>
      )}
    </div>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em] px-2.5 pt-3.5 pb-1.5">
      {children}
    </div>
  );
}

function LayerToggle({ color, label, defaultOn = false }: { color: string; label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="flex items-center gap-[9px] px-2.5 py-[5px] text-[12px] w-full rounded-r2 hover:bg-bg-2 transition-colors"
    >
      <span
        className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0 transition-colors"
        style={{
          background: on ? color : "transparent",
          border: `1.5px solid ${on ? color : tokens.line2}`,
        }}
      />
      <span style={{ color: on ? tokens.fg0 : tokens.fg2 }}>{label}</span>
    </button>
  );
}

export function DaySidebar() {
  return (
    <div className="w-[200px] bg-bg-1 border-r border-line px-2.5 py-3.5 flex flex-col gap-0.5 overflow-auto flex-shrink-0">
      <SidebarItem icon={<Icons.flash />} label="Stream" count={23} />
      <SidebarItem icon={<Icons.today />} label="Day" count={7} active />
      <SidebarItem icon={<Icons.cal />} label="Board" />

      <SidebarHeader>Layers</SidebarHeader>
      <LayerToggle color={tokens.steel}  label="Outlook calendar" defaultOn />
      <LayerToggle color={tokens.amber}  label="Granola meetings" defaultOn />
      <LayerToggle color={tokens.bronze} label="Task slots"       defaultOn />
      <LayerToggle color={tokens.plum}   label="Slack focus" />

      <div className="flex-1" />
      <button className="flex items-center gap-2 px-2 py-2.5 text-[11.5px] text-fg-2 hover:text-fg-1 transition-colors">
        <Icons.settings />
        <span>Connections</span>
      </button>
    </div>
  );
}
