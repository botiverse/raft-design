import { isPlaygroundThreadId, type PlaygroundThreadId } from "./mock/index.ts";

export type PlaygroundSearch = {
  detail?: string;
  from?: "tasks";
  /** Mobile conversation-list mode while a channel stays selected in the URL. */
  panel?: "list";
  thread?: PlaygroundThreadId;
};

export function validatePlaygroundSearch(search: Record<string, unknown>): PlaygroundSearch {
  const thread =
    typeof search.thread === "string" && isPlaygroundThreadId(search.thread)
      ? search.thread
      : undefined;

  return {
    ...(typeof search.detail === "string" && search.detail.length > 0
      ? { detail: search.detail }
      : {}),
    ...(search.panel === "list" ? { panel: "list" as const } : {}),
    ...(thread ? { thread } : {}),
    ...(thread && search.from === "tasks" ? { from: "tasks" as const } : {}),
  };
}
