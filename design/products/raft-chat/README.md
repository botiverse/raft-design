---
title: Raft Chat
summary: Raft Chat's own structure — its destinations, attention dots, the bell and Activity, the desktop layout and sidebar, the desktop app, where working agents appear, its overlays, and where it differs from the patterns.
redirectFrom: [products/raft-chat/desktop]
---

# Raft Chat

Raft Chat is Raft's first product: channels, direct messages, agents and tasks in one conversation. These pages describe only its own structure: its destinations, what each screen shows and where things go. The reusable rules, and why they hold, are in the [patterns](../../patterns/); colors, type and spacing are in the [foundations](../../foundations/); each part is in its component doc. Where a page here needs one of those rules, it links to it rather than repeating it. The pages describe what Raft Chat's web app ships.

| Page | Covers |
| --- | --- |
| [Home](./home.md) | The phone's Home screen |
| [Channel](./channel.md) | A channel: its header and details, its Chat, Tasks and Files tabs, its composer, tasks inside it, threads |
| [Tasks](./tasks.md) | The Tasks destination and a channel's Tasks tab |
| [Agent profile](./agent-profile.md) | An agent's profile and its page |
| [Settings](./settings.md) | The Settings destination and its pages |
| [Onboarding](./onboarding.md) | The first-run setup of a server |

## Structure

### Destinations

| Where | Destinations |
| --- | --- |
| Phone tab bar | Home (`house`), Activity (`activity`, as on the desktop rail), Tasks (`square-check-big`), Search (`search`), More (`ellipsis`), on the edge bar ([MobileNav](../../../packages/ui/src/components/mobile-nav/mobile-nav.md#search-and-more)). The order is fixed. Search is a tab, the only way in to searching everything: no Back on its page, the bar stays with Search selected, and it keeps its query, filters, results and scroll position across tabs ([Navigation](../../patterns/navigation.md#search-on-a-phone)). The same in the mobile app and on the phone web |
| Phone More | One page titled More, like every tab root: a first group of Members and Computers, then the groups of [Settings](./settings.md) with their own headers. Each row opens a pushed page under More, with Back; links to them open there. Guests don't have Members or Computers |
| The first row of phone Home | Saved (with a gray count), its only entry point; see [Home](./home.md) |
| Web top bar (from 768px, and the desktop app's title bar) | As in [Page structure](../../patterns/page-structure.md#the-web-top-bar); the search field opens search |
| Desktop rail | Chat, Activity, Tasks, Members, Computers; at the bottom Help (`circle-help`) and Settings. Guests don't have Members or Computers |
| Only in [Settings](./settings.md) | Members and Computers (on a phone), and Log Out, at the end of Account |

Without the web top bar (an older desktop build, a server's public page), the rail shows the workspace tile at its top, Search before Chat, and the bell above Help.

### Attention dots

Attention dots follow [Navigation](../../patterns/navigation.md#where-you-are). In Raft Chat they mark:

- on the rail: Chat when there are unread messages, Activity when there is unread activity, Computers when a computer needs attention, Settings when feedback has a new reply, and Help once, to announce the mobile app, until its mobile-app item is opened;
- on the phone tab bar: Activity when there is unread activity, and More when feedback has a new reply or a computer needs attention. Search never has one.

None of them shows while its destination is selected, Settings and Help included, and each is always a dot, never a count ([Navigation](../../patterns/navigation.md#where-you-are)). More's dot is only for what shows nowhere else, and the row that caused it shows the same dot: Feedback for a feedback reply, Computers for a computer. Everything else new shows inside the pages; unread counts are inside Activity.

A computer's dot marks a change you haven't seen, not a state that lasts. On the rail and on the phone alike:

- A computer that enters a state needing attention (offline, needs an update) lights the dot; opening Computers counts as seeing it.
- Once seen, the same computer in the same state doesn't light it again. A change lights it again: the computer comes back online and then goes offline, it enters a new state, or another computer needs attention.
- Seeing it hides only the dot. The computer's row on Computers keeps showing its state, and the count of offline computers on that page doesn't change.

### The bell and Activity

- The bell opens the notification center: the state of the whole server. It lists joint-channel invites, a provider's usage limit, a plan change, computers that need attention, are offline or low on disk, installing Raft on this device, and new replies to feedback. Each entry has its actions and Dismiss.
- Activity lists the conversations that wait for the person: channels, direct messages and followed threads with unread messages or mentions. It filters by All, Unread and Mentions, has Mark all read and no search field, and each row has a Mark as Done check ([InboxItem](../../../packages/ui/src/components/inbox-item/inbox-item.md)). Approvals and tasks don't appear in it as their own rows. Tapping Activity again on the tab bar scrolls it to the top, as on every tab; the first unread conversation is reached with the Unread filter ([Navigation](../../patterns/navigation.md#going-back)).

### The tops of the phone's top-level pages

Each follows [Page structure](../../patterns/page-structure.md#phone). What their navigation rows hold:

| Page | In the row | Subtitle |
| --- | --- | --- |
| Home | The server switcher, then the working summary and the bell at the end ([Home](./home.md)) | None |
| Activity | Activity; the filters in the filter row under it | "3 in progress · 5 unread", in Space Mono |
| Tasks | Tasks; the filter bar under it ([Tasks](./tasks.md)) | "12 channel tasks", in Space Mono |
| Search | The search field; the filters in the filter row under it | None |
| More | More | None |

### The desktop layout

A channel on desktop, under the web top bar, from left to right: the rail; the Chat sidebar; the main area with the channel ([Channel](./channel.md)); and a side panel when a thread or a profile is open. The regions and their lines follow [Page structure](../../patterns/page-structure.md#desktop).

```example
sidebar/sidebar
```

### The desktop sidebar

| Destination | The sidebar lists |
| --- | --- |
| Chat | Saved, then the sections Pinned, the person's own sections, Joint Channels, Channels and Direct Messages. People can reorder the sections by dragging. Agents are listed among the direct messages |
| Members | Graph, then Agents (grouped by computer) and Humans, each with a count and an add button |
| Computers | The computers, with an add button |
| Settings | The settings groups ([Settings](./settings.md)) |
| Tasks | No sidebar: the board follows the rail directly |
| Search, Activity | No sidebar at first: the page fills the width. After a result is selected, the results list takes the sidebar's place, and the result opens next to it |

- Give every section header a disclosure, a count and a sort menu (Manual, Recent, A–Z), always visible, on desktop and on Home. A collapsed section shows a pink pixel when something in it is unread. Put a + button for Create Channel in the header of Channels, and for Create Joint Channel in the header of Joint Channels.
- Show unread as in [States](../../foundations/states.md), except that in a channel's row a mention of the person shows the yellow @ marker before the pink count. Unread in a muted or unjoined channel is a gray count, and a pencil marks a draft.
- Under the web top bar the sidebar has no header. Without the top bar, the header names the destination, and in Chat the working summary sits at its right.

### The desktop app

The desktop app's title bar is the web top bar, at every width, with what [Page structure](../../patterns/page-structure.md#the-web-top-bar) adds for a desktop app. In Raft Chat:

- Back and Forward have ⌘[ and ⌘] (Alt+← and Alt+→ on Windows) in their tooltips.
- The update chip shows while an update downloads, and becomes an Update button with a pink pixel when it is ready.
- The window's buttons get 82px on the left for the macOS traffic lights, and the caption buttons' width on the right on Windows.
- ⌘1 to ⌘9 (Ctrl+1 to Ctrl+9 on Windows) switch to the servers in the strip.
- A "Find a conversation…" field sits above the Chat sidebar's list.

### Where working agents appear

The shared rules are in [Working agents](../../people-and-agents/working-agents.md#where-working-shows). In Raft Chat:

| Place | In Raft Chat |
| --- | --- |
| The summary | The web top bar before the bell; phone Home's top bar before the bell; the Chat sidebar header without the top bar |
| The agent's row | Its row in the sidebar and on Home is one line: its avatar with its light, its name, and on the right what it is doing, or its runtime in Space Mono when it isn't working. An unread count takes the place of either |
| The place it works in | The channel header's subtitle |
| A direct message with the agent | The header of that direct message |
| About to post | Floating just above the composer of that channel, direct message or thread, over a fade |

### Overlays

| Overlay | Used for |
| --- | --- |
| Drawer from the right, at most 420px (full width on a phone) | Channel details and settings, with its member list as a page inside it ([Channel](./channel.md#the-channel-details)) |
| Popover | Working now, the notifications, the server list, Help & resources (opened on hover from the rail) |
| Bottom sheet with a short explanation (phone) | Add Raft to your Home Screen, opened from the notification center's Install Raft or the Add button in Settings › Notifications (button: Got it) |
| Small form dialog ([Forms](../../patterns/forms.md#forms-in-a-dialog)) | Create Channel, Create Task, Create Agent |
| Wide form dialog ([Forms](../../patterns/forms.md#the-large-form-dialog)) | Register App, editing an app (Edit Release Bot) |
| Profile card on a person or agent, on hover | A 51px avatar; the name with the light and what it is doing; the handle; Computer, Runtime, Model and Reasoning; the description on one line; for people who manage the agent, its recent activity. It has no buttons |

Side panels that stay open beside the conversation (a thread, a profile) are side panels, not drawers, and have no scrim.

## Rules

### Wide and narrow

These add to the shared breakpoints in [Responsive layout](../../patterns/responsive.md).

| Situation | Layout |
| --- | --- |
| Below 768px | Don't open the first channel automatically: Home comes first. From 768px, the root of a server opens its first channel |
| The Search and Activity results list | 380px, resizable from 320px to 640px, one width at every desktop width ([Spacing](../../foundations/spacing.md#resizing-columns)) |

## Differences from the shared patterns

Raft Chat departs from these patterns today. Each line is the product's side; the rule is on the linked page.

| Pattern | What Raft Chat ships |
| --- | --- |
| A mention marker replaces the unread count ([States](../../foundations/states.md)) | A channel's row shows the @ marker before the pink count |
| Every pushed page has Back ([Navigation](../../patterns/navigation.md#going-back)) | On the phone web, the RaftBench gate page and the Assistant page while it loads have neither Back nor the tab bar |
| No empty state when loading failed ([Feedback](../../patterns/feedback.md#empty-loading-and-failed)) | When the list of Activity or Saved fails to load, it shows its empty state |
