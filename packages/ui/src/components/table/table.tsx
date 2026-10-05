import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { StyledProps } from "../../lib/styled-props";
import { table } from "./table.recipe";

type TableProps = StyledProps<useRender.ComponentProps<"table">>;
type TableHeaderProps = StyledProps<useRender.ComponentProps<"thead">>;
type TableBodyProps = StyledProps<useRender.ComponentProps<"tbody">>;
type TableRowProps = StyledProps<useRender.ComponentProps<"tr">>;
type TableHeadProps = StyledProps<useRender.ComponentProps<"th">>;
type TableCellProps = StyledProps<useRender.ComponentProps<"td">>;
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
  const theme = useThemeFamily();
  const { root } = table({ theme });
  return useRender({
    defaultTagName: "table",
    render,
    props: mergeProps<"table">({ className: root({ className }) }, props),
    state: { slot: "table" },
  });
}

export function TableHeader({ className, render, ...props }: TableHeaderProps) {
  const theme = useThemeFamily();
  const { header } = table({ theme });
  return useRender({
    defaultTagName: "thead",
    render,
    props: mergeProps<"thead">({ className: header({ className }) }, props),
    state: { slot: "table-header" },
  });
}

export function TableBody({ className, render, ...props }: TableBodyProps) {
  const theme = useThemeFamily();
  const { body } = table({ theme });
  return useRender({
    defaultTagName: "tbody",
    render,
    props: mergeProps<"tbody">({ className: body({ className }) }, props),
    state: { slot: "table-body" },
  });
}

export function TableRow({ className, render, ...props }: TableRowProps) {
  const theme = useThemeFamily();
  const { row } = table({ theme });
  return useRender({
    defaultTagName: "tr",
    render,
    props: mergeProps<"tr">({ className: row({ className }) }, props),
    state: { slot: "table-row" },
  });
}

export function TableHead({ className, render, scope = "col", ...props }: TableHeadProps) {
  const theme = useThemeFamily();
  const { head } = table({ theme });
  return useRender({
    defaultTagName: "th",
    render,
    props: mergeProps<"th">({ scope, className: head({ className }) }, props),
    state: { slot: "table-head" },
  });
}

export function TableCell({ className, render, ...props }: TableCellProps) {
  const theme = useThemeFamily();
  const { cell } = table({ theme });
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
  const theme = useThemeFamily();
  const { caption } = table({ theme });
  return useRender({
    defaultTagName: "caption",
    render,
    props: mergeProps<"caption">({ className: caption({ className }) }, props),
    state: { slot: "table-caption" },
  });
}

/** Column-width declarations: pair with `<Table className="table-fixed">`. */
export function TableColgroup({ className, render, ...props }: TableColgroupProps) {
  const theme = useThemeFamily();
  const { colgroup } = table({ theme });
  return useRender({
    defaultTagName: "colgroup",
    render,
    props: mergeProps<"colgroup">({ className: colgroup({ className }) }, props),
    state: { slot: "table-colgroup" },
  });
}

export function TableColumn({ className, render, ...props }: TableColumnProps) {
  const theme = useThemeFamily();
  const { column } = table({ theme });
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
};
