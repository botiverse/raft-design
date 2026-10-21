/** The tallest the list gets by default, its padding included (`.r-combobox-select__list`, 16rem). */
export const LIST_MAX_HEIGHT = "16rem";

/**
 * The side a phone's list opens on, chosen once when it opens so it never flips
 * while it is open (a phone's visual viewport keeps changing under it, as the
 * keyboard and the address bar come and go). Below, unless the room below is
 * short of the list and there is more above. `listHeight` is the list's full
 * height and `maxHeight` its cap (`listMaxHeight`), both in pixels.
 */
export function preferredListSide(
  anchor: { top: number; bottom: number },
  viewport: { top: number; height: number },
  listHeight: number,
  maxHeight: number,
): "bottom" | "top" {
  const below = viewport.top + viewport.height - anchor.bottom;
  const above = anchor.top - viewport.top;
  const needed = Math.min(listHeight, maxHeight);
  return below >= needed || below >= above ? "bottom" : "top";
}
