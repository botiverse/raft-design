---
title: Raft Chat — Channel
summary: A channel — its header and details, its Tasks and Files cards, its composer, how tasks are made in it, and its threads.
---

# Raft Chat — Channel

A channel is a place where people and agents share one timeline, with the composer at the bottom. On a phone it is a pushed page; on desktop it fills the main area. Its tasks and its files open as cards beside the timeline, so people see them while they talk. The timeline, messages, the composer and threads follow [Conversation](../../patterns/conversation.md); this page holds only what a Raft Chat channel adds.

## Structure

From top to bottom:

1. **The header** (`PanelHeader`): the location tile, the channel name, and a subtitle; on a phone, Back before them. The subtitle is the working line ([Working agents](../../people-and-agents/working-agents.md#rows-and-subtitles)), then the channel's description. On the right, four icon buttons: Search ("Search this channel"), Tasks ("Open Tasks"), Files ("Open Files") and Settings ("Channel details and settings"), which opens the channel details.
2. **The timeline**, newest at the bottom.
3. **The composer**.

Beside the timeline and the composer, the Tasks card and the Files card when they are open ([Page structure](../../patterns/page-structure.md#sidebar-and-side-panel)).

```example
conversation-panel/compositions/conversation-panel
```

## Rules

- Use `hash` for a channel's icon, `lock` for a private channel, `git-branch` for a joint channel, and a hash with a globe for a channel readable on the public page. The same icon is in the location tile (27px) in the header, on a phone too, and in the row's 19px icon box in the sidebar and on Home.
- Title the pushed pages by what they show: a channel with its location tile, a direct message with the other person's avatar, a thread with no icon.
- Make the header's Search button search only this channel, on a pushed page whose top is the search field, with no location tile, and which says its scope: In #launch-week. Searching everything from there switches to the Search tab with the same query ([Navigation](../../patterns/navigation.md#search-on-a-phone)).

### The channel details

- Open the details from the Settings button as a drawer from the right ([Raft Chat](./README.md#overlays)). It closes as in [Navigation](../../patterns/navigation.md#closing).
- Put the channel's name, its visibility (Public, Private or Joint) and its description at the top. Then the members as a row of avatars with an add tile, which opens the member list inside the drawer; then the channel's settings, its preferences (mute, collapse long messages), Stop All Agents and Leave Channel.
- When someone closes the drawer with unsaved edits, ask whether to save or discard them.

### Tasks and files

- Make Tasks (`list-todo`) and Files (`paperclip`) toggles in the header (`PanelToggleAction`, [Panel](../../../packages/ui/src/components/panel/panel.md)): pressed, each is a yellow sticker and its card is open. Their labels switch to Close Tasks and Close Files.
- Show no count on either toggle: most tasks are the agents' own business, so the card is there when someone wants to look, not something that asks for attention.
- Close a card with its toggle or its ×; on a phone, with Back. When both are open, Tasks is above Files.
- Keep which cards are open for the person, not per channel: the cards follow them from channel to channel, as the thread column does.
- Give a direct message the same two toggles.
- Show the Tasks card as described in [Tasks](./tasks.md#a-channels-tasks-card).
- Show the Files card as the list of files posted in the channel; a file opens in the preview.

### The composer in a channel

- Put Attach media and Attach file on the left of the toolbar. The composer has no As Task: people send messages, and tasks are created from them ([Tasks in the conversation](#tasks-in-the-conversation)).
- Group the @ suggestions as "In this channel", "Not in this channel", Computers and Apps ([Conversation](../../patterns/conversation.md#mentions)).

### Tasks in the conversation

Tasks in the timeline follow [Tasks](../../patterns/tasks.md#tasks-in-a-conversation).

- Create a task with + in the Tasks card, for a task of the channel with no message, or with Create Task from Message in the message menu. Create Task from Message opens Create Task with the message quoted and its text as the first title; every task created there is linked to the message, and a message can have several.
- Show the tasks created from a message under it, and under the message at the top of its thread.
- Change a task's status in its details or on the Tasks page, not from the message menu.

### Threads

- Put "2 Agents following" beside the followers' avatar stack, then a menu (Focus mode, Search in thread, View in channel, Follow Thread) at the right of the thread's header, then × on wide screens.
