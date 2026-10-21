---
title: Page structure
summary: The regions of a phone page and a desktop screen, how they are layered from the frame inward, and the rule of one line between regions.
redirectFrom: [decisions/0004-title-on-every-top-level-page, decisions/0032-web-top-bar]
---

# Page structure

Every Raft screen is built from the same regions, so people who know one product know where things are in the next. On a phone, a page is either a top-level page with the tab bar or a pushed page that covers it. On desktop, the web top bar runs across the top, and under it the regions run from left to right: rail, sidebar, main area, and a side panel when one is open. Color steps down from the outside in, and two regions are always separated by exactly one line.

## When it applies

Every screen of every Raft product. Which destinations a product has, and what each screen shows, is on the product's own page ([Raft Chat](../products/raft-chat/README.md)). How the regions change with width is in [Responsive layout](./responsive.md).

## Structure

### Phone

| Page | Top | Middle | Bottom |
| --- | --- | --- | --- |
| Top-level page: a destination on the tab bar | The tab header, on the yellow frame: the status bar, then one 56px navigation row (`PanelSectionHeader`) with a seam under it. The page's name in `text-headline` from the 16px margin, and up to one subtitle line under it (counts in Space Mono), the two centered as a group in the row; at most one icon button at the end. A page with filters puts them in one row under it, on paper with a seam below | A list straight on paper, or inset groups | The tab bar ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) |
| Pushed page | The page header: a white top bar, 56px, with a seam under it (`PanelHeader`, [Panel](../../packages/ui/src/components/panel/panel.md)): Back (a 44px target), the title and an optional subtitle, and at most two icon buttons on the right for this page's actions | The content | The composer on pages that can send a message; nothing on other pages, because the page covers the tab bar |
| Overlay | — | A menu (press and hold, to act on one thing), a select list (to pick a value), a popover (a short list, such as Working now, the notifications or the server list), a dialog (to confirm), a bottom sheet (a short explanation, such as adding Raft to the Home Screen) | Unchanged: an overlay leaves the tab bar as it is |

- Make every phone page one of the two kinds; there is no third ([Navigation](./navigation.md#going-back)). A destination's first page is a top-level page. Everything opened from a page is a pushed page: a channel, a direct message, a thread, task details, a destination listed under More, a profile, a settings page, anything opened from search results, and a gate page in front of a feature.
- Give every top-level page the same top: the 56px navigation row, nothing above or below it but the filter row. No large title, and no icon tile before the name: the tab bar already shows the page's icon, selected, and on a phone the 53px a large title takes belongs to the content. Decided on 2026-10-21 (stdrc, artin); the mobile app and the phone web are the same.
- Draw the seam under the navigation row on every top-level page, with or without a filter row, so the tops of all top-level pages match.
- Pin the navigation row and the filter row together while the content scrolls under them. What the filter row holds is the page's choice.
- Let the color of the top say which kind of page it is: yellow (in dark mode, the frame's dark layer) on a top-level page, white (in dark mode, the page's background) on a pushed page. Yellow means the person is at the root of a tab; white means they have entered a page.
- Draw both tops with Raft's own parts, the same on phone web, iOS and Android, never with a platform's navigation bar ([Navigation](./navigation.md#what-each-platform-draws)). No large title is Raft's rule, whatever a platform's default is.
- On the first top-level page, the server switcher takes the name's place and the bell sits at the end. Put the bell and the working summary on no other top-level page.
- On the Search tab, the search field takes the name's place in the navigation row: 16px from each side, with a search icon at its start and a clear button at its end once there is text ([InputGroup](../../packages/ui/src/components/input-group/input-group.md)). Its filters go in the filter row, as on every page. How it behaves is in [Navigation](./navigation.md#search-on-a-phone).
- Before a pushed page's title, a channel may show its location tile and a direct message the other person's avatar. A page whose top is a search field shows none.
- Show the name and the subtitle as soon as the page opens; never hide them until the list scrolls.
- Make the page's name its one level-1 heading. On the first page and on Search, where the switcher or the field takes its place, give the page a visually hidden level-1 heading with its name.
- Make the status bar and the browser's theme color follow the top: the frame on a top-level page, paper on a pushed page, so the page runs to the top edge of the screen.

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

The web app adds a frame-colored top bar above the rail from 768px, with search in its center. It is part of the frame, not content, so it is yellow like the rail, and yellow still goes only on the frame. The desktop app's title bar is the same bar, at every width.

```example
app-shell/compositions/web-top-bar
```

- Make it 48px high, `layer-frame`, with a `line-seam` along its bottom edge. It keeps 48px in short windows.
- Put the workspace button and the workspace strip on the left, the search field in the center, and who is working and the bell on the right. Keep the search field centered on the window, whatever the two sides hold.
- Make every control in it a 36px frame item, 6px from the top and bottom. Align the workspace button with the rail's buttons, 8px from the left edge as on the rail. End the icon box of the last icon on the right, the bell's, 20px from the right edge, on the same line as the last icon of the header under it; its button hangs 8px past that line ([Alignment](../foundations/alignment.md#the-ends-of-a-header)).
- In the desktop app, put Back, Forward and History after the workspace strip, and the update chip before who is working. Leave room for the window's own buttons (the macOS traffic lights on the left, the Windows caption buttons on the right), and keep the search field centered on the window, not on what is left between them.
- With the top bar, the rail has no header and the sidebar has no header: the rail's first destination and the sidebar's first row are 8px below the top bar's seam.

#### Headers

- Make every header under the top bar (the panel header, a side panel's header, a drawer's header) 56px high, so their bottom seams line up across the screen. Heights are in [Spacing](../foundations/spacing.md#heights).
- Without the top bar (an older desktop build, the public page of a server), the rail header and the sidebar header are 56px too, and the rail header is a square ([Spacing](../foundations/spacing.md#heights)).

## Rules

### Layers, from the outside in

Yellow (the frame), then cream (the sidebar), then white (content), then white cards with a hairline, then popups (`layer-popover`, a seam edge, the soft shadow). The brand color stays on the outside, so the content people work in is the calmest part of the screen. In dark mode each layer is a lighter dark instead ([Dark mode](../foundations/dark-mode.md)).

### One line between two regions

- Draw exactly one line between two regions, never two side by side: two 1px lines next to each other read as one 2px line.
- Let the region drawn first own the line. The rail and the sidebar draw their right edges, so the conversation or Activity next to them draws no left edge. A side panel attached next to a conversation draws its own left edge.
- Use `line-seam` between regions and `line-hairline` inside content ([Color](../foundations/color.md#lines)).

### One edge per column

- Start the first element of a panel header, the first tab sticker, the message avatar column and the composer's outline on the same margin: 20px on desktop, 16px on a phone. In a message column and its composer, the phone keeps 20px.
- End the icon box of the last icon in every row on the same edge, so each column has one left edge and one right edge to read down. How each element lands on the margin is in [Alignment](../foundations/alignment.md).

### Sidebar and side panel

- Let the sidebar follow the rail: it lists what the selected destination contains. A destination without a sidebar puts its content directly to the right of the rail. Which destinations have a sidebar is on the product's page.
- Use the side panel for things read together with the main area: a thread, a profile.
- Task details are a centered dialog, not a side panel ([Tasks](./tasks.md)).
- Let a thread and a profile be open together: opening a profile from the thread shows the thread and the profile, and opening it from the conversation replaces the thread.
- When a profile or a thread sits beside the main area and when it covers it is in [Responsive layout](./responsive.md).

## Related

- [Navigation](./navigation.md): moving between these regions.
- [Responsive layout](./responsive.md): breakpoints.
- [AppShell](../../packages/ui/src/components/app-shell/app-shell.md): the component that lays out the regions.
