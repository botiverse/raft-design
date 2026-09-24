import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundTopicsEmptyState } from "#/playground/topics/topics-empty-state.tsx";

export const Route = createFileRoute("/playground/topics/")({
  component: PlaygroundTopicsEmptyState,
});
