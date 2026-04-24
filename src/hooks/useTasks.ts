"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  bucket: string;
  source: string;
  sourceRef?: string | null;
  dueAt?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  createdAt: string;
  aiDraft?: AIDraft | null;
}

export interface AIDraft {
  id: string;
  taskId: string;
  body: string;
  channel?: string | null;
  status: string;
  sentAt?: string | null;
}

async function fetchTasks(params?: { bucket?: string; status?: string }): Promise<Task[]> {
  const url = new URL("/api/tasks", window.location.origin);
  if (params?.bucket) url.searchParams.set("bucket", params.bucket);
  if (params?.status) url.searchParams.set("status", params.status);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export function useTasks(params?: { bucket?: string; status?: string }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => fetchTasks(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error("Task not found");
      return res.json() as Promise<Task>;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json() as Promise<Task>;
    },
    onMutate: async ({ id, ...data }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useGenerateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, channel = "slack" }: { taskId: string; channel?: string }) => {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, channel }),
      });
      if (!res.ok) throw new Error("Failed to generate draft");
      return res.json() as Promise<AIDraft>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: "sent" | "skipped" }) => {
      const res = await fetch("/api/ai/draft", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (!res.ok) throw new Error("Failed to update draft");
      return res.json() as Promise<AIDraft>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opts?: { force?: boolean }) => {
      const url = opts?.force ? "/api/sync?force=1" : "/api/sync";
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
