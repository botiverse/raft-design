---
title: Navigation
summary: How people reach destinations, see where they are, follow links, go back, close things, switch servers and switch between the views of one place.
redirectFrom: [decisions/0007-workspace-switcher-sheet]
---

# Navigation

A product's destinations are on the tab bar on a phone and on the rail on desktop. Where you are is always yellow. Going back follows the history; a popup closes with ×, Esc or a press outside it. People move between many places and many servers in a day, so every product puts these in the same spots and marks them the same way.

## When it applies

Every Raft product. Which destinations a product has and in which order is on its own page ([Raft Chat](../products/raft-chat/README.md#destinations)).

## Structure

| Need | Phone | Desktop |
| --- | --- | --- |
| Destinations | The tab bar at the bottom, at most 5 slots, on top-level pages only ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) | The rail, icons only, with Help and Settings at its bottom ([AppRail](../../packages/ui/src/components/app-rail/app-rail.md)) |
| Server | The workspace pill in the top bar of the first top-level page | The workspace button and the strip of server avatars at the left of the web top bar ([Page structure](./page-structure.md#the-web-top-bar)) |
| Search | A Search slot on the tab bar, which opens search over the current tab, or a Search row at the top of the first top-level page ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#search-and-more)) | The search field in the center of the web top bar |
| Notifications | The bell at the right of the first top-level page's top bar | The bell at the right of the web top bar |
| Close a side panel | Back (it covers the page like a pushed page) | × |

In Raft Chat the first top-level page is Home ([Raft Chat — Home](../products/raft-chat/home.md)).

## Rules

### Where you are

- Mark the current place with a yellow sticker on paper: sidebar rows, segmented controls, tabs. Yellow means "you" everywhere, so where you are and what calls you share one color ([0011](../decisions/0011-yellow-navigation-selection.md)).
- On the tab bar, the sticker wraps only the icon: a whole yellow cell at the bottom of the screen would read as a second frame ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#states)).
- On the rail, the selected item is a white sticker on the yellow frame in light mode and a yellow sticker in dark mode, where the frame is neutral ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).
- Put a yellow location tile beside the title of the place the person is in, such as a channel ([IconTile](../../packages/ui/src/components/icon-tile/icon-tile.md)).
- Name a rail item in a tooltip to its right. The rail shows no labels, so that it stays 56px and its top-left corner stays square ([Spacing](../foundations/spacing.md#heights)).
- Show an attention dot on a destination when something in it waits for the person ([States](../foundations/states.md)). Which destinations carry one is on the product's page.

### Going somewhere

- Link to places and items in running text with reference chips: a soft pink chip for a channel, a soft cyan chip for a thread, a computer or another piece of content. Link to the web with a blue link.
- Highlight the message someone jumped to with `info-soft`, and clear the highlight after 2 seconds: long enough to find it, short enough not to look selected.

### Going back

- Put Back (`arrow-left`) at the top left of every pushed page. Back follows the browser history.
- A link opened directly goes back one level at a time, up to the top-level page, so a shared link never leaves the person without a way out.
- Make every tab of the tab bar open its top-level page. Tabs don't remember sub-pages, because a sub-page hides the tab bar and would leave no way back.
- Push the pages listed on a More tab under More, with Back to it, and open a link to one of them there too: the selected tab always says which part of the product the person is in.
- Close search with Back, to the tab it was opened from. Search opens over a tab and never becomes one.

### Closing

- Give a dialog a × at its top right. Esc closes it too.
- Close a menu, a popover or a drawer with Esc or a press outside it. A drawer on a phone has Back instead.
- Give a desktop side panel a × while it sits beside the main area, and Back when it covers it: what covers the page behaves like a pushed page.
- Give a full-screen page only Back.

### Servers

- On desktop, open the server list as a menu under the workspace button of the top bar. The strip beside the button switches with one click; it shows as many server avatars as fit, at least 2, and marks the current one with a bar under its avatar.
- On a phone, open the server list from the pill as a bottom sheet: the list is within reach of the thumb and has room for many servers. Raft Chat doesn't follow this yet ([Raft Chat](../products/raft-chat/README.md#differences-from-the-shared-patterns)).
- Show an attention dot on the pill and on a server's avatar when another server has unread items. How the list is built is in [Built from existing parts](../components/overview.md#switching-servers).

### Several views of one place

A place can hold several kinds of content, such as a channel's chat, tasks and files.

- Switch between them with one row of sticker tabs under the panel header ([Tabs](../../packages/ui/src/components/tabs/tabs.md#variants), in `ConversationPanelTabs`). Give each tab an icon and a one-word label, without a count.
- Let people reorder the tabs by dragging, and keep their order. The first tab in their order is the one a place opens on.
- Hide the row when a place has only one view, such as a thread.
- Use the same row in every place of a product, so a view is in the same spot wherever people open it. Raft Chat's channel views are in [Channel](../products/raft-chat/channel.md#chat-tasks-and-files).

## Related

- [Page structure](./page-structure.md): the regions.
- [States](../foundations/states.md): selected and unread.
- [Responsive layout](./responsive.md): what becomes a pushed page on a phone.
