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
  - `InboxItemLeadingBadge`: the thread badge, in the bottom-right corner of the avatar or tile, holding one icon, `ThreadIcon` ([Icons](../icons/icons.md)). Only on a thread row ([The leading image](#the-leading-image)). Optional; experimental, from `@botiverse/raft-ui/wip`.
- `InboxItemContent`: the text column. Required.
  - `InboxItemContext`: where it happened: a channel, a task, a computer.
  - `InboxItemHeading` with `InboxItemTitle`: what happened, with an optional 14px icon before it.
  - `InboxItemSubtitle`: a second line of context, such as "Thread in #launch-week".
  - `InboxItemBody` or `InboxItemMessage`: the excerpt, starting with `InboxItemSender`.
  - `InboxItemMetadata`: chips for the task, replies and mentions.
  - `InboxItemHoverTarget`: wraps a badge that has a tooltip, so the pointer reaches it (the rest of the text lets the pointer through to the trigger). A click on it still opens the item.
- `InboxItemTrailing`: `InboxItemTimestamp`, `InboxItemActions` and, while unread, the attention dot.
  - `InboxItemMarks`: marks at the end of the excerpt's line: a mention, muted, an unread count. Optional.
- `InboxItemSkeleton`, in an `InboxItemSkeletonList`: a row that stands in for an `InboxItem` while the list loads ([Loading](#loading)). Optional; experimental, from `@botiverse/raft-ui/wip`.

### The leading image

The leading image shows the conversation the item lives in. A thread is not a conversation of its own, so its row shows the conversation the thread lives in, with the thread badge in the corner:

| Row                          | Leading image                                                                     | Second line                      |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| A channel                    | The channel's IconTile, with the channel's own icon                               | The latest message: "Avery: …"   |
| A direct message             | The other person's or agent's avatar; an agent's with its presence light          | The latest message               |
| A thread in a channel        | The channel's IconTile, with the thread badge                                     | "#launch-week · Mira: …"         |
| A thread in a direct message | The other person's or agent's avatar, with the thread badge and no presence light | "Lagoon: …", without "@Lagoon ·" |

```example
inbox-item/compositions/thread-rows
```

- **A channel's tile shows that channel's own icon**, the same as in the sidebar and the channel header: `hash` for a channel, `lock` for a private one, `git-branch` for a joint channel, a hash with a globe for one readable on the public page ([Raft Chat channel](../../../../../design/products/raft-chat/channel.md)). A bare `#` on a joint or private channel says it is an ordinary one, on its own row and on its threads' rows alike.
- **Show the conversation, not a channel shape.** A `#` tile on a thread in a direct message would say the thread lives in a channel. The avatar says who the conversation is with, and it is the face the person already knows from that direct message.
- **The badge is the same on a tile and on an avatar**: the same size, in the same corner, so "this is a thread" reads the same in both columns of the list.
- **On an avatar, the badge takes the presence light's corner.** One corner holds one mark ([Avatar](../avatar/avatar.md#the-corner)). The row is about the thread, not about how the agent is doing now, so the badge wins and the thread row shows no presence light. The light stays on the direct message's own row.
- **The second line doesn't repeat the leading image.** In a direct message the avatar already names the other side, so "@Lagoon · Lagoon: …" says the name twice; the line starts with the latest message. A tile doesn't name its channel, so a channel thread keeps "#channel ·" before it.
- **A screen reader still hears where the thread is.** The row's trigger `aria-label` keeps the conversation's name ("Thread in a direct message with Lagoon: …") even though "@Lagoon ·" is no longer on screen, so someone who doesn't see the avatar still knows which direct message the thread belongs to.
- **Until the direct message has loaded, lead with an `IconTile` holding `DirectMessageIcon`**, never a `#` tile: the row must not claim a channel it isn't in, even for a moment.
- **The thread follows its conversation's settings.** A thread in a muted direct message is muted too, the same as a thread in a muted channel.

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

| State                                 | Look                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unread (`data-unread` on `InboxItem`) | The title in `foreground` at weight 700, and a pink attention dot on the right                                                                                                                                                              |
| Read                                  | The title in `foreground-muted` at weight 600; no dot                                                                                                                                                                                       |
| `active`                              | The item open beside the list: an `info-soft` wash                                                                                                                                                                                          |
| Menu open                             | `data-popup-open` on `InboxItem`, or a menu open from a button in it: `fill-subtle`, the same subtle tier as the hover; an `active` item keeps `info-soft` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)) |
| `disabled`                            | No hover, no press; the trigger can't be pressed                                                                                                                                                                                            |

### Loading

While the list loads, show `InboxItemSkeleton` rows in an `InboxItemSkeletonList`. Each one is an `InboxItem` built from the loaded row's parts, with a bar in each line in place of its text, so it has the loaded row's padding, dividers and line heights and nothing moves when the items arrive ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)). Give it the shape of the rows it stands for: `context` for a context line, `leading` for an avatar or tile, and the same `density`. The list shows its rows only once the wait passes 1 second, and is empty until then: a list skeleton is only for a slow load, so it waits by default ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)). Pass `delay={0}` to show them at once. Mark the region that stays when the items arrive, such as the panel or the viewport, `aria-busy` while the list loads.

```example
activity/compositions/loading-activity
```

```example
activity/compositions/loading-conversation-list
```

## Behavior

- The trigger covers the whole row. Buttons in the row sit above it, and each one can be pressed on its own.
- Divide items with `line-hairline`, starting at the text, or after `InboxItemLeading` when there is one.
- With a mouse, show Mark as Done only while the row is hovered, holds focus, is `active` or has a menu open: give `InboxItemActions` `reveal="hover"`. A list where every row shows its button reads as a wall of buttons, and the row itself is the main target. While the actions show they take the place of the rest of `InboxItemTrailing`: the timestamp, the marks and the attention dot step aside.
- On a touch screen, show Mark as Done at rest and put it in the press-and-hold menu too; a swipe may add a shortcut but never replace it ([Responsive layout](../../../../../design/patterns/responsive.md#touch-screens)). `reveal="hover"` does this: on a touch screen the button shows at rest, and the rest of `InboxItemTrailing` moves over to make room for it.
- On a phone, Activity rows leave it out at rest: Mark as Done is the left swipe and the press-and-hold menu's item (stdrc, 2026-10-23), so leave `InboxItemActions` out of the row there, but keep the button for screen readers, visually hidden (`sr-only`) at the end of the row. A screen reader can't swipe a row, and the web has no way to give a row an action of its own; as a hidden button it is the next thing after the row, named "Mark as Done". The swipe's distances, its two looks (soft until a release would apply, then solid `success` with ink), its word ("Done"), its tick on Android and its 8-second Undo are in [Responsive layout](../../../../../design/patterns/responsive.md#touch-screens). raft-ui has no swipeable row yet; until it does, the product draws the swipe around the row.

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
- On a thread row, start the second line with the channel only when the leading image is a channel's tile: "#launch-week · Mira: …". In a direct message, start it with the latest message: "Lagoon: …" ([The leading image](#the-leading-image)).

## Accessibility

- The parts render native elements through Base UI's `useRender`. `InboxItemTrigger` is a native `button`; with `disabled` it gets `aria-disabled` and ignores clicks.
- Give the trigger an accessible name that names the item: `aria-label="Open Martin needs your OK"`. Set `aria-current` on the trigger of the open item.
- Name the selection checkbox and every icon-only action: `aria-label="Select activity item"`, `aria-label="Mark as done"`.
- Actions with `reveal="hover"` stay in the tab order while hidden, and show as soon as focus reaches the row or them.
- When a jump started from the keyboard lands on an item, such as Back to the list the item was opened from, move focus to its `InboxItemTrigger`, not to the row ([Located](../../../../../design/foundations/states.md#located)): the trigger is already a focusable button with the item's name, and the row draws the inset ring around it, so the row needs no `tabIndex` of its own.
- The attention dot is drawn in CSS and isn't announced. Say "unread" in the trigger's name, or add a visually hidden word.
- `InboxItemLeadingBadge` is hidden from assistive technology. Say "thread" in the trigger's name: `aria-label="Open thread with Lagoon"`.
- `InboxItemSkeleton` is hidden from assistive technology. `InboxItemSkeletonList` isn't `aria-busy`: it goes away when the items arrive, so a screen reader would never hear it finish. Put `aria-busy` on the container that stays, such as `ActivityInboxPanel`, while the list loads.

## Rules

- Use ink-outline small buttons for actions in the row, never pink: a list can hold several items that wait for the person at once ([Button](../button/button.md)).
- Lead with who, when there is a who: the person's or agent's avatar. A notice from the system has no who; see [NotificationCenter](../notification-center/notification-center.md#anatomy).
- Lead a thread row with the conversation it lives in: the channel's tile, or in a direct message the other side's avatar, each with the thread badge in its corner. Never give a thread in a direct message a `#` tile, and never show a presence light on a thread row ([The leading image](#the-leading-image)).
- Load a list of items as flat `InboxItemSkeleton` rows, never as cards: no border, card or gap the loaded list doesn't have ([Loading](#loading)).
