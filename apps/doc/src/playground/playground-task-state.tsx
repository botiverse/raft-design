import { createContext, use, useMemo, useState, type ReactNode } from "react";

import { PLAYGROUND_TASKS, type PlaygroundTask } from "./mock/index.ts";

type PlaygroundTaskState = {
  tasks: readonly PlaygroundTask[];
  setTasks: (tasks: readonly PlaygroundTask[]) => void;
};

const PlaygroundTaskStateContext = createContext<PlaygroundTaskState | null>(null);

export function PlaygroundTaskStateProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<readonly PlaygroundTask[]>(() =>
    PLAYGROUND_TASKS.map((task) => ({ ...task })),
  );
  const value = useMemo(() => ({ tasks, setTasks }), [tasks]);

  return <PlaygroundTaskStateContext value={value}>{children}</PlaygroundTaskStateContext>;
}

export function usePlaygroundTaskState() {
  const state = use(PlaygroundTaskStateContext);
  if (!state)
    throw new Error("usePlaygroundTaskState must be used inside PlaygroundTaskStateProvider");
  return state;
}
