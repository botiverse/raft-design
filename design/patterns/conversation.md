---
title: Conversation
summary: The timeline of messages and event lines, what a message can hold, its actions, mentions, the composer, threads and search in a conversation.
---

# Conversation

A conversation is one timeline of messages, event lines and dates, with the newest at the bottom. People and agents post the same kind of message, because in Raft they do the same work in the same place; an agent is told apart by its avatar, not by a different kind of message.

## When it applies

Any place people and agents talk: a channel, a direct message, a thread, a task's thread. The message itself is in [MessageItem](../../packages/ui/src/components/message-item/message-item.md). Which places a product has, and what their headers hold, is on the product's own page ([Raft Chat — Channel](../products/raft-chat/channel.md)).

## Structure

```example
conversation-panel/compositions/conversation-panel
```

- The timeline: messages, event lines ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)) and date lines, newest at the bottom.
- Inside a message: mentions, reference chips, blue links, inline code, code blocks, quotes, attachments and action cards.
- Under a message: one row with the task marker, the Saved marker and the reactions, and under it the thread replies, with at most 3 shown as a preview ([MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)).
- At the bottom: the [Composer](../../packages/ui/src/components/composer/composer.md), with the attach buttons on the left of its toolbar, and the As Task checkbox and the send button on the right.

## Rules

### Dates and grouping

- Put a date line before the first message of the timeline and before the first message of each new day: Today, Yesterday, or the weekday and date.
- Merge consecutive messages from the same sender on the same day, with no time limit: a run of messages from one sender reads as one turn.
- Don't merge a message that carries a task or a thread, and don't merge event lines into messages.
- Put a message's time right after its sender, never across the row from it: who said it and when read as one ([MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)).
- On hover, show the time of a merged message in the empty space on its left, without animation.
- On a touch screen, don't show the time of a merged message at rest: a time beside every message repeats the header and makes the list busy, and a tap on a message already does other things. The message menu carries it instead (see [Actions](#actions)).
- Fold 2 or more event lines in a row into one line with a disclosure ("There are 3 task updates"), so a busy agent doesn't push the messages out of view.

### Mentions

- Set a mention of someone else in bold ink, underlined in ink only on hover, like all clickable text ([Clickable text](../foundations/states.md#clickable-text)).
- Show a mention of the person reading as a small yellow sticker: yellow is "you" ([Color](../foundations/color.md#meanings-of-color)).
- Group the @ suggestions by whether people and agents are in the place: those in it first, people and agents together, then those who aren't, dimmed. In a thread, rank the people who replied first.
- After a message mentions someone who isn't in the place, offer to add or notify them in a strip above the composer. Otherwise the mention reaches no one, and nothing says so.

### Actions

- On desktop, show a small toolbar on the top edge of the hovered message: Reply in Thread, Add Reaction, Save Message. Inside a thread, leave out Reply in Thread.
- Put every other action in the message menu. Right-click on desktop and press and hold on a touch screen open the same menu, so an action is in one place on every device.
- Open that menu with the message's full date and time, as a label that can't be chosen: on a touch screen it is the only place a merged message's time shows, and the full date settles which day a long group spans. Arrow keys skip it.
- Make the quick reactions the first row under it, with a separator between them and the actions.
- Don't show the hover toolbar on a touch screen: there is no hover, and press and hold opens the menu instead.
- Let hover only add: the toolbar appears where nothing was, and the header gives it room, so it never covers the name or the time.
- To act on several messages (forward, copy), choose Select Message in the menu; the toolbar for selected messages appears at the bottom of the conversation ([Built from existing parts](../components/overview.md#toolbar-for-selected-messages)).

```example
message-item/compositions/context-menu-showcase
```

### The composer

- Make the send button the conversation's one pink button: sending is what the screen exists for ([Color](../foundations/color.md#meanings-of-color)).
- Name the place in the placeholder: "Message #launch-week", "Message @Martin".
- On a touch screen held upright, make Return insert a new line and send with the send button, because there is no Shift key to reach for. Elsewhere Return sends and Shift+Return inserts a new line.
- In a product with tasks, the As Task checkbox makes the message sent a task ([Tasks](./tasks.md#tasks-in-a-conversation)).

### Threads

```example
thread-panel/thread-panel
```

- Open a thread in the side panel ([ThreadPanel](../../packages/ui/src/components/thread-panel/thread-panel.md)), so the conversation it came from stays in view. It sits beside the conversation or covers it, depending on the width ([Responsive layout](./responsive.md)); on a phone it always covers the conversation, with Back.
- Title it Thread, with the place and the number of replies as its subtitle: "#launch-week · 4 replies". Selecting the title scrolls to the top of the thread.
- Show the message the thread started from at the top, then the replies, then the composer. A thread has no tabs and no As Task.
- When the person isn't in the place the thread belongs to, replace the composer with a pink Join button ("Join channel to reply" in Raft Chat), so the reason they can't reply is also the way to fix it.
- Put the agents that follow the thread at the right of its header, as an avatar stack and a count.

### Search

- Group results by kind: places and people first, then messages. Group hits in one thread under that thread.
- Show matched words as small yellow stickers ([Search](../../packages/ui/src/components/search/search.md)).
- Highlight the message a result jumps to as in [Navigation](./navigation.md#going-somewhere).

## Related

- [Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md): event lines, status and action cards.
- [Navigation](./navigation.md): reference chips and links.
- [Comments](./comments.md): comments on a document, beside the passage they are about; they are not messages.
- [Built from existing parts](../components/overview.md#built-from-existing-parts): link cards, forwarded messages, translations and multi-select.
