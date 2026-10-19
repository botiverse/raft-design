---
title: Raft Chat — Channel
summary: A channel — its header and details, its Chat, Tasks and Files tabs, its composer, how tasks are made in it, and its threads.
---

# Raft Chat — Channel

A channel is a place where people and agents share one timeline, with the composer at the bottom. On a phone it is a pushed page; on desktop it fills the main area. Its chat, tasks and files are three tabs of the same place. The timeline, messages, the composer and threads follow [Conversation](../../patterns/conversation.md); this page holds only what a Raft Chat channel adds.

## Structure

From top to bottom:

1. **The header** (`PanelHeader`): the location tile, the channel name, and a subtitle; on a phone, Back before them. The subtitle is the working line ([Working agents](../../people-and-agents/working-agents.md#rows-and-subtitles)), then the channel's description. On the right, two icon buttons: Search ("Search this channel") and Settings ("Channel details and settings"), which opens the channel details.
2. **Chat / Tasks / Files**: the tabs, with the icons `message-square`, `list-todo` and `paperclip`.
3. **The timeline**, newest at the bottom.
4. **The composer**.

```example
conversation-panel/compositions/conversation-panel
```

## Rules

- Use `hash` for a channel's icon, `lock` for a private channel, `git-branch` for a joint channel, and a hash with a globe for a channel readable on the public page. The same icon is in the location tile (27px) in the header, on a phone too, and in the row's 19px icon box in the sidebar and on Home.
- Title the pushed pages by what they show: a channel with its location tile, a direct message with the other person's avatar, a thread with no icon.

### The channel details

- Open the details from the Settings button as a drawer from the right ([Raft Chat](./README.md#overlays)). It closes as in [Navigation](../../patterns/navigation.md#closing).
- Put the channel's name, its visibility (Public, Private or Joint) and its description at the top. Then the members as a row of avatars with an add tile, which opens the member list inside the drawer; then the channel's settings, its preferences (mute, collapse long messages), Stop All Agents and Leave Channel.
- When someone closes the drawer with unsaved edits, ask whether to save or discard them.

### Chat, tasks and files

- The three tabs follow [Navigation](../../patterns/navigation.md#several-views-of-one-place): the order people give them is kept for every channel.
- Show the Tasks tab as described in [Tasks](./tasks.md#a-channels-tasks-tab).
- Show the Files tab as the list of files posted in the channel; a file opens in the preview.

### The composer in a channel

- Put Attach media and Attach file on the left of the toolbar. ⌘ or Ctrl + Shift + Enter sends a task even when As Task isn't checked.
- Group the @ suggestions as "In this channel", "Not in this channel", Computers and Apps ([Conversation](../../patterns/conversation.md#mentions)).

### Tasks in the conversation

Tasks in the timeline follow [Tasks](../../patterns/tasks.md#tasks-in-a-conversation).

- Create a task with As Task in the composer, Convert to Task in the message menu, or Create Task in the channel's Tasks tab.
- Let people mark a task done, and reopen it, from the message menu.

### Threads

- Put "2 Agents following" beside the followers' avatar stack, then a menu (Focus mode, Search in thread, View in channel, Follow Thread) at the right of the thread's header, then × on wide screens.
