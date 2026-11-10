---
title: Raft Chat — Channel
summary: A channel — its header and details, its announcement, its Tasks and Files sections, its composer, how tasks are made in it, and its threads.
---

# Raft Chat — Channel

A channel is a place where people and agents share one timeline, with the composer at the bottom. On a phone it is a pushed page; on desktop it fills the main area. Its tasks and its files open as sections beside the timeline, so people see them while they talk. The timeline, messages, the composer and threads follow [Conversation](../../patterns/conversation.md); this page holds only what a Raft Chat channel adds.

## Structure

From top to bottom:

1. **The header** (`PanelHeader`): the location tile, the channel name, and a subtitle; on a phone, Back before them. The subtitle is the channel's description; who is working is not in the header ([Working agents](../../people-and-agents/working-agents.md#rows-and-subtitles)). On the right, four icon buttons: Search ("Search this channel"), Tasks ("Open tasks"), Files ("Open files") and Settings ("Channel details and settings"), which opens the channel details, then Expand when another column is open beside the channel. Where the header runs out of room, the four fold into a ⋯ before Expand, the last first ([Panel](../../../packages/ui/src/components/panel/panel.md#rules)). While the person has hidden the channel's announcement, Show announcement (`megaphone`) comes before the four, and it is the first to fold into ⋯ ([The announcement](#the-announcement)).
2. **The announcement strip**, when the channel has an announcement and the person hasn't hidden it ([The announcement](#the-announcement)).
3. **The timeline**, newest at the bottom.
4. **The composer**, with the line of who is working in the channel, and who is typing, floating just above it ([Who is working here](../../people-and-agents/working-agents.md#who-is-working-here)).

Beside the timeline and the composer, the Tasks section and the Files section when they are open ([Page structure](../../patterns/page-structure.md#sidebar-and-side-panel)).

```example
conversation-panel/compositions/conversation-panel
```

## Rules

- Use `hash` for a channel's icon, `lock` for a private channel, and a hash with a globe for a channel readable on the public page. An external channel, one in the sidebar's External section (it has Guests, a guest server or an open invite, so every joint channel too), uses the external icon, a lock with an arrow pointing out. A joint channel that isn't in the External section yet, because it is still being converted, uses `git-branch`.
- Take a channel's icon from one source, and draw the same icon on every surface: the location tile (27px) in the header, on a phone too, the row's 19px icon box in the sidebar and on Home, Activity and Drafts rows and their badges, search results and filters, channel pickers, forward targets, # suggestions in the composer, the add-members dialog and settings lists. The same channel has to read as the same place wherever it appears. When the sidebar alone showed the external icon, an external channel had one icon in the sidebar and a lock or a `#` in its own header and everywhere else it was named (cindyz, 2026-11-10). In the web app the source is `channelKindIconProps` (slock `components/channel/channelKind.ts`), drawn by `ChannelIcon`; a surface never picks `hash`, `lock` or `git-branch` from the channel's type itself.
- Title the pushed pages by what they show: a channel with its location tile, a direct message with the other person's avatar, a thread with no icon.
- Make the header's Search button search only this channel, on a pushed page whose top is the search field, with no location tile, and which says its scope: In #launch-week. Searching everything from there switches to the Search tab with the same query ([Navigation](../../patterns/navigation.md#search-on-a-phone)).

### The channel details

- Open the details from the Settings button as a drawer from the right ([Raft Chat](./README.md#overlays)). It closes as in [Navigation](../../patterns/navigation.md#closing).
- Give the drawer a one-line head: the channel's name and its visibility (Public, Private or Joint) on desktop, and "Settings · #launch-week" on a phone, the name in muted Space Mono ([Drawer](../../../packages/ui/src/components/drawer/drawer.md#rules)).
- Keep the description out of the head: the drawer shows it, so the head would only repeat it (stdrc, 2026-11-03). Put it in the channel info under the members, as a field for people who can edit the channel and as plain text for everyone else.
- Under the head, put the members as a row of avatars with an add tile, which opens the member list inside the drawer; then the channel's settings, its preferences (mute, collapse long messages), Stop all agents and Leave channel.
- When someone closes the drawer with unsaved edits, ask whether to save or discard them.

### The announcement

A channel's announcement is one Artifact in the channel that everyone in it should read: rules, dates, links. It shows as a strip under the channel header and opens in the Artifact column. In code it is `ChannelAnnouncement`, so it isn't confused with [AnnouncementDialog](../../../packages/ui/src/components/announcement-dialog/announcement-dialog.md), the product's dialog about something new; the interface calls it Announcement (Remy and Kirby, 2026-11-10, #proj-chat:89bf8a03). The rules are from Kirby's design (Artifact 3pcWgS5eJupMGj7yrdC4QR), placement A, which tygg approved (tygg, 2026-11-10, #proj-chat:89bf8a03).

#### Where it shows

- Put the announcement in a strip under the channel header, across the conversation's width, not in a header button of its own. The job is "everyone here should know this", so it has to be seen without looking for it: a header button, like Tasks and Files, is found only by people who already know it is there, and a new member never would. Tasks and Files show no count on purpose, so an attention dot on a fifth header button would ask for attention the header otherwise never asks for, and it would make the header fold sooner (tygg, 2026-11-10, #proj-chat:89bf8a03).
- Make the strip 40px tall with a mouse. On a phone, and wherever the strip itself is narrower than 560px (the conversation with a thread beside it), give it two lines (56px), each truncating.
- Put it in the region at the top of the conversation, last, right above the timeline: from the header down, a `PanelNotice` (a problem in this panel), then the offers to open the app or the desktop app, then the strip. The things that go away come first, and the strip, which stays, keeps its place next to the messages.
- Draw the strip on paper (`layer-canvas`) with one `line-seam` under it, never in a notice's tone or with its icon: it is content the channel keeps, not a notice, and `PanelNotice` means "this panel has a problem" ([Feedback](../../patterns/feedback.md#errors-by-scope)). It isn't a [Banner](../../../packages/ui/src/components/banner/banner.md) either: a banner is a dialog's or a form's notice.
- From the start: the `megaphone` icon in `foreground-muted`, the title, one line under or after it, the time in `text-mono-meta` and `foreground-hint`, and ⋯. On one line the title takes at most 55% of the strip and truncates; the second line gives up its room first. The full title is the link's accessible name ("Announcement: Release rules for 1.9").
- Make the whole row open the announcement; ⋯ is a button of its own. While the Artifact column shows the announcement, the strip keeps `fill-subtle`, as a row with its item open; not yellow, which is navigation's selection.

#### Updated and seen

- When the person hasn't seen the current version, set the title in bold and put the attention dot (Status `variant="accent"`) after the text, the same unread signal as a sidebar row. The line says who updated it, with their avatar: "Bugen updated it", or the version's note when it has one ("Bugen: Added the freeze dates for 1.9"). An agent's update looks the same as a person's, with the agent's avatar and name.
- Once the person has opened it, set the title in regular weight, and the line is the first line of the announcement, with its date. Nothing on the strip is pink.
- Read "seen" from the Artifact's own read state: opening the current version marks it seen, on every device. A new version is a new version number; an edit to the note alone doesn't make it unseen again (Remy and Kirby, 2026-11-10, #proj-chat:89bf8a03).

#### The strip's menu

- Give ⋯ (Announcement options) Hide until it's updated and Copy link; for people who can change the announcement, then a separator and Announcement settings, which opens the channel details at its Announcement row.
- Hide until it's updated hides the strip for that person, on every device, until the next version: a new version brings the strip back, in bold. While it is hidden, Show announcement is the first of the header's actions ([Structure](#structure)), so the strip and a header button are one design at two moments.

#### Opening it

- Open the announcement in the channel's Artifact column, as an Artifact card opens: the same viewer, width, Expand, ×, comments and version history; on a phone, full screen with Back. Keep the viewer's head as it is, so the title keeps its room in a 480px column (a tag in the head left the title 116px).
- Start the page with a byline: Announcement, "Updated by Bugen · 5m ago", and Version history. On the person's first open of a new version, the byline also shows its note, as "What's new in v4".

#### Setting, replacing and removing

- Only the channel's owner and the server's owners and admins can set, replace or remove the announcement, and agents go through the same check (Remy, 2026-11-10, #proj-chat:89bf8a03). Show everyone else none of the entries: no buttons in the row, no item in an Artifact's ⋯, no Announcement settings in the strip's menu.
- In the channel details, put an Announcement row after the description: the announcement itself, which opens it, then Remove (`ghost`) and Replace. With no announcement, the row has one line on what it is for and Set announcement. Someone who can't change it sees the announcement alone, and no row when there is none.
- In an Artifact's ⋯, put Set as channel announcement after Version history, only on an Artifact whose home is this channel. On the current announcement it is Remove as channel announcement. When another Artifact is the announcement, it opens the Replace confirmation.
- Set announcement opens a Dialog at `size="md"` with a ChoiceList: New announcement first (an empty Markdown Artifact in this channel, opened in the column to write in), then the channel's Artifacts.
- Confirm Replace and Remove in a Dialog at `size="sm"`, Cancel first, then the confirm button at `primary`, not `danger`: nothing is deleted, the Artifact stays in the channel, and it can be set again ([Button](../../../packages/ui/src/components/button/button.md#which-color)). Say so in the body: "“Release rules for 1.9” stays in the channel as an Artifact."

#### What posts in the channel

- Post nothing in the channel when the announcement is updated, whoever updates it and however big the change: the strip going bold is the notice, for each person until they open it. Someone who wants to call attention to an update posts the Artifact's card in the channel themselves (Remy, 2026-11-10, #proj-chat:89bf8a03).
- Setting, replacing or removing the announcement is a change to the channel, like a rename, and posts one event line in the timeline: "Martin set the announcement: Release rules for 1.9". This one is still open: Kirby asked tygg, who hasn't confirmed it yet (#proj-chat:89bf8a03). Until then, build it behind `channel_announcement_v0` with the rest.

### Tasks and files

- Make Tasks (`list-todo`) and Files (`paperclip`) toggles in the header (`PanelToggleAction`, [Panel](../../../packages/ui/src/components/panel/panel.md)): pressed, each is a yellow sticker and its section is open. Their labels switch to Close tasks and Close files.
- Show no count on either toggle: most tasks are the agents' own business, so the section is there when someone wants to look, not something that asks for attention.
- Close a section with its toggle or its ×; on a phone, with Back. When both are open, Tasks is above Files.
- Keep which sections are open for the person, not per channel: the sections follow them from channel to channel, as the thread column does.
- Give a direct message the same two toggles.
- Show the Tasks section as described in [Tasks](./tasks.md#a-channels-tasks-section).
- Show the Files section as the list of files posted in the channel; a file opens in the preview.

### The composer in a channel

- Put Attach media and Attach file on the left of the toolbar. The composer has no As task: people send messages, and tasks are created from them ([Tasks in the conversation](#tasks-in-the-conversation)).
- Group the @ suggestions as "In this channel", "Not in this channel", Computers and Apps ([Conversation](../../patterns/conversation.md#mentions)).

### Tasks in the conversation

Tasks in the timeline follow [Tasks](../../patterns/tasks.md#tasks-in-a-conversation).

- Create a task with the quick add ("Add a task") or + in the Tasks section, for a task of the channel with no message, or with Create task from message in the message menu. Create task from message opens Create task with the message quoted and its text as the first title; every task created there is linked to the message, and a message can have several.
- Show the tasks created from a message under it, and under the message at the top of its thread.
- Change a task's status in its details or on the Tasks page (on a card of its board, or for several tasks at once from the selected tasks' toolbar), or complete it with the completion control on its row under the message; not from the message menu.

### Threads

- Put "2 agents following" beside the followers' avatar stack, then a menu (Search in thread, View in channel, Mark as unread, Unfollow thread; a thread the person doesn't follow has Follow thread and no Mark as unread) at the right of the thread's header, then Expand, which makes the thread fill the row with every other column, the conversation's included, a 160px strip beside it, and turns into Restore to bring the row back (a window control right before × and never in the menu; hidden while the thread is folded over the conversation with no column beside it: [Panel](../../../packages/ui/src/components/panel/panel.md#rules)), then × on wide screens. Where the head runs out of room, the followers fold into the menu as Following agents; folded over the conversation, the head starts with Back and has no × ([The channel's side columns](../../patterns/responsive.md#the-channels-side-columns)).
- Inside the thread, every message's menu has Mark thread as unread, after Unfollow thread: it says "Thread" because the menu is a message's, and it marks the whole thread unread, not only from that message on. Both items are the action of the thread's Activity row, with its `message-square-dot` icon: the thread shows unread in its channel and in Activity. The person is still in the thread, so it stays open and stays unread until they leave it, as a channel marked unread does while they are in it. In Activity's detail pane, acting in the thread reads it, as picking its row does. A thread the person doesn't follow has neither item, as its Activity row has none: unfollowing a thread clears its unread at once.

### History behind the plan's window

A Free server shows the last 30 days of a channel, DM, thread or task conversation. Where the shown history starts, the conversation has a history paywall instead of a history notice ([MessageList](../../../packages/ui/src/components/message-list/message-list.md#rules)).

- Put a [Card](../../../packages/ui/src/components/card/card.md) as wide as the message rows where the oldest loaded message would be: `History` in `CardLeading` at 20px (not a lock: a lock is a private channel), a title that says how many messages are hidden and where ("6 earlier messages are older than 30 days", "All 13 messages in this channel…", "The first message and 3 replies…"), one line on what Free shows and what Pro restores, and a `primary` small Upgrade to Pro button. The button opens the upgrade dialog for every role; the dialog decides who pays and who asks an owner.
- Above the card, show the newest two hidden messages as message rows: sender, time and the first 40 characters, at most two lines, fading out toward the top. They are not interactive. Show only chat messages; when only system lines are hidden, show the card alone. In a thread whose first message is hidden too, that message leads.
- Under the card, write the first date line as "Last 30 days · Tuesday, October 20". A thread, which has no date lines, gets a "Last 30 days" line of its own.
- When every message is hidden, put the glimpse and the card on the composer, where the newest messages would be, with "No new messages in the last 30 days" under them in `MessageListNotice` `muted`. The composer stays usable; a new message appears under the card.
- When a link or search opens a message older than 30 days, stop at the card and center on that message: it is evenly muted with its first 80 characters, between lighter neighbors that fade out above and below, and the title says "The message you're looking for is older than 30 days".
- After an upgrade, the card goes and the older messages load above it, without a reload.

