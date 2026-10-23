import { useEffect, useState } from "react";

/**
 * How long the located highlight lasts: `info-soft` at once, held 1.2s, faded
 * out by 2s (design/foundations/states.md#located). styles.css runs the
 * animation; useLocated drops `data-located` after this long.
 */
export const LOCATED_MS = 2000;

/**
 * Whether an item shows the located highlight: pass it to MessageItem's
 * `located`, or set `data-located` while it is true.
 *
 * `request` names one jump to this item: a counter or token that changes on
 * every jump, `null` or `undefined` for none. Not the item's own id: a second
 * jump to the same item would pass the same value and show nothing. A string
 * or number, never an object: a new object each render would restart the
 * highlight on every render, and it would never show. Pass it once the item is on
 * screen, after the scroll that brings it there. Each new request turns the
 * highlight off, back on two frames later (the animation restarts only after
 * the attribute was gone for a frame, so a second jump to the same item shows
 * again), and off after LOCATED_MS, so the attribute never stays behind and
 * hover comes back. Re-renders with the same request change nothing.
 */
export type LocatedRequest = string | number | null | undefined;

export function useLocated(request: LocatedRequest): boolean {
  // The request the highlight is on for. A new request doesn't match it, so
  // the highlight is off from the render that brings the request, with no
  // state to reset.
  const [on, setOn] = useState<LocatedRequest>(null);

  useEffect(() => {
    if (request == null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setOn(() => request);
        timer = setTimeout(() => setOn(null), LOCATED_MS);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [request]);

  return request != null && on === request;
}
