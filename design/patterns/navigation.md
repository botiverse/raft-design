---
title: Navigation
summary: How people reach destinations, see where they are, follow links, go back, close things, switch servers and switch between the views of one place.
redirectFrom: [decisions/0007-workspace-switcher-sheet]
---

# Navigation

A product's destinations are on the tab bar on a phone and on the rail on desktop. Where you are is always yellow. Going back follows the history; a popup closes with ×, Esc or a press outside it. People move between many places and many servers in a day, so every product puts these in the same spots and marks them the same way.

## Principles

Every navigation rule on this page and on the pages that link to it follows from these three. Decided on 2026-10-21 by stdrc; Lagoon owns the navigation spec they come from.

1. **One structure, each platform's own look.** Phone web, iOS and Android have the same destinations, in the same order, at the same levels, with the same attention-dot rules; only three things look native: the tab bar, the system Back gesture and the page transitions ([What each platform draws](#what-each-platform-draws)). People carry where things are from one device to another, not how a bar is drawn, and each platform's own tab bar and gestures are what its people already know.
2. **One "where am I" per page.** A tab's top-level page says where you are with the tab bar; a pushed page says it with Back. A page never shows both, because the tab bar says which part of the product you are in and Back says where you came from: shown together, they give two ways out that lead to different places.
3. **Pages of the same kind look the same.** Every top-level page has one kind of top, and every pushed page has one kind of top ([Page structure](./page-structure.md#phone)). A change to one of them changes the whole kind, so people never have to relearn a page of a kind they already know.

## When it applies

Every Raft product. Which destinations a product has and in which order is on its own page ([Raft Chat](../products/raft-chat/README.md#destinations)).

## Structure

| Need | Phone | Desktop |
| --- | --- | --- |
| Destinations | The tab bar at the bottom, at most 5 slots, on top-level pages only ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) | The rail, icons only, with Help and Settings at its bottom, and the bell above them when there is no web top bar ([AppRail](../../packages/ui/src/components/app-rail/app-rail.md)) |
| Server | The server switcher in the top bar of the first top-level page; its list opens as a popover ([Servers](#servers)) | The workspace button and the strip of server avatars at the left of the web top bar ([Page structure](./page-structure.md#the-web-top-bar)) |
| Search | The Search tab on the tab bar, a top-level page like the others (no Back, the bar stays). It is the only way in to searching everything ([Search on a phone](#search-on-a-phone)) | The search field in the center of the web top bar |
| Notifications | The bell at the right of the first top-level page's top bar, and on no other top-level page | The bell at the right of the web top bar; without the top bar, at the bottom of the rail, above Help |
| Close a side panel (a thread, a profile) | Back: on a phone a thread is a pushed page, and a profile covers the page like one | × beside the main area, Back when it covers it ([Closing](#closing)) |

In Raft Chat the first top-level page is Home ([Raft Chat — Home](../products/raft-chat/home.md)).

## Rules

### What each platform draws

Principle 1 keeps three things native: the tab bar, system Back and the page transitions, with the platform's pull to refresh. Everything else is drawn by Raft and is the same on phone web, iOS and Android.

- Keep the destinations, their order, their levels and the attention-dot rules the same on phone web and in the iOS and Android apps.
- Draw the tab bar in each platform's own way: phone web uses raft-ui's [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md) edge bar, iOS the system tab bar, Android its bottom navigation bar. Don't imitate one platform's look on another, such as a floating glass bar on web or a floating pill anywhere.
- Use the platform's own system Back: the edge swipe on iOS, the system Back button on Android, the browser's Back on the web. What each one does is in [Going back](#going-back).
- Use the platform's default transition when a page is pushed or popped ([Motion](../foundations/motion.md#usage)), and the platform's own pull to refresh.
- Draw the top bars, Back, the titles and the filter rows with Raft's own parts ([Page structure](./page-structure.md#phone)), never with a platform's navigation bar. Their rules, such as no large title, are Raft's own and don't change with a platform's default.

### Where you are

- Mark the current place with a yellow sticker on paper: sidebar rows, segmented controls, tabs. Yellow means "you" everywhere, so where you are and what calls you share one color ([0011](../decisions/0011-yellow-navigation-selection.md)).
- On the tab bar, the sticker wraps only the icon: a whole yellow cell at the bottom of the screen would read as a second frame ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#states)).
- On the rail, the selected item is a white sticker on the yellow frame in light mode and a yellow sticker in dark mode, where the frame is neutral ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).
- Put a yellow location tile beside the title of the place the person is in, such as a channel ([IconTile](../../packages/ui/src/components/icon-tile/icon-tile.md)).
- Name a rail item in a tooltip to its right. The rail shows no labels, so that it stays 56px and its top-left corner stays square ([Spacing](../foundations/spacing.md#heights)).
- Show an attention dot on a destination when something in it waits for the person ([States](../foundations/states.md)). Which destinations carry one is on the product's page.
- Never show the dot on the selected destination, with no exception for any destination or product: the person is already there, and fewer rules are easier to keep.
- Put only the dot on a destination's icon, never a number ([Badge](../../packages/ui/src/components/badge/badge.md#rules)): the count belongs inside the page, next to what it counts.

### Collapsing the sidebar

On desktop, people can hide the sidebar to give the main area the whole width, and bring it back the same way.

- Put the toggle in the rail, as the first item of its footer, above Help and Settings. It belongs to the frame rather than to a page, so it stays in one spot whatever the main area shows ([AppShell](../../packages/ui/src/components/app-shell/app-shell.md#variants)).
- Show `panel-left-close` while the sidebar is shown and `panel-left-open` while it is hidden: the icon shows what pressing it does.
- Name it in a tooltip to its right, like every rail item: Collapse Sidebar or Expand Sidebar, then the shortcut in a [Kbd](../../packages/ui/src/components/kbd/kbd.md): ⌘\ on macOS, Ctrl+\ elsewhere. The shortcut works anywhere in the app, also while focus is in a text field.
- Remember the state on the device, like the sidebar's width: the sidebar comes back the way it was left, after a reload too.
- Show the toggle, and accept the shortcut, only where the sidebar is the navigation column beside the main area. A phone has no sidebar beside the main area, and on a page without a sidebar there is nothing to hide; the remembered state waits for the next page that has one.

### Going somewhere

- Link to places and items in running text with reference chips: a soft pink chip for a channel, a soft cyan chip for a thread, a computer or another piece of content. Link to the web with a blue link.
- Highlight the message someone jumped to with `info-soft`, and clear the highlight after 2 seconds: long enough to find it, short enough not to look selected.

### Going back

- Show either Back or the tab bar, never both (principle 2). A page with Back at its top was entered from somewhere, so it covers the tab bar; a page without Back is a tab's top-level page, so it shows the tab bar. The mobile app and the phone web follow this one test on every page.
- Make every page a top-level page or a pushed page; there is no third kind. Which pages are which is in [Page structure](./page-structure.md#phone).
- Give every pushed page Back, including a gate page in front of a feature, a page while it loads and a page that failed to load: without it a page covered by nothing but itself is a dead end.
- Put Back (`arrow-left`) at the top left of every pushed page.
- Treat the iOS edge swipe and the Android system Back button as a press on Back. On Android, system Back on a pushed page returns to the page before it; on a top-level page other than the first, it opens the first top-level page; on the first, it leaves the app.
- On the web, the browser's Back follows the browser's history, on top-level pages too; it doesn't go to the first top-level page the way Android's does. The browser's Back is the web's system Back, which belongs to each platform (principle 1).
- A link opened directly goes back one level at a time, up to the top-level page, so a shared link never leaves the person without a way out.
- Keep each top-level page's own state when people switch to another tab and back: its scroll position and its filters (what Search keeps is in [Search on a phone](#search-on-a-phone)). Don't keep pushed pages: a tab always reopens on its top-level page, because a pushed page hides the tab bar and would leave no way back.
- Tapping the selected tab scrolls its top-level page to the top. At the top it does nothing else and resets nothing. On Search it also focuses the search field.
- Activity is the one exception (artin, 2026-10-21): it is the list people work through, so tapping Activity again, or its title bar, goes to the next unread item below the current position, scrolls it to the top of the list and highlights it briefly. After the last unread item the next tap goes back to the top, and the cycle starts again; with no unread item it goes to the top. It moves only within the current filter and marks nothing as read. Don't give any other tab a meaning of its own: the gesture should mean the same everywhere else.
- Push the pages listed on a More tab under More, with Back to it, and open a link to one of them there too: the selected tab always says which part of the product the person is in.

### Search on a phone

- Reach search over everything only from the Search tab. Don't add a Search button or a Search row on another top-level page: one way in is easier to find and to remember.
- Make Search a tab like the others: its page has no Back, and the bar stays with Search selected (stdrc, 2026-10-21; as in Slack). Its top is in [Page structure](./page-structure.md#phone).
- Don't open the keyboard when people switch to Search: the tab bar and the selected tab stay in view. The keyboard opens when they tap the field, or when they tap Search again on the tab bar, which focuses the field.
- Show the recent searches while the field is empty.
- Keep the query, the filters, the results and their scroll position when people switch to another tab and back.
- Opening a result is entering a page: it has Back and covers the bar, whatever the result opens. Back returns to the results at the same scroll position and highlights the result just opened, as for a jump ([Going somewhere](#going-somewhere)), so people see where they came from.
- A search started inside a place, such as a channel's Search button, searches only that place. It opens as a pushed page that says its scope ("In #launch-week") and offers to search everything. Searching everything switches to the Search tab with the same query; the scoped page doesn't turn into the Search tab. A search keeps the scope of the place it starts from, and searching everything has its own tab.

### Closing

- Give a dialog a × at its top right. Esc closes it too.
- Close a menu, a popover or a drawer with Esc or a press outside it. A drawer on a phone has Back instead.
- Give a desktop side panel a × while it sits beside the main area, and Back when it covers it: what covers the page behaves like a pushed page.
- Give a full-screen page only Back.

### Servers

- On every surface the server switcher is the workspace button: the server's avatar, its name and a chevron ([WorkspaceButton](../../packages/ui/src/components/workspace-button/workspace-button.md)). It keeps that shape whatever sits beside it.
- On desktop, open the server list as a menu under the workspace button of the top bar. The strip beside the button switches with one click; it shows as many server avatars as fit, at least 2, and marks the current one with a bar under its avatar.
- On a phone, open the server list from the server switcher as a popover anchored under the top bar, 8px from each side. This is what the product ships, and the system follows it (stdrc, 2026-10-21); a bottom sheet for it is not planned.
- Show an attention dot on the workspace button's avatar and on a server's avatar in the strip when another server has unread items. How the list is built is in [Built from existing parts](../components/overview.md#switching-servers).

### Several views of one place

A place can hold several kinds of content, such as a channel's chat, tasks and files.

- Switch between them with one row of sticker tabs under the panel header ([Tabs](../../packages/ui/src/components/tabs/tabs.md#variants), in `ConversationPanelTabs`). Give each tab an icon and a one-word label, without a count.
- Let people reorder the tabs by dragging, and keep their order. The first tab in their order is the one a place opens on.
- Hide the row when a place has only one view, such as a thread.
- Use the same row in every place of a product, so a view is in the same spot wherever people open it. Raft Chat's channel views are in [Channel](../products/raft-chat/channel.md#chat-tasks-and-files).
- The same page in another language is not a view of it: switch to it from a menu that lists each language in its own name (English, Español), as a [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) with radio items. In a web top bar it sits at the right end; on a phone, where the top bar has no room for it, it goes in the menu.

## Related

- [Page structure](./page-structure.md): the regions.
- [States](../foundations/states.md): selected and unread.
- [Responsive layout](./responsive.md): what becomes a pushed page on a phone.
- [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md): the phone web's tab bar.
