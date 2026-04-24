import { cn } from "@/lib/utils";

type Props = {
  level: "normal" | "hot";
  className?: string;
};

export function PriorityBar({ level, className }: Props) {
  return (
    <div
      className={cn(
        "w-0.5 h-3 rounded-[1px] flex-shrink-0",
        level === "hot"
          ? "bg-oxblood shadow-oxblood-glow"
          : "bg-line-2",
        className
      )}
    />
  );
}
