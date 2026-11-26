import "./dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { CSSProperties } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// A submenu comes out of its item, to the side: it is not a list popup's
// side-axis fallback (lib/list-popup.ts). Where neither side has room it
// slides along the window's edge, level with its item, rather than dropping
// above or below it.

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

// The trigger near the window's top start corner, or its top end corner.
const AT_START: CSSProperties = { position: "fixed", top: 40, left: 20 };
const AT_END: CSSProperties = { position: "fixed", top: 40, right: 20 };

function Menu({ items, at = AT_START }: { items: number; at?: CSSProperties }) {
  return (
    <ThemeProvider mode="light">
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger" style={at}>
          Actions
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Actions" data-testid="menu">
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuSubmenu>
            <DropdownMenuSubmenuTrigger data-testid="more">Move to</DropdownMenuSubmenuTrigger>
            <DropdownMenuContent aria-label="Move to" data-testid="submenu">
              {Array.from({ length: items }, (_, index) => (
                <DropdownMenuItem key={index}>Section {index + 1}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuSubmenu>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeProvider>
  );
}

async function openSubmenu() {
  screen.getByTestId("trigger").focus();
  await press("{ArrowDown}");
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
  // Level with its item: its top is at the item's (less the popup's 4px
  // inset), not above or below it.
  expect(Math.abs(rect(submenu).top - rect(item).top), where).toBeLessThanOrEqual(8);
}

it("opens a submenu to the right of its item where it fits", async () => {
  await setViewport(1024, 900);
  render(<Menu items={6} />);
  const { menu, item, submenu, where } = await openSubmenu();
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).left, where).toBeGreaterThanOrEqual(rect(menu).right - 1);
});

it("flips a submenu to the left of its item where only the left has room", async () => {
  await setViewport(1024, 900);
  render(<Menu items={6} at={AT_END} />);
  const { menu, item, submenu, where } = await openSubmenu();
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).right, where).toBeLessThanOrEqual(rect(menu).left + 1);
});

it("keeps a submenu that fits on neither side level with its item, slid along the edge", async () => {
  // A 240px menu at 20px in a 320px window: 60px to its right, 20px to its
  // left, so a 240px submenu fits on neither side.
  await setViewport(320, 640);
  render(<Menu items={6} />);
  const { item, submenu, where } = await openSubmenu();
  expectBesideItem(item, submenu, where);
  expect(rect(submenu).right, where).toBeLessThanOrEqual(320);
  expect(rect(submenu).left, where).toBeGreaterThanOrEqual(0);
});

it("keeps a long submenu that fits on neither side beside its item, inside the window", async () => {
  // Taller than the room under its item: it slides up along the window's
  // edge, still covering its item's row, and scrolls.
  await setViewport(320, 640);
  render(<Menu items={30} />);
  const { item, submenu, where } = await openSubmenu();
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
