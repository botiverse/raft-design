import { createContext, type Dispatch, type SetStateAction } from "react";

import type { PlaygroundTask } from "../mock/index.ts";

export type PlaygroundTaskState = {
  tasks: readonly PlaygroundTask[];
  setTasks: Dispatch<SetStateAction<readonly PlaygroundTask[]>>;
};

export const PlaygroundTaskStateContext = createContext<PlaygroundTaskState | null>(null);
