"use client";

import { useState } from "react";
import { StatusBar } from "./StatusBar";
import { FilterPills } from "./FilterPills";
import { MobileMeetingCard } from "./MobileMeetingCard";
import { MobileTask } from "./MobileTask";
import { Sparkle } from "@/components/ui/Sparkle";
import { Avatar } from "@/components/ui/Avatar";
import { Icons } from "@/components/ui/Icons";
import { tokens } from "@/lib/tokens";
import type { ReactNode } from "react";

function MobileSection({ label, color, children }: { label: string; color: string; children: ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-2 px-1.5 pt-3.5 pb-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-mono-do text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-1">
          {label}
        </span>
      </div>
      {children}
    </>
  );
}

function BottomNav() {
  const [active, setActive] = useState("Stream");
  const items = [
    { label: "Stream", icon: <Icons.flash size={16} /> },
    { label: "Day",    icon: <Icons.today size={16} /> },
    { label: "Assistant", icon: <Sparkle size={16} /> },
    { label: "Me",     icon: <Icons.user size={16} /> },
  ];
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[84px] flex items-start justify-around pt-2.5 flex-shrink-0"
      style={{ background: tokens.bg1, borderTop: `1px solid ${tokens.line}` }}
    >
      {items.map(({ label, icon }) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          className="flex flex-col items-center gap-1 transition-colors"
          style={{ color: active === label ? tokens.bronze : tokens.fg3 }}
        >
          {icon}
          <span className="text-[10px] font-medium tracking-[0.02em]">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function MobileView() {
  return (
    <div
      className="flex flex-col overflow-hidden relative"
      style={{
        width: 390,
        height: 844,
        background: tokens.bg0,
        color: tokens.fg0,
        borderRadius: 36,
        border: `1px solid ${tokens.line2}`,
      }}
    >
      <StatusBar />

      {/* App header */}
      <div className="px-5 pt-2 pb-3.5 flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="font-display text-[22px] font-semibold tracking-[-0.02em]"
          >
            do.
          </span>
          <div className="flex gap-2.5 items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: tokens.bg2, border: `1px solid ${tokens.line}` }}
            >
              <Sparkle size={14} />
            </div>
            <Avatar initial="M" size={32} />
          </div>
        </div>
        <div className="font-mono-do text-[10.5px] text-fg-3 uppercase tracking-[0.08em] mb-1">
          Thu 24 Apr · 23 open
        </div>
        <h1 style={{ fontSize: 28 }}>3 need reply</h1>
      </div>

      <FilterPills />

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-3.5 pb-[100px]">
        <MobileMeetingCard />

        <MobileSection label="Now" color={tokens.oxblood}>
          <MobileTask
            priority="hot"
            src="slack"
            title="Reply to Sara — Q2 budget"
            meta="2h ago · before 3pm"
            defaultExpanded
            draft="Hi Sara — here's Q2: Revenue $1.2M (+18% QoQ), margin 34%. Full deck attached. Ping if you need raw figures before 3."
          />
          <MobileTask
            priority="hot"
            src="outlook"
            title="Send design deck to Marcus"
            meta="Due 5:00 PM"
          />
        </MobileSection>

        <MobileSection label="Today" color={tokens.bronze}>
          <MobileTask src="granola" title="Confirm launch date"   meta="Product sync · 11:32" />
          <MobileTask src="granola" title="Review API spec §3"    meta="Product sync · 11:32" />
          <MobileTask src="slack"   title="Review PR #842"        meta="from Jen · #eng" />
          <MobileTask src="outlook" title="Approve Q1 expenses"   meta="HR · 1 day" />
        </MobileSection>
      </div>

      {/* FAB */}
      <div className="absolute" style={{ bottom: 100, right: 20 }}>
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center text-[#1a1108]"
          style={{
            background: `linear-gradient(135deg, ${tokens.bronze}, #8a5a1e)`,
            boxShadow: "0 6px 20px rgba(200,137,63,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Icons.plus size={22} />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
