import { Check } from "lucide-react";
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "raft-ui";

import type { PlaygroundTaskId, PlaygroundTaskStatus } from "../mock/index.ts";
import { usePlaygroundTask, usePlaygroundTaskState } from "./use-playground-task-state.ts";
import { TASK_STATUS_CONFIG } from "./task-status-config.ts";

export function TaskStatusBadge({
  taskId,
  assignee,
  busy,
}: {
  taskId: PlaygroundTaskId;
  assignee?: string;
  busy?: boolean;
}) {
  const task = usePlaygroundTask(taskId);
  const { number: taskNumber, status } = task;
  const config = TASK_STATUS_CONFIG[status];
  const Icon = config.icon;
  const fullLabel = assignee ? `task #${taskNumber} @${assignee}` : `task #${taskNumber}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <TaskStatusBadgeTrigger variant={config.variant} busy={busy} fullLabel={fullLabel} />
        }
      >
        <Icon size={10} />
        <span>#{taskNumber}</span>
        {assignee ? <span>@{assignee}</span> : null}
      </DropdownMenuTrigger>
      <TaskStatusMenuContent taskId={task.id} status={status} />
    </DropdownMenu>
  );
}

function TaskStatusBadgeTrigger({
  variant,
  busy,
  fullLabel,
}: {
  variant: (typeof TASK_STATUS_CONFIG)[PlaygroundTaskStatus]["variant"];
  busy?: boolean;
  fullLabel: string;
}) {
  return (
    <Badge
      appearance="solid"
      variant={variant}
      render={
        <button
          type="button"
          disabled={busy}
          title={`${fullLabel} · Change task status`}
          aria-label={`Change status for ${fullLabel}`}
        />
      }
    />
  );
}

function TaskStatusMenuContent({
  taskId,
  status,
}: {
  taskId: PlaygroundTaskId;
  status: PlaygroundTaskStatus;
}) {
  const { setTasks } = usePlaygroundTaskState();

  return (
    <DropdownMenuContent align="start" className="min-w-[140px]">
      {Object.keys(TASK_STATUS_CONFIG).map((id) => {
        const taskStatus = id as PlaygroundTaskStatus;
        return (
          <DropdownMenuItem
            key={taskStatus}
            onClick={() =>
              setTasks((tasks) =>
                tasks.map((candidate) =>
                  candidate.id === taskId ? { ...candidate, status: taskStatus } : candidate,
                ),
              )
            }
          >
            <span>{TASK_STATUS_CONFIG[taskStatus].label}</span>
            {taskStatus === status ? <Check size={14} /> : null}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuContent>
  );
}
