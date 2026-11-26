import "../dropdown-menu/dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";

// A context menu grows to fit its longest item, capped by the window, as a
// DropdownMenu does (dropdown-menu.md › Width): an item longer than the
// window wraps inside the menu, which stays within the window.
// Revert to fail: context-menu.tsx, the content slot without `max-w-(--available-width)`.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

// Base UI's own collision padding from the window's edge.
const PADDING = 5;

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

// The trigger covers the window, so a right-click opens the menu anywhere.
const WHOLE_WINDOW = { position: "fixed", inset: 0, display: "block" } as const;

const LONG = "Move this conversation to the archived section of another server";

it("keeps a context menu with an item longer than the window inside it", async () => {
  await setViewport(320, 640);
  render(
    <ContextMenu>
      <ContextMenuTrigger data-testid="area" style={WHOLE_WINDOW} />
      <ContextMenuContent aria-label="Actions" data-testid="menu">
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>{LONG}</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 40, clientY: 40, button: 2 });
  const menu = await waitFor(() => screen.getByTestId("menu"));
  await settle();
  expect(rect(menu).left).toBeGreaterThanOrEqual(PADDING - 0.5);
  expect(rect(menu).right).toBeLessThanOrEqual(320 - PADDING + 0.5);
  const scroller = menu.querySelector<HTMLElement>("[data-slot=context-menu-scroll]")!;
  expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth + 1);
  const item = screen.getByRole("menuitem", { name: LONG });
  expect(rect(item).right).toBeLessThanOrEqual(rect(menu).right);
  expect(rect(item).height).toBeGreaterThan(
    rect(screen.getByRole("menuitem", { name: "Rename" })).height,
  );
});
