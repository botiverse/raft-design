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

- The timeline: messages, event lines ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)) and dates, newest at the bottom.
- Inside a message: mentions, reference chips, blue links, inline code, code blocks, quotes, attachments, action cards and the evidence strip.
- Under a message: one row of task markers and reactions, and under that the thread replies, with at most 3 shown as a preview ([MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)).
- At the bottom: the [Composer](../../packages/ui/src/components/composer/composer.md).

## Rules

### Grouping

- Merge consecutive messages from the same person on the same day.
- Don't merge a message that carries a task or a thread.
- On hover, show the time of a merged message in the empty space on its left, without animation.

### Mentions

- Underline a mention of someone else in ink.
- Show a mention of the person reading as a small yellow sticker.

### Actions

- On desktop, show a small toolbar on the top edge of the hovered message: Reply in Thread, Add Reaction, Save.
- Put every other action in the message menu. Right-click on desktop and press and hold on a phone open the same menu.
- Make the quick reactions the first row of that menu, with a separator between them and the actions.
- Touch screens have no hover toolbar.

### Threads

- On a phone, open a thread as a pushed page.
- On desktop, open it in the side panel ([ThreadPanel](../../packages/ui/src/components/thread-panel/thread-panel.md)); it covers the conversation when there isn't room ([Responsive layout](./responsive.md)).
- Show only the conversation and the composer in a thread.

### Search

- Group results by kind, and show matched words as small yellow stickers ([Search](../../packages/ui/src/components/search/search.md)).
- Open a selected result in the side panel, and highlight the message it jumps to with `info-soft`.

## Related

- [Agents](./agents.md): event lines, status lines and action cards.
- [Navigation](./navigation.md): reference chips and links.
- [Composites](./composites.md): link cards, forwarded messages, translations and multi-select.
