import { PriorityBar } from "@/components/ui/PriorityBar";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Sparkle } from "@/components/ui/Sparkle";
import { tokens } from "@/lib/tokens";
import type { Source } from "@/types";

type Props = {
  title: string;
  meta: string;
  src: Source;
  priority?: "normal" | "hot";
  draft?: boolean;
  scheduled?: string;
};

export function MiniTask({ title, meta, src, priority = "normal", draft, scheduled }: Props) {
  return (
    <div className="flex gap-2 px-2.5 py-2 rounded-r2 hover:bg-bg-2 cursor-grab transition-colors items-start">
      <PriorityBar level={priority} className="mt-1" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-fg-0">{title}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <SourceBadge kind={src} />
          <span className="font-mono-do text-[10px] text-fg-3">{meta}</span>
        </div>
      </div>
      {draft && <Sparkle size={10} />}
      {scheduled && (
        <span
          className="font-mono-do text-[9.5px] font-semibold tracking-[0.05em]"
          style={{ color: tokens.forest }}
        >
          ✓ {scheduled}
        </span>
      )}
    </div>
  );
}
