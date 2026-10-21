/** The tallest the list gets by default (`.r-combobox-select__list`, 16rem). */
const LIST_MAX_HEIGHT = 256;

/**
 * The side a phone's list opens on, chosen once when it opens so it never flips
 * while it is open (a phone's visual viewport keeps changing under it, as the
 * keyboard and the address bar come and go). Below, unless the room below is
 * short of the list and there is more above.
 */
export function preferredListSide(
  anchor: { top: number; bottom: number },
  viewport: { top: number; height: number },
  listHeight: number,
): "bottom" | "top" {
  const below = viewport.top + viewport.height - anchor.bottom;
  const above = anchor.top - viewport.top;
  const needed = Math.min(listHeight, LIST_MAX_HEIGHT);
  return below >= needed || below >= above ? "bottom" : "top";
}
