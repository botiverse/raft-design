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
 * The single source for a task status's *colour*, expressed as the
 * `task-status-*` token scale (see `foundation.css`). Every task-status surface
 * — the icon, the chip, the badge, and the Timeline dot — reads this one recipe,
 * so within a theme all surfaces resolve the SAME token for a given status and
 * across themes the five states keep the same hue family (orange / blue /
 * purple / green / neutral).
 *
 * The theme no longer branches here: `bg-task-status-<status>` already resolves
 * to the brutal pastel or the elegant semantic family depending on the active
 * theme scope, so there is exactly one class per status instead of a
 * per-theme `compoundVariants` table that could (and did) drift.
 */
export const taskStatus = tv({
  variants: {
    status: {
      todo: "bg-task-status-todo",
      "in-progress": "bg-task-status-in-progress",
      "in-review": "bg-task-status-in-review",
      done: "bg-task-status-done",
      closed: "bg-task-status-closed",
    },
  },
});

/** The soft (washed) background slot for a status — used by surfaces that sit on
 *  a soft wash rather than the solid fill. */
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

/** A status-tinted hairline border (elegant soft surfaces): the strong token
 *  mixed toward transparent, so the outline sits in the same colour family as
 *  the fill instead of reading as a neutral stroke. */
export const taskStatusBorder = tv({
  variants: {
    status: {
      todo: "border-[color-mix(in_oklch,var(--task-status-todo-strong)_35%,transparent)]",
      "in-progress":
        "border-[color-mix(in_oklch,var(--task-status-in-progress-strong)_35%,transparent)]",
      "in-review":
        "border-[color-mix(in_oklch,var(--task-status-in-review-strong)_35%,transparent)]",
      done: "border-[color-mix(in_oklch,var(--task-status-done-strong)_35%,transparent)]",
      closed: "border-[color-mix(in_oklch,var(--task-status-closed-strong)_35%,transparent)]",
    },
  },
});
