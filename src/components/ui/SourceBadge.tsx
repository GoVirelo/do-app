import { useState, useRef, useEffect } from "react";
import { sourceTokens } from "@/lib/tokens";
import type { Source } from "@/types";

const ALL_SOURCES: Source[] = ["granola", "outlook", "slack", "personal"];

type Props = {
  kind: Source;
  className?: string;
  onChange?: (source: Source) => void;
};

export function SourceBadge({ kind, className, onChange }: Props) {
  const src = sourceTokens[kind] ?? sourceTokens.personal;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const badge = (
    <span
      aria-label={`From ${src.label}`}
      className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[3px] text-[9.5px] font-semibold uppercase tracking-[0.06em] ${className ?? ""} ${onChange ? "cursor-pointer hover:opacity-80" : ""}`}
      style={{ color: src.fg, background: src.bg, border: `1px solid ${src.line}` }}
      onClick={onChange ? () => setOpen(v => !v) : undefined}
    >
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: src.fg }} />
      {src.label}
    </span>
  );

  if (!onChange) return badge;

  return (
    <div ref={ref} className="relative inline-flex">
      {badge}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-[4px] overflow-hidden py-0.5"
          style={{ background: "var(--bg-3)", border: "1px solid var(--line-2)", minWidth: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
        >
          {ALL_SOURCES.map(s => {
            const st = sourceTokens[s];
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11.5px] hover:bg-bg-4 transition-colors"
                style={{ color: s === kind ? st.fg : "var(--fg-1)" }}
              >
                <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: st.fg }} />
                {st.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
