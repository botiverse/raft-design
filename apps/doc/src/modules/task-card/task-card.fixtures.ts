export type TaskStatus = "todo" | "in-progress" | "in-review" | "done" | "closed";

export type TaskFixture = {
  id: string;
  taskNumber: number;
  channelName: string;
  title: string;
  description?: string;
  status: TaskStatus;
  creatorId?: string;
  assigneeId?: string;
  isLegacy?: boolean;
  disabled?: boolean;
  dragDisabled?: boolean;
};

export const TASK_STATUSES = [
  { id: "todo", label: "Todo" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
  { id: "done", label: "Done" },
  { id: "closed", label: "Closed" },
] as const satisfies readonly { id: TaskStatus; label: string }[];

export const TASK_STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
  todo: "bg-brutal-orange",
  "in-progress": "bg-brutal-cyan",
  "in-review": "bg-brutal-lavender",
  done: "bg-brutal-lime",
  closed: "bg-brutal-stone",
};

export const TASK_FIXTURES: readonly TaskFixture[] = [
  {
    id: "task-142",
    taskNumber: 142,
    channelName: "proj-uiux",
    title: "Match the Tasks tab toolbar and board spacing",
    description: "Preserve the source hierarchy before connecting product state.",
    status: "todo",
    creatorId: "me",
    assigneeId: "atlas",
  },
  {
    id: "task-139",
    taskNumber: 139,
    channelName: "proj-uiux",
    title:
      "Verify a deliberately long task title wraps to three lines without pushing the status control outside the card",
    description:
      "The description also wraps and clamps so dense board columns remain scannable at the source width.",
    status: "todo",
    creatorId: "atlas",
    assigneeId: "me",
  },
  {
    id: "task-137",
    taskNumber: 137,
    channelName: "proj-task",
    title: "Connect keyboard drag feedback",
    description: "Announce allowed and blocked status targets.",
    status: "in-progress",
    creatorId: "me",
    assigneeId: "me",
  },
  {
    id: "task-126",
    taskNumber: 126,
    channelName: "proj-task",
    title: "Retire the legacy task inspector",
    status: "in-progress",
    isLegacy: true,
    creatorId: "atlas",
    assigneeId: "unassigned",
  },
  {
    id: "task-121",
    taskNumber: 121,
    channelName: "proj-uiux",
    title: "Review task filter empty states",
    description: "Compare empty, filtered empty, loading, and failure structures.",
    status: "in-review",
    creatorId: "atlas",
    assigneeId: "me",
  },
  {
    id: "task-118",
    taskNumber: 118,
    channelName: "proj-uiux",
    title: "Document the consumer-owned workflow boundary",
    status: "in-review",
    creatorId: "me",
    assigneeId: "atlas",
  },
  {
    id: "task-113",
    taskNumber: 113,
    channelName: "proj-uiux",
    title: "Ship source-faithful status badges",
    status: "done",
    creatorId: "me",
    assigneeId: "me",
  },
  {
    id: "task-104",
    taskNumber: 104,
    channelName: "proj-uiux",
    title: "Remove the retired board prototype",
    status: "closed",
    creatorId: "atlas",
    assigneeId: "unassigned",
  },
] as const;

export function getTaskStatusLabel(status: TaskStatus) {
  return TASK_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export function moveTaskFixture(
  tasks: readonly TaskFixture[],
  taskId: string,
  target: { status: TaskStatus; taskId?: string; placement?: "before" | "after" | null },
) {
  const task = tasks.find((item) => item.id === taskId);
  if (task == null) return tasks;

  const remaining = tasks.filter((item) => item.id !== taskId);
  const targetIndex =
    target.taskId == null ? -1 : remaining.findIndex((item) => item.id === target.taskId);
  const firstStatusIndex = remaining.findIndex((item) => item.status === target.status);
  const insertAt =
    targetIndex >= 0
      ? target.placement === "after"
        ? targetIndex + 1
        : targetIndex
      : firstStatusIndex < 0
        ? remaining.length
        : firstStatusIndex;
  const movedTask = task.status === target.status ? task : { ...task, status: target.status };

  return [...remaining.slice(0, insertAt), movedTask, ...remaining.slice(insertAt)];
}
