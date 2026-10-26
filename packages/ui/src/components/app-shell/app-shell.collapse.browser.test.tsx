import "./app-shell.test.css";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  AppShellMainSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  AppShellSidebarTrigger,
} from "./app-shell";

const it = test.skipIf(typeof window === "undefined");

beforeEach(async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

// A sidebar with a resize handle poking 6px past its right edge, the main area
// with the trigger, and an app-level bar fixed at z-40 over the main area (like
// an app's "continue setup" bar).
function renderShell() {
  render(
    <ThemeProvider>
      <AppShellRoot sidebarCollapsible className="h-[400px] w-[1000px]">
        <AppShellSidebarSlot className="relative flex w-[240px]" data-testid="sidebar">
          <button type="button" data-testid="sidebar-button">
            Channel
          </button>
          <div data-testid="handle" className="absolute inset-y-0 -right-1.5 z-10 w-3" />
        </AppShellSidebarSlot>
        <div className="relative flex min-w-0 flex-1">
          <AppShellMainSlot data-testid="main">
            <AppShellSidebarTrigger render={<button type="button" />}>icon</AppShellSidebarTrigger>
          </AppShellMainSlot>
        </div>
      </AppShellRoot>
      <div data-testid="app-bar" className="fixed top-[300px] left-[500px] z-40 h-10 w-40" />
    </ThemeProvider>,
  );
  return {
    main: screen.getByTestId("main"),
    sidebar: screen.getByTestId("sidebar"),
  };
}

function hitAt(testId: string) {
  const rect = screen.getByTestId(testId).getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

it("the main area has no z-index, so app-level bars at z-40 stay on top", () => {
  const { main } = renderShell();
  expect(getComputedStyle(main).zIndex).toBe("auto");
  expect(hitAt("app-bar")).toBe(screen.getByTestId("app-bar"));

  fireEvent.click(screen.getByRole("button", { name: "Collapse Sidebar" }));
  expect(getComputedStyle(main).zIndex).toBe("auto");
  expect(hitAt("app-bar")).toBe(screen.getByTestId("app-bar"));
});

// stdrc (#proj-raft-ui:639854ff): collapsing and expanding switch at once, by
// the toggle or by dragging past the end, the same as Focus Mode. A slide of a
// whole column flickers.
it("collapsing and expanding the sidebar switch at once, without a transition", () => {
  const { main, sidebar } = renderShell();
  const noTransition = (element: HTMLElement) => {
    const { transitionDuration } = getComputedStyle(element);
    return transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0);
  };
  expect(noTransition(main)).toBe(true);
  expect(noTransition(sidebar)).toBe(true);

  fireEvent.click(screen.getByRole("button", { name: "Collapse Sidebar" }));
  expect(main.getAnimations()).toHaveLength(0);
  expect(sidebar.getAnimations()).toHaveLength(0);
  expect(getComputedStyle(sidebar).opacity).toBe("0");

  fireEvent.click(screen.getByRole("button", { name: "Expand Sidebar" }));
  expect(main.getAnimations()).toHaveLength(0);
  expect(getComputedStyle(sidebar).opacity).toBe("1");
});

it("the expanded sidebar stacks above the main area, so what pokes past its edge stays grabbable", () => {
  renderShell();
  const handle = screen.getByTestId("handle");
  const rect = handle.getBoundingClientRect();
  // The handle's outer half, over the main area.
  expect(document.elementFromPoint(rect.right - 2, rect.top + rect.height / 2)).toBe(handle);
});

it("a collapsed sidebar cannot take focus", async () => {
  const { sidebar } = renderShell();
  const inside = screen.getByTestId("sidebar-button");
  fireEvent.click(screen.getByRole("button", { name: "Collapse Sidebar" }));
  await waitFor(() => expect(sidebar.getAttribute("aria-hidden")).toBe("true"));
  inside.focus();
  expect(document.activeElement).not.toBe(inside);
});
