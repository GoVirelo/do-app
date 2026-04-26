"use client";

import { useTasks, useUpdateTask, useUpdateDraft, useGenerateDraft, useSync, useSendSlackReply, type Task as ApiTask } from "./useTasks";
import { useTasksStore } from "@/store/tasks";
import type { Task } from "@/types";

function apiToTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    status: t.status as Task["status"],
    priority: (t.priority === "hot" ? "hot" : t.priority === "high" ? "high" : t.priority === "low" ? "low" : "normal") as Task["priority"],
    bucket: (t.bucket === "inbox" ? "inbox" : t.bucket === "today" ? "today" : t.bucket === "upcoming" ? "this_week" : t.bucket === "waiting" ? "this_week" : "inbox") as Task["bucket"],
    source: t.source as Task["source"],
    meta: t.meta ?? undefined,
    sourceRef: t.sourceRef ?? undefined,
    createdAt: new Date(t.createdAt),
    dueAt: t.dueAt ? new Date(t.dueAt) : undefined,
    scheduledStart: t.scheduledStart ? new Date(t.scheduledStart) : undefined,
    scheduledEnd: t.scheduledEnd ? new Date(t.scheduledEnd) : undefined,
    aiDraft: t.aiDraft ? {
      body: t.aiDraft.body,
      channel: t.aiDraft.channel ?? "#general",
      state: t.aiDraft.status as "proposed" | "sent" | "skipped",
    } : undefined,
  };
}

export function useAppTasks() {
  const { data: apiTasks, isLoading, error } = useTasks();
  const store = useTasksStore();
  const updateTask = useUpdateTask();
  const updateDraft = useUpdateDraft();
  const generateDraft = useGenerateDraft();
  const sync = useSync();
  const slackReply = useSendSlackReply();

  const tasks: Task[] = (apiTasks ?? []).map(apiToTask);
  const usingRealData = true;

  function toggleTask(id: string) {
    if (usingRealData) {
      const task = apiTasks?.find(t => t.id === id);
      const newStatus = task?.status === "done" ? "open" : "done";
      updateTask.mutate({ id, status: newStatus });
    } else {
      store.toggleTask(id);
    }
  }

  function sendDraft(id: string, editedBody?: string) {
    if (usingRealData) {
      const task = apiTasks?.find(t => t.id === id);
      if (task?.source === "slack") {
        slackReply.mutate({ taskId: id, body: editedBody });
      } else {
        updateDraft.mutate({ taskId: id, status: "sent" });
      }
    } else {
      store.sendDraft(id);
    }
  }

  function skipDraft(id: string) {
    if (usingRealData) {
      updateDraft.mutate({ taskId: id, status: "skipped" });
    } else {
      store.skipDraft(id);
    }
  }

  function triggerSync(force = false) {
    sync.mutate(force ? { force: true } : undefined);
  }

  return {
    tasks,
    meeting: store.meeting,
    suggestions: store.suggestions,
    toggleTask,
    sendDraft,
    skipDraft,
    triggerSync,
    isSyncing: sync.isPending,
    isLoading,
    error,
    acceptExtractedAction: store.acceptExtractedAction,
    skipExtractedAction: store.skipExtractedAction,
    dismissSuggestion: store.dismissSuggestion,
  };
}
