---
title: Navigation
summary: How people reach destinations, see where they are, follow links, go back, close things, switch workspaces and switch between the views of one place.
---

# Navigation

A product's destinations are on the tab bar on a phone and on the rail on desktop. Where you are is always yellow. Going back follows the history; closing is the × of whatever floats.

## When it applies

Every Raft product. Which destinations a product has and in which order is on its own page ([Raft Chat](../products/raft-chat/README.md)).

## Structure

| Need | Phone | Desktop |
| --- | --- | --- |
| Destinations | The tab bar at the bottom, at most 5, on top-level pages only ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) | The rail, with notifications, help and settings at its bottom ([AppRail](../../packages/ui/src/components/app-rail/app-rail.md)) |
| Workspace | The workspace pill at the top of Home | The tile at the top of the rail |
| Close a side panel | — (it is a pushed page) | × |

## Rules

### Where you are

- Mark the current place with a yellow sticker on paper: sidebar rows, segmented controls, tabs. On the tab bar, the sticker wraps only the icon.
- On the rail, the selected item is a white sticker on the yellow frame in light mode and a yellow sticker in dark mode.
- Put a yellow location tile beside the title of the place the person is in, such as a channel ([IconTile](../../packages/ui/src/components/icon-tile/icon-tile.md)).

### Going somewhere

- Link to places and items in running text with reference chips: a soft pink chip for a place, a soft cyan chip for a piece of content. Link to the web with a blue link.
- Highlight the item someone jumped to with `info-soft`.

### Going back

- Put Back at the top left of every pushed page. Back follows the browser history.
- A link opened directly goes back one level at a time, up to the top-level page.
- To change tabs, go back to the top-level page first. Selecting any tab opens its top-level page; tabs don't remember sub-pages.

### Closing

- Give every popup a × at its top right.
- Give a full-screen page only Back.
- Give a desktop side panel a ×.

### Workspaces

- Open the same workspace list from the pill on a phone and from the rail tile on desktop: it rises from the bottom on a phone and opens next to the tile on desktop. How the list is built is in [Composites](./composites.md#switching-workspaces).
- Show an attention dot on the pill and the tile when another workspace has unread items.

### Several views of one place

A place can hold several kinds of content (a channel's chat, tasks and files).

- Switch between them with one row of tabs ([Tabs](../../packages/ui/src/components/tabs/tabs.md)), a segmented control in the top bar ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)), or by putting one of them in the side panel next to the main area.
- Pick one of these per product and use it everywhere in that product. Raft Chat's choice is [still open](../decisions/open-questions.md).

## Related

- [Page structure](./page-structure.md): the regions.
- [States](../foundations/states.md): selected and unread.
- [Responsive layout](./responsive.md): what becomes a pushed page on a phone.
