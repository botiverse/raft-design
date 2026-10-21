/*
 * Content-size notifications while virtualization is off.
 */
import { useLayoutEffect } from "react";
import type { RefObject } from "react";

import { useEventCallback } from "./use-event-callback";
import { getResizeObserverDelegate } from "../resize-observer/resize-observer-delegate";

/**
 * While `nonVirtual`, observes the items element and calls `onContentResize` when it resizes (with
 * virtualization on, the list calls it from its own measurements).
 */
export function useNonVirtualContentResize(
  itemsElRef: RefObject<HTMLDivElement | null>,
  onContentResize: (() => void) | undefined,
  nonVirtual: boolean,
): void {
  const notifyContentResize = useEventCallback(() => {
    onContentResize?.();
  });
  useLayoutEffect(() => {
    const itemsEl = itemsElRef.current;
    if (itemsEl && nonVirtual) {
      getResizeObserverDelegate().observe(itemsEl, notifyContentResize);
      return () => {
        getResizeObserverDelegate().unobserve(itemsEl);
      };
    }
  }, [itemsElRef, notifyContentResize, nonVirtual]);
}
