---
title: Lists
summary: How the rows of a list are drawn — no dividers, one inset rounded shape for hover, press, menu open, selection and focus, rows spaced 2px apart by the list's gap, and a scroller that keeps the shape even.
---

# Lists

A row of a list is a cell. The row runs the full width of its list, and its states are drawn on one rounded shape inside the row, as tall as the row and inset 8px from each side. The list spaces its rows 2px apart with its `gap` and pads its top and bottom by 8px, as far as the shape sits from its sides, so two filled rows show 2px of the list between them, which separates them without a line: lists have no dividers.

## When it applies

Every list of rows in which each row is one thing to open or pick:

- Activity and notifications: [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md).
- The sidebar, and the phone lists of places drawn with the sidebar row: [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md).
- Search results: [Search](../../packages/ui/src/components/search/search.md) (`SearchEntityResult`, `SearchMessageResult`).
- Phone lists of places and people, and the entries into other pages: [ListRow](../../packages/ui/src/components/list-row/list-row.md) with `cell`.

It doesn't cover:

- Tables, which keep a hairline between rows because their columns are read across ([Table](../../packages/ui/src/components/table/table.md)).
- Settings lists: the rows of a settings card (`ListRowGroup` with `plain` ListRows) keep their dividers and row-wide fills. A settings card is one form read top to bottom, and the line ties each setting to the next; an inset rounded shape inside the card's own rounded border would draw a third edge for no gain (design review, 2026-10-26).
- The compact task and file rows under a message and in a side card, which keep their inset lines for now ([Comfort](../foundations/comfort.md#separators)).
- Popup menus and option lists, whose rows follow [Spacing](../foundations/spacing.md).
- Lists of cards (task cards, the files panel's cards): each card is an object with its own edge, the whole card is the target, and the gap between cards stays.

## Structure

```example
activity/compositions/activity-inbox
```

```example
list-row/compositions/conversations
```

The four row components share one recipe fragment, `listCell` (`packages/ui/src/lib/list-cell.ts`), so they can't drift apart, and the containers of rows share one gap and one padding:

| Part | Value |
| --- | --- |
| Row | Full width, no margin, no border, transparent. The whole row is the target. Its height doesn't change: a sidebar row is 38px (44px on a phone). |
| State shape | The row's `::before`: as tall as the row, 8px from the start and end, `radius-control` (8px), under the row's content |
| Gap between two rows | 2px, the list's `gap` (`gap-0.5`), never a margin or an inset of the shape. At 4px the gap between two conversation rows read too big (design review, 2026-10-26). |
| The list's ends | 8px of padding at the top and bottom (`py-2`), so the first shape sits 8px below the list's top edge and the last 8px above its bottom, as far as every shape sits from the sides: a rounded shape is measured on all four sides, not only left and right (design review, 2026-10-26). |
| Containers | `SidebarList`, `SearchResultsList` and a search thread's messages are `flex flex-col gap-0.5 py-2`; `ActivityInboxViewport` is the same column, its bottom padding adding the safe area; `DialogNav` too. Any other list of cells is a `flex flex-col gap-0.5 py-2` column. |
| Heading → first row | 8px from the bottom of a heading's words to the first shape, in every list: a heading (a sidebar section header or group label, a search section heading, a search thread's header) has no bottom padding, and the list's own 8px is the whole space. A section's empty line (`SidebarSectionEmpty`) sits the same 8px under it. |
| Content | 16px from the row's edges in an edge-to-edge list (8px inset and 8px inside the shape), where it sat before the shape. The sidebar row keeps 17.5px, the 9.5px it had inside its old 1.5px edge. |

## Rules

- **Draw no line between two rows of a list.** The 2px between two rows, the leading tiles and avatars, and the space under a section heading separate the rows. A line through a list also cuts through every rounded shape on it.
- **Split groups with a section heading and space**, never with a line. A heading starts where the row's content starts (16px from the list's edge), not at the shape's edge.
- **Make the whole row the target.** A row's open button covers the row (`InboxItemTrigger`), or the row is the button itself, so every point of a row, up to its edges, lands on it. The 2px gap between two rows belongs to no row: a click there lands on the list. It is the price of spacing rows with the list's `gap` rather than inside the rows, and it is too narrow to aim at.
- **Space the rows with the list's gap, and pad its ends by 8px.** Put the rows straight in a column with `gap-0.5 py-2`. A margin on a row, or a shape inset from the row's top and bottom, would make each row draw its own share of the space. In a virtualized list, whose rows are placed one by one, add the 2px to the virtualizer's item spacing instead, since a `gap` doesn't reach rows positioned on their own.
- **Draw every state on the same shape.** The row stays transparent; hover, press, menu open, selection, the located highlight and keyboard focus fill or ring the shape, never the row's full rectangle:

  | State | Fill on the shape |
  | --- | --- |
  | Hover | `fill-cell-hover` |
  | Press | `fill-cell-press`, at once, with no fade in |
  | Menu open (a context menu, a long press) | `fill-cell-hover` |
  | Selected, open beside the list (an active InboxItem, a selected ListRow), located | `fill-cell-selected` |
  | Keyboard highlight in search | `brand-soft` |
  | Selected sidebar row | The yellow sticker: `selected`, its 1.5px ink edge inside the shape and the sticker edge around it |
  | Keyboard focus | The 2px inset ring in `foreground`, inside the shape (inside the sticker's ink edge on a selected sidebar row) |

- **Step the row states up in dark mode, rows only.** In light, `fill-cell-hover`, `fill-cell-press` and `fill-cell-selected` are `fill-subtle`, `fill-medium` and `info-soft`. In dark they are stronger (7.5% and 12% ink, the cyan at 38%), because a 3% fill on a small rounded shape barely shows on a dark surface. The global tiers don't change: other hover and press states keep them ([States](../foundations/states.md#hover-and-press)).
- **Press the same on a touch screen as with a mouse.** A finger's press shows `fill-cell-press` on the shape as soon as the browser marks the row pressed (`:active`), the same shape and colour as a mouse; only hover is gated to devices that hover. A long press that opens the row's menu leaves `fill-cell-hover` while the menu is open.
- **Don't let a selected or disabled row answer hover or press.** Its own fill stays.
- **Keep the shape 8px from both edges of the list, whatever the scrollbar.** A scroller of list cells takes the 8px list scrollbar (`scrollbar-list`) and publishes its width with `useScrollbarSize`. The shape gives that width back from its end inset, so it sits 8px from the scroller's outer edge with the scrollbar showing (8px, inside the gutter) and with none (0px). Styling the scrollbar makes Chromium draw this classic bar even where the platform would overlay its own (a phone, macOS), so the published width, not the platform, decides the inset. `ActivityInboxViewport` and `SearchShellViewport` do both; the Sidebar's ScrollArea has an overlay scrollbar. A wider classic scrollbar would push the shape's end in and leave it uneven, which is why the scrollbar is 8px.
- **Put a list of cells straight in its scroller, with no side padding.** The row brings its own inset. Side padding on the scroller would add to it, and leave a strip at each side that belongs to no row.

## Wide and narrow

The shape is the same at every width. On a phone the sidebar row grows to 44px for a finger, and its shape with it; the 2px between two rows stays. A phone's overlay scrollbar takes no room, so the shape is 8px from both edges of the screen.

## Related

- [States](../foundations/states.md#hover-and-press): the hover and press tiers, and the located highlight.
- [Shape](../foundations/shape.md#radii): `radius-control`.
- [Comfort](../foundations/comfort.md#separators): where lines are still drawn.
- [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md), [ListRow](../../packages/ui/src/components/list-row/list-row.md), [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md), [Search](../../packages/ui/src/components/search/search.md).
