import "./panel-header.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelTitle,
} from "./panel-header";

// Artea (task #655, 2026-09-28): in a channel header the channel name comes
// first. On desktop the name and the description share one row; when the row
// is narrow the description gives way (truncates, then disappears) and the
// name stays whole. The name itself only truncates when it alone is wider than
// the row. Measured in a real browser — jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  // `md:` is a viewport breakpoint; the one-row layout only exists at >= 768px.
  // Imported lazily: CI also loads this file in the node pool, where the
  // browser context module refuses to import and every test is skipped anyway.
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

const DESCRIPTION =
  "Raft web frontend. DRI: someone with a long name, plus the deploy checklist and the on-call rota";

function renderHeader(width: number, name: string) {
  render(
    <ThemeProvider theme="elegant">
      <div style={{ width: `${width}px` }}>
        <PanelHeader>
          <PanelHeaderContent>
            <PanelHeading>
              <PanelTitle>{name}</PanelTitle>
            </PanelHeading>
            <PanelMeta data-testid="meta">{DESCRIPTION}</PanelMeta>
          </PanelHeaderContent>
        </PanelHeader>
      </div>
    </ThemeProvider>,
  );
  const title = screen.getByText(name);
  const meta = screen.getByTestId("meta");
  const truncated = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1;
  return { title, meta, truncated };
}

for (const width of [420, 300, 220]) {
  it(`elegant ${width}px: a short name stays whole and the description gives way`, () => {
    const { title, meta, truncated } = renderHeader(width, "proj-frontend");
    expect(truncated(title)).toBe(false);
    // The description is either cut short or has no room left at all.
    expect(truncated(meta) || meta.getBoundingClientRect().width <= 1).toBe(true);
  });
}

it("elegant: a name longer than the row truncates, and the description takes no space", () => {
  const name = "a-very-long-channel-name-that-cannot-possibly-fit-in-this-header-row";
  const { title, meta, truncated } = renderHeader(260, name);
  expect(truncated(title)).toBe(true);
  expect(meta.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(
    title.closest("[data-slot=panel-header-content]")!.getBoundingClientRect().right + 0.5,
  );
});

it("elegant: with room to spare, both the name and the full description show", () => {
  const { title, meta, truncated } = renderHeader(1100, "proj-frontend");
  expect(truncated(title)).toBe(false);
  expect(truncated(meta)).toBe(false);
});
