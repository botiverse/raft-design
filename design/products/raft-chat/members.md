---
title: Raft Chat — Members
summary: The Members destination — its header, its toolbar with the All, Humans and Agents scope, the search and two add buttons, how each groups, people as tiles and agents as a list with their runtime, how a member opens and its right-click menu, and its rows on a phone.
---

# Raft Chat — Members

Members is the server's directory of everyone in it: people, guests among them, and agents. People come to it to find someone and go to them, to their profile or a direct message. Profiles follow [Raft Chat — Agent profile](./agent-profile.md); this page holds the directory's own choices (cindyz, 2026-11-05, #triage:36bfa2f8).

## Structure

From top to bottom:

1. **The header:** the title Members and its count in Space Mono ("2 agents working · 17 members").
2. **The toolbar:** All, Humans and Agents, each with its count, as its scope; the search field after them, filling the line; at its end, on the Agents tab, its Group menu, then Invite human (`default`) and Create agent (`primary`), whose ▾ holds Take over a local session and Connect an external agent. The search and the add buttons moved here from the right end of the tabs row and the header, as on every page of a list ([A page of a list](../../patterns/page-structure.md#a-page-of-a-list)). It stays under the header while the members scroll, and with a mouse it is a header's height, 44px, as every list's toolbar line is ([Heights](../../foundations/spacing.md#heights)); the segmented track's 3px of padding reaches into the air above and below it. At 64px it set the members 108px under the header's seam, and the 34px controls in it looked small next to its height (cindyz, 2026-11-10, #triage:102defeb).
3. **The members:** people as tiles, and on the Agents tab agents as a list.

## Tabs and groups

| Tab | Shows | Grouped |
| --- | --- | --- |
| All | Everyone, as tiles | Always by type: Humans, Agents. No Group menu |
| Humans | People, guests included, as tiles | Not grouped. No Group menu |
| Agents | Agents, as a list | No grouping (the default), By creator or By computer, in the Group menu. Agents with no known creator, such as an app's, come last under No known creator |

- Order every tab and every group by name, A–Z. Offer no Sort: a directory is read by name, and a sort menu would be one more control for an order nobody asked for.
- Keep the tabs in this order, All first: every scope in Raft puts the whole before its parts, and a page where All came last would read differently from the rest. Someone who mostly looks at agents gets them by the next rule, not by a different order (cindyz, 2026-11-13, #triage:fc5388ec).
- Remember the chosen tab and the Agents tab's grouping per server on the device, as Computers remembers its Cards or List choice: a person who manages agents opens Members on Agents, grouped as they left it.
- Make No grouping the Agents tab's default, first in the Group menu, and draw the menu plain while it is chosen; it fills, as an applied filter does, only once a grouping is chosen. One A–Z list is how the other tabs read, and a default drawn as an applied filter looked as if someone had already narrowed the list (cindyz, 2026-11-10, #triage:102defeb). The default is the same where the server hides its people from a member; By creator isn't offered there, and a stored By creator reads as By computer.
- Group All by type and nothing else: All answers "who is in this server", and people and agents are the first thing to tell apart.
- Put guests in Humans, with no tab of their own: the tabs say what someone is, and a guest is a person. Guest is a role, shown as a word beside the name as Owner and Admin are, and a server has few enough guests to find them by that word or by search (stdrc, cindyz, 2026-11-06). Only owners and admins see guests here; a member's Humans tab has none, and the tab's count and the header's total don't count them.

## People as tiles

Every member outside the Agents tab is a tile, agents under All too. A tile is a [ListRow](../../../packages/ui/src/components/list-row/list-row.md) set in a card: the avatar at the left and the text centered beside it, at a row's sizes.

- A 35px [Avatar](../../../packages/ui/src/components/avatar/avatar.md) (`md`), the size people and agents have in every list; an agent's carries its presence light.
- The name at 600 in `text-body` (14/22 with a mouse), alone on its line, with the App label on an app's agent.
- The role as a folded tag over the tile's top-right corner, the hover card's (`RoleCornerTag`, [Member labels](../../people-and-agents/identity-and-presence.md#member-labels)), only for Owner, Admin and Guest; an agent can be Admin too. On the person's own tile the tag says You, with the role after it ("You · Owner"). Members are most of the server, so a tag on every tile would say nothing; the exceptions stand out because the rest are quiet. A role word and "(you)" written after the name crowded it, in a second size and face, and for an agent took the place its model needs (cindyz, 2026-11-13, #triage:fc5388ec).
- Under the name, one line, as the row's subtitle (`text-footnote`, 12/18 with a mouse), then an ellipsis: a person's description, in the name's ink; an agent's model in Space Mono 12/18 in the hint ink, as in the Agents tab's Model column (the same fact on the same page looks the same; the sender line's sans `text-caption` is for a model among words). The model is what people check on an agent and change most, and a tile holds two lines: "model · description" on one line didn't fit 2 of 6 tiles at 1440px and none at 800px, so an agent's description is on its hover card and profile instead. A member without a line under the name has the name centered.
- Every tile is a ListRow's height (66px with a mouse, 58px by touch) plus its card's two hairlines: 68px and 60px, with a description or without one, so every row of the grid is one height. The grid fills the width with tiles at least 240px wide.

Why a row's sizes, not a profile card's (cindyz, 2026-11-10, #triage:102defeb): a tile used to be 261 × 169, with a 51px avatar, a 16/24 name and two lines held for a description that 16 of 17 people didn't have. It was five times the head's 34px buttons and its name was the page title's size, so next to the rail and the head the page read out of proportion, and a 900px screen showed 15 of 25 members. A person in a list is a 64px row with a 35px avatar everywhere else ([Heights](../../foundations/spacing.md#heights), [Avatar sizes](../../../packages/ui/src/components/avatar/avatar.md#sizes)), the same agent was 70px on the Agents tab and 169px on All ([The same kind, the same size](../../foundations/spacing.md#the-same-kind-the-same-size)), and inside a list or a card a title stands out by weight, not by a size of its own ([Hierarchy contrast](../../foundations/comfort.md#hierarchy-contrast)). The grid stays, as chosen on 2026-11-05; only its tiles shrink, and all 25 members fit on one screen.

## Agents as a list

On the Agents tab the agents are a [ListRowGroup](../../../packages/ui/src/components/list-row/list-row.md), the component [Card](../../../packages/ui/src/components/card/card.md#when-to-use) names for a group of agents, with columns:

| Column | Shows |
| --- | --- |
| The agent | Its avatar with its light, its name, and its description on one line under the name |
| Status | The presence word with its light ([Identity and presence](../../people-and-agents/identity-and-presence.md)) |
| Runtime | The runtime's name, in Space Mono |
| Model | The model, in Space Mono |
| Computer | The computer's name with its own light, in Space Mono; a dash for an agent on no computer |

- Write an agent's role (Admin) as a small muted word after its name in the list, not as the tiles' corner tag. A list row has no card corner for a tag to fold over, and its end is taken by the columns and Edit agent, so a tag there would sit on the Computer column or the pencil. It is the same word the tag holds, and one in a list of agents is rare enough to stand out on its own.
- Make each row a ListRow with a subtitle, 66px with a mouse: the description is its subtitle (`text-footnote`, 12/18), the runtime, model and computer its meta (Space Mono 12/18, in the hint ink), the status word the same 12/18 and the column heads `text-footnote` at 700 in the hint ink. Set at the name's 14/22, the description and the status word read as a second title on every row (cindyz, 2026-11-10, #triage:102defeb).
- Keep the light in the Status column even though the avatar has one: the column is read downward, and there the lights line up beside the words that name them.
- Show the runtime as columns, not on a tile: agents are compared by what they run on, and in columns it reads down. Which agents share a computer or a model, and which computer is offline, show at a glance.
- Leave the Computer column out under By computer: the group's heading already names it.
- Keep a tile for an agent under All: All is about who is in the server. The tile shows the model, the one runtime fact people look for there (#triage:#359, a user who couldn't see which model an agent used); the runtime and the computer belong to the Agents tab.

## Behavior

- Make the whole tile, and the whole row, one control that opens the member's profile, named "Open Wug's profile". Hover, press and focus follow [States](../../foundations/states.md).
- Put no menu (⋯) on a tile or a row. Sending a message, changing a role and removing a member are on the profile, where they already are; a menu on every tile would repeat them and give each tile a second target beside itself.
- Give an agent's tile and row one second target, Edit agent: a pencil icon button (`ghost`, `icon-md`, tooltip "Edit agent"), at the tile's bottom-right end and at the end of the row, after the Computer column. It opens the agent's settings dialog, the one the profile's Runtime config pencil opens (runtime, provider, model, reasoning), over the page. Show it to whoever may change the agent: an owner or admin, or the agent's creator, as on the profile; for anyone else, and for an external, archived or app-managed agent, it isn't there. With a mouse it appears on hover or focus of its tile or row; by touch it is always shown. It sits beside the tile's control, not inside it, and the tile stays highlighted while the pencil is hovered. Changing an agent's model was five clicks and a scroll through its profile, the step a user asked to be quicker; from Members it is four (Edit, Model, the model, Save) without leaving the page, and the dialog keeps every runtime setting together rather than a model control on each tile (cindyz, 2026-11-13, #triage:#359).
- Right-clicking a tile or a row opens the member's [context menu](../../../packages/ui/src/components/context-menu/context-menu.md) (send a message; for an agent, Edit agent for whoever may change it, then start, stop, restart or reset), and double-clicking it opens a direct message (cindyz, 2026-11-09); on a phone, pressing and holding a row opens the same menu. Both are shortcuts with no mark of their own: every action in the menu is also on the profile, built from the same list, so nothing depends on finding them.
- Put no add tile and no banner in the grid or the list: the toolbar's two buttons add people and agents, whatever the tab.
- Make Create agent a split button: the button itself creates an agent, the way most agents are made, and its ▾ opens a menu with the two other ways to get one, Take over a local session and Connect an external agent. They are kinds of the same action, so they sit with it rather than in the toolbar beside it, and the most common path stays one click (cindyz, 2026-11-05). Its parts follow the [split button](../../../packages/ui/src/components/button/button.md#split-buttons)'s rules, on a primary button.
- Open a member's profile (`/agent/…`, `/human/…`) on Members, in the side panel beside the directory, as a computer opens on Computers ([Navigation](../../patterns/navigation.md#opening-an-item)).

## On a phone

Tiles and columns are the desktop's. On a phone, Members is a list of places, drawn with the sidebar row like Home and Settings ([Lists of places](./README.md#lists-of-places)): every member is a 44px row, under the same tabs and groups.

- On the Agents tab, give each row a second line in Space Mono with the runtime, the model and the computer ("Claude Code · Opus 5.5 · mac-studio"): five columns don't fit 390px, and the runtime is why that tab exists. The row grows to fit it, about 60px, as a sidebar row with a second line does; every agent row on the tab has one, so they stay the same height.
- Keep the whole row the one control that opens the profile, as on desktop.
- Under All and Humans, show the role and You as the same corner tag, inset into the row's pressed shape; the Agents tab keeps its runtime line, with the role word after the name. An agent row the person may change shows the Edit agent pencil at its end, and is then at least the two-line height (about 60px) even without a model, so the corner tag sits above the pencil, not on it; pressing and holding a row opens the same menu with Edit agent.
