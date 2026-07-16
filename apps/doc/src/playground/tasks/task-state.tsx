import { useMemo, useState, type ReactNode } from "react";

import { PLAYGROUND_TASKS, type PlaygroundTask } from "../mock/index.ts";
import { PlaygroundMessageWorkflowProvider } from "../message/playground-message-workflow-state.tsx";
import { PlaygroundTaskStateContext } from "./task-state-context.ts";

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
