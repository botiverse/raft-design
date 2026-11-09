import "./app-rail.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { AppRailFooter, AppRailItem, AppRailRoot } from "./app-rail";

const it = test.skipIf(typeof window === "undefined");

// Raft DS › Page structure › Frame insets: in a window with rounded corners
// (macOS, not full screen) the shell publishes --raft-frame-corner-bottom, and
// the rail's footer keeps its last item at least that far from the bottom
// edge, so the corner's curve doesn't crowd it (stdrc, 2026-11-09). The web
// sets none, and the footer keeps its own inset.
afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty("--raft-frame-corner-bottom");
});

function renderRail() {
  render(
    <AppRailRoot>
      <AppRailFooter data-testid="footer">
        <AppRailItem aria-label="Settings" />
      </AppRailFooter>
    </AppRailRoot>,
  );
  return () => parseFloat(getComputedStyle(screen.getByTestId("footer")).paddingBottom);
}

it("keeps its own inset where the shell sets no window corner", () => {
  const bottom = renderRail();
  expect([6, 8]).toContain(bottom());
});

it("clears the window's bottom corner where the shell sets one", () => {
  document.documentElement.style.setProperty("--raft-frame-corner-bottom", "12px");
  const bottom = renderRail();
  expect(bottom()).toBe(12);
});

it("never comes closer than its own inset for a small corner", () => {
  const base = renderRail()();
  cleanup();
  document.documentElement.style.setProperty("--raft-frame-corner-bottom", "2px");
  expect(renderRail()()).toBe(base);
});
