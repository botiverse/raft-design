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

A dropdown menu is a list of actions on one thing (a message, a channel, a task, an agent), opened from a More button (⋮ for one thing's menu, ⋯ at the end of a row of actions; [Iconography](../../../../../design/foundations/iconography.md#meanings)). It can also hold a setting-style choice, such as sort order or status, with a check mark on the current value. Right-click on desktop and press and hold on a phone open the same menu as a [ContextMenu](../context-menu/context-menu.md).

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
- `DropdownMenuLinkItem` (experimental, from `@botiverse/raft-ui/wip`): a choice that is another page, such as the same page in another language. It is a link, so it opens in a new tab and can be copied; `current` marks the page being shown with the same check mark and bold text as a radio item.
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
- The menu keeps clear of the frame insets: where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stops 8px from that part, not from the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.
- Choosing an action or a radio item closes the menu. A radio item is one value of a set, so one pick completes the choice, and the open menu would only cover what it changed. Its check mark shows the current value the next time the menu opens. Keep the menu open after a radio pick (`closeOnClick={false}`) only when the menu itself shows the result, such as a warning that appears under the new value.
- Choosing a checkbox item leaves the menu open: each item turns one thing on or off, and people often change several at once.
- Esc and a click outside close the menu.
- An item is as tall as its content: one line is 36px, and a second line, such as a description under the label, adds only its own height, with the same space above and below the text ([Forms](../../../../../design/patterns/forms.md#option-height)). This holds for radio and checkbox items too.

## Content

- Write item labels in Title Case: Copy Link, Reply in Thread ([Writing](../../../../../design/content/writing.md#casing)).
- Make the label of an item that opens a dialog the dialog's title ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- DropdownMenu wraps the Base UI Menu. It provides the `menu` role, the item roles, arrow-key movement, typeahead, Esc, and focus return to the trigger.
- Name the menu after the thing it acts on: put `aria-label` on `DropdownMenuContent` ("Message from Wug").
- Give an icon-only trigger, such as More, an `aria-label` ("More Actions").
- Make every row in the menu a menu item, so arrow keys reach it. This includes each quick reaction: give it an `aria-label` ("React with thumbs up") and hide the drawing from assistive technology.
- Leave item icons decorative; the label names the action.

## Rules

- Don't color destructive items such as Delete or Stop. They open an [AlertDialog](../alert-dialog/alert-dialog.md), whose orange or red button carries the consequence ([Feedback](../../../../../design/patterns/feedback.md#confirming)).
- Use the same separator between every two sections of a menu.
- Don't put a control that submits a form value in a menu; use a [Select](../select/select.md).

### The message menu

The message menu starts with the quick reactions ([Conversation](../../../../../design/patterns/conversation.md#actions); sizes in [Brand](../../../../../design/foundations/brand.md#reactions)).

- Open the menu with the message's full date and time, a `DropdownMenuLabel` (`ContextMenuLabel`) that can't be chosen ([Conversation](../../../../../design/patterns/conversation.md#actions)).
- Then the 7 quick reactions at 22px, each a `MessageReactionQuickButton` that is a menu item, so the arrow keys reach it. End the row with a `smile-plus` icon button that opens every emoji. That is 8 buttons of 36px, so the menu is as wide as the row (316px), wider than its 240px minimum; the actions take the same width.
- Line the reactions up with the actions: `MessageReactionQuickRow` keeps 3px at each side, so the first drawing starts where the items' icons do (10px in), and the column the eye follows down the menu doesn't step out by 3px at the top.
- Put one separator between the reactions and the first action, then group the actions into sections, by what they do to the message (stdrc, 2026-10-20):
  1. **Keep going on this message:** Reply in Thread, Follow Thread or Unfollow Thread (inside a thread, then Mark Thread as Unread), then the task action (Create Task from Message, or Mark as Done and Reopen Task on a task's message). A task's discussion lives in its thread, so the two sit together.
  2. **Take it elsewhere:** Copy Link, Copy Markdown, Forward, Select Message. Nothing changes here. They go from a pointer to the content to sending one message to sending several.
  3. **Just for me:** Save Message or Remove from Saved, and Translate. Nobody else sees these.
- Leave out a section with nothing in it, and its separator with it.
