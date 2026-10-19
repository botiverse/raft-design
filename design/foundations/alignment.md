---
title: Alignment
summary: What lands on a margin or a center line — the shape, the letter or the icon box — and how the icon buttons at the ends of a top bar mirror each other.
redirectFrom: [decisions/0035-mirrored-top-bar-buttons]
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

## A control and its label

A checkbox, radio or switch centers on the first line of its label — the same line whether or not a description follows it.

- **Center the control on the first line of its label.** Offset it by half the difference between that line and the control — `(1lh - 20px) / 2` for a 20px box — so it lands correctly at every type size without a hand-tuned nudge.
- **Don't align the control to the top of the text block.** A 20px box sitting on the top of an 18px line hangs 1px below the line's centre, and on a 16px line 2px below it.
- **Don't center it on the label either.** A label is often one line, which makes the two look the same — until it wraps, and the control slides to the middle of the block: 27px off the first line at a narrow width, and 8px off as soon as a description follows. The first line is what the control belongs to; the block is a coincidence.

In Space Grotesk the cap-height center and the line-box center are the same point: the face is centered in its em box to within 0.004em, under 0.1px at any size we set. So centering the control on the line box *is* optical centering, and no per-size correction is needed. A hand-tuned `margin-top` is a sign the control was aligned to the wrong thing: it is the right answer for one label at one size, and silently wrong for the next. Write the offset as the arithmetic, not as the number it currently comes to — `Banner` carries `mt-px` for a 16px icon and `mt-[4.5px]` for a 9px status, which are exactly `(18 - 16) / 2` and `(18 - 9) / 2` against its 18px line. They are right today and will be wrong the day that line height changes, with nothing to catch it.

## Top bar icon buttons

The icon buttons at the two ends of a phone top bar (Back on the left; the bell or the overflow menu on the right) mirror each other, so their icon centers are symmetric and Back is neither crowded against the edge nor out of balance with the right side:

- Place each button 3px from the screen edge, which puts its icon box 14px from the edge and the icon's center 25px from the edge.
- Common icons have about 2px of space inside their box, so their ink lands near 16px, on the same line as the content below.
- Treat narrow icons (the vertical ellipsis) the same way, so both ends stay symmetric.
- Don't shift a button to match each icon's ink: every icon has a different amount of space inside its box (an arrow, a gear and a vertical ellipsis differ by up to 9px), so the buttons would move with the icon and the two ends would stop mirroring.
- Use `arrow-left` for Back, not a chevron. A chevron's ink fills only the middle of its box and would need a shift of its own; an arrow fills the box like other icons.

## Related

- [Spacing](./spacing.md): the margins and header heights.
- [Typography](./typography.md): the type scale each line height comes from.
- [Forms](../patterns/forms.md): how a control, its label and its description go together.
- [Page structure](../patterns/page-structure.md): one edge per column across a desktop screen.
