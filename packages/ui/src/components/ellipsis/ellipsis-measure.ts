/**
 * Whether the text of an Ellipsis is cut off, and when to look again.
 *
 * The truncation itself is CSS (`text-overflow: ellipsis`, `line-clamp`); this
 * module only answers "did it cut?", for the tooltip and the expand control.
 *
 * - It compares fractional geometry with a 0.5px tolerance. `scrollWidth` and
 *   `clientWidth` are rounded to whole pixels, so at some widths (and at page
 *   zooms) a text that shows an ellipsis reports that it fits.
 * - Every Ellipsis on a page shares one ResizeObserver, one MutationObserver
 *   and one font-loading listener. A web font that finishes loading widens
 *   the text without resizing its box, so no ResizeObserver would notice.
 * - Requests are batched into one animation frame: every instance is read
 *   first, then every result is written, so reads never interleave with
 *   writes and force layout again. A request made while a frame is being
 *   handled is queued for the next one, never dropped.
 */

/** `undefined`: not known yet, or the text has no box (hidden, not laid out). */
export type Truncation = boolean | undefined;

export interface EllipsisMeasureTarget {
  /** The box that clips: it carries `truncate` or `line-clamp`. */
  text: HTMLElement;
  /** The inline span around the children, inside `text`. */
  content: HTMLElement;
  /** Elements whose size changes the room left for the text (before/after). */
  extra: () => Array<Element | null | undefined>;
  /** How many lines the text may take; 1 compares widths, more compares heights. */
  lines: () => number;
  commit: (truncated: Truncation) => void;
}

/** Overflow smaller than this is rounding, not a cut. */
export const TOLERANCE = 0.5;

/**
 * Reads whether `content` overflows `text`. `text` must have no padding or
 * border (its border box is its content box).
 */
export function measureTruncation(
  text: HTMLElement,
  content: HTMLElement,
  lines: number,
): Truncation {
  if (!text.isConnected) return undefined;
  const box = text.getBoundingClientRect();
  if (box.width === 0 && box.height === 0) return undefined;
  const rects = Array.from(content.getClientRects());
  if (rects.length === 0) return false;

  if (lines <= 1) {
    let left = Infinity;
    let right = -Infinity;
    for (const rect of rects) {
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
    }
    return right > box.right + TOLERANCE || left < box.left - TOLERANCE;
  }

  // A clamped line is still laid out, below the box. Count a line as hidden
  // when its middle is past the bottom edge, so a glyph box taller than a
  // tight line-height does not count as a cut.
  return rects.some((rect) => rect.top + rect.height / 2 > box.bottom + TOLERANCE);
}

const targets = new Set<EllipsisMeasureTarget>();
const byElement = new WeakMap<Element, EllipsisMeasureTarget>();
const pending = new Set<EllipsisMeasureTarget>();
let frame = 0;
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;
let fontsListening = false;

function flush() {
  frame = 0;
  const batch = Array.from(pending);
  pending.clear();
  const results = batch.map(
    (target) => [target, measureTruncation(target.text, target.content, target.lines())] as const,
  );
  for (const [target, truncated] of results) {
    if (targets.has(target)) target.commit(truncated);
  }
}

/** Asks for `target` to be measured in the next frame. */
export function scheduleMeasure(target: EllipsisMeasureTarget) {
  if (!targets.has(target)) return;
  pending.add(target);
  if (frame === 0 && typeof requestAnimationFrame === "function") {
    frame = requestAnimationFrame(flush);
  }
}

function scheduleAll() {
  for (const target of targets) scheduleMeasure(target);
}

function ownerOf(node: Node | null): EllipsisMeasureTarget | undefined {
  for (let current = node; current; current = current.parentNode) {
    const target = current instanceof Element ? byElement.get(current) : undefined;
    if (target) return target;
  }
  return undefined;
}

function observers(view: Window & typeof globalThis) {
  if (!resizeObserver && "ResizeObserver" in view) {
    resizeObserver = new view.ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = byElement.get(entry.target);
        if (target) scheduleMeasure(target);
      }
    });
  }
  if (!mutationObserver && "MutationObserver" in view) {
    mutationObserver = new view.MutationObserver((records) => {
      for (const record of records) {
        const target = ownerOf(record.target);
        if (target) scheduleMeasure(target);
      }
    });
  }
  const fonts = view.document.fonts as FontFaceSet | undefined;
  if (!fontsListening && fonts && typeof fonts.addEventListener === "function") {
    fonts.addEventListener("loadingdone", scheduleAll);
    fontsListening = true;
  }
}

/**
 * Starts watching `target`: its text box, the extra elements beside it, its
 * children and the page's fonts. Measures it once now. Returns the cleanup.
 */
export function observeTruncation(target: EllipsisMeasureTarget) {
  const view = target.text.ownerDocument.defaultView;
  if (!view) return () => undefined;
  observers(view);
  targets.add(target);
  const watched = [target.text, ...target.extra().filter((el): el is Element => el != null)];
  for (const element of watched) {
    byElement.set(element, target);
    resizeObserver?.observe(element);
  }
  byElement.set(target.content, target);
  mutationObserver?.observe(target.content, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  scheduleMeasure(target);

  return () => {
    targets.delete(target);
    pending.delete(target);
    for (const element of watched) {
      if (byElement.get(element) === target) byElement.delete(element);
      resizeObserver?.unobserve(element);
    }
    if (byElement.get(target.content) === target) byElement.delete(target.content);
    // A MutationObserver cannot stop watching one node; records for a node
    // no longer registered find no owner and are ignored. Once nothing is
    // watched, disconnect it so detached subtrees are not kept alive.
    if (targets.size === 0) {
      mutationObserver?.disconnect();
      mutationObserver = undefined;
    }
  };
}
