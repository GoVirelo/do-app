type IconProps = { size?: number; className?: string };

export const Icons = {
  close: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <path d="M3 3l10 10M13 3L3 13"/>
    </svg>
  ),
  inbox: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 8v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8"/>
      <path d="M2 8l2-6h8l2 6"/>
      <path d="M2 8h3l1 2h4l1-2h3"/>
    </svg>
  ),
  today: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="3" width="12" height="11" rx="1"/>
      <path d="M2 6h12M5 2v3M11 2v3"/>
    </svg>
  ),
  cal: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="3" width="12" height="11" rx="1"/>
      <path d="M2 6h12M5 1v3M11 1v3"/>
      <circle cx="8" cy="10" r="1" fill="currentColor"/>
    </svg>
  ),
  done: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <path d="M3 8l3 3 7-7"/>
    </svg>
  ),
  flash: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M9 1 L3 9 L7 9 L6 15 L13 7 L9 7 Z"/>
    </svg>
  ),
  plus: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
      <path d="M8 3v10M3 8h10"/>
    </svg>
  ),
  user: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="5" r="3"/>
      <path d="M2 14c0-3 3-5 6-5s6 2 6 5"/>
    </svg>
  ),
  settings: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3"/>
    </svg>
  ),
  meet: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="1" y="4" width="10" height="8" rx="1"/>
      <path d="M11 7l4-2v6l-4-2z" fill="currentColor" stroke="none"/>
    </svg>
  ),
  search: ({ size = 14, className }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="7" cy="7" r="5"/>
      <path d="M11 11l3 3"/>
    </svg>
  ),
};
