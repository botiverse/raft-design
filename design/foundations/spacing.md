---
title: Spacing and sizing
summary: The 4px spacing grid, hit targets, control and row heights, avatar sizes, header heights and layout widths.
redirectFrom: [decisions/0005-56px-headers-and-rail]
---

# Spacing and sizing

Raft spaces everything on a 4px grid and sizes everything people touch to at least 44px. Headers share one height across a screen, so the seams under them line up.

## Principles

- **Space on the 4px grid.** Use Tailwind's spacing scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px.
- **Touch targets are at least 44px.** A control that looks smaller is padded up to 44px by its hit area, not by its drawing.
- **Headers line up.** Every header on a screen has the same height, so the seam under each one runs as one line.
- **The same kind of thing is the same size across an app's tabs.** Size an element by what it is to the person using the app, not by the component that draws it ([The same kind, the same size](#the-same-kind-the-same-size)).

## Spacing

- Use the 4px steps for all spacing between and inside components.
- Inside small pieces (chips, the gap between a pixel and its word, tags) a half step of 2px is allowed: 6px and 10px.
- Inside a track that hugs its items, a segmented control or a toggle group, the items sit 3px from the track and 3px apart: the track's own inset, which the 4px grid doesn't divide.
- Inside a frame, siblings that can each show a fill (the buttons of a toolbar, the segments of a segmented control, the chips and buttons in a field) sit as far apart as they sit from the frame: 4px in a floating toolbar, 3px in a segmented control, 6px in a field. A different gap between them would be one more distance for the eye to compare ([Shape](./shape.md#inside-a-frame)).

## Timeline rhythm

A conversation is read top to bottom, so the space between its lines is what tells a reader where one turn ends and where a new part of the conversation begins. The timeline uses three distances and no others, each measured from text to text (the last line of one thing to the first line of the next), because that is the gap the eye compares:

| Step | Distance | Between |
| --- | --- | --- |
| Row | 8px | Two rows of one turn: a continuation row under the row it continues ([MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)). |
| Message (`timeline-gap-message`) | 16px | Two turns: a message and the next sender line, a message and an event line ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)), two event lines. |
| Section (`timeline-gap-section`) | 24px | A boundary: either side of a date line, measured to its rule; from the top of the list to its first line; from the last line to the composer's frame. |

- **One step per kind of break.** Within a turn is tighter than between turns, and a boundary is one step wider than both, so a date line reads as a new day and not as one more message. The steps sit on the 4px grid, each one 8px wider than the last.
- **A boundary is the same on both sides.** A date line sits 24px from the text above it and 24px from the sender line below it. When the space under a line was larger than the space over it, the line looked attached to the message above.
- **The last message never sits on the composer.** The composer is a heavy frame; at the message step it read as touching the last line. From the last line to the composer's frame is a section step, the same as from the top of the list to the first line.
- **Every row carries its own insets, and a boundary takes them back.** A row keeps the row inset (`timeline-row-inset`, 4px) above and below its text: the reach of its hover and selected highlight. The first row of a turn adds 8px above that, a transparent border the highlight doesn't paint, so every turn starts 12px above its text (`spacing-timeline-lead`). A date line subtracts the inset of the row above it and the lead of the row below it from its own padding, so a row never has to know what comes next, and the distances stay right whatever sits on either side.
- **The edge the messages scroll under fades.** Wherever content scrolls under an edge, the edge fades instead of cutting it ([Edges fade](#edges-fade)). The list's bottom edge, over the composer, fades from the panel's color to transparent over the section step, 24px, at all times (`MessageListEndFade`, [MessageList](../../packages/ui/src/components/message-list/message-list.md)): a message scrolled under it softens, and at the end of the list it lies over the empty end and shows nothing. The line of who is about to post sits on the same fade and has none of its own.
- **A line that floats over the end of the list doesn't move it.** The line of who is about to post adds its own height to the end of the list while it shows, so the last message stays whole above it ([Working agents](../people-and-agents/working-agents.md#who-is-about-to-post)); Back to bottom shows only while the end is out of view, so it never covers the last message.
- **Products don't write these numbers.** Components read the timeline tokens; a product that builds its own list top or end uses only `pt-timeline-start` above the first row (the section step less the lead every row brings, the history notice included) and `pb-timeline-end` (the section step less the last row's inset) under the last row. `timeline-turn` and `timeline-lead` are for the components; adding them up in a product is how the old gaps drifted.

```tokens
timeline
```

## Edges fade

Where content is cut, by a fold, by the edge of a strip that scrolls or by a column narrower than its content, its edge fades out instead of stopping on a hard line, so the cut reads as "there is more" and not as a clipped line. A fade has two lengths and no others:

| Length | Value | Utility | For |
| --- | --- | --- | --- |
| Content (`fade-content`) | 48px, about two lines | `mask-fade-b`, `mask-fade-t` | Content cut across its height: a long message or a forwarded bundle folded, a glimpse of hidden history |
| Edge (`fade-edge`) | 24px | `mask-fade-x`, `mask-fade-b-edge`, `mask-fade-t-edge` | The sides of a strip that scrolls sideways (tabs, a row of slots), a fold too short to give 48px to the fade, and a clipped column's end: the content of a column narrower than its content's minimum, under its head ([The channel's side columns](../patterns/responsive.md#the-channels-side-columns)) |

- **A fade is a mask, never a color gradient.** The utilities fade the content itself (`mask-image`), so whatever lies behind it, a row's hover or located fill, a card, a tint, shows through the fade unchanged. A gradient from the surface's color to transparent only matches one background, and bands over every other.
- **`mask-fade-x` fades only the side that hides something.** It reads `data-overflow` on the same element, `start`, `end` or `both`, and draws no mask without it, so a strip that fits has no fade. The component that scrolls sets the attribute (Tabs does).
- **Put the mask on the box that is cut.** `mask-fade-b` goes on the element with the fold's `max-height` and `overflow-clip`, not on a layer laid over it.
- One exception: the end of a message list fades with `MessageListEndFade`, a layer of the panel's color over the list's bottom edge ([Timeline rhythm](#timeline-rhythm)). It lies beside the scrolling list, on the panel's own color, under the jump controls, and a mask on the list's viewport would fade its scrollbar too.

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- The rows of a popup list are the one exception: an option of a Select, a Combobox or a ComboboxSelect, an item of a DropdownMenu or a ContextMenu, and a row of the server tab's popover on a phone ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#the-server-tab)) are 36px with one line on a touch screen and 34px with a mouse, the desktop row height ([Forms](../patterns/forms.md#option-height)). They touch each other edge to edge, so their hit area can't reach past the row to 44px. They stay 36px because:
  - Each row spans the whole width of the popup, so a tap a few pixels off still lands on a row.
  - A tap on the wrong row only moves the highlight or chooses the neighbor, which people see and can change. It never does anything that can't be put back: a menu item that deletes, stops or removes something opens a confirmation first ([Feedback](../patterns/feedback.md#confirming)). Keep such an item apart from the others, after a separator.
  - Rows of 36px (34px on a desktop) keep more of the list in view.
- Desktop controls used only with a pointer may be smaller. A desktop has one row height, 34px (`row-height`): sidebar rows 2px apart, their state shape as tall as the row ([Lists](../patterns/lists.md)), menu options and compact task and file rows. Rail items are 36px, the hover toolbar 36px high with 28px buttons ([Button](../../packages/ui/src/components/button/button.md#inside-a-floating-toolbar)), and an icon button in a bar 28px (`bar-button-size`: a head's actions and its ×, the composer's icons, a row's actions), the size of the header's icon tile, so a head's tile and buttons share one size and one centre line. Their hit area still reaches 44px.
- On a desktop, a default control is 32px, Feishu's PC default, read with a pointer from further away. A desktop here is a screen from 768px (where the desktop layout begins) whose main pointer is a mouse or a trackpad, `(width >= 48rem) and (pointer: fine)`: density follows the input, not the width. A tablet used by touch keeps the phone's 44px controls and 16px field text, which also keeps iOS and iPadOS from zooming into a field on focus; an iPad with a trackpad reports a fine pointer and gets the desktop sizes. A button at 32px still overhangs to a 44px hit area (`after:-inset-y-control-hit`, plus its 1.5px border, because an overhanging `::after` is measured from inside the border), because a laptop can have a touch screen too; a field doesn't, since it is wide and its height is the target.

## The same kind, the same size

Someone moving between an app's tabs compares what they see. Two lists that look like the same kind of thing but are sized differently read as a mistake, whatever each one's reason was. So within one app, elements of the same kind on the screens someone reaches from the tab bar or the rail are the same size: the same height, type size and icon size. Which kind an element is follows what it stands for, not where it appears or which component draws it ([Rows](../components/overview.md#rows)).

- In Raft Chat several phone lists are one kind, a list of places, drawn with one row ([Raft Chat](../products/raft-chat/README.md#lists-of-places)): change one and you change them all.
- The rule holds within one app, not across them. Another app with different interaction may size the same component differently: an app built around its settings can give a settings row more room than Raft Chat does. A size belongs to the app's context; a component's doc gives the size it has where the app uses it.
- So the heights below are what Raft Chat uses today. Before changing one, find every screen in the app that shows the same kind of element and change them together.
- Pin a shared size with a test that compares the screens, not with a fixed number.

## Heights

| Element | Height |
| --- | --- |
| Control, default (`control-height`): Input, InputGroup, Select, Combobox, Button at `lg` and `icon-lg`, a panel action | 44px on a phone and a touch screen, 32px on a desktop |
| Control, small: Button at `md` and `icon-md`, a filter trigger, a segment of a segmented control | 32px |
| Full-width call to action (`control-height-cta`, Button at `xl`) | 52px on a phone and a touch screen, 40px on a desktop |
| Phone list of places (Home, Members, the Settings list): the sidebar row | 44px |
| Row with an avatar and a preview: a conversation, a person, an agent ([ListRow](../../packages/ui/src/components/list-row/list-row.md)) | At least 64px |
| Settings row inside a settings page ([ListRow](../../packages/ui/src/components/list-row/list-row.md) `plain`) | 12px (`settings-row-inset`) above and below its tallest part: 46px with one line and a switch on a desktop, 54px on a phone |
| Radio row | At least 44px |
| Selection control: a switch; a checkbox and a radio | A switch is 50 × 30px on a phone and a touch screen and 38 × 22px on a desktop, macOS's regular switch (`switch-width`, `switch-height`); its strokes and the 1px of track around its knob are the same at both sizes. A checkbox and a radio are 20px everywhere. On its own, a checkbox's or radio's hit area is 44px tall on a touch screen; in a `<label>` row it reaches half the gap to the next option, and the label is the target. Centered on the label's first line; at the end of a settings row, on the whole row ([Alignment](./alignment.md#a-control-and-its-label)) |
| Option in a popup list, menu item (`option-height`) | 36px with one line on a touch screen, 34px with a mouse ([Hit targets](#hit-targets)); taller with more, at the same padding ([Forms](../patterns/forms.md#option-height)) |
| Header (`header-height`): the phone top bar row, panel header, sidebar header, rail header, drawer header, a dialog's bar, a side section's head (also when the section is folded to it), the Tasks filter row | The control height plus 6px above and below: 56px on a phone and a touch screen, 44px on a desktop, one line (a title and at most one item beside it) |
| Web top bar, desktop app title bar | 44px, the desktop header: 32px items (`frame-item-height`, the control height) with 6px above and below |

- Size a default control with the control tokens (`h-control`, `size-control`, `size-control-icon` for its icon), never with a breakpoint of its own: they switch once, in the token layer. A metric that follows the control and has no token, such as its padding or the margin that puts its glyph on an edge, switches on the same query, `md:pointer-fine:`, never on `md:` alone: `md:` would give a touch screen from 768px the desktop's 32px.

```tokens
control
```


- The rail has its own width (`rail-width`), not the header's: 49px with a 1px seam and 36px items on a desktop, 57px with 40px items on a touch screen. It shows icons only: a labeled rail needs 68px to fit names such as Computers. Under the top bar the rail has no head; without it, the rail header is as tall as every other header.
- When the desktop window is shorter than 600px (`@media (max-height: 600px)`), every header shrinks together, to 40px on a desktop (a 28px bar button with 6px above and below, `header-height-short`) and to 48px on a touch screen. The rail is already 49px wide with 36px items on a desktop; on a touch screen it shrinks to that size; see [Responsive layout](../patterns/responsive.md).

### The size chain

The sizes that follow the control are written as one chain in the token layer, so a change to one step moves every size built on it, and each step changes in one place:

- **Air** (`control-air`, 6px): between a label, its control and its help, and around a control in a bar.
- **Header** (`header-height`): the control height plus the header air (`header-air`) above and below. Every header reads it: a panel, sidebar, thread or rail head, a dialog's bar, a drawer's head, the Tasks filter row. In a window shorter than 600px, `header-height-short`.
- **Bar button** (`bar-button-size`, `bar-button-radius`): an icon button in a bar, a head's actions and its ×, the composer's icons. Its hit area reaches 44px whatever its size.
- **Frame item** (`frame-item-height`): the top bar's and the title bar's buttons, the workspace button and the search box.
- **Switch** (`switch-width`, `switch-height`): the track; the knob is the height less 8px and travels the width less the height.
- **Rows** (`row-height`, `option-height`): a sidebar row from 768px, and an option of a popup list or a menu item.
- **Forms** (`field-gap`, `section-gap`, `settings-row-inset`, `page-inset`): two airs between fields and around a settings row's tallest part, the gap between two form sections, the block inset of a drawer's body.
- **Rail** (`rail-width`, `rail-item`): the rail has its own size; it no longer follows the header.

A component reads these tokens and never writes the number.

```tokens
header
```

```tokens
bar-button
```

```tokens
switch
```

The chain switches at the root (`:root` and `.light`, under the desktop query). A subtree that sets its own `--control-height` changes that control only: the header, the bar buttons and the other steps were already worked out at the root, so they don't follow it.

## Avatar sizes

Avatars come in 19px, 27px, 35px, 51px and 99px: a multiple of 8 plus two 1.5px edges. See [Avatar](../../packages/ui/src/components/avatar/avatar.md).

## Layout widths

| Region | Width |
| --- | --- |
| Phone content margin | 16px on each side; 20px in a column of list cells ([Lists](../patterns/lists.md#one-edge)) |
| Desktop main area, panel header, sidebar header, drawer margin, settings page | 20px on each side, above and below as well (`page-inset`) |
| Rail | 48px plus a 1px seam on a desktop, 56px plus the seam on a touch screen; the labeled rail is 68px, plus a 1px seam |
| Sidebar (every page that has one: Chat, Members, Settings, a server's public page) | 240px, resizable from 200px to 400px |
| The Activity and Search results list, beside the item picked from it | 380px, resizable from 320px to 640px |
| Thread panel | 400px, resizable from 160px, its content kept at 360px and clipped under it. In a conversation's row it is one of the row's columns (below); elsewhere it grows until the conversation beside it is down to its 360px |
| Profile (a person, an agent, a computer) and task side panel | 400px, resizable from 160px, the content kept at 320px and clipped under it. In a conversation's row a profile is one of the row's columns (below); elsewhere it grows until the main area beside it is down to its 360px |
| An agent's file tree | 256px, resizable from 180px to 480px |
| Main area, between the columns | At least 360px; in a conversation's row, its content keeps 360px and the column goes down to 160px (below) |
| Comment margin beside a document | 280px, 24px from the document ([Comments](../patterns/comments.md#wide-and-narrow)) |
| The columns of a conversation's row (the conversation, the thread, Tasks, Files, the Artifact, a profile) | Every column down to 160px, resizable on every seam. Its content keeps its own minimum, clipped under it: the conversation and the thread 360px, Tasks and Files 280px, the Artifact 480px, a profile 320px; a stack the widest of its sections'. At first the thread 400px, Tasks over Files 360px, the Artifact 480px, a profile 400px, and the conversation what they leave, at least 400px, until a seam beside it is first dragged. Stacked sections share the column's height, each at least 160px. How they give way, fold and become tabs: [The channel's side columns](../patterns/responsive.md#the-channels-side-columns) |

How things land on these margins is in [Alignment](./alignment.md). Breakpoints are in [Responsive layout](../patterns/responsive.md).

### Resizing columns

On a desktop every column with a range above can be dragged on its seam, within that range; two stacked side sections are dragged on the seam between them. In a conversation's row every seam trades width between its two neighbours, and past 160px goes on taking from the next column further out (stdrc, 2026-11-03, #proj-raft-ui:#189; [The channel's side columns](../patterns/responsive.md#the-channels-side-columns)). The comment margin keeps its 280px, because the cards are laid out against it ([Resizable](../../packages/ui/src/components/resizable/resizable.md)). The ranges come from what each column holds: the sidebar's names, counts and marks start to crowd under 200px and gain nothing past 400px; a results row keeps two or three words of a thread's title at 320px and only shows more of a one-line preview past 640px.

A panel on the right of the main area (a thread, a profile or task side panel, a column of a conversation's row) has no width of its own at which it stops. What it holds, a conversation or a task, reads better the wider it is, and a fixed maximum (640px, 720px) stopped it at about half of a 1280px to 1440px window, though people wanted it to take three quarters while they worked in it (2026-10-23). In a conversation's row it grows until every column on its other side is down to 160px, their content clipped; the conversation is a column like the others there, so a drag takes it to 160px too (stdrc, 2026-11-03). Elsewhere it grows until the area left of it is down to that area's 360px minimum, the same minimum the main area keeps when the window narrows.

- Remember each width in each browser, not per server or account, except a channel's side sections: where each section stands and the width of each column without the Thread are kept for the person in each server, so they follow them to another browser. The thread's column keeps the thread panel's width, and the conversation's width, once a seam beside it has been dragged, is kept in each browser too. The sidebar is one width on every page that has one, so it doesn't jump when people move between Chat, Members and Settings. The profile panel and the task side panel share one width too.
- When the window is too narrow for the remembered widths of a conversation's row, the columns give way in the row's order: above their content's minimums first, then the thread folds over the conversation, then they clip down to 160px, then the rightmost become tabs ([The channel's side columns](../patterns/responsive.md#the-channels-side-columns)). Elsewhere, draw the columns narrower, starting with the rightmost, down to their minimums, and keep the main area at least 360px; a side panel that still doesn't fit covers the main area ([Responsive layout](../patterns/responsive.md)). The remembered widths don't change, so a wider window brings them back. The sidebar keeps its width for a conversation's row: it is not one of the row's columns, and collapsing or opening it changes the row's room as the window does. A sidebar that gave way would jump each time the thread opens or folds. Elsewhere, a column left of the main area narrows for a side panel only while that still puts the panel beside the main area; when it can't, the column keeps its width and the panel covers the main area.
- Draw a remembered width outside a column's range at the nearest end of the range; don't reset it, so a change to a range doesn't throw away a person's choice.

## Related

- [Page structure](../patterns/page-structure.md): how the regions are arranged.
- [Shape](./shape.md): radii and stroke widths.
- [Visual comfort](./comfort.md): how spacing, insets, lines and surfaces work together.
