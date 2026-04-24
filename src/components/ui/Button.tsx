import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "xs" | "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "secondary", size = "md", className, children, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 border cursor-pointer transition-colors duration-100",
        "font-sans font-medium tracking-[-0.005em]",
        // size
        size === "xs" && "h-5 px-1.5 text-[10.5px] rounded-r1",
        size === "sm" && "h-[22px] px-2 text-[11px] rounded-r1",
        size === "md" && "h-7 px-2.5 text-[12px] rounded-r2",
        // variant
        variant === "secondary" &&
          "bg-bg-3 text-fg-0 border-line-2 hover:bg-bg-4 hover:border-fg-3",
        variant === "ghost" &&
          "bg-transparent text-fg-1 border-transparent hover:bg-bg-3 hover:text-fg-0",
        variant === "primary" && [
          "text-[#1a1108] border-[#8a5a1e] font-semibold",
          "bg-gradient-to-b from-[#d4964a] to-[#b87a30]",
          "shadow-btn-primary hover:brightness-110",
        ],
        className
      )}
    >
      {children}
    </button>
  );
}
