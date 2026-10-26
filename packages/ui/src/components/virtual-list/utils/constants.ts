/*
 * VirtualList's constants: the item key attribute, the visible-items styles and the render-thrashing limits.
 */
import type { CSSProperties } from "react";

/**
 * Written on the root element of every measured item: maps the DOM to item keys (kept selections,
 * and what other code uses to find an item).
 */
export const ITEM_KEY_ATTR = "data-virtual-list-item-key";

/** The default of the `columns` and `items` props, and the empty kept-item lists. */
export const EMPTY_ARRAY: readonly never[] = [];

/**
 * The visible-items element lays the rows out in normal block flow, so their margins collapse as the
 * consumer's CSS says (between adjacent rows, and a row's children's through the row). It is a block
 * formatting context (`flow-root`), so the first row's top margin and the last row's bottom margin stay
 * inside it instead of collapsing through it (into the spacer, or with the footer), and it is the rows'
 * offsetParent (`position: relative`): the list measures where each row starts from layout
 * (`measureRowSpans`).
 */
export const VIRTUAL_VISIBLE_ITEMS_STYLE: CSSProperties = {
  position: "relative",
  display: "flow-root",
};

/** With virtualization off, the visible-items element sits at translateY(0px). */
export const NON_VIRTUAL_VISIBLE_ITEMS_STYLE: CSSProperties = {
  transform: "translateY(0px)",
  position: "relative",
  display: "flow-root",
};

/** A "renderThrashing" anomaly is reported at this many forced renders ... */
export const RENDER_THRASHING_COUNT = 120;
/** ... within this window (ms). */
export const RENDER_THRASHING_WINDOW_MS = 1000;
