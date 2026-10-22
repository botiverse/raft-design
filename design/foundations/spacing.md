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
- **A line that floats over the end of the list doesn't move it.** The line of who is about to post adds its own height to the end of the list while it shows, so the last message stays whole above it ([Working agents](../people-and-agents/working-agents.md#who-is-about-to-post)); Back to Bottom shows only while the end is out of view, so it never covers the last message.
- **Products don't write these numbers.** Components read the timeline tokens; a product that builds its own list top or end uses only `pt-timeline-start` above the first row (the section step less the lead every row brings, the history notice included) and `pb-timeline-end` (the section step less the last row's inset) under the last row. `timeline-turn` and `timeline-lead` are for the components; adding them up in a product is how the old gaps drifted.

```tokens
timeline
```

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- Desktop controls used only with a pointer may be smaller: sidebar rows and menu items 36px, rail items 40px, the hover toolbar 36px high with 28px buttons ([Button](../../packages/ui/src/components/button/button.md#inside-a-floating-toolbar)).
- On a desktop, a default control is 32px, Feishu's PC default, read with a pointer from further away. A desktop here is a screen from 768px (where the desktop layout begins) whose main pointer is a mouse or a trackpad, `(width >= 48rem) and (pointer: fine)`: density follows the input, not the width. A tablet used by touch keeps the phone's 44px controls and 16px field text, which also keeps iOS and iPadOS from zooming into a field on focus; an iPad with a trackpad reports a fine pointer and gets the desktop sizes. A button at 32px still overhangs to a 44px hit area (`after:-inset-y-control-hit`, plus its 1.5px border, because an overhanging `::after` is measured from inside the border), because a laptop can have a touch screen too; a field doesn't, since it is wide and its height is the target.

## The same kind, the same size

Someone moving between an app's tabs compares what they see. Two lists that look like the same kind of thing but are sized differently read as a mistake, whatever each one's reason was. So within one app, elements of the same kind on the screens someone reaches from the tab bar or the rail are the same size: the same height, type size and icon size. Which kind an element is follows what it stands for, not where it appears or which component draws it ([Rows](../components/overview.md#rows)).

- In Raft Chat on a phone, Home's channels and direct messages, Members and the Settings list are all a list of places, drawn with the same sidebar row: 44px, a 16px name at 600 and a 16px icon. Change one and you change them all.
- The rule holds within one app, not across them. Another app with different interaction may size the same component differently: an app built around its settings can give a settings row more room than Raft Chat does. A size belongs to the app's context; a component's doc gives the size it has where the app uses it.
- So the heights below are what Raft Chat uses today. Before changing one, find every screen in the app that shows the same kind of element and change them together.
- Pin a shared size with a test that compares the screens, not with a fixed number: Raft Chat's fails when Home's rows and the Settings list drift apart.

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
| Selection control: a switch; a checkbox and a radio | 50 × 30px; 20px. The same on a phone and a desktop. On its own, a checkbox's or radio's hit area is 44px tall on a touch screen; in a `<label>` row it reaches half the gap to the next option, and the label is the target. Centered on the label's first line ([Alignment](./alignment.md#a-control-and-its-label)) |
| Option in a popup list, menu item | 36px with one line; taller with more, at the same padding ([Forms](../patterns/forms.md#option-height)) |
| Phone top bar row, panel header, sidebar header, rail header, drawer header | 56px |
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
| Phone content margin | 16px on each side |
| Desktop main area, panel header, sidebar header, drawer margin | 20px on each side |
| Rail | 56px, plus a 1px seam; the labeled rail is 68px, plus a 1px seam |
| Sidebar (every page that has one: Chat, Members, Computers, Settings, a server's public page) | 240px, resizable from 200px to 400px |
| The Activity and Search results list, beside the item picked from it | 380px, resizable from 320px to 640px |
| Thread panel | 400px, resizable from 360px to 720px |
| Profile and task side panel | 400px, resizable from 320px to 640px |
| An agent's file tree | 256px, resizable from 180px to 480px |
| Main area, between the columns | At least 360px |
| Comment margin beside a document | 280px, 24px from the document ([Comments](../patterns/comments.md#wide-and-narrow)) |
| Side cards beside a conversation | 360px, resizable from 280px to 640px, measured inside the column's 12px gutter, never leaving the message list under 360px (so the cards sit beside the messages from a 652px panel, and float below it); two cards share the height, each at least 160px, and a folded card keeps its 48px header, its buttons 8px from every edge, and hides its body. Floating over the message list, the card is 12px in from the panel's edges and at most the panel's width less 24px |

How things land on these margins is in [Alignment](./alignment.md). Breakpoints are in [Responsive layout](../patterns/responsive.md).

### Resizing columns

On a desktop every column with a range above can be dragged on its seam, within that range; the comment margin keeps its 280px, because the cards are laid out against it ([Resizable](../../packages/ui/src/components/resizable/resizable.md)). The ranges come from what each column holds: the sidebar's names, counts and marks start to crowd under 200px and gain nothing past 400px; a results row keeps two or three words of a thread's title at 320px and only shows more of a one-line preview past 640px.

- Remember each width in each browser, not per server or account. The sidebar is one width on every page that has one, so it doesn't jump when people move between Chat, Members, Computers and Settings. The profile panel and the task side panel share one width too.
- When the window is too narrow for the remembered widths, draw the columns narrower, starting with the rightmost, down to their minimums, and keep the main area at least 360px; a side panel that still doesn't fit covers the main area ([Responsive layout](../patterns/responsive.md)). The remembered widths don't change, so a wider window brings them back. A column left of the main area narrows for a side panel only while that still puts the panel beside the main area; when it can't, the column keeps its width and the panel covers the main area.
- Draw a remembered width outside a column's range at the nearest end of the range; don't reset it, so a change to a range doesn't throw away a person's choice.

## Related

- [Page structure](../patterns/page-structure.md): how the regions are arranged.
- [Shape](./shape.md): radii and stroke widths.
- [Visual comfort](./comfort.md): how spacing, insets, lines and surfaces work together.
