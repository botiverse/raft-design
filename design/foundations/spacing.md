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

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- Desktop controls used only with a pointer may be smaller: sidebar rows and menu items 36px, rail items 40px, the hover toolbar 32px high with 28px buttons.

## The same kind, the same size

Someone moving between an app's tabs compares what they see. Two lists that look like the same kind of thing but are sized differently read as a mistake, whatever each one's reason was. So within one app, elements that look alike on the screens someone reaches from the tab bar or the rail are the same size: the same height, type size and icon size.

- In Raft Chat on a phone, a conversation on Home and a page in the Settings list are the same kind of row: an icon, a name, tap to go in. Both are 44px, with a 16px semibold name and a 16px icon. Change one and you change the other.
- The rule holds within one app, not across them. Another app with different interaction may size the same component differently: an app built around its settings can give a settings row more room than Raft Chat does. A size belongs to the app's context, not to the component.
- So the heights below are what Raft Chat uses today, not sizes a component must have everywhere. Before changing one, find every screen in the app that shows the same kind of element and change them together.
- Pin a shared size with a test that compares the screens, not with a fixed number: Raft Chat's fails when Home's rows and the Settings rows drift apart.

## Heights

| Element | Height |
| --- | --- |
| Control, default | 44px |
| Control, small | 32px |
| Full-width call to action | 52px |
| Phone list row | At least 64px |
| Phone list of places (Home, Members, the Settings list), settings row, radio row | At least 44px |
| Phone top bar row, panel header, sidebar header, rail header, drawer header | 56px |
| Web top bar, desktop app title bar | 48px |

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
