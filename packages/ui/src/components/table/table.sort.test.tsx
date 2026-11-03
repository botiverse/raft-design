/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
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
  TableSortButton,
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

// TableSortableHead's classes as they were before TableSortButton was split
// out of it: the cell drops its padding (`p-0`) and the button carries it, so
// the heading keeps TableHead's geometry. Pinned, so moving the button into
// its own part can't change a heading that already ships.
const HEAD_LEFT =
  "text-left whitespace-nowrap border-b border-line-hairline text-footnote font-bold normal-case tracking-normal text-foreground-hint p-0";
const HEAD_RIGHT =
  "whitespace-nowrap border-b border-line-hairline text-footnote font-bold normal-case tracking-normal text-foreground-hint text-right p-0";
const BUTTON_TOUCH =
  "pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:bottom-0 pointer-coarse:after:content-[''] pointer-coarse:after:-top-[calc(--spacing(11)-100%)]";
const HEAD_BUTTON = `relative flex w-full items-center gap-1 border-0 bg-transparent px-3 py-2 [font:inherit] cursor-pointer rounded-sticker hover:text-foreground outline-none focus-visible:shadow-focus ${BUTTON_TOUCH}`;
const BARE_BUTTON = `relative flex h-full w-full items-center gap-1 border-0 bg-transparent [font:inherit] cursor-pointer rounded-sticker hover:text-foreground outline-none focus-visible:shadow-focus ${BUTTON_TOUCH}`;

describe("TableSortableHead's classes", () => {
  it("are unchanged on an unsorted left-aligned heading", () => {
    const { head, button } = renderHead({});
    expect(head.className).toBe(HEAD_LEFT);
    expect(button.className).toBe(`${HEAD_BUTTON} text-foreground-hint`);
    const buttonHTML = `<button type="button" data-slot="table-sort-button" class="${HEAD_BUTTON} text-foreground-hint">Memory<span aria-hidden="true" data-slot="table-sort-arrow-space" class="size-3 shrink-0"></span></button>`;
    expect(button.outerHTML).toBe(buttonHTML);
    // The whole heading cell: its attributes (whatever their order) and, as
    // its only content, that button.
    expect(
      Array.from(head.attributes, (attribute) => [attribute.name, attribute.value]).sort(
        ([a], [b]) => a!.localeCompare(b!),
      ),
    ).toEqual([
      ["class", HEAD_LEFT],
      ["data-slot", "table-sortable-head"],
      ["data-testid", "head"],
      ["scope", "col"],
    ]);
    expect(head.innerHTML).toBe(buttonHTML);
  });

  it("are unchanged on a sorted right-aligned heading", () => {
    const { head, button } = renderHead({ sort: "descending", align: "right" });
    expect(head.className).toBe(HEAD_RIGHT);
    expect(button.className).toBe(`${HEAD_BUTTON} justify-end text-foreground`);
    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild?.getAttribute("class")).toContain("size-3 shrink-0");
  });
});

describe("TableSortButton", () => {
  // The hand-drawn header row it is for: the caller's cell owns the type,
  // padding, line and `aria-sort`.
  function renderButton(props: {
    sort?: TableSort;
    firstSort?: TableSort;
    align?: "left" | "right";
    onSortChange?: (sort: TableSort) => void;
    className?: string;
  }) {
    render(
      <div role="table" aria-label="Computers">
        <div role="row">
          <div role="columnheader" aria-sort={props.sort} data-testid="cell">
            <TableSortButton data-testid="button" {...props}>
              Memory
            </TableSortButton>
          </div>
        </div>
      </div>,
    );
    return {
      cell: screen.getByTestId("cell"),
      button: screen.getByRole("button", { name: "Memory" }),
    };
  }

  it("is a native button named by its label, inside the caller's columnheader", () => {
    const { cell, button } = renderButton({ sort: "ascending" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.dataset.slot).toBe("table-sort-button");
    expect(button.dataset.testid).toBe("button");
    expect(button.parentElement).toBe(cell);
    expect(button.hasAttribute("aria-sort")).toBe(false);
    expect(screen.getByRole("columnheader", { name: "Memory" })).toBe(cell);
  });

  it("sorts in the first direction, then reverses", () => {
    const onSortChange = vi.fn();
    fireEvent.click(renderButton({ onSortChange }).button);
    expect(onSortChange).toHaveBeenLastCalledWith("ascending");
    cleanup();
    fireEvent.click(renderButton({ firstSort: "descending", onSortChange }).button);
    expect(onSortChange).toHaveBeenLastCalledWith("descending");
    cleanup();
    fireEvent.click(
      renderButton({ sort: "ascending", firstSort: "ascending", onSortChange }).button,
    );
    expect(onSortChange).toHaveBeenLastCalledWith("descending");
    cleanup();
    fireEvent.click(
      renderButton({ sort: "descending", firstSort: "descending", onSortChange }).button,
    );
    expect(onSortChange).toHaveBeenLastCalledWith("ascending");
    expect(onSortChange).toHaveBeenCalledTimes(4);
  });

  it("keeps the arrow's room when unsorted and draws the arrow when sorted", () => {
    const unsorted = renderButton({});
    expect(unsorted.button.querySelector("svg")).toBeNull();
    const space = unsorted.button.querySelector('[data-slot="table-sort-arrow-space"]');
    expect(space?.getAttribute("aria-hidden")).toBe("true");
    expect(space?.getAttribute("class")).toBe("size-3 shrink-0");
    expect(unsorted.button.lastElementChild).toBe(space);
    cleanup();
    const glyphs = { ascending: "lucide-arrow-up", descending: "lucide-arrow-down" } as const;
    for (const sort of ["ascending", "descending"] as const) {
      const { button } = renderButton({ sort });
      const arrows = button.querySelectorAll("svg");
      expect(arrows).toHaveLength(1);
      const arrow = arrows[0]!;
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
      expect(arrow.getAttribute("data-slot")).toBe("table-sort-arrow");
      expect(arrow.classList.contains("size-3")).toBe(true);
      expect(arrow.classList.contains(glyphs[sort])).toBe(true);
      expect(button.querySelector('[data-slot="table-sort-arrow-space"]')).toBeNull();
      cleanup();
    }
    const right = renderButton({ sort: "descending", align: "right" });
    expect(right.button.firstChild?.nodeName.toLowerCase()).toBe("svg");
    expect(right.button.lastChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(right.button.className.split(" ")).toContain("justify-end");
  });

  it("has no padding and no border, and inherits the font", () => {
    const { button } = renderButton({});
    const classes = button.className.split(" ");
    expect(classes.filter((name) => /^-?p[xytrblse]?-/.test(name))).toEqual([]);
    expect(classes.filter((name) => name.startsWith("border") && name !== "border-0")).toEqual([]);
    expect(classes).toContain("[font:inherit]");
    expect(classes.filter((name) => /^(text-(footnote|left|right)|font-bold)$/.test(name))).toEqual(
      [],
    );
    expect(button.className).toBe(`${BARE_BUTTON} text-foreground-hint`);
  });

  it("is TableSortableHead's button without its padding, filling its cell", () => {
    const bare = renderButton({ sort: "descending", align: "right" }).button.className;
    cleanup();
    const head = renderHead({ sort: "descending", align: "right" }).button.className;
    expect(bare.split(" ")).toContain("h-full");
    expect(bare.split(" ")).toContain("w-full");
    expect(head.split(" ")).not.toContain("h-full");
    expect(bare.split(" ").filter((name) => name !== "h-full")).toEqual(
      head.split(" ").filter((name) => !/^p[xy]-/.test(name)),
    );
  });

  it("marks only the sorted column's label in foreground", () => {
    const unsorted = renderButton({}).button.className.split(" ");
    expect(unsorted).toContain("text-foreground-hint");
    expect(unsorted).not.toContain("text-foreground");
    cleanup();
    const sorted = renderButton({ sort: "ascending" }).button.className.split(" ");
    expect(sorted).toContain("text-foreground");
    expect(sorted).not.toContain("text-foreground-hint");
  });

  it("takes a className, merged into its recipe", () => {
    const { button } = renderButton({ className: "w-auto" });
    const classes = button.className.split(" ");
    expect(classes).toContain("w-auto");
    expect(classes).not.toContain("w-full");
  });

  it("takes the row's horizontal padding from the caller", () => {
    const { button } = renderButton({ className: "px-2" });
    expect(button.className).toBe(`${BARE_BUTTON} text-foreground-hint px-2`);
  });

  it("gives the ref to the button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <div role="table" aria-label="Computers">
        <div role="row">
          <div role="columnheader">
            <TableSortButton ref={ref}>Memory</TableSortButton>
          </div>
        </div>
      </div>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Memory" }));
  });
});

// The button can't carry aria-sort, so a header row that forgets it on the
// cell, or forgets the columnheader, tells screen readers nothing of the sort.
describe("TableSortButton's development warning", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function quietWarn() {
    return vi.spyOn(console, "warn").mockImplementation(() => {});
  }

  it("warns when no heading cell is around it", () => {
    const warn = quietWarn();
    render(
      <div>
        <TableSortButton sort="ascending">Memory</TableSortButton>
      </div>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("not inside a heading cell");
  });

  it("warns when the cell's aria-sort is missing or isn't sort", () => {
    const warn = quietWarn();
    render(
      <div role="table" aria-label="Computers">
        <div role="row">
          <div role="columnheader">
            <TableSortButton sort="descending">Memory</TableSortButton>
          </div>
        </div>
      </div>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("no aria-sort");
    cleanup();
    warn.mockClear();
    render(
      <div role="table" aria-label="Computers">
        <div role="row">
          <div role="columnheader" aria-sort="ascending">
            <TableSortButton>Memory</TableSortButton>
          </div>
        </div>
      </div>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain('aria-sort="ascending"');
  });

  it("is quiet when the cell's aria-sort is sort, in a th or a columnheader", () => {
    const warn = quietWarn();
    function Drawn({ sort }: { sort?: TableSort }) {
      return (
        <div role="table" aria-label="Computers">
          <div role="row">
            <div role="columnheader" aria-sort={sort ?? "none"}>
              <TableSortButton sort={sort}>Memory</TableSortButton>
            </div>
          </div>
        </div>
      );
    }
    const { rerender } = render(<Drawn />);
    rerender(<Drawn sort="ascending" />);
    rerender(<Drawn sort="descending" />);
    cleanup();
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <th aria-sort="descending">
              <TableSortButton sort="descending">Memory</TableSortButton>
            </th>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("never runs for TableSortableHead, which sets aria-sort itself", () => {
    const warn = quietWarn();
    renderHead({ sort: "descending" });
    expect(warn).not.toHaveBeenCalled();
  });
});
