---
title: AppRail
summary: The leftmost desktop column, on the frame — the workspace tile at the top, the product's destinations in the middle, and notifications, help and settings at the bottom.
status: stable
aliases: [Rail]
layer: core
category: navigation
related: [sidebar, mobile-nav, tooltip, notification-center]
---

# AppRail

AppRail is the desktop's leftmost column of destinations, on the yellow frame. The workspace tile is at the top, the product's destinations follow, and notifications, help and settings sit at the bottom. Selecting a destination fills the [Sidebar](../sidebar/sidebar.md) next to it.

```example
app-rail/app-rail
```

## When to use

| Situation                              | Use                                      |
| -------------------------------------- | ---------------------------------------- |
| A product's destinations on desktop    | AppRail                                  |
| The same destinations on a phone       | [MobileNav](../mobile-nav/mobile-nav.md) |
| What the selected destination contains | [Sidebar](../sidebar/sidebar.md)         |

Which destinations a product has, and in which order, is on its own page ([Raft Chat](../../../../../design/products/raft-chat/README.md)).

## Anatomy

- `AppRailRoot`: the column, on `layer-frame`, with a `line-seam` along its right edge.
- `AppRailHeader`: the 56px square at the top, holding the workspace tile. Its seam lines up with the sidebar's and the panel's ([Page structure](../../../../../design/patterns/page-structure.md#headers)). It is left out when the web top bar is shown.
- `AppRailNav`: the destinations.
- `AppRailItem`: one destination: an `AppRailItemIcon` with a 20px icon, and an `AppRailItemLabel` with its name.
- `AppRailItemAttention`: the pink pixel on an item, with text for assistive technology. It is built on `AppRailItemIndicator`; `AppRailItemBadge` is a count in the same corner.
- `AppRailFooter`: notifications, help and settings.

## Variants

| Variant              | Use for                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Icons only (default) | Every product today. 56px wide plus the seam; each item is 40px square, and its name appears in a tooltip to the right                                                                                                                                 |
| Icons with labels    | Names under the icons, in `text-label` (bold when selected). 68px wide plus the seam; each item is 60×52px, and the selected sticker wraps the icon and the label. The footer tools keep icons only, because "Notifications" doesn't fit under an icon |

The product ships the icons-only rail, and raft-ui implements only that one ([Open questions](../../../../../design/decisions/open-questions.md#settled-by-the-product)). A labeled rail can't keep a square top-left corner (it is 68×56px), and the product pins that square with a UI test (`leftrail-square-slot`).

## States

- Selected: a sticker on the frame, white in light mode and yellow in dark mode ([States](../../../../../design/foundations/states.md)).
- Attention: one pink pixel at the top right of the icon. The selected item never shows it.
- Hover and press lay `fill-frame-pressed` over the item ([Color](../../../../../design/foundations/color.md#pressed-overlays)).

## Behavior

- Space every item, in the nav and in the footer, the same way: 40px items, 6px apart, 8px from both ends of the rail. Don't wrap the footer tools in fixed-height cells.
- Under the header, start the first item 10px below the header's seam.
- With the web top bar, the rail has no header and the server moves to the top bar, as the workspace button ([Page structure](../../../../../design/patterns/page-structure.md#the-web-top-bar)).
- In a window shorter than 600px, the rail shrinks with the headers ([Responsive layout](../../../../../design/patterns/responsive.md)), and its items keep 6px from both ends.

## Content

- Name every item, even in the icons-only rail. Names are Title Case ([Typography](../../../../../design/foundations/typography.md#casing)).

## Accessibility

- `AppRailNav` renders a `nav`. Name it with `aria-label="Primary"`.
- `AppRailItem` renders the Base UI Button; `selected` sets `aria-pressed`. For an item that navigates, render a link (`render={<a href="…" />}` with `nativeButton={false}`) and set `aria-current="page"` on the selected one: raft-ui sets neither on a link.
- `AppRailItemLabel` is visually hidden and names the item. Repeat the name in a [Tooltip](../tooltip/tooltip.md) on the right for pointer users.
- Say the attention dot in the item's name with `AppRailItemAttention`'s `title`: "Activity, new". The pixel itself is `aria-hidden`.
- Name the workspace tile after the server and what it does: "Raft HQ, switch server".

## Rules

- Make the workspace tile ink with the server's initial in yellow. It opens the server list next to the tile ([Built from existing parts](../../../../../design/components/overview.md#switching-servers)).
