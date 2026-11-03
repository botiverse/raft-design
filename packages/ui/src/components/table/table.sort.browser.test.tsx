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
// cells set the type (mono meta), the padding, the 28px row and its line, and
// TableSortButton adds none of its own. With TableSortableHead's padding the
// heading was taller than the row and its label sat 12px right of the values.
it("a TableSortButton in a plain div cell is one line high, its label on the values' edge", async () => {
  const grid = "grid grid-cols-[12rem_8rem]";
  render(
    <div role="table" aria-label="Computers" className="font-mono text-mono-meta">
      <div
        role="row"
        data-testid="drawn-row"
        className={`${grid} h-7 items-center border-b border-line-hairline`}
      >
        <div role="columnheader" aria-sort="descending" data-testid="drawn-head" className="px-2">
          <TableSortButton sort="descending">Name</TableSortButton>
        </div>
        <div role="columnheader" data-testid="drawn-head-right" className="px-2">
          <TableSortButton align="right" firstSort="descending">
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
  expect(screen.getByTestId("drawn-row").getBoundingClientRect().height).toBeCloseTo(28, 1);
  for (const id of ["drawn-head", "drawn-head-right"]) {
    const cell = screen.getByTestId(id);
    const button = cell.querySelector('[data-slot="table-sort-button"]')!;
    const cellStyle = getComputedStyle(cell);
    const style = getComputedStyle(button);
    const lineHeight = Number.parseFloat(cellStyle.lineHeight);
    expect(lineHeight).toBeGreaterThan(12);
    expect(button.getBoundingClientRect().height, id).toBeCloseTo(lineHeight, 1);
    expect(style.fontFamily, id).toBe(cellStyle.fontFamily);
    expect(style.fontSize, id).toBe(cellStyle.fontSize);
    expect(style.fontWeight, id).toBe(cellStyle.fontWeight);
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(style.getPropertyValue(`padding-${side}`), `${id} padding-${side}`).toBe("0px");
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
