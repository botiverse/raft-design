---
title: MessageReplies
summary: The thread under a message — a gray block with the reply count, a pink count of new replies and up to 3 previews — that opens the thread as one control.
status: stable
aliases: [Thread replies]
category: content
related: [message-item, thread-panel, system-message]
---

# MessageReplies

The thread summary under a message: a soft gray block that says how many replies there are, shows a pink count when some are new, and previews the latest replies. The whole block is one control that opens the thread.

```example
message-replies/compositions/default
```

## When to use

| Situation                              | Use                                                                                                                                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A message has replies in a thread      | MessageReplies, under the message's body                                                                                                                                                      |
| A link to a thread inside running text | A reference chip ([MessageItem](../message-item/message-item.md#in-the-body))                                                                                                                 |
| The thread itself                      | [ThreadPanel](../thread-panel/thread-panel.md): beside the conversation on desktop, covering it with Back on a phone ([Conversation](../../../../../design/patterns/conversation.md#threads)) |

## Anatomy

- `MessageReplies`: the block. A `button` by default; render a link when the thread has a URL. Required.
- `MessageRepliesSummary`: the first line. Required.
  - `MessageRepliesSummaryItem`: one fact in it: "4 replies", "1 new", "Draft". Rendered as `strong`, it becomes the pink count of new replies.
- `MessageRepliesItem`: one reply preview, up to 3:
  - a small [Avatar](../avatar/avatar.md);
  - `MessageRepliesItemSender`: the name;
  - `MessageRepliesItemContent`: the start of the reply;
  - `MessageRepliesItemTime`: when it was sent, in Space Mono.

## States

| State                 | Look                                                                |
| --------------------- | ------------------------------------------------------------------- |
| No new replies        | The summary in `foreground-muted`                                   |
| New replies           | The summary in ink, with the count of new replies as a pink sticker |
| A draft in the thread | A Draft item in the summary                                         |

```example
message-replies/compositions/single-unread
```

```example
message-replies/compositions/unread-draft
```

## Behavior

- Selecting anywhere on the block opens the thread.
- The block lines up with the message text and is at most 480px wide.
- Each preview keeps to one line: the content truncates, the name and the time stay.

## Content

- Write the count as "1 reply" or "4 replies", and the new count as "1 new".
- Separate the summary items with a middle dot.
- Show the latest replies, at most 3 ([Conversation](../../../../../design/patterns/conversation.md#structure)).

## Accessibility

- `MessageReplies` is one `button` or link; nothing inside it is focusable.
- Give it an `aria-label` that says which thread it opens, such as "Open the #launch-week checklist thread": its content is long and would otherwise be read in full.
- Hide the separators and the trailing chevron from assistive technology (`aria-hidden`).
- Render each `MessageRepliesItemTime` with `dateTime`.

## Rules

- Put the block on `fill-muted`, without a border: it is part of the message, not a card.
- Show new replies as a pink count with ink type, like every unread count ([States](../../../../../design/foundations/states.md)). Don't use another color for thread replies.
