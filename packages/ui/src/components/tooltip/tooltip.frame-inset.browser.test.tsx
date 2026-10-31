/**
 * A tooltip never opens into the window's top band that a host shell keeps for
 * its own controls (tooltip.md, Behavior): with --raft-frame-inset-top on the
 * root element, one that would open above a trigger just under the band flips
 * below it. It flips away from --raft-frame-inset-start and
 * --raft-frame-inset-end the same way, on the side they stand for in the
 * document's direction. Real layout: only a browser places the popup.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/tooltip`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  for (const side of ["top", "start", "end"]) {
    document.documentElement.style.removeProperty(`--raft-frame-inset-${side}`);
  }
  document.documentElement.removeAttribute("dir");
});

// A trigger 56px from the top of the window, as the first row under a 48px
// top bar: a one-line tooltip above it (about 26px, 8px off) ends inside the
// band, but clears Base UI's own 5px padding.
function renderNearTop() {
  render(
    <div style={{ position: "fixed", top: 56, left: 200 }}>
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    </div>,
  );
}

async function openedSide() {
  const popup = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('[data-slot="tooltip-content"]');
    expect(el?.getAttribute("data-side")).toBeTruthy();
    return el!;
  });
  const trigger = screen.getByText("Trigger").getBoundingClientRect();
  const box = popup.getBoundingClientRect();
  return { side: popup.getAttribute("data-side"), box, trigger };
}

it("opens above a trigger near the top when no shell reserves a band", async () => {
  renderNearTop();
  const { side, box, trigger } = await openedSide();
  expect(side).toBe("top");
  expect(box.bottom).toBeLessThanOrEqual(trigger.top);
});

it("flips below the trigger when it would open into the frame's top band", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-top", "48px");
  renderNearTop();
  const { side, box, trigger } = await openedSide();
  expect(side).toBe("bottom");
  expect(box.top).toBeGreaterThanOrEqual(trigger.bottom);
});

it("reads a band given as any CSS length", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-top", "calc(40px + 8px)");
  renderNearTop();
  const { side } = await openedSide();
  expect(side).toBe("bottom");
});

// A trigger 140px from the right edge with its tooltip on the right, as an
// item in a column next to the right edge: the tooltip (about 100px with its
// 8px offset) fits in the window, but not beside an 80px inset on that side.
function renderNearRight() {
  render(
    <div style={{ position: "fixed", top: 200, right: 140 }}>
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent side="right">Tooltip text</TooltipContent>
      </Tooltip>
    </div>,
  );
}

it("opens beside a trigger near the right edge when no shell reserves a side", async () => {
  renderNearRight();
  const { side, box, trigger } = await openedSide();
  expect(side).toBe("right");
  expect(box.left).toBeGreaterThanOrEqual(trigger.right);
});

it("flips away from --raft-frame-inset-end on the right in left to right", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight();
  const { side, box, trigger } = await openedSide();
  expect(side).toBe("left");
  expect(box.right).toBeLessThanOrEqual(trigger.left);
});

it("flips away from --raft-frame-inset-start on the right in right to left", async () => {
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.style.setProperty("--raft-frame-inset-start", "calc(40px + 40px)");
  renderNearRight();
  const { side } = await openedSide();
  expect(side).toBe("left");
});

it("ignores --raft-frame-inset-end on the left side in right to left", async () => {
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight();
  const { side } = await openedSide();
  expect(side).toBe("right");
});

// A short tooltip on a top-bar icon, as under the macOS window controls
// overlay: the traffic lights at the left, the browser's controls at the
// right, the title-bar band on top. The insets bound the tooltip; Base UI also
// sizes its shift limiter from the collision padding, so when they were added
// to the padding the tooltip opened ~69px right of its icon.
const TOP_BAR_ICON = { width: 32, height: 32, padding: 0 };

function renderOnTopBarIcon(left: number) {
  render(
    <div style={{ position: "fixed", top: 4, left }}>
      <Tooltip open>
        <TooltipTrigger style={TOP_BAR_ICON}>Trigger</TooltipTrigger>
        <TooltipContent>Raft</TooltipContent>
      </Tooltip>
    </div>,
  );
}

function setWindowControlsOverlay() {
  const style = document.documentElement.style;
  style.setProperty("--raft-frame-inset-start", "70px");
  style.setProperty("--raft-frame-inset-end", "136px");
  style.setProperty("--raft-frame-inset-top", "40px");
}

it("stays centered on a top-bar icon under the window controls", async () => {
  setWindowControlsOverlay();
  renderOnTopBarIcon(200);
  const { side, box, trigger } = await openedSide();
  expect(side).toBe("bottom");
  const offset = box.left + box.width / 2 - (trigger.left + trigger.width / 2);
  expect(Math.abs(offset)).toBeLessThanOrEqual(1);
});

it("shifts clear of the start inset when its icon sits against it", async () => {
  setWindowControlsOverlay();
  renderOnTopBarIcon(72);
  const { box, trigger } = await openedSide();
  expect(box.left).toBeGreaterThanOrEqual(70);
  expect(box.left).toBeLessThan(trigger.right);
});
