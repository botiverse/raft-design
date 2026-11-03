import type {
  ComponentPropsWithRef,
  CSSProperties,
  ReactNode,
  Ref,
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

/** What every ScrollArea part shares: how the scrollbars look and behave. Set on `ScrollAreaRoot` (or `ScrollArea`). */
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

/**
 * What `renderContainer` gets, and `useScrollAreaContainer` returns: what to put on the element
 * that scrolls (the container) so that ScrollArea measures it and its gutters follow it.
 */
export type ScrollAreaContainerBinding<E extends HTMLElement = HTMLElement> = {
  /** Put it (merged with yours) on the element that scrolls. */
  ref: RefObject<E | null>;
  /**
   * For the container, before your own classes. With sticky gutters the container is the root, so
   * these are the root's classes and modifiers too.
   */
  className: string;
  /** For the container, merged with your style: with sticky gutters, the root's variables (`railInset`, the timelines). */
  style: CSSProperties | undefined;
  /** `0` while there is something to scroll, so the container is a tab stop; else `undefined`. */
  tabIndex: 0 | undefined;
  /** Measures again now, for a size change nothing observed reports (a textarea's input). */
  measure: () => void;
  /** Where to put `<ScrollAreaGutters />`: the container's first child (`sticky`) or right after it (`absolute`). */
  guttersPosition: ScrollAreaGuttersPosition;
};

/**
 * The binding `renderContainer` gets: its `ref` fits any element's `ref` (a `<ul>`, a `<textarea>`,
 * VirtualList's `domRef`), as the demo's `containerDomRef: RefObject<any>` does.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- the container is whatever element the caller renders.
export type ScrollAreaRenderContainerBinding = ScrollAreaContainerBinding<any>;

export type ScrollAreaOwnProps = ScrollAreaOptions & {
  /** The scrolling content, in ScrollArea's own container. Not read with `renderContainer`. */
  children?: ReactNode;
  /** Where the gutters go: inside the container (`sticky`, the default) or beside it in a frame (`absolute`). */
  guttersPosition?: ScrollAreaGuttersPosition;
  /**
   * Renders the container yourself, in place of ScrollArea's `<div>`: a `<textarea>`, a list, another
   * component's own scroller (VirtualList's `domRef`). Put the binding on the element that scrolls
   * and `<ScrollAreaGutters />` where `guttersPosition` says: as its first child (`sticky`) or
   * right after it (`absolute`, inside the frame ScrollArea renders around what this returns).
   * ScrollArea listens to the container's scroll itself. The demo's `useContainer`.
   */
  renderContainer?: (container: ScrollAreaRenderContainerBinding) => ReactNode;
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
 * `sticky` gutters, the default, it is the root too); `className` and `style` to the root. With
 * `renderContainer`, the native props go to the frame (`absolute`) and are not read (`sticky`).
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
