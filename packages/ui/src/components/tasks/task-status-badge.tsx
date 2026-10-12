import type { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { TaskChip } from "./task-chip";
import type { TaskChipSize } from "./task-chip";
import { TaskStatusIcon } from "./task-status-icon";
import type { TaskStatusId } from "./task-status.recipe";

export interface TaskStatusBadgeProps extends useRender.ComponentProps<"span"> {
  status: TaskStatusId;
  /** Badge text. The caller owns the copy (and its localization); Raft never
   *  hardcodes a status label here. */
  children?: ReactNode;
  /** Same as `TaskChip`'s `size`: `sm` lines up with an `sm` Badge. */
  size?: TaskChipSize;
}

/**
 * A task status with its label: the status icon + caller-provided text.
 *
 * This is `TaskChip` showing a status name instead of a task number. It has no
 * look of its own (Artea, #proj-rui:c841b051, 2026-10-10): a status badge in
 * the task panel and a task chip in a message are one component that differs
 * only in what it shows, so shape, size, border and colour all come from
 * `TaskChip`. The slot name is kept for callers that select on it.
 */
function TaskStatusBadgeRoot({ status, children, ...props }: TaskStatusBadgeProps) {
  return (
    <TaskChip status={status} data-slot="task-status-badge" data-status={status} {...props}>
      <TaskStatusIcon status={status} />
      {children}
    </TaskChip>
  );
}

export const TaskStatusBadge = Object.assign(TaskStatusBadgeRoot, {});
