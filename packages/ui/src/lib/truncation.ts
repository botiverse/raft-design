import { flushSync } from "react-dom";
import { ownerWindow } from "./owner-window";

/**
 * Whether a text is cut off, and when to look again: the one way raft-ui
 * measures truncation (Ellipsis, `useTruncated`, and the `title` that
 * fields give a cut value).
 *
 * The truncation itself is CSS (`text-overflow: ellipsis`, `line-clamp`);
 * this module only answers "did it cut?".
 *
 * - It compares fractional geometry with a 0.5px tolerance. `scrollWidth` and
 *   `clientWidth` are whole pixels, so at some widths (and page zooms) a text
 *   that shows an ellipsis reports that it fits.
 * - Every measured element of a window shares one ResizeObserver, one
 *   MutationObserver and one font-loading listener. A web font that finishes
 *   loading widens the text without resizing its box, which no
 *   ResizeObserver would notice. Each window has its own (an element rendered
 *   into another window under PortalContainerProvider): an observer reports,
 *   and a frame runs, in its own window's rendering cycle, and the page's
 *   stops while the page's window is hidden.
 * - Requests are batched into one animation frame of the window, before paint: every
 *   target is isolated (an Ellipsis hides its `after` so the text is measured
 *   alone), then every target is read, then restored, then every result is
 *   committed in one synchronous React update. Reads never interleave with
 *   writes, and a result shows in the same frame it was measured in. A
 *   request made while a frame is handled is queued for the next one.
 */

/** `undefined`: not known yet, or the element has no box (hidden, not laid out). */
export type Truncation = boolean | undefined;

export interface TruncationTarget {
  /** Elements whose size changes the answer. The first one is required. */
  observe: () => Array<Element | null | undefined>;
  /** Where a change to the text is watched (subtree). */
  watch: () => Node | null | undefined;
  /** Puts the target in the state it is measured in; returns the undo. */
  isolate?: () => () => void;
  read: () => Truncation;
  commit: (truncated: Truncation) => void;
}

/** Overflow smaller than this is rounding, not a cut. */
export const TOLERANCE = 0.5;

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function contentBox(element: Element): Box | undefined {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return undefined;
  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);
  const px = (value: string | undefined) => Number.parseFloat(value ?? "") || 0;
  return {
    left: rect.left + px(style?.borderLeftWidth) + px(style?.paddingLeft),
    right: rect.right - px(style?.borderRightWidth) - px(style?.paddingRight),
    top: rect.top + px(style?.borderTopWidth) + px(style?.paddingTop),
    bottom: rect.bottom - px(style?.borderBottomWidth) - px(style?.paddingBottom),
  };
}

/**
 * Whether laid-out text `rects` overflow `box`: past either inline edge, or
 * on a line whose middle is below the bottom edge (a clamped line is still
 * laid out, below the box; the middle, not the top, so a glyph box taller
 * than a tight line-height does not count as a cut).
 */
function overflows(rects: ArrayLike<DOMRect>, box: Box) {
  for (const rect of Array.from(rects)) {
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > box.right + TOLERANCE || rect.left < box.left - TOLERANCE) return true;
    if (rect.top + rect.height / 2 > box.bottom + TOLERANCE) return true;
  }
  return false;
}

/** Whether the text inside `element` overflows its content box. */
export function measureElement(element: Element): Truncation {
  if (!element.isConnected) return undefined;
  const box = contentBox(element);
  if (!box) return undefined;
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  return overflows(range.getClientRects(), box);
}

/**
 * Whether the inline `content` overflows `text`, the box that clips it.
 * Used where `text` holds more than the content (an Ellipsis's floats).
 */
export function measureContent(text: Element, content: Element): Truncation {
  if (!text.isConnected) return undefined;
  const box = contentBox(text);
  if (!box) return undefined;
  return overflows(content.getClientRects(), box);
}

/** Isolates, reads and restores one target now, outside the batch. */
export function readNow(target: TruncationTarget): Truncation {
  const restore = target.isolate?.();
  try {
    return target.read();
  } finally {
    restore?.();
  }
}

type View = Window & typeof globalThis;

/** What the measurer keeps for one window. */
interface Measurer {
  view: View;
  targets: Set<TruncationTarget>;
  pending: Set<TruncationTarget>;
  frame: number;
  resizeObserver?: ResizeObserver;
  mutationObserver?: MutationObserver;
  fontsListening: boolean;
}

const measurers = new WeakMap<Window, Measurer>();
const measurerOf = new WeakMap<TruncationTarget, Measurer>();
const byElement = new WeakMap<Node, TruncationTarget>();

function measurerFor(view: View): Measurer {
  let measurer = measurers.get(view);
  if (!measurer) {
    measurer = { view, targets: new Set(), pending: new Set(), frame: 0, fontsListening: false };
    measurers.set(view, measurer);
  }
  return measurer;
}

function flush(measurer: Measurer) {
  measurer.frame = 0;
  const { pending, targets } = measurer;
  const batch = Array.from(pending).filter((target) => targets.has(target));
  pending.clear();
  const restores = batch.map((target) => target.isolate?.());
  const results = batch.map((target) => target.read());
  for (const restore of restores) restore?.();
  flushSync(() => {
    batch.forEach((target, index) => {
      if (targets.has(target)) target.commit(results[index]);
    });
  });
}

/** Asks for `target` to be measured in the next frame, before it paints. */
export function scheduleMeasure(target: TruncationTarget) {
  const measurer = measurerOf.get(target);
  if (!measurer?.targets.has(target)) return;
  measurer.pending.add(target);
  const { view } = measurer;
  if (measurer.frame === 0 && typeof view.requestAnimationFrame === "function") {
    measurer.frame = view.requestAnimationFrame(() => flush(measurer));
  }
}

function scheduleAll(measurer: Measurer) {
  for (const target of measurer.targets) scheduleMeasure(target);
}

function ownerOf(node: Node | null): TruncationTarget | undefined {
  for (let current = node; current; current = current.parentNode) {
    const target = byElement.get(current);
    if (target) return target;
  }
  return undefined;
}

function observers(measurer: Measurer) {
  const { view } = measurer;
  if (!measurer.resizeObserver && "ResizeObserver" in view) {
    measurer.resizeObserver = new view.ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = byElement.get(entry.target);
        if (target) scheduleMeasure(target);
      }
    });
  }
  if (!measurer.mutationObserver && "MutationObserver" in view) {
    measurer.mutationObserver = new view.MutationObserver((records) => {
      for (const record of records) {
        const target = ownerOf(record.target);
        if (target) scheduleMeasure(target);
      }
    });
  }
  const fonts = (view.document as Document & { fonts?: FontFaceSet }).fonts;
  if (!measurer.fontsListening && fonts && typeof fonts.addEventListener === "function") {
    fonts.addEventListener("loadingdone", () => scheduleAll(measurer));
    measurer.fontsListening = true;
  }
}

/**
 * Starts watching `target`: the elements it names, the text under `watch`
 * and the fonts of their window. Measures it in the next frame. Returns the cleanup.
 */
export function observeTruncation(target: TruncationTarget) {
  const observed = target.observe().filter((element): element is Element => element != null);
  const first = observed[0];
  if (!first || typeof window === "undefined") return () => undefined;
  // The first element's window: its frames, observers and fonts.
  const measurer = measurerFor(ownerWindow(first));
  const { targets } = measurer;
  observers(measurer);
  targets.add(target);
  measurerOf.set(target, measurer);
  for (const element of observed) {
    byElement.set(element, target);
    measurer.resizeObserver?.observe(element);
  }
  const watched = target.watch();
  if (watched) {
    byElement.set(watched, target);
    measurer.mutationObserver?.observe(watched, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
  scheduleMeasure(target);

  return () => {
    targets.delete(target);
    measurer.pending.delete(target);
    for (const element of observed) {
      if (byElement.get(element) === target) byElement.delete(element);
      measurer.resizeObserver?.unobserve(element);
    }
    if (watched && byElement.get(watched) === target) byElement.delete(watched);
    // A MutationObserver cannot stop watching one node; records for a node
    // no longer registered find no owner and are ignored. Once nothing is
    // watched, disconnect it so detached subtrees are not kept alive.
    if (targets.size === 0) {
      measurer.mutationObserver?.disconnect();
      measurer.mutationObserver = undefined;
    }
  };
}
