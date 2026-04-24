import { cn } from "@/lib/utils";

const COLORS = ["#6d89a8", "#8a6a3a", "#7d5a8c", "#4a7a5e", "#a14545", "#888"];

type Props = {
  initial: string;
  size?: number;
  color?: string;
  className?: string;
};

export function Avatar({ initial, size = 22, color, className }: Props) {
  const c = color ?? COLORS[initial.charCodeAt(0) % COLORS.length];
  return (
    <div
      className={cn("rounded-full flex items-center justify-center flex-shrink-0 border border-white/[0.08] font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        background: c,
        fontSize: Math.round(size * 0.45),
      }}
    >
      {initial}
    </div>
  );
}
