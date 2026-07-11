export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

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
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
  { id: "closed", label: "Closed" },
] as const satisfies readonly { id: TaskStatus; label: string }[];

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
    status: "in_progress",
    creatorId: "me",
    assigneeId: "me",
  },
  {
    id: "task-126",
    taskNumber: 126,
    channelName: "proj-task",
    title: "Retire the legacy task inspector",
    status: "in_progress",
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
    status: "in_review",
    creatorId: "atlas",
    assigneeId: "me",
  },
  {
    id: "task-118",
    taskNumber: 118,
    channelName: "proj-uiux",
    title: "Document the consumer-owned workflow boundary",
    status: "in_review",
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
