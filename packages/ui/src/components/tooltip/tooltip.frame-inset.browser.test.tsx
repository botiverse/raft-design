/**
 * A tooltip never opens into the window's top band that a host shell keeps for
 * its own controls (tooltip.md, Behavior): with --raft-frame-inset-top on the
 * root element, one that would open above a trigger just under the band flips
 * below it. Real layout: only a browser places the popup.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/tooltip`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty("--raft-frame-inset-top");
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
