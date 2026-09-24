import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundTopicsShell } from "#/playground/topics/topics-shell.tsx";

export const Route = createFileRoute("/playground/topics")({
  component: PlaygroundTopicsShell,
});
