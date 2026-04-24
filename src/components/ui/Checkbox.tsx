"use client";

import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  onChange: () => void;
  className?: string;
};

export function Checkbox({ checked, onChange, className }: Props) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "w-[15px] h-[15px] flex-shrink-0 border-[1.5px] rounded-[3.5px] cursor-pointer",
        "inline-flex items-center justify-center transition-all duration-[120ms]",
        checked
          ? "bg-bronze border-bronze"
          : "bg-transparent border-line-2 hover:border-fg-2 hover:bg-bg-3",
        className
      )}
    >
      {checked && (
        <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
          <path
            d="M1 2.5L2.8 4.2L6 1"
            stroke="#120a02"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
