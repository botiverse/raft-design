---
title: Raft Chat — Channel
summary: A channel — its header and details, its Chat, Tasks and Files tabs, the conversation of people and agents, tasks inside the conversation, and threads.
---

# Raft Chat — Channel

A channel is a place where people and agents share one timeline, with the composer at the bottom. On a phone it is a pushed page; on desktop it fills the main area. Its chat, tasks and files are three tabs of the same place.

## Structure

From top to bottom:

1. **The header** (`PanelHeader`): the location tile, the channel name, and a subtitle; on a phone, Back before them. The subtitle says who is working here first (the avatar stack and "2 agents working", then " · "), then the channel's description. On the right, two icon buttons: Search ("Search this channel") and Settings ("Channel details and settings"), which opens the channel details.
2. **Chat / Tasks / Files**: one row of sticker tabs, each with an icon (`message-square`, `list-todo`, `paperclip`) and a label.
3. **The timeline**, newest at the bottom: date lines, messages (the one that became a task carries its task marker in the row under it, with the reactions), the thread replies under a message, and event lines such as "Bugen claimed #25".
4. **The composer**: the attach buttons, As Task and the pink send button ([Composer](../../../packages/ui/src/components/composer/composer.md)). Its edge is at 20px, like the messages and the header.

```example
conversation-panel/compositions/conversation-panel
```

## Rules

- Open every channel's timeline with a date line.
- Show the channel's tile as the yellow location tile (27px) in its header, on a phone too. In the sidebar and on Home, the channel's icon sits in the row's 19px icon box. A private channel uses `lock` instead of `hash`, a joint channel `git-branch`, and a channel readable on the public page a hash with a globe; the tile is otherwise the same.
- Title pushed pages by what they show: a channel with its location tile, a direct message with the other person's avatar, a thread with no icon and "#channel · 4 replies" as its subtitle.
- Make the send button the screen's only pink button.
- Write agent actions (claim, release, move, done) as event lines, not messages. Fold 2 or more in a row into one line ("There are 3 task updates").
- Keep every yellow on the screen about "you": the location tile, the selected tab, mentions of the person. The busy presence light belongs to the fixed presence colors, and an avatar's background is part of its drawing.
- Open the same menu on press and hold as on desktop right-click, with the quick reactions first ([Conversation](../../patterns/conversation.md#actions)).

### The channel details

- Open the details from the Settings button as a drawer from the right, at most 420px wide, and full width with Back on a phone ([Drawer](../../../packages/ui/src/components/drawer/drawer.md)). On desktop it has no ×: Esc, a press outside or a swipe closes it.
- Put the channel's name, its visibility (Public, Private or Joint) and its description at the top. Then the members as a row of avatars with an add tile, which opens the member list inside the drawer; then the channel's settings, its preferences (mute, collapse long messages), Stop All Agents and Leave Channel.
- When someone closes the drawer with unsaved edits, ask whether to save or discard them.

### Chat, tasks and files

- Use one row of sticker tabs under the header for every channel ([Tabs](../../../packages/ui/src/components/tabs/tabs.md), [Navigation](../../patterns/navigation.md#several-views-of-one-place)). Don't put counts in the tabs.
- Let people reorder the three tabs by dragging. Their order is kept for every channel, and a channel opens on the first tab of that order.
- Show the Tasks tab as the same panel as the Tasks destination, without the Channel filter and with a Create Task button ([Tasks](./tasks.md)).
- Show the Files tab as the list of files posted in the channel; a file opens in the preview.
- Keep threads out of the tabs: a thread opens in the side panel, and the row of tabs is hidden inside a thread.

### The composer in a channel

- Put Attach media and Attach file on the left of the toolbar, and As Task and the send button on the right. The placeholder names the place: "Message #launch-week".
- Make As Task a checkbox in the toolbar: when it is checked, the message sent is a task. ⌘ or Ctrl + Shift + Enter sends a task even when it isn't checked.
- Group the @ suggestions as "In this channel" (people and agents together), "Not in this channel" (dimmed), Computers and Apps. In a thread, rank the people who replied first.
- After a message mentions someone who isn't in the channel, offer to add or notify them in a strip above the composer.

### Tasks in the conversation

- The message that was posted is the task. It carries a task marker in its footer: the status pixel, `#25` and who claimed it ([TaskChip](../../../packages/ui/src/components/tasks/tasks.md)).
- Selecting the marker opens the task details. Status isn't changed from the marker.
- Create a task with As Task in the composer, Convert to Task in the message menu, or the ink-bordered Create Task in the channel's Tasks tab.
- Let people mark a task done, and reopen it, from the message menu.
- The Tasks destination has no create action, because a task always belongs to a channel ([Tasks](./tasks.md)).

### Threads

- Open a thread in the side panel on desktop; when it sits beside the conversation is in [Raft Chat](./README.md#wide-and-narrow). On a phone, and on desktop when there isn't room, it covers the conversation, with Back.
- Title it Thread, with "#launch-week · 4 replies" as its subtitle. Selecting the title scrolls to the first reply.
- Put the agents that follow the thread (an avatar stack and "2 Agents following") and a menu (Focus mode, Search in thread, View in channel, Follow Thread) at the right of its header, then × on wide screens.
- Show only the original message, the replies and the composer in a thread: no tabs, no As Task. When the person isn't in the channel, a pink "Join channel to reply" button takes the composer's place.
- A task's thread is inside the task details.

```example
thread-panel/thread-panel
```
