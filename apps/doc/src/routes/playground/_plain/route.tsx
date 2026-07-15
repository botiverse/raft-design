import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundPlainShell } from "#/playground/playground-plain-shell.tsx";

export const Route = createFileRoute("/playground/_plain")({
  component: PlaygroundPlainShell,
});
