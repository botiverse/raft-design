import type { ComponentPropsWithRef, CSSProperties, ReactNode, Ref } from "react";

/**
 * `hover` shows the scrollbars while the pointer is over the area or it
 * scrolls; `scroll` only while it scrolls; `none` always shows them.
 */
export type ScrollAreaTrigger = "hover" | "scroll" | "none";

export type ScrollAreaSize = "small" | "medium";

/** The directions the area scrolls in, each with its own scrollbar. */
export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

/**
 * What a scroll does at the end of the area: `none` stops there, with no bounce; `contain` stops
 * there but lets Mac trackpads and iOS bounce the area; `auto` carries on to the page behind.
 */
export type ScrollAreaOverscroll = "none" | "contain" | "auto";

/** Which edges the area is scrolled to: `true` when there is nothing more past that edge. */
export type ScrollAreaEdges = {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
};

/**
 * Room in px the scrollbars keep clear at each end, such as for a sticky
 * header or footer inside the area. `top` and `bottom` shorten the vertical
 * scrollbar, `left` and `right` the horizontal one.
 */
export type ScrollAreaRailInset = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type ScrollAreaScrollToElementOptions = {
  /** Where the element lines up, as in `scrollIntoView`. */
  block?: "start" | "center" | "end" | "nearest";
  /** Room in px kept between the element and that edge, such as a sticky header's height. `center` ignores it. */
  offset?: number;
  behavior?: ScrollBehavior;
};

/** Methods on `actionsRef`. */
export type ScrollAreaActions = {
  /** Scrolls the area, and only the area (never the page), so that `element` inside it is in view. */
  scrollToElement: (element: Element, options?: ScrollAreaScrollToElementOptions) => void;
};

export type ScrollAreaOwnProps = {
  /** Methods to scroll from code that the scroll element doesn't have natively. */
  actionsRef?: Ref<ScrollAreaActions>;
  /** The scrolling content. */
  children?: ReactNode;
  /** Class of the element that wraps `children`. Put padding here, not on the scroll area. */
  contentClassName?: string;
  /** Style of the element that wraps `children`. */
  contentStyle?: CSSProperties;
  /** Fade the content out toward an edge that has more past it. The scrollbars don't fade. */
  fade?: boolean;
  /** How long the scrollbars stay after scrolling stops, in ms. At least 100 with `trigger="scroll"`. */
  hideDelay?: number;
  /** The directions the area scrolls in. Content too wide for a vertical area is cut off. */
  orientation?: ScrollAreaOrientation;
  /**
   * What a scroll that reaches the end does: stop there with no bounce (`none`, the default), stop
   * there but let Mac trackpads and iOS bounce the area (`contain`), or carry on to the page behind
   * (`auto`). Only in the directions the area overflows right now.
   */
  overscroll?: ScrollAreaOverscroll;
  /**
   * Room in px the scrollbars keep clear at each end, such as a sticky header's height, so
   * they don't run over it. Also settable in CSS, on the area itself:
   * `--r-scroll-area-rail-inset-{top,bottom,left,right}`, which don't inherit.
   */
  railInset?: ScrollAreaRailInset;
  /** Thumb thickness: `small` is 5px, `medium` 7px; both grow while pointed at or dragged. */
  size?: ScrollAreaSize;
  /** When the scrollbars show. They always show while scrolling or dragging. */
  trigger?: ScrollAreaTrigger;
  /** Called when the area reaches or leaves an edge, and after mounting when the content overflows. */
  onEdgeChange?: (edges: ScrollAreaEdges) => void;
};

/**
 * The scroll area is the scrolling element itself, so `ref` points at it:
 * call `scrollTo` / `scrollBy` on it, and `onScroll` receives its events.
 */
export type ScrollAreaProps = ScrollAreaOwnProps &
  Omit<ComponentPropsWithRef<"div">, keyof ScrollAreaOwnProps>;

export type ScrollAreaTextareaOwnProps = {
  /** How long the scrollbar stays after scrolling stops, as on ScrollArea. */
  hideDelay?: number;
  /** Whether a scroll that reaches the end carries on to the page, as on ScrollArea. */
  overscroll?: ScrollAreaOverscroll;
  /** Thumb thickness, as on ScrollArea. */
  size?: ScrollAreaSize;
  /** When the scrollbar shows, as on ScrollArea. */
  trigger?: ScrollAreaTrigger;
  /** Class of the wrapper that holds the textarea and its scrollbar. */
  wrapperClassName?: string;
  /** Style of the wrapper; size the textarea itself with `className` / `style`. */
  wrapperStyle?: CSSProperties;
};

/** Native textarea props; `ref`, `className`, `style` and `onScroll` go to the textarea. */
export type ScrollAreaTextareaProps = ScrollAreaTextareaOwnProps &
  Omit<ComponentPropsWithRef<"textarea">, keyof ScrollAreaTextareaOwnProps>;
