import "./segmented-control.test.css";
/**
 * #102: with `iconsOnlyBelow`, a SegmentedControl in a row narrower than the
 * width shows only the icons of its segments (labels kept as the accessible
 * name, shown in a tooltip); in a wider row it keeps its labels. Real layout:
 * the switch is a container query, so only a browser measures it.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/segmented-control`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { CalendarDays, Columns3, List } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TooltipProvider } from "../tooltip/tooltip";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "./segmented-control";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Row({ width }: { width: number }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div data-testid="row" className="@container flex items-center gap-2" style={{ width }}>
          <SegmentedControl aria-label="Task view" defaultValue="board" iconsOnlyBelow="sm">
            <SegmentedControlItem value="board">
              <Columns3 />
              <SegmentedControlLabel>Board</SegmentedControlLabel>
              <SegmentedControlCount>12</SegmentedControlCount>
            </SegmentedControlItem>
            <SegmentedControlItem value="list">
              <List />
              <SegmentedControlLabel>List</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="calendar">
              <CalendarDays />
              <SegmentedControlLabel>Calendar</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function tooltip() {
  return document.querySelector("[data-slot=tooltip-content]");
}

function rect(el: Element) {
  return el.getBoundingClientRect();
}

function items() {
  return screen.getAllByRole("radio");
}

function labelOf(item: Element) {
  return item.querySelector("[data-slot=segmented-control-label]")!;
}

function expectNoOverlap() {
  const row = rect(screen.getByTestId("row"));
  const list = items().map(rect);
  for (let i = 1; i < list.length; i++) {
    expect(list[i]!.left).toBeGreaterThanOrEqual(list[i - 1]!.right);
  }
  for (const r of list) {
    expect(r.height).toBe(32);
    expect(r.right).toBeLessThanOrEqual(row.right);
  }
  for (const item of items()) {
    expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
  }
}

it("keeps every label in a row wider than the width", async () => {
  render(<Row width={600} />);
  await waitFor(() => expect(rect(labelOf(items()[0]!)).width).toBeGreaterThan(1));
  for (const item of items()) {
    expect(rect(labelOf(item)).width).toBeGreaterThan(1);
    expect(rect(item).width).toBeGreaterThan(32);
  }
  expectNoOverlap();
});

it("shows only the icons in a row narrower than the width, labels kept as names", async () => {
  render(<Row width={300} />);
  const [board, list, calendar] = items();
  await waitFor(() => expect(rect(labelOf(board!)).width).toBeLessThanOrEqual(1));
  expect(rect(labelOf(list!)).width).toBeLessThanOrEqual(1);
  expect(
    rect(board!.querySelector("[data-slot=segmented-control-count]")!).width,
  ).toBeLessThanOrEqual(1);
  for (const item of [board!, list!, calendar!]) {
    expect(rect(labelOf(item)).width).toBeLessThanOrEqual(1);
    expect(rect(item).width).toBe(32);
  }
  // sr-only, not display:none: still the accessible name.
  expect(screen.getByRole("radio", { name: /Board/ })).toBe(board);
  expect(screen.getByRole("radio", { name: "List" })).toBe(list);
  expectNoOverlap();
});

it("names a collapsed segment in a tooltip", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  render(<Row width={300} />);
  const [, list] = items();
  await waitFor(() => expect(rect(labelOf(list!)).width).toBeLessThanOrEqual(1));
  await page.getByRole("radio", { name: "List" }).hover();
  await waitFor(() => expect(tooltip()?.textContent).toBe("List"));
  await page.getByRole("radio", { name: "Calendar" }).hover();
  await waitFor(() => expect(tooltip()?.textContent).toBe("Calendar"));
});

it("shows no tooltip on a segment whose label is visible", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  render(<Row width={600} />);
  await waitFor(() => expect(rect(labelOf(items()[1]!)).width).toBeGreaterThan(1));
  await page.getByRole("radio", { name: "List" }).hover();
  await new Promise((r) => setTimeout(r, 300));
  expect(tooltip()).toBeNull();
});
