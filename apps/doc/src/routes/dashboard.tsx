import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
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
 * reference example, and the docs chrome is what carries the light/dark switcher
 * and the nav. Standalone, you could not switch modes while looking at it —
 * which is most of the reason to have a data-dense example at all (@xxchan).
 */
export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute,
});

const TOC = [{ id: "dashboard", title: "Agent usage" }];

function DashboardRoute() {
  return (
    <DocPage
      title="Dashboard"
      description="A data-dense example app: KPI summary, filters, a table with numeric columns and status, and row drill-down. Switch between light and dark from the header to compare them at density."
      toc={TOC}
    >
      {/* DocSection, not a bare DocPage child: the light/dark switcher is a
          DocSection affordance (`showThemeSwitcher`), and being able to compare
          light against dark on a data-dense surface is the whole reason this
          example exists. Wrapping in DocPage alone gave the nav back but
          silently left the switcher out (@xxchan asked for both). */}
      <DocSection id="dashboard" title="Agent usage" showThemeSwitcher>
        <DashboardApp />
      </DocSection>
    </DocPage>
  );
}
