---
title: Raft Chat — Desktop
summary: The desktop layout of a channel — the rail's destinations, the Chat sidebar, the main area, and how the web app's top bar fits on top.
---

# Raft Chat — Desktop

On desktop, a channel runs from the yellow rail through the cream sidebar to the white main area. The shared layout rules (the web top bar, one line between regions, header heights) are in [Page structure](../../patterns/page-structure.md).

## Structure

From left to right:

1. **The rail**, icons only (56px): the workspace; Search, Chat, Activity, Tasks, Members, Computers; at the bottom Notifications, Help, Settings. Attention dots follow [Raft Chat](./README.md#attention-dots). The labeled rail is the other version ([Open questions](../../decisions/open-questions.md)).
2. **The sidebar**: the header says Chat, with the working avatar stack and its count on the right. Then Channels, Agents and Direct messages. A working agent's row shows what it is doing on the right ("Writing release notes", "Fixing the radius on #31"); the others show their runtime.
3. **The main area**: the panel header (location tile, name, one line of description), then the Chat / Tasks / Files tabs, the timeline (an evidence strip, a message with a task marker, a hand-off event line, the working agent), and the composer (an @ delegation chip, As Task and the pink Send ↵).

```example
app-shell/compositions/responsive
```

## Rules

- How a thread or a task opens beside the chat is in [Channel views](./channel-views.md) and [Raft Chat](./README.md#wide-and-narrow).
- Working agents are shown in the sidebar header and in their rows, never in a live bar at the bottom of the sidebar ([0006](../../decisions/0006-working-agents-in-place.md)).
- The dark-mode frame and the rail's selection follow [Dark mode](../../foundations/dark-mode.md); mixed Chinese and English text follows [Typography](../../foundations/typography.md).
