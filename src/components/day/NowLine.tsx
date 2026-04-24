import { tokens } from "@/lib/tokens";

type Props = { top: number };

export function NowLine({ top }: Props) {
  return (
    <div
      className="absolute left-[44px] right-0 h-[2px] z-10"
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
        NOW · 10:24
      </span>
    </div>
  );
}
