"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StatusBar } from "./StatusBar";
import { FilterPills } from "./FilterPills";
import { MobileMeetingCard } from "./MobileMeetingCard";
import { MobileTask } from "./MobileTask";
import { Sparkle } from "@/components/ui/Sparkle";
import { Avatar } from "@/components/ui/Avatar";
import { Icons } from "@/components/ui/Icons";
import { tokens } from "@/lib/tokens";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTasks } from "@/hooks/useAppTasks";
import { useMeetings } from "@/hooks/useTasks";
import { NewTaskModal } from "@/components/stream/NewTaskModal";
import type { Task } from "@/types";

type FilterValue = "All" | "Hot" | "Today" | "Meetings" | "Personal";

function MobileSection({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-2 px-1.5 pt-3.5 pb-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="font-mono-do text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-1">{label}</span>
      </div>
      {children}
    </>
  );
}

function BottomNav({ active, onNav }: { active: string; onNav: (v: string) => void }) {
  const items = [
    { label: "Stream",    icon: <Icons.flash size={16} /> },
    { label: "Day",       icon: <Icons.today size={16} /> },
    { label: "Assistant", icon: <Sparkle size={16} /> },
    { label: "Me",        icon: <Icons.user size={16} /> },
  ];
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex-shrink-0"
      style={{ background: tokens.bg1, borderTop: `1px solid ${tokens.line}`, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around pt-2.5 pb-2">
        {items.map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => onNav(label)}
            className="flex flex-col items-center gap-1 transition-colors min-w-[44px] min-h-[44px] justify-center"
            style={{ color: active === label ? tokens.bronze : tokens.fg3 }}
          >
            {icon}
            <span className="text-[10px] font-medium tracking-[0.02em]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface AIChatMessage { role: "user" | "assistant"; content: string; }

function AssistantSheet() {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: AIChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "No response." }]);
      qc.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: tokens.bg0 }}>
      <div className="flex items-center gap-2 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${tokens.line}` }}>
        <Sparkle size={14} />
        <span className="font-semibold text-[15px]">Assistant</span>
      </div>
      <div className="flex-1 overflow-auto px-4 py-3 pb-[100px] flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
            <Sparkle size={24} />
            <span className="font-mono-do text-[11px] text-fg-3">Ask anything about your tasks</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] px-3 py-2 rounded-r2 text-[13.5px] leading-relaxed"
              style={{
                background: m.role === "user" ? tokens.bronze : tokens.bg2,
                color: m.role === "user" ? "#1a1108" : tokens.fg1,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-r2 text-[13px]" style={{ background: tokens.bg2, color: tokens.fg3 }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${tokens.line}`, paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask or instruct…"
            rows={1}
            className="flex-1 rounded-r2 px-3 py-2.5 text-[14px] resize-none outline-none leading-snug"
            style={{ background: tokens.bg2, border: `1px solid ${tokens.line2}`, color: tokens.fg0, minHeight: 40, maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-r2 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: tokens.bronze, color: "#1a1108" }}
          >
            <Icons.flash size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MobileView({ frameMode = false }: { frameMode?: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Stream");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");
  const [showNewTask, setShowNewTask] = useState(false);
  const { tasks, toggleTask, sendDraft, skipDraft, triggerSync, isSyncing } = useAppTasks();
  const { data: meetings = [] } = useMeetings();

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: tokens.bg0 }}>
        <span className="font-mono-do text-[11px] text-fg-3">Loading…</span>
      </div>
    );
  }

  const openTasks = tasks.filter(t => t.status !== "done");
  const hotCount  = tasks.filter(t => t.priority === "hot" && t.status !== "done").length;
  const todayCount = tasks.filter(t => t.bucket === "today" && t.status !== "done").length;
  const needReply = tasks.filter(t => t.aiDraft?.state === "proposed").length;

  function applyFilter(t: Task): boolean {
    if (activeFilter === "Hot")      return t.priority === "hot" && t.status !== "done";
    if (activeFilter === "Today")    return t.bucket === "today" && t.status !== "done";
    if (activeFilter === "Personal") return t.source === "personal" && t.status !== "done";
    return t.status !== "done";
  }

  // Meeting task IDs to exclude from flat list
  const meetingTaskIds = new Set(meetings.flatMap(m => m.tasks.map((t: any) => t.id)));
  const showMeetings = activeFilter === "All" || activeFilter === "Meetings";

  const filtered = tasks.filter(applyFilter).filter(t => t.source !== "granola" || !meetingTaskIds.has(t.id));
  const hotTasks   = filtered.filter(t => t.priority === "hot");
  const todayTasks = filtered.filter(t => t.bucket === "today" && t.priority !== "hot");
  const otherTasks = filtered.filter(t => t.bucket !== "today" && t.priority !== "hot");

  const filters = [
    { label: "All" as FilterValue,      count: openTasks.length },
    { label: "Hot" as FilterValue,      count: hotCount },
    { label: "Today" as FilterValue,    count: todayCount },
    { label: "Meetings" as FilterValue, count: meetings.filter(m => m.tasks.some((t: any) => t.status !== "done")).length },
    { label: "Personal" as FilterValue, count: tasks.filter(t => t.source === "personal" && t.status !== "done").length },
  ];

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="flex flex-col overflow-hidden relative"
      style={frameMode ? {
        width: 390, height: 844, background: tokens.bg0, color: tokens.fg0, borderRadius: 36, border: `1px solid ${tokens.line2}`,
      } : {
        width: "100%", height: "100%", background: tokens.bg0, color: tokens.fg0,
      }}
    >
      {frameMode && <StatusBar />}

      {/* Assistant tab — full screen */}
      {activeNav === "Assistant" && (
        <div className="flex-1 min-h-0 flex flex-col" style={{ paddingTop: frameMode ? 0 : "env(safe-area-inset-top)" }}>
          <AssistantSheet />
        </div>
      )}

      {/* Stream tab */}
      {activeNav !== "Assistant" && <>

      {/* App header */}
      <div
        className="px-5 pb-3.5 flex-shrink-0"
        style={{ paddingTop: frameMode ? 8 : "max(env(safe-area-inset-top), 16px)" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-display text-[22px] font-semibold tracking-[-0.02em]">do.</span>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={() => triggerSync()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
              style={{ background: tokens.bg2, border: `1px solid ${tokens.line}`, opacity: isSyncing ? 0.5 : 1 }}
              disabled={isSyncing}
              title="Sync"
            >
              <Icons.sync size={14} className={isSyncing ? "animate-spin" : ""} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: tokens.bg2, border: `1px solid ${tokens.line}` }}>
              <Sparkle size={14} />
            </div>
            <Avatar initial={userInitial} size={32} />
          </div>
        </div>
        <div className="font-mono-do text-[10.5px] text-fg-3 uppercase tracking-[0.08em] mb-1">
          {new Date().toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })} · {openTasks.length} open
        </div>
        <h1 style={{ fontSize: 28 }}>{needReply > 0 ? `${needReply} need reply` : `${openTasks.length} tasks open`}</h1>
      </div>

      {/* Filter pills */}
      <FilterPills filters={filters} active={activeFilter} onFilter={setActiveFilter} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-3.5 pb-[100px]">

        {/* Meeting cards */}
        {showMeetings && meetings
          .filter(m => m.tasks.some((t: any) => t.status !== "done"))
          .map((meeting: any) => (
            <MobileMeetingCard key={meeting.id} meeting={{ ...meeting, tasks: meeting.tasks.map((t: any) => ({ ...t, status: tasks.find(ut => ut.id === t.id)?.status ?? t.status })) }} onToggle={toggleTask} />
          ))}

        {hotTasks.length > 0 && (
          <MobileSection label="Hot" color={tokens.oxblood}>
            {hotTasks.map(t => <MobileTask key={t.id} task={t} onToggle={() => toggleTask(t.id)} onSendDraft={(b) => sendDraft(t.id, b)} onSkipDraft={() => skipDraft(t.id)} />)}
          </MobileSection>
        )}

        {todayTasks.length > 0 && (
          <MobileSection label="Today" color={tokens.bronze}>
            {todayTasks.map(t => <MobileTask key={t.id} task={t} onToggle={() => toggleTask(t.id)} onSendDraft={(b) => sendDraft(t.id, b)} onSkipDraft={() => skipDraft(t.id)} />)}
          </MobileSection>
        )}

        {otherTasks.length > 0 && (
          <MobileSection label="Backlog" color={tokens.fg3}>
            {otherTasks.map(t => <MobileTask key={t.id} task={t} onToggle={() => toggleTask(t.id)} onSendDraft={(b) => sendDraft(t.id, b)} onSkipDraft={() => skipDraft(t.id)} />)}
          </MobileSection>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="font-mono-do text-[11px] text-fg-3">— nothing here —</span>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="absolute" style={{ bottom: 100, right: 20 }}>
        <button
          onClick={() => setShowNewTask(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-[#1a1108]"
          style={{ background: `linear-gradient(135deg, ${tokens.bronze}, #8a5a1e)`, boxShadow: "0 6px 20px rgba(200,137,63,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <Icons.plus size={22} />
        </button>
      </div>

      </> /* end Stream tab */}

      <BottomNav active={activeNav} onNav={setActiveNav} />

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
