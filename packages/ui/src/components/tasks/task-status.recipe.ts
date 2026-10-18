import { tv } from "../../lib/tv";

export type TaskStatusId = "todo" | "in-progress" | "in-review" | "done" | "closed";

export const TASK_STATUS_IDS: readonly TaskStatusId[] = [
  "todo",
  "in-progress",
  "in-review",
  "done",
  "closed",
];

/**
 * A task status's colour is the `task-status-*` token scale (see
 * `foundation.css`): every task-status surface (the pixel, the chip, the badge,
 * the Timeline dot) reads the same token for a given status, so they cannot
 * drift apart.
 */
/** The soft (washed) background for a status: the chip and the card status. */
export const taskStatusSoft = tv({
  variants: {
    status: {
      todo: "bg-task-status-todo-soft",
      "in-progress": "bg-task-status-in-progress-soft",
      "in-review": "bg-task-status-in-review-soft",
      done: "bg-task-status-done-soft",
      closed: "bg-task-status-closed-soft",
    },
  },
});

/** The strong (readable-on-soft) ink slot for a status. */
export const taskStatusStrong = tv({
  variants: {
    status: {
      todo: "text-task-status-todo-strong",
      "in-progress": "text-task-status-in-progress-strong",
      "in-review": "text-task-status-in-review-strong",
      done: "text-task-status-done-strong",
      closed: "text-task-status-closed-strong",
    },
  },
});
