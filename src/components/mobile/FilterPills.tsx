"use client";

import { tokens } from "@/lib/tokens";

type Props = {
  filters: { label: string; count: number }[];
  active: string;
  onFilter: (label: any) => void;
};

export function FilterPills({ filters, active, onFilter }: Props) {
  return (
    <div className="flex gap-1.5 px-5 pb-3.5 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
      {filters.map(({ label, count }) => {
        const on = active === label;
        return (
          <button
            key={label}
            onClick={() => onFilter(label)}
            className="h-[34px] px-3 flex items-center gap-1.5 rounded-[17px] text-[12px] font-medium flex-shrink-0 border transition-colors"
            style={{
              background: on ? tokens.bg3 : tokens.bg2,
              color: on ? tokens.fg0 : tokens.fg2,
              borderColor: on ? tokens.line2 : tokens.line,
            }}
          >
            {label}
            {count > 0 && <span className="font-mono-do text-[10.5px]" style={{ color: tokens.fg3 }}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
