---
title: Navigation
summary: How people reach destinations, see where they are, follow links, go back, close things, switch servers and switch between the views of one place.
redirectFrom: [decisions/0007-workspace-switcher-sheet]
---

# Navigation

A product's destinations are on the tab bar on a phone and on the rail on desktop. Where you are on paper is always yellow, in every theme (`selected`: [Themes](../foundations/themes.md#signals)); on the frame, the rail's selected item takes the theme's frame colors ([Where you are](#where-you-are)). Going back follows the history; a popup closes with ×, Esc or a press outside it. People move between many places and many servers in a day, so every product puts these in the same spots and marks them the same way.

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
| Server | The last tab of the tab bar is the current server; it opens the server list and the server's own pages as a popover above the bar. The first top-level page's top bar has the server switcher too ([Servers](#servers)) | The workspace button and the strip of server avatars at the left of the web top bar ([Page structure](./page-structure.md#the-web-top-bar)) |
| Search | The Search tab on the tab bar, a top-level page like the others (no Back, the bar stays). It is the only way in to searching everything ([Search on a phone](#search-on-a-phone)) | The search field in the center of the web top bar |
| Notifications | The bell at the right of the first top-level page's top bar, and on no other top-level page | The bell at the right of the web top bar; without the top bar, at the bottom of the rail, above Help |
| Close a side panel (a thread, a profile) | Back: on a phone a thread is a pushed page, and a profile covers the page like one | × beside the main area, Back when it covers it ([Closing](#closing)) |

In Raft Chat the first top-level page is Home ([Raft Chat — Home](../products/raft-chat/home.md)).

## Rules

### What each platform draws

Principle 1 keeps three things native: the tab bar, system Back and the page transitions. Pull to refresh is the platform's own in the iOS and Android apps and drawn by raft-ui on phone web, where the browser has none ([Refreshing](#refreshing)). Everything else is drawn by Raft and is the same on phone web, iOS and Android.

- Keep the destinations, their order, their levels and the attention-dot rules the same on phone web and in the iOS and Android apps.
- Draw the tab bar in each platform's own way: phone web uses raft-ui's [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md) edge bar, iOS the system tab bar, Android its bottom navigation bar. Don't imitate one platform's look on another, such as a floating glass bar on web or a floating pill anywhere.
- Use the platform's own system Back: the edge swipe on iOS, the system Back button on Android, the browser's Back on the web. What each one does is in [Going back](#going-back).
- Use the platform's default transition when a page is pushed or popped ([Motion](../foundations/motion.md#usage)).
- Use the platform's own pull to refresh in the iOS and Android apps, and raft-ui's [PullToRefresh](../../packages/ui/src/components/pull-to-refresh/pull-to-refresh.md) on phone web, on the pages that have one ([Refreshing](#refreshing)).
- Draw the top bars, Back, the titles and the filter rows with Raft's own parts ([Page structure](./page-structure.md#phone)), never with a platform's navigation bar. Their rules, such as no large title, are Raft's own and don't change with a platform's default.

### Refreshing

Decided on 2026-10-23 by stdrc. A page that updates by itself never asks people to refresh it: if a pull were needed to see what is new, people could never trust that what they see is current, and would pull every page to be sure. So a page fed by realtime updates stays current on its own, and pull to refresh is only for pages that load a snapshot and have no other way to catch up.

- On a phone, put pull to refresh only on pages that load a snapshot when they open and don't update themselves. In Raft Chat these are Saved, search results (once a search is showing), a channel's or a thread's files, and the lists in Settings: invites, join links, apps and billing.
- Never put it on a page fed by realtime updates: messages, threads, direct messages, Home's conversation list, Activity, Tasks, Members, Computers and a computer's page, a channel's members. These stay current on their own, and catch up when the app comes back to the foreground or reconnects; a page that falls behind is a bug in its updates.
- In the iOS and Android apps, use the platform's own pull to refresh control, in Raft's look.
- On phone web, and in the installed web app, use raft-ui's [PullToRefresh](../../packages/ui/src/components/pull-to-refresh/pull-to-refresh.md): the browser has no pull to refresh inside a page's scroll container, nor any in standalone mode.
- Make a pull feel the same everywhere, with the numbers the mobile team set for the iOS app (mobile #3553), approved by the product lead: a release refreshes once the pull, damped by a 0.55 rubber band, has passed 100px; the indicator holds at 60px while refreshing and never goes past 140px, so a long drag can't push the list off a small screen. Except on Android, the threshold latches, as with iOS's `UIRefreshControl`: once passed, a release refreshes even if the finger moved back up, so someone who eases off still gets the refresh they asked for. After the release, and when the refresh ends, the indicator goes back in 300ms with an ease-out and no overshoot or bounce, which would read as a second pull; with reduced motion, at once.
- On Android, follow Material 3: the indicator travels down over the content, which stays still, and the phone ticks once (a 10ms vibration) when the pull passes the threshold. There is no latch: moving back above the threshold before release disarms the pull, and the release doesn't refresh. Material 3 lets a pull be taken back; iOS commits once armed. Other platforms don't vibrate.
- On Android web, the indicator is Android's own: Material 3's progress arc on a small disc, which grows with the pull, is faint until the pull is armed and again once it is disarmed, turns while refreshing and scales away when the refresh ends (decided by stdrc on 2026-10-23, overriding for Android the earlier rule of the Spinner on every platform). On Android a pull is known by that arc, in Chrome and in every app, so phone web draws the same one ([PullToRefresh](../../packages/ui/src/components/pull-to-refresh/pull-to-refresh.md#on-android)).
- Everywhere else, iOS included, the indicator is the design system's loading icon, the [Spinner](../../packages/ui/src/components/spinner/spinner.md), never a platform's own spinner (decided by artin). While pulling it stands still and shows how far the pull has come; while refreshing it spins.
- Don't put a Refresh button on a phone: pulling is the one way to refresh there. A Retry button in a failed load's error state stays, because it recovers from the failure rather than refreshing content ([Feedback](./feedback.md#empty-loading-and-failed)).
- When a refresh fails, keep the content on screen and show a `warning` toast with the same message as a failed first load, not a banner: what is on screen is still useful, only not the newest.

### Where you are

- Mark the current place with a yellow sticker on paper: sidebar rows, segmented controls, tabs. Yellow means "you" everywhere, so where you are and what calls you share one color ([0011](../decisions/0011-yellow-navigation-selection.md)).
- On the tab bar, the sticker wraps only the icon: a whole yellow cell at the bottom of the screen would read as a second frame ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#states)).
- On the rail, the selected item is a white sticker on the yellow frame in light mode and a yellow sticker in dark mode, where the frame is neutral ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)). The rail is part of the frame, so in another theme its selected item takes that theme's frame colors (`layer-frame-active`), gray in Boring Gray ([Themes](../foundations/themes.md#signals)).
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

- Link to places and items in running text with reference chips: a soft pink chip for a channel, a soft cyan chip for a thread, a computer or another piece of content. A link that an app previews is a piece of content too, a cyan chip ([App links](#app-links)). Link to the rest of the web with a blue link.
- Mark the message someone jumped to as located: `info-soft` at once, fading out by 2 seconds, long enough to find it and short enough not to look selected ([Located](../foundations/states.md#located)). The same goes for every jump: to a reply in a thread, to a file comment's passage, to an Activity item.

#### App links

An app connected to a server, such as Stamp for code review, can preview its own links: when someone posts the address of a pull request, a document or a run, the app supplies a title and details for it. The link stays where it was written, in the sentence, as a cyan reference chip with the app's icon and the app's title; the details open on hover.

```example
message-reference/compositions/app-links
```

- Show an app link as a reference chip in the text (`MessageReferenceChip variant="info"`), never as a card under the message. The link is one item in a sentence: a card moves it out of the sentence to the bottom of the message, where the reader has to match it back to the words around it, and a message with three links would carry three cards.
- Show a message that is only a link as the same chip, with no card of its own: one link is one item whether or not words surround it.
- Write the app's `title` in the chip exactly as the app sends it. Don't compose a format of Raft's own, such as "repo#number · title": the title says what the app wants to say, in its own product's terms, and Raft doesn't interpret what an app's item is.
- Cap the chip and truncate a long title at the end, so each link takes at most one line ([MessageItem](../../packages/ui/src/components/message-item/message-item.md#app-links)).
- Lead the chip with the app's registered icon, the image Raft stores for the app and serves itself. Never show an image from an address the app sends with the preview: an image fetched from the app on every view tells the app who read the message and when, and an app could draw an icon that passes for one of Raft's own.
- Show no state on the chip, in its icon or its color. Which states an item has is the app's concept, not Raft's, and the status colors mean task and presence states: a lime "done" on a merged pull request would read the opposite of what developers know from GitHub, where merged is purple and green is open. The state is in the app's words, on the hover card.
- While the preview loads (it is fetched for each reader after the message appears), show the link as `MessageReferencePending`: a gray chip with the address shortened to its host and path, capped at the same width. When the preview arrives only the icon and the words change, so the text around the chip moves as little as it can.

```example
message-reference/compositions/app-link-pending
```

- When the reader hasn't allowed the app yet and the server asks whether to show its previews, keep the gray chip with the shortened address (`MessageReferenceChip variant="muted"`), as a button, not a link: a link would open the address at the same click and skip the question. It opens no card. Clicking, tapping or pressing Enter on it asks first, the same on every device, in a [Popover](../../packages/ui/src/components/popover/popover.md): Open Link goes without previews, Show Previews allows them. A card can't ask: it is read-only, and its buttons can't be reached by keyboard or touch.
- On desktop, hovering or focusing the chip opens the app's item card with the details: the id, the title, a state and a line of details in the app's words, its actions, and the app's name and host ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card)). Raft puts no colors of the app's on it.
- On a phone, tapping the chip opens the link. A preview card doesn't open on touch, so make the chip a real link (`render={<a href="…" target="_blank" rel="noopener noreferrer" />}`) that opens in a new tab, leaving the conversation where it was.

### Links that leave Raft

A control that takes someone to another site ends in ↗, so they know before they press it that they will leave Raft. Docs, pricing, terms and privacy, an app's homepage, TestFlight, Stripe and GitHub all count.

- Use one mark: Lucide's `ArrowUpRight`, never the box with an arrow (`ExternalLink`, `SquareArrowOutUpRight`). It is in the text's color.
- Put it at the end:
  - TextLink: `TextLinkExternalIcon`, 0.857em of the text (12px at 14px), 2px after the text, centered on the cap height; the underline stops at the text ([TextLink](../../packages/ui/src/components/text-link/text-link.md#leaving-raft)).
  - Button: in the trailing icon's place, at the button's icon size.
  - Menu item: where the shortcut goes, so it lines up with the other items' shortcuts.
  - Sidebar row: in the row's trailing slot, in `foreground-hint`.
- Open it in a new tab (`target="_blank" rel="noopener noreferrer"`), and give the mark a label a screen reader reads after the text, "(opens in a new tab)". On desktop the same link opens in the system browser and looks the same.
- Stripe checkout and the billing portal stay in the same tab, because they come back to Raft by themselves when payment is done. They still end in ↗; the label says where they go ("(goes to Stripe)").
- No ↗ on:
  - sign-in round trips (Google, GitHub, an app's sign-in): they come back by themselves, and nobody needs to know they changed sites;
  - downloads: they take the download icon and don't leave the page;
  - links people write in messages: they are already visibly links, show their address on hover, and an arrow on every one would be noise (app link chips follow [MessageItem](../../packages/ui/src/components/message-item/message-item.md#app-links));
  - anything inside Raft. To open a Raft place in a new tab, people use the browser's own gestures; never mark an internal link with ↗.

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
- Activity is the one exception (artin, 2026-10-21): it is the list people work through, so tapping Activity again, or its title bar, goes to the next unread item below the current position, scrolls it to the top of the list and marks it as located ([Located](../foundations/states.md#located)). After the last unread item the next tap goes back to the top, and the cycle starts again; with no unread item it goes to the top. It moves only within the current filter and marks nothing as read. Don't give any other tab a meaning of its own: the gesture should mean the same everywhere else.
- Open the server's own pages from the server tab's popover (Members, Computers, Settings) as pushed pages: they cover the tab bar and Back returns to the page the popover was opened on. A link opened directly to one of them goes back to the first top-level page. They belong to no tab, because the server tab holds no page of its own ([Servers](#servers)).

### Search on a phone

- Reach search over everything only from the Search tab. Don't add a Search button or a Search row on another top-level page: one way in is easier to find and to remember.
- Make Search a tab like the others: its page has no Back, and the bar stays with Search selected (stdrc, 2026-10-21; as in Slack). Its top is in [Page structure](./page-structure.md#phone).
- Don't open the keyboard when people switch to Search: the tab bar and the selected tab stay in view. The keyboard opens when they tap the field, or when they tap Search again on the tab bar, which focuses the field.
- Show the recent searches while the field is empty.
- Keep the query, the filters, the results and their scroll position when people switch to another tab and back.
- Opening a result is entering a page: it has Back and covers the bar, whatever the result opens. Back returns to the results at the same scroll position and marks the result just opened as located, as for a jump ([Located](../foundations/states.md#located)), so people see where they came from. On a desktop the results stay beside what they opened, and the open result is selected, so it needs no located highlight.
- A search started inside a place, such as a channel's Search button, searches only that place. It opens as a pushed page that says its scope ("In #launch-week") and offers to search everything. Searching everything switches to the Search tab with the same query; the scoped page doesn't turn into the Search tab. A search keeps the scope of the place it starts from, and searching everything has its own tab.

### Closing

- Give a dialog a × at its top right. Esc closes it too.
- On a phone, a dialog drawn as a sheet has its × at the top left, where a pushed page has Back. From the second step of a flow on, Back takes that place and the × goes: the sheet is a stack of steps, and Back undoes one ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)).
- Close a menu, a popover or a drawer with Esc or a press outside it. A drawer on a phone has Back instead.
- Give a desktop side panel a × while it sits beside the main area, and Back when it covers it: what covers the page behaves like a pushed page.
- Give a full-screen page only Back.

### Servers

- On every surface the server switcher is the workspace button: the server's avatar, its name and a chevron ([WorkspaceButton](../../packages/ui/src/components/workspace-button/workspace-button.md)). It keeps that shape whatever sits beside it. The phone's server tab is the one exception, below: it is a tab, so it looks like the tabs beside it.
- On desktop, open the server list as a menu under the workspace button of the top bar. The strip beside the button switches with one click; it shows as many server avatars as fit, at least 2, and marks the current one with a bar under its avatar.
- Show an attention dot on the workspace button's avatar and on a server's avatar in the strip when another server has unread items. How the list is built is in [Built from existing parts](../components/overview.md#switching-servers).

#### The server tab on a phone

Decided on 2026-10-22 by stdrc (D1a, task #152).

- Make the last tab the current server: its avatar where the other tabs have an icon, and its name as the label, truncated ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#the-server-tab)). It takes the slot More had, so the bar keeps 5 tabs, and every top-level page says which server it shows, under the thumb.
- Make it the one tab that opens a popover, not a page. It is never selected: a server is where you are, not a place to go, so it has no page of its own to mark.
- Open the popover on a press and on a long press alike. A press is how every tab works, and a long press is how people switch accounts from a tab in other apps (Instagram); one tab should never do two different things.
- Open it as a popover that rises above the tab bar, 8px from each side and 8px above the bar: it comes out of the tab that opened it, as the Home switcher's list comes out of the top bar. It is a popover, not a bottom sheet (stdrc, 2026-10-21).
- Keep the popover compact, at most 60% of the screen's height, so the page it opened over stays in view and the popover reads as a quick switch, not a page of its own (artin, 2026-10-22).
- Put the server list first, as the switcher's list has it: each server's name with its address under it (`/launch`) in muted Space Mono, so two servers with similar names can be told apart, as the switcher shows them. The row keeps the option padding of every popup list, and the address adds only its own line ([Forms](./forms.md#option-height)); the 20px avatar centers on both lines. The current one is bold and checked and the others with their unread counts, in the order people dragged them into: press and hold a row, then drag it, here too, and the order is the one the Home switcher and the desktop strip show. The row is picked up after the long press (500ms, raft-ui's touch-drag hold, as for the sidebar's rows), so a tap still switches and scrolling the list never moves a server; a hold let go without moving switches nothing. Dragging is a shortcut, never the only way ([Accessibility](../foundations/accessibility.md)): in every one of these lists, the strip included, Space picks up the focused row, the arrow keys move it, Space drops it and Escape puts it back, as for task cards; Enter stays the row's own action and switches to that server. The list scrolls inside the popover; the rest stays in view.
- Then the switcher's footer actions, one line each: Join Community (until the person has joined it), Switch or Create Server and Invite Human. Invite Human stays here and not in the row of pages: it opens a dialog rather than a place, and these are the same actions as the Home switcher's, so the two lists match.
- Last, at the very bottom, the server's own pages, which More held: Members, Computers and Settings, side by side in one row of equal buttons, each an icon over its label. They are three places in the same server, so one row says they belong together and costs one line instead of three; at the bottom they are nearest the thumb and the tab bar they came from, where More was (stdrc, 2026-10-22). A guest, who has no Members or Computers, gets the row with Settings alone: Settings holds their account and Sign Out, and on a phone the popover is its only way in. The row and the footer actions stay in view while the list scrolls.
- What More held belongs to the server, so it sits under the server, and one popover answers both "which server" and "what in this server".
- Open each of the server's pages as a pushed page, with Back ([Going back](#going-back)).
- Keep the current tab when people switch servers: switching from Activity shows the new server's Activity. People switch to do the same thing in another server, and taking them Home would make them find their way back.
- Show the attention dot on the server tab's avatar only when another server has unread items, as on Home's workspace button. One mark has one meaning: the same avatar with the same dot can't mean more on the tab bar than in the top bar. The server tab is on every top-level page, so news in another server is seen from anywhere, not only from Home. In the popover, each server's row shows its unread count, as the switcher's list does.
- Mark something new on one of the server's own pages (a feedback reply, a computer that needs attention) with an attention dot on that page's button in the popover (Settings, Computers), never on the avatar.
- When people come back from one of the server's pages, give focus back to the server tab, so a keyboard or a screen reader picks up where it left off.
- Keep the workspace button in Home's top bar. It opens the same server list and footer actions, without the server's pages, as a popover anchored under the top bar, 8px from each side. It names the server at the top of the page people land on, so one switcher appears in two places, with one list.

#### The server in the apps' desktop mode

Decided on 2026-10-23 by Jasper, on sindresorhus's proposal (task #8).

- From 840dp, where the apps show the rail ([Responsive layout](./responsive.md#structure)), the server is the workspace tile in the rail's header and nowhere else: the rail has no server tab. Two entries to the same server side by side make people wonder whether they do different things. The web has one, the workspace button at the top left.
- The tile opens the server tab's popover next to it: the server list, the footer actions, then the server's pages. The apps' rail keeps the phone's destinations, so Members and Computers have no item on it, and the popover is where they live, as on a phone.
- Leave Settings out of the popover's row there: it is already at the bottom of the rail, as on the web, and one place has one button. The row holds Members and Computers, and a feedback reply's dot stays on the rail's Settings. A guest has neither, so for a guest the popover has no row of pages at all, rather than an empty one.
- Show the attention dot on the tile's avatar only when another server has unread items, the same rule as the server tab's.

### Several views of one place

A place can hold several kinds of content, such as an agent's profile and its activity, or a channel's chat, tasks and files.

- Show content that people check while they talk, such as a channel's tasks and files, as side sections beside the conversation rather than as tabs, so the conversation stays in view ([Page structure](./page-structure.md#sidebar-and-side-panel)). Where a column is too short for two stacked sections, or the sections cover the panel, they show one at a time under a Tasks / Files row of tabs ([The channel's side columns](./responsive.md#the-channels-side-columns)).
- Switch between the other views with one row of sticker tabs under the panel header ([Tabs](../../packages/ui/src/components/tabs/tabs.md#variants), in `ConversationPanelTabs`). Give each tab an icon and a one-word label, without a count.
- Let people reorder the tabs by dragging, and keep their order. The first tab in their order is the one a place opens on.
- Hide the row when a place has only one view, such as a thread.
- Use the same row in every place of a product, so a view is in the same spot wherever people open it. Raft Chat's channel views are in [Channel](../products/raft-chat/channel.md#tasks-and-files).
- The same page in another language is not a view of it: switch to it from a menu that lists each language in its own name (English, Español), as a [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) whose items are links (`DropdownMenuLinkItem`), so each one can be opened in a new tab and shared. In a web top bar it sits at the right end; on a phone, where the top bar has no room for it, it goes in the menu.

### Switching on finger lift

On a phone, a tap that lands while a list is still momentum-scrolling only stops the scroll: the browser sends no click, so a control that switches on click needed a second tap. Navigation controls switch when the finger lifts instead (`touchend`), so the first tap both stops the list and switches (Artea, 2026-10-27, after testing on a phone).

- A touch counts as a tap when it is one finger, moves no more than 10px from where it landed, lifts inside the control, and lasts less than 500ms. More than 10px is a scroll (the same tolerance as a touch drag, [States](../foundations/states.md#dragging-on-a-touch-screen)); sliding off the control is how people cancel; at 500ms a long press opens a menu or arms a drag, and a tap must not race them.
- The control then activates once: the lift cancels the browser's own click, so nothing activates twice and no ghost click lands on what appears under the finger. When the browser won't let the lift be cancelled, the control waits for its click as before.
- A mouse, a pen and the keyboard are unchanged: they activate on click. A disabled control does nothing.
- It applies to [Tabs](../../packages/ui/src/components/tabs/tabs.md), [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md), [ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md), the [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md) tab bar, and Back ([Panel](../../packages/ui/src/components/panel/panel.md)'s `PanelAction` with `activateOnTouchEnd`, which `DialogSheetBack` sets). raft-ui does it with `useTapActivation` (`lib/tap-activation.ts`).
- Rows, list items and menu items keep switching on click. They sit in the list that scrolls, so a finger that stops the list on a row would open it by accident.

## Related

- [Page structure](./page-structure.md): the regions.
- [States](../foundations/states.md): selected and unread.
- [Responsive layout](./responsive.md): what becomes a pushed page on a phone.
- [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md): the phone web's tab bar.
