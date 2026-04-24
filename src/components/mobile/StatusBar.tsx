export function StatusBar() {
  return (
    <div className="h-11 flex items-center justify-between px-[22px] text-[14px] font-semibold flex-shrink-0">
      <span>10:24</span>
      <span className="flex gap-[5px] items-center">
        {/* Signal */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
          <rect x="0" y="6" width="2" height="4" rx="0.5"/>
          <rect x="4" y="4" width="2" height="6" rx="0.5"/>
          <rect x="8" y="2" width="2" height="8" rx="0.5"/>
          <rect x="12" y="0" width="2" height="10" rx="0.5"/>
        </svg>
        {/* Wifi */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
          <path d="M8 9l3-3a4 4 0 0 0-6 0z"/>
          <path d="M8 9l6-6a8 8 0 0 0-12 0z" opacity="0.4"/>
        </svg>
        {/* Battery */}
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/>
          <rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor"/>
          <rect x="19.5" y="3" width="1.5" height="4" rx="0.5" fill="currentColor"/>
        </svg>
      </span>
    </div>
  );
}
