---
title: Raft Chat
summary: Raft Chat's own structure — its destinations, attention dots, the bell and Activity, Activity's swipes, the server tab, the desktop layout and sidebar, the pages of a list and their toolbars, the desktop app, where working agents appear, its overlays, pull to refresh, lists of places, and where it differs from the patterns.
redirectFrom: [products/raft-chat/desktop]
---

# Raft Chat

Raft Chat is Raft's first product: channels, direct messages, agents and tasks in one conversation. These pages describe only its own structure: its destinations, what each screen shows and where things go. The reusable rules, and why they hold, are in the [patterns](../../patterns/); colors, type and spacing are in the [foundations](../../foundations/); each part is in its component doc. Where a page here needs one of those rules, it links to it rather than repeating it. The pages describe what Raft Chat's web app ships.

| Page | Covers |
| --- | --- |
| [Home](./home.md) | The phone's Home screen |
| [Channel](./channel.md) | A channel: its header and details, its Tasks and Files sections, its composer, tasks inside it, threads |
| [Tasks](./tasks.md) | The Tasks destination (Mine and All, its filters, sort and selection) and a channel's Tasks section |
| [Members](./members.md) | The Members destination: its tabs, people as tiles and agents as a list |
| [Computers](./computers.md) | The Computers destination: search and filters, grouping, sorting by remaining usage, offline computers folded at the end |
| [Agent profile](./agent-profile.md) | An agent's profile and its page |
| [Settings](./settings.md) | The Settings destination and its pages |
| [Onboarding](./onboarding.md) | The first-run setup of a server |
| [Getting the app](./getting-the-app.md) | The public download page and the app sections of Settings → About: the visitor's own device first, every other platform one row |

## Structure

### Destinations

| Where | Destinations |
| --- | --- |
| Phone tab bar | Home (`house`), Activity (`activity`, as on the desktop rail), Tasks (`square-check-big`), Search (`search`), and the current server, its avatar and its name, on the edge bar ([MobileNav](../../../packages/ui/src/components/mobile-nav/mobile-nav.md#search-and-the-server-tab)). The order is fixed. Search is a tab, the only way in to searching everything: no Back on its page, the bar stays with Search selected, and it keeps its query, filters, results and scroll position across tabs ([Navigation](../../patterns/navigation.md#search-on-a-phone)). The same in the mobile app and on the phone web |
| Phone server tab | Opens a popover, not a page: the server list, its footer actions and, at the bottom, the server's pages ([The server tab](#the-server-tab)). Each of the server's pages opens a pushed page, with Back. Switching keeps the current tab ([Navigation](../../patterns/navigation.md#the-server-tab-on-a-phone)) |
| The first rows of phone Home | Saved, then Drafts, each with a gray count and its only entry point on a phone; see [Home](./home.md) |
| Web top bar (from 768px, and the desktop app's title bar) | As in [Page structure](../../patterns/page-structure.md#the-web-top-bar); the search field opens search |
| Desktop rail (the web and the desktop app) | Chat, Activity, Tasks, Artifacts (where the server has Artifacts on), Members, Computers, Apps (`blocks`); at the bottom Help (`circle-help`) and Settings. Guests don't have Members, Computers or Apps; they keep Artifacts |
| The apps' rail in desktop mode (from 840dp) | Computers isn't on it: it is in Settings ([The server tab](#the-server-tab)) |
| Only in [Settings](./settings.md) | Sign out, at the end of Account |

Without the web top bar (an older desktop build, a server's public page), the rail shows the workspace tile at its top, Search before Chat, and the bell above Help.

### Attention dots

Attention dots follow [Navigation](../../patterns/navigation.md#where-you-are). In Raft Chat they mark:

- on the rail of the web and the desktop app: Chat when there are unread messages, Activity when there is unread activity, Computers when a computer needs attention, Settings when feedback has a new reply, and Help once, to announce the mobile app, until its mobile-app item is opened;
- on the apps' rail in desktop mode (from 840dp), which has no Computers button: a computer that needs attention marks Settings instead, since Computers is in Settings there ([The server tab](#the-server-tab));
- on the phone tab bar: Activity when there is unread activity, and the server tab's avatar when another server has unread items, as on Home's workspace button. Search never has one.

None of them shows while its destination is selected, Settings and Help included, and each is always a dot, never a count ([Navigation](../../patterns/navigation.md#where-you-are)). Another server's unread items show as a count on its row in the server tab's popover. A feedback reply and a computer that needs attention are not on the server tab: each has a dot on its own button in the popover, Settings (and Feedback inside it) and Computers (on a phone, the only place they show). Everything else new shows inside the pages; unread counts are inside Activity.

A computer's dot marks a change you haven't seen, not a state that lasts. On the rail and on the phone alike:

- A computer that enters a state needing attention (offline, needs an update) lights the dot; opening Computers counts as seeing it.
- Once seen, the same computer in the same state doesn't light it again. A change lights it again: the computer comes back online and then goes offline, it enters a new state, or another computer needs attention.
- Seeing it hides only the dot. The computer's row on Computers keeps showing its state, and the count of offline computers on that page doesn't change.

### The bell and Activity

- The bell opens the notification center: the state of the whole server. It lists joint-channel invites, a provider's usage limit, a plan change, computers that need attention, are offline or low on disk, installing Raft on this device, and new replies to feedback. Each entry has its actions and Dismiss.
- Activity lists the conversations that wait for the person: channels, direct messages and followed threads with unread messages or mentions. It filters by All, Unread and Mentions (and Pinned, Saved and Artifacts) through one Filter button with a chip for what is applied, the stated exception to a button per filter: a page with many filters that people mostly leave unused ([A page of a list](../../patterns/page-structure.md#a-page-of-a-list)). It has Mark all read and no search field, and each row has a Mark as Done check, which on a phone is a left swipe and an item of the row's press-and-hold menu instead ([Activity on a phone](#activity-on-a-phone)). Approvals and tasks don't appear in it as their own rows.
- Activity groups its rows by day, newest first, under headings that stay at the top while their rows scroll: Today, Yesterday, then the weekday and date ([Rows grouped by day](../../patterns/lists.md#rows-grouped-by-day)). Only today's rows, and any row less than 1 hour old even under Yesterday, show their time at rest, short and relative (now, 3m, 2h), on the title's line; an older row shows its clock time only on hover or keyboard focus, and on a phone, where nothing hovers, its day heading is its date ([Times in list rows](../../patterns/lists.md#times-in-list-rows)). A row's marks, a task's status among them, end its second line. With a mouse, Mark as Done is a ghost button centered on the row, and the time and the marks move left for it (stdrc, 2026-11-05, #proj-raft-ui:e09717fb, option C1).
- On a server with task v2 conversations on, Activity shows no task numbers: a task's row has the task's title, its status at the end of the second line, and only the channel before the message ("#launch-week · Martin: …", not "#launch-week:#46 · Martin: …"). The task is the conversation there, named by its title, and the number took room from a row that had little (stdrc, 2026-11-05: "Activity shouldn't show task numbers any more"). On a server without them a task's row keeps its number in a badge after the title, in the color of the task's status, since there the badge is also the row's only sign of that status.
- Activity is the one exception to what tapping the selected tab does ([Navigation](../../patterns/navigation.md#going-back); artin, 2026-10-21): it is the list people work through, so tapping Activity again, or its title bar, goes to the next unread item below the current position, scrolls it to the top of the list and marks it as located ([Located](../../foundations/states.md#located)). After the last unread item the next tap goes back to the top, and the cycle starts again; with no unread item it goes to the top. It moves only within the current filter and marks nothing as read.

### Activity on a phone

The swipe itself, its distances, its buttons and its Undo toast follow [Touch screens](../../patterns/responsive.md#touch-screens). In Activity:

- With a mouse, Mark as Done stays hover-only, as every row action. On a phone it is the exception: it is reached by swiping the row left and from its press-and-hold menu, with no button at rest (stdrc, 2026-10-23). A list that is mostly rows to clear reads as a column of buttons with one on every row, and on a phone swiping a row away is how people already clear a list (Mail, Messages). A tablet or a desktop keeps the button: there the row is wider and the swipe is not the habit.
- The left swipe uncovers the row's buttons: Done, then Unfollow on a followed thread and Mute on a joined channel whose activity isn't muted, each where it applies; a pull past 60% applies Done. The toast says what happened ("Unfollowed …", "Muted activity in #…") with an Undo, and the same actions are in the press-and-hold menu.
- Done has no exact opposite, and nor has Unfollow: unfollowing a thread also marks it read, and following it again can't make it unread (Jasper and Tenny, 2026-10-27). So both wait for the toast before they apply. A Done is dropped if new activity arrives in that row meanwhile; an Unfollow still applies, since the person stops following whatever the thread says next. Mute keeps the row in the list, marked muted, with the same toast and Undo; a muted row's buttons have no Mute.
- A right swipe marks the row read, or unread when it is already read, and keeps it in place, with no toast. Under the Unread or Mentions filter a row just marked read still stays, until the person leaves the list or changes the filter, as in a mail client, so the swipe back always has a row to swipe.
- These rows have no right swipe, since the swipe can't change their read state on screen: a muted conversation's row (drawn read whatever it holds), a direct mention's row (marking it read changes nothing), and an Artifact's row (it can be read, never marked unread again).

### The server tab

The server tab and the workspace tile follow [Navigation](../../patterns/navigation.md#the-server-tab-on-a-phone). In Raft Chat (the phone decided on 2026-10-22 by stdrc, D1a, task #152):

- The server tab takes the slot More had, so the bar keeps 5 tabs.
- The popover's footer actions are Join community (until the person has joined it), Switch or create server and Invite human. Invite human stays here and not in the row of pages: it opens a dialog rather than a place.
- The buttons at the very bottom hold the server's own pages: Artifacts first, where the server has Artifacts on, then Members, Computers, Apps and [Settings](./settings.md). Members, Computers and Settings used to be in More. They are places in the same server, so they sit together and cost a line or two instead of one each; at the bottom they are nearest the thumb and the tab bar, where More was. Five of them take 3 columns, Artifacts, Members and Computers over Apps and Settings: more than 4 always do, so every label stays whole in every language (Remy and Kirby, 2026-11-06, #proj-workspace:#203; [Navigation](../../patterns/navigation.md#the-server-tab-on-a-phone)). Without Artifacts the 4 stay in one row.
- A guest, who has no Members, Computers or Apps, gets Artifacts, as the rail shows it to them, and Settings, in one row; without Artifacts, Settings alone. Settings holds their account and Sign out, and on a phone the popover is its only way in.
- In the apps' desktop mode (from 840dp; Jasper, 2026-10-23, task #8; the row dropped by artin, 2026-10-29) there is no server tab: the rail header's workspace tile opens the popover without the row of pages ([Navigation](../../patterns/navigation.md#the-server-in-the-apps-desktop-mode)). Every one of those pages already has a way in that stays on screen: Artifacts (where the server has it on), Members and Apps are on the rail, Settings at the rail's bottom, and Computers in Settings. Unlike the web's rail, this rail has no Computers button, so both dots are on the rail's Settings: a feedback reply's, and a computer's that needs attention, since Computers is reached from there.

### The tops of the phone's top-level pages

Each follows [Page structure](../../patterns/page-structure.md#phone). What their navigation rows hold:

| Page | In the row | Subtitle |
| --- | --- | --- |
| Home | The server switcher, then the working summary and the bell at the end ([Home](./home.md)) | None |
| Activity | Activity; the filters in the filter row under it | "3 in progress · 5 unread", in Space Mono |
| Tasks | Tasks; the toolbar under it, with the search field in it ([Tasks](./tasks.md)) | The count, "12", or "3 / 12" while a filter or the search narrows the list, in Space Mono |
| Search | The search field; the filters in the filter row under it | None |

### The desktop layout

A channel on desktop, under the web top bar, from left to right: the rail; the Chat sidebar; the main area with the channel ([Channel](./channel.md)) and, when open, its Tasks and Files sections; and a side panel when a thread or a profile is open. The regions and their lines follow [Page structure](../../patterns/page-structure.md#desktop).

```example
sidebar/sidebar
```

### The desktop sidebar

| Destination | The sidebar lists |
| --- | --- |
| Chat | Saved and Drafts, then the sections Pinned, the person's own sections, Joint channels, Channels and Direct messages. People can reorder the sections by dragging. Agents are listed among the direct messages |
| Members | No sidebar: the directory fills the page beside the rail, under its toolbar of tabs, search and its two add buttons; a member opens in the side panel beside it ([Members](./members.md)) |
| Computers | No sidebar: the computers fill the page beside the rail as a wall of cards, or a list, with an add button at its toolbar's end. A computer opens in the side panel beside them, selected on the wall ([Navigation](../../patterns/navigation.md#opening-an-item)) |
| Settings | The settings groups ([Settings](./settings.md)) |
| Tasks | No sidebar: the list (or the board) fills the page beside the rail, and a task opens in a column beside it |
| Search, Activity | No sidebar at first: the page fills the width. After a result is selected, the results list takes the sidebar's place, and the result opens next to it |

- Give a guest no Chat sidebar. A guest belongs to one channel, so a list of places would hold one row and nothing to choose: Chat opens that channel beside the rail, and on a phone it is their Home tab's page, with the tab bar and no Back, so Settings and Sign out stay one tap away. Its header is a top-level page's: the channel's name as the first header line, on paper with a seam under it ([Page structure](../../patterns/page-structure.md#phone)). A channel or direct message a guest can't read goes back to the server's root instead of an empty "select a channel"; a guest with no channel they can read gets an empty state that says so.

- Give every section header a disclosure, a count and a sort menu (Manual, Recent, A–Z), always visible, on desktop and on Home. A collapsed section shows a pink pixel when something in it is unread. Put a + button for Create channel in the header of Channels, and for Create joint channel in the header of Joint channels.
- Show unread as in [States](../../foundations/states.md), except that in a channel's row a mention of the person shows the yellow @ marker before the pink count. Unread in a muted or unjoined channel is a gray count, and a pencil marks a draft.
- Under the web top bar the sidebar has no header. Without the top bar, the header names the destination, and in Chat the working summary sits at its right.

### Pages of a list

Tasks, Artifacts, Members, Computers, Apps and Activity are pages of a list: a head with the title and the count, a toolbar, then the list ([A page of a list](../../patterns/page-structure.md#a-page-of-a-list)). Their toolbars hold:

| Page | Scope, at the start | Then | At the end |
| --- | --- | --- | --- |
| Tasks | Mine / All | The search, Channel, Status, Creator, Assignee ([Tasks](./tasks.md)) | The sort, List / Board, New task |
| Artifacts | None | The search, its filters | The sort, the view switch |
| Members | All / Humans / Agents | The search ([Members](./members.md)) | Group (on the Agents tab), Invite human, Create agent |
| Computers | None | The search, Status, Runtime ([Computers](./computers.md)) | Group, Sort, Cards / List, Add computer |
| Apps | Installed / Marketplace / Developer | The search, its filters | The view switch, Add app |
| Activity | None | The Filter button and its chip, filling the line; no search | Mark all read |

- Make Apps' Installed, Marketplace and Developer the toolbar's scope, not a row of tabs above it. All three list apps as the same cards with the same filters, so they are a scope like Mine / All, and the toolbar's start saves the line a row of tabs takes, as Polaris puts its view tabs at the start of the same row (stdrc asked Jasper to decide from research, #proj-raft-ui:f9756e85, 2026-11-10).
- Keep Activity's one Filter button with a chip as the exception to a button per filter: its filters, Unread, Mentions, Pinned, Saved and Artifacts besides All, are more than a few, and people mostly leave them at All ([Select › Filters](../../../packages/ui/src/components/select/select.md#which-filter-button)). With no search, its toolbar is one line that never wraps.

### The desktop app

The desktop app's title bar is the web top bar, at every width, with what [Page structure](../../patterns/page-structure.md#the-web-top-bar) adds for a desktop app. In Raft Chat:

- Back and Forward have ⌘[ and ⌘] (Alt+← and Alt+→ on Windows) in their tooltips.
- The update button shows while an update downloads, and reads Update, with a pink pixel, when it is ready. The web app shows the same button when a new release is out ([The web top bar](../../patterns/page-structure.md#the-web-top-bar)).
- The window's buttons get 82px on the left for the macOS traffic lights, and the caption buttons' width on the right on Windows.
- ⌘1 to ⌘9 (Ctrl+1 to Ctrl+9 on Windows) switch to the servers in the strip.
- A "Find a conversation…" field sits above the Chat sidebar's list.
- A layer that covers the whole window (a file or image preview, the share preview, a diagram in full screen, the feedback preview) makes its own header the window's title bar while it is open: its empty area drags the window, its controls opt out, and it keeps clear of the traffic lights and the caption buttons. It stays draggable unless a layer opened from it (a menu) is above it. A layer that doesn't span the window's width, such as a side panel or a dialog, starts below the title bar instead. People move the window by its top edge whatever is open; before, a preview opened from a dialog or a side panel, and the share preview always, left no edge to drag (stdrc, 2026-11-10, #triage:dbfc9fd4; slock #14128).

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
| Popover | Working now, the notifications, the server list, Help & resources (opened on hover from the rail) |
| Bottom sheet with a short explanation (phone) | Add Raft to your Home Screen, opened from the notification center's Install Raft or the Add button in Settings › Notifications (button: Got it) |
| Confirmation ([Overlays](../../components/overview.md#overlays)) | A Dialog, except two that use [AlertDialog](../../../packages/ui/src/components/alert-dialog/alert-dialog.md): discarding unsaved edits to an agent's profile, and opening a link that hands off to another app |
| Small form dialog ([Forms](../../patterns/forms.md#forms-in-a-dialog)) | Create channel, Create task, Create agent |
| Wide form dialog ([Forms](../../patterns/forms.md#the-large-form-dialog)) | Register app, editing an app (Edit Release Bot) |
| Profile card on a person or agent, on hover | A 51px avatar; the name with the light and what it is doing; the handle; Computer, Runtime, Model and Reasoning; the description on one line; for people who manage the agent, its recent activity. It has no buttons |

Side panels that stay open beside the conversation (a thread, a profile, the channel details) are side panels, not drawers, and have no scrim ([Channel](./channel.md#the-channel-details)).

## Rules

### Wide and narrow

These add to the shared breakpoints in [Responsive layout](../../patterns/responsive.md).

| Situation | Layout |
| --- | --- |
| Below 768px | Don't open the first channel automatically: Home comes first. From 768px, the root of a server opens its first channel |
| The Search and Activity results list | 380px, resizable from 320px to 640px, one width at every desktop width ([Spacing](../../foundations/spacing.md#resizing-columns)) |

### Pull to refresh

Pull to refresh follows [Navigation](../../patterns/navigation.md#refreshing): only on pages that load a snapshot.

- The pages that load a snapshot, and so have pull to refresh on a phone, are Saved, search results (once a search is showing), a channel's or a thread's files, and the lists in Settings: invites, join links, apps and billing.
- The pages fed by realtime updates, which never have it, are messages, threads, direct messages, Home's conversation list, Activity, Tasks, Members, Computers and a computer's page, and a channel's members.

### Lists of places

Sizes follow [The same kind, the same size](../../foundations/spacing.md#the-same-kind-the-same-size). On a phone, Home's channels and direct messages, Members and the Settings list are all a list of places, drawn with the same sidebar row: 44px, a 16px name at 600 and a 16px icon. Change one and you change them all. The test that pins it fails when Home's rows and the Settings list drift apart.

## Differences from the shared patterns

Raft Chat departs from these patterns today. Each line is the product's side; the rule is on the linked page.

| Pattern | What Raft Chat ships |
| --- | --- |
| A mention marker replaces the unread count ([States](../../foundations/states.md)) | A channel's row shows the @ marker before the pink count |
| Every pushed page has Back ([Navigation](../../patterns/navigation.md#going-back)) | On the phone web, the RaftBench gate page and the Assistant page while it loads have neither Back nor the tab bar |
| A known layout waits in a skeleton ([Waiting](../../components/overview.md#waiting)) | The conversation timeline and the profile panel show the word "Loading…" while they wait |
| No empty state when loading failed ([Feedback](../../patterns/feedback.md#empty-loading-and-failed)) | When the list of Activity or Saved fails to load, it shows its empty state |
| A setting that stands alone applies at once ([Forms](../../patterns/forms.md#settings-that-apply-at-once)) | Language & region, Mute this server, the onboarding, Hide #all, hiding the human directory and counts from members, turning on translation for the server, and a member's server role wait for Save |
| A feature that needs its configuration is a checkbox with one Save ([Forms](../../patterns/forms.md#settings-saved-together)) | App event notifications is a switch that only reveals the address field |
| Undo on every route, confirmation before going public ([Feedback](../../patterns/feedback.md#confirming)) | Done and Unfollow in Activity offer Undo only on the swipe; an Artifact goes public, and is unpublished from outside its conversation, without a confirmation; restarting or upgrading a computer, rotating a webhook secret and updating an invite link aren't confirmed |
