"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Button } from "@/components/ui/Button";
import { Sparkle } from "@/components/ui/Sparkle";
import { tokens } from "@/lib/tokens";
import type { InboxItem } from "./inbox-data";
import { SourceBadge as SB } from "@/components/ui/SourceBadge";
import type { Source } from "@/types";

function Chip({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "hot" }) {
  return (
    <span
      className="inline-flex items-center gap-1 h-[19px] px-[7px] rounded-r1 text-[10.5px] font-medium uppercase tracking-[0.02em] border"
      style={
        variant === "hot"
          ? { color: tokens.oxblood, borderColor: tokens.oxblood, background: tokens.oxbloodSoft }
          : { color: tokens.fg1, borderColor: tokens.line, background: tokens.bg3 }
      }
    >
      {children}
    </span>
  );
}

function DotsLine() {
  return (
    <div
      className="h-px my-3.5"
      style={{
        backgroundImage: `radial-gradient(circle, ${tokens.line2} 0.8px, transparent 0.8px)`,
        backgroundSize: "4px 1px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

function MiniRelated({ src, title, meta }: { src: Source; title: string; meta: string }) {
  return (
    <div className="flex gap-2.5 px-1.5 py-2 border-b border-line last:border-0 items-start">
      <SB kind={src} />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-fg-0">{title}</div>
        <div className="text-[11px] text-fg-3 mt-0.5">{meta}</div>
      </div>
      <Button variant="ghost" size="xs">Open ↗</Button>
    </div>
  );
}

type Props = { item: InboxItem };

export function DetailPane({ item }: Props) {
  const [draftState, setDraftState] = useState<"proposed" | "sent">("proposed");

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-6 pt-[18px] pb-3.5 border-b border-line flex-shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <SourceBadge kind={item.src} />
          {item.priority === "hot" && <Chip variant="hot">Hot</Chip>}
          <span className="font-mono-do text-[10.5px] text-fg-3 tracking-[0.05em] uppercase">
            #FINANCE · THREAD · 2H AGO
          </span>
          <div className="flex-1" />
          <Button variant="secondary" size="sm">Snooze</Button>
          <Button variant="secondary" size="sm">Delegate</Button>
          <Button variant="secondary" size="sm">Done</Button>
        </div>
        <h1>Reply to Sara — Q2 budget numbers</h1>
        <div className="flex items-center gap-2.5 mt-2.5">
          <Avatar initial="S" size={26} />
          <div>
            <div className="text-[12.5px] font-medium">Sara Chen</div>
            <div className="text-[11px] text-fg-3">CFO · needs reply before 3:00 PM sync</div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto px-6 py-[18px]">
        {/* Context */}
        <h3 className="mb-2 text-fg-2">Context</h3>
        <div
          className="rounded-r2 p-3.5 mb-[18px]"
          style={{ background: tokens.bg2, border: `1px solid ${tokens.line}` }}
        >
          <p className="text-[13px] text-fg-1 leading-relaxed">
            "Hi M, could you share the rolling Q2 figures before 3? Especially margin breakdown by product line. We'll review in the leadership sync right after."
          </p>
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            <Chip>Q2-plan.pdf</Chip>
            <Chip>margins.xlsx</Chip>
            <Chip>3 related threads</Chip>
          </div>
        </div>

        {/* AI draft reply */}
        <h3 className="flex items-center gap-2 mb-2">
          <Sparkle size={14} />
          <span style={{ color: tokens.bronze }}>AI draft reply</span>
        </h3>
        <div
          className="rounded-r3 p-4"
          style={{
            background: `linear-gradient(135deg, ${tokens.bronzeSoft}, #2a1d0e)`,
            border: `1px solid ${tokens.bronzeLine}`,
          }}
        >
          {draftState === "proposed" ? (
            <>
              <p className="text-[13.5px] text-fg-0 leading-[1.65]">
                Hi Sara —<br /><br />
                Here's Q2 at a glance: Revenue{" "}
                <strong style={{ color: tokens.bronze }}>$1.2M (+18% QoQ)</strong>, blended margin{" "}
                <strong style={{ color: tokens.bronze }}>34%</strong>. Margin breakdown by product line is in the attached deck (slide 4). Raw figures in margins.xlsx.<br /><br />
                Happy to walk through before 3 if useful — otherwise see you in the sync.
              </p>
              <DotsLine />
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button variant="primary" size="md" onClick={() => setDraftState("sent")}>
                  Send to #finance
                </Button>
                <Button variant="secondary" size="md">Edit</Button>
                <Button variant="ghost" size="md">Regenerate</Button>
                <div className="flex-1" />
                <span className="font-mono-do text-[10.5px] text-fg-3 tracking-[0.04em]">
                  USES Q2-PLAN.PDF · MARGINS.XLSX
                </span>
              </div>
            </>
          ) : (
            <div className="font-mono-do text-[11px] py-1" style={{ color: tokens.forest }}>
              ✓ SENT TO #FINANCE · {new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* Related */}
        <h3 className="mt-[22px] mb-2 text-fg-2">Related</h3>
        <div className="rounded-r2 overflow-hidden" style={{ border: `1px solid ${tokens.line}`, background: tokens.bg2 }}>
          <MiniRelated src="outlook" title="Leadership sync — 3:00 PM"    meta="Blocked until this reply goes" />
          <MiniRelated src="slack"   title="Q2 figures thread · #finance"  meta="4 messages · Sara, Leo, you" />
          <MiniRelated src="granola" title="Last CFO 1:1 notes"            meta="Mentioned margin concerns" />
        </div>
      </div>
    </div>
  );
}
