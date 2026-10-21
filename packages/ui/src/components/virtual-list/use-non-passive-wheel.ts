import { useLayoutEffect } from "react";

/**
 * Adds a non-passive `wheel` listener (so it may call `preventDefault`) to the element `getTarget`
 * returns, in a layout effect.
 */
export function useNonPassiveWheel(
  getTarget: () => HTMLElement | null | undefined,
  listener: (event: WheelEvent) => void,
): void {
  useLayoutEffect(() => {
    const target = getTarget();
    if (target != null) {
      target.addEventListener("wheel", listener, { passive: false });
    }
    return () => {
      if (target != null) {
        target.removeEventListener("wheel", listener);
      }
    };
  }, [getTarget, listener]);
}
