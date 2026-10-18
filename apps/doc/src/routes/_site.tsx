import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SiteShell } from "#/components/site/site-shell.tsx";

// Pages rendered from the Markdown docs, in the documentation site's own shell
// (apps/doc/DESIGN.md). Pathless: the children keep their URLs.
export const Route = createFileRoute("/_site")({
  staticData: { standalone: true },
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
