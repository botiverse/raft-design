/**
 * Where a list popup goes when it meets the window's edge
 * (design/foundations/elevation.md#popups): a DropdownMenu, a Select, a
 * Combobox or ComboboxSelect list, or a Popover with a PopoverBody.
 *
 * 1. It stays on the side it asks for and shrinks to the room there, scrolling
 *    its list, as long as that room holds five rows (`--popup-list-min-height`).
 * 2. With less, it flips to the other side.
 * 3. Only when neither side holds five rows does it open beside its trigger.
 *
 * The order is Base UI's flip() with the side axis last (`fallbackAxisSide:
 * "end"`, the default of Base UI's Popover; its menus, selects and comboboxes
 * default to `"none"`, never beside). What makes a short side count as room is
 * the popup's height cap, `LIST_POPUP_MAX_HEIGHT`: flip() measures the popup as
 * it is drawn, and without the cap it measured the whole list, so a list taller
 * than the room on either side skipped straight to the side axis and opened
 * beside its trigger at full height (a 30-person readers list in a 900px
 * window). The two go together: a component that takes this default also
 * caps its popup with the class. A `collisionAvoidance` passed to the component
 * replaces this default.
 */
export const LIST_POPUP_COLLISION_AVOIDANCE = {
  side: "flip",
  align: "flip",
  fallbackAxisSide: "end",
} as const;

/**
 * The list popup's height cap (styles.css `max-h-popup-list`): at most five
 * rows until the positioner has measured the room, then 4px short of it.
 */
export const LIST_POPUP_MAX_HEIGHT = "max-h-popup-list";
