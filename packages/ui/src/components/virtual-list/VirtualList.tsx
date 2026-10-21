/*
 * VirtualList: a virtual list with variable, measured row heights (see virtual-list.md).
 *
 * DOM:
 *   div[data-slot=virtual-list]              the scroll container (overflow-anchor: none)
 *     header
 *     div[data-slot=virtual-list-items]      height = sum of all item sizes (min-height with
 *                                            itemResizable), padding-top = paddingTop
 *       <visibleItemsTag>[data-slot=virtual-list-visible-items]
 *                                            display: flow-root, position: relative;
 *                                            translateY(where the first item's box goes)
 *         kept items before (absolute), the items in the range (in flow), kept items after (absolute)
 *     footer, a paddingBottom div, footerAfterBottomPadding
 *
 * Rendering is driven from the scroll and resize handlers: they compute the range and commit it with
 * `flushSync`, so the new items are rendered in the same frame as the scroll.
 *
 * The implementation borrows from DeepSeek web's virtual list. Comments that start "Unlike the reference
 * implementation (DeepSeek web)" mark where its behavior differs from that reference.
 */
import {
  createElement,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent, ReactElement, ReactNode, UIEvent } from "react";
import { flushSync } from "react-dom";

import {
  EMPTY_ARRAY,
  ITEM_KEY_ATTR,
  NON_VIRTUAL_VISIBLE_ITEMS_STYLE,
  RENDER_THRASHING_COUNT,
  RENDER_THRASHING_WINDOW_MS,
  VIRTUAL_VISIBLE_ITEMS_STYLE,
} from "./utils/constants";
import { FenwickTree } from "./utils/fenwick-tree";
import { findItemsAnchor, getAnchoredRange } from "./utils/items-anchor";
import type { ItemsAnchor } from "./utils/items-anchor";
import { useEventCallback } from "./hooks/use-event-callback";
import { useLatestRef } from "./hooks/use-latest-ref";
import { useLayoutEffectWithPrevious } from "./hooks/use-layout-effect-with-previous";
import { useMemoWithPrevious } from "./hooks/use-memo-with-previous";
import { useMergedRef } from "./hooks/use-merged-ref";
import { useNonPassiveWheel } from "./hooks/use-non-passive-wheel";
import { ColumnsContext, ItemColumns } from "./ItemColumns";
import type { ColumnsContextValue } from "./ItemColumns";
import { isIOS } from "./utils/platform";
import { getAlignedScrollTop } from "./utils/align";
import { measureRowSpans, measureRowStart } from "./utils/measure";
import type {
  Column,
  ScrollAlign,
  VirtualListScrollToOptions,
  VirtualListApi,
  VirtualListProps,
  ItemRenderProps,
  MeasuredRef,
  ObservedResizeEntry,
  RenderAnomaly,
  RenderReason,
} from "./public-types";
import { px } from "./utils/range";
import {
  getHorizontalRange,
  getVerticalRange,
  haveSameKeys,
  isHiddenByDisplayNone,
} from "./utils/range";
import { ResizeObserverWrapper } from "./resize-observer/ResizeObserverWrapper";
import { getResizeObserverDelegate } from "./resize-observer/resize-observer-delegate";
import { useIosMomentumCompensation } from "./hooks/use-ios-momentum-compensation";
import { useKeyboardScroll } from "./hooks/use-keyboard-scroll";
import { useNonVirtualContentResize } from "./hooks/use-non-virtual-content-resize";
import { useScrollAnchor } from "./hooks/use-scroll-anchor";
import { VirtualListContext } from "./VirtualListContext";
import { createLatestInNextFrame, getWheelDeltaScale, isCoarsePointer } from "./utils/platform";

import { cn } from "../../lib/cn";

import "./styles/virtual-list.css";

/*
 * A jump holds its row by key, not index: rows inserted above it while it settles (an older page loaded)
 * move its index, and a replay at the old index would land on another row. `index` is used only when the
 * jump was to an index past the items (no key).
 */
type PendingScrollTask =
  | { type: "top" | "bottom" }
  | { type: "index"; key: string | undefined; index: number; debounce: boolean }
  | {
      type: "align";
      key: string;
      align: ScrollAlign;
      scrollMarginTop: number;
      scrollMarginBottom: number;
    }
  | { type: "custom"; task: () => void };

/**
 * The most range updates one aligned jump goes through before it stops (each one mounts and measures the
 * rows the previous position brought into view; it is usually stable after 2-3).
 */
const MAX_ALIGN_STEPS = 10;

interface ItemResizeEntry {
  key: string;
  target: HTMLElement;
  isFirst: boolean;
}

interface AppliedResize {
  index: number;
  key: string;
  delta: number;
}

/** A mounted row in flow (in the rendered range, not a kept row). */
interface FlowRow {
  el: HTMLElement;
  key: string;
  index: number;
}

type RenderState = [reason: RenderReason | null, callback: (() => void) | null, version: number];

/** React's onScroll of the list element (scroll events do not bubble), read as `event.target.scrollTop`. */
type ListScrollEvent = UIEvent<HTMLDivElement> & { target: HTMLDivElement };

export function VirtualList<T>(props: VirtualListProps<T>) {
  const {
    virtual = true,
    sessionId,
    showScrollbar = false,
    columns = EMPTY_ARRAY,
    renderCol,
    renderItemWithCols,
    items = EMPTY_ARRAY,
    itemMinSize,
    itemEstimatedSize,
    itemResizable = false,
    itemsStyle,
    visibleItemsTag = "div",
    visibleItemsProps,
    ignoreItemResize = false,
    onScroll,
    onWheel,
    onResize,
    defaultScrollKey,
    defaultScrollIndex,
    getKey,
    paddingTop = 0,
    paddingBottom = 0,
    children: renderItemChild,
    ItemComponent,
    empty,
    emptyAlign = "start",
    className,
    style,
    itemsClassName,
    footer,
    footerAfterBottomPadding,
    header,
    domRef,
    // Kept out of `nativeProps` (see `VirtualListProps.ref`): the scroller's ref is `domRef`.
    ref: _ref,
    onContentResize,
    onTransformChange,
    componentRef,
    printable,
    catchWheel = false,
    onRenderAnomaly,
    keyboardPageBottomOcclusion = 0,
    focusable = true,
    keepAnchorOnItemsChange = false,
    canAnchorItem,
    onKeyDown: onNativeKeyDown,
    ...nativeProps
  } = props;
  const listElRef = useRef<HTMLDivElement | null>(null);
  const [mergedListRefSetter] = useMergedRef(domRef, listElRef);
  const itemsElRef = useRef<HTMLDivElement | null>(null);
  const getVisibleItemsEl = useCallback(() => itemsElRef.current?.children[0] || null, []);
  const [[renderReason, renderCallback, renderVersion], setRenderState] = useState<RenderState>([
    null,
    null,
    0,
  ]);
  const viewportRef = useRef<{
    listHeight: number | undefined;
    scrollTop: number;
    scrollLeft: number;
    listWidth: number;
  }>({
    listHeight: undefined,
    scrollTop: 0,
    scrollLeft: 0,
    listWidth: 0,
  });
  const rangeRef = useRef<{
    prependIndexes: number[];
    verticalStartIndex: number;
    verticalEndIndex: number;
    horizontalStartIndex: number;
    horizontalEndIndex: number;
  }>({
    prependIndexes: [],
    verticalStartIndex: 0,
    verticalEndIndex: -1,
    horizontalStartIndex: 0,
    horizontalEndIndex: -1,
  });
  /**
   * The rows kept mounted outside the range (absolutely positioned at their offsets): the rows holding
   * the text selection and the row holding focus (`focusedKeyRef`).
   */
  const keptKeysRef = useRef<string[]>([]);
  /** The key of the row that holds focus (`document.activeElement` is in it), tracked by focusin / focusout. */
  const focusedKeyRef = useRef<string | null>(null);
  const keyToHeightOffsetRef = useRef(new Map<string, number>());
  /*
   * Unlike the reference implementation (DeepSeek web): rows are laid out in block flow and measured
   * from layout (`measureFlowRun`). A row's size is the space from where it starts (the top of its border box) to where the next row
   * starts, so the collapsed margin between two rows belongs to the upper one and every row's offset in
   * the tree is where its border box starts, for every row the same way. That leaves one piece of space
   * no row holds: the first row's top margin (with its children's margins that collapse through it),
   * which sits above every row. It is kept here, measured whenever the first row is mounted, and laid
   * out like part of `paddingTop` (`getRowsTop`): the spacer is that much taller and every offset is
   * that much lower.
   *
   * Why not the first row's own size, as a plain sum of spans would have it: the first row stops being
   * the first when rows are inserted above it, and its size would then change by its top margin with
   * nothing on screen changing, so the rows below it would move by the margin when the window's edge
   * passes it. Kept apart, a row's size depends only on the row and the one after it.
   */
  const leadingMarginRef = useRef(0);
  /**
   * Where the first mounted row in flow starts in the visible-items element (its top margin there,
   * since nothing above it is mounted), as last written by `applyLayoutStyles`.
   */
  const firstRowStartRef = useRef(0);
  const pendingScrollTaskRef = useRef<PendingScrollTask | null>(null);
  const pendingScrollTaskTimeoutRef = useRef<number | null>(null);
  const pendingScrollTaskRafRef = useRef<number | null>(null);
  const wheelScrollingRef = useRef(false);
  /** Clears `wheelScrollingRef` in the next frame; this list's own, so other lists cannot replace it. */
  const [runLatestInNextFrame] = useState(createLatestInNextFrame);
  /** The wheel is only taken over (catchWheel) where the pointer is not coarse. */
  const mayUseWheelRef = useRef(typeof document === "undefined" || !isCoarsePointer());
  const reportRenderAnomaly = useEventCallback((anomaly: RenderAnomaly) => {
    onRenderAnomaly?.(anomaly);
  });
  const forcedRenderTimesRef = useRef<number[]>([]);
  /**
   * The offset applied by the iOS compensation, created here (not in its hook) because
   * `keepAnchorOnItemsChange` reads it while rendering, before the hook is called.
   */
  const compensationYRef = useRef(0);
  /** The items, Fenwick tree and session of the last commit (the tree is updated in place by measurements). */
  const committedLayoutRef = useRef<{
    items: readonly T[];
    tree: FenwickTree;
    sessionId: VirtualListProps<T>["sessionId"];
  } | null>(null);
  /*
   * keepAnchorOnItemsChange, step 1 (render): when `items` change, find in the last committed layout
   * (its items, its tree, the scroll position) the row at the top of the view and how far the view's
   * top is into it. Reads refs and the DOM only; nothing is written until the commit (step 2).
   */
  const itemsAnchor = useMemo(() => {
    const committed = committedLayoutRef.current;
    const listEl = listElRef.current;
    if (
      !keepAnchorOnItemsChange ||
      !virtual ||
      committed === null ||
      listEl === null ||
      committed.items === items ||
      committed.sessionId !== sessionId
    ) {
      return null;
    }
    return findItemsAnchor({
      prevItems: committed.items,
      prevTree: committed.tree,
      prevPrependIndexes: rangeRef.current.prependIndexes,
      nextItems: items,
      getKey,
      canAnchor: canAnchorItem,
      top: listEl.scrollTop + compensationYRef.current - paddingTop - leadingMarginRef.current,
    });
    // oxlint-disable-next-line react/exhaustive-deps -- reads the committed layout once per items change
  }, [items]);
  /** The anchor whose range has been committed to `rangeRef` (so it is applied once). */
  const appliedItemsAnchorRef = useRef<ItemsAnchor | null>(null);
  const pendingItemsAnchor =
    itemsAnchor !== null && itemsAnchor !== appliedItemsAnchorRef.current ? itemsAnchor : null;
  /*
   * The range rendered with the new items starts at the anchor row's new index, so this render mounts the
   * rows that were in view at their new indexes (none is mounted, and measured, at a stale index), with
   * `prependIndexes` moved along. Committed to `rangeRef` in step 2.
   */
  let renderedRange = rangeRef.current;
  if (pendingItemsAnchor !== null) {
    const [verticalStartIndex, verticalEndIndex] = getAnchoredRange(
      renderedRange.verticalStartIndex,
      renderedRange.verticalEndIndex,
      pendingItemsAnchor.index,
      items.length,
    );
    renderedRange = {
      ...renderedRange,
      prependIndexes: pendingItemsAnchor.prependIndexes,
      verticalStartIndex,
      verticalEndIndex,
    };
  }
  const {
    prependIndexes,
    verticalStartIndex: startIndex,
    verticalEndIndex: endIndex,
    horizontalStartIndex: colStartIndex,
    horizontalEndIndex: colEndIndex,
  } = renderedRange;
  // Assigned by the items memo below during the first render, before anything reads it.
  const keyToIndexRef = useRef<Map<string, number>>(undefined as unknown as Map<string, number>);
  const prevSessionIdRef = useRef(sessionId);
  const sessionChangedRef = useRef(false);
  const lastTransformSignatureRef = useRef<string | null>(null);
  const clearPendingScrollTask = useCallback(() => {
    if (pendingScrollTaskTimeoutRef.current !== null) {
      window.clearTimeout(pendingScrollTaskTimeoutRef.current);
      pendingScrollTaskTimeoutRef.current = null;
    }
    if (pendingScrollTaskRafRef.current != null) {
      window.cancelAnimationFrame(pendingScrollTaskRafRef.current);
      pendingScrollTaskRafRef.current = null;
    }
    pendingScrollTaskRef.current = null;
  }, []);
  // A new session resets the list while rendering.
  useMemo(() => {
    if (prevSessionIdRef.current === sessionId) {
      return;
    }
    prevSessionIdRef.current = sessionId;
    sessionChangedRef.current = true;
    clearPendingScrollTask();
    wheelScrollingRef.current = false;
    keptKeysRef.current = [];
    focusedKeyRef.current = null;
    keyToHeightOffsetRef.current.clear();
    leadingMarginRef.current = 0;
    keyToIndexRef.current = new Map();
    rangeRef.current = {
      prependIndexes: [],
      verticalStartIndex: 0,
      verticalEndIndex: -1,
      horizontalStartIndex: 0,
      horizontalEndIndex: -1,
    };
    const viewport = viewportRef.current;
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
    const listEl = listElRef.current;
    if (listEl != null) {
      listEl.scrollTop = 0;
      listEl.scrollLeft = 0;
    }
  }, [sessionId, clearPendingScrollTask]);
  useMemo(() => {
    lastTransformSignatureRef.current = null;
    // oxlint-disable-next-line react/exhaustive-deps -- reset whenever the session changes
  }, [sessionId]);
  useMemo(() => {
    const keyToIndex = new Map<string, number>();
    items.forEach((item: T, index: number) => {
      keyToIndex.set(getKey(item), index);
    });
    keyToIndexRef.current = keyToIndex;
    const keptKeys: string[] = [];
    keptKeysRef.current.forEach((key: string) => {
      if (keyToIndexRef.current.has(key)) {
        keptKeys.push(key);
      }
    });
    keptKeysRef.current = keptKeys;
    // oxlint-disable-next-line react/exhaustive-deps -- sessionId is a deliberate extra dep
  }, [sessionId, items, getKey]);
  const totalColumnsWidth = useMemo(() => {
    if ((renderCol == null && renderItemWithCols == null) || columns.length === 0) {
      return;
    }
    let width = 0;
    columns.forEach((column: Column) => {
      width += column.width;
    });
    return width;
    // oxlint-disable-next-line react/exhaustive-deps -- sessionId is a deliberate extra dep
  }, [sessionId, renderCol, renderItemWithCols, columns]);
  /**
   * Rebuilt whenever the items or the session change: `itemEstimatedSize` for every item plus the
   * measured offsets cached by key, so measurements survive re-renders and reordering.
   */
  const fenwickTree = useMemo(() => {
    if (!virtual) {
      return new FenwickTree(0, 0);
    }
    const tree = new FenwickTree(items.length, itemEstimatedSize);
    const heightOffsets = keyToHeightOffsetRef.current;
    items.forEach((item: T, index: number) => {
      const key = getKey(item);
      const offset = heightOffsets.get(key);
      if (offset !== undefined) {
        tree.add(index, offset);
      }
    });
    return tree;
    // oxlint-disable-next-line react/exhaustive-deps -- sessionId is a deliberate extra dep
  }, [sessionId, items, itemEstimatedSize, getKey, virtual]);
  const visibleItems: readonly T[] = useMemo(() => {
    if (!virtual) {
      return items;
    }
    if (endIndex < startIndex) {
      return [];
    }
    const visible: T[] = [];
    const lastIndex = Math.min(endIndex, items.length - 1);
    for (let i = startIndex; i <= lastIndex; ++i) {
      visible.push(items[i]!);
    }
    return visible;
    // oxlint-disable-next-line react/exhaustive-deps -- sessionId is a deliberate extra dep
  }, [sessionId, startIndex, endIndex, items, virtual]);
  const xFenwickTree = useMemo(() => {
    if (columns.length === 0) {
      return null;
    }
    const tree = new FenwickTree(columns.length, 0);
    columns.forEach((column: Column, index: number) => {
      tree.add(index, column.width);
    });
    return tree;
    // oxlint-disable-next-line react/exhaustive-deps -- sessionId is a deliberate extra dep
  }, [sessionId, columns]);
  const getColumnLeft = useEventCallback((index: number) =>
    xFenwickTree !== null ? xFenwickTree.sum(index) : 0,
  );
  const columnsContextValue: ColumnsContextValue = useMemo(
    () => ({
      startIndex: colStartIndex,
      endIndex: colEndIndex,
      columns,
      renderCol,
      renderItemWithCols,
      getLeft: getColumnLeft,
    }),
    [colStartIndex, colEndIndex, columns, renderCol, renderItemWithCols, getColumnLeft],
  );
  /** Where the rows start in the spacer's content: `paddingTop` plus the first row's top margin. */
  const getRowsTop = useEventCallback(() => paddingTop + leadingMarginRef.current);
  /**
   * The mounted rows in flow, in order: the measured elements of the rendered range. Kept rows (outside
   * the range, absolutely positioned) are left out: they take no space in the flow.
   */
  const getFlowRows = useEventCallback((): FlowRow[] => {
    const rows: FlowRow[] = [];
    const visibleItemsEl = getVisibleItemsEl();
    if (visibleItemsEl === null) {
      return rows;
    }
    for (const el of Array.from(visibleItemsEl.children)) {
      const key = el.getAttribute(ITEM_KEY_ATTR);
      const index = key === null ? undefined : keyToIndexRef.current.get(key);
      if (
        key !== null &&
        index !== undefined &&
        index >= startIndex &&
        index <= endIndex &&
        el instanceof HTMLElement
      ) {
        rows.push({ el, key, index });
      }
    }
    return rows;
  });
  /**
   * Writes the layout without a render: the spacer height (the total size plus the first row's top
   * margin; a min-height with itemResizable, so the real content may exceed it) and the visible items'
   * translateY, with the CSS variables sticky children read (`--virtual-list-transform-y`,
   * `--virtual-list-ios-compensation-y`).
   *
   * Unlike the reference implementation (DeepSeek web): the translateY puts the border box of the first
   * mounted row at its offset (`firstIndex`, or the first row in the DOM), not the element's top. The visible-items element is a
   * block formatting context, so the first mounted row's top margin is inside it, above the row, and
   * does not collapse with the row before it (not mounted): the element starts that margin higher. The
   * collapsed gap above that row is already in the size of the row before it (see `leadingMarginRef`),
   * so the rows sit exactly where the tree has them whichever row is first, and moving the window's top
   * edge moves no row. Read before anything is written, so it forces no extra layout.
   */
  const applyLayoutStyles = useEventCallback((firstIndex: number) => {
    if (!virtual) {
      return;
    }
    let index = Math.min(firstIndex, items.length);
    let firstRowStart = 0;
    const itemsEl = itemsElRef.current;
    const visibleItemsEl = itemsEl?.children[0];
    const firstRow = itemResizable ? getFlowRows()[0] : undefined;
    if (firstRow !== undefined && visibleItemsEl instanceof HTMLElement) {
      index = firstRow.index;
      firstRowStart = measureRowStart(visibleItemsEl, firstRow.el);
    }
    firstRowStartRef.current = firstRowStart;
    const leadingMargin = leadingMarginRef.current;
    if (itemsEl) {
      const height = px(fenwickTree.sum() + leadingMargin) || "";
      if (itemResizable) {
        itemsEl.style.height = "";
        itemsEl.style.minHeight = height;
      } else {
        const changed = itemsEl.style.height !== height || itemsEl.style.minHeight !== "";
        itemsEl.style.height = height;
        itemsEl.style.minHeight = "";
        if (changed) {
          onContentResize?.();
        }
      }
    }
    if (visibleItemsEl instanceof HTMLElement) {
      const offset = px(leadingMargin + fenwickTree.sum(index) - firstRowStart);
      visibleItemsEl.style.transform = `translateY(${offset})`;
      visibleItemsEl.style.setProperty("--virtual-list-transform-y", offset);
      const compensation = px(compensationYRef.current);
      visibleItemsEl.style.setProperty("--virtual-list-ios-compensation-y", compensation);
      const signature = `${index}|${offset}`;
      if (lastTransformSignatureRef.current !== signature) {
        lastTransformSignatureRef.current = signature;
        onTransformChange?.();
      }
    }
  });
  useLayoutEffect(() => {
    if (!virtual) {
      const itemsEl = itemsElRef.current;
      if (itemsEl) {
        itemsEl.style.height = "";
        itemsEl.style.minHeight = "";
      }
    }
  }, [virtual]);
  /**
   * The viewport sync. The range starts at the item at `scrollTop + compensation - paddingTop` and
   * holds as many items as fit at `itemMinSize`, plus one. Items holding the text selection, and the item
   * holding focus, stay
   * mounted ("kept"). When the new range is inside the old one, only the layout styles are written;
   * otherwise the items entering above the old start are recorded (`prependIndexes`) and the range is
   * rendered with flushSync, now or in a microtask (`deferRenderToMicrotask`). At 120 forced renders
   * within a second a "renderThrashing" anomaly is reported. `afterRender` runs after the layout styles
   * of the new range are applied.
   */
  const updateRange = useEventCallback(
    (reason: RenderReason, deferRenderToMicrotask: boolean, afterRender: (() => void) | null) => {
      if (!virtual) {
        return;
      }
      const listEl = listElRef.current;
      if (listEl == null) {
        return;
      }
      const viewport = viewportRef.current;
      if (viewport.listHeight === undefined) {
        applyLayoutStyles(startIndex);
        afterRender?.();
        return;
      }
      const scrollTop = listEl.scrollTop;
      const effectiveScrollTop = scrollTop + compensationYRef.current;
      const scrollLeft = listEl.scrollLeft;
      const range = rangeRef.current;
      const prevRange = {
        startIndex: range.verticalStartIndex,
        endIndex: range.verticalEndIndex,
      };
      const nextRange = getVerticalRange({
        fenwickTree,
        scrollTop: effectiveScrollTop,
        listHeight: viewport.listHeight,
        itemMinSize,
        itemCount: items.length,
        paddingTop: getRowsTop(),
      });
      const rangeChanged =
        prevRange.startIndex !== nextRange.startIndex || prevRange.endIndex !== nextRange.endIndex;
      const nextInsidePrev =
        nextRange.startIndex >= prevRange.startIndex && prevRange.endIndex >= nextRange.endIndex;
      const prevColRange = {
        startIndex: range.horizontalStartIndex,
        endIndex: range.horizontalEndIndex,
      };
      const nextColRange = getHorizontalRange({
        xFenwickTree,
        scrollLeft,
        listWidth: viewport.listWidth,
        columnCount: columns.length,
      });
      const colRangeChanged =
        prevColRange.startIndex !== nextColRange.startIndex ||
        prevColRange.endIndex !== nextColRange.endIndex;
      viewport.scrollTop = scrollTop;
      viewport.scrollLeft = scrollLeft;
      let keptKeysChanged = false;
      if (typeof window !== "undefined" && reason !== "sessionChanged") {
        const { startIndex: nextStart, endIndex: nextEnd } = nextRange;
        const keptKeys: string[] = [];
        const keep = (key: string) => {
          const index = keyToIndexRef.current.get(key);
          if (
            index !== undefined &&
            (!(index >= nextStart) || !(index <= nextEnd)) &&
            !keptKeys.includes(key)
          ) {
            keptKeys.push(key);
          }
        };
        /*
         * The row holding focus stays mounted: unmounting it would drop focus to the body (a key such as
         * End, which the browser handles by scrolling the list, or the wheel moving it out of view). The
         * key is checked against the DOM, in case focus left without a focusout (the element was removed).
         */
        const focusedKey = focusedKeyRef.current;
        if (focusedKey !== null) {
          const active = document.activeElement;
          if (active !== null && listEl.contains(active)) {
            keep(focusedKey);
          } else {
            focusedKeyRef.current = null;
          }
        }
        const selection = window.getSelection();
        if (selection != null && !selection.isCollapsed && selection.rangeCount > 0) {
          listEl.querySelectorAll(`[${ITEM_KEY_ATTR}]`).forEach((itemEl: Element) => {
            // An item is skipped only when it is outside the selection AND holds an input, so every
            // mounted item without an input is kept while a selection exists.
            if (
              !selection.containsNode(itemEl, true) &&
              itemEl.getElementsByTagName("input").length !== 0
            ) {
              return;
            }
            const key = itemEl.getAttribute(ITEM_KEY_ATTR);
            if (key !== null) {
              keep(key);
            }
          });
        }
        if (!haveSameKeys(keptKeys, keptKeysRef.current)) {
          keptKeysRef.current = keptKeys;
          keptKeysChanged = true;
        }
      }
      if (
        reason !== "sessionChanged" &&
        !keptKeysChanged &&
        (!rangeChanged || nextInsidePrev) &&
        !colRangeChanged
      ) {
        if (nextInsidePrev) {
          applyLayoutStyles(prevRange.startIndex);
        } else {
          applyLayoutStyles(nextRange.startIndex);
        }
        afterRender?.();
        return;
      }
      if (reason !== "sessionChanged") {
        const entering: number[] = [];
        if (
          pendingScrollTaskRef.current?.type === undefined &&
          nextRange.endIndex >= prevRange.startIndex
        ) {
          for (let i = nextRange.startIndex; i < prevRange.startIndex; ++i) {
            entering.push(i);
          }
        }
        range.prependIndexes = entering;
      } else {
        range.prependIndexes = [];
      }
      range.verticalStartIndex = nextRange.startIndex;
      range.verticalEndIndex = nextRange.endIndex;
      range.horizontalStartIndex = nextColRange.startIndex;
      range.horizontalEndIndex = nextColRange.endIndex;
      const now = Date.now();
      const renderTimes = forcedRenderTimesRef.current;
      renderTimes.push(now);
      const windowStart = now - RENDER_THRASHING_WINDOW_MS;
      while (renderTimes.length > 0 && renderTimes[0]! < windowStart) {
        renderTimes.shift();
      }
      if (renderTimes.length >= RENDER_THRASHING_COUNT) {
        reportRenderAnomaly({
          type: "renderThrashing",
          message: `${renderTimes.length} forced renders within ${RENDER_THRASHING_WINDOW_MS}ms`,
          payload: {
            renderCount: renderTimes.length,
            windowMs: RENDER_THRASHING_WINDOW_MS,
            triggerReason: reason,
            itemCount: items.length,
          },
        });
        renderTimes.length = 0;
      }
      if (deferRenderToMicrotask) {
        void Promise.resolve().then(() => {
          flushSync(() => {
            setRenderState((state) => [reason, afterRender, state[2] + 1]);
          });
        });
      } else {
        flushSync(() => {
          setRenderState((state) => [reason, afterRender, state[2] + 1]);
        });
      }
    },
  );
  /**
   * A pending scroll task (to the top, the bottom, an index, or a custom task) stays armed for one
   * animation frame plus one task, so that item sizes measured right after the jump replay it instead
   * of being compensated.
   */
  const schedulePendingScrollTaskExpiry = useCallback(() => {
    pendingScrollTaskRafRef.current = requestAnimationFrame(() => {
      pendingScrollTaskRafRef.current = null;
      pendingScrollTaskTimeoutRef.current = window.setTimeout(() => {
        pendingScrollTaskRef.current = null;
        pendingScrollTaskTimeoutRef.current = null;
      });
    });
  }, []);
  const scrollToPosition = useEventCallback(
    (left: number | undefined, top: number | undefined, behavior: ScrollBehavior) => {
      listElRef.current?.scrollTo({ left, top, behavior } as ScrollToOptions);
    },
  );
  /**
   * Scrolls to the offset of `index` in the Fenwick tree (an estimate for items not measured yet);
   * an "instant" jump is armed as the pending task, to be replayed after measurements. `ensureVisibleOnly`
   * (the `debounce` option) scrolls only as far as needed to show the item. With virtualization off the
   * offset is read from the DOM (`getBoundingClientRect` of the index-th child).
   */
  const scrollToIndex = useEventCallback(
    (
      index: number,
      behavior: ScrollBehavior,
      ensureVisibleOnly: boolean,
      isReplay: boolean,
      scrollMarginTop: number = 0,
      scrollMarginBottom: number = 0,
    ) => {
      if (!virtual) {
        const listEl = listElRef.current;
        const itemsEl = itemsElRef.current;
        if (!itemsEl || !listEl) {
          return;
        }
        const visibleItemsEl = itemsEl.firstElementChild;
        if (!visibleItemsEl) {
          return;
        }
        const itemEl = visibleItemsEl.children.item(index);
        if (!(itemEl instanceof HTMLElement)) {
          return;
        }
        const listRect = listEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();
        const itemTop = itemRect.top - listRect.top + listEl.scrollTop;
        if (ensureVisibleOnly) {
          const { scrollTop, offsetHeight } = listEl;
          const itemHeight = itemRect.height;
          if (itemTop > scrollTop) {
            if (!(itemTop + itemHeight <= scrollTop + offsetHeight)) {
              listEl.scrollTo({
                left: 0,
                top: itemTop + itemHeight - offsetHeight + scrollMarginBottom,
                behavior,
              });
            }
          } else {
            listEl.scrollTo({ left: 0, top: itemTop - scrollMarginTop, behavior });
          }
        } else {
          listEl.scrollTo({ left: 0, top: itemTop, behavior });
        }
        return;
      }
      const targetTop = fenwickTree.sum(index) + getRowsTop();
      if (!isReplay) {
        clearPendingScrollTask();
        if (behavior === "instant") {
          const item = items[index];
          pendingScrollTaskRef.current = {
            type: "index",
            key: item === undefined ? undefined : getKey(item),
            index,
            debounce: ensureVisibleOnly,
          };
          schedulePendingScrollTaskExpiry();
        }
      }
      if (ensureVisibleOnly) {
        const listEl = listElRef.current;
        if (listEl) {
          const { scrollTop, offsetHeight } = listEl;
          if (targetTop > scrollTop) {
            const itemSize = fenwickTree.get(index);
            if (!(targetTop + itemSize <= scrollTop + offsetHeight)) {
              listEl.scrollTo({
                left: 0,
                top: targetTop + itemSize - offsetHeight + scrollMarginBottom,
                behavior,
              });
              updateRange("listScroll", true, null);
            }
          } else {
            listEl.scrollTo({ left: 0, top: targetTop - scrollMarginTop, behavior });
            updateRange("listScroll", true, null);
          }
        }
      } else {
        listElRef.current?.scrollTo({ left: 0, top: targetTop, behavior });
        updateRange("listScroll", true, null);
      }
    },
  );
  /**
   * Measures the mounted rows in flow from layout, synchronously, and writes the sizes that changed into
   * the Fenwick tree and the key -> offset cache, and the first row's top margin when the first row is
   * mounted (`leadingMarginRef`). Reads everything first (`measureRowSpans`), then writes: no layout is
   * forced in between. O(mounted rows).
   *
   * Unlike the reference implementation (DeepSeek web): it measured each row's own `offsetHeight`,
   * which in block flow misses the margins between rows and a child's margins that collapse through a row, so the rows drifted from
   * their offsets. A row's size here is the space it takes in the flow: from where its border box starts
   * to where the next row's starts (the last mounted row: to the end of the rows), so collapsed margins
   * are counted once, in the row above them, and the sizes add up to the laid-out height. A row's size
   * depends on the next row's top margin, so every measurement measures the whole run, not the row that
   * resized. The last mounted row's bottom margin does not collapse with the next row (not mounted): its
   * size is provisional until the next row mounts, which corrects it without moving any mounted row
   * (they are laid out by the browser, positioned by the first row's offset alone). Kept rows are not
   * measured: absolutely positioned, they take no space in the flow, and keep the size they were
   * measured at in it.
   */
  const measureFlowRun = useEventCallback(
    (): {
      resizes: AppliedResize[];
      leadingMarginDelta: number;
    } => {
      const resizes: AppliedResize[] = [];
      const visibleItemsEl = getVisibleItemsEl();
      if (
        !virtual ||
        ignoreItemResize ||
        !itemResizable ||
        !(visibleItemsEl instanceof HTMLElement)
      ) {
        return { resizes, leadingMarginDelta: 0 };
      }
      const rows = getFlowRows();
      if (rows.length === 0) {
        return { resizes, leadingMarginDelta: 0 };
      }
      const { spans, firstStart } = measureRowSpans(
        visibleItemsEl,
        rows.map((row: FlowRow) => row.el),
      );
      let leadingMarginDelta = 0;
      if (rows[0]!.index === 0 && firstStart !== leadingMarginRef.current) {
        leadingMarginDelta = firstStart - leadingMarginRef.current;
        leadingMarginRef.current = firstStart;
      }
      rows.forEach(({ key, index }: FlowRow, i: number) => {
        const size = spans[i]!;
        const previousSize = fenwickTree.get(index);
        if (size === previousSize) {
          return;
        }
        if (size - itemEstimatedSize === 0) {
          keyToHeightOffsetRef.current.delete(key);
        } else {
          keyToHeightOffsetRef.current.set(key, size - itemEstimatedSize);
        }
        fenwickTree.add(index, size - previousSize);
        resizes.push({ index, key, delta: size - previousSize });
      });
      return { resizes, leadingMarginDelta };
    },
  );
  /**
   * Measures the mounted rows now (`measureFlowRun`) and applies the layout; returns whether any size
   * changed. Used by the aligned jump, which cannot wait for the batch (a microtask) or the
   * ResizeObserver (after layout, possibly a frame later) to learn the sizes.
   */
  const measureMountedItems = useEventCallback((): boolean => {
    const { resizes, leadingMarginDelta } = measureFlowRun();
    const changed = resizes.length !== 0 || leadingMarginDelta !== 0;
    if (changed) {
      applyLayoutStyles(startIndex);
      onContentResize?.();
    }
    return changed;
  });
  /**
   * Where item `index` is, in the list's scroll coordinates: read from the DOM when
   * it is mounted (exact), else its offset in the Fenwick tree (estimates for unmeasured items).
   */
  const getItemExtent = useEventCallback(
    (index: number): { top: number; size: number; measured: boolean } => {
      const listEl = listElRef.current;
      const item = items[index];
      const visibleItemsEl = getVisibleItemsEl();
      if (listEl && item !== undefined && visibleItemsEl && itemResizable) {
        const key = getKey(item);
        for (const itemEl of Array.from(visibleItemsEl.children)) {
          if (itemEl.getAttribute(ITEM_KEY_ATTR) === key) {
            const rect = itemEl.getBoundingClientRect();
            const listTop = listEl.getBoundingClientRect().top + listEl.clientTop;
            return {
              top: rect.top - listTop + listEl.scrollTop,
              size: rect.height,
              measured: true,
            };
          }
        }
      }
      return {
        top: fenwickTree.sum(index) + getRowsTop(),
        size: fenwickTree.get(index),
        measured: !itemResizable,
      };
    },
  );
  /** Bumped by every aligned jump: a chain of steps stops when a newer jump has started. */
  const alignRunRef = useRef(0);
  /**
   * One step of an aligned jump: measure the mounted items, work out the exact
   * `scrollTop` for the item from the DOM, set it, and update the range. If the range changes, the rows it
   * brings into view are rendered (in a microtask, still before the browser paints) and the next step runs
   * from the render callback (a layout effect) to measure them; the jump is done when a step finds the item
   * mounted, no size changed and `scrollTop` already right. Bounded by `MAX_ALIGN_STEPS`. The item is
   * found by its key at every step: rows inserted above it in between move its index.
   */
  const alignStep = useEventCallback(
    (
      run: number,
      key: string,
      align: ScrollAlign,
      scrollMarginTop: number,
      scrollMarginBottom: number,
      remaining: number,
    ) => {
      const listEl = listElRef.current;
      const index = keyToIndexRef.current.get(key);
      if (listEl == null || run !== alignRunRef.current || index === undefined) {
        return;
      }
      const sizesChanged = measureMountedItems();
      const { top: itemTop, size: itemSize, measured } = getItemExtent(index);
      const viewportHeight = listEl.clientHeight;
      const target = Math.round(
        getAlignedScrollTop({
          itemTop,
          itemSize,
          viewportHeight,
          align,
          scrollMarginTop,
          scrollMarginBottom,
          maxScrollTop: listEl.scrollHeight - viewportHeight,
        }),
      );
      const moved = Math.abs(listEl.scrollTop - target) >= 0.5;
      if (moved) {
        listEl.scrollTo({ left: listEl.scrollLeft, top: target, behavior: "instant" });
      }
      viewportRef.current.scrollTop = listEl.scrollTop;
      if ((!moved && !sizesChanged && measured) || remaining <= 0) {
        return;
      }
      updateRange("listScroll", true, () => {
        alignStep(run, key, align, scrollMarginTop, scrollMarginBottom, remaining - 1);
      });
    },
  );
  /**
   * `scrollTo({ index | key, align })`. Instant (or "auto"): the aligned steps above, armed as the pending
   * task like the other instant jumps (item sizes reported after the jump replay it, for one frame plus one
   * task). Smooth: one scroll to the position worked out from the current layout (estimates for rows not
   * measured yet), like the smooth index jump. Virtualization off: read from the DOM.
   */
  const scrollToAligned = useEventCallback(
    (
      index: number,
      align: ScrollAlign,
      behavior: ScrollBehavior,
      isReplay: boolean,
      scrollMarginTop: number,
      scrollMarginBottom: number,
    ) => {
      const listEl = listElRef.current;
      if (listEl == null) {
        return;
      }
      if (!virtual) {
        const itemEl = getVisibleItemsEl()?.children.item(index);
        if (!itemEl) {
          return;
        }
        const rect = itemEl.getBoundingClientRect();
        const listTop = listEl.getBoundingClientRect().top + listEl.clientTop;
        const top = getAlignedScrollTop({
          itemTop: rect.top - listTop + listEl.scrollTop,
          itemSize: rect.height,
          viewportHeight: listEl.clientHeight,
          align,
          scrollMarginTop,
          scrollMarginBottom,
          maxScrollTop: listEl.scrollHeight - listEl.clientHeight,
        });
        listEl.scrollTo({ left: 0, top: Math.round(top), behavior });
        return;
      }
      const item = items[index];
      if (item === undefined) {
        return;
      }
      const key = getKey(item);
      const smooth = behavior === "smooth";
      if (!isReplay) {
        clearPendingScrollTask();
        if (!smooth) {
          pendingScrollTaskRef.current = {
            type: "align",
            key,
            align,
            scrollMarginTop,
            scrollMarginBottom,
          };
          schedulePendingScrollTaskExpiry();
        }
      }
      const run = ++alignRunRef.current;
      if (smooth) {
        const { top: itemTop, size: itemSize } = getItemExtent(index);
        const top = getAlignedScrollTop({
          itemTop,
          itemSize,
          viewportHeight: listEl.clientHeight,
          align,
          scrollMarginTop,
          scrollMarginBottom,
          maxScrollTop: listEl.scrollHeight - listEl.clientHeight,
        });
        listEl.scrollTo({ left: 0, top: Math.round(top), behavior });
        updateRange("listScroll", true, null);
        return;
      }
      alignStep(run, key, align, scrollMarginTop, scrollMarginBottom, MAX_ALIGN_STEPS);
    },
  );
  const scrollTo = useEventCallback(
    (options: VirtualListScrollToOptions | number, topIfNumber?: number) => {
      if (typeof options == "number") {
        scrollToPosition(options, topIfNumber, "instant");
        return;
      }
      const {
        left,
        top,
        index,
        key,
        position,
        behavior = "instant",
        debounce = true,
        scrollMarginTop = 0,
        scrollMarginBottom = 0,
        align,
      } = options;
      if (left !== undefined || top !== undefined) {
        scrollToPosition(left, top, behavior);
      } else if (align !== undefined && (index !== undefined || key !== undefined)) {
        const alignIndex = index ?? keyToIndexRef.current.get(key!);
        if (alignIndex !== undefined) {
          scrollToAligned(alignIndex, align, behavior, false, scrollMarginTop, scrollMarginBottom);
        }
      } else if (index !== undefined) {
        scrollToIndex(index, behavior, debounce, false, scrollMarginTop, scrollMarginBottom);
      } else if (key !== undefined) {
        const keyIndex = keyToIndexRef.current.get(key);
        if (keyIndex !== undefined) {
          scrollToIndex(keyIndex, behavior, debounce, false, scrollMarginTop, scrollMarginBottom);
        }
      } else if (position) {
        if (virtual) {
          clearPendingScrollTask();
          if (behavior === "instant") {
            pendingScrollTaskRef.current = { type: position };
            schedulePendingScrollTaskExpiry();
          }
        }
        if (position === "bottom") {
          scrollToPosition(0, listElRef.current?.scrollHeight || 2_000_000_000, behavior);
          if (virtual) {
            updateRange("listScroll", true, null);
          }
        } else if (position === "top") {
          scrollToPosition(0, 0, behavior);
        }
      }
    },
  );
  const replayPendingScrollTask = useEventCallback(() => {
    const task = pendingScrollTaskRef.current;
    if (task) {
      if (task.type === "top") {
        scrollToPosition(0, 0, "instant");
      } else if (task.type === "bottom") {
        scrollToPosition(0, listElRef.current?.scrollHeight || 2_000_000_000, "instant");
      } else if (task.type === "index") {
        const index = task.key === undefined ? task.index : keyToIndexRef.current.get(task.key);
        if (index !== undefined) {
          scrollToIndex(index, "instant", task.debounce, true);
        }
      } else if (task.type === "align") {
        const index = keyToIndexRef.current.get(task.key);
        if (index === undefined) {
          return;
        }
        scrollToAligned(
          index,
          task.align,
          "instant",
          true,
          task.scrollMarginTop,
          task.scrollMarginBottom,
        );
      } else if (task.type === "custom") {
        task.task();
      }
    }
  });
  /**
   * Runs `task` now (after a range update) and again after every batch of item resizes while it is
   * armed (one frame plus one task).
   */
  const submitScrollAdjustingTask = useCallback(
    (task: () => void) => {
      clearPendingScrollTask();
      pendingScrollTaskRef.current = { type: "custom", task };
      schedulePendingScrollTaskExpiry();
      updateRange("listScroll", true, replayPendingScrollTask);
    },
    [replayPendingScrollTask, clearPendingScrollTask, schedulePendingScrollTaskExpiry, updateRange],
  );
  const syncViewport = useCallback(() => {
    updateRange("listScroll", false, null);
  }, [updateRange]);
  /*
   * keepAnchorOnItemsChange, step 2 (layout effect, before paint): commit the anchored range, then, with
   * the new tree, scroll so that the anchor row's top is `delta` above the view's top again. The spacer
   * is resized first, so the new scroll position is not clamped. A jump still settling (a pending index
   * or align task) is anchored too, so the rows inserted above do not move its row while it settles; the
   * range update that follows replays it, at its row's new index. Any other pending task (the top, the
   * bottom, a custom task) wins: it is replayed by that range update, so the anchor is not applied.
   */
  const restoreItemsAnchor = useEventCallback((anchor: ItemsAnchor) => {
    appliedItemsAnchorRef.current = anchor;
    rangeRef.current = renderedRange;
    const listEl = listElRef.current;
    const index = keyToIndexRef.current.get(anchor.key);
    const pendingType = pendingScrollTaskRef.current?.type;
    if (
      listEl == null ||
      index === undefined ||
      (pendingType !== undefined && pendingType !== "index" && pendingType !== "align")
    ) {
      return;
    }
    applyLayoutStyles(startIndex);
    const target = fenwickTree.sum(index) + anchor.delta + getRowsTop();
    const diff = target - (listEl.scrollTop + compensationYRef.current);
    if (diff !== 0 && !addCompensation(diff)) {
      listEl.scrollBy(0, diff);
    }
    viewportRef.current.scrollTop = listEl.scrollTop;
  });
  useLayoutEffect(() => {
    if (pendingItemsAnchor !== null && !sessionChangedRef.current) {
      restoreItemsAnchor(pendingItemsAnchor);
    }
    if (sessionChangedRef.current) {
      updateRange("sessionChanged", true, replayPendingScrollTask);
      sessionChangedRef.current = false;
    } else if (itemResizable) {
      const heightBefore = listElRef.current?.offsetHeight;
      applyLayoutStyles(startIndex);
      if (heightBefore === listElRef.current?.offsetHeight) {
        updateRange("itemsChanged", true, replayPendingScrollTask);
      }
    } else {
      updateRange("itemsChanged", true, replayPendingScrollTask);
    }
    // oxlint-disable-next-line react/exhaustive-deps -- startIndex is read, not a dep; sessionId and items are deliberate deps (pendingItemsAnchor changes only with items)
  }, [sessionId, items, replayPendingScrollTask, updateRange, itemResizable, applyLayoutStyles]);
  useLayoutEffect(() => {
    committedLayoutRef.current = { items, tree: fenwickTree, sessionId };
  });
  useLayoutEffect(() => {
    applyLayoutStyles(startIndex);
    renderCallback?.();
    // oxlint-disable-next-line react/exhaustive-deps -- runs after every forced render (renderVersion), startIndex is read, not a dep
  }, [renderReason, renderCallback, renderVersion, applyLayoutStyles]);
  const getOffsetTopOfKey = useEventCallback((key: string) => {
    const index = keyToIndexRef.current.get(key);
    if (index !== undefined) {
      return fenwickTree.sum(index) + getRowsTop();
    }
  });
  const refreshListWidth = useCallback(() => {
    const listEl = listElRef.current;
    if (listEl) {
      listEl.style.setProperty("--virtual-list-width", `${listEl.offsetWidth}px`);
    }
  }, [listElRef]);
  const imperativeApi: VirtualListApi = useMemo(
    () => ({
      listElRef,
      itemsElRef,
      scrollTo,
      syncViewport,
      getOffsetTopOfKey,
      submitScrollAdjustingTask,
      refreshListWidth,
    }),
    [getOffsetTopOfKey, scrollTo, syncViewport, submitScrollAdjustingTask, refreshListWidth],
  );
  useImperativeHandle(componentRef, () => imperativeApi, [imperativeApi]);
  const itemResizeQueueRef = useRef<ItemResizeEntry[]>([]);
  const enqueueItemResize = useEventCallback((entry: ItemResizeEntry) => {
    itemResizeQueueRef.current.push(entry);
  });
  const clearItemResizeQueue = useEventCallback(() => {
    itemResizeQueueRef.current = [];
  });
  const batchResizeScheduledRef = useRef(false);
  /**
   * Applies the queued item measurements (in place of the browser's scroll anchoring): the mounted rows
   * are measured (`measureFlowRun`: all of them, since a row's size depends on its neighbour) and each
   * size change goes into the Fenwick tree and the key -> offset cache. With no pending scroll task,
   * the size changes of items measured for the FIRST time among those that entered above the old start
   * of the range (`prependIndexes`), and of rows above the view, are scrolled away (`scrollBy`, or
   * through the iOS compensation during a touch scroll); with a pending task, the task is replayed.
   */
  const handleItemBatchResize = useEventCallback(() => {
    if (!virtual) {
      return;
    }
    const queue = itemResizeQueueRef.current;
    if (ignoreItemResize) {
      return;
    }
    /*
     * The row at the view's top, before these sizes are applied. Rows before it end at or above the view's
     * top (nothing of them is in view), so a change in their size can only move the rows in view; it is
     * scrolled away below like a first measurement.
     */
    const listElBefore = listElRef.current;
    const viewTop =
      listElBefore == null ? 0 : listElBefore.scrollTop + compensationYRef.current - getRowsTop();
    const viewTopIndex = listElBefore == null ? 0 : fenwickTree.getBound(viewTop);
    // Whether a row is measured for the first time: its first entry in the queue says.
    const isFirstOfKey = new Map<string, boolean>();
    for (const { key, isFirst } of queue) {
      if (!isFirstOfKey.has(key)) {
        isFirstOfKey.set(key, isFirst);
      }
    }
    const { resizes, leadingMarginDelta } = measureFlowRun();
    applyLayoutStyles(startIndex);
    onContentResize?.();
    const listEl = listElRef.current;
    if (listEl != null) {
      const pendingTask = pendingScrollTaskRef.current;
      if (pendingTask?.type === undefined) {
        const compensates = (index: number, key: string | undefined) =>
          (key !== undefined && isFirstOfKey.get(key) === true && prependIndexes.includes(index)) ||
          index < viewTopIndex;
        let compensation = 0;
        for (const { index, key, delta } of resizes) {
          if (compensates(index, key)) {
            compensation += delta;
          }
        }
        /*
         * Unlike the reference implementation (DeepSeek web): the first row's top margin is above every
         * row. It moves the rows in view like a size change of the first row, or of anything above the view once the view's top is
         * past the first row's top.
         */
        const firstItem = items[0];
        if (
          leadingMarginDelta !== 0 &&
          (viewTop > 0 || compensates(0, firstItem === undefined ? undefined : getKey(firstItem)))
        ) {
          compensation += leadingMarginDelta;
        }
        if (compensation !== 0 && !addCompensation(compensation)) {
          listEl.scrollBy(0, compensation);
        }
      } else {
        replayPendingScrollTask();
      }
      const viewport = viewportRef.current;
      viewport.scrollTop = listEl.scrollTop;
      viewport.scrollLeft = listEl.scrollLeft;
    }
    clearItemResizeQueue();
    updateRange("batchItemResize", false, null);
  });
  /** Measurements of items that just mounted are applied together, in one microtask. */
  const scheduleItemBatchResize = useEventCallback(() => {
    if (!batchResizeScheduledRef.current) {
      void Promise.resolve().then(() => {
        handleItemBatchResize();
        batchResizeScheduledRef.current = false;
      });
      batchResizeScheduledRef.current = true;
    }
  });
  /**
   * Ignores scroll events while a flush of the iOS compensation suppresses them; otherwise updates
   * the range (replaying a pending task) and calls `onScroll`.
   */
  const handleListScroll = useEventCallback((event: ListScrollEvent) => {
    const scrollTop = event.target.scrollTop;
    if (!isScrollSuppressedWithForceRestore(scrollTop)) {
      if (!wheelScrollingRef.current) {
        updateRange(
          "listScroll",
          false,
          pendingScrollTaskRef.current ? replayPendingScrollTask : null,
        );
      }
      onScroll?.(event.nativeEvent);
    }
  });
  /**
   * With `catchWheel` (and a fine pointer): scrolls by the wheel itself (`preventDefault`, then
   * `scrollTop +=`) and updates the range at once, so the rows are rendered in the same frame.
   */
  const handleWheel = useEventCallback((wheelEvent: WheelEvent) => {
    if (catchWheel) {
      if (mayUseWheelRef.current) {
        const listEl = listElRef.current;
        if (listEl != null) {
          const scale = getWheelDeltaScale();
          const deltaX = wheelEvent.deltaX / scale;
          const deltaY = wheelEvent.deltaY / scale;
          if (
            deltaX === 0 &&
            ((listEl.scrollTop === 0 && deltaY <= 0) ||
              (listEl.scrollTop + listEl.offsetHeight >= listEl.scrollHeight && deltaY >= 0))
          ) {
            return;
          }
          wheelEvent.preventDefault();
          listEl.scrollTop += deltaY;
          listEl.scrollLeft += deltaX;
          syncViewport();
          wheelScrollingRef.current = true;
          runLatestInNextFrame(() => {
            wheelScrollingRef.current = false;
          });
        }
      }
      onWheel?.(wheelEvent);
    }
  });
  useNonPassiveWheel(
    useCallback(() => listElRef.current, []),
    handleWheel,
    catchWheel,
  );
  const iosCompensationEnabled = isIOS && virtual;
  const { addCompensation, isScrollSuppressedWithForceRestore } = useIosMomentumCompensation({
    enabled: iosCompensationEnabled,
    listElRef,
    itemsElRef,
    syncViewport,
    compensationYRef,
  });
  /**
   * The list's own resize: stores its height and width, sets `--virtual-list-width` and updates
   * the range. Skipped while the list is hidden with `display: none`.
   */
  const handleListResize = useEventCallback((listEl: HTMLElement, deferRender: boolean) => {
    if (isHiddenByDisplayNone(listEl)) {
      return;
    }
    const height = listEl.offsetHeight;
    const width = listEl.offsetWidth;
    const viewport = viewportRef.current;
    if (listElRef.current) {
      listElRef.current.style.setProperty("--virtual-list-width", `${width}px`);
    }
    if (renderCol == null && renderItemWithCols == null) {
      if (height === viewport.listHeight) {
        return;
      }
    } else if (height === viewport.listHeight && width === viewport.listWidth) {
      return;
    }
    viewport.listHeight = height;
    viewport.listWidth = width;
    updateRange("listResize", deferRender, replayPendingScrollTask);
  });
  const onListResizeObserved = useEventCallback(
    ({ entry }: { entry: ObservedResizeEntry; isFirst: boolean }) => {
      handleListResize(entry.target, false);
      onResize?.(entry);
    },
  );
  const onListRefUpdated = useEventCallback((el: HTMLElement | null) => {
    if (el) {
      handleListResize(el, true);
    }
  });
  /**
   * Tracks the row holding focus: focusin finds the row the target is in (the visible-items element's
   * child it is inside); focusout to an element outside the list releases it, and the range is updated so
   * the row unmounts if it is out of the range. A focusout to nowhere (`relatedTarget` null) does not
   * release it: switching to another window or tab fires one while the element keeps focus, and the row
   * must still be there when the person comes back. When focus did go to the page instead (a click on
   * nothing focusable), the next range update finds `document.activeElement` outside the list and
   * releases the row then.
   */
  const handleFocusIn = useEventCallback((event: FocusEvent) => {
    const visibleItemsEl = getVisibleItemsEl();
    let el = event.target instanceof Element ? event.target : null;
    while (el !== null && el.parentElement !== visibleItemsEl) {
      el = el.parentElement;
    }
    focusedKeyRef.current = el?.getAttribute(ITEM_KEY_ATTR) ?? null;
  });
  const handleFocusOut = useEventCallback((event: FocusEvent) => {
    const listEl = listElRef.current;
    const next = event.relatedTarget;
    if (listEl === null || next === null || (next instanceof Node && listEl.contains(next))) {
      return;
    }
    if (focusedKeyRef.current !== null) {
      focusedKeyRef.current = null;
      updateRange("listScroll", true, null);
    }
  });
  useLayoutEffect(() => {
    const listEl = listElRef.current;
    if (listEl === null) {
      return;
    }
    listEl.addEventListener("focusin", handleFocusIn);
    listEl.addEventListener("focusout", handleFocusOut);
    return () => {
      listEl.removeEventListener("focusin", handleFocusIn);
      listEl.removeEventListener("focusout", handleFocusOut);
    };
  }, [handleFocusIn, handleFocusOut]);
  useLayoutEffect(() => {
    if (defaultScrollIndex != null) {
      scrollTo({ index: defaultScrollIndex });
    } else if (defaultScrollKey != null) {
      scrollTo({ key: defaultScrollKey });
    }
    // oxlint-disable-next-line react/exhaustive-deps -- only when the session changes
  }, [sessionId]);
  const itemsContainerStyle = useMemo(
    (): CSSProperties => ({
      boxSizing: "content-box",
      width: px(totalColumnsWidth) ?? undefined,
      paddingTop: px(paddingTop) ?? undefined,
      ...(typeof itemsStyle == "object" ? itemsStyle : {}),
    }),
    [totalColumnsWidth, paddingTop, itemsStyle],
  );
  const [keptItemsBefore, keptItemsAfter] = useMemo((): [readonly T[], readonly T[]] => {
    if (!virtual) {
      return [EMPTY_ARRAY, EMPTY_ARRAY];
    }
    const before: T[] = [];
    const after: T[] = [];
    keptKeysRef.current.forEach((key: string) => {
      const index = keyToIndexRef.current.get(key);
      if (index === undefined) {
        return;
      }
      const item = items[index];
      if (item !== undefined) {
        if (index < startIndex) {
          before.push(item);
        } else if (index > endIndex) {
          after.push(item);
        }
      }
    });
    return [before, after];
    // oxlint-disable-next-line react/exhaustive-deps -- keptKeysRef.current is a dep
  }, [virtual, keptKeysRef.current, items, startIndex, endIndex]);
  /**
   * Renders one item. With `itemResizable` it is wrapped in a ResizeObserverWrapper: when the ref is
   * set the item gets `data-virtual-list-item-key` and is measured in the next microtask batch
   * (`isFirst`); later sizes come from the ResizeObserver. The React key is `sessionId:key`, so a new
   * session remounts every item.
   */
  /* oxlint-disable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop --
     each item element gets new callbacks and style objects whenever it is rendered. */
  const renderItem = useCallback(
    (item: T, absolute: boolean): ReactNode => {
      const key = getKey(item);
      const index = keyToIndexRef.current.get(key);
      const reactKey = sessionId !== undefined ? `${sessionId}:${key}` : key;
      const absoluteStyle: CSSProperties | undefined = absolute
        ? {
            position: "absolute",
            // The margin box at the row's offset, against the element's top (the first row's start
            // above that row: see `applyLayoutStyles`). Out of view, and off by its own top margin at most.
            top: px(
              fenwickTree.sum(index) - fenwickTree.sum(startIndex) + firstRowStartRef.current,
            ),
            left: 0,
            right: 0,
          }
        : undefined;
      const colsNode: ReactElement | undefined =
        renderCol != null ? <ItemColumns index={index} item={item} /> : undefined;
      const itemWithColsNode: ReactElement | undefined =
        renderItemWithCols != null ? <ItemColumns index={index} item={item} /> : undefined;
      if (itemResizable) {
        return (
          <ResizeObserverWrapper
            key={reactKey}
            simulateRefUpdateTrigger={sessionId}
            disabled={!virtual}
            onRefUpdate={(el: HTMLElement | null) => {
              if (el) {
                el.setAttribute(ITEM_KEY_ATTR, key);
                if (!ignoreItemResize && virtual) {
                  enqueueItemResize({ key, target: el, isFirst: true });
                  scheduleItemBatchResize();
                }
              }
            }}
            onResize={({ entry, isFirst }: { entry: ObservedResizeEntry; isFirst: boolean }) => {
              if (!ignoreItemResize) {
                enqueueItemResize({ key, target: entry.target, isFirst });
                // Once per notification, after every resized row is queued: the whole run is measured.
                getResizeObserverDelegate().runAfterEntries(handleItemBatchResize);
              }
            }}
          >
            {({ ref }: { ref: MeasuredRef }) => {
              if (ItemComponent) {
                return (
                  <ItemComponent
                    domRef={ref}
                    item={item}
                    index={index}
                    renderedCols={colsNode}
                    renderedItemWithCols={itemWithColsNode}
                    style={absoluteStyle}
                  />
                );
              } else if (renderItemChild == null) {
                return undefined;
              } else {
                return renderItemChild({
                  key: undefined,
                  domRef: ref,
                  item,
                  index,
                  renderedCols: colsNode,
                  renderedItemWithCols: itemWithColsNode,
                  style: absoluteStyle,
                });
              }
            }}
          </ResizeObserverWrapper>
        );
      } else if (ItemComponent) {
        return (
          <ItemComponent
            key={reactKey}
            domRef={null}
            item={item}
            index={index}
            renderedCols={colsNode}
            renderedItemWithCols={itemWithColsNode}
            style={absoluteStyle}
          />
        );
      } else if (renderItemChild == null) {
        return undefined;
      } else {
        return renderItemChild({
          key: reactKey,
          domRef: null,
          item,
          index,
          renderedCols: colsNode,
          renderedItemWithCols: itemWithColsNode,
          style: absoluteStyle,
        } satisfies ItemRenderProps<T> & { key: string });
      }
    },
    [
      virtual,
      getKey,
      fenwickTree,
      startIndex,
      renderCol,
      renderItemWithCols,
      itemResizable,
      sessionId,
      ignoreItemResize,
      enqueueItemResize,
      scheduleItemBatchResize,
      handleItemBatchResize,
      ItemComponent,
      renderItemChild,
    ],
  );
  /* oxlint-enable react-perf/jsx-no-new-function-as-prop, react-perf/jsx-no-new-object-as-prop */
  const renderedVisibleItems = useMemo(
    () => visibleItems.map((item: T) => renderItem(item, false)),
    [renderItem, visibleItems],
  );
  const renderedKeptBefore = useMemo(
    () => keptItemsBefore.map((item: T) => renderItem(item, true)),
    [renderItem, keptItemsBefore],
  );
  const renderedKeptAfter = useMemo(
    () => keptItemsAfter.map((item: T) => renderItem(item, true)),
    [renderItem, keptItemsAfter],
  );
  useNonVirtualContentResize(itemsElRef, onContentResize, !virtual);
  const onContentResizeRef = useLatestRef(onContentResize);
  const hasItems = items.length !== 0;
  /* oxlint-disable react-perf/jsx-no-new-function-as-prop --
     the footer and empty wrappers get new callbacks whenever their memo is recomputed. */
  const footerNode = useMemo(
    () =>
      typeof footer != "function" ? (
        footer
      ) : (
        <ResizeObserverWrapper
          onResize={() => {
            onContentResizeRef.current?.();
          }}
          onUnmounted={() => {
            onContentResizeRef.current?.();
          }}
        >
          {({ ref }: { ref: MeasuredRef }) => footer({ domRef: ref })}
        </ResizeObserverWrapper>
      ),
    [footer, onContentResizeRef],
  );
  const emptyNode = useMemo(
    () =>
      typeof empty != "function" ? (
        empty
      ) : (
        <ResizeObserverWrapper
          onResize={() => {
            onContentResizeRef.current?.();
          }}
          onUnmounted={() => {
            onContentResizeRef.current?.();
          }}
        >
          {({ ref }: { ref: MeasuredRef }) => empty({ domRef: ref })}
        </ResizeObserverWrapper>
      ),
    [empty, onContentResizeRef],
  );
  /* oxlint-enable react-perf/jsx-no-new-function-as-prop */
  const { snapshotAnchorElementStateAndSaveToRef, restoreScrollStateFromAnchor, clearAnchor } =
    useScrollAnchor(listElRef, getVisibleItemsEl);
  // Switching virtualization off snapshots the item at the top; switching it on records the measured
  // sizes of every rendered item first.
  useMemoWithPrevious(
    (previous) => {
      if (!previous || !itemResizable) {
        return;
      }
      const [wasVirtual, previousSessionId] = previous;
      if (previousSessionId === sessionId) {
        if (wasVirtual && !virtual) {
          snapshotAnchorElementStateAndSaveToRef();
        } else {
          // Without items the list renders no items element: there is nothing to record. Every row is
          // in flow: their sizes are the spans between them, as `measureFlowRun` measures them.
          const visibleItemsEl = getVisibleItemsEl();
          if (!(visibleItemsEl instanceof HTMLElement)) {
            return;
          }
          const rows: { el: HTMLElement; key: string }[] = [];
          for (const el of Array.from(visibleItemsEl.children)) {
            const key = el.getAttribute(ITEM_KEY_ATTR);
            if (key !== null && el instanceof HTMLElement) {
              rows.push({ el, key });
            }
          }
          const { spans, firstStart } = measureRowSpans(
            visibleItemsEl,
            rows.map((row) => row.el),
          );
          if (rows[0] !== undefined && keyToIndexRef.current.get(rows[0].key) === 0) {
            leadingMarginRef.current = firstStart;
          }
          rows.forEach(({ key }, i: number) => {
            const offset = spans[i]! - itemEstimatedSize;
            if (offset === 0) {
              keyToHeightOffsetRef.current.delete(key);
            } else {
              keyToHeightOffsetRef.current.set(key, offset);
            }
          });
        }
      }
    },
    [virtual, sessionId],
  );
  // After switching virtualization off, scroll the snapshotted item back to where it was.
  useLayoutEffectWithPrevious(
    (previous) => {
      if (!itemResizable || !previous) {
        return;
      }
      const [wasVirtual, previousSessionId] = previous;
      if (previousSessionId === sessionId && wasVirtual && !virtual) {
        restoreScrollStateFromAnchor();
        clearAnchor();
      }
    },
    [virtual, sessionId],
  );
  const { onKeyDown: onKeyboardScroll } = useKeyboardScroll(scrollTo, {
    pageBottomOcclusion: keyboardPageBottomOcclusion,
  });
  /** The consumer's `onKeyDown` first: a key it takes (`preventDefault`) does not scroll the list. */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onNativeKeyDown?.(event);
      onKeyboardScroll(event);
    },
    [onNativeKeyDown, onKeyboardScroll],
  );
  const emptyCentered = items.length === 0 && emptyAlign === "center";
  const rootClassName = cn(
    "r-virtual-list",
    columns.length !== 0 && "r-virtual-list--x-scrollable",
    showScrollbar && "r-virtual-list--show-scrollbar",
    printable === true && "r-virtual-list--printable",
    emptyCentered && "r-virtual-list--empty-centered",
    iosCompensationEnabled && "r-virtual-list--ios-compensation-enabled",
    className,
  );
  return (
    <ResizeObserverWrapper
      forwardedRef={mergedListRefSetter}
      onRefUpdate={onListRefUpdated}
      onResize={onListResizeObserved}
    >
      {({ ref }: { ref: MeasuredRef }) => (
        <div
          {...nativeProps}
          data-slot="virtual-list"
          className={rootClassName}
          style={style}
          onScroll={handleListScroll}
          ref={ref}
          onKeyDown={onKeyDown}
          tabIndex={focusable ? 0 : -1}
        >
          {header}
          {hasItems ? (
            <div
              key="items"
              data-slot="virtual-list-items"
              ref={itemsElRef}
              className={itemsClassName}
              style={itemsContainerStyle}
            >
              <VirtualListContext.Provider value={imperativeApi}>
                <ColumnsContext.Provider value={columnsContextValue}>
                  {
                    // createElement, not JSX: the items are passed as separate children (spread
                    // arguments), so one flat list is reconciled by key across the three groups.
                    createElement(
                      visibleItemsTag,
                      {
                        "data-slot": "virtual-list-visible-items",
                        style: virtual
                          ? VIRTUAL_VISIBLE_ITEMS_STYLE
                          : NON_VIRTUAL_VISIBLE_ITEMS_STYLE,
                        ...visibleItemsProps,
                      },
                      ...renderedKeptBefore,
                      ...renderedVisibleItems,
                      ...renderedKeptAfter,
                    )
                  }
                </ColumnsContext.Provider>
              </VirtualListContext.Provider>
            </div>
          ) : (
            <div
              key="empty"
              data-slot="virtual-list-empty"
              className={cn(
                "r-virtual-list__empty",
                emptyCentered && "r-virtual-list__empty--center",
              )}
            >
              {emptyNode}
            </div>
          )}
          {footerNode}
          {paddingBottom ? <div style={{ paddingBottom }} /> : null}
          {footerAfterBottomPadding}
        </div>
      )}
    </ResizeObserverWrapper>
  );
}
