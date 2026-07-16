import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundTasksPanel } from "#/playground/tasks/tasks-panel.tsx";

export const Route = createFileRoute("/playground/_plain/tasks")({
  component: PlaygroundTasksPanel,
});
