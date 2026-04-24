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
};

export function TopBar({ view, onView, right }: Props) {
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
      <Avatar initial="M" size={24} />
    </div>
  );
}
