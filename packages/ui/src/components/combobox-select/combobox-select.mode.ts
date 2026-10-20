/**
 * How ComboboxSelect opens. On a desktop, or any screen with a fine pointer, it is
 * a text field with an anchored list (`"field"`). On a phone (`PHONE_MEDIA_QUERY`)
 * a field that needs no typing opens without focusing a text input:
 *
 * - `"list"`: up to `sheetThreshold` options, the anchored select list.
 * - `"sheet"`: more options, or a list that typing drives (`create`, `remote`),
 *   a bottom sheet with the search input at its top.
 */
export type ComboboxSelectMode = "field" | "list" | "sheet";

/** Above this many selectable options a phone opens the bottom sheet. */
export const COMBOBOX_SELECT_SHEET_THRESHOLD = 10;

export function resolveComboboxSelectMode({
  phone,
  optionCount,
  sheetThreshold = COMBOBOX_SELECT_SHEET_THRESHOLD,
  create = false,
  remote = false,
}: {
  phone: boolean;
  optionCount: number;
  sheetThreshold?: number;
  create?: boolean;
  remote?: boolean;
}): ComboboxSelectMode {
  if (!phone) return "field";
  if (create || remote) return "sheet";
  return optionCount > sheetThreshold ? "sheet" : "list";
}

/** Options people can pick, flat or grouped: disabled options don't count. */
export function countSelectableOptions(
  groups: readonly { items: readonly { disabled: boolean }[] }[],
) {
  let count = 0;
  for (const group of groups) {
    for (const item of group.items) if (!item.disabled) count += 1;
  }
  return count;
}

/** The tallest the anchored list gets (`.r-combobox-select__list`, 16rem). */
const LIST_MAX_HEIGHT = 256;

/**
 * The side the anchored list opens on, chosen once when it opens so it never
 * flips while it is open (a phone's visual viewport keeps changing under it).
 * Below, unless the room below is short of the list and there is more above.
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
