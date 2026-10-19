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
- `InboxItemContent`: the text column. Required.
  - `InboxItemContext`: where it happened: a channel, a task, a computer.
  - `InboxItemHeading` with `InboxItemTitle`: what happened, with an optional 14px icon before it.
  - `InboxItemSubtitle`: a second line of context, such as "Thread in #launch-week".
  - `InboxItemBody` or `InboxItemMessage`: the excerpt, starting with `InboxItemSender`.
  - `InboxItemMetadata`: chips for the task, replies and mentions.
- `InboxItemTrailing`: `InboxItemTimestamp`, `InboxItemActions` and, while unread, the attention dot.

## States

| State                                 | Look                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Unread (`data-unread` on `InboxItem`) | The title in `foreground` at weight 700, and a pink attention dot on the right |
| Read                                  | The title in `foreground-muted` at weight 600; no dot                          |
| `active`                              | The item open beside the list: an `info-soft` wash                             |
| `disabled`                            | No hover, no press; the trigger can't be pressed                               |

```example
activity/compositions/loading-activity
```

## Behavior

- The trigger covers the whole row. Buttons in the row sit above it, and each one can be pressed on its own.
- Divide items with `line-hairline`, starting at the text.
- On a touch screen, show Mark as Done at rest and put it in the press-and-hold menu too; a swipe may add a shortcut but never replace it ([Responsive layout](../../../../../design/patterns/responsive.md#touch-screens)).

## Content

- Write the context line as where it happened: #launch-week · task #25.
- Write the title as who did what, with a teammate verb: "Martin needs your OK", "Bugen handed off #25" ([Writing](../../../../../design/content/writing.md#voice)).
- Keep the excerpt to at most 2 lines.

## Accessibility

- The parts render native elements through Base UI's `useRender`. `InboxItemTrigger` is a native `button`; with `disabled` it gets `aria-disabled` and ignores clicks.
- Give the trigger an accessible name that names the item: `aria-label="Open Martin needs your OK"`. Set `aria-current` on the trigger of the open item.
- Name the selection checkbox and every icon-only action: `aria-label="Select activity item"`, `aria-label="Mark as done"`.
- The attention dot is drawn in CSS and isn't announced. Say "unread" in the trigger's name, or add a visually hidden word.

## Rules

- Use ink-outline small buttons for actions in the row, never pink: a list can hold several items that wait for the person at once ([Button](../button/button.md)).
- Lead with who, when there is a who: the person's or agent's avatar. A notice from the system has no who; see [NotificationCenter](../notification-center/notification-center.md#anatomy).
