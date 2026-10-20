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
- **Control and row heights are minimums.** Where text grows, the box grows with it; text never clips ([Heights](#heights)).
- **The same kind of thing is the same size across an app's tabs.** Size an element by what it is to the person using the app, not by the component that draws it ([The same kind, the same size](#the-same-kind-the-same-size)).

## Spacing

- Use the 4px steps for all spacing between and inside components.
- Inside small pieces (chips, the gap between a pixel and its word, tags) a half step of 2px is allowed: 6px and 10px.

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- On a touch screen, space two targets drawn smaller than 44px so their hit areas don't overlap: two 32px icon buttons side by side need 12px between them, as [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#behavior)'s actions keep on a touch screen. A tap where two hit areas overlap goes to one of them by the order they are drawn in, not by the one the person aimed at. raft-ui's [Composer](../../packages/ui/src/components/composer/composer.md) doesn't follow this yet: its 32px toolbar buttons sit 8px apart, so on a touch screen their hit areas overlap by 4px.
- When there is no room for that space, group the targets into one control, such as one picker in place of a row of small toggles, or move them into a menu, as the file viewer's toolbar does on a phone ([File viewer](../components/overview.md#file-viewer)).
- Space them even where the platform enlarges small targets itself: a tap on one must not be able to land on the other.
- With a mouse or a trackpad, hit areas may overlap: a pointer lands where it is aimed. InboxItem's actions sit 2px apart there.
- Desktop controls used only with a pointer may be smaller: sidebar rows and menu items 36px, rail items 40px, the hover toolbar 32px high with 28px buttons.
- On a desktop, a default control is 32px, Feishu's PC default, read with a pointer from further away. A desktop here is a screen from 768px (where the desktop layout begins) whose main pointer is a mouse or a trackpad, `(width >= 48rem) and (pointer: fine)`: density follows the input, not the width. A tablet used by touch keeps the phone's 44px controls and 16px field text, which also keeps iOS and iPadOS from zooming into a field on focus; an iPad with a trackpad reports a fine pointer and gets the desktop sizes. A button at 32px still overhangs to a 44px hit area (`after:-inset-y-control-hit`), because a laptop can have a touch screen too; a field doesn't, since it is wide and its height is the target.

## The same kind, the same size

Someone moving between an app's tabs compares what they see. Two lists that look like the same kind of thing but are sized differently read as a mistake, whatever each one's reason was. So within one app, elements of the same kind on the screens someone reaches from the tab bar or the rail are the same size: the same height, type size and icon size. Which kind an element is follows what it stands for, not where it appears or which component draws it ([Rows](../components/overview.md#rows)).

- In Raft Chat on a phone, Home's channels and direct messages, Members and the Settings list are all a list of places, drawn with the same sidebar row: 44px, a 16px name at 600 and a 16px icon. Change one and you change them all.
- The rule holds within one app, not across them. Another app with different interaction may size the same component differently: an app built around its settings can give a settings row more room than Raft Chat does. A size belongs to the app's context; a component's doc gives the size it has where the app uses it.
- So the heights below are what Raft Chat uses today. Before changing one, find every screen in the app that shows the same kind of element and change them together.
- Pin a shared size with a test that compares the screens, not with a fixed number: Raft Chat's fails when Home's rows and the Settings list drift apart.

## Heights

The heights of controls, fields and rows are minimums, at the default text size. Where text can grow on its own, a control, a field or a row grows with its text, and its text never clips ([Larger text](./typography.md#larger-text)): two lines in a 44px row make it taller, not cut off. A size is still what a test pins and what the same kind of element shares ([The same kind, the same size](#the-same-kind-the-same-size)); at a larger text size every element of a kind grows together.

Headers and bars (the last two rows) keep the height in the table at every text size, as the iOS navigation bar and the Material top app bar do, so the seams under them line up. Their title stays on one line and truncates, and its size stops growing at the size that still fits the bar, as bar titles do on iOS and Android ([Larger text](./typography.md#larger-text)); the content under them grows.

| Element | Height |
| --- | --- |
| Control, default (`control-height`): Input, InputGroup, Select, Combobox, Button at `lg` and `icon-lg`, a panel action | 44px on a phone and a touch screen, 32px on a desktop |
| Control, small: Button at `md` and `icon-md`, a filter trigger, a segment of a segmented control | 32px |
| Full-width call to action (`control-height-cta`, Button at `xl`) | 52px on a phone and a touch screen, 40px on a desktop |
| Phone list of places (Home, Members, the Settings list): the sidebar row | 44px |
| Row with an avatar and a preview: a conversation, a person, an agent ([ListRow](../../packages/ui/src/components/list-row/list-row.md)) | At least 64px |
| Settings row inside a settings page ([ListRow](../../packages/ui/src/components/list-row/list-row.md) `plain`) | 48px with one line |
| Radio row | At least 44px |
| Phone top bar row, panel header, sidebar header, rail header, drawer header | 56px |
| Web top bar, desktop app title bar | 48px |

- raft-ui sets the control heights as fixed heights (`h-control`) and its rows as minimums (`min-h-*`). On the web type is set in px and zoom scales text and box together, so a fixed height holds there; under a browser's text-only zoom a control's text can clip there, so raft-ui doesn't meet the rule above yet.
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
| Sidebar | 240px, resizable from 180px to 320px |
| Side panel | 380px |
| Thread panel | 400px, resizable from 360px to 60% of the window |

How things land on these margins is in [Alignment](./alignment.md). Breakpoints are in [Responsive layout](../patterns/responsive.md).

## Related

- [Page structure](../patterns/page-structure.md): how the regions are arranged.
- [Shape](./shape.md): radii and stroke widths.
