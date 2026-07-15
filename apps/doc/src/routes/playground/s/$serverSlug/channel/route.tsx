import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundChannelShell } from "#/playground/playground-channel-shell.tsx";
import { validatePlaygroundChannelSearch } from "#/playground/playground-search.ts";

export const Route = createFileRoute("/playground/s/$serverSlug/channel")({
  validateSearch: validatePlaygroundChannelSearch,
  component: PlaygroundChannelShell,
});
