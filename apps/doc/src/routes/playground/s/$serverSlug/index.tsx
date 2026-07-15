import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundChannelEmptyState } from "#/playground/playground-channel-empty-state.tsx";

export const Route = createFileRoute("/playground/s/$serverSlug/")({
  component: PlaygroundChannelEmptyState,
});
