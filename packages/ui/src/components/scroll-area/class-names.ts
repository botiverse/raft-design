import { clsx } from "cnfast";

import type {
  ScrollAreaGuttersPosition,
  ScrollAreaOrientation,
  ScrollAreaOverscroll,
  ScrollAreaSize,
  ScrollAreaTrigger,
} from "./types";
import type { ScrollRails } from "./use-scrollbars";

export type ScrollAreaState = {
  size: ScrollAreaSize;
  trigger: ScrollAreaTrigger;
  orientation: ScrollAreaOrientation;
  overscroll: ScrollAreaOverscroll;
  fade: boolean;
  guttersPosition: ScrollAreaGuttersPosition;
  rails: ScrollRails;
};

/**
 * The root's rendered modifier classes, shared by every ScrollArea root.
 * `--{none,contain}-overscroll-{y,x}` is on only for an axis that has a
 * gutter, i.e. really scrolls right now, so an area that only overflows
 * sideways never holds back the page's vertical scroll; the container takes
 * them (scroll-area.css).
 *
 * The classes that change while scrolling (`--scrolling`, `--dragging`,
 * `--rtl`, `--overflow-{y,x}-{start,end}`) are not rendered: `useScrollbars`
 * sets them on the element, so scrolling never renders.
 */
export function scrollAreaClassNames(state: ScrollAreaState): string {
  const { rails } = state;
  return clsx(
    "r-scroll-area",
    `r-scroll-area--${state.size}`,
    `r-scroll-area--${state.trigger}-trigger`,
    `r-scroll-area--${state.orientation}-orientation`,
    `r-scroll-area--${state.guttersPosition}-gutters`,
    state.overscroll !== "auto" && rails.yRail && `r-scroll-area--${state.overscroll}-overscroll-y`,
    state.overscroll !== "auto" && rails.xRail && `r-scroll-area--${state.overscroll}-overscroll-x`,
    state.fade && "r-scroll-area--fade",
  );
}
