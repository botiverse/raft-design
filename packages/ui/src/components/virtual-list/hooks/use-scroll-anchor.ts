/*
 * The scroll anchor VirtualList keeps across switching virtualization off.
 */
import { useCallback, useRef } from "react";
import type { RefObject } from "react";

interface AnchorSnapshot {
  element: Element;
  top: number;
}

/**
 * Finds the first child of `container` whose box crosses the top of `scroller` (a binary search over
 * `getBoundingClientRect()`) and saves it with its top in `anchorRef`, or null when there is none.
 */
function snapshotAnchorElementStateAndSaveToRef(
  anchorRef: RefObject<AnchorSnapshot | null>,
  scroller: HTMLDivElement,
  container: Element,
): void {
  const children = Array.from(container.children);
  const scrollerTop = scroller.getBoundingClientRect().top;
  let lo = 0;
  let hi = children.length - 1;
  let found = -1;
  let foundTop = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const rect = children[mid]!.getBoundingClientRect();
    if (rect.top <= scrollerTop && rect.bottom > scrollerTop) {
      found = mid;
      hi = mid - 1;
      foundTop = rect.top;
    } else {
      lo = mid + 1;
    }
  }
  if (found < 0) {
    anchorRef.current = null;
  } else {
    const element = children[found];
    if (element) {
      anchorRef.current = { element, top: foundTop };
    } else {
      anchorRef.current = null;
    }
  }
}

/**
 * `snapshotAnchorElementStateAndSaveToRef()` remembers the item at the top of the list;
 * `restoreScrollStateFromAnchor()` scrolls by how far it moved since; `clearAnchor()` forgets it.
 */
export function useScrollAnchor(
  listElRef: RefObject<HTMLDivElement | null>,
  getVisibleItemsEl: () => Element | null,
) {
  const anchorRef = useRef<AnchorSnapshot | null>(null);
  const snapshotAnchor = useCallback(() => {
    const visibleItemsEl = getVisibleItemsEl();
    if (listElRef.current && visibleItemsEl) {
      snapshotAnchorElementStateAndSaveToRef(anchorRef, listElRef.current, visibleItemsEl);
    }
  }, [listElRef, getVisibleItemsEl]);
  return {
    snapshotAnchorElementStateAndSaveToRef: snapshotAnchor,
    restoreScrollStateFromAnchor: useCallback(() => {
      if (!anchorRef.current) {
        return;
      }
      const moved = anchorRef.current.element.getBoundingClientRect().top - anchorRef.current.top;
      listElRef.current?.scrollBy(0, moved);
    }, [listElRef]),
    clearAnchor: useCallback(() => {
      anchorRef.current = null;
    }, []),
  };
}
