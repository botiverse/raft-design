// Raft Design System › list cells (design/patterns/lists.md): a row of a list
// is a cell. The row runs the full width of its list and is the target. Its
// states are drawn on one shape, its ::before, which fills the row's height
// and is inset 8px from each side, with the control radius. The rows are
// spaced by their list, not by the shape: every container of list cells is a
// column with a 2px gap and 8px at its ends (gap-0.5 py-2: SidebarList,
// SearchResultsList, ActivityInboxViewport), so two filled rows show 2px of
// the list between them, the first and last shapes sit 8px from the list's
// ends as from its sides, and the list needs no divider. The 2px belongs to
// no row. ListRow is a cell only with `cell`; a settings card keeps its lines.
// The end inset is measured from the scroller's outer edge: a scroller that
// shows a classic scrollbar publishes its width as --scrollbar-size
// (useScrollbarSize), and the shape gives that much of its 8px back, so the
// fill sits 8px from both edges whatever the scrollbar is.
//
// The row stays transparent and draws no ring of its own; `isolate` keeps
// the shape (z -1) over the row's surface and under its content.
// Each recipe adds its own selected fill (fill-cell-selected, or brand-soft
// for a keyboard highlight) and focus ring on `before:`, and the located
// highlight moves onto the shape in styles.css.
export const listCell = [
  "list-cell relative isolate bg-transparent shadow-none outline-none",
  "[--cell-inset-x:8px] [--cell-radius:var(--radius-control)]",
  "[--cell-inset-end:max(0px,calc(var(--cell-inset-x)-var(--scrollbar-size,0px)))]",
  "before:pointer-events-none before:absolute before:-z-1 before:block before:content-['']",
  "before:inset-y-0 before:right-(--cell-inset-end) before:left-(--cell-inset-x)",
  "before:rounded-(--cell-radius) before:border-0",
  "before:transition-colors before:duration-150 before:ease-out",
];

// Hover lays fill-cell-hover on the shape and press fill-cell-press, at once
// (no fade in): on a touch screen the press is the same fill as with a mouse.
// In light they are the subtle and medium tiers; in dark they step up, rows
// only, so the inset shape reads on a dark surface (tokens.json, fill.cell-*).
// A row whose menu is open (a context menu, a long press) keeps the hover
// fill. A selected or disabled row doesn't answer hover or press.
export const listCellStates = [
  "not-data-active:not-data-selected:not-data-disabled:not-disabled:not-aria-disabled:hover:before:bg-fill-cell-hover",
  "not-data-active:not-data-selected:not-data-disabled:not-disabled:not-aria-disabled:active:before:bg-fill-cell-press",
  "active:before:transition-none",
  "not-data-active:not-data-selected:data-popup-open:before:bg-fill-cell-hover",
  "not-data-active:not-data-selected:has-data-popup-open:before:bg-fill-cell-hover",
];

// Keyboard focus on the row: the 2px inset ring, on the same shape.
export const listCellFocus = [
  "focus-visible:keyboard:before:inset-ring-2 focus-visible:keyboard:before:inset-ring-foreground",
];
