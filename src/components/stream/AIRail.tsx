"use client";

import { useState } from "react";
import { Sparkle } from "@/components/ui/Sparkle";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/lib/tokens";
import { useTasksStore } from "@/store/tasks";
import type { AISuggestion } from "@/types";

function AICard({ suggestion, onDismiss }: { suggestion: AISuggestion; onDismiss: () => void }) {
  return (
    <div
      className="p-3 rounded-r2"
      style={{
        background: tokens.bg2,
        border: suggestion.dashed
          ? `1px dashed ${tokens.bronzeLine}`
          : `1px solid ${tokens.line}`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkle size={10} />
        <span
          className="font-mono-do text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: tokens.bronze }}
        >
          {suggestion.label}
        </span>
      </div>
      <p className="text-[12.5px] text-fg-1 leading-relaxed mb-2.5">{suggestion.body}</p>
      <div className="flex gap-1.5">
        {suggestion.actions.map((action, i) => (
          <Button
            key={i}
            variant={action.variant === "secondary" ? "secondary" : action.variant}
            size="sm"
            onClick={action.variant === "ghost" ? onDismiss : undefined}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function AIRail() {
  const { suggestions, dismissSuggestion } = useTasksStore();
  const [input, setInput] = useState("");

  return (
    <div
      className="w-[300px] flex flex-col overflow-hidden flex-shrink-0"
      style={{ background: tokens.bg1, borderLeft: `1px solid ${tokens.line}` }}
    >
      {/* Header */}
      <div
        className="px-4 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: `1px solid ${tokens.line}` }}
      >
        <div
          className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${tokens.bronze}, ${tokens.oxblood})` }}
        >
          <Sparkle size={12} color="#1a1108" />
        </div>
        <div>
          <div className="text-[13px] font-semibold">Assistant</div>
          <div className="font-mono-do text-[10px] text-fg-3 tracking-[0.04em]">
            {suggestions.length} SUGGESTIONS · LIVE
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-auto">
        {suggestions.map((s) => (
          <AICard
            key={s.id}
            suggestion={s}
            onDismiss={() => dismissSuggestion(s.id)}
          />
        ))}
        {suggestions.length === 0 && (
          <p className="text-[12px] text-fg-3 text-center mt-8">No suggestions right now.</p>
        )}
      </div>

      {/* Composer */}
      <div
        className="p-3"
        style={{ borderTop: `1px solid ${tokens.line}`, background: tokens.bg2 }}
      >
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 h-[30px] px-2.5 text-[12px] text-fg-0 rounded-r2 outline-none"
            style={{
              background: tokens.bg4,
              border: `1px solid ${tokens.line2}`,
            }}
            placeholder="Ask your assistant…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button variant="primary" size="sm" className="px-2.5">↵</Button>
        </div>
      </div>
    </div>
  );
}
