import { TASK_STATUSES } from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";

/** Narrows the consumer-owned drop metadata carried by TaskDropZone / TaskDraggable. */
export function isTaskDropTarget(value: Record<string, unknown> | undefined): value is {
  status: TaskStatus;
  taskId?: string;
} {
  return (
    value != null &&
    typeof value.status === "string" &&
    TASK_STATUSES.some((status) => status.id === value.status) &&
    (value.taskId == null || typeof value.taskId === "string")
  );
}
