---
title: WebTopBar
summary: The frame's row across the top of the desktop layout, and the desktop app's title bar — a start lined up with the rail, a center on the window's center line, and an end on the column margin.
status: experimental
aliases: [Top bar, Title bar, Web header]
layer: core
category: layout
related: [app-rail, app-shell, workspace-button, search]
---

# WebTopBar

WebTopBar is the yellow row across the top of the desktop layout, above the rail: on the web from 768px, and as the desktop app's title bar at every width. It owns the bar's height, surface, seam and alignments; the product puts its controls in its three parts ([Page structure](../../../../../design/patterns/page-structure.md#the-web-top-bar)).

```example
web-top-bar/web-top-bar
```

## When to use

| Situation                                                                               | Use                                                  |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| The top of the desktop layout on the web, from 768px                                    | WebTopBar                                            |
| The desktop app's title bar, at every width                                             | WebTopBar                                            |
| The top of a pane: a conversation, a side panel, a drawer                               | [Panel](../panel/panel.md)'s `PanelHeader`           |
| The top of a top-level page on a phone                                                  | `PanelSectionHeader` ([Panel](../panel/panel.md))    |
| The desktop layout without the top bar (the apps' desktop mode, a server's public page) | The rail header ([AppRail](../app-rail/app-rail.md)) |

## Anatomy

- `WebTopBarRoot`: the bar. The frame item with the header air above and below (5px with a mouse, 6px on a touch screen), so the bar is 44px tall with a mouse (34 + 2 × 5) and 48px on a touch screen (36 + 2 × 6); `layer-frame` with a `line-seam` along its bottom edge, and the theme's decoration (`frame-decor-top`). It keeps its height in short windows. Holds the three parts below, in order, all three required.
- `WebTopBarStart`: the workspace button, then the workspace strip; in the desktop app, Back, Forward and History after them. It starts as far from the left edge as the rail's items (6px with a mouse, 8px on a touch screen), so the workspace button lines up with the rail's buttons under it.
- `WebTopBarCenter`: the search field (`SearchTrigger`, [Search](../search/search.md)), centered on the window.
- `WebTopBarEnd`: who is working, then the bell; before who is working, the update button: the desktop app's while an update downloads or is ready, the web app's when a new release is out ([The web top bar](../../../../../design/patterns/page-structure.md#the-web-top-bar)). Its last icon button's icon box ends on the column margin (16px with a mouse, 20px on a touch screen), and the button hangs past it by its icon inset ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).

## Behavior

- **Width.** WebTopBar renders at every width. The web app renders it only from 768px, where the desktop layout starts ([Responsive layout](../../../../../design/patterns/responsive.md)); the desktop app renders it at every width.
- **Centering.** The start and the end are two equal columns, so the center sits on the window's center line whatever each side holds and however differently the two ends are inset.
- **Narrow windows.** A side never shrinks below its content, so neither side and the center ever cover each other. When a side's content is wider than half of what the center leaves, the center moves toward the other side; when the two sides leave less than the center's width, the center narrows, down to 160px; past that, the bar overflows its container. At 768px, with `SearchTrigger` at its smallest (360px), each side has 204px, its inset included.
- **Frame insets.** Each end is padded by its frame inset as well (`--raft-frame-inset-start`, `--raft-frame-inset-end`): the window's own controls in the desktop app, such as the macOS traffic lights; 0 on the web. The center stays on the window's center line, not on what the window's controls leave ([Frame insets](../../../../../design/patterns/page-structure.md#frame-insets)).
- **Decoration.** A decorated theme draws its strip at the bar's right from 1024px. Set `--frame-decor-top-end` on the root to the end part's width plus 16px, and `--frame-decor-top: none` when the strip doesn't fit between the center and the end.

## Accessibility

- The bar has no role of its own. In the app, render it as the page's banner with `render={<header />}`; in a docs canvas or another page's region, leave it a `div`.
- Each control brings its own name: the workspace button names the server, the bell says "Notifications" ([WorkspaceButton](../workspace-button/workspace-button.md)).

## Rules

- Put product controls in the three parts only; put nothing directly in the root, because the root's three columns are the start, the center and the end.
- Don't size the parts or pad the bar from outside: the insets are what line the start up with the rail and the end up with the headers under it.
