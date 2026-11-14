/**
 * Real layout of a coach mark: only a browser places the bubble and its arrow.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/coach-mark`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useRef } from "react";
import "./coach-mark.test.css";
import { PopoverBody, PopoverTitle } from "../popover/popover";
import { CoachMark, CoachMarkActions, CoachMarkContent, CoachMarkNext } from "./coach-mark";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function Stop({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ padding: 360 }}>
      <button type="button" ref={ref} data-testid="target" style={{ width: 40, height: 40 }}>
        Bell
      </button>
      <CoachMark anchor={ref}>
        <CoachMarkContent side={side}>
          <PopoverBody>
            <PopoverTitle>Notifications</PopoverTitle>
          </PopoverBody>
          <CoachMarkActions>
            <CoachMarkNext>Next</CoachMarkNext>
          </CoachMarkActions>
        </CoachMarkContent>
      </CoachMark>
    </div>
  );
}

// The arrow sits on the bubble's edge that faces the target, half over it,
// and is not clipped (coach-marks.md#the-bubble, popover.md#anatomy).
it.each(["top", "bottom", "left", "right"] as const)(
  "the arrow points at the target from the %s",
  async (side) => {
    render(<Stop side={side} />);
    await screen.findByRole("button", { name: "Next" });
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    const popup = document.querySelector<HTMLElement>('[data-slot="coach-mark-content"]')!;
    const arrow = document.querySelector<HTMLElement>('[data-slot="popover-arrow"]')!;
    // Where it opened: a side with no room flips (a narrow test page has no
    // room on the right), and the arrow follows the side it opened on.
    const placed = popup.getAttribute("data-side") as typeof side;
    const p = popup.getBoundingClientRect();
    const a = arrow.getBoundingClientRect();
    const t = screen.getByTestId("target").getBoundingClientRect();
    expect(p.width).toBe(300);
    expect(getComputedStyle(popup).overflow).toBe("visible");
    const edge = { top: p.bottom, bottom: p.top, left: p.right, right: p.left }[placed];
    const centre =
      placed === "top" || placed === "bottom" ? (a.top + a.bottom) / 2 : (a.left + a.right) / 2;
    expect(Math.abs(centre - edge)).toBeLessThanOrEqual(1);
    const gap = {
      top: t.top - p.bottom,
      bottom: p.top - t.bottom,
      left: t.left - p.right,
      right: p.left - t.right,
    }[placed];
    expect(Math.round(gap)).toBe(8);
  },
);
