---
title: Raft Chat — Desktop
summary: The desktop layout of a channel — the web top bar, the rail's destinations, the Chat sidebar, the main area, and what the desktop app adds.
---

# Raft Chat — Desktop

On desktop, a channel runs from the yellow rail through the cream sidebar to the white main area, under the web top bar. The shared layout rules (the web top bar, one line between regions, header heights) are in [Page structure](../../patterns/page-structure.md).

## Structure

From top to bottom, then left to right:

1. **The web top bar** (48px, on the frame): the workspace button with its menu and the workspace strip on the left; the search field in the center, which opens search; the working summary and the bell on the right.
2. **The rail**, icons only (57px with its seam): Chat, Activity, Tasks, Members, Computers; at the bottom Help and Settings. Attention dots follow [Raft Chat](./README.md#attention-dots).
3. **The sidebar**, with no header under the top bar: Saved, then Pinned, the person's own sections, Joint Channels, Channels and Direct Messages. A working agent's row shows what it is doing on the right ("Writing release notes"); the others show their runtime.
4. **The main area**: the channel's header (location tile, name, the working line and the description, Search and Settings), the Chat, Tasks and Files tabs, the timeline and the composer ([Channel](./channel.md)).
5. **A side panel**, when a thread or a profile is open ([Raft Chat](./README.md#wide-and-narrow)).

```example
sidebar/sidebar
```

### The desktop app

The desktop app's title bar is the web top bar, at every width. It adds:

- Back, Forward and History (36px frame items) after the workspace strip, with ⌘[ and ⌘] (Alt+← and Alt+→ on Windows) in their tooltips;
- the update chip before the working summary while an update downloads, and an Update button with a pink pixel when it is ready;
- room for the window's own buttons: 82px on the left for the macOS traffic lights, and the caption buttons' width on the right on Windows, with the search field kept centered on the window;
- ⌘1 to ⌘9 (Ctrl+1 to Ctrl+9 on Windows) to switch to the workspaces in the strip;
- a "Find a conversation…" field above the Chat sidebar's list.

## Rules

- Show working agents in the top bar's summary and in their rows, never in a live bar at the bottom of the sidebar ([0006](../../decisions/0006-working-agents-in-place.md)).
- The dark-mode frame and the rail's selection follow [Dark mode](../../foundations/dark-mode.md); mixed Chinese and English text follows [Typography](../../foundations/typography.md).
