import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { DESKTOP_MEDIA_QUERY } from "../../lib/desktop-media";

// jsdom and some embedded webviews have no matchMedia or ResizeObserver: there
// the margin never fits, and the viewer keeps markers instead of throwing.
const canMatchMedia = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

function subscribeDesktop(onChange: () => void) {
  if (!canMatchMedia()) return () => undefined;
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getDesktop = () => canMatchMedia() && window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

export type UseCommentMarginFitsOptions = {
  /** The narrowest the viewer may be for the margin to show, in px. Default 784. */
  minWidth?: number;
};

/**
 * Whether a viewer has room for a comment margin beside its document: true
 * only on a desktop (from 768px with a mouse or a trackpad, the query the
 * desktop metrics use) and while `element`, the viewer that holds the
 * document and the margin, is at least `minWidth` wide. Otherwise show
 * `CommentMarker`s and open discussions in a bottom sheet. Cards and markers
 * are different trees, so this is measured in JavaScript (a
 * `ResizeObserver` on the element), not decided by a container query.
 */
export function useCommentMarginFits(
  element: Element | null,
  { minWidth = 784 }: UseCommentMarginFitsOptions = {},
): boolean {
  const desktop = useSyncExternalStore(subscribeDesktop, getDesktop, () => false);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!element) return;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return desktop && element !== null && width >= minWidth;
}
