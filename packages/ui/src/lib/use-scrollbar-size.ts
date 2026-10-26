import { useCallback, useRef } from "react";

/**
 * Publishes a scroller's classic scrollbar width as `--scrollbar-size` on the
 * scroller, for the list cells inside it (lib/list-cell.ts): a cell gives
 * that much of its 8px end inset back, so its fill sits 8px from both outer
 * edges of the list whether the scrollbar takes room (a classic scrollbar,
 * `scrollbar-list`) or not (an overlay scrollbar: 0). CSS alone can't tell
 * the two apart. The width is kept current while the scroller or its
 * content resizes, which is when a scrollbar comes and goes.
 *
 * Returns a ref callback for the scroller.
 */
export function useScrollbarSize<E extends HTMLElement>(): (el: E | null) => void {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: E | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const style = getComputedStyle(el);
      const size =
        el.offsetWidth -
        el.clientWidth -
        parseFloat(style.borderLeftWidth || "0") -
        parseFloat(style.borderRightWidth || "0");
      el.style.setProperty("--scrollbar-size", `${Math.max(0, Math.round(size))}px`);
    };
    const resize = new ResizeObserver(update);
    const observeChildren = () => {
      for (const child of el.children) resize.observe(child);
    };
    resize.observe(el);
    observeChildren();
    const mutation = new MutationObserver(() => {
      observeChildren();
      update();
    });
    mutation.observe(el, { childList: true });
    update();
    cleanup.current = () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);
}
