---
title: Raft Chat — Home
summary: The phone's Home screen — the workspace pill, who is working and the bell on the frame, the Search, Activity and Saved rows, and the channel and direct message sections.
---

# Raft Chat — Home

Home is the first top-level page on a phone. It answers which workspace you are in, who is working, and what is waiting, and it lists every channel and direct message. It is the same list as the desktop Chat sidebar ([Raft Chat](./README.md#the-desktop-sidebar)), drawn on paper.

## Structure

From top to bottom:

1. **The top bar, on the frame**: a 56px row (`PanelSectionHeader`) with the workspace pill on the left, and the working summary and the bell on the right.
   - The pill opens the workspace list ([Built from existing parts](../../components/overview.md#switching-workspaces)).
   - The working summary opens Working now ([Agents](../../patterns/agents.md#where-working-agents-appear)).
   - The bell opens the notification center ([Raft Chat](./README.md#the-bell-and-activity)) and shows a pink pixel when there is something new.
2. **Three entry rows**: Search, Activity (with a pink count, up to 99+) and Saved (with a gray count in Space Mono), with no lines between them.
3. **Sections**: the sections of the Chat sidebar, without Saved, in the person's order.
4. **The tab bar**, with Home selected. Nothing is attached above the tab bar.

```example
sidebar/compositions/phone-home
```

The rows are sidebar rows grown to 44px by the product. raft-ui's sidebar row has no phone size yet ([#525](https://github.com/botiverse/raft-design/issues/525)), so the example above shows them at their desktop height.

## Rules

- Show the workspace pill only on Home: ink with yellow text, tilted 2°, the workspace's name (at most 200px, then an ellipsis) and a chevron. Add the globe when the workspace's public page is on. In a window shorter than 600px, the pill becomes plain text and a chevron.
- Put the list straight on paper, not in cards.
- Draw the rows with the sidebar row ([Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md)), 44px high in `text-body`. The Search, Activity and Saved rows are never selected.
- Don't put a pink button on Home. Creating is the + buttons in the section headers ([Raft Chat](./README.md#the-desktop-sidebar)).
- Open every row as a pushed page.
