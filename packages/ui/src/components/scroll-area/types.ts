import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
  Ref,
  RefCallback,
  RefObject,
  UIEventHandler,
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
  /** Scrolls the container, and only the container (never the page), so that `element` inside it is in view. */
  scrollToElement: (element: Element, options?: ScrollAreaScrollToElementOptions) => void;
  /** Measures the container again now, for a size change nothing observed reports. */
  measure: () => void;
};

/** How the scrollbars look and behave: set on `ScrollArea`, or passed to `useScrollAreaContainer`. */
export type ScrollAreaOptions = {
  /** Methods to scroll from code that the container doesn't have natively. */
  actionsRef?: Ref<ScrollAreaActions>;
  /** Fade the content out toward an edge that has more past it. The scrollbars don't fade. */
  fade?: boolean;
  /** How long the scrollbars stay after scrolling stops, in ms. At least 100 with `trigger="scroll"`. */
  hideDelay?: number;
  /** The directions the area scrolls in. Content too wide for a vertical area is cut off. */
  orientation?: ScrollAreaOrientation;
  /**
   * What a scroll that reaches the end does: stop there with no bounce (`none`, the default), stop
   * there but let Mac trackpads and iOS bounce the area (`contain`), or carry on to the page behind
   * (`auto`, which leaves the container's own `overscroll-behavior` alone). Only in the directions
   * the area overflows right now.
   */
  overscroll?: ScrollAreaOverscroll;
  /**
   * Room in px the scrollbars keep clear at each end, such as a sticky header's height, so
   * they don't run over it. Also settable in CSS, on the root:
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
 * Where the gutters (the scrollbars) go. `sticky`: inside the container, as its first child, a
 * zero-height layer stuck to the top of the viewport; the container is the root, with no frame
 * around it. `absolute`: beside the container, a layer laid over a positioned frame (the root)
 * that holds both; for a container that can't hold children (a textarea).
 */
export type ScrollAreaGuttersPosition = "sticky" | "absolute";

/** What `useScrollAreaContainer` takes: ScrollArea's options, where the gutters go, and your refs. */
export type ScrollAreaContainerOptions<E extends HTMLElement = HTMLElement> = ScrollAreaOptions & {
  /** Your ref to the element that scrolls: `containerProps.ref` forwards to it. */
  containerRef?: Ref<E> | undefined;
  /** With absolute gutters, your ref to the frame: `frameProps.ref` forwards to it. */
  frameRef?: Ref<HTMLDivElement> | undefined;
  /** Where the gutters go: inside the container (`sticky`, the default) or beside it in a frame (`absolute`). */
  guttersPosition?: ScrollAreaGuttersPosition;
  /**
   * An element whose size is the content's, watched for size changes (such as a hidden mirror of a
   * textarea's text). Without it each element child of the container is watched, and children
   * added or removed.
   */
  contentRef?: RefObject<HTMLElement | null>;
  /**
   * With `fade` and sticky gutters, the element the fade masks: a content element inside the
   * container (`ScrollAreaContent`), since the mask can't sit on a container that holds the
   * gutters. With absolute gutters the container itself is masked and this isn't read.
   */
  fadeRef?: RefObject<HTMLElement | null>;
};

/**
 * What to spread on the element that scrolls (the container), merged with your own `className`
 * and `style`, so the area measures it and its gutters follow it.
 */
export type ScrollAreaContainerProps<E extends HTMLElement = HTMLElement> = {
  /**
   * Put it on the element that scrolls (it fits any element's `ref` and VirtualList's `domRef`).
   * It forwards to the `containerRef` you pass, so there is nothing to merge.
   */
  ref: RefCallback<E>;
  /**
   * Before your own classes. With sticky gutters the container is the root, so these are the
   * root's classes and modifiers; with absolute gutters, `r-scroll-area__container`.
   */
  className: string;
  /** With sticky gutters, the root's variables (`railInset`, the timelines); merge your style after it. */
  style: CSSProperties | undefined;
  /** `0` while there is something to scroll, so the container is a tab stop; else `undefined`. */
  tabIndex: 0 | undefined;
};

/** With absolute gutters, what to spread on the positioned frame (the root) around the container and the gutters. */
export type ScrollAreaFrameProps = {
  /** It forwards to the `frameRef` you pass. */
  ref: RefCallback<HTMLDivElement>;
  /** The root's classes and modifiers, before your own (size and frame the area there). */
  className: string;
  /** The root's variables (`railInset`, the timelines); merge your style after it. */
  style: CSSProperties;
};

/** What `<ScrollAreaGutters />` draws from: spread `useScrollAreaContainer`'s `guttersProps`, never built by hand. */
export type ScrollAreaGuttersProps = {
  /** The container the gutters scroll. */
  containerRef: RefObject<HTMLElement | null>;
  /** The gutters layer. */
  guttersRef: RefObject<HTMLDivElement | null>;
  /** Which axes have a gutter now: one with something to scroll. */
  rails: { xRail: boolean; yRail: boolean };
  /** The vertical thumb, which the area sizes and moves. */
  yThumbRef: RefObject<HTMLDivElement | null>;
  /** The horizontal thumb. */
  xThumbRef: RefObject<HTMLDivElement | null>;
  /** Called when a thumb drag starts and ends. */
  onDraggingChange: (dragging: boolean) => void;
};

/**
 * What `useScrollAreaContainer` returns: props to spread on the elements you render (the
 * container, the frame with absolute gutters, `<ScrollAreaGutters />`), and the area's methods.
 */
export type ScrollAreaContainer<E extends HTMLElement = HTMLElement> = {
  /** Spread on the element that scrolls. */
  containerProps: ScrollAreaContainerProps<E>;
  /** With absolute gutters, spread on the frame around the container and the gutters; `undefined` with sticky gutters. */
  frameProps: ScrollAreaFrameProps | undefined;
  /** Spread on `<ScrollAreaGutters />`. */
  guttersProps: ScrollAreaGuttersProps;
  /** Where to put the gutters: the container's first child (`sticky`) or right after it (`absolute`). */
  guttersPosition: ScrollAreaGuttersPosition;
  /** Measures again now, for a size change nothing observed reports (a textarea's input). */
  measure: () => void;
  /** Scrolls the container, and only the container, so that `element` inside it is in view. */
  scrollToElement: (element: Element, options?: ScrollAreaScrollToElementOptions) => void;
  /** Whether either axis has something to scroll now. */
  scrollable: boolean;
};

export type ScrollAreaOwnProps = ScrollAreaOptions & {
  /** The scrolling content, in ScrollArea's own container. */
  children?: ReactNode;
  /** Where the gutters go: inside the container (`sticky`, the default) or beside it in a frame (`absolute`). */
  guttersPosition?: ScrollAreaGuttersPosition;
  /**
   * An element whose size is the content's, watched for size changes (such as a hidden mirror of a
   * textarea's text). Without it each element child of the container is watched, and children
   * added or removed.
   */
  contentRef?: RefObject<HTMLElement | null>;
  /** Class of the root: the container (`sticky`) or the frame (`absolute`). Size and frame the area here. */
  className?: string;
  /** Style of the root. */
  style?: CSSProperties;
  /** The root: the container itself (`sticky`) or the frame (`absolute`). */
  rootRef?: Ref<HTMLDivElement>;
  /** Class of ScrollArea's own container; with `sticky` the same element as the root. */
  containerClassName?: string;
  /** Style of ScrollArea's own container. */
  containerStyle?: CSSProperties;
  /**
   * Class of a content element around `children`, inside the container: put padding here, so the
   * scrollbars stay at the edges. Only with it, `contentStyle` or `fade` (sticky) is there one.
   */
  contentClassName?: string;
  /** Style of the content element; renders it, as `contentClassName` does. */
  contentStyle?: CSSProperties;
  /** The container's scroll events. */
  onScroll?: UIEventHandler<HTMLDivElement>;
  /** The container's: by default `0` while there is something to scroll. */
  tabIndex?: number;
};

/**
 * `ref` and the native props go to ScrollArea's own container, the element that scrolls (with
 * `sticky` gutters, the default, it is the root too); `className` and `style` to the root.
 */
export type ScrollAreaProps = ScrollAreaOwnProps &
  Omit<ComponentPropsWithRef<"div">, keyof ScrollAreaOwnProps>;

/** An optional box around the content, inside the container: native div props and `ref`. */
export type ScrollAreaContentProps = ComponentPropsWithRef<"div">;

export type ScrollAreaTextareaOwnProps = {
  /** How long the scrollbar stays after scrolling stops, as on ScrollArea. */
  hideDelay?: number;
  /** Whether a scroll that reaches the end carries on to the page, as on ScrollArea. */
  overscroll?: ScrollAreaOverscroll;
  /** Thumb thickness, as on ScrollArea. */
  size?: ScrollAreaSize;
  /** When the scrollbar shows, as on ScrollArea. */
  trigger?: ScrollAreaTrigger;
  /** Class of the root that holds the textarea and its scrollbar. */
  wrapperClassName?: string;
  /** Style of the root; size the textarea itself with `className` / `style`. */
  wrapperStyle?: CSSProperties;
};

/** Native textarea props; `ref`, `className`, `style` and `onScroll` go to the textarea. */
export type ScrollAreaTextareaProps = ScrollAreaTextareaOwnProps &
  Omit<ComponentPropsWithRef<"textarea">, keyof ScrollAreaTextareaOwnProps>;
