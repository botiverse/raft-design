export type PlaygroundRailView =
  | "search"
  | "chat"
  | "topics"
  | "activity"
  | "tasks"
  | "members"
  | "computers"
  | "settings";

export type PlaygroundPanelTab = "chat" | "tasks" | "files";

const playgroundRailViews = new Set<PlaygroundRailView>([
  "search",
  "chat",
  "topics",
  "activity",
  "tasks",
  "members",
  "computers",
  "settings",
]);

export function isPlaygroundRailView(value: string): value is PlaygroundRailView {
  return playgroundRailViews.has(value as PlaygroundRailView);
}
