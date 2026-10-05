import "./table.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  Table,
  TableBody,
  TableCell,
  TableColgroup,
  TableColumn,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const SELECT_ITEMS = { none: "No access", read: "Read only", write: "Writable" } as const;
const COL_60 = { width: "60%" } as const;
const COL_40 = { width: "40%" } as const;

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

function renderTable(theme: Theme, mode?: ThemeMode, className?: string) {
  return render(
    <ThemeProvider theme={theme} mode={mode}>
      <Table className={className} data-testid="table">
        <TableHeader data-testid="header">
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="body">
          <TableRow data-testid="row-1">
            <TableCell data-testid="cell-1a">
              A resource whose name is deliberately long enough to wrap on narrow viewports
            </TableCell>
            <TableCell>No access</TableCell>
          </TableRow>
          <TableRow data-testid="row-2">
            <TableCell data-testid="cell-2a">Short name</TableCell>
            <TableCell>Read only</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ThemeProvider>,
  );
}

for (const { key, theme, mode } of THEMES) {
  it(`${key}: renders native table semantics with themed chrome`, () => {
    renderTable(theme, mode);
    const table = document.querySelector('[data-slot="table"]') as HTMLTableElement;
    expect(table.tagName).toBe("TABLE");
    expect(table.querySelector('[data-slot="table-header"]')?.tagName).toBe("THEAD");
    expect(table.querySelector('[data-slot="table-body"]')?.tagName).toBe("TBODY");
    expect(table.querySelector('[data-slot="table-row"]')?.tagName).toBe("TR");
    const head = table.querySelector('[data-slot="table-head"]') as HTMLTableCellElement;
    expect(head.tagName).toBe("TH");
    expect(head.getAttribute("scope")).toBe("col");
    const cell = table.querySelector('[data-slot="table-cell"]') as HTMLTableCellElement;
    expect(cell.tagName).toBe("TD");
    // row separators and padding exist (theme-token driven, non-zero)
    const headStyle = getComputedStyle(head);
    expect(Number.parseFloat(headStyle.paddingLeft)).toBeGreaterThanOrEqual(12);
    expect(Number.parseFloat(headStyle.paddingTop)).toBeGreaterThanOrEqual(8);
    const row = table.querySelector('[data-slot="table-row"]') as HTMLTableRowElement;
    expect(Number.parseFloat(getComputedStyle(row).borderBottomWidth)).toBeGreaterThan(0);
  });
}

it("narrow viewports: the first column wraps and columns stay aligned", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 900);
  renderTable("elegant", "light");
  const table = document.querySelector('[data-slot="table"]') as HTMLTableElement;
  // no horizontal overflow: the flexible first column wraps instead
  const container = table.parentElement as HTMLElement;
  expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(
    container.getBoundingClientRect().width + 1,
  );
  const a1 = document.querySelector('[data-testid="cell-1a"]') as HTMLElement;
  const a2 = document.querySelector('[data-testid="cell-2a"]') as HTMLElement;
  // both rows' first cells share one column width
  expect(Math.round(a1.getBoundingClientRect().width)).toBe(
    Math.round(a2.getBoundingClientRect().width),
  );
  // the long name actually wrapped (taller than one line)
  expect(a1.getBoundingClientRect().height).toBeGreaterThan(
    Number.parseFloat(getComputedStyle(a1).lineHeight) * 1.5,
  );
  await page.viewport(1280, 900);
});

it("colgroup passthrough + table-fixed gives stable caller-owned widths", () => {
  render(
    <ThemeProvider theme="elegant" mode="light">
      <Table className="table-fixed" data-testid="table">
        <TableColgroup>
          <TableColumn style={COL_60} />
          <TableColumn style={COL_40} />
        </TableColgroup>
        <TableBody>
          <TableRow>
            <TableCell data-testid="col-a">a</TableCell>
            <TableCell data-testid="col-b">b</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ThemeProvider>,
  );
  const table = document.querySelector('[data-slot="table"]') as HTMLTableElement;
  const width = table.getBoundingClientRect().width;
  const a = document.querySelector('[data-testid="col-a"]')!.getBoundingClientRect().width;
  const b = document.querySelector('[data-testid="col-b"]')!.getBoundingClientRect().width;
  expect(Math.abs(a / width - 0.6)).toBeLessThan(0.05);
  expect(Math.abs(b / width - 0.4)).toBeLessThan(0.05);
});

it("cell controls: a Select opens, navigates and commits via the keyboard", async () => {
  render(
    <ThemeProvider theme="elegant" mode="light">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Resource</TableCell>
            <TableCell>
              <Select items={SELECT_ITEMS} defaultValue="read">
                <SelectTrigger data-testid="sel-trigger" className="w-30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectList>
                    <SelectItem value="none">No access</SelectItem>
                    <SelectItem value="read">Read only</SelectItem>
                    <SelectItem value="write">Writable</SelectItem>
                  </SelectList>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ThemeProvider>,
  );
  const trigger = document.querySelector('[data-testid="sel-trigger"]') as HTMLElement;
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  const listbox = await screen.findByRole("listbox");
  expect(listbox).not.toBeNull();
  fireEvent.keyDown(listbox, { key: "ArrowDown" });
  fireEvent.keyDown(listbox, { key: "ArrowDown" });
  fireEvent.keyDown(listbox, { key: "Enter" });
  expect(trigger.textContent).toContain("Writable");
});
