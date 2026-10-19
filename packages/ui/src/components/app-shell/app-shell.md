---
title: AppShell
summary: The outermost layout of an app, with slots for the rail, the sidebar, the main area, a side panel and an overlay, that switches to a single column with the tab bar below 768px.
status: stable
aliases: [Shell, App frame, App layout]
layer: core
category: layout
related: [app-rail, sidebar, panel, mobile-nav, resizable]
---

# AppShell

AppShell places the regions of an app screen: on desktop the rail, the sidebar, the main area and a side panel from left to right; below 768px the main area alone, with the tab bar under it. Its slots own placement only. What each region looks like belongs to the component inside it. Which regions a screen has, and how they change with width, is in [Page structure](../../../../../design/patterns/page-structure.md) and [Responsive layout](../../../../../design/patterns/responsive.md).

```example
app-shell/compositions/responsive
```

## When to use

| Situation                                             | Use                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| The outer frame of an app screen                      | AppShell                                                                 |
| One bounded region with a header, a body and a footer | [Panel](../panel/panel.md), inside a slot                                |
| A split people can drag                               | [Resizable](../resizable/resizable.md), with the slots inside its panels |
| The destinations on desktop                           | [AppRail](../app-rail/app-rail.md), in `AppShellRailSlot`                |
| The destinations on a phone                           | [MobileNav](../mobile-nav/mobile-nav.md), after `AppShellMainSlot`       |

## Anatomy

- `AppShellRoot`: the frame, on `layer-canvas`. A row from 768px, a column below it. Required.
- `AppShellRailSlot`: an `aside` for the [AppRail](../app-rail/app-rail.md). Hidden below 768px.
- `AppShellSidebarSlot`: an `aside` for the [Sidebar](../sidebar/sidebar.md). Hidden below 768px.
- `AppShellMainSlot`: the `main` element, for the main area. The only slot shown on a phone. Required.
- `AppShellPanelSlot`: an `aside` for a side panel next to the main area. Hidden below 768px.
- `AppShellOverlaySlot`: covers the main area without changing the columns, for a side panel that overlays it. Put it inside an `AppShellMainSlot` with `overlay`.
- `AppShellSidebarTrigger`: the button that collapses and expands the sidebar. It is a `PanelAction` for the main area's panel header; render it as an `AppRailItem` to put it in the rail.

The slots are placement markers, not required direct children: a slot can sit inside a `ResizablePanel`.

## Variants

| Variant                                | Use for                                                        |
| -------------------------------------- | -------------------------------------------------------------- |
| Default                                | A sidebar that is always shown on desktop                      |
| `sidebarCollapsible` on `AppShellRoot` | A sidebar people can hide to give the main area the full width |

```example
app-shell/compositions/collapsible-sidebar
```

## Behavior

- Below 768px the rail, sidebar and panel slots are hidden. The main slot shows the page that is open, whether that is a list, a conversation or a thread; the app's routes decide which ([Responsive layout](../../../../../design/patterns/responsive.md)).
- Put `MobileNav` in the root after the main slot, shown only below 768px, so it sits at the bottom of the column.

```example
app-shell/compositions/mobile-root
```

- The root sets the header height for the regions inside it: 56px, and 48px in a window shorter than 600px ([Spacing](../../../../../design/foundations/spacing.md#heights)).
- The root clips what overflows it instead of scrolling, so moving focus never shifts the whole app sideways.
- On a phone the root pads its top for the status bar's safe area.
- Collapsing the sidebar slides the main area over it with `ease-slide` while the sidebar fades out; expanding reverses it. With reduced motion, both happen at once ([Motion](../../../../../design/foundations/motion.md#usage)).
- The shell measures the sidebar's width, so a collapsible sidebar can also be resizable.

## Accessibility

- The slots render landmarks: `main` for the main area and `aside` for the others. Name the navigation inside them: `aria-label` on the rail's `nav` and on `MobileNavRoot`.
- `AppShellSidebarTrigger` is a button with `aria-pressed`, labeled "Collapse sidebar" or "Expand sidebar" by the shell, with the same text as its tooltip. Pass only the icon, hidden from assistive technology. It renders nothing when the root isn't `sidebarCollapsible`, and it is hidden below 768px.
- A collapsed sidebar is `aria-hidden` and ignores the pointer.

## Rules

- Build every app screen on AppShell. Don't rebuild the frame from `div`s, because the slots carry the breakpoints, the landmarks and the header height.
- Don't put a background, a border, a width or a shadow on a slot. Put them on the component inside: a [Panel](../panel/panel.md) with `edge="attached"` draws the one line between it and the region before it ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).
- Give a screen one `AppShellMainSlot`.
- Set `overlay` on `AppShellMainSlot` only when an `AppShellOverlaySlot` is inside it.
