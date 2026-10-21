---
title: Raft Chat — Home
summary: The phone's Home screen — the server switcher, who is working and the bell on the frame, the Saved row, and the channel and direct message sections.
---

# Raft Chat — Home

Home is the first top-level page on a phone. It answers which server you are in, who is working, and what is waiting, and it lists every channel and direct message. It is the same list as the desktop Chat sidebar ([Raft Chat](./README.md#the-desktop-sidebar)), drawn on paper.

## Structure

From top to bottom:

1. **The top bar, on the frame**: a 56px row (`PanelSectionHeader`), with the seam under it like every tab root, the server switcher on the left, and the working summary and the bell on the right. It has no subtitle and no Search button: searching everything is the Search tab ([Navigation](../../patterns/navigation.md#search-on-a-phone)).
   - The server switcher is the workspace pill on the phone web, and the server's avatar, its name and a chevron in the mobile app, which keeps its own (stdrc, 2026-10-21). It opens the server list as a popover ([Built from existing parts](../../components/overview.md#switching-servers)).
   - The working summary is an avatar stack and a count; it opens Working now ([Working agents](../../people-and-agents/working-agents.md#where-working-shows)) and is hidden when no one is working.
   - The bell, a 20px icon with a 44px target, opens the notification center ([Raft Chat](./README.md#the-bell-and-activity)) and shows a pink pixel when there is something new. Home is the only top-level page with the bell and the working summary.
2. **The Saved row**, with a gray count in Space Mono: Saved's only entry point on a phone. Search and Activity are on the tab bar, so Home has no rows for them.
3. **Sections**: the sections of the Chat sidebar, without Saved, in the person's order.
4. **The tab bar**, with Home selected. Nothing is attached above the tab bar.

```example
sidebar/compositions/phone-home
```

The rows are sidebar rows, which are 44px below `md` on their own ([Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md#rules)).

## Rules

- Show the server switcher only on Home. Draw the workspace pill as ink with yellow text, tilted 2°, the server's name (at most 200px, then an ellipsis) and a chevron. Add the globe when the server's public page is on. In a window shorter than 600px, the pill becomes plain text and a chevron.
- Put the list straight on paper, not in cards.
- Draw the rows with the sidebar row ([Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md)), 44px high in `text-body`. The Saved row is never selected.
- Don't put a pink button on Home. Creating is the + buttons in the section headers ([Raft Chat](./README.md#the-desktop-sidebar)).
- Open every row as a pushed page.
