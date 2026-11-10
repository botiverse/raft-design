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
 * Reads each value's narrowest width: its widest piece that can't break (its
 * widest chip, its longest word), in one pass like `oneLineWidths`.
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
 * would on a line of its own, or the value column would be narrower than
 * `minValueColumn`, or some value has a piece that can't break (a chip, a
 * long word) wider than the value column but no wider than the list, so
 * beside the label it would be cut. A value too long for a line of its own (a
 * paragraph) wraps either way and doesn't decide. Measured in one-line layout whatever
 * the list shows now, so the answer depends only on the list's width and its
 * content and can't flap at the boundary.
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
  for (const natural of widths.slice(labels.length)) {
    if (natural - valueColumn > 0.5 && natural - width <= 0.5) return true;
  }
  // A value that wraps either way (a row of chips wider than the list) still
  // can't be cut: its widest unbreakable piece has to fit the value column.
  for (const narrowest of minContentWidths(values)) {
    if (narrowest - valueColumn > 0.5 && narrowest - width <= 0.5) return true;
  }
  return false;
}

/**
 * Sets `data-stacked` on a two-column label/value list while its labels have
 * to go above their values (`labelsGoAbove`), and takes it off when they fit
 * beside them again: the list's CSS does the rest. The decision is taken
 * synchronously, in the layout effect and the observers' callbacks, so the
 * first frame and every resize paint the right layout; again when the list
 * or a value resizes, a label or value changes, or a web font arrives
 * (design/patterns/responsive.md#when-a-row-runs-out-of-room).
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
    const resize = new ResizeObserver(fit);
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
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", fit);
      list.removeAttribute("data-stacked");
    };
  }, [list, enabled, label, value]);
}
