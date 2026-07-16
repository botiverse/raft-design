import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundShell } from "#/playground/app-shell/playground-shell.tsx";
import { validatePlaygroundSearch } from "#/playground/navigation/playground-search.ts";

export const Route = createFileRoute("/playground")({
  ssr: false,
  staticData: { standalone: true },
  validateSearch: validatePlaygroundSearch,
  component: PlaygroundShell,
});
