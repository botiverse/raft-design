/*
 * The space the mounted rows take in the list, read from layout.
 */

/**
 * Where each in-flow row starts in the visible-items element `container`, and where the rows end: in one
 * pass of reads, no writes, so the browser lays out at most once.
 *
 * `starts[i]` is the top of the border box of `rows[i]` (in document order), relative to the container's
 * padding edge; `end` is the container's inner height. The container is a block formatting context
 * (`display: flow-root`, see `virtual-list-constants.ts`) and `position: relative`, so it is the rows' offsetParent, the
 * first row's top margin and the last row's bottom margin stay inside it, and between two rows sits their
 * collapsed margin, whatever the consumer's CSS (a child's margins collapsing through a row included).
 *
 * Read from the boxes' rects (sub-pixel, so a span does not change with the rounding of its position), but
 * checked against the layout's own `offsetTop` / `clientHeight` (whole pixels, and blind to transforms):
 * where they disagree by more than a pixel, a transform is at work (the row's own, say an entrance
 * animation, or a scale on an ancestor, say a dialog zooming in) and the layout's value is used, since
 * the rows are laid out, and measured again on resize, without it.
 *
 * A row that is not laid out (`display: none`, so no offsetParent) takes no space: it starts where the
 * next one does.
 */
export function measureRowStarts(
  container: HTMLElement,
  rows: readonly HTMLElement[],
): { starts: number[]; end: number } {
  const frame = readFrame(container);
  const starts: (number | null)[] = rows.map((row: HTMLElement) => readRowStart(frame, row));
  let next = frame.end;
  for (let i = starts.length - 1; i >= 0; --i) {
    next = starts[i] ??= next;
  }
  return { starts: starts as number[], end: frame.end };
}

/** Where `row` starts in `container` (see `measureRowStarts`); 0 when it is not laid out. */
export function measureRowStart(container: HTMLElement, row: HTMLElement): number {
  return readRowStart(readFrame(container), row) ?? 0;
}

interface Frame {
  container: HTMLElement;
  /** A transform scales the container: rects are not in layout pixels. */
  scaled: boolean;
  /** The top of the container's padding box, in the viewport. */
  innerTop: number;
  end: number;
}

function readFrame(container: HTMLElement): Frame {
  const rect = container.getBoundingClientRect();
  const layoutHeight = container.offsetHeight;
  const scaled = Math.abs(rect.height - layoutHeight) > 1;
  const borderY = layoutHeight - container.clientHeight;
  return {
    container,
    scaled,
    innerTop: rect.top + container.clientTop,
    end: scaled ? container.clientHeight : toLayoutUnit(rect.height - borderY),
  };
}

function readRowStart({ container, scaled, innerTop }: Frame, row: HTMLElement): number | null {
  if (row.offsetParent !== container) {
    return null;
  }
  const layoutTop = row.offsetTop;
  if (scaled) {
    return layoutTop;
  }
  const rectTop = toLayoutUnit(row.getBoundingClientRect().top - innerTop);
  return Math.abs(rectTop - layoutTop) > 1 ? layoutTop : rectTop;
}

/**
 * The space each of `rows` takes: from where it starts to where the next one starts, the last one to the
 * end of the rows (see `measureRowStarts`). So the collapsed margin between two rows belongs to the upper
 * one, and the spans add up to the rows' laid-out height from the first row's border box on. `firstStart`
 * is where the first row starts (its top margin, plus the margins of its first children that collapse
 * through it): space before the rows that no span holds (the list keeps it apart, see VirtualList's
 * `leadingMarginRef` and `applyLayoutStyles`).
 */
export function measureRowSpans(
  container: HTMLElement,
  rows: readonly HTMLElement[],
): { spans: number[]; firstStart: number } {
  const { starts, end } = measureRowStarts(container, rows);
  const spans = starts.map(
    (start: number, i: number) => (i + 1 < starts.length ? starts[i + 1]! : end) - start,
  );
  return { spans, firstStart: starts[0] ?? 0 };
}

/**
 * Rounded to 1/64px, the unit browsers lay out in: rect differences carry floating-point noise (with page
 * zoom), and a size that differs from the cached one by noise alone would count as a resize.
 */
function toLayoutUnit(value: number): number {
  return Math.round(value * 64) / 64;
}
