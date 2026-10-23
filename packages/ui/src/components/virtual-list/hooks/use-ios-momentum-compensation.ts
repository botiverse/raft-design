/*
 * iOS momentum-scroll compensation of VirtualList.
 */
import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import { useEventCallback } from "./use-event-callback";

type Timer = ReturnType<typeof setTimeout>;
type FlushReason = "touchStart" | "idleTimer" | "scrollToTop" | "overBottom";

interface IosMomentumCompensation {
  /** Adds a size change above the view; false when it was not taken (not iOS, or no touch session). */
  addCompensation: (deltaY: number) => boolean;
  /**
   * Whether scroll events are being ignored after a flush at touchstart; restores the forced
   * `scrollTop` when the browser reset it to 0.
   */
  isScrollSuppressedWithForceRestore: (scrollTop: number) => boolean;
}

/**
 * On iOS, writing `scrollTop` during momentum scrolling stops the fling. So while a touch scroll is
 * active, size changes above the view are accumulated and applied as `translateY(-compensation)` on
 * the items element; they are written to `scrollTop` (flushed) one second after the finger lifted, at
 * the top or bottom edge, or on the next touchstart.
 */
export function useIosMomentumCompensation({
  enabled,
  listElRef,
  itemsElRef,
  syncViewport,
  compensationYRef: iosCompYRef,
}: {
  enabled: boolean;
  listElRef: RefObject<HTMLDivElement | null>;
  itemsElRef: RefObject<HTMLDivElement | null>;
  syncViewport: () => void;
  /**
   * The offset applied through a transform instead of `scrollTop` (the range update adds it). Created by
   * the list, which reads it while rendering, before this hook runs.
   */
  compensationYRef: RefObject<number>;
}): IosMomentumCompensation {
  const touchSessionActiveRef = useRef(false);
  const idleTimerRef = useRef<Timer | null>(null);
  const scrollSuppressTimerRef = useRef<Timer | null>(null);
  const forcedScrollTopRef = useRef<number | null>(null);
  const touchEndedRef = useRef(true);
  const applyCompensationTransform = useEventCallback(() => {
    const itemsEl = itemsElRef.current;
    if (itemsEl) {
      const compensation = iosCompYRef.current;
      if (compensation === 0) {
        itemsEl.style.transform = "";
      } else {
        itemsEl.style.transform = `translateY(${-compensation}px)`;
      }
    }
  });
  const clearIdleTimer = useEventCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  });
  const startScrollSuppression = useEventCallback(() => {
    if (scrollSuppressTimerRef.current !== null) {
      clearTimeout(scrollSuppressTimerRef.current);
    }
    scrollSuppressTimerRef.current = setTimeout(() => {
      scrollSuppressTimerRef.current = null;
      forcedScrollTopRef.current = null;
      syncViewport();
    }, 200);
  });
  const flushCompensation = useEventCallback((reason: FlushReason) => {
    clearIdleTimer();
    const compensation = iosCompYRef.current;
    iosCompYRef.current = 0;
    touchSessionActiveRef.current = false;
    applyCompensationTransform();
    const listEl = listElRef.current;
    if (listEl && compensation !== 0) {
      const scrollTop = listEl.scrollTop + compensation;
      listEl.scrollTop = scrollTop;
      if (reason == "touchStart") {
        forcedScrollTopRef.current = scrollTop;
        startScrollSuppression();
      }
    }
  });
  const scheduleIdleFlush = useEventCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      if (touchEndedRef.current) {
        flushCompensation("idleTimer");
      } else {
        // oxlint-disable-next-line react/immutability -- reschedules itself until the finger lifts
        scheduleIdleFlush();
      }
    }, 1000);
  });
  const handleTouchStart = useEventCallback(() => {
    touchEndedRef.current = false;
    if (touchSessionActiveRef.current) {
      flushCompensation("touchStart");
    }
    touchSessionActiveRef.current = true;
    scheduleIdleFlush();
  });
  const handleTouchEnd = useEventCallback(() => {
    touchEndedRef.current = true;
  });
  const handleScrollDuringTouch = useEventCallback(() => {
    if (touchSessionActiveRef.current) {
      scheduleIdleFlush();
    }
  });
  const clampCompensation = useEventCallback(() => {
    const listEl = listElRef.current;
    if (!listEl) {
      return;
    }
    const maxScrollTop = listEl.scrollHeight - listEl.clientHeight;
    iosCompYRef.current = Math.max(
      -listEl.scrollTop,
      Math.min(maxScrollTop - listEl.scrollTop, iosCompYRef.current),
    );
  });
  const addCompensation = useEventCallback((deltaY: number) => {
    if (!enabled || !touchSessionActiveRef.current) {
      return false;
    }
    iosCompYRef.current += deltaY;
    clampCompensation();
    const listEl = listElRef.current;
    if (listEl) {
      /*
       * At the top with the finger still down the compensation waits for the lift like anywhere else,
       * but as a transform too: the range is laid out at `scrollTop + compensation`, so without it the
       * rows in view would be drawn that far below the view (an older page landing: all of it blank).
       */
      if (listEl.scrollTop <= 0 && touchEndedRef.current) {
        flushCompensation("scrollToTop");
        return true;
      }
      if (iosCompYRef.current > 0) {
        const maxScrollTop = listEl.scrollHeight - listEl.clientHeight;
        if (listEl.scrollTop + iosCompYRef.current >= maxScrollTop) {
          flushCompensation("overBottom");
          return true;
        }
      }
    }
    applyCompensationTransform();
    return true;
  });
  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const listEl = listElRef.current;
    if (!listEl) {
      return;
    }
    const itemsEl = itemsElRef.current;
    listEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    listEl.addEventListener("touchend", handleTouchEnd, { passive: true });
    listEl.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    listEl.addEventListener("scroll", handleScrollDuringTouch, { passive: true });
    return () => {
      listEl.removeEventListener("touchstart", handleTouchStart);
      listEl.removeEventListener("touchend", handleTouchEnd);
      listEl.removeEventListener("touchcancel", handleTouchEnd);
      listEl.removeEventListener("scroll", handleScrollDuringTouch);
      clearIdleTimer();
      if (scrollSuppressTimerRef.current !== null) {
        clearTimeout(scrollSuppressTimerRef.current);
        scrollSuppressTimerRef.current = null;
        forcedScrollTopRef.current = null;
      }
      if (iosCompYRef.current !== 0) {
        if (itemsEl) {
          itemsEl.style.transform = "";
        }
        listEl.scrollTop += iosCompYRef.current;
        iosCompYRef.current = 0;
      }
      touchSessionActiveRef.current = false;
    };
  }, [
    enabled,
    listElRef,
    itemsElRef,
    handleTouchStart,
    handleTouchEnd,
    handleScrollDuringTouch,
    clearIdleTimer,
    iosCompYRef,
  ]);
  return {
    addCompensation,
    isScrollSuppressedWithForceRestore: useEventCallback((scrollTop: number) => {
      const suppressed = scrollSuppressTimerRef.current !== null;
      if (
        suppressed &&
        listElRef.current &&
        forcedScrollTopRef.current !== null &&
        scrollTop === 0
      ) {
        listElRef.current.scrollTop = forcedScrollTopRef.current;
      }
      return suppressed;
    }),
  };
}
