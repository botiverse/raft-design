import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
  UIEvent,
} from "react";

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

/** Options of `useScrollAreaRails`: ScrollArea's scrollbar props, for an element that scrolls itself. */
export type ScrollAreaRailsOptions<E extends HTMLElement = HTMLElement> = {
  /** The directions the element scrolls in, each with its own scrollbar. */
  orientation?: ScrollAreaOrientation;
  /** When the scrollbars show, as on ScrollArea. */
  trigger?: ScrollAreaTrigger;
  /** Thumb thickness, as on ScrollArea. */
  size?: ScrollAreaSize;
  /** How long the scrollbars stay after scrolling stops, as on ScrollArea. */
  hideDelay?: number;
  /**
   * What a scroll that reaches the end does, as on ScrollArea (`none` by default). `auto` adds no
   * `overscroll-behavior`, so the element keeps its own.
   */
  overscroll?: ScrollAreaOverscroll;
  /** Room in px the scrollbars keep clear at each end, as on ScrollArea. */
  railInset?: ScrollAreaRailInset;
  /** Called when the element reaches or leaves an edge, as on ScrollArea. */
  onEdgeChange?: (edges: ScrollAreaEdges) => void;
  /** Called from the returned `onScroll`, after the scrollbars have followed. */
  onScroll?: (event: UIEvent<E>) => void;
  /**
   * The element that holds the rails when the scroller can't (a `<textarea>`): a wrapper whose
   * direct child is the scroller, filling it. Without it the scroller holds them.
   */
  wrapperRef?: RefObject<HTMLElement | null>;
  /** The scroller's content, watched for size changes; the scroller itself when absent. */
  contentRef?: RefObject<HTMLElement | null>;
  /**
   * Also watch every element child of the scroller for size changes, and children added or
   * removed: for a scroller whose content isn't one element, such as a list with a header.
   */
  observeChildren?: boolean;
  /** Off: no scrollbars, nothing measured or written; `onScroll` only calls the option's. Default on. */
  enabled?: boolean;
};

/** What `useScrollAreaRails` hands back to put on the scroller (or the wrapper). */
export type ScrollAreaRailsResult<E extends HTMLElement = HTMLElement> = {
  /** For the element that holds the rails (the scroller, or `wrapperRef`'s): the block and its modifiers. */
  className: string | undefined;
  /** For the same element: `railInset` as CSS variables. Merge it with your own style. */
  style: CSSProperties | undefined;
  /** With `wrapperRef`: for the scroller, which hides its native scrollbar and takes `overscroll`. */
  scrollerClassName: string | undefined;
  /** Call it from the scroller's scroll handler (or pass it as `onScroll`). */
  onScroll: (event: UIEvent<E>) => void;
  /** The scrollbars: the first child of the scroller, or a child of the wrapper. `null` when off. */
  rails: ReactNode;
  /** Measures again now, for a size change nothing observed reports. */
  measure: () => void;
  /** Whether there is something to scroll, so the element should be a tab stop. */
  scrollable: boolean;
};
