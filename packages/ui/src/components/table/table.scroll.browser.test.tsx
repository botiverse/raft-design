// TableScroll in a real browser, on a 390px phone: a table wider than its column scrolls sideways
// in its own area, the page never does, a vertical wheel over the table still scrolls the page,
// and the area is a tab stop with a scrollbar only while the table is wider than it.
//
// Revert to fail: table-scroll.tsx, `orientation="horizontal"` (the area then cuts the table off:
// no horizontal scrollbar, and a sideways wheel moves nothing).
import "./table.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "./index";

const it = test.skipIf(typeof window === "undefined");

beforeEach(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  window.scrollTo(0, 0);
});
afterEach(cleanup);

/** Two frames and a task: a ResizeObserver notification, the render it causes, the frame after it. */
const settle = async () => {
  for (let i = 0; i < 2; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
  }
};

/** A real wheel turn over the middle of `element`, as the browser's own input. */
async function wheelOver(element: Element, deltaX: number, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  // CDP's coordinates are the top page's; the test runs in an iframe of it.
  const frame = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const rect = element.getBoundingClientRect();
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: frame.left + rect.left + rect.width / 2,
    y: frame.top + rect.top + rect.height / 2,
    deltaX,
    deltaY,
  });
  // A wheel scroll animates; let it end before anything is read.
  await new Promise((resolve) => setTimeout(resolve, 300));
}

const MONTHS = ["May", "June", "July", "August", "September", "October"];

const wideTable = (
  <Table className="min-w-180">
    <TableHeader>
      <TableRow>
        <TableHead>Resource</TableHead>
        {MONTHS.map((month) => (
          <TableHead key={month} align="right">
            {month}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Nightly build</TableCell>
        {MONTHS.map((month) => (
          <TableCell key={month} align="right">
            412
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  </Table>
);

const plainTable = (
  <table>
    <tbody>
      <tr>
        {MONTHS.map((month) => (
          <td key={month} className="px-3 whitespace-nowrap">
            Runs in {month} of this year
          </td>
        ))}
      </tr>
    </tbody>
  </table>
);

/** The table in a column as wide as the phone, on a page taller than the screen. */
function Page({ children }: { children: ReactNode }) {
  return (
    <div className="p-4">
      <TableScroll data-testid="scroll">{children}</TableScroll>
      <div className="h-[1600px]" />
    </div>
  );
}

const horizontalGutter = (root: Element) =>
  root.querySelector<HTMLElement>(
    ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--horizontal",
  );

it.each([
  ["a raft-ui Table with a least width", wideTable],
  ["a plain <table>", plainTable],
])("%s wider than a 390px column scrolls in its area, not the page", async (_name, table) => {
  render(<Page>{table}</Page>);
  const scroll = screen.getByTestId("scroll");
  await settle();

  expect(window.innerWidth).toBe(390);
  expect(scroll.dataset.slot).toBe("table-scroll");
  // The area is as wide as its column, and the table is wider than the area.
  expect(scroll.getBoundingClientRect().width).toBe(390 - 32);
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  // Sideways only: nothing to scroll down inside the area.
  expect(scroll.scrollHeight).toBe(scroll.clientHeight);
  expect(getComputedStyle(scroll).overflowX).toBe("auto");
  expect(getComputedStyle(scroll).overflowY).toBe("hidden");

  // Its scrollbar is drawn, with a thumb shorter than the gutter, and the keyboard can reach it.
  const gutter = horizontalGutter(scroll)!;
  expect(gutter).not.toBeNull();
  const thumb = gutter.querySelector<HTMLElement>(".r-scroll-area__thumb")!;
  expect(thumb.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(thumb.getBoundingClientRect().width).toBeLessThan(gutter.getBoundingClientRect().width);
  expect(scroll.tabIndex).toBe(0);

  // A sideways wheel scrolls the table, and the page stays where it is.
  await wheelOver(scroll, 200, 0);
  expect(scroll.scrollLeft).toBeGreaterThan(0);
  expect(window.scrollX).toBe(0);
  expect(window.scrollY).toBe(0);

  // A vertical wheel over the table goes to the page: the area holds back the horizontal axis only.
  expect(getComputedStyle(scroll).overscrollBehaviorX).toBe("none");
  expect(getComputedStyle(scroll).overscrollBehaviorY).toBe("auto");
  await wheelOver(scroll, 0, 400);
  expect(window.scrollY).toBeGreaterThan(0);
});

it("a table that fits draws no scrollbar and adds no tab stop", async () => {
  render(
    <Page>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Nightly build</TableCell>
            <TableCell>412</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Page>,
  );
  const scroll = screen.getByTestId("scroll");
  await settle();

  expect(scroll.scrollWidth).toBe(scroll.clientWidth);
  expect(horizontalGutter(scroll)).toBeNull();
  expect(scroll.hasAttribute("tabindex")).toBe(false);
});

// table.md, "Wide tables": a column header never wraps and a cell wraps at any character, so with
// no least width the columns are squeezed to their headers before the table scrolls.
const DESCRIPTION =
  "Runs every night after the last merge, builds each package and uploads what it built for the morning.";
const describedTable = (className?: string) => (
  <Table className={className}>
    <TableHeader>
      <TableRow>
        <TableHead>Description</TableHead>
        {MONTHS.map((month) => (
          <TableHead key={month}>Runs in {month}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell data-testid="description">{DESCRIPTION}</TableCell>
        {MONTHS.map((month) => (
          <TableCell key={month}>412</TableCell>
        ))}
      </TableRow>
    </TableBody>
  </Table>
);

it("a Table with no least width squeezes its columns to their headers, then scrolls", async () => {
  render(<Page>{describedTable()}</Page>);
  const scroll = screen.getByTestId("scroll");
  await settle();

  // The headers alone are wider than the phone, so it scrolls...
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  // ...but the long cell is as narrow as its header and many lines tall.
  const cell = screen.getByTestId("description").getBoundingClientRect();
  const head = screen.getByText("Description").getBoundingClientRect();
  expect(cell.width).toBe(head.width);
  expect(cell.height).toBeGreaterThan(150);
});

it("with a least width, the long cell keeps a readable column", async () => {
  render(<Page>{describedTable("min-w-280")}</Page>);
  const scroll = screen.getByTestId("scroll");
  await settle();

  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
  const cell = screen.getByTestId("description").getBoundingClientRect();
  expect(cell.width).toBeGreaterThan(250);
  expect(cell.height).toBeLessThan(150);
});
