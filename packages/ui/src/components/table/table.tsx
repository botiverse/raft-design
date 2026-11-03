import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { StyledProps } from "../../lib/styled-props";
import { table } from "./table.recipe";

type TableProps = StyledProps<useRender.ComponentProps<"table">>;
type TableHeaderProps = StyledProps<useRender.ComponentProps<"thead">>;
type TableBodyProps = StyledProps<useRender.ComponentProps<"tbody">>;
type TableRowProps = StyledProps<useRender.ComponentProps<"tr">>;
type TableHeadProps = StyledProps<useRender.ComponentProps<"th">>;
type TableCellProps = StyledProps<useRender.ComponentProps<"td">>;
type TableSort = "ascending" | "descending";
type TableSortableHeadProps = Omit<
  StyledProps<useRender.ComponentProps<"th">>,
  "align" | "aria-sort"
> & {
  /**
   * The column's current sort, or undefined when the rows aren't sorted by
   * it. Sets `aria-sort` on the heading cell and draws the arrow.
   */
  sort?: TableSort;
  /**
   * The direction of a first click, when the rows aren't sorted by this
   * column: `"descending"` for numbers and dates, `"ascending"` for text.
   */
  firstSort?: TableSort;
  /** Called with the next direction: the reverse of `sort`, or `firstSort`. */
  onSortChange?: (sort: TableSort) => void;
  /**
   * `"right"` for a right-aligned column, such as numbers: the label ends on
   * the column's right edge and the arrow goes before it.
   */
  align?: "left" | "right";
};
type TableColgroupProps = StyledProps<useRender.ComponentProps<"colgroup">>;
type TableColumnProps = StyledProps<useRender.ComponentProps<"col">>;
type TableCaptionProps = StyledProps<useRender.ComponentProps<"caption">>;

/**
 * Native `<table>` semantics with the kit's chrome: render real
 * table/thead/tbody/tr/th/td elements (useRender passthrough), so `scope`,
 * screen-reader navigation and keyboard behaviour stay intact. A caller that
 * wants a visually header-less table keeps its `<TableHead>` and hides it with
 * `sr-only`; omitting the header would drop the semantics.
 */
export function Table({ className, render, ...props }: TableProps) {
  const { root } = table();
  return useRender({
    defaultTagName: "table",
    render,
    props: mergeProps<"table">({ className: root({ className }) }, props),
    state: { slot: "table" },
  });
}

export function TableHeader({ className, render, ...props }: TableHeaderProps) {
  const { header } = table();
  return useRender({
    defaultTagName: "thead",
    render,
    props: mergeProps<"thead">({ className: header({ className }) }, props),
    state: { slot: "table-header" },
  });
}

export function TableBody({ className, render, ...props }: TableBodyProps) {
  const { body } = table();
  return useRender({
    defaultTagName: "tbody",
    render,
    props: mergeProps<"tbody">({ className: body({ className }) }, props),
    state: { slot: "table-body" },
  });
}

export function TableRow({ className, render, ...props }: TableRowProps) {
  const { row } = table();
  return useRender({
    defaultTagName: "tr",
    render,
    props: mergeProps<"tr">({ className: row({ className }) }, props),
    state: { slot: "table-row" },
  });
}

export function TableHead({ className, render, scope = "col", ...props }: TableHeadProps) {
  const { head } = table();
  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">({ scope, className: head({ className }) }, props),
    state: { slot: "table-head" },
  });
}

/**
 * A column heading that sorts the rows (table.md, "Sorting"): a `TableHead`
 * whose label is a button filling the cell, with `aria-sort` on the cell and
 * a 12px arrow on the sorted column only. Which column is sorted is the
 * caller's: pass `sort` and update it from `onSortChange`. In a header row
 * drawn without `Table`, pass `render={<div role="columnheader" />}`.
 */
export function TableSortableHead({
  className,
  render,
  scope = "col",
  sort,
  firstSort = "ascending",
  onSortChange,
  align = "left",
  children,
  ...props
}: TableSortableHeadProps) {
  const { head, sortableHead, sortButton, sortArrow } = table({
    align,
    sorted: sort !== undefined,
  });
  const Arrow = sort === "descending" ? ArrowDown : ArrowUp;
  // An unsorted heading keeps the arrow's room, empty, so the columns don't
  // move when the sort moves to another column (auto table layout sizes each
  // column to its widest content, the heading included).
  const arrow = sort ? (
    <Arrow aria-hidden data-slot="table-sort-arrow" className={sortArrow()} />
  ) : (
    <span aria-hidden data-slot="table-sort-arrow-space" className={sortArrow()} />
  );
  const button = (
    <button
      type="button"
      data-slot="table-sort-button"
      className={sortButton()}
      onClick={() => onSortChange?.(sort ? reverseSort(sort) : firstSort)}
    >
      {align === "right" ? arrow : null}
      {children}
      {align === "right" ? null : arrow}
    </button>
  );
  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">(
      {
        scope,
        "aria-sort": sort,
        className: head({ className: sortableHead({ className }) }),
        children: button,
      },
      props,
    ),
    state: { slot: "table-sortable-head" },
  });
}

function reverseSort(sort: TableSort): TableSort {
  return sort === "ascending" ? "descending" : "ascending";
}

export function TableCell({ className, render, ...props }: TableCellProps) {
  const { cell } = table();
  return useRender({
    defaultTagName: "td",
    render,
    props: mergeProps<"td">({ className: cell({ className }) }, props),
    state: { slot: "table-cell" },
  });
}

/**
 * The table's accessible name. Render it visually or hide it with `sr-only`;
 * a table without a caption should carry `aria-label` instead.
 */
export function TableCaption({ className, render, ...props }: TableCaptionProps) {
  const { caption } = table();
  return useRender({
    defaultTagName: "caption",
    render,
    props: mergeProps<"caption">({ className: caption({ className }) }, props),
    state: { slot: "table-caption" },
  });
}

/** Column-width declarations: pair with `<Table className="table-fixed">`. */
export function TableColgroup({ className, render, ...props }: TableColgroupProps) {
  const { colgroup } = table();
  return useRender({
    defaultTagName: "colgroup",
    render,
    props: mergeProps<"colgroup">({ className: colgroup({ className }) }, props),
    state: { slot: "table-colgroup" },
  });
}

export function TableColumn({ className, render, ...props }: TableColumnProps) {
  const { column } = table();
  return useRender({
    defaultTagName: "col",
    render,
    props: mergeProps<"col">({ className: column({ className }) }, props),
    state: { slot: "table-column" },
  });
}

export type {
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableColgroupProps,
  TableColumnProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  TableSort,
  TableSortableHeadProps,
};
