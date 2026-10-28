/**
 * A popover keeps 8px from a frame inset, not from the window's edge
 * (popover.md, Behavior; design/patterns/page-structure.md#frame-insets): one
 * pushed against the right edge stops 8px inside --raft-frame-inset-end in
 * left to right, and inside --raft-frame-inset-start in right to left. With no
 * inset it keeps Base UI's own 5px. Real layout: only a browser places the
 * popup.
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
// pushed back against it.
function renderNearRight(props: Partial<PopoverContentProps> = {}) {
  render(
    <div style={{ position: "fixed", top: 200, right: 88 }}>
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

it("stops 8px inside --raft-frame-inset-end in left to right", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight();
  expect(await popupRight()).toBeCloseTo(88, 0);
});

it("stops 8px inside --raft-frame-inset-start in right to left", async () => {
  document.documentElement.setAttribute("dir", "rtl");
  document.documentElement.style.setProperty("--raft-frame-inset-start", "80px");
  renderNearRight();
  expect(await popupRight()).toBeCloseTo(88, 0);
});

it("keeps a collisionPadding the caller passes", async () => {
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");
  renderNearRight({ collisionPadding: 12 });
  expect(await popupRight()).toBeCloseTo(12, 0);
});
