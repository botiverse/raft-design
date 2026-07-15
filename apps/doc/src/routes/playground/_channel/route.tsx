import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundChannelShell } from "#/playground/playground-channel-shell.tsx";

export const Route = createFileRoute("/playground/_channel")({
  component: PlaygroundChannelShell,
});
