import { TaskChip, TaskStatusIcon } from "raft-ui";

import { TaskStatusSelect } from "#/modules/task-card/compositions/task-status-select.composition.tsx";
import type { PlaygroundTaskId } from "../mock/index.ts";
import { usePlaygroundTask, usePlaygroundTaskState } from "./use-playground-task-state.ts";

export function TaskStatusBadge({
  taskId,
  assignee,
  loading,
}: {
  taskId: PlaygroundTaskId;
  assignee?: string;
  loading?: boolean;
}) {
  const task = usePlaygroundTask(taskId);
  const { setTasks } = usePlaygroundTaskState();
  const { number: taskNumber, status } = task;
  const fullLabel = assignee ? `task #${taskNumber} @${assignee}` : `task #${taskNumber}`;

  return (
    <TaskStatusSelect
      value={status}
      disabled={loading}
      onValueChange={(nextStatus) =>
        setTasks((tasks) =>
          tasks.map((candidate) =>
            candidate.id === task.id ? { ...candidate, status: nextStatus } : candidate,
          ),
        )
      }
    >
      <TaskChip
        status={status}
        loading={loading}
        render={
          <button
            type="button"
            disabled={loading}
            title={`${fullLabel} · Change task status`}
            aria-label={`Change status for ${fullLabel}`}
          />
        }
      >
        <TaskStatusIcon status={status} />
        <span>#{taskNumber}</span>
        {assignee ? <span>@{assignee}</span> : null}
      </TaskChip>
    </TaskStatusSelect>
  );
}
