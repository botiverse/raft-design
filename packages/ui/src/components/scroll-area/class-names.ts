import { clsx } from "cnfast";

import type {
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
  rails: ScrollRails;
};

/**
 * The block's rendered modifier classes, shared by ScrollArea and
 * ScrollAreaTextarea. `--{none,contain}-overscroll-{y,x}` is on only for an
 * axis that has a rail, i.e. really scrolls right now, so an area that only
 * overflows sideways never holds back the page's vertical scroll.
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
    state.overscroll !== "auto" && rails.yRail && `r-scroll-area--${state.overscroll}-overscroll-y`,
    state.overscroll !== "auto" && rails.xRail && `r-scroll-area--${state.overscroll}-overscroll-x`,
    state.fade && "r-scroll-area--fade",
  );
}
