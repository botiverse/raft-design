import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundSearchPanel } from "#/playground/search/playground-search-panel.tsx";

export const Route = createFileRoute("/playground/_plain/search")({
  component: PlaygroundSearchPanel,
});
