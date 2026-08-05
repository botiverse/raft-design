import {
  getPlaygroundTask,
  getPlaygroundThread,
  isPlaygroundTaskId,
  isPlaygroundThreadId,
  type PlaygroundTaskId,
  type PlaygroundThreadId,
} from "../mock/index.ts";

export type PlaygroundSearch = {
  content?: string;
  context?: string;
  detail?: string;
  query?: string;
  surface?: string;
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
  return {
    ...(typeof search.content === "string" && search.content.length > 0
      ? { content: search.content }
      : {}),
    ...(typeof search.context === "string" && search.context.length > 0
      ? { context: search.context }
      : {}),
    ...(typeof search.detail === "string" && search.detail.length > 0
      ? { detail: search.detail }
      : {}),
    ...(typeof search.query === "string" && search.query.length > 0 ? { query: search.query } : {}),
    ...(typeof search.surface === "string" && search.surface.length > 0
      ? { surface: search.surface }
      : {}),
  };
}

export function validatePlaygroundChannelSearch(
  search: Record<string, unknown>,
): PlaygroundChannelSearch {
  const legacyTask =
    typeof search.legacyTask === "string" && isPlaygroundTaskId(search.legacyTask)
      ? search.legacyTask
      : undefined;
  const thread =
    !legacyTask &&
    typeof search.thread === "string" &&
    (isPlaygroundThreadId(search.thread) || isPlaygroundTaskId(search.thread))
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

export function getPlaygroundSidePanelOwner(
  search: Pick<PlaygroundChannelSearch, "legacyTask" | "thread">,
) {
  if (search.legacyTask) {
    const task = getPlaygroundTask(search.legacyTask);
    return task?.legacy ? task.channelId : undefined;
  }
  if (!search.thread) return undefined;

  const thread = getPlaygroundThread(search.thread);
  if (thread) return thread.channelId;

  const task = isPlaygroundTaskId(search.thread) ? getPlaygroundTask(search.thread) : undefined;
  return task && !task.legacy ? task.channelId : undefined;
}
