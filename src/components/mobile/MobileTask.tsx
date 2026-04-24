"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";
import type { Source } from "@/types";

type Props = {
  title: string;
  meta: string;
  src: Source;
  priority?: "normal" | "hot";
  defaultExpanded?: boolean;
  draft?: string;
};

export function MobileTask({ title, meta, src, priority = "normal", defaultExpanded = false, draft }: Props) {
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [sent, setSent] = useState(false);
  const hot = priority === "hot";

  return (
    <div
      className="rounded-r2 p-3.5 mb-2"
      style={{
        background: tokens.bg2,
        border: `1px solid ${tokens.line}`,
        borderLeft: hot ? `2px solid ${tokens.oxblood}` : `1px solid ${tokens.line}`,
      }}
    >
      <div className="flex gap-2.5 items-start">
        <Checkbox
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="w-[18px] h-[18px] mt-0.5 flex-shrink-0"
        />
        <div className="flex-1 min-w-0" onClick={() => !checked && setExpanded(!expanded)}>
          <div className="text-[14px] font-medium text-fg-0 mb-1.5">{title}</div>
          <div className="flex items-center gap-1.5">
            <SourceBadge kind={src} />
            <span className="font-mono-do text-[10.5px] text-fg-3">{meta}</span>
          </div>

          {expanded && draft && !sent && (
            <div
              className="mt-2.5 p-2.5 rounded-r2"
              style={{
                background: `linear-gradient(135deg, ${tokens.bronzeSoft}, #2a1d0e)`,
                border: `1px solid ${tokens.bronzeLine}`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkle size={10} />
                <span
                  className="font-mono-do text-[9.5px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: tokens.bronze }}
                >
                  Draft reply
                </span>
              </div>
              <p className="text-[12.5px] text-fg-1 leading-relaxed">{draft}</p>
              <div className="flex gap-1.5 mt-2.5">
                <Button variant="primary" size="sm" className="flex-1 justify-center" onClick={() => setSent(true)}>
                  Send
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 justify-center">
                  Edit
                </Button>
              </div>
            </div>
          )}

          {sent && (
            <div className="font-mono-do text-[10px] mt-1.5" style={{ color: tokens.forest }}>
              SENT VIA {src.toUpperCase()} · 10:24
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
