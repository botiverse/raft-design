import { createFileRoute } from "@tanstack/react-router";

import { DashboardApp } from "#/dashboard/dashboard-app.tsx";

/**
 * Second example app, a sibling to Playground rather than a page inside it.
 *
 * `playground/CLAUDE.md` defines Playground as ONE coherent mock product (the
 * chat/collaboration shape). A dashboard is a different archetype, so folding it
 * in would contradict that contract.
 */
export const Route = createFileRoute("/dashboard")({
  ssr: false,
  staticData: { standalone: true },
  component: DashboardApp,
});
