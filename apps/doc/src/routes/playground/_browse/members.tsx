import { createFileRoute } from "@tanstack/react-router";

import { PlaygroundRailViewPanel } from "#/playground/browse/playground-rail-views.tsx";

export const Route = createFileRoute("/playground/_browse/members")({
  component: () => <PlaygroundRailViewPanel view="members" />,
});
