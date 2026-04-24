import { Icons } from "@/components/ui/Icons";
import { sourceTokens } from "@/lib/tokens";
import type { Source } from "@/types";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function Item({ icon, label, count, active, dim }: { icon: ReactNode; label: string; count?: number; active?: boolean; dim?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-[9px] px-2.5 py-1.5 text-[12.5px] rounded-r2 border cursor-pointer",
      active ? "bg-bg-3 border-line-2 text-fg-0 font-medium"
             : dim  ? "border-transparent text-fg-3"
             : "border-transparent text-fg-1 hover:bg-bg-2",
    )}>
      <span className={cn("flex", active && "text-bronze")}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>}
    </div>
  );
}

function SidebarHeader({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono-do text-[10px] text-fg-3 uppercase tracking-[0.08em] px-2.5 pt-3.5 pb-1.5">
      {children}
    </div>
  );
}

function SourceRow({ kind, label, count }: { kind: Source; label: string; count: number }) {
  const src = sourceTokens[kind];
  return (
    <div className="flex items-center gap-[9px] px-2.5 py-[5px] text-[12.5px] text-fg-1 cursor-pointer rounded-r2 hover:bg-bg-2">
      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: src.fg }} />
      <span className="flex-1">{label}</span>
      <span className="font-mono-do text-[10.5px] text-fg-3">{count}</span>
    </div>
  );
}

export function TriageSidebar() {
  return (
    <div className="w-[180px] bg-bg-1 border-r border-line px-2.5 py-3.5 flex flex-col gap-0.5 flex-shrink-0 overflow-auto">
      <Item icon={<Icons.inbox />} label="Inbox"       count={23} active />
      <Item icon={<Icons.flash />} label="Needs reply" count={5} />
      <Item icon={<Icons.today />} label="Scheduled"   count={7} />
      <Item icon={<Icons.done />}  label="Archived"    dim />

      <SidebarHeader>Sources</SidebarHeader>
      <SourceRow kind="granola"  label="Granola"  count={12} />
      <SourceRow kind="slack"    label="Slack"    count={7}  />
      <SourceRow kind="outlook"  label="Outlook"  count={4}  />
      <SourceRow kind="personal" label="Personal" count={5}  />

      <div className="flex-1" />
      <div className="flex items-center gap-2 px-2 py-2.5 text-[11.5px] text-fg-2 hover:text-fg-1 cursor-pointer transition-colors">
        <Icons.settings />
        <span>Connections</span>
      </div>
    </div>
  );
}
