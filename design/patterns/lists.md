---
title: Lists
summary: How the rows of a list are drawn — no dividers, one inset rounded shape for hover, press, menu open, selection and focus, the content padded 12px inside that shape, rows spaced 2px apart by the list's gap, and a scroller that keeps the shape even.
---

# Lists

A row of a list is a cell. The row runs the full width of its list, and its states are drawn on one rounded shape inside the row, as tall as the row and inset 8px from each side. The list spaces its rows 2px apart with its `gap` and pads its top and bottom by 8px, as far as the shape sits from its sides, so two filled rows show 2px of the list between them, which separates them without a line: lists have no dividers. The row's content is padded from the shape, 12px inside it at both ends, so nothing in a row touches its shape.

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
| Content | Padded from the shape, not from the list: 12px inside the shape at the start and at the end (`--cell-pad-x`), so 20px from the list's edges (8px inset + 12px). Leading avatars, icons and checkboxes start at the shape's inner start; trailing times, counts, the @ sticker, the muted mark and hover-revealed buttons (Mark as Done) end at its inner end. Top and bottom keep the row's own padding: 12px (`py-3`) for InboxItem, search results and ListRow; a 38px sidebar row centres its 20px line (9px). `listCell` sets the inline padding, so a row recipe sets none of its own. |

## One edge

A list sits in a column with a head over it, often a toolbar (Filter, Mark all as read, the search filters), and section headings. All of them start on one line, the line the rows' content starts on: **20px from the column's edge, on a phone as on a desktop**. The rows put their content 8px (the shape) + 12px in; the column's margin follows them.

| Part | From the column's edge |
| --- | --- |
| The head's title, or the shape at its start (the workspace button's avatar, the search field) | 20px |
| A toolbar's first control, by its shape (the outlined Filter button), and its last, by its words or icon box | 20px |
| Section headings, the summary, a section's empty line, a banner in the list | 20px |
| A row's state shape | 8px |
| A row's leading avatar, tile or checkbox, and its trailing time, counts and buttons | 20px (12px inside the shape) |

A phone's other columns keep their 16px ([Alignment](../foundations/alignment.md#usage)). The column's margin is the `--column-margin` variable, which every head, panel notice and footer pads by: 16px on a phone and 20px from 768px, and a column of list cells sets it to 20px at every width (`ActivityInboxPanel`, `SidebarRoot`, `SearchShellRoot`). A toolbar or banner of the app's own in such a column pads by `px-(--column-margin)`; an app's own column of cells sets `[--column-margin:20px]` on its root.

Why not keep 16px on a phone: the rows would then need their content 8px inside the shape (it touches the shape when filled, the problem this page exists to fix), or the shape 4px from the screen's edge, where it reads as a misplaced full-width band. One margin for the whole column keeps the 8px shape and the 12px inside it at every width (design review, 2026-10-27).

## Rules

- **Draw no line between two rows of a list.** The 2px between two rows, the leading tiles and avatars, and the space under a section heading separate the rows. A line through a list also cuts through every rounded shape on it.
- **Split groups with a section heading and space**, never with a line. A heading starts where the row's content starts (20px from the list's edge), not at the shape's edge.
- **Make the whole row the target.** A row's open button covers the row (`InboxItemTrigger`), or the row is the button itself, so every point of a row, up to its edges, lands on it. The 2px gap between two rows belongs to no row: a click there lands on the list. It is the price of spacing rows with the list's `gap` rather than inside the rows, and it is too narrow to aim at.
- **Space the rows with the list's gap, and pad its ends by 8px.** Put the rows straight in a column with `gap-0.5 py-2`. A margin on a row, or a shape inset from the row's top and bottom, would make each row draw its own share of the space. In a virtualized list, whose rows are placed one by one, add the 2px to the virtualizer's item spacing instead, since a `gap` doesn't reach rows positioned on their own.
- **Pad the content from the shape, never from the list.** A shape inset 8px with the content still 16px from the list's edge leaves 8px, or none once an app insets the shape further, and the trailing marks and the Mark as Done button sit on the shape's edge (design review, 2026-10-27: "the check icon and the unread count touch the edge on hover"). Inside the shape the content keeps 12px on both sides, the same at the start and at the end, in every state: at rest, hovered (with the actions revealed), pressed, selected, located and focused. Nothing inside a row may reach into that 12px: a part as wide as its contents (the 20px selection checkbox has a 20px slot), and a part's outer edge (a sticker's 1.5px ring) only from its own 12px. A text that runs long truncates at the inner padding. The value matches the web sidebar's row, the reference the design review named: its shape sits 8px from the sidebar's sides and its trailing count 11.5px inside it (now 12, the same at the start, where it was 9.5).
- **Start the head, the toolbar and the headings on the rows' content line.** 20px from the column's edge at every width ([One edge](#one-edge)). A toolbar at 16px over rows at 20px leaves two edges 4px apart, which reads as a mistake.
- **Don't move the shape or the content from outside.** An app that adds side padding to the scroller (`px-2`), or moves the shape's end (`before:right-4`), or sets a row's padding (`px-2.5`), undoes the rule: the shape no longer sits 8px from the list, or the content no longer 12px inside it.
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

The shape, the content's 12px inside it, and the column's 20px margin are the same at every width ([One edge](#one-edge)). On a phone the sidebar row grows to 44px for a finger, and its shape with it; the 2px between two rows stays. A phone's overlay scrollbar takes no room, so the shape is 8px from both edges of the screen.

## Related

- [States](../foundations/states.md#hover-and-press): the hover and press tiers, and the located highlight.
- [Shape](../foundations/shape.md#radii): `radius-control`.
- [Comfort](../foundations/comfort.md#separators): where lines are still drawn.
- [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md), [ListRow](../../packages/ui/src/components/list-row/list-row.md), [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md), [Search](../../packages/ui/src/components/search/search.md).
