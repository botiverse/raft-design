---
title: Tabs
summary: A row of tabs for the sections of one page, each with its own content; the selected tab is a yellow sticker, and the row scrolls when the tabs don't fit.
status: stable
aliases: []
layer: core
category: navigation
related: [segmented-control, conversation-panel, mobile-nav]
redirectFrom: [decisions/0013-sticker-tabs]
---

# Tabs

Tabs switch between the sections of one page, each with its own content: an agent's profile, activity and workspace, for example. The selected tab is a yellow sticker, the same "you are here" as a sidebar row or a segmented control. When the tabs don't fit, the row scrolls sideways.

```example
tabs/compositions/placement
```

## When to use

| Situation                                       | Use                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| Sections of one page, each with its own content | Tabs                                                                         |
| Another view of the same content                | [SegmentedControl](../segmented-control/segmented-control.md)                |
| The steps of a flow, in order                   | [Steps](../steps/steps.md)                                                   |
| A product's destinations                        | [AppRail](../app-rail/app-rail.md), [MobileNav](../mobile-nav/mobile-nav.md) |

A place with several kinds of content, such as an agent, shows them as one row of sticker tabs under its header ([Navigation](../../../../../design/patterns/navigation.md#several-views-of-one-place)). A channel's tasks and files are not tabs: they are side cards beside the conversation. Only when the cards float over the messages or cover the panel with both open does a Tasks / Files row of tabs switch between them ([Responsive layout](../../../../../design/patterns/responsive.md#structure)).

## Anatomy

- `Tabs`: the root. It holds the selected value and the `placement`.
- `TabsList`: the row of tabs.
- `TabsTab`: one tab, with an optional icon before a `TabsLabel`.
- `TabsPanel`: the content of one tab.
- `SortableTabsList` and `SortableTabsTab`: a row whose tabs people can reorder by dragging. `useOrderedTabs` restores a saved order.

## Variants

| Variant               | Use for                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"`   | The sticker tab: the selected tab is a yellow sticker. The default                                                               |
| `variant="underline"` | Many tabs, or a place that already has a lot of color: the selected tab is ink text with a 2px ink line on the row's bottom edge |

The sticker tab is the default, and the one the product ships: a selected tab says "you are here", like a selected sidebar row or segment, so it takes the same yellow sticker ([Navigation](../../../../../design/patterns/navigation.md#where-you-are)). The underline stays a variant. `placement` puts the row on the top (the default), bottom, left or right of the panels.

## Behavior

- When the tabs don't fit, the row scrolls on its own. Tabs never wrap onto a second line and never shrink their text.
- The row shows no scrollbar, and a vertical mouse wheel scrolls it sideways.
- The side that hides tabs fades out over 32px.
- The selected tab always scrolls into view.
- In a `SortableTabsList`, dragging a tab follows [Drag and drop](../../../../../design/patterns/drag-and-drop.md): a lifted copy of the tab follows the hand, the tab stays at 40% until it moves, its slot becomes the dashed place and the other tabs slide apart, and a drop or a cancel glides in 160ms. A mouse picks a tab up after 6px; a finger after a 500ms hold.

```example
tabs/compositions/sortable
```

## A tab's own controls

When a tab's content has controls of its own (a view switch, filters, search, a sort), they go in one toolbar row at the top of the tab's content, under the tabs. Every tab with controls uses the same row, the one the Tasks page draws ([TasksPanelToolbar](../tasks/tasks.md)), so a person who has learned one tab knows where to look in the next:

- The row has its own height and padding, the content margin at its sides and a `line-seam` below it, and it stays pinned while the content scrolls under it. Content never starts flush under the row, and never scrolls up against the tabs.
- Filters and search start at the row's left; a [SegmentedControl](../segmented-control/segmented-control.md) that switches the view goes at its right end. A view switch on the left would sit right under the selected tab, and two yellow stickers stacked one above the other read as the same level.
- A tab with no controls has no row.

## Content

- Label tabs with 1 or 2 words in Title Case: Profile, Activity, Workspace ([Typography](../../../../../design/foundations/typography.md#casing)).
- Put a count in its own Space Mono element after the label, never in the label's text.

## Accessibility

- `Tabs` wraps the Base UI Tabs, which provides the tab list, tab and panel semantics and the arrow keys.
- Name the `TabsList` after the place it belongs to: `aria-label="launch-week"`.
- Give every icon-only tab an `aria-label`.
- Sortable tabs are reordered with a pointer, by touch or with the keyboard: Space picks the focused tab up, ArrowLeft and ArrowRight (ArrowUp and ArrowDown on a vertical row) move it, Space drops it and Escape puts it back. While a tab is lifted, the arrow keys move it instead of the focus ([Drag and drop](../../../../../design/patterns/drag-and-drop.md#keyboard)).

## Rules

- Use one row of tabs per screen.
- Make a sticker tab 32px high, with a 44px hit area and 8px of row above and below it, so the selected sticker sits as far from the line above as from the line below. Its width follows its label, and it has no track behind it.
- Make an underline tab 44px high, 20px from the next, with text only.
- Draw a `line-seam` under the row in both variants. When you change the size of the text or the row, check that the selected tab's space above and below is still equal.
- Start the first sticker on the content's edge, the same margin as the panel header's first element ([Page structure](../../../../../design/patterns/page-structure.md#one-edge-per-column)). In dark mode the selected sticker has the die-cut edge like every sticker, so it lines up with the avatar in the header ([Dark mode](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)).
