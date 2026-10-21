import type {
  ComponentType,
  CSSProperties,
  ElementType,
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

export interface RenderColInfo {
  column: Column | undefined;
  left: number;
  item: unknown;
  key: number;
}

export interface RenderItemWithColsInfo {
  itemIndex: number | undefined;
  startColIndex: number;
  endColIndex: number;
  allColumns: readonly Column[];
  item: unknown;
  getLeft: (index: number) => number;
}

/** What an item renderer receives (`ItemComponent` props, the `children` function's argument). */
export interface ItemRenderProps<T> {
  /** The ref to put on the item's root element (null when `itemResizable` is off). */
  domRef: MeasuredRef | null;
  item: T;
  index: number | undefined;
  renderedCols: ReactElement | undefined;
  renderedItemWithCols: ReactElement | undefined;
  /** Set only for an item kept mounted outside the range (absolutely positioned). */
  style: CSSProperties | undefined;
}

export type ScrollPosition = "top" | "bottom";

/** Where `scrollTo` with `index` / `key` and `align` puts the item in the view. */
export type ScrollAlign = "start" | "center" | "end";

export interface VirtualListScrollToOptions {
  left?: number | undefined;
  top?: number | undefined;
  index?: number | undefined;
  key?: string | undefined;
  position?: ScrollPosition | undefined;
  behavior?: ScrollBehavior | undefined;
  /** With `index` / `key`: scroll only as far as needed to show the item (default true). Ignored with `align`. */
  debounce?: boolean | undefined;
  scrollMarginTop?: number | undefined;
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
  listElRef: RefObject<HTMLDivElement | null>;
  itemsElRef: RefObject<HTMLDivElement | null>;
  scrollTo: (options: VirtualListScrollToOptions | number, topIfNumber?: number) => void;
  syncViewport: () => void;
  getOffsetTopOfKey: (key: string) => number | undefined;
  submitScrollAdjustingTask: (task: () => void) => void;
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

/** The props VirtualList reads; optional where it has a default or checks for undefined / null. */
export interface VirtualListProps<T> {
  virtual?: boolean | undefined;
  sessionId?: string | undefined;
  /** @default false */
  showScrollbar?: boolean | undefined;
  columns?: readonly Column[] | undefined;
  renderCol?: ((info: RenderColInfo) => ReactNode) | undefined;
  renderItemWithCols?: ((info: RenderItemWithColsInfo) => ReactNode) | undefined;
  items?: readonly T[] | undefined;
  itemMinSize: number;
  itemEstimatedSize: number;
  itemResizable?: boolean | undefined;
  itemsStyle?: CSSProperties | undefined;
  visibleItemsTag?: ElementType | undefined;
  visibleItemsProps?: object | undefined;
  ignoreItemResize?: boolean | undefined;
  onScroll?: ((event: Event) => void) | undefined;
  onWheel?: ((event: WheelEvent) => void) | undefined;
  onResize?: ((entry: ObservedResizeEntry) => void) | undefined;
  defaultScrollKey?: string | undefined;
  defaultScrollIndex?: number | undefined;
  getKey: (item: T) => string;
  paddingTop?: number | undefined;
  paddingBottom?: number | undefined;
  children?: ((props: ItemRenderProps<T> & { key: string | undefined }) => ReactNode) | undefined;
  ItemComponent?: ComponentType<ItemRenderProps<T>> | undefined;
  empty?: ReactNode | FooterRender;
  emptyAlign?: "start" | "center" | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  itemsClassName?: string | undefined;
  footer?: ReactNode | FooterRender;
  footerAfterBottomPadding?: ReactNode;
  header?: ReactNode;
  domRef?: Ref<HTMLDivElement> | undefined;
  onContentResize?: (() => void) | undefined;
  onTransformChange?: (() => void) | undefined;
  componentRef?: Ref<VirtualListApi> | undefined;
  applySessionIdToItemKey?: boolean | undefined;
  printable?: boolean | undefined;
  catchWheel?: boolean | undefined;
  onRenderAnomaly?: ((anomaly: RenderAnomaly) => void) | undefined;
  keyboardPageBottomOcclusion?: number | undefined;
  avoidSyncViewportOnListRefUpdated?: boolean | undefined;
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
