/*
 * Render-prop wrapper that observes its child's element with the shared ResizeObserver.
 */
import { useLayoutEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";

import { useEventCallback } from "../hooks/use-event-callback";
import { useMergedRef } from "../hooks/use-merged-ref";
import { getResizeObserverDelegate } from "./resize-observer-delegate";
import type { ObservedResizeEntry } from "./resize-observer-delegate";

/** The ref callback ResizeObserverWrapper hands to its child. */
export type MeasuredRef = (el: HTMLElement | null) => void;

interface ResizeObserverWrapperProps {
  disabled?: boolean | undefined;
  onResize: (info: { entry: ObservedResizeEntry; isFirst: boolean }) => void;
  children: (props: { ref: MeasuredRef }) => ReactNode;
  onRefUpdate?: ((el: HTMLElement | null) => void) | undefined;
  forwardedRef?: Ref<HTMLElement> | undefined;
  simulateRefUpdateTrigger?: unknown;
  onUnmounted?: (() => void) | undefined;
}

/**
 * Calls `children({ ref })` and observes the element `ref` receives. `onRefUpdate` runs synchronously
 * whenever the ref is set (VirtualList measures a new item there, before paint), and again in a
 * layout effect when `simulateRefUpdateTrigger` differs from its first value; `onResize` runs from the
 * ResizeObserver, with `isFirst` for its first call (again after re-enabling). `disabled` stops
 * observing; `onUnmounted` runs in a layout-effect cleanup.
 */
export function ResizeObserverWrapper(props: ResizeObserverWrapperProps) {
  const {
    disabled,
    onResize,
    children,
    onRefUpdate,
    forwardedRef,
    simulateRefUpdateTrigger,
    onUnmounted,
  } = props;
  const [setRef, getRef] = useMergedRef(forwardedRef);
  const isFirstResizeRef = useRef(true);
  const prevSimulateTriggerRef = useRef(simulateRefUpdateTrigger);
  const emitRefUpdate = useEventCallback(() => {
    onRefUpdate?.(getRef());
  });
  useLayoutEffect(() => {
    if (prevSimulateTriggerRef.current !== simulateRefUpdateTrigger) {
      emitRefUpdate();
    }
  }, [simulateRefUpdateTrigger, emitRefUpdate]);
  const handleResize = useEventCallback((entry: ObservedResizeEntry) => {
    if (!disabled) {
      onResize({ entry, isFirst: isFirstResizeRef.current });
    }
    isFirstResizeRef.current = false;
  });
  useLayoutEffect(() => {
    const el = getRef();
    if (el != null) {
      if (disabled) {
        getResizeObserverDelegate().unobserve(el);
        isFirstResizeRef.current = true;
      } else {
        getResizeObserverDelegate().observe(el, handleResize);
        // The ref callback unobserves the element when it detaches; this covers `disabled` turning on
        // and unmounting in any order (unobserving twice is a no-op).
        return () => {
          getResizeObserverDelegate().unobserve(el);
        };
      }
    }
  }, [disabled, getRef, handleResize]);
  const emitUnmounted = useEventCallback(() => {
    onUnmounted?.();
  });
  useLayoutEffect(
    () => () => {
      emitUnmounted();
    },
    [emitUnmounted],
  );
  // A ref callback that returns nothing: with React 19 a returned function would be a cleanup.
  const ref = useEventCallback((el: HTMLElement | null) => {
    const previous = getRef();
    setRef(el);
    onRefUpdate?.(el);
    if (disabled) {
      if (previous != null) {
        getResizeObserverDelegate().unobserve(previous);
      }
    } else if (el === null) {
      if (previous !== null) {
        getResizeObserverDelegate().unobserve(previous);
      }
    } else {
      if (previous !== null && previous !== el) {
        getResizeObserverDelegate().unobserve(previous);
      }
      getResizeObserverDelegate().observe(el, handleResize);
    }
  });
  return children({ ref });
}
