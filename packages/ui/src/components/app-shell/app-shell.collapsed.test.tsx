/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AppShellRoot, AppShellSidebarSlot } from "./app-shell";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (typeof window.ResizeObserver !== "function") {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.ResizeObserver;
}

afterEach(cleanup);

// A collapsed sidebar is painted away with opacity and pointer-events, which
// leaves its links and buttons in the tab order inside an aria-hidden subtree.
// `inert` is what actually removes them from both focus navigation and the
// accessibility tree; these pin that attribute, not the visual state.

function renderSidebar(props: { collapsible?: boolean; defaultOpen?: boolean } = {}) {
  const { collapsible = true, defaultOpen } = props;
  return render(
    <ThemeProvider theme="elegant">
      <AppShellRoot sidebarCollapsible={collapsible} defaultSidebarOpen={defaultOpen ?? true}>
        <AppShellSidebarSlot data-testid="sidebar" />
      </AppShellRoot>
    </ThemeProvider>,
  );
}

test("collapsed sidebar leaves the tab order and accessibility tree", () => {
  renderSidebar({ defaultOpen: false });
  const sidebar = screen.getByTestId("sidebar");
  expect(sidebar.hasAttribute("inert")).toBe(true);
  expect(sidebar.getAttribute("aria-hidden")).toBe("true");
});

test("expanded sidebar stays reachable", () => {
  renderSidebar({ defaultOpen: true });
  const sidebar = screen.getByTestId("sidebar");
  expect(sidebar.hasAttribute("inert")).toBe(false);
  expect(sidebar.getAttribute("aria-hidden")).toBeNull();
});

test("non-collapsible sidebar is never made inert", () => {
  renderSidebar({ collapsible: false, defaultOpen: false });
  const sidebar = screen.getByTestId("sidebar");
  expect(sidebar.hasAttribute("inert")).toBe(false);
  expect(sidebar.getAttribute("aria-hidden")).toBeNull();
});
