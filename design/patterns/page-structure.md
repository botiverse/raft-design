---
title: Page structure
summary: The regions of a phone page and a desktop screen, how they are layered from the frame inward, and the rule of one line between regions.
---

# Page structure

Every Raft screen is built from the same regions. On a phone, a page is either a top-level page with the tab bar or a pushed page that covers it. On desktop, the web top bar runs across the top, and under it the regions run from left to right: rail, sidebar, main area, and a side panel when one is open. Color steps down from the outside in, and two regions are always separated by exactly one line.

## When it applies

Every screen of every Raft product. Which destinations a product has, and what each screen shows, is on the product's own page ([Raft Chat](../products/raft-chat/README.md)). How the regions change with width is in [Responsive layout](./responsive.md).

## Structure

### Phone

| Page | Top | Middle | Bottom |
| --- | --- | --- | --- |
| Top-level page: a destination on the tab bar | The yellow frame: the status bar, then a large title with the page's name ([0004](../decisions/0004-title-on-every-top-level-page.md)). The title may have one subtitle line, or one line saying who is working ([Working agents](../people-and-agents/working-agents.md#where-working-shows)). A page that shows the workspace pill or icon buttons has a 56px navigation row above the title | A list straight on paper, or inset groups | The tab bar ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) |
| Pushed page | A white top bar, 56px, with a seam under it (`PanelHeader`, [Panel](../../packages/ui/src/components/panel/panel.md)): Back, the title and an optional subtitle, and at most two icon buttons on the right | The content | The composer on pages that can send a message; nothing on other pages, because the page covers the tab bar |
| Overlay | — | A menu (press and hold, to act on one thing), a select list (to pick a value), a popover (a short list, such as Working now or the notifications), a dialog (to confirm), a bottom sheet (a short explanation, such as adding Raft to the Home Screen) | — |

- The product doesn't follow the large title yet ([0004](../decisions/0004-title-on-every-top-level-page.md)): every top-level page has one 56px navigation row on the frame (`PanelSectionHeader`). Tasks, Members and Settings put their name in it in `text-headline`, with an optional subtitle; Home puts the workspace pill there instead of a name. Whether to keep the large title is in [Open questions](../decisions/open-questions.md).
- Make the status bar and the browser's theme color follow the top: the frame on a top-level page, paper on a pushed page.

```example
app-shell/compositions/mobile-root
```

### Desktop

The web top bar, then from left to right:

1. The rail ([AppRail](../../packages/ui/src/components/app-rail/app-rail.md)): yellow, icons only.
2. The sidebar ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)): cream, resizable.
3. The main area: white, with a panel header and its content ([Panel](../../packages/ui/src/components/panel/panel.md)).
4. A side panel, when one is open.

The widths are in [Spacing](../foundations/spacing.md#layout-widths).

```example
app-shell/compositions/responsive
```

#### The web top bar

The web app adds a frame-colored top bar above the rail from 768px ([0032](../decisions/0032-web-top-bar.md)). The desktop app's title bar is the same bar, at every width.

- Make it 48px high, `layer-frame`, with a `line-seam` along its bottom edge. It keeps 48px in short windows.
- Put the workspace button and the workspace strip on the left, the search field in the center, and who is working and the bell on the right. Keep the search field centered on the window, whatever the two sides hold.
- Make every control in it a 36px frame item, 6px from the top and bottom and 8px from the sides, as on the rail. Align the workspace button with the rail's buttons.
- In the desktop app, put Back, Forward and History after the workspace strip, and the update chip before who is working.
- With the top bar, the rail has no header and the sidebar has no header: the rail's first destination and the sidebar's first row are 8px below the top bar's seam.

#### Headers

- Make every header under the top bar (the panel header, a side panel's header, a drawer's header) 56px high, so their bottom seams line up. Heights are in [Spacing](../foundations/spacing.md#heights).
- Without the top bar (an older desktop build, the public page of a workspace), the rail header and the sidebar header are 56px too, and the rail header is a square ([0005](../decisions/0005-56px-headers-and-rail.md)).

## Rules

### Layers, from the outside in

Yellow (the frame), then cream (the sidebar), then white (content), then white cards with a hairline, then popups (`layer-popover`, a seam edge, the soft shadow). In dark mode each layer is a lighter dark instead ([Dark mode](../foundations/dark-mode.md)).

### One line between two regions

- Draw exactly one line between two regions, never two side by side: two 1px lines next to each other read as one 2px line.
- Let the region drawn first own the line. The rail and the sidebar draw their right edges, so the conversation or Activity next to them draws no left edge. A side panel attached next to a conversation draws its own left edge.
- Use `line-seam` between regions and `line-hairline` inside content ([Color](../foundations/color.md#lines)).

### One edge per column

- Start the first element of a panel header, the first tab sticker, the message avatar column and the composer's outline on the same margin: 20px on desktop, 16px on a phone. In a message column and its composer, the phone keeps 20px.
- End the icon box of the last icon in every row on the same edge. How each element lands on the margin is in [Alignment](../foundations/alignment.md).

### Sidebar and side panel

- Let the sidebar follow the rail: it lists what the selected destination contains. A destination without a sidebar puts its content directly to the right of the rail.
- Use the side panel for things read together with the main area: a thread, a profile.
- Open task details as a centered dialog, not a side panel ([Tasks](./tasks.md)).
- Let a thread and a profile be open together: opening a profile from the thread shows the thread and the profile, and opening it from the conversation replaces the thread.
- Overlay the main area with a profile when the window is narrower than 1024px, or when the area it opens in is narrower than 680px. When a thread sits beside the conversation is in [Responsive layout](./responsive.md).

## Related

- [Navigation](./navigation.md): moving between these regions.
- [Responsive layout](./responsive.md): breakpoints.
- [AppShell](../../packages/ui/src/components/app-shell/app-shell.md): the component that lays out the regions.
