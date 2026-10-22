---
title: MobileNav
summary: The phone tab bar — up to 5 destinations at the bottom of a top-level page, the selected one's icon in a yellow sticker.
status: stable
aliases: [TabBar, Tab bar, Bottom navigation]
layer: core
category: navigation
related: [app-rail, panel, workspace-button, popover]
redirectFrom: [decisions/0003-tab-bar-icon-sticker]
---

# MobileNav

MobileNav is the phone web's tab bar: a row of a product's destinations at the bottom of every top-level page. The selected destination's icon sits in a yellow sticker. Pushed pages cover it. Its last tab can be the current server, which opens a menu instead of a page. The iOS and Android apps draw the same destinations with their own system tab bar instead ([Navigation](../../../../../design/patterns/navigation.md#what-each-platform-draws)).

```example
mobile-nav/compositions/mobile-nav
```

## When to use

| Situation                           | Use                                                           |
| ----------------------------------- | ------------------------------------------------------------- |
| A product's destinations on a phone | MobileNav                                                     |
| The same destinations on desktop    | [AppRail](../app-rail/app-rail.md)                            |
| Sections of one page                | [Tabs](../tabs/tabs.md)                                       |
| Another view of the same content    | [SegmentedControl](../segmented-control/segmented-control.md) |

How the tab bar works with Back and pushed pages, and how many destinations it holds, is in [Navigation](../../../../../design/patterns/navigation.md). Nothing is attached above the tab bar; where working agents appear instead is in [Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows). Which destinations a product has is on its own page ([Raft Chat](../../../../../design/products/raft-chat/README.md)).

## Anatomy

- `MobileNavRoot`: the edge bar, on `layer-card` (in dark mode on `layer-frame`, the same dark layer as the tab header), with a `line-seam` along its top edge and padding for the bottom safe area. It runs the full width at the bottom edge; it is never a floating pill.
- `MobileNavItem`: one destination: a 22px icon, then its label.
- `MobileNavLabel`: the label, in `text-label`. It truncates.

## Search and the server tab

A product can give one of the tab bar's slots to Search and make its last tab the current server. Raft Chat does both, in its mobile app and on the phone web.

- Make Search a tab like the others: its page is a top-level page, with no Back, and the bar stays with Search `selected`. Search never shows an attention dot. How its page and its results behave is in [Navigation](../../../../../design/patterns/navigation.md#search-on-a-phone).
- Make the last tab the current server when the product has servers and more destinations than fit: the server's own pages go into its menu ([The server tab](#the-server-tab)). It replaces the More tab, a page that listed the remaining destinations, which Raft Chat had until 2026-10-22.

raft-ui draws Search with `MobileNavItem` and the server tab with `MobileNavServerItem`. Separate parts for a floating pill and a Search button (`MobileNavPill`, `MobileNavSearch`) are no longer planned.

## The server tab

The last tab is the current server: its avatar where the other tabs have an icon, its name as the label. It is the one tab that opens a menu, not a page ([Navigation](../../../../../design/patterns/navigation.md#the-server-tab-on-a-phone)). Experimental: the three parts are exported from `@botiverse/raft-ui/wip`, and their API can change in any release.

```example
mobile-nav/compositions/server-tab
```

- `MobileNavServerMenu`: the root, a Base UI Popover root. It owns the open state (`open`, `defaultOpen`, `onOpenChange`). Put it inside `MobileNavRoot`, as the last item; it renders nothing of its own.
- `MobileNavServerItem`: the tab, a `MobileNavItem` that opens the menu. Children are the server's [Avatar](../avatar/avatar.md) (`type="server"`, drawn at 22px, the size of the other tabs' icons) and its name in `MobileNavLabel`, which truncates. It takes no `selected`: it holds no page, so it is never selected. While the menu is open, it shows the press fill under its avatar.
- `MobileNavServerMenuContent`: the menu, a [Popover](../popover/popover.md) panel that rises above the tab bar, 8px from each side and 8px above it, as tall as its content up to 8px from the top of the window. It is a column: give a long server list `min-h-0 flex-1` and its own scrolling, so the rows after it stay in view.

The menu's rows are the product's: the server list as the switcher has it ([Switching servers](../../../../../design/components/overview.md#switching-servers)), then the server's own pages, then the switcher's footer actions. Raft Chat's are in [Navigation](../../../../../design/patterns/navigation.md#the-server-tab-on-a-phone).

- A press opens the menu, and a second press closes it.
- A long press, 500ms holding still, opens it too, the same moment raft-ui's other long-press menus open ([States](../../../../../design/foundations/states.md)). Lifting the finger leaves it open. A finger that moves more than 10px is a scroll, not a hold. The tab blocks the system's own long-press menu and text selection.
- Esc, a press outside the menu and choosing a row close it; focus goes back to the tab.

## Behavior

- Hide the bar while the on-screen keyboard is open. Pinned above the keyboard, it would cover the field being typed in and the composer. When the keyboard closes, bring the bar back with the platform's default transition, not an instant jump, so people can see the navigation return rather than wonder where it went.
- Show the bar only on top-level pages: a page with Back never shows it ([Navigation](../../../../../design/patterns/navigation.md#going-back)). Pushed pages cover it; menus, dialogs and bottom sheets leave it as it is.
- Keep the bar in place while a page scrolls. Don't hide it on scroll: it is how people know where they are.
- Tapping the selected item scrolls its page to the top, and on Search focuses the field. Each tab keeps its page's scroll position and filters while another tab is open ([Navigation](../../../../../design/patterns/navigation.md#going-back)).

## States

| State                 | Look                                                                                                                                                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not selected          | Icon and label in `foreground-hint`                                                                                                                                                                                                                                                                             |
| Selected (`selected`) | The icon in a 56×30px yellow sticker; the label in `foreground`, bold                                                                                                                                                                                                                                           |
| Attention             | One pink pixel at the top right of the icon; on the server tab, at the top right of its avatar (`AvatarBadge` with `offset={["100%", 0]}` and an `accent` [Status](../status/status.md)) ([States](../../../../../design/foundations/states.md)), never a number. Never on the selected item, with no exception |

The sticker wraps only the icon, not the whole item: a yellow item adds another strip of frame at the bottom of the screen, and wrapping only the icon halves the color while the selection still reads at a glance ([Navigation](../../../../../design/patterns/navigation.md#where-you-are)).

## Content

- Label every item, in Title Case ([Typography](../../../../../design/foundations/typography.md#casing)). Keep a label to at most 8 Latin letters or 4 Chinese characters, so 5 items fit at 320px; a longer one truncates. The server tab's label is the server's name, which people choose: it truncates, and the avatar beside it still tells servers apart.
- Which items can show an attention dot is the product's choice. Say other news inside the page instead.
- Show a dot, never a count, on the tab bar: the count belongs inside the page, next to what it counts.
- Dot the server tab when another server has unread items, and for something inside its menu that shows nowhere else; show the same dot on the row that caused it, so people can find what is new.

## Accessibility

- `MobileNavRoot` renders a `nav`. Name it with `aria-label="Primary"`.
- `MobileNavItem` renders the Base UI Button; `selected` sets `aria-pressed`. For an item that navigates, render a link (`render={<a href="…" />}` with `nativeButton={false}`) and set `aria-current="page"` on the selected one: raft-ui sets neither on a link.
- The visible label names the item. When an item shows an attention dot, give it an `aria-label` that says both: "Raft HQ, another server has unread items". The dot itself is `aria-hidden`.
- Give the server tab an `aria-label` with the server's name, so the avatar's initial is not read as part of it. It announces its menu (`aria-haspopup="dialog"`, `aria-expanded`); name the menu with an `aria-label` on `MobileNavServerMenuContent`, such as "Servers". Focus moves into the menu when it opens and back to the tab when it closes. A press opens it, so nobody needs the long press.
