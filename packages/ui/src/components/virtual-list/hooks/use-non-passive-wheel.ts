import { useLayoutEffect } from "react";

/**
 * Adds a non-passive `wheel` listener (so it may call `preventDefault`) to the element `getTarget`
 * returns, in a layout effect, only while `enabled` (a non-passive listener can hold up scrolling, so
 * none is added when it would not be used).
 */
export function useNonPassiveWheel(
  getTarget: () => HTMLElement | null | undefined,
  listener: (event: WheelEvent) => void,
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const target = getTarget();
    if (target != null) {
      target.addEventListener("wheel", listener, { passive: false });
    }
    return () => {
      if (target != null) {
        target.removeEventListener("wheel", listener);
      }
    };
  }, [getTarget, listener, enabled]);
}
