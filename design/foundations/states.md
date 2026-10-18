---
title: States
summary: How hover, press, focus, selection, unread, disabled, error and busy look, shared by every component.
---

# States

Every component shows its interaction states the same way. A component doc only describes a state when it differs from this page.

## Principles

- **Hover and press add an overlay.** They never change the fill; see [Motion](./motion.md).
- **Selection has three meanings, and three looks.** Where you are in navigation is yellow, the item singled out in content is cyan, and a chosen value is ink.
- **Disabled looks the same everywhere** and doesn't react to hover or press.

## Usage

| State | Look |
| --- | --- |
| Hover, keyboard highlight | Menus, select lists and the quick reactions in a menu fill with `brand-soft`; so does the keyboard highlight in search results. Rows and buttons lay the pressed overlay over themselves on hover |
| Press | The pressed overlay: `fill-pressed`, `sticker-pressed` or `fill-frame-pressed` ([Color](./color.md#pressed-overlays)). A text button lights up its hit area when pressed |
| Focus | See [Focus](#focus) |
| Selected: navigation | A yellow sticker: sidebar rows, segmented controls, tabs, the tab bar's icon. On the yellow frame in light mode, the rail's selected item is a white sticker; in dark mode it is yellow |
| Selected: content | `info-soft`: the open item, the message someone jumped to, an active filter |
| Selected: value | Ink: a checked checkbox or radio. In a menu, the current value has a check mark and bold text |
| Unread | Bold text and a pink count. When someone mentions the person, a yellow @ marker replaces the count. On an icon, one pink pixel. The selected item never shows either |
| Disabled | `fill-muted` fill, `line-hairline` or `foreground-disabled` border, `foreground-disabled` text. The same for buttons, bordered icon buttons, inputs, selects, checkboxes, radios, switches, segmented controls and tabs. Frameless icon buttons and frameless buttons on the frame get no fill or border: only their icon and text turn `foreground-disabled`. List rows keep their fill: only their text and icons turn `foreground-disabled`. No reaction to hover or press |
| Display only | A row whose only interactive parts are its controls (a switch row in settings, this computer in the sidebar) is not a button: render it as a `<div>`, with no hover or press on the row, and focus only on its controls |
| Error | An input gets a `danger-strong` border and a line that says how to fix it. In a dialog, a banner. A problem with the whole workspace goes to the notification center; see [Feedback](../patterns/feedback.md) |
| Busy | A pixel spinner in the button, and a label that says what is happening |

## Focus

Focus uses `focus-ring` ([Elevation](./elevation.md#focus-ring)).

- Ring the whole group for compound controls: the composer, an input with a prefix or suffix, a multi-select field.
- Ring the box of a checkbox or radio. A hidden native input drives it.

## Related

- [Color](./color.md): the tokens named here.
- [Elevation](./elevation.md): the focus ring.
- [Feedback](../patterns/feedback.md): where errors go, by scope.
