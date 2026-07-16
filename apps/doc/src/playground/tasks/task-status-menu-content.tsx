import { Check, CheckCircle, Circle, Eye, Play, Ban } from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "raft-ui";

import type { PlaygroundTaskId, PlaygroundTaskStatus } from "../mock/index.ts";
import { usePlaygroundTaskState } from "./task-state.tsx";

export const TASK_STATUS_CONFIG: Record<
  PlaygroundTaskStatus,
  {
    variant: "accent" | "information" | "muted" | "success" | "warning";
    icon: typeof Circle;
    label: string;
  }
> = {
  todo: { variant: "warning", icon: Circle, label: "Todo" },
  in_progress: { variant: "information", icon: Play, label: "In Progress" },
  in_review: { variant: "accent", icon: Eye, label: "In Review" },
  done: { variant: "success", icon: CheckCircle, label: "Done" },
  closed: { variant: "muted", icon: Ban, label: "Closed" },
};

export function TaskStatusMenuContent({
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
