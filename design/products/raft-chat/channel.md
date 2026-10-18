---
title: Raft Chat — Channel
summary: A channel — its top bar, the conversation of people and agents, tasks inside the conversation, and threads.
---

# Raft Chat — Channel

A channel is a pushed page where people and agents share one timeline, with the composer at the bottom. Its chat, tasks and files are views of the same place; how people switch between them is on [Channel views](./channel-views.md).

## Structure

From top to bottom on a phone:

1. **The top bar**: Back, the location tile, the channel name, and a subtitle with who is working here first (the avatar stack and "2 agents working"), then the member count. The overflow button opens the channel details: a drawer on the right on desktop, a whole page on a phone.
2. **Chat / Tasks / Files**, by default as sticker tabs ([Channel views](./channel-views.md)).
3. **The timeline**, newest at the bottom: a date line, messages (the one that became a task carries its task marker and reactions in the row under it), claim and hand-off event lines, and the working agent's status line with a still yellow light.
4. **The composer**: tools, As Task and the pink send button ([Composer](../../../packages/ui/src/components/composer/composer.md)). Its edge is at 16px, like the messages, and its first tool icon lines up with the typed text.

```example
conversation-panel/compositions/conversation-panel
```

## Rules

- Open every channel's timeline with a date line.
- Show the channel's tile as the yellow location tile (27px) in its top bar and panel header, and as a neutral 35px [IconTile](../../../packages/ui/src/components/icon-tile/icon-tile.md) in lists. A private channel uses `lock` instead of `hash`; the tile is otherwise the same.
- Title pushed pages by what they show: a channel with its location tile, a direct message with the other person's avatar, a thread with no icon and the channel as its subtitle.
- Make the send button the screen's only pink button.
- Keep the composer the only ink-bordered box on the screen.
- Write agent actions (claim, hand off, done) as event lines, not messages.
- Keep every yellow on the screen about "you": the location tile, the selected Chat tab, mentions of the person. On the yellow top bar version, the top bar is the frame. The busy presence light belongs to the fixed presence colors, and an avatar's background is part of its drawing.
- Open the same menu on press and hold as on desktop right-click, with the quick reactions first ([Conversation](../../patterns/conversation.md#actions)).

### The composer in a channel

- On desktop, show a row of @ delegation chips above the input: the 2 to 3 agents that have worked in this channel most recently. Each chip is a button that puts the agent's mention into the input; it sits on `fill-muted` with no ink border.
- Group the @ suggestions into agents in this channel, then agents not in it.
- As Task is a checkbox in the composer toolbar: when it is checked, the message sent is a task.

### Tasks in the conversation

- The message that was posted is the task. It carries a task marker in its footer: the status pixel, `#25` and who claimed it ([TaskChip](../../../packages/ui/src/components/tasks/tasks.md)).
- Selecting the marker opens the task. Status isn't changed from the marker.
- Create a task with As Task in the composer (⌘ or Ctrl + Shift + Enter), Convert to Task in the message menu, or the ink-bordered Create Task at the top right of the channel's task view.
- Let people mark a task done straight from the message menu.
- The Tasks destination has no create action, because a task always belongs to a channel ([Tasks](./tasks.md)).

### Threads

- On a phone, open a thread as a pushed page titled Thread, with the channel as its subtitle.
- On desktop, open it in the side panel; when it sits beside the conversation is in [Raft Chat](./README.md#wide-and-narrow).
- Share the side panel between the thread, tasks, files and profiles, one at a time.
- Show only the conversation and the composer in a thread: no tabs, no Join.
- A task's thread is inside the task details.

```example
thread-panel/thread-panel
```

## Differences from the shared patterns

- Whether the top bar of this pushed page is white or yellow is [still open](../../decisions/open-questions.md). On the white version, the location tile is a yellow sticker; on the yellow version it is a white sticker in light mode and yellow in dark mode.
