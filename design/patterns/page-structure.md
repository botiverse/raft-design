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
| Top-level page: a destination on the tab bar | The yellow frame: the status bar, then a large title with the page's name. The title may have one subtitle line, or one line saying who is working ([Working agents](../people-and-agents/working-agents.md#where-working-shows)). A page that shows the workspace pill or icon buttons has a 56px navigation row above the title | A list straight on paper, or inset groups | The tab bar ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) |
| Pushed page | A white top bar, 56px, with a seam under it (`PanelHeader`, [Panel](../../packages/ui/src/components/panel/panel.md)): Back, the title and an optional subtitle, and at most two icon buttons on the right | The content | The composer on pages that can send a message; nothing on other pages, because the page covers the tab bar |
| Overlay | — | A menu (press and hold or ⋯, to act on one thing), a select list (to pick one of up to 10 values), a popover (a short list, such as Working now or the notifications), a dialog (to confirm, or a small task), a bottom sheet (a little form, a choice among many values, a short explanation). Which one is in [Overlays on a phone](#overlays-on-a-phone) | — |

- Give every top-level page its large title, including the first one: the workspace pill says which server you are in, and the title says which page, at the same height on every tab. Raft Chat doesn't show the large title yet ([Raft Chat](../products/raft-chat/README.md#differences-from-the-shared-patterns)); whether to keep it is in [Open questions](../decisions/open-questions.md).
- Make the status bar and the browser's theme color follow the top: the frame on a top-level page, paper on a pushed page, so the page runs to the top edge of the screen.

```example
app-shell/compositions/mobile-root
```

#### Overlays on a phone

On a phone (the layout below 768px), an overlay anchored to a small trigger has little room around it, and the on-screen keyboard pushes it out of place. A bottom sheet rises from the bottom edge, within reach of the thumb, with the width of the screen for a field and its keyboard or for a long list. So on a phone a bottom sheet replaces a popover, a select list or a small dialog with fields where the content needs that room, and nowhere else. These rules hold on the web, iOS and Android alike; how a sheet looks and moves on each platform follows the platform.

| Need | On a phone |
| --- | --- |
| Act on one thing: a message, a row, a channel | The anchored menu, from press and hold or ⋯; a message's from press and hold ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md), [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)), however many items it has |
| A setting-style choice that applies at once (sort, status) | The same menu, with radio items |
| One of up to 10 values for a form | The select list, anchored to its field ([Select](../../packages/ui/src/components/select/select.md)) |
| One or a few of many values, usually with search: a server, people, labels | A bottom sheet with the list, its search row at the top ([Navigation](./navigation.md#servers)) |
| The little form a popover holds on desktop, with its own buttons: renaming, snoozing | A bottom sheet, with the buttons stacked full width at its bottom ([Drawer](../../packages/ui/src/components/drawer/drawer.md)) |
| A short list opened from a top bar: Working now, the notifications | A popover, as on desktop |
| A sentence or two and one button, such as adding Raft to the Home Screen | A bottom sheet |
| A small task of 2 or 3 fields (Create Channel) | A bottom sheet, with its fields at the top and its buttons stacked full width at the bottom. A small centered dialog would sit under the on-screen keyboard; iOS presents a create form as a sheet, and Material as a full-screen dialog ([Dialog](../../packages/ui/src/components/dialog/dialog.md)) |
| A confirmation | A dialog on the web and Android; the system confirmation sheet in the iOS app ([Feedback](./feedback.md#confirming)) |

- Never open the actions on one thing as a bottom sheet. Press and hold, right-click and ⋯ open one menu, so an action is in one place on every device ([States](../foundations/states.md#touch-screens)), and a menu opens where the finger already is.
- Confirm in the platform's own way. The iOS app uses the system confirmation sheet (SwiftUI `confirmationDialog`), the way iOS asks before an action. The web and Android confirm in a dialog, centered over a scrim, and never in a Raft bottom sheet: a decision people must make before they go on sits in the center. The question and its answers are the same words on every platform ([Writing](../content/writing.md#actions-and-their-dialogs)).
- Keep a choice that applies at once, and one of up to 10 values in a form, in its anchored menu or list: it opens next to what it changes, so people see both.
- From 768px, keep the anchored overlays, on a touch screen too: there is room beside the trigger.
- raft-ui's [ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md#on-a-phone) opens its bottom sheet itself. Popover, Select, Combobox and Dialog don't turn into a bottom sheet themselves: build the sheet with [Drawer](../../packages/ui/src/components/drawer/drawer.md).

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

- Make it 48px high, `layer-frame`, with a `line-seam` along its bottom edge. It keeps 48px in short windows.
- Put the workspace button and the workspace strip on the left, the search field in the center, and who is working and the bell on the right. Keep the search field centered on the window, whatever the two sides hold.
- Make every control in it a 36px frame item, 6px from the top and bottom and 8px from the sides, as on the rail. Align the workspace button with the rail's buttons.
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
