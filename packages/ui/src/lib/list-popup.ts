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
 *
 * It relies on Base UI's internals: before `size()` measures, Base UI sets
 * `--available-height` to `100vh`, and that seed is how the cap knows it is on
 * the pass that picks the side. If a Base UI upgrade stops seeding it, or seeds
 * another value, the cap is the whole list again and flip() measures that. The
 * tests "opens below a trigger near the top of a short (480px) window" and
 * "… of a 900px window, not beside it" in `list-popup.browser.test.tsx` guard
 * this: they go red when the seed changes. Run them after upgrading Base UI.
 *
 * A DropdownMenu submenu keeps the cap but not
 * `LIST_POPUP_COLLISION_AVOIDANCE`: like a ContextMenu submenu, it takes
 * `SUBMENU_POSITION`.
 */
export const LIST_POPUP_MAX_HEIGHT = "max-h-popup-list";

/**
 * Where a submenu goes (DropdownMenu and ContextMenu alike): beside its item,
 * to the end side, its first item level with it (`alignOffset` takes back the
 * popup's 4px inset). Where it meets the window's edge it flips to the other
 * side of its item, never above or below it (`fallbackAxisSide: "none"`, Base
 * UI's menu default): a submenu comes out of its item, and dropped above or
 * below it would no longer read as the item's. Where it fits on neither side,
 * `sticky` slides it back into the window along the edge, over the menu (Base
 * UI shifts across the side axis only when sticky). Each prop a caller passes
 * replaces its default.
 */
export const SUBMENU_POSITION = {
  side: "inline-end",
  sideOffset: 4,
  alignOffset: -4,
  collisionAvoidance: { side: "flip", align: "flip", fallbackAxisSide: "none" },
  sticky: true,
} as const;
