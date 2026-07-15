import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundTasksPanel } from "#/playground/playground-tasks-panel.tsx";

export const Route = createFileRoute("/playground/_plain/tasks")({
  component: PlaygroundTasksPanel,
});
