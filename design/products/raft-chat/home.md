---
title: Raft Chat — Home
summary: The phone's Home screen — the workspace pill and bell on the frame, who is working, the three entry rows, and the channel, agent and direct message groups.
---

# Raft Chat — Home

Home is the first top-level page on a phone. It answers which workspace you are in, who is working, and what is waiting, and it lists every channel, agent and direct message.

## Structure

From top to bottom:

1. **The frame.** The navigation row has the workspace pill on the left and the bell on the right. The pill opens the workspace list as a bottom sheet ([Composites](../../patterns/composites.md#switching-workspaces)). The bell opens the notification center and shows a pink pixel when there is something new. Under the row, the large title Home, and under it the working-agents line ([Agents](../../patterns/agents.md#where-working-agents-appear)).
2. **Three entry rows**: Search, Activity (with the count of new activity) and Saved (with a gray count), with no lines between them.
3. **Groups**: Channels, Agents and Direct messages, as [ListRow](../../../packages/ui/src/components/list-row/list-row.md) rows with hairlines between the rows of a group.
4. **The tab bar**, with Home selected. Nothing is attached above the tab bar.

```example
list-row/compositions/entries
```

```example
list-row/compositions/conversations
```

## Rules

- Show the workspace pill only on Home: ink with yellow text, tilted 2°. Other top-level pages show neither the workspace name nor a page icon.
- Title the workspace bottom sheet Workspaces. Each row is the workspace tile, its name and its unread count, with a check on the current one; press and hold, then drag, to reorder. End the list with Invite People and Create or Join a Workspace, the same items as the product's switcher menu. The sheet is not modal, so it has no scrim.
- Put the list straight on `layer-canvas`, not in cards.
- Don't put a pink button on Home. Create actions are the New text buttons at the right of each group heading.
- Let group headings collapse.
- Show unread as a pink count, and a mention of the person as the @ marker ([Badge](../../../packages/ui/src/components/badge/badge.md)).
- While an agent is working, make the second line of its row what it is doing (live, in ink), and its time how long it has been working. When it isn't working, show its last message.
- Align the pill, the large title, the avatars and the icons on the left at 16px, and the bell icon and its badge on the right at 16px.
- Open every row as a pushed page that covers the tab bar.

## Differences from the shared patterns

- By default Home has a large title, like every top-level page, and the other top-level pages have no navigation row: the large title follows the status bar directly. The version that matches the current product has no title on Home: only the workspace pill, with a small avatar stack and count to its right, and the bell; the other top-level pages put their name in the navigation row in `text-headline`, with an optional subtitle. The choice is [still open](../../decisions/open-questions.md); see [0004](../../decisions/0004-title-on-every-top-level-page.md).
