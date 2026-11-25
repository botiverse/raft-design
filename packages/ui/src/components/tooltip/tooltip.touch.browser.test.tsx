import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { Button } from "../button/button";
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

it("a finger that moves more than 10px before the hold is up was a scroll", async () => {
  const { button, isOpen } = renderTooltip();
  const { x, y } = center(button);
  await touch("touchStart", x, y);
  await wait(100);
  for (let step = 1; step <= 4; step++) await touch("touchMove", x, y + step * 5);
  await wait(TOOLTIP_LONG_PRESS_MS + 100);
  expect(isOpen()).toBe(false);
  await touch("touchEnd", x, y + 20);
});

it("a finger that stays within 10px still holds", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true });
  const { x, y } = center(button);
  await touch("touchStart", x, y);
  await wait(100);
  await touch("touchMove", x + 4, y + 4);
  await wait(TOOLTIP_LONG_PRESS_MS + 100);
  expect(isOpen()).toBe(true);
  await touch("touchEnd", x + 4, y + 4);
});

it("a tap elsewhere closes a held tooltip at once", async () => {
  const { button, isOpen } = renderTooltip({ disabled: true });
  await press(button, TOOLTIP_LONG_PRESS_MS + 150);
  expect(isOpen()).toBe(true);
  await press(screen.getByTestId("elsewhere"), 60);
  await wait(200);
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
