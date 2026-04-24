import { SourceBadge } from "@/components/ui/SourceBadge";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";

export function MobileMeetingCard() {
  return (
    <div
      className="rounded-r2 p-3.5 mb-3"
      style={{
        background: tokens.bg2,
        border: `1px solid ${tokens.line}`,
        borderLeft: `2px solid ${tokens.amber}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <SourceBadge kind="granola" />
        <span className="font-mono-do text-[10px] text-fg-3 tracking-[0.04em] uppercase">
          Meeting · Ended 11:32
        </span>
      </div>
      <div className="text-[15px] font-semibold text-fg-0 mb-0.5">Product sync with Eng</div>
      <div className="text-[11.5px] text-fg-2 mb-2.5">2 actions extracted for you</div>
      <div className="flex gap-1.5">
        <Button variant="primary" size="sm" className="flex-1 justify-center">Review</Button>
        <Button variant="secondary" size="sm" className="flex-1 justify-center">Add all</Button>
      </div>
    </div>
  );
}
