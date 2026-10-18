---
title: Raft Chat
summary: Raft Chat's own structure — its destinations, what the sidebar lists, where working agents appear, threads, and the layout rules only Raft Chat has.
---

# Raft Chat

Raft Chat is Raft's first product: channels, direct messages, agents and tasks in one conversation. These pages describe only its own structure: its destinations, what each screen shows and where things go. Colors, components and the shared layouts are in the [foundations](../../foundations/), the component docs and the [patterns](../../patterns/). The rules here come from Raft Chat's product code; other products don't have to follow them.

| Page | Covers |
| --- | --- |
| [Home](./home.md) | The phone's Home screen |
| [Channel](./channel.md) | A channel: its top bar, its conversation, tasks inside it, threads |
| [Channel views](./channel-views.md) | The four ways of switching between a channel's chat, tasks and files |
| [Tasks](./tasks.md) | The Tasks destination |
| [Agent profile](./agent-profile.md) | An agent's profile page |
| [Settings](./settings.md) | The Settings destination and its pushed pages |
| [Onboarding](./onboarding.md) | The first-run screens |
| [Desktop](./desktop.md) | The desktop layout of a channel |

## Structure

### Destinations

| Where | Destinations |
| --- | --- |
| Phone tab bar | Home, Tasks, Members, Settings. Guests don't have Members |
| The first three rows of phone Home | Search, Activity (with the count of new activity), Saved (with a gray count); see [Home](./home.md) |
| Desktop rail | The workspace; Search, Chat, Activity, Tasks, Members, Computers; at the bottom Notifications, Help, Settings. Guests don't have Members or Computers |
| Only in Settings | Computers (on a phone), Account, Sign Out |

### Attention dots

- On the rail, show a pink pixel on Chat when there are unread messages, on Activity when there is new activity, on Computers when a computer needs attention, and on Settings when feedback has a new reply.
- On the phone tab bar, show it only on Settings, for a new feedback reply. Everything else new shows inside the pages; Home's Activity row carries a count.

### The bell and Activity

- The bell opens the notification center: the state of the whole workspace (a computer offline, a quota nearly full, an update). It is at the top right of Home on a phone and at the bottom of the rail on desktop.
- Activity lists what happened elsewhere that the person should see: mentions, replies, tasks handed to them.

### The desktop sidebar

| Destination | The sidebar lists |
| --- | --- |
| Chat | Three groups: Channels, Agents, Direct messages |
| Members | The members |
| Settings | The settings groups; Account opens by default |
| Tasks | No sidebar: the board follows the rail directly |
| Search, Activity | After a result is selected, the results list takes the sidebar's place, and the result opens in the side panel |

- Put the destination's name in the sidebar header. In Chat, put the working avatar stack and its count at the right of the header.

### Where working agents appear

The shared rules are in [Agents](../../patterns/agents.md#where-working-agents-appear). In Raft Chat:

| Place | Shows |
| --- | --- |
| Phone Home, under the large title | The avatar stack and "2 agents working"; opens Working now |
| Phone Home, the version that matches the current product | A small avatar stack and the count, to the right of the workspace pill |
| Desktop Chat sidebar header | The avatar stack and the count; opens the same Working now |
| An agent's row | Phone: the second line says what it is doing. Desktop sidebar: what it is doing replaces the runtime |
| Channel top bar | The subtitle: the avatar stack and "2 agents working · 5 members" |
| The conversation | The agent's status line at the end of the timeline, with a still yellow light |

- Selecting a row in Working now goes to the channel or task the agent is working in.

## Rules

### Wide and narrow

These add to the shared breakpoints in [Responsive layout](../../patterns/responsive.md).

| Situation | Layout |
| --- | --- |
| Below 768px | Don't open the first channel automatically: Home comes first |
| The Search and Activity results list | 320px from 768px to 1023px, 560px from 1024px, 320px while a side panel is open |
| The thread beside the conversation | When the main area is at least 680px and the window is landscape or at least 1280px wide: the thread is 400px (resizable from 360px to 60% of the window) and the conversation keeps at least 320px. Otherwise the thread covers the conversation |
| Profile, task and file side panels | The shared rule: from 1024px, beside the conversation (380px) when it keeps at least 320px; otherwise covering it |

## Differences from the shared patterns

- Raft Chat's choice between the four [channel views](./channel-views.md) is still open; see [Open questions](../../decisions/open-questions.md).
- Home's title differs from the current product; see [0004](../../decisions/0004-title-on-every-top-level-page.md).
