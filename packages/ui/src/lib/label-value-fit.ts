import { useLayoutEffect } from "react";

/** The narrowest the label column gets: `minmax(88px, max-content)` in both lists. */
const minLabelColumn = 88;

/**
 * The narrowest the value column may be beside its labels: as wide as a label
 * may grow (`max-w-40`). A value column narrower than its label column reads
 * as the label's footnote, not its answer.
 */
const minValueColumn = 160;

export type LabelValueParts = {
  /** Selects the list's labels, relative to the list (`:scope > …`). */
  label: string;
  /** Selects the list's values, relative to the list. */
  value: string;
};

/**
 * Reads every element's width with nothing wrapping inside it: all of them
 * go to one-line layout, are read in one pass and get their inline style
 * back, so the list is laid out once for the read, not once per element.
 */
function oneLineWidths(els: HTMLElement[]): number[] {
  const saved = els.map(({ style }) => [
    style.width,
    style.maxWidth,
    style.whiteSpace,
    style.flexWrap,
  ]);
  for (const { style } of els) {
    style.width = "max-content";
    style.maxWidth = "none";
    style.whiteSpace = "nowrap";
    style.flexWrap = "nowrap";
  }
  const widths = els.map((el) => el.getBoundingClientRect().width);
  els.forEach(({ style }, i) => {
    [style.width, style.maxWidth, style.whiteSpace, style.flexWrap] = saved[i]!;
  });
  return widths;
}

/**
 * Reads each value's narrowest width: its widest piece that can't break, in
 * one pass like `oneLineWidths`. That is a chip (`whitespace-nowrap`), or a
 * long word (an ID, a SHA, a URL) unless it may break anywhere
 * (`overflow-wrap: anywhere`): `wrap-break-word` doesn't lower it,
 * and a flex value's pieces are laid out no narrower than it.
 */
function minContentWidths(els: HTMLElement[]): number[] {
  const saved = els.map(({ style }) => [style.width, style.maxWidth]);
  for (const { style } of els) {
    style.width = "min-content";
    style.maxWidth = "none";
  }
  const widths = els.map((el) => el.getBoundingClientRect().width);
  els.forEach(({ style }, i) => {
    [style.width, style.maxWidth] = saved[i]!;
  });
  return widths;
}

/**
 * Whether a two-column label/value list has to put its labels above their
 * values: some value doesn't fit on one line beside the label column, but
 * would on a line of its own; or the value column would be narrower than
 * `minValueColumn`; or some value has a piece that can't break (a chip, a
 * long word) wider than the value column but no wider than the list, so
 * beside the label it would be cut or run past its column. A value too long
 * for a line of its own (a paragraph, a row of chips wider than the list)
 * wraps either way and doesn't decide by its whole width; its widest
 * unbreakable piece still does. Measured in one-line layout and at min-content whatever the list
 * shows now, so the answer depends only on the list's width and its content
 * and can't flap at the boundary.
 */
export function labelsGoAbove(list: HTMLElement, parts: LabelValueParts): boolean {
  const style = getComputedStyle(list);
  const width = list.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const gap = parseFloat(style.columnGap) || 0;
  const labels = Array.from(list.querySelectorAll<HTMLElement>(parts.label));
  const values = Array.from(list.querySelectorAll<HTMLElement>(parts.value));
  // Each label's cap (max-w-40), read before the measurement lifts it.
  const caps = labels.map((label) => parseFloat(getComputedStyle(label).maxWidth));
  const widths = oneLineWidths([...labels, ...values]);
  let labelColumn = minLabelColumn;
  labels.forEach((_, i) => {
    const natural = widths[i]!;
    const cap = caps[i]!;
    labelColumn = Math.max(labelColumn, Number.isNaN(cap) ? natural : Math.min(natural, cap));
  });
  const valueColumn = width - labelColumn - gap;
  if (valueColumn < minValueColumn) return true;
  const oneLine = widths.slice(labels.length);
  for (const natural of oneLine) {
    if (natural - valueColumn > 0.5 && natural - width <= 0.5) return true;
  }
  // A value that wraps either way (a row of chips wider than the list) still
  // can't be cut: its widest unbreakable piece has to fit the value column.
  // Only such values can get here: any other is no wider than the value
  // column on one line, so its pieces are too; skip the read without them.
  const wrapping = values.filter((_, i) => oneLine[i]! - width > 0.5);
  if (!wrapping.length) return false;
  for (const narrowest of minContentWidths(wrapping)) {
    if (narrowest - valueColumn > 0.5 && narrowest - width <= 0.5) return true;
  }
  return false;
}

/**
 * Sets `data-stacked` on a two-column label/value list while its labels have
 * to go above their values (`labelsGoAbove`), and takes it off when they fit
 * beside them again: the list's CSS does the rest. The first frame is
 * decided synchronously, in the layout effect, and so is a label or value
 * changing (the MutationObserver) or a web font arriving: those paint the
 * right layout at once. A resize of the list or a value is decided in the
 * next animation frame, so a resize that crosses the boundary takes effect
 * one frame later: deciding inside the ResizeObserver's callback changed
 * the list's height while the observer was still delivering its children's
 * sizes, and the browser reported "ResizeObserver loop completed with
 * undelivered notifications" as a window error
 * (design/patterns/responsive.md#when-a-row-runs-out-of-room,
 * #the-first-frame-is-the-settled-one).
 */
export function useLabelValueFit(
  list: HTMLElement | null,
  enabled: boolean,
  parts: LabelValueParts,
) {
  const { label, value } = parts;
  useLayoutEffect(() => {
    if (!list || !enabled || typeof ResizeObserver === "undefined") return undefined;
    const selectors = { label, value };
    const fit = () => {
      const stacked = labelsGoAbove(list, selectors);
      if (stacked !== list.hasAttribute("data-stacked")) {
        list.toggleAttribute("data-stacked", stacked);
      }
    };
    // A resize decides in the next frame, outside the observer's delivery;
    // several notifications before it share one decision.
    let frame = 0;
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        fit();
      });
    });
    const observeAll = () => {
      resize.disconnect();
      resize.observe(list);
      for (const el of Array.from(list.querySelectorAll<HTMLElement>(`${label}, ${value}`))) {
        for (const child of Array.from(el.children)) resize.observe(child);
      }
    };
    observeAll();
    const mutation = new MutationObserver(() => {
      observeAll();
      fit();
    });
    mutation.observe(list, { childList: true, subtree: true, characterData: true });
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener("loadingdone", fit);
    fit();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", fit);
      list.removeAttribute("data-stacked");
    };
  }, [list, enabled, label, value]);
}
