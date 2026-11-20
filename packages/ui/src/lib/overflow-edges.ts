import { useCallback, useRef } from "react";

export type OverflowEdge = "start" | "end" | "both";

/**
 * Which inline sides of a sideways scroller hide content: `start`, `end`,
 * `both`, or null when it all fits. Logical, so in a right-to-left scroller
 * (whose scrollLeft runs from 0 down to minus its range) `start` is still the
 * side the content begins on.
 */
export function readOverflowEdge(el: HTMLElement): OverflowEdge | null {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 1) return null;
  const scrolled = Math.abs(el.scrollLeft);
  const start = scrolled > 1;
  const end = scrolled < max - 1;
  return start && end ? "both" : start ? "start" : end ? "end" : null;
}

export type UseOverflowEdgesOptions = {
  /** Measure at all. Off, the ref does nothing (Tabs placed at a side, whose
   *  list doesn't scroll sideways). Default true. */
  enabled?: boolean;
  /** Turn a vertical mouse wheel over the strip into sideways scrolling, as
   *  Tabs does. Only while the strip can move: at its end the wheel goes on
   *  to the page. Default true. */
  wheel?: boolean;
  /** Called after each measurement, e.g. to bring a selected item into view
   *  when the content changes (Tabs). */
  onChange?: (el: HTMLElement) => void;
};

/**
 * Keeps `data-overflow` on a strip that scrolls sideways current, for
 * `mask-fade-x` (design/foundations/spacing.md#edges-fade): written straight
 * to the element on every scroll, resize and change of its content, so the
 * fade is gone at the end, without a React render. The one copy of this
 * measurement; Tabs uses it, and so should every app strip with an edge fade.
 *
 * Returns a ref callback for the scroller (a ScrollArea's ref is its
 * viewport, the element that scrolls).
 */
export function useOverflowEdges<E extends HTMLElement>({
  enabled = true,
  wheel = true,
  onChange,
}: UseOverflowEdgesOptions = {}): (el: E | null) => void {
  const cleanup = useRef<(() => void) | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  return useCallback(
    (el: E | null) => {
      cleanup.current?.();
      cleanup.current = null;
      if (!el || !enabled) return;
      const update = () => {
        const edge = readOverflowEdge(el);
        if (edge) el.setAttribute("data-overflow", edge);
        else el.removeAttribute("data-overflow");
      };
      const onContent = () => {
        change.current?.(el);
        update();
      };
      const onWheel = (event: WheelEvent) => {
        if (el.scrollWidth <= el.clientWidth) return;
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        const before = el.scrollLeft;
        el.scrollLeft += event.deltaY;
        if (el.scrollLeft !== before) event.preventDefault();
      };
      onContent();
      el.addEventListener("scroll", update, { passive: true });
      if (wheel) el.addEventListener("wheel", onWheel, { passive: false });
      const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      resize?.observe(el);
      const mutations =
        typeof MutationObserver === "undefined" ? null : new MutationObserver(onContent);
      mutations?.observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["data-active", "hidden"],
      });
      cleanup.current = () => {
        el.removeEventListener("scroll", update);
        el.removeEventListener("wheel", onWheel);
        resize?.disconnect();
        mutations?.disconnect();
        el.removeAttribute("data-overflow");
      };
    },
    [enabled, wheel],
  );
}
