---
title: SelectionToolbar
summary: The toolbar that floats at the bottom of a list or conversation while items are selected, with the count and the actions on them, such as forwarding messages or changing tasks in bulk.
status: experimental
aliases: [BatchBar, Toolbar for selected items, Multi-select toolbar, Bulk actions]
layer: core
category: actions
related: [fit-toolbar, message-item, text-selection-toolbar, activity-inbox, dropdown-menu, button]
---

# SelectionToolbar

`SelectionToolbar` floats at the bottom of a list or conversation while several items are selected: the count, then the actions on those items, then × to stop selecting. Messages (Forward) and tasks (bulk actions) share it, in the BatchBar style (Noel; stdrc, 2026-11-10, #wg-task-v2), so selecting reads the same everywhere. Its rules are in [Toolbar for selected items](../../../../../design/components/overview.md#toolbar-for-selected-items). It is a [FitToolbar](../fit-toolbar/fit-toolbar.md) that never wraps.

```example
selection-toolbar/selection-toolbar
```

## When to use

| Situation                                            | Use                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Actions on several selected messages or tasks        | SelectionToolbar                                                                                                                         |
| Selected rows in a list with a header row (Activity) | [ActivityInbox](../activity-inbox/activity-inbox.md)'s selection toolbar, inline in the header, which can wrap because it covers nothing |
| Actions on text the person selected                  | [TextSelectionToolbar](../text-selection-toolbar/text-selection-toolbar.md)                                                              |
| Actions on one message under the pointer             | The message's hover toolbar ([MessageItem](../message-item/message-item.md))                                                             |
| Actions on one row                                   | The row's own menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md))                                                                   |

## Anatomy

In this order:

- `SelectionToolbarDock`: where it floats, centered at the bottom of its positioned parent. The toolbar measures what fits in its width.
- `SelectionToolbar`: the floating frame, a Base UI Toolbar (`role="toolbar"`). Required.
- `SelectionToolbarItem`: any other control of the toolbar, such as a thread's select-all checkbox before the count: wrap it (`<SelectionToolbarItem><MessageMultiSelectCheckbox /></SelectionToolbarItem>`) so the arrow keys reach it; it keeps its own role and keys.
- `SelectionToolbarCount`: "3 selected", with the number in `SelectionToolbarCountValue`. Required.
- `SelectionToolbarHint`: an optional short line after the count, such as "1 will be skipped".
- `SelectionToolbarActions`: the surface's actions.
- `SelectionToolbarAction`: one action, an icon and a label. `secondary` makes it the first to move into More; `menu` adds the chevron of an action that opens a menu; `moreItem` is what it is in More's menu (by default a menu item with its icon and label that calls its `onClick`; give a `menu` action a `DropdownMenuSubmenu`).
- `SelectionToolbarMore`: More, after the actions, shown only while some are in it. Put `SelectionToolbarMoreItems` in its menu: it lists them, in order.
- `SelectionToolbarClose`: ×, last. Required.

The stable `MessageMultiSelectToolbar` and `MessageMultiSelectToolbarActions` keep their earlier bar until SelectionToolbar leaves wip, so a change here is not a change to them.

```example
message-item/compositions/selection-showcase
```

## Look

- A floating panel's frame: `radius-container`, `layer-popover`, a `line-seam` ring and `shadow-float`, as every floating panel ([Elevation](../../../../../design/foundations/elevation.md)). It is as tall as a head with a head's air at its ends (`header-height` and `header-air`): 44px and 5px with a mouse on a desktop, 56px and 6px on a phone and a touch screen. It replaces the composer at the bottom of a column, so it takes a head's measure (Noel). It is one row and never wraps.
- The count is `text-callout` bold, 8px on its left (and its right with a mouse), with the number in Space Mono, as counts are. The hint is `text-caption` in `foreground-hint`.
- With a mouse every button is an `md` ghost [Button](../button/button.md), 34px, 4px apart, with a 14px icon and its label, as the BatchBar spec draws it (Noel); a menu action's 12px chevron follows its label. An action whose label has given way is a 34px square; More and × are too.
- On a phone and a touch screen the buttons are a head's bar buttons, 44px (`bar-button-size`), side by side, showing their icons alone with no chevrons, as a head's buttons are by touch: at 360px a phone then fits the count, Status, Assignee, Nudge, More and × (Noel, 2026-11-10).
- There is no primary button, and no pink: while several items are selected, no action outranks the others (stdrc, 2026-11-10).

## Behavior

- `SelectionToolbarDock` floats it 16px above the bottom of the list or conversation, plus the safe area, so it sits above a phone's bottom navigation, and 20px from the sides, the composer's edge.
- When its row doesn't fit the width it floats in, measured in that width and never read from the window, things give way one step at a time ([FitToolbar](../fit-toolbar/fit-toolbar.md)): the hint (then read by screen readers only), the `secondary` actions into More from the end, the labels from the end (so the first action's goes last; each then shows its label as a tooltip), then the other actions into More from the end. The count and × never give way. It never wraps, because a second line would cover the items under it ([When a row runs out of room](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)).
- Open the menus of a menu action and of More upward: `side="top"` on `DropdownMenuContent`.
- With a mouse each button's hit area reaches only half the 4px gap toward its neighbour, so a click between two lands on the nearer; by touch each 44px button is its own tap.

## Content

- The count says what is selected, as a number and a word: "3 selected". In a thread with a select-all checkbox, "All 169 selected" when all are ([Toolbar for selected items](../../../../../design/components/overview.md#toolbar-for-selected-items)).
- Keep the hint to a few words about what the actions will do to the selection, such as "1 will be skipped". It is the first to give way, so don't put anything there the person needs.
- Write labels in sentence case: Forward, Generate image, Copy link, Copy Markdown. Order the actions by why people select the items, the most wanted first: it keeps its label longest. For messages Forward first, Generate image next (it shares them out too), the two copies last, the last three `secondary`. For tasks Status, Assignee, Nudge, then Follow and Delete marked `secondary`: they are the first into More when the row is narrow (Noel, 2026-11-10).

## Accessibility

- Give `SelectionToolbar` an `aria-label` that stays the same while the count changes, such as "Selected message actions". It is one Tab stop: Left and Right move between its controls, skipping those in More (Base UI Toolbar).
- `SelectionToolbarCount` is a polite live region: the new count is announced when it changes.
- An action showing its icon alone keeps its label as its accessible name and shows it as a tooltip.
- `SelectionToolbarMore` and `SelectionToolbarClose` take an `aria-label`, such as "More actions" and "Cancel".
- End the selection on Escape, as × does, unless a menu is open; then move the focus back into the conversation: to the composer, or where there is none, to the item the selection started on ([Moving focus](../../../../../design/foundations/accessibility.md#moving-focus)). The toolbar does not do this for you: the selection is yours.
