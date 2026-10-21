/** One option row (36px) and the list's 6px padding above and below. */
const ROW = 36;
const LIST_PADDING = 12;
/** The gap between the field and the list (the positioner's sideOffset). */
const SIDE_OFFSET = 4;

/**
 * Whether fewer than three rows of a phone's list fit between the field and the
 * bottom of the visual viewport. The list always opens below the field on a
 * phone and never flips; when this is true the field is scrolled up instead.
 */
export function roomBelowIsShort(
  field: { bottom: number },
  viewport: { top: number; height: number },
  rows = 3,
): boolean {
  const below = viewport.top + viewport.height - field.bottom - SIDE_OFFSET;
  return below < rows * ROW + LIST_PADDING;
}
