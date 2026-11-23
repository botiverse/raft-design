---
title: DropdownMenu
summary: A list of actions on one thing, opened from a button, that can also hold a setting-style choice with a check mark on the current value.
status: stable
aliases: [Menu]
layer: core
category: overlays
related: [context-menu, select, popover, dialog, alert-dialog, drawer]
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
- Show a disabled item with `foreground-disabled` text and icon, and nothing else. The one exception is an item an app has disabled in an item card's More menu: it shows the app's reason as a second line, because a menu item has no tooltip and the app's reason is the only way to learn why ([PreviewCard](../preview-card/preview-card.md#item-card)).

## Behavior

- The menu opens below its trigger, aligned to the trigger's start edge, and moves or flips when it meets the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- The menu keeps clear of the frame insets: where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stops 8px from that part, not from the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.
- Choosing an action or a radio item closes the menu. A radio item is one value of a set, so one pick completes the choice, and the open menu would only cover what it changed. Its check mark shows the current value the next time the menu opens. Keep the menu open after a radio pick (`closeOnClick={false}`) only when the menu itself shows the result, such as a warning that appears under the new value.
- Choosing a checkbox item leaves the menu open: each item turns one thing on or off, and people often change several at once.
- Esc and a click outside close the menu. A click into an embedded frame (an `<iframe>`, cross-origin too) outside the menu counts as a click outside.
- An item is as tall as its content: one line is 36px, and a second line, such as a description under the label, adds only its own height, with the same space above and below the text ([Forms](../../../../../design/patterns/forms.md#option-height)). This holds for radio and checkbox items too.

## Content

- Write item labels in sentence case: Copy link, Reply in thread ([Writing](../../../../../design/content/writing.md#casing)).
- Make the label of an item that opens a dialog the dialog's action. In an item's own menu, leave the item out: Rename opens Rename Artifact, whose title names it ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- DropdownMenu wraps the Base UI Menu. It provides the `menu` role, the item roles, arrow-key movement, typeahead, Esc, and focus return to the trigger.
- Name the menu after the thing it acts on: put `aria-label` on `DropdownMenuContent` ("Message from Wug").
- Give an icon-only trigger, such as More, an `aria-label` ("More actions").
- Make every row in the menu a menu item, so arrow keys reach it. This includes each quick reaction: give it an `aria-label` ("React with thumbs up") and hide the drawing from assistive technology.
- Leave item icons decorative; the label names the action.

## Rules

- Don't color destructive items such as Delete or Stop. They open a confirmation, a [Dialog](../dialog/dialog.md#variants) at `size="sm"`, whose orange or red button carries the consequence ([Feedback](../../../../../design/patterns/feedback.md#confirming)). The warning comes once, where the person decides, and the menu stays one quiet list. iOS, Material and many web apps color such an item red instead, and macOS doesn't; Raft keeps it uncolored (stdrc, 2026-11-12, #proj-raft-ui:95c3f384).
- Use the same separator between every two sections of a menu.
- Don't put a control that submits a form value in a menu; use a [Select](../select/select.md).

### Sections and their order

A menu is read from the top, and the first items are the easiest to reach. Its sections answer two different questions: which actions go together (sections), and which section comes first (order). The object decides the sections; where the menu opens decides the order (cindyz, 2026-11-22, #proj-raft-ui:edecc8c7).

**Sections.** Put the actions on one object together, and the object the person opened the menu on first: a message, its thread, the column it shows in. Within one object, split the actions by what they change:

1. **Use it:** open, look, reply, react, move it on (Mark as Done, Create task from message). The person stays with the thing.
2. **Take its content out:** Quote, Copy link, Copy Markdown, Forward, Download, Open in browser. The thing doesn't change. Who can see goes here too, right after Copy link: people change who can see something to share it.
3. **Only for me:** what others don't see, in two runs: how it reaches me (Follow, Mark as unread, Notifications, Mute) and where it sits for me (Pin, Move to section, Move left and right).
4. **Its settings:** what everyone sees change: Rename, Edit, Settle, Start and Stop.
5. **End it:** Leave, Close chat, Archive, Sign out, Delete.
6. **Tell Raft:** Report abuse, View context.

When one object has only two or three actions, keep them one section rather than splitting them by what they change: Reply in thread, Follow thread and Mark thread as unread are one section of the message menu. A menu of three items needs at most one separator, under the item used most.

**Order.** Ask what the thing is where this menu opens, and put the section that serves that first. The same thing plays different parts in different places, so the same sections come in a different order:

| Where the menu opens                         | The thing is                | First section                        |
| -------------------------------------------- | --------------------------- | ------------------------------------ |
| A message in a conversation                  | A turn in a conversation    | Its thread and task                  |
| A thread's or task's header, an Artifact's ⋯ | Work the person follows     | Follow, then comments and versions   |
| A conversation's row in the sidebar          | A place to look at or not   | Mark as read, Notifications          |
| A row in Activity                            | A notification to handle    | Mark as read, Mark as Done, Unfollow |
| Saved, a public Artifact, a browser tab      | Content to take away        | Take its content out                 |
| An agent's or person's profile               | Someone to reach            | Direct message, Call                 |
| A computer, a connection, a sidebar section  | Something to run or arrange | Create agent, Reauthorize, Sort      |

Then put the other sections of 1 to 3 by how close they are to that part, and correct it with usage data where there is some. Sections 4, 5 and 6 always come last, in that order: they are used least and cost the most, so no menu moves them up. An action that already has a button where the menu opens, such as Reply with the composer below or a section's +, doesn't need to lead its menu.

- Put a new action at the end of its section, and move it up when usage data shows it is used more than the items above it.
- Give the same thing the same order wherever its menu opens (a header's ⋯, right-click, a long press), even when some of them show fewer items. A thing that plays a different part (a message in a conversation, a message in Saved) can take a different order.
- Give a pair of toggles one place: Follow and Unfollow swap in place.
- Give every item in a menu an icon, and no two items of one menu icons that look alike: people scan a menu by its icons ([Iconography](../../../../../design/foundations/iconography.md#meanings)).

### The message menu

The message menu starts with the quick reactions ([Conversation](../../../../../design/patterns/conversation.md#actions); sizes in [Brand](../../../../../design/foundations/brand.md#reactions)).

- The 7 quick reactions at 22px, each a `MessageReactionQuickButton` that is a menu item, so the arrow keys reach it. End the row with a `smile-plus` icon button that opens every emoji. That is 8 buttons of 36px, so the menu is as wide as the row (316px), wider than its 240px minimum; the actions take the same width.
- Line the reactions up with the actions: `MessageReactionQuickRow` keeps 3px at each side, so the first drawing starts where the items' icons do (10px in), and the column the eye follows down the menu doesn't step out by 3px at the top.
- Put one separator between the reactions and the first action, then the sections ([Sections and their order](#sections-and-their-order); stdrc 2026-10-20, revised by cindyz 2026-11-22):
  1. **Its thread:** Reply in thread; Follow thread or Unfollow thread; Mark thread as unread. Inside a thread there is no Reply, and Follow and Mark as unread act on that thread.
  2. **Its task:** Create task from message, or Mark as Done and Reopen task on a task's message. A task's discussion lives in its thread, so it comes right after.
  3. **Its content:** Quote, Copy Markdown, Copy link, Forward, Select text (touch only), Select message. Nothing changes here. Copy Markdown keeps the message's formatting, which selecting the text and copying loses; it is the menu's most used item.
  4. **Just for me:** Save message or Remove from Saved, and Translate. Nobody else sees these.
  5. **Tell Raft:** View context, on an agent's message.
- Leave Mark channel as unread out of the message menu: it acts on the conversation, and the conversation's own menu has it.
- Leave out a section with nothing in it, and its separator with it.
