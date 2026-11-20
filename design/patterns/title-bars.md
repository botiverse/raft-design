---
title: Title bars
summary: What a desktop window's title bar is for, what goes in it and what stays out, for each kind of Raft window, and how it differs on macOS, Windows and Linux.
---

# Title bars

A title bar is the window's, not the content's. It says which window this is, lets the person move it, holds the window's own buttons, and offers the few commands that act on the whole window. Everything that acts on what the window shows (a document, a conversation, a list) belongs to that content's own header or toolbar, below the title bar. When content controls are moved up into the title bar, two sets of sizes and rules end up in one row beside the system's buttons, and the bar reads as two things stuck together (xxchan, 2026-11-20, #proj-workspace:c3673fa1).

This is the rule every platform and every well-made desktop app follows in its own way. The [references](#references) at the end show how.

## When it applies

- Every window of Raft's desktop apps: the main window, an object opened in its own window (an Artifact, from "Open in new window"), and a layer that covers the whole window (a file or image preview, the share preview, a diagram in full screen).
- Not the web app in a browser tab: there the browser draws the title bar. The web app's top bar is the same bar as the main window's title bar ([Page structure](./page-structure.md#the-web-top-bar)), so the rules for its contents below hold for it too.

## What a title bar is for

A title bar has four jobs, in this order:

1. **Say which window this is.** What it shows and, in Raft, which server it belongs to. The title names the content, never the app ("QA long page", not "Raft").
2. **Move the window.** Leave empty space to drag in every width. Drag, double-click to maximize and right-click for the system menu all work on that space.
3. **Hold the window's own buttons.** The system's: the traffic lights on macOS, the caption buttons on Windows and Linux. They are never covered, moved or redrawn.
4. **Offer a few commands that act on the whole window.** Moving between places (Back, Forward), finding something anywhere (search), switching what the window shows (the workspace), or rearranging the window (show or hide a side column). At most a handful, so the drag space and the title survive.

Anything else is content: it acts on the thing in the window, so it goes in that thing's header or toolbar.

| In the title bar | Not in the title bar |
| --- | --- |
| The object's or workspace's name, its icon, which server it belongs to | A version picker, a status, a count |
| Back, Forward, History | Comment mode, edit, format |
| Search across the server | Search inside this document |
| Show or hide a side column of this window | Share, copy link, download this object |
| The update button, who is working, the bell | The object's own ⋯ menu |
| The system's window buttons | Look-alike window buttons |

## Rules

- Make the title bar one row of the frame, on the frame's surface (`layer-frame`, the server's theme), with a `line-seam` under it. Its contents are frame items (`variant="on-frame"`, [Button](../../packages/ui/src/components/button/button.md)).
- Put the content's own header or toolbar right under the title bar, on the canvas, never inside it. The two never merge into one row.
- Keep the system's buttons native and give them the title bar's color and height; nothing is drawn, positioned or opened into their corner (`--raft-frame-inset-start`, `--raft-frame-inset-end`, `--raft-frame-inset-top`, [Page structure](./page-structure.md#the-web-top-bar)).
- Always leave drag space. Mark the bar draggable and every control in it not draggable. When the window narrows, the title is cut with an ellipsis before any window-level command folds into a menu, and the system's buttons never fold.
- Keep the system's behaviors: double-click maximizes (or zooms, on macOS), right-click opens the system menu on Windows and Linux, and the bar dims when the window is not the active one.
- Don't repeat in the title bar what the window's buttons do: no Close or Expand of the content beside the system's close.

## Raft's windows

### The main window

The title bar is the web top bar: the workspace button and the workspace strip, Back, Forward and History, search in the center, then the update button, who is working and the bell ([Raft Chat](../products/raft-chat/README.md#the-desktop-app)). Every item there acts on the whole window, so it already follows these rules. The panels under it (the conversation, a thread, a side panel) keep their own headers.

### An object in its own window

An object opened in its own window (an Artifact) is a window of the same server, so it has the same two layers as the main window: a title bar on the frame, and the object's header below it on the canvas.

- **Title bar**, 36px, on `layer-frame` in the server's theme, draggable: the object's icon tile (`IconTile` `sm`) and its title, then the system's buttons. Nothing else. The theme's frame color is how the window says which server it belongs to, as the main window's frame does.
- **The object's toolbar**, the header height (`header-height`), on the canvas: what the panel header holds in the main window (the version, comment mode, search in the document, share, ⋯, and the comments column's toggle), at the panel header's sizes ([Panel](../../packages/ui/src/components/panel/panel.md#rules)). It has no Close and no Expand: the window's own buttons do that.
- A region inside the window keeps its own head: the comment margin keeps its sort and Hide comments ([Comments](./comments.md)).

The window loses 36px of height to the title bar. That is the price of keeping the window's controls and the object's controls apart; folding them back into one row is what made the bar look split.

### A layer that covers the whole window

A file or image preview, the share preview, a diagram in full screen: the layer's own header becomes the title bar while it is open. It names what is shown and holds Close and at most two actions on it; its empty space drags the window, and it keeps clear of the system's buttons. A layer narrower than the window, such as a side panel or a dialog, starts below the title bar instead ([Raft Chat](../products/raft-chat/README.md#the-desktop-app)).

## Platforms

| | macOS | Windows | Linux |
| --- | --- | --- | --- |
| Window buttons | Traffic lights at the start, 14px, drawn by the system | Caption buttons at the end, drawn by the system (`titleBarOverlay`) | Caption buttons at the end, drawn by Electron after GTK (round, tinted from the bar's color) |
| Room to keep | 82px at the start, gone in full screen | The caption buttons' width at the end | The caption buttons' width at the end |
| Smallest title bar | About 28px (the traffic lights fit) | About 32px (shorter squashes the buttons; Raft allows 24px at least) | About 32px |
| Window buttons' color | Their own | Set from the bar's background and `foreground-on-frame` | Set from the bar's background and `foreground-on-frame` |

The traffic lights center on the title bar's row: their y follows the bar's height (15 at 44px, 13 at 40px, 11 at 36px).

## References

Read 2026-11-20. Every source agrees on the four jobs above; they differ in how many window-level commands they allow.

- **macOS (Apple HIG, Windows and Toolbars).** The frame holds the window controls and a toolbar that sits under or merges with the title bar. The title names the content, never the app, and stays short. Every toolbar command is also in the menu bar.
- **Windows 11 (Fluent, Title bar).** Icon, title and caption buttons; optional Back at the start, a centered search and the account at the end, which take the bar from 32px to 48px. All empty space drags. The icon and the caption buttons are always fully visible; controls in the bar are declared as pass-through regions.
- **GNOME (HIG, Header bars).** Main actions at the start, the window's heading or a view switcher in the center, menus at the end; not many controls; always some empty space to drag.
- **VS Code (custom title bar).** The menu, the Command Center (Back, Forward, a centered search) and the layout toggles. The editor's tabs, its actions and the status bar stay out; right-clicking the bar chooses which of its items show.
- **Chrome app windows (Window Controls Overlay).** The title bar shrinks to the system's buttons and the app draws the rest; the app must mark its drag regions and keep its content from looking like the browser's own text.
- **Arc's Little Arc.** A small window for one quick look: one slim bar with the page's domain and "Open in", and none of the main window's sidebar or tabs. Keeping or working on the page means moving it to the main window.

## Related

- [Page structure › The web top bar](./page-structure.md#the-web-top-bar): the main window's bar and the frame insets.
- [Raft Chat › The desktop app](../products/raft-chat/README.md#the-desktop-app): what Raft Chat puts in it.
- [Panel](../../packages/ui/src/components/panel/panel.md): the headers under the title bar.
- [Comments](./comments.md): the comment margin's head.
