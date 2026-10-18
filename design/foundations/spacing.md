---
title: Spacing and sizing
summary: The 4px spacing grid, hit targets, control and row heights, avatar sizes, header heights and layout widths.
---

# Spacing and sizing

Raft spaces everything on a 4px grid and sizes everything people touch to at least 44px. Headers share one height across a screen, so the seams under them line up.

## Principles

- **Space on the 4px grid.** Use Tailwind's spacing scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px.
- **Touch targets are at least 44px.** A control that looks smaller is padded up to 44px by its hit area, not by its drawing.
- **Headers line up.** Every header on a screen has the same height, so the seam under each one runs as one line.

## Spacing

- Use the 4px steps for all spacing between and inside components.
- Inside small pieces (chips, the gap between a pixel and its word, tags) a half step of 2px is allowed: 6px and 10px.

## Hit targets

- Make every touch target at least 44px in both directions.
- Extend a control that looks smaller than 44px, and a text button, with a transparent pseudo-element to 44px.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- Desktop controls used only with a pointer may be smaller: sidebar rows and menu items 36px, rail items 40px, the hover toolbar 32px.

## Heights

| Element | Height |
| --- | --- |
| Control, default | 44px |
| Control, small | 32px |
| Full-width call to action | 52px |
| Phone list row | At least 64px |
| Settings row, radio row | At least 44px |
| Phone top bar row, panel header, sidebar header, rail header, drawer header | 56px |
| Web top bar, desktop app title bar | 48px |

- Make the rail header a 56px square.
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
