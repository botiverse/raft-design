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

MobileNav is the phone web's tab bar: a row of a product's destinations at the bottom of every top-level page. The selected destination's icon sits in a yellow sticker. Pushed pages cover it. Its last tab can be the current server, which opens a popover instead of a page. The iOS and Android apps draw the same destinations with their own system tab bar instead ([Navigation](../../../../../design/patterns/navigation.md#what-each-platform-draws)).

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
- Make the last tab the current server when the product has servers and more destinations than fit: the server's own pages go into its popover ([The server tab](#the-server-tab)). It replaces the More tab, a page that listed the remaining destinations, which Raft Chat had until 2026-10-22.

raft-ui draws Search with `MobileNavItem` and the server tab with `MobileNavServerItem`. Separate parts for a floating pill and a Search button (`MobileNavPill`, `MobileNavSearch`) are no longer planned.

## The server tab

The last tab is the current server: its avatar where the other tabs have an icon, its name as the label. It is the one tab that opens a popover, not a page ([Navigation](../../../../../design/patterns/navigation.md#the-server-tab-on-a-phone)). Experimental: its parts are exported from `@botiverse/raft-ui/wip`, and their API can change in any release.

```example
mobile-nav/compositions/server-tab
```

- `MobileNavServerPopover`: the root, a Base UI Popover root. It owns the open state (`open`, `defaultOpen`, `onOpenChange`). Put it inside `MobileNavRoot`, as the last item; it renders nothing of its own.
- `MobileNavServerItem`: the tab, a `MobileNavItem` that opens the popover. Children are the server's [Avatar](../avatar/avatar.md) (`type="server"`, drawn at 22px, the size of the other tabs' icons) and its name in `MobileNavLabel`, which truncates. It takes no `selected`: it holds no page, so it is never selected. While the popover is open, it shows the press fill under its avatar.
- `MobileNavServerPopoverContent`: the popover, a [Popover](../popover/popover.md) panel that rises above the tab bar, 8px from each side and 8px above it, as tall as its content and at most 60% of the screen (`60dvh`). It is a column of the parts below, with a `PopoverSeparator` between them.
- `MobileNavServerPopoverList`: the server list. It takes the room left in the popover and scrolls inside it, so the parts after it stay in view.
- `MobileNavServerPopoverRow`: a row with the option padding of every popup list, 36px for one line, a second line adding only its own height ([Forms](../../../../../design/patterns/forms.md#option-height)): a 20px avatar or a 16px icon, `MobileNavServerPopoverRowLabel`, which truncates, then a check, a [Badge](../badge/badge.md) or a gray count. `aria-current="true"` sets the current server in bold.
- `MobileNavServerPopoverRowBody` and `MobileNavServerPopoverRowDescription`: a server's name over its address (`/raft-hq`), in muted Space Mono, as the switcher shows it. The avatar and the trailing check or count center on both lines.
- `MobileNavServerPopoverDestinations` and `MobileNavServerPopoverDestination`: the server's own pages in one row of equal buttons, each a 20px icon over its label in a `span`. The row is a `group`; name it with `aria-label`, such as the server's name.
- `MobileNavServerPopoverGroup`: rows that always stay in view, such as the footer actions.

The popover's rows are the product's: the server list as the switcher has it ([Switching servers](../../../../../design/components/overview.md#switching-servers)), then the switcher's footer actions, then the server's own pages in a `MobileNavServerPopoverDestinations` row at the very bottom, nearest the tab bar. Raft Chat's are in [Raft Chat](../../../../../design/products/raft-chat/README.md#the-server-tab).

- A press opens the popover, and a second press closes it.
- A long press, 500ms holding still, opens it too, the same moment raft-ui's other long-press menus open ([States](../../../../../design/foundations/states.md)). Lifting the finger leaves it open, and a long press while it is open leaves it as it is. A finger that moves more than 10px is a scroll, not a hold. The tab blocks the system's own long-press popover and text selection.
- Esc, a press outside the popover and choosing a row close it; focus goes back to the tab. When a row opens a pushed page, the product gives focus back to the tab when people come back from it, as the example does.
- It is a popover (a `dialog`), not an ARIA menu: its rows are buttons, reached with Tab, without arrow-key navigation.

## The vertical tab bar

On a foldable phone's outer screen, the tab bar stands at the bottom of the system's column, on the side of the screen ([Page structure](../../../../../design/patterns/page-structure.md#foldable-phones)). The iOS app's is the system's own tab bar, turned upright by the system; these rules hold for any tab bar drawn there.

- Keep the order, first at the top: in Raft Chat, Home, Activity, Tasks, Search, then the server.
- Show the icons only: the column has no room for labels. Keep each label as the item's accessible name, the server tab's server name included, with the dot when there is one ("Raft HQ, another server has unread items").
- Wrap only the icon in the selected sticker, as in the bar ([States](#states)).
- Make every target at least 44×44pt, with the hit area rather than a bigger icon, counting the space between stacked icons.
- Open the server tab's popover beside the tab, toward the content: its bottom edge level with the tab's, 8px from the column's inner edge, at most 60% of the screen's height. There is no room above the tab in a column.
- Show it on top-level pages only; a pushed page's column has Back instead. It hides while the keyboard is open, as below.

## Behavior

- Hide the bar while the on-screen keyboard is open. Pinned above the keyboard, it would cover the field being typed in and the composer. When the keyboard closes, bring the bar back with the platform's default transition, not an instant jump, so people can see the navigation return rather than wonder where it went.
- Show the bar only on top-level pages: a page with Back never shows it ([Navigation](../../../../../design/patterns/navigation.md#going-back)). Pushed pages cover it; menus, dialogs and bottom sheets leave it as it is.
- Keep the bar in place while a page scrolls. Don't hide it on scroll: it is how people know where they are.
- An item switches when the finger lifts, so a tap while the page is still momentum-scrolling switches tabs at once ([Switching on finger lift](../../../../../design/patterns/navigation.md#switching-on-finger-lift)).
- Tapping the selected item scrolls its page to the top, and on Search focuses the field. Each tab keeps its page's scroll position and filters while another tab is open ([Navigation](../../../../../design/patterns/navigation.md#going-back)).

## States

| State                 | Look                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Not selected          | Icon and label in `foreground-hint`                                                                                                                                                                                                                                                                                                                         |
| Selected (`selected`) | The icon in a 56×30px yellow sticker; the label in `foreground`, bold                                                                                                                                                                                                                                                                                       |
| Attention             | One pink pixel at the top right of the icon; on the server tab, at the top right of its avatar (`AvatarBadge` with `offset={["100%", 0]}` and an `accent` [Status](../status/status.md)), and only for another server's unread items ([States](../../../../../design/foundations/states.md)), never a number. Never on the selected item, with no exception |

The sticker wraps only the icon, not the whole item: a yellow item adds another strip of frame at the bottom of the screen, and wrapping only the icon halves the color while the selection still reads at a glance ([Navigation](../../../../../design/patterns/navigation.md#where-you-are)).

## Content

- Label every item, in Title Case ([Typography](../../../../../design/foundations/typography.md#casing)). Keep a label to at most 8 Latin letters or 4 Chinese characters, so 5 items fit at 320px; a longer one truncates. The server tab's label is the server's name, which people choose: it truncates, and the avatar beside it still tells servers apart.
- Which items can show an attention dot is the product's choice. Say other news inside the page instead.
- Show a dot, never a count, on the tab bar: the count belongs inside the page, next to what it counts.
- Dot the server tab only when another server has unread items, the one meaning the same avatar and dot have on Home's [WorkspaceButton](../workspace-button/workspace-button.md). Something new on one of the server's pages gets its dot on that page's button in the popover, an `accent` `Status` inside `MobileNavServerPopoverDestination`, never on the avatar.

## Accessibility

- `MobileNavRoot` renders a `nav`. Name it with `aria-label="Primary"`.
- `MobileNavItem` renders the Base UI Button; `selected` sets `aria-pressed`. For an item that navigates, render a link (`render={<a href="…" />}` with `nativeButton={false}`) and set `aria-current="page"` on the selected one: raft-ui sets neither on a link.
- The visible label names the item. When an item shows an attention dot, give it an `aria-label` that says both: "Raft HQ, another server has unread items". The dot itself is `aria-hidden`.
- Give the server tab an `aria-label` with the server's name, so the avatar's initial is not read as part of it. It announces its popover (`aria-haspopup="dialog"`, `aria-expanded`); name the popover with an `aria-label` on `MobileNavServerPopoverContent`, such as "Servers". Focus moves into the popover when it opens and back to the tab when it closes. A press opens it, so nobody needs the long press.
