/**
 * A popover keeps 8px from a frame inset, not from the window's edge
 * (popover.md, Behavior; design/patterns/page-structure.md#frame-insets): one
 * on a trigger in the window's top band, pushed against the right edge, stops
 * 8px inside --raft-frame-inset-end in left to right, and inside
 * --raft-frame-inset-start in right to left. Those insets are the band's
 * corners, not columns: under the band, and with no inset, it keeps Base UI's
 * own 5px. Real layout: only a browser places the popup.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/popover`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import type { PopoverContentProps } from "./popover";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  for (const side of ["top", "start", "end"]) {
    document.documentElement.style.removeProperty(`--raft-frame-inset-${side}`);
  }
  document.documentElement.removeAttribute("dir");
});

const TRIGGER_STYLE = { width: 60 };

// A 60px trigger 88px from the right edge, just clear of an 80px inset and
// its 8px: a 240px popover centered on it runs past the right edge and is
// pushed back against it. At `top` 4 the trigger is in a 44px top band, as on
// the top bar; at 200 it is under it.
function renderNearRight(props: Partial<PopoverContentProps> = {}, top = 200) {
  render(
    <div style={{ position: "fixed", top, right: 88 }}>
      <Popover open>
        <PopoverTrigger style={TRIGGER_STYLE}>Trigger</PopoverTrigger>
        <PopoverContent align="center" {...props}>
          <div style={{ width: 240, height: 40 }}>Popover content</div>
        </PopoverContent>
      </Popover>
    </div>,
  );
}

async function popupRight() {
  const popup = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('[data-slot="popover-content"]');
    expect(el?.getAttribute("data-side")).toBeTruthy();
    return el!;
  });
  // Let Base UI settle the position it computes after the first frame.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return window.innerWidth - popup.getBoundingClientRect().right;
}

it("stops 5px from the right edge when no shell reserves a side", async () => {
  renderNearRight();
  expect(await popupRight()).toBeCloseTo(5, 0);
});

function setBand() {
  document.documentElement.style.setProperty("--raft-frame-inset-top", "44px");
}

it("stops 8px inside --raft-frame-inset-end in left to right", async () => {
  setBand();
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight({}, 4);
  expect(await popupRight()).toBeCloseTo(88, 0);
});

it("stops 8px inside --raft-frame-inset-start in right to left", async () => {
  setBand();
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.style.setProperty("--raft-frame-inset-start", "80px");
  renderNearRight({}, 4);
  expect(await popupRight()).toBeCloseTo(88, 0);
});

it("stops 5px from the right edge under the band: the inset is its corner", async () => {
  setBand();
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight();
  expect(await popupRight()).toBeCloseTo(5, 0);
});

// As on a Mac: the traffic lights' corner 95px wide, the title bar 28px tall.
// A 100px trigger 15px from the left edge, as tall as the bar, its popover
// aligned to its start and 12px under it, so in the title bar it opens just
// under the band and its 8px gap. (Base UI shifts a popup along its trigger
// only while the two still overlap, hence a trigger reaching past the corner.)
const BAR_TRIGGER_STYLE = { width: 100, height: 28, padding: 0 };

async function popupLeftOnTriggerAt(top: number) {
  document.documentElement.style.setProperty("--raft-frame-inset-start", "95px");
  document.documentElement.style.setProperty("--raft-frame-inset-top", "28px");
  render(
    <div style={{ position: "fixed", top, left: 15 }}>
      <Popover open>
        <PopoverTrigger style={BAR_TRIGGER_STYLE}>T</PopoverTrigger>
        <PopoverContent align="start" side="bottom" sideOffset={12}>
          <div style={{ width: 160, height: 40 }}>Popover content</div>
        </PopoverContent>
      </Popover>
    </div>,
  );
  await popupRight();
  return document.querySelector('[data-slot="popover-content"]')!.getBoundingClientRect().left;
}

it("opens at its trigger near the left edge under the title bar", async () => {
  expect(await popupLeftOnTriggerAt(258)).toBeCloseTo(15, 0);
});

it("moves clear of the traffic lights' corner from a trigger in the title bar", async () => {
  expect(await popupLeftOnTriggerAt(0)).toBeCloseTo(95 + 8, 0);
});

it("keeps a collisionPadding the caller passes", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight({ collisionPadding: 12 });
  expect(await popupRight()).toBeCloseTo(12, 0);
});

it("measures a non-px calc() --raft-frame-inset-end without mutating <html>", async () => {
  const initialHtmlChildren = document.documentElement.childElementCount;
  setBand();
  document.documentElement.style.setProperty(
    "--raft-frame-inset-end",
    "max(0px, calc(100vw - calc(100vw - 80px)))",
  );
  renderNearRight({}, 4);
  expect(await popupRight()).toBeCloseTo(88, 0);
  expect(document.documentElement.childElementCount).toBe(initialHtmlChildren);
});
