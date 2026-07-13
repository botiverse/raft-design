import type { TaskStatus } from "./task-card.fixtures";

export const TASK_STATUS_TONES = {
  todo: "warning",
  in_progress: "information",
  in_review: "accent-muted",
  done: "success",
  closed: "muted",
} as const;

const TASK_STATUS_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  todo: ["in_progress", "closed"],
  in_progress: ["in_review", "done", "closed"],
  in_review: ["done", "in_progress", "closed"],
  done: ["todo", "in_progress", "in_review", "closed"],
  closed: ["todo"],
};

export const TASK_STATUS_OPTIONS: Record<TaskStatus, ReadonlySet<TaskStatus>> = {
  todo: new Set(["todo", ...TASK_STATUS_TRANSITIONS.todo]),
  in_progress: new Set(["in_progress", ...TASK_STATUS_TRANSITIONS.in_progress]),
  in_review: new Set(["in_review", ...TASK_STATUS_TRANSITIONS.in_review]),
  done: new Set(["done", ...TASK_STATUS_TRANSITIONS.done]),
  closed: new Set(["closed", ...TASK_STATUS_TRANSITIONS.closed]),
};
