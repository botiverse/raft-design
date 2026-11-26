import "./dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPinnedFooter,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// A long menu scrolls inside the room the positioner leaves it
// (dropdown-menu.md › Long menus): the popup is capped at
// `--available-height`, its items scroll in a ScrollArea inside it, the
// highlighted item stays in view and clear of the edge's fade, and a
// DropdownMenuPinnedFooter stays below the items. Before, the popup clipped
// what was past its cap (`overflow-hidden`), and the last items could not be
// reached by any means.
// Revert to fail: dropdown-menu.tsx, DropdownMenuContent without `MenuScroll`.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

/** A real wheel turn over the middle of `element`, as the browser's own input. */
async function wheelOver(element: Element, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  // CDP's coordinates are the top page's; the test runs in an iframe of it.
  const outer = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const box = rect(element);
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: outer.left + box.left + box.width / 2,
    y: outer.top + box.top + box.height / 2,
    deltaX: 0,
    deltaY,
  });
  // A wheel scroll animates; let it end before anything is read.
  await settle(400);
}

async function press(key: string, times = 1) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (let index = 0; index < times; index += 1) await userEvent.keyboard(key);
  await settle(120);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const NAMES = Array.from({ length: 40 }, (_, index) => `Section ${index + 1}`);

function LongMenu({ footer = false }: { footer?: boolean }) {
  return (
    <ThemeProvider mode="light">
      <div className="bg-layer-page p-4">
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="trigger">Move to</DropdownMenuTrigger>
          <DropdownMenuContent aria-label="Move to" className="w-60" data-testid="menu">
            {NAMES.map((name) => (
              <DropdownMenuItem key={name}>{name}</DropdownMenuItem>
            ))}
            {footer ? (
              <DropdownMenuPinnedFooter data-testid="footer">
                <DropdownMenuItem>New section</DropdownMenuItem>
              </DropdownMenuPinnedFooter>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </ThemeProvider>
  );
}

async function openByKeyboard() {
  screen.getByTestId("trigger").focus();
  await press("{ArrowDown}");
  await waitFor(() => expect(screen.getByTestId("menu")).toBeTruthy());
  await settle();
  const menu = screen.getByTestId("menu");
  const scroller = menu.querySelector<HTMLElement>("[data-slot=dropdown-menu-scroll]")!;
  return { menu, scroller };
}

const highlighted = (menu: Element) => menu.querySelector<HTMLElement>("[data-highlighted]");
const item = (name: string) => screen.getByRole("menuitem", { name });

it("caps the menu at the window and scrolls its items inside it", async () => {
  await setViewport(1024, 480);
  render(<LongMenu />);
  const { menu, scroller } = await openByKeyboard();
  expect(rect(menu).bottom).toBeLessThanOrEqual(480);
  expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
  // The scroller fills the popup: its bottom is the popup's, less the ring.
  expect(Math.abs(rect(scroller).bottom - rect(menu).bottom)).toBeLessThanOrEqual(1);
  expect(scroller.tabIndex).toBe(-1);
  // Its edges fade while it has something to scroll.
  expect(scroller.classList.contains("r-scroll-area--fade")).toBe(true);
});

it("keeps the highlighted item in view, clear of the fade, down to the last item", async () => {
  await setViewport(1024, 480);
  render(<LongMenu />);
  const { menu, scroller } = await openByKeyboard();
  expect(highlighted(menu)?.textContent).toBe("Section 1");

  // Halfway down: the item is whole and at least the fade's 24px inside the bottom edge.
  await press("{ArrowDown}", 19);
  const twenty = item("Section 20");
  expect(highlighted(menu)).toBe(twenty);
  expect(scroller.scrollTop).toBeGreaterThan(0);
  expect(rect(twenty).bottom).toBeLessThanOrEqual(rect(scroller).bottom - 24 + 1);
  expect(rect(twenty).top).toBeGreaterThanOrEqual(rect(scroller).top);

  // End reaches the last item, scrolled whole into view.
  await press("{End}");
  const last = item("Section 40");
  expect(highlighted(menu)).toBe(last);
  expect(rect(last).bottom).toBeLessThanOrEqual(rect(scroller).bottom);
  expect(rect(last).top).toBeGreaterThanOrEqual(rect(scroller).top);
  expect(scroller.scrollTop).toBeCloseTo(scroller.scrollHeight - scroller.clientHeight, 0);

  // And back up to the first, clear of the top edge.
  await press("{Home}");
  expect(highlighted(menu)).toBe(item("Section 1"));
  expect(scroller.scrollTop).toBe(0);
});

it("reaches the last item with the wheel", async () => {
  await setViewport(1024, 480);
  render(<LongMenu />);
  const { scroller } = await openByKeyboard();
  const last = item("Section 40");
  expect(rect(last).top).toBeGreaterThan(rect(scroller).bottom);
  await wheelOver(scroller, 4000);
  expect(scroller.scrollTop).toBeCloseTo(scroller.scrollHeight - scroller.clientHeight, 0);
  expect(rect(last).bottom).toBeLessThanOrEqual(rect(scroller).bottom);
});

it("keeps a pinned footer below the items, after a separator, at every scroll", async () => {
  await setViewport(1024, 480);
  render(<LongMenu footer />);
  const { menu, scroller } = await openByKeyboard();
  const footer = screen.getByTestId("footer");
  const newSection = item("New section");
  expect(scroller.contains(footer)).toBe(false);
  expect(menu.contains(footer)).toBe(true);
  expect(footer.querySelector("[role=separator]")).not.toBeNull();
  const visible = () => {
    expect(rect(newSection).top).toBeGreaterThanOrEqual(rect(scroller).bottom);
    expect(rect(newSection).bottom).toBeLessThanOrEqual(rect(menu).bottom);
  };
  visible();
  await wheelOver(scroller, 600);
  visible();

  // The arrow keys reach it after the last item, and wrap from it to the first.
  await press("{End}");
  expect(highlighted(menu)).toBe(newSection);
  visible();
  await press("{ArrowUp}");
  expect(highlighted(menu)).toBe(item("Section 40"));
  expect(rect(item("Section 40")).bottom).toBeLessThanOrEqual(rect(scroller).bottom);
});

it("lays a short menu out as before: no scroll, the separator to the popup's edge", async () => {
  await setViewport(1024, 768);
  render(
    <ThemeProvider mode="light">
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">More</DropdownMenuTrigger>
        <DropdownMenuContent aria-label="More" data-testid="menu">
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeProvider>,
  );
  const { menu, scroller } = await openByKeyboard();
  expect(scroller.scrollHeight).toBe(scroller.clientHeight);
  // No mask while it fits: Chromium would draw the items' icons through it a few levels apart.
  expect(scroller.classList.contains("r-scroll-area--fade")).toBe(false);
  // 4px around the items, as the popup's own padding was.
  const first = item("Copy link");
  expect(rect(first).top - rect(menu).top).toBeCloseTo(4, 0);
  expect(rect(menu).bottom - rect(item("Delete")).bottom).toBeCloseTo(4, 0);
  expect(rect(first).left - rect(menu).left).toBeCloseTo(4, 0);
  const separator = screen.getByTestId("separator");
  expect(rect(separator).left).toBeCloseTo(rect(menu).left, 0);
  expect(rect(separator).right).toBeCloseTo(rect(menu).right, 0);
  // No room kept for the pinned footer that isn't there.
  const host = menu.querySelector("[data-slot=dropdown-menu-pinned-footer-host]")!;
  expect(rect(host).height).toBe(0);
});
