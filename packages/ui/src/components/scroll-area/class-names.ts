import { clsx } from "cnfast";

import type {
  ScrollAreaOrientation,
  ScrollAreaOverscroll,
  ScrollAreaSize,
  ScrollAreaTrigger,
} from "./types";
import type { ScrollView } from "./use-scrollbars";

export type ScrollAreaState = {
  size: ScrollAreaSize;
  trigger: ScrollAreaTrigger;
  orientation: ScrollAreaOrientation;
  overscroll: ScrollAreaOverscroll;
  fade: boolean;
  view: ScrollView;
  scrolling: boolean;
  dragging: boolean;
};

/**
 * The block's modifier classes, shared by ScrollArea and ScrollAreaTextarea.
 * `--overflow-{y,x}-{start,end}` is on while there is more content past that
 * edge (`x` is inline: its start is the right edge in right-to-left layouts).
 * `--{none,contain}-overscroll-{y,x}` is on only for an axis that has a rail, i.e.
 * really scrolls right now, so an area that only overflows sideways never
 * holds back the page's vertical scroll.
 */
export function scrollAreaClassNames(state: ScrollAreaState): string {
  const { view } = state;
  return clsx(
    "r-scroll-area",
    `r-scroll-area--${state.size}`,
    `r-scroll-area--${state.trigger}-trigger`,
    `r-scroll-area--${state.orientation}-orientation`,
    state.overscroll !== "auto" && view.yRail && `r-scroll-area--${state.overscroll}-overscroll-y`,
    state.overscroll !== "auto" && view.xRail && `r-scroll-area--${state.overscroll}-overscroll-x`,
    state.fade && "r-scroll-area--fade",
    view.rtl && "r-scroll-area--rtl",
    view.yStart && "r-scroll-area--overflow-y-start",
    view.yEnd && "r-scroll-area--overflow-y-end",
    view.xStart && "r-scroll-area--overflow-x-start",
    view.xEnd && "r-scroll-area--overflow-x-end",
    state.scrolling && "r-scroll-area--scrolling",
    state.dragging && "r-scroll-area--dragging",
  );
}
