import "./table.test.css";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortableHead,
  TableSortButton,
} from "./table";
import type { TableSort } from "./table";

// A heading that sorts keeps the arrow's room, empty, when its column isn't
// the sorted one (table.md, "Sorting"). Auto table layout sizes each column
// to its widest content, the heading included, so without that room the
// columns moved 7-12px sideways each time the sort moved to another column.
// Real layout only: jsdom has no widths.

const it = test.skipIf(typeof window === "undefined");

beforeEach(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
});

afterEach(cleanup);

type Column = "name" | "runs" | "lastRun";

// The values are short, so in Runs and Last run the heading, with its arrow
// or its room, is the widest content and sets the column's width.
const ROWS = [
  { id: "nightly-build", name: "Nightly build", runs: "412", lastRun: "Nov 2" },
  { id: "link-check", name: "Link check", runs: "1204", lastRun: "Nov 3" },
  { id: "docs-deploy", name: "Docs deploy", runs: "87", lastRun: "Oct 30" },
];

function Runs({
  column,
  sort,
  className,
}: {
  column?: Column;
  sort?: TableSort;
  className?: string;
}) {
  const sortOf = (name: Column) => (column === name ? sort : undefined);
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow data-testid="sortable-row">
          <TableSortableHead data-testid="head-name" sort={sortOf("name")}>
            Resource
          </TableSortableHead>
          <TableSortableHead
            data-testid="head-runs"
            align="right"
            firstSort="descending"
            sort={sortOf("runs")}
          >
            Runs
          </TableSortableHead>
          <TableSortableHead
            data-testid="head-lastRun"
            firstSort="descending"
            sort={sortOf("lastRun")}
          >
            Last run
          </TableSortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell data-testid="runs-cell" align="right" className="font-mono">
              {row.runs}
            </TableCell>
            <TableCell className="font-mono">{row.lastRun}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Light({ children }: { children: ReactNode }) {
  return <ThemeProvider mode="light">{children}</ThemeProvider>;
}

const COLUMNS = ["name", "runs", "lastRun"] as const;

function widths() {
  return COLUMNS.map((name) => screen.getByTestId(`head-${name}`).getBoundingClientRect().width);
}

// The right edge of the first non-empty text in an element: the glyphs, not
// the box, so padding and the arrow's room don't count.
function textRight(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && !node.textContent?.trim()) node = walker.nextNode();
  const range = document.createRange();
  range.selectNodeContents(node!);
  return range.getBoundingClientRect().right;
}

// The full-width table of the docs example, and a shrink-to-fit one, where
// each column is exactly its widest content.
for (const className of ["max-w-lg", "w-auto"]) {
  it(`${className}: columns keep their widths whichever column is sorted`, async () => {
    const { rerender } = render(<Runs className={className} />, { wrapper: Light });
    await document.fonts.ready;
    const unsorted = widths();
    const states = COLUMNS.flatMap((column) =>
      (["ascending", "descending"] as const).map((sort) => ({ column, sort })),
    );
    for (const { column, sort } of states) {
      rerender(<Runs className={className} column={column} sort={sort} />);
      // The state really changed: one arrow, on the sorted column.
      expect(document.querySelectorAll('[data-slot="table-sort-arrow"]')).toHaveLength(1);
      expect(
        screen.getByTestId(`head-${column}`).querySelector('[data-slot="table-sort-arrow"]'),
      ).not.toBeNull();
      const now = widths();
      for (const [index, width] of now.entries()) {
        expect(width, `${COLUMNS[index]} with ${column} ${sort}`).toBeCloseTo(unsorted[index]!, 1);
      }
    }
  });
}

it("a header row that sorts is as tall as a plain TableHead row", async () => {
  render(
    <>
      <Runs className="max-w-lg" column="runs" sort="descending" />
      <Table className="max-w-lg">
        <TableHeader>
          <TableRow data-testid="plain-row">
            <TableHead>Resource</TableHead>
            <TableHead align="right">Runs</TableHead>
            <TableHead>Last run</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </>,
    { wrapper: Light },
  );
  await document.fonts.ready;
  const sortable = screen.getByTestId("sortable-row").getBoundingClientRect().height;
  const plain = screen.getByTestId("plain-row").getBoundingClientRect().height;
  expect(plain).toBeGreaterThan(0);
  expect(sortable).toBeCloseTo(plain, 1);
});

for (const sort of [undefined, "ascending", "descending"] as const) {
  it(`a right-aligned heading ends where its numbers end (${sort ?? "unsorted"})`, async () => {
    render(<Runs className="max-w-lg" column={sort ? "runs" : undefined} sort={sort} />, {
      wrapper: Light,
    });
    await document.fonts.ready;
    const head = screen.getByTestId("head-runs");
    const button = head.querySelector('[data-slot="table-sort-button"]')!;
    const label = textRight(button);
    const cells = screen.getAllByTestId("runs-cell");
    expect(cells).toHaveLength(ROWS.length);
    for (const cell of cells) {
      // The cell's right content edge, and the digits that end on it.
      const box = cell.getBoundingClientRect();
      const contentRight = box.right - Number.parseFloat(getComputedStyle(cell).paddingRight);
      expect(Math.abs(textRight(cell) - contentRight)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(label - contentRight)).toBeLessThanOrEqual(0.5);
    }
  });
}

// The left edge of the first non-empty text in an element.
function textLeft(el: Element) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node && !node.textContent?.trim()) node = walker.nextNode();
  const range = document.createRange();
  range.selectNodeContents(node!);
  return range.getBoundingClientRect().left;
}

// A header row drawn without Table (a div grid, like a product list's): the
// row sets the type (mono meta), the 28px height and the line; its heading
// cells have no padding, and the caller gives each TableSortButton the row's
// padding (`px-2`). The button fills its cell, so the whole cell is the
// target. One line high, as at f49d8357, its bottom stopped 10-12px above the
// cell's and a click there missed it; with TableSortableHead's padding the
// label sat 4px right of the values.
it("a TableSortButton fills its plain div cell, its label on the values' edge", async () => {
  const grid = "grid grid-cols-[12rem_8rem]";
  render(
    <div role="table" aria-label="Computers" className="font-mono text-mono-meta">
      <div
        role="row"
        data-testid="drawn-row"
        className={`${grid} h-7 border-b border-line-hairline`}
      >
        <div role="columnheader" aria-sort="descending" data-testid="drawn-head">
          <TableSortButton className="px-2" sort="descending">
            Name
          </TableSortButton>
        </div>
        <div role="columnheader" data-testid="drawn-head-right">
          <TableSortButton className="px-2" align="right" firstSort="descending">
            Memory
          </TableSortButton>
        </div>
      </div>
      <div role="row" className={grid}>
        <div role="cell" data-testid="drawn-value" className="px-2">
          mac-mini
        </div>
        <div role="cell" data-testid="drawn-value-right" className="px-2 text-right">
          16 GB
        </div>
      </div>
    </div>,
    { wrapper: Light },
  );
  await document.fonts.ready;
  const rowElement = screen.getByTestId("drawn-row");
  const row = rowElement.getBoundingClientRect();
  const rowBottom = row.bottom - Number.parseFloat(getComputedStyle(rowElement).borderBottomWidth);
  for (const id of ["drawn-head", "drawn-head-right"]) {
    const cell = screen.getByTestId(id);
    const button = cell.querySelector<HTMLElement>('[data-slot="table-sort-button"]')!;
    const box = cell.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    // The cell takes the row's height above its line, and the button the cell's box.
    expect(Math.abs(box.top - row.top), `${id} cell top`).toBeLessThanOrEqual(0.5);
    expect(Math.abs(box.bottom - rowBottom), `${id} cell bottom`).toBeLessThanOrEqual(0.5);
    for (const side of ["top", "right", "bottom", "left"] as const) {
      expect(Math.abs(target[side] - box[side]), `${id} button ${side}`).toBeLessThanOrEqual(0.5);
    }
    // A click anywhere on the cell, its corners included, lands on the button.
    // 2px in on both axes: the button's 4px radius leaves the outermost pixel
    // of each corner outside it (1px in is ~4.24px from the arc's centre).
    for (const [x, y] of [
      [box.left + 2, box.top + 2],
      [box.right - 2, box.top + 2],
      [box.left + 2, box.bottom - 2],
      [box.right - 2, box.bottom - 2],
    ] as const) {
      expect(button.contains(document.elementFromPoint(x, y)), `${id} at ${x},${y}`).toBe(true);
    }
    const cellStyle = getComputedStyle(cell);
    const style = getComputedStyle(button);
    expect(style.fontFamily, id).toBe(cellStyle.fontFamily);
    expect(style.fontSize, id).toBe(cellStyle.fontSize);
    expect(style.fontWeight, id).toBe(cellStyle.fontWeight);
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(cellStyle.getPropertyValue(`padding-${side}`), `${id} cell padding-${side}`).toBe(
        "0px",
      );
      expect(style.getPropertyValue(`border-${side}-width`), `${id} border-${side}`).toBe("0px");
    }
  }
  const head = screen.getByTestId("drawn-head");
  expect(
    Math.abs(textLeft(head) - textLeft(screen.getByTestId("drawn-value"))),
  ).toBeLessThanOrEqual(0.5);
  const right = screen.getByTestId("drawn-head-right");
  expect(
    Math.abs(textRight(right) - textRight(screen.getByTestId("drawn-value-right"))),
  ).toBeLessThanOrEqual(0.5);
});
