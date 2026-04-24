import { tokens } from "@/lib/tokens";

type Props = {
  size?: number;
  color?: string;
};

export function Sparkle({ size = 12, color }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill={color ?? tokens.bronze} aria-hidden>
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}
