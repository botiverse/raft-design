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

it("at rest the main area has no z-index, so app-level bars at z-40 stay on top", async () => {
  const { main } = renderShell();
  expect(getComputedStyle(main).zIndex).toBe("auto");
  expect(hitAt("app-bar")).toBe(screen.getByTestId("app-bar"));

  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  await waitFor(() => expect(main.hasAttribute("data-sliding")).toBe(false), { timeout: 2000 });
  expect(getComputedStyle(main).zIndex).toBe("auto");
  expect(hitAt("app-bar")).toBe(screen.getByTestId("app-bar"));
});

it("the main area rises over the sidebar only while it slides", async () => {
  const { main } = renderShell();
  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  expect(main.hasAttribute("data-sliding")).toBe(true);
  expect(getComputedStyle(main).zIndex).toBe("45");
  await waitFor(() => expect(getComputedStyle(main).zIndex).toBe("auto"), { timeout: 2000 });

  fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
  expect(getComputedStyle(main).zIndex).toBe("45");
  await waitFor(() => expect(getComputedStyle(main).zIndex).toBe("auto"), { timeout: 2000 });
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
  fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
  await waitFor(() => expect(sidebar.getAttribute("aria-hidden")).toBe("true"));
  inside.focus();
  expect(document.activeElement).not.toBe(inside);
});
