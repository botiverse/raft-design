---
title: ContextMenu
summary: The menu of actions on one thing that opens at the pointer on right-click, or on press and hold on a touch screen.
status: stable
aliases: [Right-click menu]
layer: core
category: overlays
related: [dropdown-menu, select, popover]
---

# ContextMenu

A context menu is the menu of actions on one thing that opens where people right-click on desktop, or where they press and hold on a touch screen. It is the same menu that the thing's ⋯ button opens as a [DropdownMenu](../dropdown-menu/dropdown-menu.md): the same items, in the same order.

```example
context-menu/context-menu
```

## When to use

| Situation                                                                 | Use                                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| Right-click or press and hold on a message, a channel, a task or an agent | ContextMenu                                         |
| The same actions, from a visible button                                   | [DropdownMenu](../dropdown-menu/dropdown-menu.md)   |
| Acting on something on a phone                                            | ContextMenu on press and hold, never a bottom sheet |
| A value submitted with a form                                             | [Select](../select/select.md)                       |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

ContextMenu has the same parts as DropdownMenu, with the `ContextMenu` prefix: `ContextMenuItem`, `ContextMenuItemLabel`, `ContextMenuShortcut`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuCheckboxItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuSubmenu`, `ContextMenuSubmenuTrigger`, `ContextMenuFooter`, `ContextMenuPortal` and `ContextMenuPopup`. They look and behave as described in [DropdownMenu](../dropdown-menu/dropdown-menu.md#anatomy). It has no item count part.

- `ContextMenu`: the root. Required.
- `ContextMenuTrigger`: the area that opens the menu: the message, the row, the card. Required.
- `ContextMenuContent`: the menu, portaled and opened at the pointer. Required.

## States

The highlight, the current value and disabled items are the same as in [DropdownMenu](../dropdown-menu/dropdown-menu.md#states).

## Behavior

- The menu opens at the pointer, or at the finger after press and hold, with its top-left corner there.
- When it would cross the window edge, it shifts to stay at least 8px inside the window instead of flipping.
- Where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stays 8px inside that part instead of inside the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.
- It stays where it opened while the page behind it scrolls.
- Choosing an action or a radio item closes the menu, and a checkbox item leaves it open, as in [DropdownMenu](../dropdown-menu/dropdown-menu.md#behavior). Esc and a click outside close it too.
- An item is as tall as its content, with constant padding, as in a [DropdownMenu](../dropdown-menu/dropdown-menu.md#behavior) ([Forms](../../../../../design/patterns/forms.md#option-height)).

## Content

The item labels follow [DropdownMenu](../dropdown-menu/dropdown-menu.md#content): Title Case, and the same words as the dialog an item opens.

## Accessibility

- ContextMenu wraps the Base UI ContextMenu. It provides the `menu` role, the item roles, arrow keys, typeahead and Esc.
- Name the menu after the thing it acts on with `aria-label` on `ContextMenuContent` ("Message from Wug").
- Right-click and press and hold are not available from the keyboard. Offer every action of a context menu from a visible control as well, usually the ⋯ [DropdownMenu](../dropdown-menu/dropdown-menu.md).

## Rules

- Build the context menu and the ⋯ menu from one list of items, so they never drift apart.
- Use the same menu on desktop and on a phone. Don't build a separate phone sheet for the same actions.
- Follow the rules of [DropdownMenu](../dropdown-menu/dropdown-menu.md#rules): no color on destructive items, and the quick reactions first in the message menu.
