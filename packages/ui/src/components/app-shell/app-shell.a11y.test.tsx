/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  AppShellMainSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  AppShellSidebarTrigger,
} from "./app-shell";

// jsdom has no ResizeObserver; the shell only uses it to measure the sidebar.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

afterEach(cleanup);

function Shell({ sidebarId }: { sidebarId?: string }) {
  return (
    <AppShellRoot sidebarCollapsible>
      <AppShellSidebarSlot id={sidebarId} data-testid="sidebar">
        <button type="button">Channel</button>
      </AppShellSidebarSlot>
      <AppShellMainSlot>
        <AppShellSidebarTrigger render={<button type="button" />}>icon</AppShellSidebarTrigger>
      </AppShellMainSlot>
    </AppShellRoot>
  );
}

test("the trigger says whether the sidebar is expanded, and names it, instead of being a toggle button", () => {
  // It shows and hides a region, so it is a disclosure (aria-expanded +
  // aria-controls), not a pressed/unpressed toggle (aria-pressed).
  render(<Shell />);
  const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
  const sidebar = screen.getByTestId("sidebar");
  expect(trigger.hasAttribute("aria-pressed")).toBe(false);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(sidebar.id).not.toBe("");
  expect(trigger.getAttribute("aria-controls")).toBe(sidebar.id);

  fireEvent.click(trigger);
  const collapsed = screen.getByRole("button", { name: "Expand sidebar" });
  expect(collapsed.getAttribute("aria-expanded")).toBe("false");
  expect(collapsed.getAttribute("aria-controls")).toBe(sidebar.id);
});

test("aria-controls follows an id the app gives the sidebar", () => {
  render(<Shell sidebarId="app-sidebar" />);
  expect(
    screen.getByRole("button", { name: "Collapse sidebar" }).getAttribute("aria-controls"),
  ).toBe("app-sidebar");
});

test("a collapsed sidebar is inert, so its controls leave the tab order and the accessibility tree", () => {
  render(<Shell />);
  const sidebar = screen.getByTestId("sidebar");
  expect(sidebar.hasAttribute("inert")).toBe(false);

  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(sidebar.hasAttribute("inert")).toBe(true);

  fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
  expect(sidebar.hasAttribute("inert")).toBe(false);
});
