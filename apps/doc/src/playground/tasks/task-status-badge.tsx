import { MessageItemTaskBadge, TaskStatusIcon } from "raft-ui/wip";

import { TaskStatusSelect } from "#/modules/task-card/compositions/task-status-select.composition.tsx";
import type { PlaygroundTaskId } from "../mock/index.ts";
import { usePlaygroundTask, usePlaygroundTaskState } from "./use-playground-task-state.ts";

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
  const { setTasks } = usePlaygroundTaskState();
  const { number: taskNumber, status } = task;
  const fullLabel = assignee ? `task #${taskNumber} @${assignee}` : `task #${taskNumber}`;

  return (
    <TaskStatusSelect
      value={status}
      disabled={busy}
      onValueChange={(nextStatus) =>
        setTasks((tasks) =>
          tasks.map((candidate) =>
            candidate.id === task.id ? { ...candidate, status: nextStatus } : candidate,
          ),
        )
      }
    >
      <MessageItemTaskBadge
        status={status}
        busy={busy}
        render={
          <button
            type="button"
            disabled={busy}
            title={`${fullLabel} · Change task status`}
            aria-label={`Change status for ${fullLabel}`}
          />
        }
      >
        <TaskStatusIcon status={status} />
        <span>#{taskNumber}</span>
        {assignee ? <span>@{assignee}</span> : null}
      </MessageItemTaskBadge>
    </TaskStatusSelect>
  );
}
