---
title: Raft Chat — Channel
summary: A channel — its header and details, its Tasks and Files sections, its composer, how tasks are made in it, and its threads.
---

# Raft Chat — Channel

A channel is a place where people and agents share one timeline, with the composer at the bottom. On a phone it is a pushed page; on desktop it fills the main area. Its tasks and its files open as sections beside the timeline, so people see them while they talk. The timeline, messages, the composer and threads follow [Conversation](../../patterns/conversation.md); this page holds only what a Raft Chat channel adds.

## Structure

From top to bottom:

1. **The header** (`PanelHeader`): the location tile, the channel name, and a subtitle; on a phone, Back before them. The subtitle is the working line ([Working agents](../../people-and-agents/working-agents.md#rows-and-subtitles)), then the channel's description. On the right, four icon buttons: Search ("Search this channel"), Tasks ("Open Tasks"), Files ("Open Files") and Settings ("Channel details and settings"), which opens the channel details.
2. **The timeline**, newest at the bottom.
3. **The composer**.

Beside the timeline and the composer, the Tasks section and the Files section when they are open ([Page structure](../../patterns/page-structure.md#sidebar-and-side-panel)).

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

- Make Tasks (`list-todo`) and Files (`paperclip`) toggles in the header (`PanelToggleAction`, [Panel](../../../packages/ui/src/components/panel/panel.md)): pressed, each is a yellow sticker and its section is open. Their labels switch to Close Tasks and Close Files.
- Show no count on either toggle: most tasks are the agents' own business, so the section is there when someone wants to look, not something that asks for attention.
- Close a section with its toggle or its ×; on a phone, with Back. When both are open, Tasks is above Files.
- Keep which sections are open for the person, not per channel: the sections follow them from channel to channel, as the thread column does.
- Give a direct message the same two toggles.
- Show the Tasks section as described in [Tasks](./tasks.md#a-channels-tasks-section).
- Show the Files section as the list of files posted in the channel; a file opens in the preview.

### The composer in a channel

- Put Attach media and Attach file on the left of the toolbar. The composer has no As Task: people send messages, and tasks are created from them ([Tasks in the conversation](#tasks-in-the-conversation)).
- Group the @ suggestions as "In this channel", "Not in this channel", Computers and Apps ([Conversation](../../patterns/conversation.md#mentions)).

### Tasks in the conversation

Tasks in the timeline follow [Tasks](../../patterns/tasks.md#tasks-in-a-conversation).

- Create a task with + in the Tasks section, for a task of the channel with no message, or with Create Task from Message in the message menu. Create Task from Message opens Create Task with the message quoted and its text as the first title; every task created there is linked to the message, and a message can have several.
- Show the tasks created from a message under it, and under the message at the top of its thread.
- Change a task's status in its details or on the Tasks page, not from the message menu.

### Threads

- Put "2 Agents following" beside the followers' avatar stack, then a menu (Focus mode, Search in thread, View in channel, Mark as Unread, Follow Thread) at the right of the thread's header, then × on wide screens.
- Inside the thread, every message's menu has Mark Thread as Unread, after Unfollow Thread: it says "Thread" because the menu is a message's, and it marks the whole thread, not from that message. Both items are the action of the thread's Activity row, with its `message-square-dot` icon: the thread shows unread in its channel and in Activity. The person is still in the thread, so it stays open and stays unread until they leave it, as a channel marked unread does while they are in it. A thread the person doesn't follow has neither item, as its Activity row has none: unfollowing a thread clears its unread at once.

### History behind the plan's window

A Free server shows the last 30 days of a channel, DM, thread or task conversation. Where the shown history starts, the conversation has a history paywall instead of a history notice ([MessageList](../../../packages/ui/src/components/message-list/message-list.md#rules)).

- Put a [Card](../../../packages/ui/src/components/card/card.md) as wide as the message rows where the oldest loaded message would be: `History` in `CardLeading` at 20px (not a lock: a lock is a private channel), a title that says how many messages are hidden and where ("6 earlier messages are older than 30 days", "All 13 messages in this channel…", "The first message and 3 replies…"), one line on what Free shows and what Pro restores, and a `primary` small Upgrade to Pro button. The button opens the upgrade dialog for every role; the dialog decides who pays and who asks an owner.
- Above the card, show the newest two hidden messages as message rows: sender, time and the first 40 characters, at most two lines, fading out toward the top. They are not interactive. Show only chat messages; when only system lines are hidden, show the card alone. In a thread whose first message is hidden too, that message leads.
- Under the card, write the first date line as "Last 30 days · Tuesday, October 20". A thread, which has no date lines, gets a "Last 30 days" line of its own.
- When every message is hidden, put the glimpse and the card on the composer, where the newest messages would be, with "No new messages in the last 30 days" under them in `MessageListNotice` `muted`. The composer stays usable; a new message appears under the card.
- When a link or search opens a message older than 30 days, stop at the card and center on that message: it is evenly muted with its first 80 characters, between lighter neighbors that fade out above and below, and the title says "The message you're looking for is older than 30 days".
- After an upgrade, the card goes and the older messages load above it, without a reload.

