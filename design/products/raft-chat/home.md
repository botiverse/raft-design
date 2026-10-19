---
title: Raft Chat — Home
summary: The phone's Home screen — the workspace pill, who is working and the bell on the frame, the Search, Activity and Saved rows, and the channel and direct message sections.
---

# Raft Chat — Home

Home is the first top-level page on a phone. It answers which workspace you are in, who is working, and what is waiting, and it lists every channel and direct message. It is the same list as the desktop Chat sidebar, drawn on paper.

## Structure

From top to bottom:

1. **The top bar, on the frame**: a 56px row (`PanelSectionHeader`) with the workspace pill on the left, and the working summary and the bell on the right.
   - The pill opens the workspace list ([Composites](../../patterns/composites.md#switching-workspaces)).
   - The working summary is an avatar stack and a count; it opens Working now ([Agents](../../patterns/agents.md#where-working-agents-appear)) and is hidden when no one is working.
   - The bell opens the notification center and shows a pink pixel when there is something new.
2. **Three entry rows**: Search, Activity (with a pink count, up to 99+) and Saved (with a gray count in Space Mono), with no lines between them.
3. **Sections**: Pinned, the person's own sections, Joint Channels, Channels and Direct Messages, in the person's order. Agents are listed among the direct messages.
4. **The tab bar**, with Home selected. Nothing is attached above the tab bar.

```example
sidebar/compositions/phone-home
```

## Rules

- Show the workspace pill only on Home: ink with yellow text, tilted 2°, the workspace's name (at most 200px, then an ellipsis) and a chevron. Add the globe when the workspace's public page is on, and a pink pixel when another workspace has unread activity. In a window shorter than 600px, the pill becomes plain text and a chevron.
- Put the list straight on paper, not in cards.
- Draw the rows with the sidebar row ([Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md)), 44px high in `text-body` on a phone. The selected row is a yellow sticker.
- Don't put a pink button on Home. Create actions are the + buttons in the headers of Channels and Joint Channels (Create Channel, Create Joint Channel).
- Give every section header a disclosure with a count and a sort menu, always visible on a phone. A collapsed section shows a pink pixel when something in it is unread.
- Show unread as a pink count, a mention of the person as the yellow @ marker before it ([Badge](../../../packages/ui/src/components/badge/badge.md)), and unread in a muted or unjoined channel as a gray count. A pencil marks a draft.
- Make an agent's row one line: its avatar with its light, its name, and on the right what it is doing while it works, or its runtime in Space Mono when it doesn't. An unread count takes the place of either.
- Make the bell mirror the last icon button of the other top bars ([0035](../../decisions/0035-mirrored-top-bar-buttons.md)).
- Open every row as a pushed page that covers the tab bar.

## Differences from the shared patterns

- Home has no large title. Every top-level page should show a large title with its name, and Home's is Home ([0004](../../decisions/0004-title-on-every-top-level-page.md)); the product doesn't do this yet, and whether it will is in [Open questions](../../decisions/open-questions.md).
- The workspace pill opens the list as a popover anchored under the top bar, 8px from each side. The system's version is a bottom sheet ([0007](../../decisions/0007-workspace-switcher-sheet.md)); the product doesn't follow it yet.
- The rows are sidebar rows grown to 44px by the product. raft-ui's sidebar row has no phone size yet, so the example above shows them at their desktop height.
