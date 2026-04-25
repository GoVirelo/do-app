import { MobileView } from "@/components/mobile/MobileView";

export default function MobilePage() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: "#06080a" }}
    >
      {/* Desktop: show phone frame centred */}
      <div className="hidden sm:block">
        <MobileView frameMode />
      </div>
      {/* Actual mobile: fill the screen */}
      <div className="sm:hidden w-full h-[100dvh] overflow-hidden">
        <MobileView />
      </div>
    </div>
  );
}
