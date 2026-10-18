---
title: Alignment
summary: What lands on a margin or a center line — the shape, the letter or the icon box — and how the icon buttons at the ends of a top bar mirror each other.
---

# Alignment

Align what the eye sees, not the box. Each kind of element has one point that lands on the line, and it uses the same point horizontally and vertically.

## Principles

- **One edge per column.** Everything in a column of content starts on the same margin: 16px on a phone, 20px on desktop ([Spacing](./spacing.md#layout-widths)).
- **Align the visible thing.** A shape aligns by its edge, text by its letters, a frameless icon button by its icon box.

## Usage

| Element | What lands on the line | Example |
| --- | --- | --- |
| Anything with a shape: tiles, avatars, cards, inputs, the composer, the workspace pill, filled buttons | The edge of the shape; vertically, the shape is centered | The workspace pill's left edge is at 16px; a pink Done button in a top bar ends 16px from the right |
| Text | The letters: horizontally, the stem of the first letter; vertically, the center of the cap height | A large title shifts left by 0.05em; in a 56px header, a 17/22 page name and the text in the pill share one center line; the first tool icon in the composer lines up with the text typed in it |
| Frameless icon button | The icon box. The button itself is invisible, and its empty hit area extends past the line | The last icon box in a desktop panel header ends at 20px |

## Top bar icon buttons

The icon buttons at the two ends of a phone top bar (Back on the left; the bell or the overflow menu on the right) mirror each other:

- Place each button 3px from the screen edge, which puts its icon box 14px from the edge and the icon's center 25px from the edge.
- Common icons have about 2px of space inside their box, so their ink lands near 16px, on the same line as the content below.
- Treat narrow icons (the vertical ellipsis) the same way, so both ends stay symmetric.
- Don't shift a button to match each icon's ink: every icon has a different amount of space inside its box, so the buttons would move with the icon and the two ends would stop mirroring.

## Related

- [Spacing](./spacing.md): the margins and header heights.
- [Page structure](../patterns/page-structure.md): one edge per column across a desktop screen.
