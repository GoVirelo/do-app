import { tokens } from "@/lib/tokens";

type Tone = "outlook" | "granola" | "focus" | "task";

const TONES: Record<Tone, { bg: string; line: string; fg: string }> = {
  outlook: { bg: tokens.steelSoft,   line: "#2a3a54",          fg: tokens.steel   },
  granola: { bg: "#2a1f10",          line: "#4d3920",           fg: "#d4a55a"      },
  focus:   { bg: tokens.bronzeSoft,  line: tokens.bronzeLine,   fg: tokens.bronze  },
  task:    { bg: tokens.bg3,         line: tokens.line2,        fg: tokens.fg1     },
};

type Props = {
  top: number;
  height: number;
  title: string;
  meta: string;
  tone: Tone;
  dashed?: boolean;
  done?: boolean;
  urgent?: boolean;
};

export function TimelineBlock({ top, height, title, meta, tone, dashed, done, urgent }: Props) {
  const t = TONES[tone];
  return (
    <div
      className="absolute overflow-hidden rounded-r2"
      style={{
        top,
        left: 54,
        right: 16,
        height: height - 4,
        background: t.bg,
        border: `1px ${dashed ? "dashed" : "solid"} ${urgent ? tokens.oxblood : t.line}`,
        borderLeft: `3px solid ${urgent ? tokens.oxblood : t.fg}`,
        padding: "6px 10px",
        opacity: done ? 0.55 : 1,
      }}
    >
      <div
        className="text-[12.5px] font-semibold text-fg-0"
        style={{ textDecoration: done ? "line-through" : "none" }}
      >
        {title}
      </div>
      <div className="font-mono-do text-[10.5px] text-fg-3 mt-0.5">{meta}</div>
    </div>
  );
}
