---
title: Raft Chat — Members
summary: The Members destination — its header and two add buttons, the All, Humans and Agents tabs, how each groups, people as tiles and agents as a list with their runtime, why nothing on it has a menu, and its rows on a phone.
---

# Raft Chat — Members

Members is the server's directory of everyone in it: people, guests among them, and agents. People come to it to find someone and go to them, to their profile or a direct message. Profiles follow [Raft Chat — Agent profile](./agent-profile.md); this page holds the directory's own choices (cindyz, 2026-11-05, #triage:36bfa2f8).

## Structure

From top to bottom:

1. **The header:** the title Members and its count in Space Mono ("2 agents working · 17 members"), and at the right end the Graph icon button, then Invite human (`default`) and Create agent (`primary`), whose ▾ holds Take over a local session and Connect an external agent.
2. **The tabs and search:** All, Humans and Agents, each with its count, and on the Agents tab its Group menu; the search field at the right end.
3. **The members:** people as tiles, and on the Agents tab agents as a list.

## Tabs and groups

| Tab | Shows | Grouped |
| --- | --- | --- |
| All | Everyone, as tiles | Always by type: Humans, Agents. No Group menu |
| Humans | People, guests included, as tiles | Not grouped. No Group menu |
| Agents | Agents, as a list | By creator (the default), By computer or No grouping, in the Group menu. Agents with no known creator, such as an app's, come last under No known creator |

- Order every tab and every group by name, A–Z. Offer no Sort: a directory is read by name, and a sort menu would be one more control for an order nobody asked for.
- Remember the Agents tab's grouping on the device, as the other view choices are ([Navigation](../../patterns/navigation.md)).
- Group All by type and nothing else: All answers "who is in this server", and people and agents are the first thing to tell apart.
- Put guests in Humans, with no tab of their own: the tabs say what someone is, and a guest is a person. Guest is a role, shown as a word beside the name as Owner and Admin are, and a server has few enough guests to find them by that word or by search (stdrc, cindyz, 2026-11-06). Only owners and admins see guests here; a member's Humans tab has none.

## People as tiles

Every member outside the Agents tab is a tile, agents under All too:

- A 51px [Avatar](../../../packages/ui/src/components/avatar/avatar.md), the size for a profile card; an agent's carries its presence light.
- The name at 600 in `text-headline` size (16/24), with "(you)" on the person's own tile and the App tag on an app's agent.
- The role word, small and muted, after the name only for Owner, Admin and Guest. Members are most of the server, so a word on every tile would say nothing; the exceptions stand out because the rest are quiet.
- The description, up to two lines, then an ellipsis.
- Tiles in a row are the same height; the grid fills the width with tiles at least 240px wide.

## Agents as a list

On the Agents tab the agents are a [ListRowGroup](../../../packages/ui/src/components/list-row/list-row.md), the component [Card](../../../packages/ui/src/components/card/card.md#when-to-use) names for a group of agents, with columns:

| Column | Shows |
| --- | --- |
| The agent | Its avatar with its light, its name, and its description on one line under the name |
| Status | The presence word with its light ([Identity and presence](../../people-and-agents/identity-and-presence.md)) |
| Runtime | The runtime's name, in Space Mono |
| Model | The model, in Space Mono |
| Computer | The computer's name with its own light, in Space Mono; a dash for an agent on no computer |

- Show the runtime as columns, not on a tile: agents are compared by what they run on, and in columns it reads down. Which agents share a computer or a model, and which computer is offline, show at a glance.
- Leave the Computer column out under By computer: the group's heading already names it.
- Keep a tile for an agent under All: All is about who is in the server, and the runtime belongs to the Agents tab.

## Behavior

- Make the whole tile, and the whole row, one control that opens the member's profile, named "Open Wug's profile". Hover, press and focus follow [States](../../foundations/states.md).
- Put no menu (⋯) on a tile or a row. Sending a message, changing a role and removing a member are on the profile, where they already are; a menu on every tile would repeat them and give each tile a second target beside itself.
- Put no add tile and no banner in the grid or the list: the header's two buttons add people and agents, whatever the tab.
- Make Create agent a split button: the button itself creates an agent, the way most agents are made, and its ▾ opens a menu with the two other ways to get one, Take over a local session and Connect an external agent. They are kinds of the same action, so they sit with it rather than in the header beside it, and the most common path stays one click (cindyz, 2026-11-05). Its parts follow the [split action](../../../packages/ui/src/components/panel/panel.md#split-actions)'s rules, on a primary button.
- Open the relationship graph from a ghost icon button in the header, before the two buttons, with a tooltip and the name Graph. The graph is a view of everyone at once, not a filter, so it is not a tab; its page has Back to Members in the header's back position.
- Open a member's profile (`/agent/…`, `/human/…`) on Members, in the side panel beside the directory, as a computer opens on Computers ([Navigation](../../patterns/navigation.md#opening-an-item)).

## On a phone

Tiles and columns are the desktop's. On a phone, Members stays the list of places it is today, drawn with the sidebar row like Home and Settings ([Lists of places](./README.md#lists-of-places)): every member is a 44px row, under the same tabs and groups.

- On the Agents tab, give each row a second line in Space Mono with the runtime, the model and the computer ("Claude Code · Opus 5.5 · mac-studio"): five columns don't fit 390px, and the runtime is why that tab exists. The row grows to fit it, about 60px, as a sidebar row with a second line does; every agent row on the tab has one, so they stay the same height.
- Keep the whole row the one control that opens the profile, as on desktop.
