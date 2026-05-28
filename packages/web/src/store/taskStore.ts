import { create } from "zustand";
import api from "../api/client";
import type { TaskStatus } from "@slock-ai/shared";
import { registerServerReset } from "./serverResetRegistry";

export type { TaskStatus };

export interface Task {
  id: string;
  /** Same as id for message-based tasks; legacy tasks use their own ID */
  messageId: string;
  channelId: string;
  channelName?: string | null;
  channelType?: "channel" | "private" | "joint" | "dm" | "thread";
  taskNumber: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  claimedByType?: "agent" | "user" | null;
  claimedById?: string | null;
  claimedByName?: string | null;
  claimedAt?: string | null;
  completedAt?: string | null;
  createdById: string;
  createdByType: "agent" | "user";
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
  /** True for tasks from the deprecated tasks table (not message-based) */
  isLegacy?: boolean;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  currentChannelId: string | null;
  serverTasks: Task[];
  serverLoading: boolean;
  loadTasks: (channelId: string) => Promise<void>;
  loadServerTasks: () => Promise<void>;
  createTasks: (channelId: string, titles: string[]) => Promise<Task[]>;
  claimTask: (channelId: string, taskId: string) => Promise<void>;
  unclaimTask: (channelId: string, taskId: string) => Promise<void>;
  updateTaskStatus: (channelId: string, taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (channelId: string, taskId: string) => Promise<void>;
  convertMessage: (messageId: string) => Promise<Task>;
  // Called by socket events to update a single task in place
  upsertTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
}

function shouldIncludeInServerTasks(task: Task): boolean {
  return task.channelType === "channel" || task.channelType === "private";
}

function upsertTaskInList(list: Task[], task: Task): Task[] {
  const index = list.findIndex((item) => item.id === task.id);
  if (index === -1) return [...list, task];
  const next = [...list];
  next[index] = task;
  return next;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  currentChannelId: null,
  serverTasks: [],
  serverLoading: false,

  loadTasks: async (channelId) => {
    set({ loading: true, currentChannelId: channelId });
    try {
      const { data } = await api.get(`/tasks/channel/${channelId}`);
      if (get().currentChannelId === channelId) {
        set({ tasks: (data as { tasks: Task[] }).tasks, loading: false });
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      if (get().currentChannelId === channelId) {
        set({ loading: false });
      }
    }
  },

  loadServerTasks: async () => {
    set({ serverLoading: true });
    try {
      const { data } = await api.get("/tasks/server");
      set({ serverTasks: (data as { tasks: Task[] }).tasks, serverLoading: false });
    } catch (err) {
      console.error("Failed to load server tasks:", err);
      set({ serverLoading: false });
    }
  },

  createTasks: async (channelId, titles) => {
    const { data } = await api.post(`/tasks/channel/${channelId}`, {
      tasks: titles.map((title) => ({ title })),
    });
    const created = (data as { tasks: Task[] }).tasks;
    // Don't add to state here — the socket task:created event will upsert them.
    // Adding locally too causes duplicates when the socket event arrives first.
    return created;
  },

  claimTask: async (_channelId, taskId) => {
    const { data } = await api.patch(`/tasks/${taskId}/claim`);
    const updated = (data as { task: Task }).task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
      serverTasks: shouldIncludeInServerTasks(updated)
        ? state.serverTasks.map((t) => (t.id === updated.id ? updated : t))
        : state.serverTasks,
    }));
  },

  unclaimTask: async (_channelId, taskId) => {
    const { data } = await api.patch(`/tasks/${taskId}/unclaim`);
    const updated = (data as { task: Task }).task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
      serverTasks: shouldIncludeInServerTasks(updated)
        ? state.serverTasks.map((t) => (t.id === updated.id ? updated : t))
        : state.serverTasks,
    }));
  },

  updateTaskStatus: async (_channelId, taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    const updated = (data as { task: Task }).task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
      serverTasks: shouldIncludeInServerTasks(updated)
        ? state.serverTasks.map((t) => (t.id === updated.id ? updated : t))
        : state.serverTasks,
    }));
  },

  deleteTask: async (_channelId, taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      serverTasks: state.serverTasks.filter((t) => t.id !== taskId),
    }));
  },

  convertMessage: async (messageId) => {
    const { data } = await api.post("/tasks/convert-message", { messageId });
    const task = (data as { task: Task }).task;
    // Socket task:created event will upsert, but also add locally for immediate feedback
    set((state) => {
      const exists = state.tasks.some((t) => t.id === task.id);
      const nextTasks = exists
        ? state.tasks.map((t) => (t.id === task.id ? task : t))
        : state.currentChannelId === task.channelId
          ? [...state.tasks, task]
          : state.tasks;
      const nextServerTasks = shouldIncludeInServerTasks(task)
        ? upsertTaskInList(state.serverTasks, task)
        : state.serverTasks;
      return { tasks: nextTasks, serverTasks: nextServerTasks };
    });
    return task;
  },

  upsertTask: (task) => {
    set((state) => {
      const taskExists = state.tasks.some((t) => t.id === task.id);
      const nextTasks = taskExists
        ? state.tasks.map((t) => (t.id === task.id ? task : t))
        : state.currentChannelId === task.channelId
          ? [...state.tasks, task]
          : state.tasks;

      let nextServerTasks = state.serverTasks;
      if (shouldIncludeInServerTasks(task)) {
        nextServerTasks = upsertTaskInList(state.serverTasks, task);
      } else if (state.serverTasks.some((t) => t.id === task.id)) {
        nextServerTasks = state.serverTasks.filter((t) => t.id !== task.id);
      }

      return { tasks: nextTasks, serverTasks: nextServerTasks };
    });
  },

  removeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      serverTasks: state.serverTasks.filter((t) => t.id !== taskId),
    }));
  },
}));

registerServerReset(() =>
  useTaskStore.setState({
    tasks: [],
    loading: false,
    currentChannelId: null,
    serverTasks: [],
    serverLoading: false,
  })
);
