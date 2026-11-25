import "./tooltip.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { Button } from "../button/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import type { TooltipTriggerProps } from "./tooltip";
import { TOOLTIP_LONG_PRESS_MS, TOOLTIP_RELEASE_CLOSE_MS } from "./tooltip-touch";

// A touch screen has no hover, so a tooltip opens on a press and hold
// (tooltip.md, "Touch screens"), on a disabled button too: that is where a
// disabled button's reason lives. Real touch input through CDP: Chromium
// sends the pointer events, the touch events and, after a short tap, the
// click, as a phone does. Touch emulation runs this file in a browser of its
// own (vite.config.ts).

const it = test.skipIf(typeof window === "undefined");

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

beforeEach(async () => {
  if (typeof window === "undefined") return;
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
});

afterEach(async () => {
  // Lift a finger a failed test left down, so it can't press the next one.
  await (
    await cdp()
  )
    .send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
    .catch(() => {});
  cleanup();
  // Let a pending close timer of the last test run out on nothing.
  await wait(50);
});

async function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
  });
}

/** Waits for a condition, up to `ms`, without assuming how fast CDP is. */
async function until(condition: () => boolean, ms = 1000) {
  for (let waited = 0; waited < ms && !condition(); waited += 50) await wait(50);
}

function center(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

async function press(element: Element, holdMs: number) {
  const { x, y } = center(element);
  await touch("touchStart", x, y);
  await wait(holdMs);
  await touch("touchEnd", x, y);
  await wait(100);
}

function tooltipText() {
  return document.querySelector('[data-slot="tooltip-content"]')?.textContent ?? "";
}

type Options = Pick<TooltipTriggerProps, "openOnLongPress" | "openOnTap"> & {
  disabled?: boolean;
};

function renderTooltip({ disabled = false, ...trigger }: Options = {}) {
  const onClick = vi.fn();
  render(
    <div style={{ padding: 80, display: "flex", gap: 40 }}>
      <Tooltip>
        <TooltipTrigger
          {...trigger}
          render={
            <Button
              disabled={disabled}
              focusableWhenDisabled={disabled}
              onClick={onClick}
              aria-label="Archive"
            >
              Archive
            </Button>
          }
        />
        <TooltipContent>Only the owner can archive this channel</TooltipContent>
      </Tooltip>
      <span data-testid="elsewhere">Elsewhere</span>
    </div>,
  );
  const button = screen.getByRole("button", { name: "Archive" });
  const isOpen = () => button.hasAttribute("data-popup-open");
  return { button, onClick, isOpen };
}

it("a hold opens the tooltip of an enabled button, without pressing it", async () => {
  const { button, onClick, isOpen } = renderTooltip();
  const { x, y } = center(button);
  await touch("touchStart", x, y);
  await wait(TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen(), "open while the finger still holds").toBe(true);
  expect(tooltipText()).toContain("Only the owner can archive this channel");
  await touch("touchEnd", x, y);
  await wait(200);
  expect(isOpen(), "still open just after lifting the finger").toBe(true);
  expect(onClick, "the hold doesn't press the button").not.toHaveBeenCalled();
  await wait(TOOLTIP_RELEASE_CLOSE_MS);
  expect(isOpen(), "closed a moment after lifting the finger").toBe(false);
});

it("a hold opens the tooltip of a disabled button", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  await press(button, TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(true);
  expect(tooltipText()).toContain("Only the owner can archive this channel");
});

it("a short tap presses the button and opens nothing", async () => {
  const { button, onClick, isOpen } = renderTooltip();
  await press(button, 80);
  expect(onClick).toHaveBeenCalledTimes(1);
  await wait(TOOLTIP_LONG_PRESS_MS);
  expect(isOpen()).toBe(false);
});

it("a short tap on a disabled button opens nothing", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true });
  await press(button, 80);
  await wait(TOOLTIP_LONG_PRESS_MS);
  expect(isOpen()).toBe(false);
});

// The slop is the tooltip's own arithmetic, so these two send the pointer
// events from the page: a slow CDP connection can't stretch the time between
// the finger landing and moving past the 500ms they measure.
function pointer(type: string, element: Element, x: number, y: number) {
  element.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
      pointerId: 7,
      isPrimary: true,
      clientX: x,
      clientY: y,
    }),
  );
}

it("a finger that moves more than 10px before the hold is up was a scroll", async () => {
  const { button, isOpen } = renderTooltip();
  const { x, y } = center(button);
  pointer("pointerdown", button, x, y);
  pointer("pointermove", button, x, y + 6);
  pointer("pointermove", button, x, y + 12);
  await wait(TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(false);
  pointer("pointerup", button, x, y + 12);
});

it("a finger that stays within 10px still holds", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true });
  const { x, y } = center(button);
  pointer("pointerdown", button, x, y);
  pointer("pointermove", button, x + 6, y + 6);
  await wait(TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(true);
  pointer("pointerup", button, x + 6, y + 6);
});

it("a tap elsewhere closes a tooltip a touch opened", async () => {
  // openOnTap stays open until a tap closes it: no release timer to race.
  const { button, isOpen } = renderTooltip({ openOnTap: true });
  await press(button, 80);
  expect(isOpen()).toBe(true);
  await press(screen.getByTestId("elsewhere"), 60);
  await until(() => !isOpen());
  expect(isOpen()).toBe(false);
});

it("openOnLongPress={false} leaves the hold to the trigger", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true, openOnLongPress: false });
  await press(button, TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(false);
});

it("openOnTap opens on a tap and closes on the next", async () => {
  const { button, isOpen } = renderTooltip({ openOnTap: true });
  await press(button, 80);
  expect(isOpen(), "a tap opens it").toBe(true);
  // The browser's mouse events for the tap can end with the pointer
  // "leaving" the trigger (seen in Chromium): that is no hover ending.
  for (const type of ["mouseover", "mouseenter", "mouseout", "mouseleave"]) {
    const bubbles = type === "mouseover" || type === "mouseout";
    button.dispatchEvent(new MouseEvent(type, { bubbles, relatedTarget: document.body }));
  }
  await wait(100);
  expect(isOpen(), "the tap's mouseleave doesn't close it").toBe(true);
  await wait(TOOLTIP_RELEASE_CLOSE_MS + 200);
  expect(isOpen(), "it stays: a tap is no hold").toBe(true);
  await press(button, 80);
  await wait(200);
  expect(isOpen(), "the next tap closes it").toBe(false);
});

it("with openOnTap, a hold still opens an info button's tooltip", async () => {
  const { button, isOpen } = renderTooltip({ openOnTap: true });
  await press(button, TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(true);
});

function renderInMenu(openOnLongPress?: boolean) {
  render(
    <div style={{ padding: 80 }}>
      <ContextMenu>
        <ContextMenuTrigger data-testid="row" className="p-6">
          <Tooltip>
            <TooltipTrigger
              openOnLongPress={openOnLongPress}
              render={
                <Button disabled focusableWhenDisabled aria-label="Retry">
                  Retry
                </Button>
              }
            />
            <TooltipContent>Only the sender can retry</TooltipContent>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>,
  );
  const button = screen.getByRole("button", { name: "Retry" });
  return {
    button,
    tooltipOpen: () => button.hasAttribute("data-popup-open"),
    menuOpen: () => screen.queryByRole("menuitem", { name: "Copy" }) !== null,
  };
}

it("inside a long-press menu, the hold is the menu's", async () => {
  const { button, tooltipOpen, menuOpen } = renderInMenu();
  const { x, y } = center(button);
  await touch("touchStart", x, y);
  await wait(TOOLTIP_LONG_PRESS_MS + 400);
  expect(menuOpen(), "the menu opens").toBe(true);
  expect(tooltipOpen(), "the tooltip doesn't").toBe(false);
  await touch("touchEnd", x, y);
});

it("openOnLongPress takes the hold inside a long-press menu, and the menu stays shut", async () => {
  const { button, tooltipOpen, menuOpen } = renderInMenu(true);
  expect(button.hasAttribute("data-tooltip-long-press")).toBe(true);
  const { x, y } = center(button);
  await touch("touchStart", x, y);
  await wait(TOOLTIP_LONG_PRESS_MS + 400);
  expect(tooltipOpen(), "the tooltip opens").toBe(true);
  expect(menuOpen(), "the menu doesn't").toBe(false);
  await touch("touchEnd", x, y);
});

it("a link keeps its own long press", async () => {
  render(
    <div style={{ padding: 80 }}>
      <Tooltip>
        <TooltipTrigger render={<a href="#guide">Guide</a>} />
        <TooltipContent>Open the setup guide</TooltipContent>
      </Tooltip>
    </div>,
  );
  const link = screen.getByRole("link", { name: "Guide" });
  const { x, y } = center(link);
  await touch("touchStart", x, y);
  await wait(100);
  const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
  link.dispatchEvent(menu);
  expect(menu.defaultPrevented, "the system's link menu isn't stopped").toBe(false);
  await wait(TOOLTIP_LONG_PRESS_MS + 150);
  expect(link.hasAttribute("data-popup-open"), "no tooltip on a link's hold").toBe(false);
  await touch("touchEnd", x, y);
});

it("a text trigger can't be selected by the hold", () => {
  render(
    <Tooltip>
      <TooltipTrigger render={<span>Martin's MacBook Pro (work)</span>} />
      <TooltipContent>Martin's MacBook Pro (work)</TooltipContent>
    </Tooltip>,
  );
  const name = screen.getByText("Martin's MacBook Pro (work)");
  expect(getComputedStyle(name).userSelect).toBe("none");
});
