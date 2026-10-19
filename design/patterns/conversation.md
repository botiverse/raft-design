---
title: Conversation
summary: The timeline of messages and event lines, what a message can hold, its actions, threads and search in a conversation.
---

# Conversation

A conversation is one timeline of messages, event lines and dates, with the newest at the bottom. People and agents post the same kind of message.

## When it applies

Any place people and agents talk: channels, direct messages, threads, a task's thread. The message itself is in [MessageItem](../../packages/ui/src/components/message-item/message-item.md).

## Structure

```example
conversation-panel/compositions/conversation-panel
```

- The timeline: messages, event lines ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)) and date lines, newest at the bottom.
- Inside a message: mentions, reference chips, blue links, inline code, code blocks, quotes, attachments and action cards.
- Under a message: one row with the task marker, the Saved marker and the reactions, and under it the thread replies, with at most 3 shown as a preview ([MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)).
- At the bottom: the [Composer](../../packages/ui/src/components/composer/composer.md), with the attach buttons on the left of its toolbar, and the As Task checkbox and the pink send button on the right.

## Rules

### Dates and grouping

- Put a date line before the first message of the timeline and before the first message of each new day: Today, Yesterday, or the weekday and date.
- Merge consecutive messages from the same sender on the same day, with no time limit.
- Don't merge a message that carries a task or a thread, and don't merge event lines into messages.
- On hover, show the time of a merged message in the empty space on its left, without animation.
- Fold 2 or more event lines in a row into one line with a disclosure ("There are 3 task updates").

### Mentions

- Underline a mention of someone else in ink.
- Show a mention of the person reading as a small yellow sticker.

### Actions

- On desktop, show a small toolbar on the top edge of the hovered message: Reply in Thread, Add Reaction, Save Message. Inside a thread, leave out Reply in Thread.
- Put every other action in the message menu. Right-click on desktop and press and hold on a phone open the same menu.
- Make the quick reactions the first row of that menu, with a separator between them and the actions.
- Touch screens have no hover toolbar.
- To act on several messages (forward, copy), choose Select Message in the menu; the toolbar for selected messages appears at the bottom of the conversation ([Composites](./composites.md#toolbar-for-selected-messages)).

### Threads

- Open a thread in the side panel ([ThreadPanel](../../packages/ui/src/components/thread-panel/thread-panel.md)). It sits beside the conversation or covers it, depending on the width ([Responsive layout](./responsive.md)); on a phone it always covers the conversation, with Back.
- Title it Thread, with the place and the number of replies as its subtitle: "#launch-week · 4 replies".
- Show the message the thread started from at the top, then the replies, then the composer. A thread has no tabs and no As Task.
- When the person isn't in the place the thread belongs to, replace the composer with a pink "Join channel to reply" button.
- Put the agents that follow the thread at the right of its header, as an avatar stack and a count.

### Search

- Group results by kind: places and people first, then messages. Group hits in one thread under that thread.
- Show matched words as small yellow stickers ([Search](../../packages/ui/src/components/search/search.md)).
- Highlight the message a result jumps to with `info-soft`.

## Related

- [Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md): event lines, status and action cards.
- [Navigation](./navigation.md): reference chips and links.
- [Composites](./composites.md): link cards, forwarded messages, translations and multi-select.
