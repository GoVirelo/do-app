"use client";

import { create } from "zustand";
import type { Task, Meeting, AISuggestion } from "@/types";
import { mockTasks, mockMeeting, mockSuggestions } from "@/lib/mock-data";
import { queryClient } from "@/lib/query-client";

type TasksStore = {
  tasks: Task[];
  meeting: Meeting | null;
  suggestions: AISuggestion[];
  toggleTask: (id: string) => void;
  skipDraft: (id: string) => void;
  sendDraft: (id: string) => void;
  acceptExtractedAction: (actionId: string) => void;
  skipExtractedAction: (actionId: string) => void;
  dismissSuggestion: (id: string) => void;
};

async function apiPatch(id: string, data: Record<string, unknown>) {
  try {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  } catch {
    // Silently fail — optimistic update already applied locally
  }
}

async function apiDraftStatus(taskId: string, status: "sent" | "skipped") {
  try {
    await fetch("/api/ai/draft", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  } catch {
    // Best-effort
  }
}

export const useTasksStore = create<TasksStore>((set) => ({
  tasks: [],
  meeting: null,
  suggestions: [],

  toggleTask: (id) => {
    set((s) => {
      const task = s.tasks.find((t) => t.id === id);
      const newStatus = task?.status === "done" ? "open" : "done";
      apiPatch(id, { status: newStatus });
      return {
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, status: newStatus } : t
        ),
      };
    });
  },

  skipDraft: (id) => {
    apiDraftStatus(id, "skipped");
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id && t.aiDraft ? { ...t, aiDraft: { ...t.aiDraft, state: "skipped" } } : t
      ),
    }));
  },

  sendDraft: (id) => {
    apiDraftStatus(id, "sent");
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id && t.aiDraft ? { ...t, aiDraft: { ...t.aiDraft, state: "sent" } } : t
      ),
    }));
  },

  acceptExtractedAction: (actionId) =>
    set((s) => {
      if (!s.meeting) return s;
      const action = s.meeting.extractedActions.find((a) => a.id === actionId);
      if (!action) return s;
      const newTask: Task = {
        id: `extracted-${actionId}`,
        title: action.taskDraft.title || "Untitled",
        status: "open",
        priority: "normal",
        bucket: "today",
        source: "granola",
        sourceRef: { granola: { meetingId: s.meeting.id, quote: action.quote } },
        createdAt: new Date(),
        assignee: "me",
        meta: `Extracted · ${s.meeting.title}`,
      };
      // Persist to API
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          source: "granola",
          bucket: "today",
          priority: "medium",
        }),
      }).then(() => queryClient.invalidateQueries({ queryKey: ["tasks"] })).catch(() => {});
      return {
        tasks: [...s.tasks, newTask],
        meeting: {
          ...s.meeting,
          extractedActions: s.meeting.extractedActions.map((a) =>
            a.id === actionId ? { ...a, accepted: true } : a
          ),
        },
      };
    }),

  skipExtractedAction: (actionId) =>
    set((s) => {
      if (!s.meeting) return s;
      return {
        meeting: {
          ...s.meeting,
          extractedActions: s.meeting.extractedActions.filter((a) => a.id !== actionId),
        },
      };
    }),

  dismissSuggestion: (id) =>
    set((s) => ({ suggestions: s.suggestions.filter((s) => s.id !== id) })),
}));
