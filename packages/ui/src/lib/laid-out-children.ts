/**
 * The boxes a row lays out (design/patterns/responsive.md#switch-on-the-regions-width,
 * "Measure only what is laid out in the row"): its children, looking through
 * `display: contents` wrappers, less anything hidden (no box), out of flow
 * (`position: absolute` or `fixed`) or of no size.
 *
 * Why: an open Base UI Menu or non-modal Popover puts focus guards and an
 * `aria-owns` span beside its trigger, and a Select or Combobox always adds a
 * hidden input there, each a 1px box fixed at the window's corner. A measure
 * that takes every child, the first or last, the leftmost or a Range over the
 * contents reads them as part of the row: opening a menu made a filter row
 * collapse to icons and a dialog footer stack, and a Select kept a banner's
 * actions off the text's line for good. Every raft-ui measure that decides a
 * row's layout from its children (FitToolbar, DialogFooter and
 * AlertDialogFooter, BannerAction) reads them through this.
 *
 * @param element The row whose items are measured.
 * @returns The elements that take part in the row's layout, in DOM order.
 */
export function laidOutChildren(element: Element): Element[] {
  return Array.from(element.children).flatMap((child) => {
    const style = getComputedStyle(child);
    if (style.display === "contents") return laidOutChildren(child);
    if (style.position === "absolute" || style.position === "fixed") return [];
    if (child.getClientRects().length === 0) return [];
    const { width, height } = child.getBoundingClientRect();
    return width === 0 && height === 0 ? [] : [child];
  });
}
