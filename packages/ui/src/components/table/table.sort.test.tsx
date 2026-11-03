/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortableHead,
} from "./table";
import type { TableSort } from "./table";

afterEach(() => {
  cleanup();
});

function renderHead(props: {
  sort?: TableSort;
  firstSort?: TableSort;
  align?: "left" | "right";
  onSortChange?: (sort: TableSort) => void;
}) {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableSortableHead data-testid="head" {...props}>
            Memory
          </TableSortableHead>
        </TableRow>
      </TableHeader>
    </Table>,
  );
  return {
    head: screen.getByTestId("head"),
    button: screen.getByRole("button"),
  };
}

describe("TableSortableHead", () => {
  it("is a column heading cell holding one button", () => {
    const { head, button } = renderHead({});
    expect(head.tagName).toBe("TH");
    expect(head.getAttribute("scope")).toBe("col");
    expect(head.dataset.slot).toBe("table-sortable-head");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.parentElement).toBe(head);
  });

  it("sets aria-sort on the cell, not the button, and only when sorted", () => {
    const { head } = renderHead({});
    expect(head.hasAttribute("aria-sort")).toBe(false);
    cleanup();
    const asc = renderHead({ sort: "ascending" });
    expect(asc.head.getAttribute("aria-sort")).toBe("ascending");
    expect(asc.button.hasAttribute("aria-sort")).toBe(false);
    cleanup();
    const desc = renderHead({ sort: "descending" });
    expect(desc.head.getAttribute("aria-sort")).toBe("descending");
    expect(desc.button.hasAttribute("aria-sort")).toBe(false);
  });

  it("names the button by the label alone, sorted or not", () => {
    renderHead({});
    expect(screen.getByRole("button", { name: "Memory" })).toBeTruthy();
    cleanup();
    renderHead({ sort: "descending" });
    expect(screen.getByRole("button", { name: "Memory" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Memory" })).toBeTruthy();
  });

  it("sorts an unsorted column in its first direction", () => {
    const onSortChange = vi.fn();
    const { button } = renderHead({ onSortChange });
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenLastCalledWith("ascending");
    cleanup();
    const descending = renderHead({ firstSort: "descending", onSortChange });
    fireEvent.click(descending.button);
    expect(onSortChange).toHaveBeenLastCalledWith("descending");
  });

  it("reverses the sorted column, whatever its first direction", () => {
    const onSortChange = vi.fn();
    const asc = renderHead({ sort: "ascending", firstSort: "ascending", onSortChange });
    fireEvent.click(asc.button);
    expect(onSortChange).toHaveBeenLastCalledWith("descending");
    cleanup();
    const desc = renderHead({ sort: "descending", firstSort: "descending", onSortChange });
    fireEvent.click(desc.button);
    expect(onSortChange).toHaveBeenLastCalledWith("ascending");
    expect(onSortChange).toHaveBeenCalledTimes(2);
  });

  it("draws an arrow, hidden from assistive technology, only on the sorted column", () => {
    const unsorted = renderHead({});
    expect(unsorted.button.querySelector("svg")).toBeNull();
    // The arrow's room stays, empty, so the column keeps its width when the
    // sort moves to another column.
    const space = unsorted.button.querySelector('[data-slot="table-sort-arrow-space"]');
    expect(space?.getAttribute("aria-hidden")).toBe("true");
    expect(space?.getAttribute("class")).toContain("size-3");
    cleanup();
    const glyphs = { ascending: "lucide-arrow-up", descending: "lucide-arrow-down" } as const;
    for (const sort of ["ascending", "descending"] as const) {
      const { button } = renderHead({ sort });
      const arrows = button.querySelectorAll("svg");
      expect(arrows).toHaveLength(1);
      const arrow = arrows[0]!;
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
      expect(arrow.getAttribute("data-slot")).toBe("table-sort-arrow");
      expect(arrow.getAttribute("class")).toContain("size-3");
      // arrow-up when ascending, arrow-down when descending.
      expect(arrow.classList.contains(glyphs[sort])).toBe(true);
      expect(
        arrow.classList.contains(glyphs[sort === "ascending" ? "descending" : "ascending"]),
      ).toBe(false);
      cleanup();
    }
  });

  it("puts the arrow after the label, or before it in a right-aligned column", () => {
    const left = renderHead({ sort: "descending" });
    expect(left.button.firstChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(left.button.lastElementChild?.tagName.toLowerCase()).toBe("svg");
    cleanup();
    const right = renderHead({ sort: "descending", align: "right" });
    expect(right.button.firstChild?.nodeName.toLowerCase()).toBe("svg");
    expect(right.button.lastChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(right.button.className).toContain("justify-end");
    expect(left.button.className).not.toContain("justify-end");
  });

  it("marks only the sorted column's label in foreground", () => {
    const unsorted = renderHead({});
    expect(unsorted.button.className.split(" ")).toContain("text-foreground-hint");
    expect(unsorted.button.className.split(" ")).not.toContain("text-foreground");
    cleanup();
    const sorted = renderHead({ sort: "ascending" });
    expect(sorted.button.className.split(" ")).toContain("text-foreground");
    expect(sorted.button.className.split(" ")).not.toContain("text-foreground-hint");
  });

  it("keeps aria-sort on a columnheader drawn without Table", () => {
    const onSortChange = vi.fn();
    render(
      <div role="table" aria-label="Computers">
        <div role="row">
          <TableSortableHead
            render={<div role="columnheader" />}
            sort="descending"
            onSortChange={onSortChange}
          >
            Memory
          </TableSortableHead>
        </div>
      </div>,
    );
    const header = screen.getByRole("columnheader", { name: "Memory" });
    expect(header.tagName).toBe("DIV");
    expect(header.getAttribute("aria-sort")).toBe("descending");
    // `scope` belongs to a `th`; a rendered div gets none.
    expect(header.hasAttribute("scope")).toBe(false);
    const button = screen.getByRole("button", { name: "Memory" });
    expect(button.parentElement).toBe(header);
    fireEvent.click(button);
    expect(onSortChange).toHaveBeenCalledWith("ascending");
  });
});

describe("align", () => {
  function renderColumn(align?: "left" | "right") {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="head" align={align}>
              Runs
            </TableHead>
            <TableSortableHead data-testid="sortable" align={align}>
              Runs
            </TableSortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell data-testid="cell" align={align}>
              412
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const classes = (id: string) => screen.getByTestId(id).className.split(" ").sort();
    const head = screen.getByTestId("head");
    const cell = screen.getByTestId("cell");
    return { head, cell, headClasses: classes("head"), cellClasses: classes("cell") };
  }

  it("leaves TableHead and TableCell as they were when unset or left", () => {
    const unset = renderColumn();
    expect(unset.head.hasAttribute("align")).toBe(false);
    expect(unset.cell.hasAttribute("align")).toBe(false);
    expect(unset.headClasses).toContain("text-left");
    expect(unset.cellClasses).not.toContain("text-right");
    cleanup();
    const left = renderColumn("left");
    expect(left.headClasses).toEqual(unset.headClasses);
    expect(left.cellClasses).toEqual(unset.cellClasses);
  });

  it("right-aligns a heading and its cells with the same prop", () => {
    const unset = renderColumn();
    cleanup();
    const right = renderColumn("right");
    // A class, not the obsolete `align` attribute.
    expect(right.head.hasAttribute("align")).toBe(false);
    expect(right.cell.hasAttribute("align")).toBe(false);
    expect(right.headClasses).toEqual(
      [...unset.headClasses.filter((name) => name !== "text-left"), "text-right"].sort(),
    );
    expect(right.cellClasses).toEqual([...unset.cellClasses, "text-right"].sort());
    expect(screen.getByRole("button").className).toContain("justify-end");
  });
});
