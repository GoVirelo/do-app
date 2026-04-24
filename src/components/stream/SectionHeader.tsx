import { Icons } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

type Props = {
  label: string;
  color: string;
  count: number;
  onAdd?: () => void;
};

export function SectionHeader({ label, color, count, onAdd }: Props) {
  return (
    <div className="flex items-center gap-2.5 px-6 pt-[18px] pb-1.5 border-b border-line">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="font-mono-do text-[11px] font-semibold tracking-[0.1em] uppercase text-fg-1">
        {label}
      </span>
      <span className="font-mono-do text-[11px] text-fg-3">{count}</span>
      <div className="flex-1" />
      <Button variant="ghost" size="xs" onClick={onAdd}>
        <Icons.plus size={10} />
      </Button>
    </div>
  );
}
