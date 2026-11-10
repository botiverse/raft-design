---
title: SelectionToolbar
summary: The toolbar that floats at the bottom of a list or conversation while items are selected, with the count and the actions on them, such as forwarding messages or changing tasks in bulk.
status: experimental
aliases: [BatchBar, Toolbar for selected items, Multi-select toolbar]
layer: core
category: actions
related: [message-item, text-selection-toolbar, dropdown-menu, button]
---

# SelectionToolbar

`SelectionToolbar` floats at the bottom of a list or conversation while several items are selected: the count, then the actions on those items, then × to stop selecting. Messages (Forward) and tasks (bulk actions) share it, in the BatchBar style (Noel; stdrc, 2026-11-10, #wg-task-v2), so selecting reads the same everywhere. Its rules for messages are in [Toolbar for selected items](../../../../../design/components/overview.md#toolbar-for-selected-items).

```example
selection-toolbar/selection-toolbar
```

## When to use

| Situation                                     | Use                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| Actions on several selected messages or tasks | SelectionToolbar                                                             |
| Actions on text the person selected           | [TextSelectionToolbar](../text-selection-toolbar/text-selection-toolbar.md)  |
| Actions on one message under the pointer      | The message's hover toolbar ([MessageItem](../message-item/message-item.md)) |
| Actions on one row                            | The row's own menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md))       |

## Anatomy

In this order:

- `SelectionToolbarDock`: where it floats, centered at the bottom of its positioned parent. Its width decides when the toolbar is narrow.
- `SelectionToolbar`: the floating frame, a `role="toolbar"`. Required. `MessageMultiSelectToolbar` is the same part under its earlier name.
- `SelectionToolbarCount`: "3 selected", first, with the number in `SelectionToolbarCountValue`. Required.
- `SelectionToolbarHint`: an optional short line after the count, such as "1 will be skipped".
- `SelectionToolbarActions`: the surface's actions, 4px apart. `MessageMultiSelectToolbarActions` is the same part under its earlier name.
- `SelectionToolbarAction`: one action, an icon and a label. `secondary` moves it into More when narrow; `menu` adds the chevron of an action that opens a menu.
- `SelectionToolbarMore`: More, shown only when narrow, holding the secondary actions.
- `SelectionToolbarClose`: ×, last. Required.

```example
message-item/compositions/selection-showcase
```

## Look

- `radius-container`, a 1px `line-strong` border, `layer-popover` and `shadow-float`; 8px across and 6px down inside, the buttons 4px apart. It is one row and never wraps.
- The count is `text-callout` bold, 8px on each side, with the number in Space Mono. The hint is `text-caption` in `foreground-hint`.
- Every button is an `md` ghost [Button](../button/button.md), 32px high (34px with a mouse), with a 14px icon and its label; a menu action's 12px chevron follows its label. × is an `icon-md` ghost button. There is no primary button, and no pink: while several items are selected, no action outranks the others (stdrc, 2026-11-10).

## Behavior

- `SelectionToolbarDock` floats it 16px above the bottom of the list or conversation, plus the safe area, so it sits above a phone's bottom navigation, and 20px from the sides, the composer's edge.
- Narrow is below `md`: the screen's, or the dock's width, so a thread beside a conversation on a desktop is narrow too. There each action shows its icon alone (6px each side), its label kept as its accessible name; the hint and the chevrons hide; actions marked `secondary` hide and More shows. Render the secondary actions in More's menu as well: More is hidden while they fit.
- Open the menus of a menu action and of More upward: `side="top"` on `DropdownMenuContent`.
- Each button's hit area reaches only half the 4px gap toward its neighbour, so a tap between two lands on the nearer; on a touch screen each still takes a 44px tap.

## Content

- The count says what is selected, as a number and a word: "3 selected". In a thread with a select-all checkbox, "All 169 selected" when all are ([Toolbar for selected items](../../../../../design/components/overview.md#toolbar-for-selected-items)).
- Keep the hint to a few words about what the actions will do to the selection, such as "1 will be skipped". It hides when narrow, so don't put anything there the person needs.
- Write labels in sentence case: Copy link, Forward, Generate image, Copy Markdown.

## Accessibility

- Give `SelectionToolbar` an `aria-label` that stays the same while the count changes, such as "Selected message actions". Left, Right, Home and End move between its buttons; Tab still visits each.
- `SelectionToolbarCount` is a polite live region: the new count is announced when it changes.
- `SelectionToolbarMore` and `SelectionToolbarClose` take an `aria-label`, such as "More actions" and "Cancel".
- End the selection on Escape, as × does, unless a menu is open; then move the focus back into the conversation: to the composer, or where there is none, to the item the selection started on. The toolbar does not do this for you: the selection is yours.
