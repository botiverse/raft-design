import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundBrowseShell } from "#/playground/browse/playground-browse-shell.tsx";

export const Route = createFileRoute("/playground/_browse")({
  component: PlaygroundBrowseShell,
});
