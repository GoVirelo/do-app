import type { ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-bg-3 text-fg-2 border border-line-2 rounded-[3px] font-mono text-[10px]">
      {children}
    </kbd>
  );
}
