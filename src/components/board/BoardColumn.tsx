import type { ReactNode } from "react";
import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";

type Props = {
  title: string;
  color: string;
  count: number;
  muted?: boolean;
  children: ReactNode;
};

export function BoardColumn({ title, color, count, muted, children }: Props) {
  return (
    <div className="flex flex-col gap-2" style={{ opacity: muted ? 0.85 : 1 }}>
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-0.5 pb-2"
        style={{ borderBottom: `1px solid ${tokens.line}` }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span className="font-mono-do text-[11px] font-semibold tracking-[0.1em] uppercase text-fg-1">
          {title}
        </span>
        <span className="font-mono-do text-[11px] text-fg-3">{count}</span>
        <div className="flex-1" />
        <Button variant="ghost" size="xs">
          <Icons.plus size={10} />
        </Button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
