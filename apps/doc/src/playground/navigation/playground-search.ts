import {
  isPlaygroundTaskId,
  isPlaygroundThreadId,
  type PlaygroundTaskId,
  type PlaygroundThreadId,
} from "../mock/index.ts";

export type PlaygroundSearch = {
  detail?: string;
};

export type PlaygroundChannelSearch = {
  from?: "tasks";
  /** Mobile conversation-list mode while a channel stays selected in the URL. */
  panel?: "list";
  thread?: PlaygroundThreadId;
  /** Mutually exclusive with `thread` — legacy tasks have no message thread. */
  legacyTask?: PlaygroundTaskId;
};

export function validatePlaygroundSearch(search: Record<string, unknown>): PlaygroundSearch {
  return typeof search.detail === "string" && search.detail.length > 0
    ? { detail: search.detail }
    : {};
}

export function validatePlaygroundChannelSearch(
  search: Record<string, unknown>,
): PlaygroundChannelSearch {
  const legacyTask =
    typeof search.legacyTask === "string" && isPlaygroundTaskId(search.legacyTask)
      ? search.legacyTask
      : undefined;
  const thread =
    !legacyTask && typeof search.thread === "string" && isPlaygroundThreadId(search.thread)
      ? search.thread
      : undefined;
  const sidePanel = Boolean(legacyTask || thread);

  return {
    ...(search.panel === "list" ? { panel: "list" as const } : {}),
    ...(legacyTask ? { legacyTask } : {}),
    ...(thread ? { thread } : {}),
    ...(sidePanel && search.from === "tasks" ? { from: "tasks" as const } : {}),
  };
}
