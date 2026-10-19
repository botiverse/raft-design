---
title: MobileNav
summary: The phone tab bar — up to 5 destinations at the bottom of a top-level page, the selected one's icon in a yellow sticker.
status: stable
aliases: [TabBar, Tab bar, Bottom navigation]
layer: core
category: navigation
related: [app-rail, panel]
redirectFrom: [decisions/0003-tab-bar-icon-sticker]
---

# MobileNav

MobileNav is the phone's tab bar: a row of a product's destinations at the bottom of every top-level page. The selected destination's icon sits in a yellow sticker. Pushed pages cover it.

```example
mobile-nav/mobile-nav
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

- `MobileNavRoot`: the bar, on `layer-card`, with a `line-seam` along its top edge and padding for the bottom safe area.
- `MobileNavItem`: one destination: a 22px icon, then its label.
- `MobileNavLabel`: the label, in `text-label`. It truncates.

## States

| State                 | Look                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Not selected          | Icon and label in `foreground-hint`                                                                                             |
| Selected (`selected`) | The icon in a 56×30px yellow sticker; the label in `foreground`, bold                                                           |
| Attention             | One pink pixel at the top right of the icon ([States](../../../../../design/foundations/states.md)). Never on the selected item |

The sticker wraps only the icon, not the whole item. Turning the whole item yellow would add another strip of frame at the bottom of the screen; a yellow item adds another strip of frame at the bottom of the screen, and wrapping only the icon halves the color while the selection still reads at a glance ([Navigation](../../../../../design/patterns/navigation.md#where-you-are)).

## Content

- Label every item, in Title Case ([Typography](../../../../../design/foundations/typography.md#casing)).
- Which items can show an attention dot is the product's choice. Say other news inside the page instead.

## Accessibility

- `MobileNavRoot` renders a `nav`. Name it with `aria-label="Primary"`.
- `MobileNavItem` renders the Base UI Button; `selected` sets `aria-pressed`. For an item that navigates, render a link (`render={<a href="…" />}` with `nativeButton={false}`) and set `aria-current="page"` on the selected one: raft-ui sets neither on a link.
- The visible label names the item. When an item shows an attention dot, give it an `aria-label` that says both: "Settings, new replies to your feedback". The dot itself is `aria-hidden`.
