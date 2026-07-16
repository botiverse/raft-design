import { use } from "react";

import type { PlaygroundTask, PlaygroundTaskId } from "../mock/index.ts";
import { PlaygroundTaskStateContext } from "./task-state-context.ts";

export function usePlaygroundTaskState() {
  const state = use(PlaygroundTaskStateContext);
  if (!state) {
    throw new Error("usePlaygroundTaskState must be used inside PlaygroundTaskStateProvider");
  }
  return state;
}

export function usePlaygroundTask(taskId: PlaygroundTaskId): PlaygroundTask {
  const { tasks } = usePlaygroundTaskState();
  const task = tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown playground task: ${taskId}`);
  return task;
}
