"use client";

import { useState, useEffect } from "react";
import { tokens } from "@/lib/tokens";

const ROW_H = 56;
const START_HOUR = 8;

function nowTop() {
  const d = new Date();
  const mins = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
  return (mins / 60) * ROW_H;
}

function formatNow() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${suffix}`;
}

export function NowLine() {
  const [top, setTop] = useState(nowTop);
  const [label, setLabel] = useState(formatNow);

  useEffect(() => {
    const id = setInterval(() => {
      setTop(nowTop());
      setLabel(formatNow());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Don't render if outside visible hours (8am–7pm)
  if (top < 0 || top > ROW_H * 11) return null;

  return (
    <div
      className="absolute left-[44px] right-0 h-[2px] z-10 pointer-events-none"
      style={{ top, background: tokens.oxblood, boxShadow: `0 0 8px ${tokens.oxblood}` }}
    >
      <div
        className="absolute rounded-full"
        style={{ left: -5, top: -4, width: 10, height: 10, background: tokens.oxblood }}
      />
      <span
        className="font-mono-do absolute right-2 text-[10px] font-semibold"
        style={{ top: -18, color: tokens.oxblood }}
      >
        NOW · {label}
      </span>
    </div>
  );
}
