---
title: Page structure
summary: The regions of a phone page and a desktop screen, how they are layered from the frame inward, and the rule of one line between regions.
---

# Page structure

Every Raft screen is built from the same regions. On a phone, a page is either a top-level page with the tab bar or a pushed page that covers it. On desktop, regions run from left to right: rail, sidebar, main area, and a side panel when one is open. Color steps down from the outside in, and two regions are always separated by exactly one line.

## When it applies

Every screen of every Raft product. Which destinations a product has, and what each screen shows, is on the product's own page ([Raft Chat](../products/raft-chat/README.md)). How the regions change with width is in [Responsive layout](./responsive.md).

## Structure

### Phone

| Page | Top | Middle | Bottom |
| --- | --- | --- | --- |
| Top-level page: a destination on the tab bar | The yellow frame: the status bar, then a large title with the page's name. The title may have one subtitle line, or one line saying who is working ([Agents](./agents.md#where-working-agents-appear)). A page that shows the workspace pill or icon buttons has a 56px navigation row above the title; a page that shows neither has no such row, and the title follows the status bar directly | A list straight on paper, or inset groups | The tab bar ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) |
| Pushed page | A top bar: Back, the title, and at most one or two icon buttons on the right. Whether it is white or yellow is [still open](../decisions/open-questions.md) | The content | The composer on pages that can send a message; nothing on other pages, because the page covers the tab bar |
| Overlay | — | A menu (press and hold, to act on one thing), a select list (to pick a value), a dialog (to confirm), a bottom sheet (to pick a place, such as a workspace or Working now, or to show a short explanation) | — |

```example
app-shell/compositions/mobile-root
```

### Desktop

From left to right:

1. The rail ([AppRail](../../packages/ui/src/components/app-rail/app-rail.md)): yellow, icons only or icons with labels.
2. The sidebar ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)): cream, resizable.
3. The main area: white, with a panel header and its content ([Panel](../../packages/ui/src/components/panel/panel.md)).
4. A side panel, when one is open.

The widths are in [Spacing](../foundations/spacing.md#layout-widths).

```example
app-shell/compositions/responsive
```

#### The web top bar

The web app adds a frame-colored top bar above all of this. The desktop app's title bar is the same bar.

- Make it 48px high, `layer-frame`, with a `line-seam` along its bottom edge.
- Put the workspace on the left, the search field in the center, and who is working and the bell on the right.
- Make every control in it a 36px frame item, 6px from the top and bottom and 8px from the sides, as on the rail. Align the workspace button with the rail's buttons.
- With the top bar, the rail has no header: its first destination is 8px below the top bar's seam.

#### Headers

- Make the rail header, the sidebar header and the panel header the same height, so their bottom seams line up. Heights are in [Spacing](../foundations/spacing.md#heights).

## Rules

### Layers, from the outside in

Yellow (the frame), then cream (the sidebar), then white (content), then white cards with a hairline, then popups (`layer-popover`, a seam edge, the soft shadow). In dark mode each layer is a lighter dark instead ([Dark mode](../foundations/dark-mode.md)).

### One line between two regions

- Draw exactly one line between two regions, never two side by side: two 1px lines next to each other read as one 2px line.
- Let the region drawn first own the line. The rail and the sidebar draw their right edges, so the conversation or Activity next to them draws no left edge. A side panel attached next to a conversation draws its own left edge.
- Use `line-seam` between regions and `line-hairline` inside content ([Color](../foundations/color.md#lines)).

### One edge per column

- Start the first element of a panel header, the first tab sticker, the message avatar column and the input's outline on the same margin: 20px on desktop, 16px on a phone. In a message column and its input, the phone keeps 20px.
- End the icon box of the last icon in every row on the same edge. How each element lands on the margin is in [Alignment](../foundations/alignment.md).

### Sidebar and side panel

- Let the sidebar follow the rail: it lists what the selected destination contains. A destination without a sidebar puts its content directly to the right of the rail.
- Use the side panel for things read together with the main area: a thread, a task, files, a profile.
- Show one side panel at a time. Opening a new one replaces the old one.
- Overlay the main area with the side panel when the window is narrower than 1024px, or when the main area would be narrower than 320px beside it ([Responsive layout](./responsive.md)).

## Related

- [Navigation](./navigation.md): moving between these regions.
- [Responsive layout](./responsive.md): breakpoints.
- [AppShell](../../packages/ui/src/components/app-shell/app-shell.md): the component that lays out the regions.
