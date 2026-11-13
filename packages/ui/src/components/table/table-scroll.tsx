import { ScrollArea } from "../scroll-area/scroll-area";
import type { ScrollAreaProps } from "../scroll-area/types";

/** ScrollArea's props but `orientation`: the table scrolls sideways only. */
export type TableScrollProps = Omit<ScrollAreaProps, "orientation">;

/**
 * The area a table wider than its container scrolls sideways in (table.md,
 * "Wide tables"): a horizontal ScrollArea around a `Table` or a plain
 * `<table>`, so the table scrolls and the page doesn't. It only overflows
 * sideways, so it never holds back the page's vertical scroll, and it is a
 * tab stop while the table is wider than it, so the keyboard can scroll it.
 * It has no frame of its own: `className` sizes and frames it, and `ref`,
 * `onScroll` and the native props go to the element that scrolls.
 *
 * In a file of its own, so Markdown's `MarkdownTableScroll`, which is this
 * part under another slot name, doesn't load Table's parts with it.
 */
export function TableScroll(props: TableScrollProps) {
  return <ScrollArea data-slot="table-scroll" {...props} orientation="horizontal" />;
}
