---
title: MobileNav
summary: The phone tab bar — up to 5 destinations along the bottom edge, or a floating pill of up to 4 tabs with a round Search button beside it; the selected tab's icon in a yellow sticker.
status: stable
aliases: [TabBar, Tab bar, Bottom navigation, Floating tab bar, Tab pill]
layer: core
category: navigation
related: [app-rail, panel]
redirectFrom: [decisions/0003-tab-bar-icon-sticker]
---

# MobileNav

MobileNav is the phone's tab bar: a row of a product's destinations at the bottom of every top-level page. The selected destination's icon sits in a yellow sticker. Pushed pages cover it. It comes in two variants: the edge bar along the bottom of the screen, and the floating pill with a round Search button beside it, which Raft Chat uses in its mobile app and on the phone web.

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

| Variant       | Use when                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------- |
| Floating pill | The product has at most 4 destinations and a search across all of them. Raft Chat uses it |
| Edge bar      | The product has 5 destinations, or no search of its own                                   |

How the tab bar works with Back and pushed pages, and how many destinations it holds, is in [Navigation](../../../../../design/patterns/navigation.md). Nothing is attached above the tab bar; where working agents appear instead is in [Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows). Which destinations a product has is on its own page ([Raft Chat](../../../../../design/products/raft-chat/README.md)).

## Anatomy

- `MobileNavRoot`: the bar, on `layer-card`, with a `line-seam` along its top edge and padding for the bottom safe area.
- `MobileNavItem`: one destination: a 22px icon, then its label.
- `MobileNavLabel`: the label, in `text-label`. It truncates.

## The floating pill

The floating pill is a row of 2 parts that float above the bottom of the page, from left to right:

- **The pill**: the tabs, at most 4, in one 56px capsule with a full radius, on `layer-card` with a `line-seam` outline and `shadow-float` ([Elevation](../../../../../design/foundations/elevation.md)). Each tab is a `MobileNavItem` with its icon and label, as in the edge bar, with a hit area at least 44px wide and 44px high.
- **The Search button**: a round 56px button, as high as the pill and on the same surface, outline and shadow, holding the `search` icon at 22px. It has no label.

The full radius is a scoped exception to [Shape](../../../../../design/foundations/shape.md#radii): only this pill and its Search button are round.

raft-ui doesn't draw the floating pill yet; until it does, apps build it from these rules and `MobileNavItem`. It will ship as 2 parts of their own, `MobileNavPill` and `MobileNavSearch`, inside `MobileNavRoot`, not as a `variant` prop: the two variants differ in structure, and a prop that swaps structure hides which parts are rendered.

> **Placeholder: no screenshot yet.** This page has no rendered image of the floating pill until raft-ui implements it. For how it looks today, see the phone web implementation in [botiverse/slock #10502](https://github.com/botiverse/slock/pull/10502).

### Tabs and Search

- Put at most 4 tabs in the pill, plus the Search button: 5 targets is what a phone's width holds at a 44px minimum each, and Search takes the fifth.
- Make the last tab More when a product has more destinations than fit. More's top-level page is a list of the other destinations; each row opens a pushed page under More, with Back to the list. A link to one of those pages opens it under More, with More selected.
- Treat Search as an action, not a tab: it opens search over the current tab, the selected tab stays selected, and Back closes search and returns to where the person was. Search is never selected and never shows an attention dot.
- Keep Search outside the pill, so a destination and an action never look alike.

### Placement

- Float the row above the bottom safe area: 8px above the screen's bottom edge, or the safe-area inset when it is larger, and on the 16px phone content margin ([Spacing](../../../../../design/foundations/spacing.md)).
- Leave 8px between the pill and the Search button. The pill takes the rest of the width.
- Give the page's scrolling content bottom padding of the row's height plus its gap, so the last row can scroll clear of the pill.
- Hide the row while the on-screen keyboard is open. Pinned above the keyboard, it would cover the field being typed in and the composer.
- Show the row only on top-level pages, as with the edge bar. Search and pushed pages cover it.

## States

| State                 | Look                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Not selected          | Icon and label in `foreground-hint`                                                                                                             |
| Selected (`selected`) | The icon in a 56×30px yellow sticker; the label in `foreground`, bold                                                                           |
| Attention             | One pink pixel at the top right of the icon ([States](../../../../../design/foundations/states.md)), never a number. Never on the selected item |

The sticker wraps only the icon, not the whole item: a yellow item adds another strip of frame at the bottom of the screen, and wrapping only the icon halves the color while the selection still reads at a glance ([Navigation](../../../../../design/patterns/navigation.md#where-you-are)).

## Content

- Label every item, in Title Case ([Typography](../../../../../design/foundations/typography.md#casing)).
- Which items can show an attention dot is the product's choice. Say other news inside the page instead.
- Show a dot, never a count, on the tab bar: the count belongs inside the page, next to what it counts.
- Under More, show the same dot on the row that caused More's dot, so people can find what is new.

## Accessibility

- `MobileNavRoot` renders a `nav`. Name it with `aria-label="Primary"`.
- `MobileNavItem` renders the Base UI Button; `selected` sets `aria-pressed`. For an item that navigates, render a link (`render={<a href="…" />}` with `nativeButton={false}`) and set `aria-current="page"` on the selected one: raft-ui sets neither on a link.
- In the floating pill, put the pill and the Search button inside the same `nav`. Name the Search button with `aria-label="Search"`, and don't give it `aria-pressed` or `aria-current`: it is an action, not a destination.
- The visible label names the item. When an item shows an attention dot, give it an `aria-label` that says both: "More, new reply to your feedback". The dot itself is `aria-hidden`.
