import { useCallback, useLayoutEffect, useState } from "react";
import type { Ref, RefCallback } from "react";

/**
 * A dialog's buttons (packages/ui/src/components/dialog/dialog.md#the-footer):
 * DialogFooter and AlertDialogFooter keep them in one row at the end, on a
 * phone as on a desktop (stdrc, 2026-10-22). Only when the row doesn't fit on
 * one line, such as a commit button with a long label, do they stack full
 * width. Both footers read these values, so the stack is decided in one place.
 * DrawerActions has its own rule and doesn't use this.
 *
 * The order of the stack is one switch. On (today), the commit button goes on
 * top and Cancel under it. The markup stays Cancel then commit, as in the row,
 * and so do Tab and a screen reader: in the stack, focus goes up from Cancel
 * to the commit button. No `reading-flow`: the dialog's focus trap wraps in
 * markup order, and a visual order would fight it (Cancel would trap focus).
 * Off, the stack keeps the markup's order, Cancel above the commit button.
 */
const COMMIT_ON_TOP = true;

/**
 * Classes the footer adds to its buttons while they are stacked, such as a
 * frame around Cancel. Empty: Cancel keeps its row style (ghost).
 */
const STACKED_CANCEL: string[] = [];

/**
 * The row of buttons while `data-stacked` is set: a full-width column. A
 * button alone in a wrapper (a tooltip's trigger) fills the width too.
 */
export const stackedActions = [
  COMMIT_ON_TOP ? "data-stacked:flex-col-reverse" : "data-stacked:flex-col",
  "data-stacked:items-stretch",
  "data-stacked:*:data-[slot=button]:w-full data-stacked:[&>*>[data-slot=button]:only-child]:w-full",
  ...STACKED_CANCEL.map((value) => `data-stacked:${value}`),
];

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function contentWidth(element: Element) {
  const style = getComputedStyle(element);
  return (
    element.getBoundingClientRect().width -
    (Number.parseFloat(style.paddingLeft) || 0) -
    (Number.parseFloat(style.paddingRight) || 0) -
    (Number.parseFloat(style.borderLeftWidth) || 0) -
    (Number.parseFloat(style.borderRightWidth) || 0)
  );
}

/**
 * Whether a row of buttons must stack: laid out as a row (`data-stacked` off
 * for the measure and put back at once, inside one frame, so nothing is
 * painted in between and the layouts never flip back and forth), its children
 * run past the content box of `frame`. Children that may shrink (a label that
 * truncates or wraps) shrink first, so only content that can't, the buttons,
 * counts as not fitting. Undefined while the frame is hidden (a sheet hides
 * its footer), so nothing is decided then.
 */
function rowOverflows(row: HTMLElement, frame: HTMLElement) {
  if (!(frame.getBoundingClientRect().width > 0)) return undefined;
  const wasStacked = row.hasAttribute("data-stacked");
  if (wasStacked) row.removeAttribute("data-stacked");
  const available = contentWidth(frame);
  let start = Number.POSITIVE_INFINITY;
  let end = Number.NEGATIVE_INFINITY;
  for (const child of row.children) {
    const box = child.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) continue;
    const style = getComputedStyle(child);
    start = Math.min(start, box.left - (Number.parseFloat(style.marginLeft) || 0));
    end = Math.max(end, box.right + (Number.parseFloat(style.marginRight) || 0));
  }
  if (wasStacked) row.setAttribute("data-stacked", "");
  return end - start > available + 0.5;
}

/**
 * Sets `data-stacked` on a footer's row of buttons when it doesn't fit on one
 * line (rowOverflows). Pass the returned ref to the row. It must fit its own
 * content box, or with `inParent` (the group of buttons beside a note) its
 * parent's. As BannerAction's `data-wrap`, it measures again when the footer
 * resizes, the buttons change or a web font arrives.
 */
export function useStackedActions<T extends HTMLElement>(
  ref?: Ref<T>,
  inParent = false,
): [stacked: boolean, ref: RefCallback<T>] {
  const [row, setRow] = useState<T | null>(null);
  const [stacked, setStacked] = useState(false);
  const callbackRef = useCallback(
    (node: T | null) => {
      setRow(node);
      assignRef(ref, node);
    },
    [ref],
  );

  useLayoutEffect(() => {
    const frame = inParent ? row?.parentElement : row;
    if (!row || !frame || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const overflows = rowOverflows(row, frame);
      if (overflows !== undefined) setStacked(overflows);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(frame);
    resize.observe(row);
    for (const child of row.children) resize.observe(child);
    const mutation = new MutationObserver(schedule);
    mutation.observe(row, { childList: true, characterData: true, subtree: true });
    const fonts = typeof document.fonts === "undefined" ? undefined : document.fonts;
    let live = true;
    void fonts?.ready.then(() => {
      if (live) schedule();
    });
    fonts?.addEventListener("loadingdone", schedule);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [row, inParent]);

  return [stacked, callbackRef];
}
