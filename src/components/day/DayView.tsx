"use client";

import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { DaySidebar } from "./DaySidebar";
import { NowLine } from "./NowLine";
import { TimelineBlock } from "./TimelineBlock";
import { MiniTask } from "./MiniTask";
import { tokens } from "@/lib/tokens";

const HOURS = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6"];
const ROW_H = 56; // px per hour

// Position helpers: minutes from 8:00 AM
function mins(h: number, m: number) {
  return (h - 8) * 60 + m;
}
function top(h: number, m = 0) {
  return (mins(h, m) / 60) * ROW_H;
}
function height(durationMins: number) {
  return (durationMins / 60) * ROW_H;
}

// NOW line: 10:24 AM
const NOW_TOP = top(10, 24);

type Props = { onViewChange: (v: string) => void };

export function DayView({ onViewChange }: Props) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Day"
        onView={onViewChange}
        right={
          <>
            <Button variant="ghost" size="sm">‹ Wed</Button>
            <Button variant="secondary" size="sm">Thu 24</Button>
            <Button variant="ghost" size="sm">Fri ›</Button>
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <DaySidebar />

        {/* Timeline + task rail */}
        <div className="flex flex-1 min-w-0 overflow-hidden">

          {/* Timeline scroll area */}
          <div className="flex-1 overflow-auto px-5 py-[18px] pl-2.5">
            <div className="flex items-baseline justify-between mb-3.5 pl-11">
              <div>
                <h1>Thursday, 24 April</h1>
                <div className="font-mono-do text-[11.5px] text-fg-2 mt-1">
                  3 meetings · 4 task slots · 2h deep work
                </div>
              </div>
            </div>

            {/* Hour grid */}
            <div className="relative">
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="flex items-stretch"
                  style={{ height: ROW_H, borderTop: `1px solid ${tokens.line}` }}
                >
                  <div
                    className="font-mono-do text-[10.5px] text-fg-3 pt-1 text-right pr-2.5"
                    style={{ width: 44 }}
                  >
                    {h} {i < 4 ? "AM" : "PM"}
                  </div>
                  <div className="flex-1 relative" />
                </div>
              ))}

              {/* Now line */}
              <NowLine top={NOW_TOP} />

              {/* Event blocks */}
              <TimelineBlock
                top={top(8)}         height={height(60)}
                title="Standup"      meta="8:00 – 9:00"
                tone="outlook"
              />
              <TimelineBlock
                top={top(11)}        height={height(48)}
                title="Product sync (done)"
                meta="11:00 – 11:48 · 2 actions extracted"
                tone="granola"       done
              />
              <TimelineBlock
                top={top(12, 10)}    height={height(80)}
                title="Focus — Deck work"
                meta="12:10 – 1:30 · suggested"
                tone="focus"         dashed
              />
              <TimelineBlock
                top={top(15)}        height={height(45)}
                title="Leadership sync"
                meta="3:00 – 3:45 · reply to Sara first"
                tone="outlook"       urgent
              />
              <TimelineBlock
                top={top(16, 30)}    height={height(30)}
                title="Send design deck"
                meta="Task slot · 4:30 – 5:00"
                tone="task"          dashed
              />
            </div>
          </div>

          {/* Today's task rail */}
          <div
            className="flex flex-col overflow-hidden flex-shrink-0"
            style={{ width: 280, background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
          >
            <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${tokens.line}` }}>
              <h3>Today's list</h3>
              <div className="font-mono-do text-[10.5px] text-fg-3 mt-0.5 tracking-[0.04em]">
                DRAG ONTO TIMELINE TO SCHEDULE
              </div>
            </div>

            <div className="flex-1 overflow-auto p-1">
              <MiniTask priority="hot" src="slack"    title="Reply to Sara — Q2"    meta="before 3pm"   draft />
              <MiniTask priority="hot" src="outlook"  title="Send design deck"      meta="due 5pm"      scheduled="4:30" />
              <MiniTask src="granola"                 title="Confirm launch date"   meta="Product sync" />
              <MiniTask src="granola"                 title="Review API spec — §3"  meta="Product sync" />
              <MiniTask src="slack"                   title="Review PR #842"        meta="#eng" />
              <MiniTask src="outlook"                 title="Approve expenses"      meta="HR" />
              <MiniTask src="personal"                title="Follow up vendor"      meta="3 days silent" draft />
            </div>

            {/* Auto-schedule footer */}
            <div
              className="p-3"
              style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkle size={10} />
                <span
                  className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: tokens.bronze }}
                >
                  Auto-schedule
                </span>
              </div>
              <p className="text-[11.5px] text-fg-1 leading-relaxed mb-2">
                Fit 4 remaining tasks into 2h 15m of open slots today?
              </p>
              <Button variant="primary" size="sm" className="w-full justify-center">
                Plan my day
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
