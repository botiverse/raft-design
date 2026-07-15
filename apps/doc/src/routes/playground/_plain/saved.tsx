import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundRailViewPanel } from "#/playground/playground-rail-views.tsx";

export const Route = createFileRoute("/playground/_plain/saved")({
  component: () => <PlaygroundRailViewPanel view="saved" />,
});
