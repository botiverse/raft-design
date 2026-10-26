import type {
  ComponentType,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  RefObject,
} from "react";

import type { ObservedResizeEntry } from "./resize-observer/resize-observer-delegate";
import type { MeasuredRef } from "./resize-observer/ResizeObserverWrapper";

export type { MeasuredRef, ObservedResizeEntry };

/** A column: only `width` is read (summed into the column Fenwick tree). */
export interface Column {
  width: number;
}

/** What `renderCol` receives for one column of a row. */
export interface RenderColInfo {
  /** The column (undefined past the last one). */
  column: Column | undefined;
  /** The column's left edge, in px: the sum of the widths before it. */
  left: number;
  /** The row's item. */
  item: unknown;
  /** The column's index, to use as the React key of what is rendered. */
  key: number;
}

/** What `renderItemWithCols` receives for a row. */
export interface RenderItemWithColsInfo {
  /** The row's index in `items`. */
  itemIndex: number | undefined;
  /** The first column in view. */
  startColIndex: number;
  /** The last column in view (inclusive). */
  endColIndex: number;
  /** Every column, `columns` as given. */
  allColumns: readonly Column[];
  /** The row's item. */
  item: unknown;
  /** The left edge of column `index`, in px. */
  getLeft: (index: number) => number;
}

/** What an item renderer receives (`ItemComponent` props, the `children` function's argument). */
export interface ItemRenderProps<T> {
  /** The ref to put on the item's root element (null when `itemResizable` is off). */
  domRef: MeasuredRef | null;
  /** The item this row renders. */
  item: T;
  /** The item's index in `items`. */
  index: number | undefined;
  /** With `columns` and `renderCol`: the row's columns in view, to render inside the row. */
  renderedCols: ReactElement | undefined;
  /** With `columns` and `renderItemWithCols`: what it rendered for the row, to render inside the row. */
  renderedItemWithCols: ReactElement | undefined;
  /** Set only for an item kept mounted outside the range (absolutely positioned). */
  style: CSSProperties | undefined;
}

export type ScrollPosition = "top" | "bottom";

/** Where `scrollTo` with `index` / `key` and `align` puts the item in the view. */
export type ScrollAlign = "start" | "center" | "end";

/**
 * What `scrollTo` scrolls to: a position (`left` / `top`), a row (`index` or `key`, with `align`) or
 * either end (`position`), checked in that order.
 */
export interface VirtualListScrollToOptions {
  /** Scroll to this horizontal offset, in px. */
  left?: number | undefined;
  /** Scroll to this vertical offset, in px. */
  top?: number | undefined;
  /** Scroll to the row at this index. */
  index?: number | undefined;
  /** Scroll to the row with this key (`getKey`). */
  key?: string | undefined;
  /** Scroll to the top or the bottom of the list. */
  position?: ScrollPosition | undefined;
  /** `"instant"` (the default), `"smooth"` or `"auto"`, as for `Element.scrollTo`. */
  behavior?: ScrollBehavior | undefined;
  /** With `index` / `key`: scroll only as far as needed to show the item (default true). Ignored with `align`. */
  debounce?: boolean | undefined;
  /** With `index` / `key`: space, in px, to keep between the row and the view's top. */
  scrollMarginTop?: number | undefined;
  /** With `index` / `key`: space, in px, to keep between the row and the view's bottom. */
  scrollMarginBottom?: number | undefined;
  /**
   * With `index` / `key`: put the item's top at the view's top (`"start"`), its middle
   * in the middle of the view (`"center"`) or its bottom at the view's bottom (`"end"`), inside
   * `scrollMarginTop` / `scrollMarginBottom`. With `behavior: "instant"` (the default) the position is exact
   * before the browser paints: the item and the rows around it are mounted and measured first, so no
   * estimated position is ever shown. Without `align`, the jump goes to the item's estimated offset (or,
   * with `debounce`, only as far as needed to show it).
   */
  align?: ScrollAlign | undefined;
}

/** The imperative API (`componentRef`, `VirtualListContext`). */
export interface VirtualListApi {
  /** The scroller's element (`data-slot="virtual-list"`). */
  listElRef: RefObject<HTMLDivElement | null>;
  /** The spacer's element (`data-slot="virtual-list-items"`); null while there are no items. */
  itemsElRef: RefObject<HTMLDivElement | null>;
  /**
   * Scrolls the list (see `VirtualListScrollToOptions`); `scrollTo(left, top)` scrolls to a position.
   * An instant jump to a row or an end is replayed as rows are measured right after it, so it lands.
   */
  scrollTo: (options: VirtualListScrollToOptions | number, topIfNumber?: number) => void;
  /** Reads the scroll position now and renders the rows in view, after scrolling the element directly. */
  syncViewport: () => void;
  /** Where the row with this key starts, in px from the top of the spacer (an estimate if not measured). */
  getOffsetTopOfKey: (key: string) => number | undefined;
  /**
   * Runs `task` now and again after each batch of row measurements, for one frame plus one task: for a
   * scroll position of your own that must hold while the rows it depends on are measured.
   */
  submitScrollAdjustingTask: (task: () => void) => void;
  /** Writes the scroller's width to `--virtual-list-width` again. */
  refreshListWidth: () => void;
}

export type RenderReason =
  | "sessionChanged"
  | "itemsChanged"
  | "listScroll"
  | "batchItemResize"
  | "listResize";

export interface RenderAnomaly {
  type: "renderThrashing";
  message: string;
  payload: {
    renderCount: number;
    windowMs: number;
    triggerReason: RenderReason;
    itemCount: number;
  };
}

export type FooterRender = (props: { domRef: MeasuredRef }) => ReactNode;

/**
 * The scroll container's own attributes passed through to it (`id`, `role`, `aria-*`, `data-*`,
 * handlers such as `onKeyDown`); `onScroll`, `onWheel`, `onResize` and `children` are VirtualList's own
 * (below), and `focusable` sets `tabIndex`.
 */
type VirtualListNativeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style" | "onScroll" | "onWheel" | "onResize" | "tabIndex" | "ref"
>;

/**
 * The props VirtualList reads; optional where it has a default or checks for undefined / null. Every
 * other attribute of the scroll container (`id`, `role`, `aria-label`, `data-*`, handlers) is passed
 * through to it.
 */
export interface VirtualListProps<T> extends VirtualListNativeProps {
  /**
   * Render only the rows in or near the view. Off, every row is rendered in flow (with
   * `itemResizable`, the row at the top of the view keeps its place when it is switched off).
   * @default true
   */
  virtual?: boolean | undefined;
  /**
   * Identifies what the list shows (a channel, a thread). A new value resets the list: scroll
   * position, measurements and rows (every row remounts), then `defaultScrollKey` / `defaultScrollIndex`
   * apply again.
   */
  sessionId?: string | undefined;
  /**
   * Show the scroller's native scrollbar (hidden by default).
   * @default false
   */
  showScrollbar?: boolean | undefined;
  /**
   * Columns for a list that also scrolls sideways: only the columns in view are rendered, through
   * `renderCol` or `renderItemWithCols`. Each column's `width` is read.
   */
  columns?: readonly Column[] | undefined;
  /** With `columns`: renders one column of a row; its result is the row's `renderedCols`. */
  renderCol?: ((info: RenderColInfo) => ReactNode) | undefined;
  /**
   * With `columns`: renders the columns in view of a row at once (in place of `renderCol`); its
   * result is the row's `renderedItemWithCols`.
   */
  renderItemWithCols?: ((info: RenderItemWithColsInfo) => ReactNode) | undefined;
  /**
   * The items, one row each, in order. Treat them as immutable: a mounted row is rendered again only
   * when its item (by reference) or its index changes, or a render prop does (`children`,
   * `ItemComponent`, `getKey`, `renderCol`, `renderItemWithCols`, `itemResizable`, `ignoreItemResize`,
   * `sessionId`, `virtual`), so replace an item's object to change its row.
   */
  items?: readonly T[] | undefined;
  /**
   * The shortest a row can be, in px, or less: to fill the view, rows not measured yet count at this
   * size (after a jump, as many rows as fit at it, plus one), so a larger value leaves the end of the
   * view empty. While the list scrolls, rows ahead of the view are mounted on top of these.
   */
  itemMinSize: number;
  /** The size, in px, counted for a row not measured yet (its offset and the spacer's height). */
  itemEstimatedSize: number;
  /**
   * Rows have heights of their own: each row is measured from layout when it mounts and whenever it
   * resizes (put the row's `domRef` on its root element). Off, every row is `itemEstimatedSize` high.
   * @default false
   */
  itemResizable?: boolean | undefined;
  /** Styles of the spacer (`data-slot="virtual-list-items"`), merged over its own. */
  itemsStyle?: CSSProperties | undefined;
  /**
   * The element that holds the rows (`data-slot="virtual-list-visible-items"`), such as `"ul"` for
   * rows that are `li`.
   * @default "div"
   */
  visibleItemsTag?: ElementType | undefined;
  /** Props of the element that holds the rows (`visibleItemsTag`), such as `role` or `aria-label`. */
  visibleItemsProps?: object | undefined;
  /**
   * Stop applying row measurements: sizes measured while it is on are dropped, and the rows keep the
   * sizes they had (for a moment when rows resize but the layout should not follow, such as an
   * animation).
   * @default false
   */
  ignoreItemResize?: boolean | undefined;
  /** Called when the list scrolls, with the native event, after the rows in view are updated. */
  onScroll?: ((event: Event) => void) | undefined;
  /** With `catchWheel`: called with the native wheel event, except one let through at either end. */
  onWheel?: ((event: WheelEvent) => void) | undefined;
  /** Called when the scroller itself resizes, with its ResizeObserver entry. */
  onResize?: ((entry: ObservedResizeEntry) => void) | undefined;
  /**
   * The key of the row to scroll to when the list mounts or `sessionId` changes (as far as needed to
   * show it). `defaultScrollIndex` wins when both are set.
   */
  defaultScrollKey?: string | undefined;
  /** The index of the row to scroll to when the list mounts or `sessionId` changes. */
  defaultScrollIndex?: number | undefined;
  /**
   * A key for each item, stable across renders: measurements are kept by key, so they survive
   * reordering and new items, and a new key is a new row, measured again from the estimate.
   */
  getKey: (item: T) => string;
  /**
   * Space above the first row, in px, inside the spacer.
   * @default 0
   */
  paddingTop?: number | undefined;
  /**
   * Space below the footer, in px (before `footerAfterBottomPadding`).
   * @default 0
   */
  paddingBottom?: number | undefined;
  /**
   * Renders a row: called for each item in or near the view with the item, its index, the `domRef` to
   * put on the row's root element and the `style` to spread on it. Give the element the `key` it gets.
   * A mounted row is rendered again only when its item, its index or a render prop changes (see
   * `items`): read no other mutable state here.
   */
  children?: ((props: ItemRenderProps<T> & { key: string | undefined }) => ReactNode) | undefined;
  /** A component that renders a row, in place of `children`; it gets the same props. */
  ItemComponent?: ComponentType<ItemRenderProps<T>> | undefined;
  /**
   * Rendered in place of the rows when there are no items. A function gets a `domRef`: when its
   * element resizes, `onContentResize` is called.
   */
  empty?: ReactNode | FooterRender;
  /**
   * Where `empty` sits: at the top (`"start"`) or in the middle of the list (`"center"`).
   * @default "start"
   */
  emptyAlign?: "start" | "center" | undefined;
  /** Classes of the scroller, after its own (a utility here overrides them: `h-*`, `max-h-*`). */
  className?: string | undefined;
  /** Styles of the scroller. */
  style?: CSSProperties | undefined;
  /** Classes of the spacer (`data-slot="virtual-list-items"`). */
  itemsClassName?: string | undefined;
  /**
   * Rendered below the rows, inside the scroller. A function gets a `domRef`: when its element
   * resizes, `onContentResize` is called.
   */
  footer?: ReactNode | FooterRender;
  /** Rendered last in the scroller, after `paddingBottom`. */
  footerAfterBottomPadding?: ReactNode;
  /**
   * Rendered above the rows, inside the scroller. Keep its height the same while rows load above:
   * a change in its height moves the rows in view.
   */
  header?: ReactNode;
  /** A ref to the scroller's element. */
  domRef?: Ref<HTMLDivElement> | undefined;
  /**
   * Not a prop: the scroller's element goes to `domRef`. Declared so that a `ref` is a type error,
   * not passed through to the scroller with the native attributes.
   */
  ref?: never;
  /**
   * Called when the content's height changes: a row resizes or mounts measured, the spacer's
   * height changes, or the `footer` / `empty` element resizes (to follow the end of a chat). Not
   * called for a change the list scrolls away exactly (rows above the view measured as it scrolls
   * up): it moves nothing in view, nor the distance from the view to the end.
   */
  onContentResize?: (() => void) | undefined;
  /**
   * Called when the rows' offset (the translateY of the rows' element) changes, for content that
   * must follow it.
   */
  onTransformChange?: (() => void) | undefined;
  /** The imperative API: `scrollTo`, `getOffsetTopOfKey`, the scroller's and spacer's elements. */
  componentRef?: Ref<VirtualListApi> | undefined;
  /**
   * When printing, let the list grow to its content (no height limit, no scrolling).
   * @default false
   */
  printable?: boolean | undefined;
  /**
   * Scroll by the wheel in the list's own handler (where the pointer is not coarse), so rows are
   * rendered in the same frame as the scroll; it lets the wheel through at either end.
   * @default false
   */
  catchWheel?: boolean | undefined;
  /**
   * Called when the list renders too often: 120 forced renders within a second report a
   * `"renderThrashing"` anomaly, for logging.
   */
  onRenderAnomaly?: ((anomaly: RenderAnomaly) => void) | undefined;
  /**
   * What covers the bottom of the list, in px (such as a composer over it): Page Up, Page Down and
   * Space scroll by the view's height less this and 32px.
   * @default 0
   */
  keyboardPageBottomOcclusion?: number | undefined;
  /**
   * Put the scroller in the tab order (`tabIndex` 0), so the keyboard can scroll it; off, it is
   * `tabIndex` -1.
   * @default true
   */
  focusable?: boolean | undefined;
  /**
   * When `items` change, keep the row at the top of the view where it is: the
   * same row stays at the same distance from the view's top, so rows inserted or removed above it (most
   * often a prepend, such as loading older history) do not move what is on screen. Also at the very top
   * (`scrollTop` 0): the row that was first stays first in view and the new rows are above it, out of
   * view. If that row was removed, the first row after it that is still there keeps its place; if none
   * is left, `scrollTop` is kept. An instant jump still pending (`scrollTo` an index, a key, the top or the
   * bottom, in the same frame) wins. Only with `virtual` on; a new `sessionId` resets the list as before.
   *
   * Off by default (`scrollTop` is kept, so the rows move). This is separate from the
   * compensation that is always on: rows that enter above the view while scrolling up have their first
   * measured size scrolled away, which covers scrolling, not changes of `items`.
   */
  keepAnchorOnItemsChange?: boolean | undefined;
  /**
   * With `keepAnchorOnItemsChange`: which rows may be the row kept in place. A row
   * this rejects is passed over like a removed one (the first accepted row after it keeps its place). For
   * rows that new items are inserted below, such as a leading header row above a prepend: keeping such a
   * row in place would push the rows below it, the ones being read. All rows may by default.
   */
  canAnchorItem?: ((item: T) => boolean) | undefined;
}
