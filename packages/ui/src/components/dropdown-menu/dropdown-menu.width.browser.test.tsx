import "./dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// A menu grows to fit its longest item, capped by the window
// (dropdown-menu.md › Width): the popup is at most `--available-width`, so an
// item longer than the window wraps inside it. Before, the popup took the
// item's whole width and ran past the window's right edge (at 320px, a 320px
// menu at x=5 with 310px available).
// Revert to fail: dropdown-menu.tsx, the content slot without `max-w-(--available-width)`.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

// Base UI's own collision padding from the window's edge.
const PADDING = 5;

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

const LONG = "Move this conversation to the archived section of another server";

function Menu({ submenu = false }: { submenu?: boolean }) {
  return (
    <ThemeProvider mode="light">
      <div className="bg-layer-page p-4">
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">Actions</DropdownMenuTrigger>
          <DropdownMenuContent aria-label="Actions" data-testid="menu">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            {submenu ? (
              <DropdownMenuSubmenu>
                <DropdownMenuSubmenuTrigger data-testid="more">More</DropdownMenuSubmenuTrigger>
                <DropdownMenuContent aria-label="More" data-testid="submenu">
                  <DropdownMenuItem>{LONG}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuSubmenu>
            ) : (
              <DropdownMenuItem>{LONG}</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ThemeProvider>
  );
}

async function open() {
  screen.getByTestId("trigger").focus();
  await press("{ArrowDown}");
  const menu = await waitFor(() => screen.getByTestId("menu"));
  await settle();
  return menu;
}

function expectInsideWindow(menu: HTMLElement, width: number) {
  expect(rect(menu).left).toBeGreaterThanOrEqual(PADDING - 0.5);
  expect(rect(menu).right).toBeLessThanOrEqual(width - PADDING + 0.5);
  // The long item wraps inside the menu: nothing is pushed past its edge.
  const scroller = menu.querySelector<HTMLElement>("[data-slot=dropdown-menu-scroll]")!;
  expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth + 1);
  const item = screen.getByRole("menuitem", { name: LONG });
  expect(rect(item).right).toBeLessThanOrEqual(rect(menu).right);
  expect(rect(item).height).toBeGreaterThan(
    rect(screen.getByRole("menuitem", { name: "Rename" })).height,
  );
}

it("keeps a menu with an item longer than the window inside it", async () => {
  await setViewport(320, 640);
  render(<Menu />);
  expectInsideWindow(await open(), 320);
});

it("keeps a submenu with an item longer than the window inside it", async () => {
  await setViewport(320, 640);
  render(<Menu submenu />);
  await open();
  screen.getByTestId("more").focus();
  await press("{ArrowRight}");
  const submenu = await waitFor(() => screen.getByTestId("submenu"));
  await settle();
  expectInsideWindow(submenu, 320);
});

it("grows to fit its longest item on one line when the window has room", async () => {
  await setViewport(1024, 640);
  render(<Menu />);
  const menu = await open();
  const item = screen.getByRole("menuitem", { name: LONG });
  const rename = screen.getByRole("menuitem", { name: "Rename" });
  expect(rect(menu).width).toBeGreaterThan(240);
  expect(rect(item).height).toBe(rect(rename).height);
});
