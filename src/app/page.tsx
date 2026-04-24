"use client";

import { useState } from "react";
import { StreamView } from "@/components/stream/StreamView";
import { BoardView } from "@/components/board/BoardView";
import { DayView } from "@/components/day/DayView";
import { TriageView } from "@/components/triage/TriageView";

type View = "Stream" | "Board" | "Day" | "Personal";

export default function Home() {
  const [view, setView] = useState<View>("Stream");

  return (
    <div className="h-screen overflow-hidden">
      {view === "Stream"   && <StreamView   onViewChange={(v) => setView(v as View)} />}
      {view === "Board"    && <BoardView    onViewChange={(v) => setView(v as View)} />}
      {view === "Day"      && <DayView      onViewChange={(v) => setView(v as View)} />}
      {view === "Personal" && <TriageView   onViewChange={(v) => setView(v as View)} />}
    </div>
  );
}
