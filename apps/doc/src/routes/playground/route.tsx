import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundShell } from "#/playground/playground-shell.tsx";
import { validatePlaygroundSearch } from "#/playground/playground-search.ts";

export const Route = createFileRoute("/playground")({
  staticData: { standalone: true },
  validateSearch: validatePlaygroundSearch,
  component: PlaygroundShell,
});
