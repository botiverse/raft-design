import "../dropdown-menu/dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  ContextMenuTrigger,
} from "./context-menu";

// A context menu's submenu goes where a DropdownMenu's does (lib/list-popup.ts,
// SUBMENU_POSITION): beside its item, flipped to the other side where only
// that side has room, and slid along the window's edge, level with its item,
// where neither has.

const it = test.skipIf(typeof window === "undefined");

function rect(element: Element) {
  return element.getBoundingClientRect();
}

function settle(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

async function press(key: string) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.keyboard(key);
  await settle(120);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

// The trigger covers the window, so a right-click opens the menu anywhere.
const WHOLE_WINDOW = { position: "fixed", inset: 0, display: "block" } as const;

function Menu({ items }: { items: number }) {
  return (
    <ThemeProvider mode="light">
      <ContextMenu>
        <ContextMenuTrigger data-testid="area" style={WHOLE_WINDOW} />
        <ContextMenuContent aria-label="Actions" data-testid="menu">
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuSubmenu>
            <ContextMenuSubmenuTrigger data-testid="more">Move to</ContextMenuSubmenuTrigger>
            <ContextMenuContent aria-label="Move to" data-testid="submenu">
              {Array.from({ length: items }, (_, index) => (
                <ContextMenuItem key={index}>Section {index + 1}</ContextMenuItem>
              ))}
            </ContextMenuContent>
          </ContextMenuSubmenu>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ThemeProvider>
  );
}

async function openSubmenu(at: { x: number; y: number }) {
  fireEvent.contextMenu(screen.getByTestId("area"), { clientX: at.x, clientY: at.y, button: 2 });
  const menu = await waitFor(() => screen.getByTestId("menu"));
  await settle();
  screen.getByTestId("more").focus();
  await press("{ArrowRight}");
  const submenu = await waitFor(() => screen.getByTestId("submenu"));
  await settle();
  const item = screen.getByTestId("more");
  const where = JSON.stringify({
    side: submenu.getAttribute("data-side"),
    menu: rect(menu).toJSON(),
    item: rect(item).toJSON(),
    submenu: rect(submenu).toJSON(),
  });
  return { menu, item, submenu, where };
}

function expectBesideItem(item: HTMLElement, submenu: HTMLElement, where: string) {
  expect(["right", "left", "inline-end", "inline-start"], where).toContain(
    submenu.getAttribute("data-side"),
  );
  // Level with its item: its top is 4px above the item's, so that its first
  // item, inside the popup's 4px inset, is level with it.
  expect(Math.abs(rect(submenu).top - (rect(item).top - 4)), where).toBeLessThanOrEqual(1);
}

it("opens a submenu to the right of its item where it fits", async () => {
  await setViewport(1024, 900);
  render(<Menu items={6} />);
  const { menu, item, submenu, where } = await openSubmenu({ x: 40, y: 40 });
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).left, where).toBeGreaterThanOrEqual(rect(menu).right - 1);
});

it("flips a submenu to the left of its item where only the left has room", async () => {
  await setViewport(1024, 900);
  render(<Menu items={6} />);
  // The menu opens at the point and slides in from the right edge.
  const { menu, item, submenu, where } = await openSubmenu({ x: 1000, y: 40 });
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).right, where).toBeLessThanOrEqual(rect(menu).left + 1);
});

it("keeps a submenu that fits on neither side level with its item, slid along the edge", async () => {
  // A 240px menu at 20px in a 320px window: 60px to its right, 20px to its
  // left, so a 240px submenu fits on neither side.
  await setViewport(320, 640);
  render(<Menu items={6} />);
  const { item, submenu, where } = await openSubmenu({ x: 20, y: 40 });
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).right, where).toBeLessThanOrEqual(320);
  expect(rect(submenu).left, where).toBeGreaterThanOrEqual(0);
});

it("keeps a long submenu that fits on neither side beside its item, inside the window", async () => {
  // Taller than the room under its item: it slides up along the window's
  // edge, still covering its item's row, and scrolls.
  await setViewport(320, 640);
  render(<Menu items={30} />);
  const { item, submenu, where } = await openSubmenu({ x: 20, y: 40 });
  expect(["right", "left", "inline-end", "inline-start"], where).toContain(
    submenu.getAttribute("data-side"),
  );
  expect(rect(submenu).top, where).toBeLessThanOrEqual(rect(item).top);
  expect(rect(submenu).bottom, where).toBeGreaterThanOrEqual(rect(item).bottom);
  expect(rect(submenu).top, where).toBeGreaterThanOrEqual(0);
  expect(rect(submenu).bottom, where).toBeLessThanOrEqual(640);
  expect(rect(submenu).left, where).toBeGreaterThanOrEqual(0);
  expect(rect(submenu).right, where).toBeLessThanOrEqual(320);
});
