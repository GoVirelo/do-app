"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkle } from "@/components/ui/Sparkle";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIRail() {
  const qc = useQueryClient();
  const [collapsed, setCollapsed] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "No response." }]);
      // Refresh tasks/meetings in case Claude made changes
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["meetings"] });
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-3.5 gap-3 flex-shrink-0 cursor-pointer"
        style={{ width: 44, background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
        onClick={() => setCollapsed(false)}
        title="Expand assistant"
      >
        <div
          className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${tokens.bronze}, ${tokens.oxblood})` }}
        >
          <Sparkle size={12} color="#1a1108" />
        </div>
        <span
          className="font-mono-do text-[9px] tracking-[0.1em] uppercase"
          style={{ color: tokens.fg3, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Assistant
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-[300px] flex flex-col overflow-hidden flex-shrink-0"
      style={{ background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${tokens.line}` }}
      >
        <div
          className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${tokens.bronze}, ${tokens.oxblood})` }}
        >
          <Sparkle size={12} color="#1a1108" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold">Assistant</div>
          <div className="font-mono-do text-[10px] text-fg-3 tracking-[0.04em]">CLAUDE · LIVE</div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-fg-3 hover:text-fg-1 transition-colors px-1"
          title="Collapse"
        >
          ›
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-auto">
        {messages.length === 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-[12px] text-fg-3 text-center">Ask me anything about your tasks.</p>
            <div className="flex flex-col gap-1.5 mt-2">
              {[
                "What's overdue?",
                "Restore my last done tasks",
                "Summarise my Granola actions",
                "What should I focus on today?",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-left text-[11.5px] px-2.5 py-1.5 rounded-r2 border transition-colors"
                  style={{ borderColor: tokens.line, color: tokens.fg2, background: tokens.bg2 }}
                  onMouseEnter={e => (e.currentTarget.style.color = tokens.fg0)}
                  onMouseLeave={e => (e.currentTarget.style.color = tokens.fg2)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className="max-w-[240px] px-3 py-2 rounded-r2 text-[12.5px] leading-relaxed whitespace-pre-wrap"
              style={
                m.role === "user"
                  ? { background: tokens.bg4, color: tokens.fg0, border: `1px solid ${tokens.line2}` }
                  : { background: tokens.bg2, color: tokens.fg1, border: `1px solid ${tokens.line}` }
              }
            >
              {m.role === "assistant" && (
                <div className="flex items-center gap-1 mb-1.5">
                  <Sparkle size={9} />
                  <span className="font-mono-do text-[9px] tracking-[0.06em] uppercase" style={{ color: tokens.bronze }}>
                    Assistant
                  </span>
                </div>
              )}
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-r2 text-[12px]"
              style={{ background: tokens.bg2, border: `1px solid ${tokens.line}`, color: tokens.fg3 }}
            >
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}>
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 h-[30px] px-2.5 text-[12px] text-fg-0 rounded-r2 outline-none"
            style={{ background: tokens.bg4, border: `1px solid ${tokens.line2}` }}
            placeholder="Ask your assistant…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
          />
          <Button variant="primary" size="sm" className="px-2.5" onClick={send} disabled={loading}>↵</Button>
        </div>
      </div>
    </div>
  );
}
