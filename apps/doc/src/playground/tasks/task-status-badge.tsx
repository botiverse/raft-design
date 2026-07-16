import { Badge, DropdownMenu, DropdownMenuTrigger } from "raft-ui";

import type { PlaygroundTaskId } from "../mock/index.ts";
import { usePlaygroundTask } from "./task-state.tsx";
import { TASK_STATUS_CONFIG, TaskStatusMenuContent } from "./task-status-menu-content.tsx";

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
          <Badge
            appearance="solid"
            variant={config.variant}
            render={
              <button
                type="button"
                disabled={busy}
                title={`${fullLabel} · Change task status`}
                aria-label={`Change status for ${fullLabel}`}
              />
            }
          />
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
