import { sourceTokens } from "@/lib/tokens";
import type { Source } from "@/types";

type Props = {
  kind: Source;
  className?: string;
};

export function SourceBadge({ kind, className }: Props) {
  const src = sourceTokens[kind] ?? sourceTokens.personal;
  return (
    <span
      aria-label={`From ${src.label}`}
      className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[3px] text-[9.5px] font-semibold uppercase tracking-[0.06em] ${className ?? ""}`}
      style={{ color: src.fg, background: src.bg, border: `1px solid ${src.line}` }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
        style={{ background: src.fg }}
      />
      {src.label}
    </span>
  );
}
