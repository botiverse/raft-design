import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "raft-ui";

import { NavRow } from "./sidebar.tsx";

/**
 * The docs sidebar rows must consume the rui sidebar-item recipe instead of hand-rolled,
 * theme-blind classes: brutal items are square with a hard border/shadow, elegant items
 * keep the rounded, borderless look. Before this, both themes rendered the exact same row
 * (6px radius / no border / weight 400), so this test fails if the wiring regresses.
 *
 * Only the non-routed branches (`docsHref`, plain rows) are rendered here: the `to` branch
 * renders a TanStack `<Link>` and needs a router that these unit tests do not mount. All
 * branches share the same `SidebarItem` wrapper, so the theme assertions cover the row.
 */
const docsItem = { label: "Accordion", docsHref: "https://base-ui.com/react/components/accordion" };

function renderRow(theme: "brutal" | "elegant") {
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} syncDom={false}>
      <NavRow item={docsItem} />
    </ThemeProvider>,
  );
}

describe("docs sidebar nav rows", () => {
  it("renders through the rui sidebar item slots", () => {
    const markup = renderRow("brutal");
    expect(markup).toContain('data-slot="sidebar-item"');
    expect(markup).toContain('data-slot="sidebar-item-content"');
    expect(markup).toContain('data-slot="sidebar-item-title"');
  });

  it("takes the brutal form in the brutal theme", () => {
    const markup = renderRow("brutal");
    expect(markup).toContain("border-transparent");
    expect(markup).toContain("hover:border-black");
    expect(markup).toContain("hover:shadow-raft-sm");
    expect(markup).not.toContain("rounded-md");
  });

  it("takes the elegant form in the elegant theme", () => {
    const markup = renderRow("elegant");
    expect(markup).toContain("rounded-md");
    expect(markup).toContain("hover:bg-fill-strong/80");
    expect(markup).not.toContain("hover:border-black");
  });

  it("keeps the docs focus affordance on the row itself", () => {
    expect(renderRow("brutal")).toContain("focus-visible:ring-[0.5px]");
    expect(renderRow("elegant")).toContain("focus-visible:ring-[0.5px]");
  });
});
