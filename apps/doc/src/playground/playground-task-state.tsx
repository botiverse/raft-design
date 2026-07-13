import {
  createContext,
  use,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { PLAYGROUND_TASKS, type PlaygroundTask, type PlaygroundTaskId } from "./mock/index.ts";
import { PlaygroundMessageWorkflowProvider } from "./playground-message-workflow-state.tsx";

type PlaygroundTaskState = {
  tasks: readonly PlaygroundTask[];
  setTasks: Dispatch<SetStateAction<readonly PlaygroundTask[]>>;
};

const PlaygroundTaskStateContext = createContext<PlaygroundTaskState | null>(null);

export function PlaygroundTaskStateProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<readonly PlaygroundTask[]>(() =>
    PLAYGROUND_TASKS.map((task) => ({ ...task })),
  );
  const value = useMemo(() => ({ tasks, setTasks }), [tasks]);

  return (
    <PlaygroundTaskStateContext value={value}>
      <PlaygroundMessageWorkflowProvider>{children}</PlaygroundMessageWorkflowProvider>
    </PlaygroundTaskStateContext>
  );
}

export function usePlaygroundTaskState() {
  const state = use(PlaygroundTaskStateContext);
  if (!state)
    throw new Error("usePlaygroundTaskState must be used inside PlaygroundTaskStateProvider");
  return state;
}

export function usePlaygroundTask(taskId: PlaygroundTaskId): PlaygroundTask {
  const { tasks } = usePlaygroundTaskState();
  const task = tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Unknown playground task: ${taskId}`);
  return task;
}
