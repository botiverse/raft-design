import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DashboardApp } from "#/dashboard/dashboard-app.tsx";

/**
 * Second example app, a sibling to Playground rather than a page inside it.
 *
 * `playground/CLAUDE.md` defines Playground as ONE coherent mock product (the
 * chat/collaboration shape). A dashboard is a different archetype, so folding it
 * in would contradict that contract.
 *
 * Rendered INSIDE the docs shell, not as a standalone page like Playground.
 * Playground simulates a whole product and wants the viewport; this is a
 * reference example, and the docs chrome is what carries the theme switcher and
 * the nav. Standalone, you could not switch brutal/elegant while looking at it —
 * which is most of the reason to have a data-dense example at all (@xxchan).
 */
export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DocPage
      title="Dashboard"
      description="A data-dense example app: KPI summary, filters, a table with numeric columns and status, and row drill-down. Switch themes from the header to compare brutal and elegant at density."
      toc={[]}
      showToc={false}
    >
      <DashboardApp />
    </DocPage>
  );
}
