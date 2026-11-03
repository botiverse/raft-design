import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { SlotElementProps } from "../../lib/data-attributes";
import type { StyledProps } from "../../lib/styled-props";
import { table } from "./table.recipe";

type TableProps = StyledProps<useRender.ComponentProps<"table">>;
type TableHeaderProps = StyledProps<useRender.ComponentProps<"thead">>;
type TableBodyProps = StyledProps<useRender.ComponentProps<"tbody">>;
type TableRowProps = StyledProps<useRender.ComponentProps<"tr">>;
type TableHeadProps = Omit<StyledProps<useRender.ComponentProps<"th">>, "align"> & {
  /**
   * `"right"` for a right-aligned column, such as numbers. Pass the same
   * value to the column's cells, so the heading sits over its values.
   */
  align?: "left" | "right";
};
type TableCellProps = Omit<StyledProps<useRender.ComponentProps<"td">>, "align"> & {
  /**
   * `"right"` for a right-aligned column, such as numbers. Pass the same
   * value to the column's heading, so the heading sits over its values.
   */
  align?: "left" | "right";
};
type TableSort = "ascending" | "descending";
type TableSortButtonProps = Omit<StyledProps<useRender.ComponentProps<"button">>, "aria-sort"> & {
  /**
   * The column's current sort, or undefined when the rows aren't sorted by
   * it. Draws the arrow and colors the label; set the same value as
   * `aria-sort` on the heading cell around the button.
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
   * the column's right edge and the arrow goes before it. Pass the same value
   * to the column's cells.
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

export function TableHead({
  className,
  render,
  scope = "col",
  align = "left",
  ...props
}: TableHeadProps) {
  const { head } = table({ align });
  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">({ scope, className: head({ className }) }, props),
    state: { slot: "table-head" },
  });
}

/**
 * A column heading that sorts the rows (table.md, "Sorting"): a `TableHead`
 * whose label is a `TableSortButton` filling the cell, with `aria-sort` on the
 * cell and a 12px arrow on the sorted column only. Which column is sorted is
 * the caller's: pass `sort` and update it from `onSortChange`. With
 * `render={<div role="columnheader" />}` it draws a th-like cell, with the
 * header type, line and padding, and sets no `scope`, which only a `th`
 * takes. Native props, `className` and the ref go to the heading cell, not the
 * button.
 */
export function TableSortableHead({
  className,
  render,
  scope,
  sort,
  firstSort = "ascending",
  onSortChange,
  align = "left",
  children,
  ...props
}: TableSortableHeadProps) {
  const { head, sortableHead } = table({ align });
  const button = useSortButton(
    { sort, firstSort, onSortChange, align, children },
    "headSortButton",
  );
  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">(
      {
        scope: scope ?? (render === undefined ? "col" : undefined),
        "aria-sort": sort,
        className: head({ className: sortableHead({ className }) }),
        children: button,
      },
      props,
    ),
    state: { slot: "table-sortable-head" },
  });
}

/**
 * The button of a heading that sorts, on its own, for a header row drawn
 * without `Table` (table.md, "Sorting"): the label, the 12px arrow on the
 * sorted column (its room kept, empty, on the others), the label's color, the
 * touch hit area and the sort cycle. It has no padding and no border and
 * inherits the font, so the heading cell around it sets the type, padding,
 * line and alignment. Set `aria-sort` on that cell, which needs
 * `role="columnheader"` inside a `role="row"` in a `role="table"` or
 * `role="grid"`. Native props, `className` and the ref go to the button.
 */
export function TableSortButton(props: TableSortButtonProps) {
  return useSortButton(props, "sortButton");
}

function useSortButton(
  {
    className,
    render,
    sort,
    firstSort = "ascending",
    onSortChange,
    align = "left",
    children,
    ...props
  }: TableSortButtonProps,
  slot: "sortButton" | "headSortButton",
) {
  const classes = table({ align, sorted: sort !== undefined });
  const Arrow = sort === "descending" ? ArrowDown : ArrowUp;
  // An unsorted heading keeps the arrow's room, empty, so the columns don't
  // move when the sort moves to another column (auto table layout sizes each
  // column to its widest content, the heading included).
  const arrow = sort ? (
    <Arrow aria-hidden data-slot="table-sort-arrow" className={classes.sortArrow()} />
  ) : (
    <span aria-hidden data-slot="table-sort-arrow-space" className={classes.sortArrow()} />
  );
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "table-sort-button",
    className: classes[slot]({ className }),
    onClick: () => onSortChange?.(sort ? reverseSort(sort) : firstSort),
    children: (
      <>
        {align === "right" ? arrow : null}
        {children}
        {align === "right" ? null : arrow}
      </>
    ),
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

function reverseSort(sort: TableSort): TableSort {
  return sort === "ascending" ? "descending" : "ascending";
}

export function TableCell({ className, render, align = "left", ...props }: TableCellProps) {
  const { cell } = table({ align });
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
  TableSortButtonProps,
  TableSortableHeadProps,
};
