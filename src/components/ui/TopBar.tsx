"use client";

import type { ReactNode } from "react";

import { Avatar } from "./Avatar";
import { Kbd } from "./Kbd";
import { Icons } from "./Icons";
import { cn } from "@/lib/utils";

type View = "Stream" | "Board" | "Day" | "Personal";
const VIEWS: View[] = ["Stream", "Board", "Day", "Personal"];

type Props = {
  view: View;
  onView?: (v: View) => void;
  right?: ReactNode;
  onSync?: (force?: boolean) => void;
  isSyncing?: boolean;
};

export function TopBar({ view, onView, right, onSync, isSyncing }: Props) {

  return (
    <div className="h-11 flex items-center gap-3 px-4 border-b border-line bg-bg-1 flex-shrink-0">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2">
        <div
          className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center text-[11px] font-bold text-[#1a1108]"
          style={{ background: "linear-gradient(135deg, #c8893f, #8a5a1e)" }}
        >
          d.
        </div>
        <span className="font-display text-[14px] font-semibold tracking-[-0.01em]">do.</span>
      </div>

      {/* View tabs */}
      <div className="flex gap-0.5 bg-bg-2 border border-line rounded-r2 p-0.5 ml-2">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => onView?.(v)}
            className={cn(
              "h-6 px-2.5 text-[11.5px] font-medium rounded-r1 border-none transition-colors duration-100",
              view === v
                ? "bg-bg-4 text-fg-0"
                : "bg-transparent text-fg-2 hover:text-fg-1"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-[340px] mx-2">
        <div className="flex items-center gap-2 h-7 px-2.5 bg-bg-2 border border-line rounded-r2 text-fg-3 text-[12px]">
          <Icons.search size={12} />
          <span className="flex-1">Search or ask…</span>
          <Kbd>⌘K</Kbd>
        </div>
      </div>

      <div className="flex-1" />
      {right}
      <button
        onClick={(e) => onSync?.(e.shiftKey)}
        disabled={isSyncing}
        title="Sync  |  Shift+click to re-analyse all meetings"
        className={cn(
          "flex items-center gap-1.5 h-6 px-2.5 text-[11px] rounded-r2 border transition-colors",
          isSyncing
            ? "border-line text-fg-3 cursor-not-allowed"
            : "border-line text-fg-2 hover:text-fg-1 hover:bg-bg-2"
        )}
      >
        <Icons.flash size={11} className={isSyncing ? "animate-spin" : ""} />
        {isSyncing ? "Syncing…" : "Sync"}
      </button>
      <Avatar initial="M" size={24} />
    </div>
  );
}
