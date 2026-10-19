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
- **A shape's padding is part of the gap.** When a shape sits next to text, the space the eye reads runs from the text to the shape's *ink*, not to its box. A chip with 6px of padding placed 6px from its label reads as 12px away. Subtract the padding, or the pair drifts apart.

## Usage

| Element | What lands on the line | Example |
| --- | --- | --- |
| Anything with a shape: tiles, avatars, cards, inputs, the composer, the workspace pill, filled buttons | The edge of the shape; vertically, the shape is centered | The workspace pill's left edge is at 16px; a pink Done button in a top bar ends 16px from the right |
| Text | The letters: horizontally, the stem of the first letter; vertically, the center of the cap height | A large title shifts left by 0.05em; in a 56px header, a 17/22 page name and the text in the pill share one center line; the first tool icon in the composer lines up with the text typed in it |
| Frameless icon button | The icon box. The button itself is invisible, and its empty hit area extends past the line | The last icon box in a desktop panel header ends at 20px |

## A control and its label

A checkbox, radio or switch centers on the first line of its label — the same line whether or not a description follows it.

- **Center the control on the label's first line.** Put the control and the label in one row and center them; a description goes on the row below, in the label's column. The control then lands correctly at every type size with no nudge.
- **Don't align the control to the top of the text block.** That is only right when a description happens to follow. On a label by itself the control sits visibly low — 4.55px low at a 13px field label — because a 20px box aligned to the top of a 13px line hangs below it.
- **The first line, not the block.** With a description, centering on the whole block drops the control as the description grows. It belongs to the label.

In Space Grotesk the cap-height center and the line-box center are the same point: the face is centered in its em box to within 0.004em, under 0.1px at any size we set. So centering the control on the line box *is* optical centering, and no per-size correction is needed. A hand-tuned `margin-top` is a sign the control was aligned to the wrong thing.

## A shaped value next to a bare one

A row of label-and-value pairs — a property list, a task's header — often mixes values that carry a shape (a status chip, a button, an avatar) with values that are bare text. Line up what the eye sees:

- **Measure the gap to the ink.** A bare value sits at the gap from its label; a shaped value sits at the gap *minus its own padding*, so both values' first letters start the same distance from their label.
- **Don't give both the same gap.** The shape's padding is then added on top of it, and the shaped value reads about twice as far from its label as its neighbors.

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
