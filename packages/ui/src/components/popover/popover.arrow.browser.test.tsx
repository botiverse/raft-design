/**
 * PopoverArrow sits on the panel's edge that faces its trigger. For
 * inline-start and inline-end that edge depends on the direction Base UI
 * placed the panel by (its DirectionProvider), not on the page's `dir`
 * (popover.md#anatomy). Real layout: only a browser places the popup.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/popover`
 */
import "./popover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "./popover";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("dir");
});

function Panel({ side }: { side: "inline-start" | "inline-end" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <Popover open>
        <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
        <PopoverContent side={side} sideOffset={8} className="w-[120px] min-w-0 overflow-visible">
          Panel
          <PopoverArrow />
        </PopoverContent>
      </Popover>
    </div>
  );
}

async function arrowFacesTrigger() {
  await screen.findByText("Panel");
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  const popup = document.querySelector<HTMLElement>('[data-slot="popover-content"]')!;
  const arrow = document.querySelector<HTMLElement>('[data-slot="popover-arrow"]')!;
  const p = popup.getBoundingClientRect();
  const a = arrow.getBoundingClientRect();
  const t = screen.getByTestId("trigger").getBoundingClientRect();
  const centre = (a.left + a.right) / 2;
  // The edge nearer the trigger.
  const edge = p.left >= t.right - 1 ? p.left : p.right;
  return Math.abs(centre - edge);
}

it.each(["inline-start", "inline-end"] as const)(
  "%s: the arrow faces the trigger in a right-to-left Base UI tree",
  async (side) => {
    document.documentElement.setAttribute("dir", "rtl");
    render(
      <DirectionProvider direction="rtl">
        <Panel side={side} />
      </DirectionProvider>,
    );
    expect(await arrowFacesTrigger()).toBeLessThanOrEqual(1);
  },
);

it.each(["inline-start", "inline-end"] as const)(
  "%s: the arrow faces the trigger on a dir=rtl page with no DirectionProvider",
  async (side) => {
    document.documentElement.setAttribute("dir", "rtl");
    render(<Panel side={side} />);
    expect(await arrowFacesTrigger()).toBeLessThanOrEqual(1);
  },
);
