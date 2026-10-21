---
title: InboxItem
summary: The row for something that happened elsewhere and that the person should see — a mention, an approval, a hand-off — with an attention dot while it is unread and its actions in the row.
status: stable
aliases: [Inbox]
layer: collaboration
category: inbox
related: [activity-inbox, notification-center, list-row, badge, checkbox]
---

# InboxItem

An InboxItem is one thing that happened elsewhere and that the person should see: someone mentioned them, an agent waits for their approval, work was handed to them. An unread item has a bold title and a pink attention dot; an action it needs sits in the row. It is the row of [ActivityInbox](../activity-inbox/activity-inbox.md).

```example
activity/compositions/activity-preview
```

## When to use

| Situation                                                              | Use                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Something happened elsewhere that the person should see                | InboxItem, in Activity ([ActivityInbox](../activity-inbox/activity-inbox.md))        |
| The state of the whole server: a computer offline, a quota nearly full | A notification ([NotificationCenter](../notification-center/notification-center.md)) |
| The result of an action the person took                                | [Toast](../toast/toast.md)                                                           |
| Something to read before acting, in a dialog or form                   | [Banner](../banner/banner.md)                                                        |
| A channel, a direct message or a member in a list                      | The sidebar row ([Sidebar](../sidebar/sidebar.md))                                   |

Which message goes where is in [Choosing a component](../../../../../design/components/overview.md#telling-people-something).

## Anatomy

- `InboxItem`: the row. Required.
- `InboxItemTrigger`: an invisible button that covers the whole row and opens the item. Required.
- `InboxItemSelection`: a [Checkbox](../checkbox/checkbox.md) for selecting several items. Optional.
- `InboxItemLeading`: a 36px leading visual before the text: the person's or agent's avatar, or a channel's [IconTile](../icon-tile/icon-tile.md). The divider starts after it. Optional.
- `InboxItemContent`: the text column. Required.
  - `InboxItemContext`: where it happened: a channel, a task, a computer.
  - `InboxItemHeading` with `InboxItemTitle`: what happened, with an optional 14px icon before it.
  - `InboxItemSubtitle`: a second line of context, such as "Thread in #launch-week".
  - `InboxItemBody` or `InboxItemMessage`: the excerpt, starting with `InboxItemSender`.
  - `InboxItemMetadata`: chips for the task, replies and mentions.
  - `InboxItemHoverTarget`: wraps a badge that has a tooltip, so the pointer reaches it (the rest of the text lets the pointer through to the trigger). A click on it still opens the item.
- `InboxItemTrailing`: `InboxItemTimestamp`, `InboxItemActions` and, while unread, the attention dot.
  - `InboxItemMarks`: marks at the end of the excerpt's line: a mention, muted, an unread count. Optional.

## Variants

| Variant             | Use for                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Default             | Items to read: up to 2 lines each for the title and the excerpt, with metadata chips                   |
| `density="compact"` | A conversation list: one line each for the title and the latest message, next to an `InboxItemLeading` |

In `density="compact"` the timestamp and `InboxItemMarks` sit in `InboxItemTrailing`, one beside each line. The unread count there says the row is unread, so `data-unread` only makes the title bold and there is no attention dot. Leave `data-unread` off a muted conversation and show a muted mark in place of its count.

```example
activity/compositions/activity-conversation-list
```

## States

| State                                 | Look                                                                                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unread (`data-unread` on `InboxItem`) | The title in `foreground` at weight 700, and a pink attention dot on the right                                                                                                                                        |
| Read                                  | The title in `foreground-muted` at weight 600; no dot                                                                                                                                                                 |
| `active`                              | The item open beside the list: an `info-soft` wash                                                                                                                                                                    |
| Menu open                             | `data-popup-open` on `InboxItem`, or a menu open from a button in it: `fill-row-open`, a step past the hover; an `active` item keeps `info-soft` ([Row hover](../../../../../design/foundations/states.md#row-hover)) |
| `disabled`                            | No hover, no press; the trigger can't be pressed                                                                                                                                                                      |

```example
activity/compositions/loading-activity
```

## Behavior

- The trigger covers the whole row. Buttons in the row sit above it, and each one can be pressed on its own.
- Divide items with `line-hairline`, starting at the text, or after `InboxItemLeading` when there is one.
- With a mouse, show Mark as Done only while the row is hovered, holds focus, is `active` or has a menu open: give `InboxItemActions` `reveal="hover"`. A list where every row shows its button reads as a wall of buttons, and the row itself is the main target. While the actions show they take the place of the rest of `InboxItemTrailing`: the timestamp, the marks and the attention dot step aside.
- On a touch screen, show Mark as Done at rest and put it in the press-and-hold menu too; a swipe may add a shortcut but never replace it ([Responsive layout](../../../../../design/patterns/responsive.md#touch-screens)). `reveal="hover"` does this: the rest of `InboxItemTrailing` moves over to make room for it.

- In the default density `InboxItemTrailing` takes room only beside the first two lines of `InboxItemContent` (the context line and the title, or the title and the excerpt); the lines after them run the full width, under it. The column is about two lines tall (the timestamp and the dot, or the 32px Mark as Done), so taking room beside every line would only make a phone's narrow rows wrap more and grow taller. In `density="compact"` it stays beside both lines.

- `data-unread` turns on both the bold title and the attention dot. In the default density the dot is how an unread item reads; keep it. In `density="compact"` the unread count in `InboxItemMarks` takes its place, so the dot is off.
- The text lets the pointer through to the trigger, so a badge there gets no hover. Wrap a badge that has a tooltip in `InboxItemHoverTarget`.
- On a touch screen (`pointer: coarse`, at any width) each action in `InboxItemActions` keeps a 44px target and the actions spread 12px apart so their targets don't overlap; with a mouse they stay 32px, 2px apart.

```example
activity/compositions/activity-hover-actions
```

## Content

- Write the context line as where it happened: #launch-week · task #25.
- Write the title as who did what, with a teammate verb: "Martin needs your OK", "Bugen handed off #25" ([Writing](../../../../../design/content/writing.md#voice)).
- Keep the excerpt to at most 2 lines.

## Accessibility

- The parts render native elements through Base UI's `useRender`. `InboxItemTrigger` is a native `button`; with `disabled` it gets `aria-disabled` and ignores clicks.
- Give the trigger an accessible name that names the item: `aria-label="Open Martin needs your OK"`. Set `aria-current` on the trigger of the open item.
- Name the selection checkbox and every icon-only action: `aria-label="Select activity item"`, `aria-label="Mark as done"`.
- Actions with `reveal="hover"` stay in the tab order while hidden, and show as soon as focus reaches the row or them.
- The attention dot is drawn in CSS and isn't announced. Say "unread" in the trigger's name, or add a visually hidden word.

## Rules

- Use ink-outline small buttons for actions in the row, never pink: a list can hold several items that wait for the person at once ([Button](../button/button.md)).
- Lead with who, when there is a who: the person's or agent's avatar. A notice from the system has no who; see [NotificationCenter](../notification-center/notification-center.md#anatomy).
