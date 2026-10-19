---
title: DropdownMenu
summary: A list of actions on one thing, opened from a button, that can also hold a setting-style choice with a check mark on the current value.
status: stable
aliases: [Menu]
layer: core
category: overlays
related: [context-menu, select, popover, alert-dialog, drawer]
---

# DropdownMenu

A dropdown menu is a list of actions on one thing (a message, a channel, a task, an agent), opened from a button such as ⋯. It can also hold a setting-style choice, such as sort order or status, with a check mark on the current value. Right-click on desktop and press and hold on a phone open the same menu as a [ContextMenu](../context-menu/context-menu.md).

```example
dropdown-menu/compositions/sidebar-section-header-menu
```

## When to use

| Situation                                                  | Use                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| Act on one thing, from a button                            | DropdownMenu                                                        |
| The same actions, on right-click or press and hold         | [ContextMenu](../context-menu/context-menu.md), with the same items |
| A setting-style choice that applies at once (sort, status) | DropdownMenu with radio items                                       |
| A value submitted with a form                              | [Select](../select/select.md)                                       |
| A little input on click (snooze, rename)                   | [Popover](../popover/popover.md)                                    |
| A place to go, on a phone                                  | A bottom sheet ([Drawer](../drawer/drawer.md))                      |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `DropdownMenu`: the root. Owns the open state. Required.
- `DropdownMenuTrigger`: the button that opens the menu. Renders an outline Button unless you pass `render`. Required.
- `DropdownMenuContent`: the menu, portaled and positioned next to the trigger, at least 240px wide. Required.
- `DropdownMenuItem`: one action. A 16px icon, then the label. Wrap the label in `DropdownMenuItemLabel` to truncate it.
- `DropdownMenuShortcut`: the keyboard shortcut at the end of an item, in `text-mono-meta` and `foreground-hint`.
- `DropdownMenuItemCount`: a count at the end of an item.
- `DropdownMenuRadioGroup` and `DropdownMenuRadioItem`: a set of values with one current value, marked with a check mark.
- `DropdownMenuCheckboxItem`: an option that is on or off by itself.
- `DropdownMenuLabel`: a heading over a group of items. Not interactive.
- `DropdownMenuSeparator`: the line between sections.
- `DropdownMenuSubmenu` and `DropdownMenuSubmenuTrigger`: a nested menu, opened from an item with a chevron.
- `DropdownMenuFooter`: a line of quiet text at the bottom, such as a count.
- `DropdownMenuPortal` and `DropdownMenuPopup`: lower-level parts. `DropdownMenuPopup` is the menu surface without positioning.

## States

Hover, keyboard highlight, the current value and disabled items follow [States](../../../../../design/foundations/states.md#usage). In a menu:

- Keep the highlight and the current value apart. The `brand-soft` highlight shows where the pointer or keyboard is; the check mark and bold text show which value is chosen. Never use the highlight to mark the current value.
- Show a disabled item with `foreground-disabled` text and icon, and nothing else.

## Behavior

- The menu opens below its trigger, aligned to the trigger's start edge, and moves or flips when it meets the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- Choosing an action closes the menu. Choosing a radio or checkbox item leaves it open, so people can see the result.
- Esc and a click outside close the menu.

## Content

- Write item labels in Title Case: Copy Link, Reply in Thread ([Writing](../../../../../design/content/writing.md#casing)).
- Make the label of an item that opens a dialog the dialog's title ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- DropdownMenu wraps the Base UI Menu. It provides the `menu` role, the item roles, arrow-key movement, typeahead, Esc, and focus return to the trigger.
- Name the menu after the thing it acts on: put `aria-label` on `DropdownMenuContent` ("Message from Wug").
- Give an icon-only trigger, such as ⋯, an `aria-label` ("More Actions").
- Make every row in the menu a menu item, so arrow keys reach it. This includes each quick reaction: give it an `aria-label` ("React with thumbs up") and hide the drawing from assistive technology.
- Leave item icons decorative; the label names the action.

## Rules

- Don't color destructive items such as Delete or Stop. They open an [AlertDialog](../alert-dialog/alert-dialog.md), whose orange or red button carries the consequence ([Feedback](../../../../../design/patterns/feedback.md#confirming)).
- Use the same separator between every two sections of a menu.
- Don't put a control that submits a form value in a menu; use a [Select](../select/select.md).

### The message menu

The message menu starts with the quick reactions ([Conversation](../../../../../design/patterns/conversation.md#actions); sizes in [Brand](../../../../../design/foundations/brand.md#reactions)).

- End the row of quick reactions with a `smile-plus` icon button that opens every emoji.
- Put one separator between the reactions and the first action, then group the actions into sections.
