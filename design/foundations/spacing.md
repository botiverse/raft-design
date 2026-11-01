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
- **A line that floats over the end of the list doesn't move it.** The line of who is about to post adds its own height to the end of the list while it shows, so the last message stays whole above it ([Working agents](../people-and-agents/working-agents.md#who-is-about-to-post)); Back to Bottom shows only while the end is out of view, so it never covers the last message.
- **Products don't write these numbers.** Components read the timeline tokens; a product that builds its own list top or end uses only `pt-timeline-start` above the first row (the section step less the lead every row brings, the history notice included) and `pb-timeline-end` (the section step less the last row's inset) under the last row. `timeline-turn` and `timeline-lead` are for the components; adding them up in a product is how the old gaps drifted.

```tokens
timeline
```

## Edges fade

Where content is cut, by a fold or by the edge of a strip that scrolls, its edge fades out instead of stopping on a hard line, so the cut reads as "there is more" and not as a clipped line. A fade has two lengths and no others:

| Length | Value | Utility | For |
| --- | --- | --- | --- |
| Content (`fade-content`) | 48px, about two lines | `mask-fade-b`, `mask-fade-t` | Content cut across its height: a long message or a forwarded bundle folded, a glimpse of hidden history |
| Edge (`fade-edge`) | 24px | `mask-fade-x`, `mask-fade-b-edge`, `mask-fade-t-edge` | The sides of a strip that scrolls sideways (tabs, a row of slots), and a fold too short to give 48px to the fade |

- **A fade is a mask, never a color gradient.** The utilities fade the content itself (`mask-image`), so whatever lies behind it, a row's hover or located fill, a card, a tint, shows through the fade unchanged. A gradient from the surface's color to transparent only matches one background, and bands over every other.
- **`mask-fade-x` fades only the side that hides something.** It reads `data-overflow` on the same element, `start`, `end` or `both`, and draws no mask without it, so a strip that fits has no fade. The component that scrolls sets the attribute (Tabs does).
- **Put the mask on the box that is cut.** `mask-fade-b` goes on the element with the fold's `max-height` and `overflow-clip`, not on a layer laid over it.
- One exception: the end of a message list fades with `MessageListEndFade`, a layer of the panel's color over the list's bottom edge ([Timeline rhythm](#timeline-rhythm)). It lies beside the scrolling list, on the panel's own color, under the jump controls, and a mask on the list's viewport would fade its scrollbar too.

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- The rows of a popup list are the one exception: an option of a Select, a Combobox or a ComboboxSelect, an item of a DropdownMenu or a ContextMenu, and a row of the server tab's popover on a phone ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#the-server-tab)) are 36px with one line, on a touch screen as well as with a mouse ([Forms](../patterns/forms.md#option-height)). They touch each other edge to edge, so their hit area can't reach past the row to 44px. They stay 36px because:
  - Each row spans the whole width of the popup, so a tap a few pixels off still lands on a row.
  - A tap on the wrong row only moves the highlight or chooses the neighbor, which people see and can change. It never does anything that can't be put back: a menu item that deletes, stops or removes something opens a confirmation first ([Feedback](../patterns/feedback.md#confirming)). Keep such an item apart from the others, after a separator.
  - 36px rows keep more of the list in view.
- Desktop controls used only with a pointer may be smaller: sidebar rows 38px (2px apart, their state shape as tall as the row, [Lists](../patterns/lists.md)), rail items 40px, the hover toolbar 36px high with 28px buttons ([Button](../../packages/ui/src/components/button/button.md#inside-a-floating-toolbar)).
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
| Settings row inside a settings page ([ListRow](../../packages/ui/src/components/list-row/list-row.md) `plain`) | 48px with one line |
| Radio row | At least 44px |
| Selection control: a switch; a checkbox and a radio | 50 × 30px; 20px. The same on a phone and a desktop. On its own, a checkbox's or radio's hit area is 44px tall on a touch screen; in a `<label>` row it reaches half the gap to the next option, and the label is the target. Centered on the label's first line; at the end of a settings row, on the whole row ([Alignment](./alignment.md#a-control-and-its-label)) |
| Option in a popup list, menu item | 36px with one line, with a mouse and on a touch screen ([Hit targets](#hit-targets)); taller with more, at the same padding ([Forms](../patterns/forms.md#option-height)) |
| Phone top bar row, panel header, sidebar header, rail header, drawer header, a side section's head (also when the section is folded to it) | 56px |
| Web top bar, desktop app title bar | 48px |

- Size a default control with the control tokens (`h-control`, `size-control`, `size-control-icon` for its icon), never with a breakpoint of its own: they switch once, in the token layer. A metric that follows the control and has no token, such as its padding or the margin that puts its glyph on an edge, switches on the same query, `md:pointer-fine:`, never on `md:` alone: `md:` would give a touch screen from 768px the desktop's 32px.

```tokens
control
```

- Make the rail header a 56px square. It holds the workspace tile, and the top-left corner stays square whatever else changes. So the rail is 56px wide plus its seam and shows icons only: a labeled rail needs 68px to fit names such as Computers, and its corner would no longer be square.
- When the desktop window is shorter than 600px (`@media (max-height: 600px)`), shrink every 56px header to 48px together. The rail shrinks with them, its header stays square, and rail items shrink from 40px to 36px; see [Responsive layout](../patterns/responsive.md).

## Avatar sizes

Avatars come in 19px, 27px, 35px, 51px and 99px: a multiple of 8 plus two 1.5px edges. See [Avatar](../../packages/ui/src/components/avatar/avatar.md).

## Layout widths

| Region | Width |
| --- | --- |
| Phone content margin | 16px on each side; 20px in a column of list cells ([Lists](../patterns/lists.md#one-edge)) |
| Desktop main area, panel header, sidebar header, drawer margin | 20px on each side |
| Rail | 56px, plus a 1px seam; the labeled rail is 68px, plus a 1px seam |
| Sidebar (every page that has one: Chat, Members, Settings, a server's public page) | 240px, resizable from 200px to 400px |
| The Activity and Search results list, beside the item picked from it | 380px, resizable from 320px to 640px |
| Thread panel | 400px, resizable from 360px until the conversation beside it is down to its 360px |
| Profile (a person, an agent, a computer) and task side panel | 400px, resizable from 320px until the main area beside it is down to its 360px |
| An agent's file tree | 256px, resizable from 180px to 480px |
| Main area, between the columns | At least 360px |
| Comment margin beside a document | 280px, 24px from the document ([Comments](../patterns/comments.md#wide-and-narrow)) |
| A channel's side columns (Tasks, Files, and the Thread where it shares their row) | A column without the Thread: 360px, resizable from 280px; with the Thread in it, the thread panel's 400px and 360px. Each grows until the conversation is down to its 360px. Stacked sections share the column's height, each at least 160px. How they give way, cover and float: [The channel's side columns](../patterns/responsive.md#the-channels-side-columns) |

How things land on these margins is in [Alignment](./alignment.md). Breakpoints are in [Responsive layout](../patterns/responsive.md).

### Resizing columns

On a desktop every column with a range above can be dragged on its seam, within that range, the channel's side columns included; two stacked side sections are dragged on the seam between them. The comment margin keeps its 280px, because the cards are laid out against it ([Resizable](../../packages/ui/src/components/resizable/resizable.md)). The ranges come from what each column holds: the sidebar's names, counts and marks start to crowd under 200px and gain nothing past 400px; a results row keeps two or three words of a thread's title at 320px and only shows more of a one-line preview past 640px.

A panel on the right of the main area (a thread, a profile or task side panel, a channel's side column) has no width of its own at which it stops: it grows until the area left of it is down to that area's 360px minimum. What it holds, a conversation or a task, reads better the wider it is, and a fixed maximum (640px, 720px) stopped it at about half of a 1280px to 1440px window, though people wanted it to take three quarters while they worked in it (2026-10-23). The 360px it leaves is the same minimum the main area keeps when the window narrows, so a drag never takes the conversation below the width at which it still works.

- Remember each width in each browser, not per server or account, except a channel's side sections: where each section stands and the width of each column without the Thread are kept for the person in each server, so they follow them to another browser. The Thread's column keeps the thread panel's width. The sidebar is one width on every page that has one, so it doesn't jump when people move between Chat, Members and Settings. The profile panel and the task side panel share one width too.
- When the window is too narrow for the remembered widths, draw the columns narrower, starting with the rightmost (a channel's side columns in their own order, [The channel's side columns](../patterns/responsive.md#the-channels-side-columns)), down to their minimums, and keep the main area at least 360px; a side panel that still doesn't fit covers the main area ([Responsive layout](../patterns/responsive.md)). The remembered widths don't change, so a wider window brings them back. A column left of the main area narrows for a side panel only while that still puts the panel beside the main area; when it can't, the column keeps its width and the panel covers the main area.
- Draw a remembered width outside a column's range at the nearest end of the range; don't reset it, so a change to a range doesn't throw away a person's choice.

## Related

- [Page structure](../patterns/page-structure.md): how the regions are arranged.
- [Shape](./shape.md): radii and stroke widths.
- [Visual comfort](./comfort.md): how spacing, insets, lines and surfaces work together.
