import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundSavedPanel } from "#/playground/saved/playground-saved-panel.tsx";

export const Route = createFileRoute("/playground/s/$serverSlug/saved")({
  component: PlaygroundSavedPanel,
});
