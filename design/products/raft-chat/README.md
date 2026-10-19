---
title: Raft Chat
summary: Raft Chat's own structure — its destinations, what the sidebar lists, where working agents appear, threads, and the layout rules only Raft Chat has.
---

# Raft Chat

Raft Chat is Raft's first product: channels, direct messages, agents and tasks in one conversation. These pages describe only its own structure: its destinations, what each screen shows and where things go. Colors, components and the shared layouts are in the [foundations](../../foundations/), the component docs and the [patterns](../../patterns/). The rules here describe what Raft Chat's web app ships; other products don't have to follow them.

| Page | Covers |
| --- | --- |
| [Home](./home.md) | The phone's Home screen |
| [Channel](./channel.md) | A channel: its header, its Chat, Tasks and Files tabs, its conversation, tasks inside it, threads |
| [Tasks](./tasks.md) | The Tasks destination |
| [Agent profile](./agent-profile.md) | An agent's profile and its page |
| [Settings](./settings.md) | The Settings destination and its pages |
| [Onboarding](./onboarding.md) | The first-run setup of a workspace |
| [Desktop](./desktop.md) | The desktop layout of a channel |

## Structure

### Destinations

| Where | Destinations |
| --- | --- |
| Phone tab bar | Home (`house`), Tasks (`square-check-big`), Members (`users`), Settings (`settings`). Guests don't have Members |
| The first three rows of phone Home | Search, Activity (with a pink count of what is unread), Saved (with a gray count); see [Home](./home.md) |
| Web top bar (from 768px, and the desktop app's title bar) | The workspace button and the workspace strip; the search field; the working summary and the bell ([Page structure](../../patterns/page-structure.md#the-web-top-bar)) |
| Desktop rail | Chat, Activity, Tasks, Members, Computers; at the bottom Help (`circle-help`) and Settings. Guests don't have Members or Computers |
| Only in Settings | Computers (on a phone), and Log out, at the end of Account |

Without the web top bar (an older desktop build, a workspace's public page), the rail shows the workspace tile at its top, Search before Chat, and the bell above Help.

### Attention dots

- On the rail, show a pink pixel on Chat when there are unread messages, on Activity when there is unread activity, and on Computers when a computer needs attention; none of the three shows it while it is selected. Show it on Settings when feedback has a new reply, and on Help once, to announce the mobile app.
- On the phone tab bar, show it only on Settings, for a new feedback reply. Everything else new shows inside the pages; Home's Activity row carries a count.
- Show it on the workspace pill and on a workspace's avatar in the strip when another workspace has unread activity.

### The bell and Activity

- The bell opens the notification center: the state of the whole workspace. It lists joint-channel invites, a provider's usage limit, a plan change, computers that need attention, are offline or low on disk, installing Raft on this device, and new replies to feedback. Each entry has its actions and Dismiss. The bell is at the right of the web top bar on desktop and at the right of Home's top bar on a phone.
- Activity lists the conversations that wait for the person: channels, direct messages and followed threads with unread messages or mentions. It filters by All, Unread and Mentions, has Mark all read, and each row has a Mark as Done check ([InboxItem](../../../packages/ui/src/components/inbox-item/inbox-item.md)). Approvals and tasks don't appear in it as their own rows.

### The desktop sidebar

| Destination | The sidebar lists |
| --- | --- |
| Chat | Saved, then the sections Pinned, the person's own sections, Joint Channels, Channels and Direct Messages. People can reorder the sections by dragging. Agents are listed among the direct messages |
| Members | Graph, then Agents (grouped by computer) and Humans, each with a count and an add button |
| Computers | The computers, with an add button |
| Settings | The settings groups; Account opens by default ([Settings](./settings.md)) |
| Tasks | No sidebar: the board follows the rail directly |
| Search, Activity | No sidebar at first: the page fills the width. After a result is selected, the results list takes the sidebar's place, and the result opens next to it |

- Give every section header a disclosure, a count and a sort menu (Manual, Recent, A–Z). Put a + button for Create Channel in the header of Channels, and for Create Joint Channel in the header of Joint Channels.
- Under the web top bar the sidebar has no header. Without the top bar, the header names the destination, and in Chat the working summary sits at its right.
- In the desktop app, put a "Find a conversation…" field above the Chat sidebar's list.

### Where working agents appear

The shared rules are in [Agents](../../patterns/agents.md#where-working-agents-appear). In Raft Chat:

| Place | Shows |
| --- | --- |
| The web top bar, before the bell | The avatar stack and the count; it opens Working now |
| Phone Home's top bar, before the bell | The same avatar stack and count |
| Desktop Chat sidebar header, without the top bar | The same avatar stack and count |
| An agent's row in the sidebar or on Home | What it is doing replaces its runtime on the right |
| Channel header | The subtitle: the avatar stack and "2 agents working", then " · " and the channel's description |
| A direct message with an agent | Its light and what it is doing, after its name in the header |

- Selecting a row in Working now opens the agent's page.
- Appearance › Live agent activity turns the summary and the channel's working line off.

### Overlays

| Overlay | Used for |
| --- | --- |
| Drawer from the right, at most 420px (full width on a phone) | Channel details and settings, with its member list as a page inside it |
| Popover | Working now (300px), the notifications, the workspace list, Help & resources (opened on hover from the rail) |
| Bottom sheet with a short explanation (phone) | Add Raft to your Home Screen, opened from the notification center's Install Raft or the Add button in Settings › Notifications (button: Got it) |
| Small dialog, 448px | Create Channel, Create Task, Create Agent |
| Wide form dialog | Register App, editing an app (Edit Release Bot) ([Forms](../../patterns/forms.md#the-large-form-dialog)) |
| Profile card on a person or agent, on hover | A 51px avatar; the name with the light and what it is doing; the handle; Computer, Runtime, Model and Reasoning; the description on one line; for people who manage the agent, its recent activity. It has no buttons |

Side panels that stay open beside the conversation (a thread, a profile) are side panels, not drawers, and have no scrim.

## Rules

### Wide and narrow

These add to the shared breakpoints in [Responsive layout](../../patterns/responsive.md).

| Situation | Layout |
| --- | --- |
| Below 768px | Don't open the first channel automatically: Home comes first. From 768px, the root of a workspace opens its first channel |
| The Search and Activity results list | 560px from 1024px (resizable from 400px to 720px); 320px from 768px to 1023px and while a third column is open (resizable from 320px to 480px) |
| The thread beside the conversation | When the window is landscape or at least 1280px wide, and the conversation's column is at least 680px: the thread is 400px (resizable from 360px to 60% of the window) and the conversation keeps at least 320px. Otherwise the thread covers the conversation |
| A profile | From 1024px, beside the conversation (380px, resizable from 300px to 600px) when its column is at least 680px; otherwise covering it |
| A task | Task details are a centered dialog from 768px and full screen below ([Tasks](../../patterns/tasks.md)); a task never opens in the side panel |

## Differences from the shared patterns

- Home and the other top-level pages don't show a large title yet ([0004](../../decisions/0004-title-on-every-top-level-page.md)); see [Home](./home.md#differences-from-the-shared-patterns).
- The workspace pill opens a popover instead of a bottom sheet ([0007](../../decisions/0007-workspace-switcher-sheet.md)).
