import "../dropdown-menu/dropdown-menu.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPinnedFooter,
  ContextMenuTrigger,
} from "./context-menu";

// A long context menu scrolls inside the room it has, as a DropdownMenu does
// (dropdown-menu.md › Long menus): the arrow keys and the wheel reach its last
// item, and a ContextMenuPinnedFooter stays below the items.
// Revert to fail: context-menu.tsx, ContextMenuContent without `MenuScroll`.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

async function wheelOver(element: Element, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  const outer = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const box = rect(element);
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: outer.left + box.left + box.width / 2,
    y: outer.top + box.top + box.height / 2,
    deltaX: 0,
    deltaY,
  });
  await settle(400);
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

const NAMES = Array.from({ length: 40 }, (_, index) => `Channel ${index + 1}`);

async function open() {
  await setViewport(1024, 480);
  render(
    <ContextMenu>
      <ContextMenuTrigger data-testid="area" style={WHOLE_WINDOW} />
      <ContextMenuContent aria-label="Channels" data-testid="menu">
        {NAMES.map((name) => (
          <ContextMenuItem key={name}>{name}</ContextMenuItem>
        ))}
        <ContextMenuPinnedFooter data-testid="footer">
          <ContextMenuItem>Edit list</ContextMenuItem>
        </ContextMenuPinnedFooter>
      </ContextMenuContent>
    </ContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 40, clientY: 40, button: 2 });
  const menu = await waitFor(() => screen.getByTestId("menu"));
  await settle();
  const scroller = menu.querySelector<HTMLElement>("[data-slot=context-menu-scroll]")!;
  return { menu, scroller };
}

const item = (name: string) => screen.getByRole("menuitem", { name });

it("caps the menu at the window and the wheel reaches its last item", async () => {
  const { menu, scroller } = await open();
  expect(rect(menu).bottom).toBeLessThanOrEqual(480);
  expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
  const last = item("Channel 40");
  expect(rect(last).top).toBeGreaterThan(rect(scroller).bottom);
  await wheelOver(scroller, 4000);
  expect(rect(last).bottom).toBeLessThanOrEqual(rect(scroller).bottom);
  expect(rect(item("Edit list")).top).toBeGreaterThanOrEqual(rect(scroller).bottom);
});

it("scrolls the highlighted item into view and keeps the footer below", async () => {
  const { menu, scroller } = await open();
  const footer = screen.getByTestId("footer");
  expect(scroller.contains(footer)).toBe(false);
  item("Channel 1").focus();
  await press("{End}");
  expect(menu.querySelector("[data-highlighted]")).toBe(item("Edit list"));
  await press("{ArrowUp}");
  const last = item("Channel 40");
  expect(menu.querySelector("[data-highlighted]")).toBe(last);
  expect(rect(last).bottom).toBeLessThanOrEqual(rect(scroller).bottom);
  expect(rect(last).top).toBeGreaterThanOrEqual(rect(scroller).top);
  expect(rect(item("Edit list")).bottom).toBeLessThanOrEqual(rect(menu).bottom);
});
