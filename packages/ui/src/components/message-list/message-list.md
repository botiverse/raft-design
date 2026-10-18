---
title: MessageList
summary: The scrolling timeline of a conversation or thread, with the date lines, the notice at its start and the marker for limited history.
status: stable
aliases: [Message timeline, Date divider, Timeline view]
category: layout
related: [conversation-panel, thread-panel, message-item, system-message, scroll-area]
---

# MessageList

MessageList is the scroll container of a conversation: it holds the messages, event lines and dates in one column, newest at the bottom ([Conversation](../../../../../design/patterns/conversation.md#structure)). It sits in the body of a [ConversationPanel](../conversation-panel/conversation-panel.md) or a [ThreadPanel](../thread-panel/thread-panel.md) and is the only part of the panel that scrolls.

```example
conversation-panel/compositions/conversation-panel
```

## When to use

| Situation                                             | Use                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| The messages of a conversation or a thread            | MessageList                                                                           |
| One message                                           | [MessageItem](../message-item/message-item.md)                                        |
| An action that happened: a claim, a hand-off          | [SystemMessage](../system-message/system-message.md), inside the list                 |
| An agent's history of actions, outside a conversation | [Timeline](../timeline/timeline.md)                                                   |
| Any other region that scrolls                         | [ScrollArea](../scroll-area/scroll-area.md), or the panel's own `PanelScrollViewport` |

## Anatomy

- `MessageList`: the scroll container. Its props and `ref` go to the element that scrolls, so the caller can read and set the scroll position; `rootClassName` styles the outer element.
- `MessageListNotice`: a centered line in Space Mono at the start of the history, such as "Beginning of messages". `tone="faint"` (the default) sets it in `foreground-hint`, `tone="muted"` in `foreground-muted`.
- `MessageListHistoryLimited`: a small chip with a `line-hairline` outline, in Space Mono, for a history that doesn't go back to the start.
- `MessageListDateDivider`: the date between two `line-hairline` rules, in `text-mono-meta` and `foreground-hint`, drawn like an event line ([SystemMessage](../system-message/system-message.md#rules)).

## Behavior

- The list only scrolls up and down. Wide content, such as a long line of code or a row of tabs, scrolls inside its own container and never widens the messages.
- On desktop the list is a [ScrollArea](../scroll-area/scroll-area.md): its thin scrollbar shows only while the list scrolls.
- Below 768px it uses the panel's native scrolling, without the drawn scrollbar ([Responsive layout](../../../../../design/patterns/responsive.md)).
- Scrolling reaches the end of the list and stops; it doesn't scroll the page behind it.
- raft-ui doesn't load older messages or virtualize a long history. Do both in the product, through the `ref`.

## Content

- Write the notice in sentence case and say what it is the start of: "Beginning of messages", "Beginning of replies".

## Accessibility

- MessageList renders plain elements and adds no role or live region. Name the panel around it after the conversation ([ConversationPanel](../conversation-panel/conversation-panel.md#accessibility)).
- The notice, the date lines and the history marker are text, not controls.
- Put the date in `MessageListDateDivider` in a `<time>` element with `dateTime`, as for an event line's time ([SystemMessage](../system-message/system-message.md#accessibility)).

## Rules

- Leave room above the first message for its hover toolbar ([MessageItem](../message-item/message-item.md#behavior)). A list that opens with a date line already has it.
- Show one thing above the oldest loaded message: a notice while older messages load, the history marker when the history is cut short, or "Beginning of messages" once the start is reached.
