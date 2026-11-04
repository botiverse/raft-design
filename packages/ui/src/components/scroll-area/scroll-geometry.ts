/** What the scrollbars need to know about the scroll container, in px. */
export type ScrollMetrics = {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
  scrollTop: number;
  /** Distance from the inline start: `scrollLeft` is negative in right-to-left layouts. */
  scrollLeft: number;
};

export type ScrollAxis = "x" | "y";

/** A scrollbar's thumb as fractions of its rail: `thumbLength` and `thumbOffset` turn them into px. */
export type ThumbPlacement = {
  /** Thumb length / rail length: the visible share of the content. */
  ratio: number;
  /** 0 at the start, 1 at the end. */
  progress: number;
};

export function readScrollMetrics(element: HTMLElement): ScrollMetrics {
  return {
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    scrollLeft: Math.abs(element.scrollLeft),
    scrollTop: element.scrollTop,
    scrollWidth: element.scrollWidth,
  };
}

/**
 * Where the thumb of one axis goes, or `null` when that axis has nothing to
 * scroll. One pixel of overflow is ignored: it is usually rounding.
 */
export function thumbPlacement(metrics: ScrollMetrics, axis: ScrollAxis): ThumbPlacement | null {
  const client = axis === "y" ? metrics.clientHeight : metrics.clientWidth;
  const scroll = axis === "y" ? metrics.scrollHeight : metrics.scrollWidth;
  const offset = axis === "y" ? metrics.scrollTop : metrics.scrollLeft;
  const overflow = scroll - client;
  if (client <= 0 || overflow <= 1) return null;
  return {
    progress: Math.min(1, Math.max(0, offset / overflow)),
    ratio: client / scroll,
  };
}

/** The thumb's length in px: its share of the rail, at least `min`, and never longer than the rail. */
export function thumbLength(ratio: number, rail: number, min: number): number {
  return Math.max(0, Math.min(rail, Math.max(min, ratio * rail)));
}

/** How far down (or along) its rail a thumb of `length` px starts, in px. */
export function thumbOffset(progress: number, rail: number, length: number): number {
  return Math.max(0, rail - length) * progress;
}

/** How many px are left to scroll past each edge; 0 on an axis that doesn't scroll. */
export type ScrollOverflow = {
  yStart: number;
  yEnd: number;
  /** The inline start: the left edge, or the right one in right-to-left layouts. */
  xStart: number;
  xEnd: number;
};

/** The px left past each edge of the axes that have a thumb (`thumbPlacement` isn't `null`). */
export function scrollOverflow(
  metrics: ScrollMetrics,
  axes: Record<ScrollAxis, boolean>,
): ScrollOverflow {
  const [yStart, yEnd] = axes.y
    ? remaining(metrics.scrollTop, metrics.scrollHeight - metrics.clientHeight)
    : [0, 0];
  const [xStart, xEnd] = axes.x
    ? remaining(metrics.scrollLeft, metrics.scrollWidth - metrics.clientWidth)
    : [0, 0];
  return { xEnd, xStart, yEnd, yStart };
}

function remaining(offset: number, overflow: number): [start: number, end: number] {
  const start = Math.min(overflow, Math.max(0, offset));
  return [start, overflow - start];
}

/** An edge has more content past it once at least a pixel is left; less is rounding. */
export function overflows(remainingPx: number): boolean {
  return remainingPx >= 1;
}

/**
 * How far a click on the rail pages: most of a viewport, keeping a strip of
 * the previous page in view, as browsers do for Page Down.
 */
export function pageDistance(client: number): number {
  return Math.round(client * 0.875);
}

/** -1 when the pointer is before the thumb, 1 after it, 0 on it. */
export function pageDirection(pointer: number, thumbStart: number, thumbEnd: number): -1 | 0 | 1 {
  if (pointer < thumbStart) return -1;
  if (pointer > thumbEnd) return 1;
  return 0;
}
