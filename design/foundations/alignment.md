---
title: Alignment
summary: What lands on a margin or a center line — the shape, the letter or the icon box — and where the icon buttons at the two ends of a header go.
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
| Anything with a shape: tiles, avatars, cards, inputs, the composer, filled buttons | The edge of the shape; vertically, the shape is centered. Beside plain text in a row, the text instead ([A shape beside plain text](#a-shape-beside-plain-text)) | The workspace button's avatar starts at 16px, and its press fill reaches past it; a pink Done button in a top bar ends 16px from the right |
| Text | The letters: horizontally, the stem of the first letter; vertically, the center of the cap height | In a 56px header, a `text-headline` page name and the server's name in the workspace button share one center line; the first tool icon in the composer lines up with the text typed in it |
| Frameless icon button | The icon box. The button itself is invisible, and its empty hit area extends past the line ([The ends of a header](#the-ends-of-a-header)) | Back's icon box starts and the last icon box ends 20px from a panel's edges, 16px from a phone's |

## A control and its label

A checkbox, radio or switch centers on the first line of its label — the same line whether or not a description follows it.

- **Center the control on the first line of its label.** Offset it by half the difference between that line and the control — `(1lh - 20px) / 2` for a 20px box — so it lands correctly at every type size without a hand-tuned nudge.
- **Don't align the control to the top of the text block.** A 20px box sitting on the top of an 18px line hangs 1px below the line's centre, and on a 16px line 2px below it.
- **Don't center it on the label either.** A label is often one line, which makes the two look the same — until it wraps, and the control slides to the middle of the block: 27px off the first line at a narrow width, and 8px off as soon as a description follows. The first line is what the control belongs to; the block is a coincidence.

In Space Grotesk the cap-height center and the line-box center are the same point: the face is centered in its em box to within 0.006em, under 0.1px at any size we set. So centering the control on the line box *is* optical centering, and no per-size correction is needed. A hand-tuned `margin-top` is a sign the control was aligned to the wrong thing: it is the right answer for one label at one size, and silently wrong for the next. Write the offset as the arithmetic, not as the number it currently comes to: `Banner` once carried `mt-px` for a 16px icon and `mt-[4.5px]` for a 9px status, `(18 - 16) / 2` and `(18 - 9) / 2` against an 18px line, and both went wrong when the desktop line changed. An icon or a status pixel that leads a line of text now follows one rule for every component ([A mark that leads text](#a-mark-that-leads-text)).

## A mark that leads text

A banner, a toast, a panel notice, an action card's notice and a status chip start their text with a mark: a Lucide icon or a status pixel. The mark belongs to the first line, like a control to its label. An icon takes its size from that line's type; a status pixel keeps its one size.

- **Give the mark a box one line tall, `1lh`, and center it there.** Its margins are `(1lh - size) / 2`, negative when the mark is taller than the line, so its box is exactly one line at every type size, on the phone scale and the desktop one, and the mark stays on the first line when the text wraps or a description follows.
- **Center it on the line box, which is the cap-height center.** Measured in Space Grotesk, the two differ by 0.006em: under 0.1px for 12px to 14px text, well under the 0.5px at which a correction would show. A line of Chinese keeps Space Grotesk's line box (the fallback face doesn't make it taller), so the Latin in it has the same cap-height center; the ideographs' own ink centers scatter around it by up to 0.4px at 14px and 0.7px at 13px, differing as much from one character to the next, so there is no steady offset to correct and the same center holds for mixed and Chinese text. Never center the mark on the whole text block (it slides to the middle of a wrapped paragraph, as `items-center` does) and never place it with a fixed `margin-top`.
- **Size an icon at 1.15em, on an even pixel:** 14px beside 12px and 13px text, 16px beside 14px, 18px beside 16px ([Iconography](./iconography.md#sizes)). Its ink, 5/6 of its box, then stands a little taller than the capitals, like a letter with an ascender. A 20px icon beside 14px text, as banners had, had ink nearly twice the cap height (18px against 10px) and read as a block beside the line rather than part of it.
- **Keep a status pixel at its one size, 9px with a 1.5px ink edge, beside any text.** It is the same light in a toast, a banner, a chip, a panel header and a sidebar row, so it is the same size in all of them ([Status](../../packages/ui/src/components/status/status.md#anatomy)): 9px is the 6px of color it takes to tell green from yellow from orange, plus two ink edges, and about the cap height of 13px text. Only its place follows the text. Sized to the x-height instead, it came to 6px or 7px, a speck on a toast's dark ground with 4px or 5px of color, beside a 9px light for the same state in the sidebar.
- **Leave 8px between the mark and a notice's text** (`gap-lead`), for an icon and a pixel alike. A chip keeps its own tighter gap: 4px in a Badge, 6px in a header's activity line.
- **Set the type on the row, not only on the text.** The mark reads `1lh` (and an icon `em`) from the type it inherits, so the row that holds the mark and the text carries the text's type, as Banner and PanelNotice do.

In raft-ui these are the `lead-icon` and `lead-dot` utilities (`styles.css`) and the `gap-lead` spacing; `lead-dot` places a 9px pixel and holds it at 9px. Banner, PanelNotice, ToastIcon, MessageActionCardNotice, Badge and PanelActivity apply them to an `svg` or a `Status` placed in them, whatever size the caller gave it, so a mark leads its text the same way in every component. A `Status` you place beside text yourself takes `className="lead-dot"` on a row that carries the text's type.

## A shape beside plain text

When a shape with its own padding (a chip, a frameless button's hover fill) sits in a row beside plain text, such as the values in a row of task properties, count its padding as part of the gap: pull the shape left by its padding, so its text starts where plain text would and its fill hangs outward.

The row is read as text, so the eye compares where the words start, not where the fills start. Aligning the shapes by their edge would push their words 6px past the plain values beside them, and the row would look ragged. This is the exception to aligning a shape by its edge: that rule holds when shapes line up with one another down a column.

## Text of different sizes on one line

A line that mixes sizes or faces, such as a message's sender line (the name in bold `text-subhead`, the role, the model and a badge's words in `text-caption`, the time in Space Mono), puts every letter on one baseline: lay it out with `items-baseline`, not `items-center`.

- **Align the baselines, not the boxes.** Each size has its own line box, and centring the boxes centres each face's ascent and descent, not its letters. The smaller notes then stand up to 1px above the name's baseline at every size, the role and the time by different amounts, and the line looks broken at a glance.
- **A shared baseline is optical alignment for the two faces.** Space Grotesk and Space Mono have the same cap height (0.700em) and the same figure height (0.714em with overshoot), and their x-heights differ by 0.01em. So a time in Space Mono and a role in Space Grotesk of the same size stand exactly as tall on one baseline (rendered at 3x, the digits of `04:11` and the capitals of the role have the same ink box to the device pixel), and no per-face offset is needed. Space Mono's taller ascent and descent only make its box sit differently, which is why centring boxes moves it.
- **A shape with words in it aligns by its words too.** A badge in the sender line puts its letters on the baseline, as a chip in a sentence does ([Marks in running text](#marks-in-running-text)). Its 22px box then hangs a pixel lower than it would centred, so on a desktop a line with a badge is a pixel taller than the name's 22px line (on a phone the badge already makes the 20px line 22px). A line without a badge stays the height of the name's line.
- **When the line wraps, align the first line.** A label that wraps onto more lines sets its first line on the name's baseline, and the time stays on that line.

## Marks in running text

A reference chip, a mention of the person reading and inline code sit inside a sentence, so they align as text.

- **Put their letters on the sentence's baseline.** A chip's words line up with the words around it, with or without a leading icon. A chip that took its baseline from its icon floated 3px above the sentence, and a 1px nudge put a channel chip above it too.
- **Center the letters in the fill by their cap height.** In Space Grotesk the line box already does this. Space Mono's letters sit 0.0275em below the center of their content area, so inline code moves its fill down by that much (top padding `1px - 0.0275em`, bottom `1px + 0.0275em`). Without it the letters sit about 0.6px low.
- **Center a leading icon on the letters, not on the box.**

## The ends of a header

Every header puts the icon buttons at its two ends the same way: a panel header, a thread, profile or task panel's header, a phone's top bar, a drawer's or a sheet's header, a dialog's ×, the sidebar header and the right end of the web top bar.

- **Put the icon box on the content margin.** The first icon box starts and the last one ends on the margin of the column the header sits over, the line the content below starts on: 16px on a phone, 20px on a desktop and in a dialog ([Spacing](./spacing.md#layout-widths)).
- **Let the hit area hang outward.** The rest of the button is empty, so it reaches past the line toward the edge, never inward: a 44px button with a 22px icon overhangs by 11px, a 32px one with an 18px icon by 7px. It stops at the edge of the screen or the panel; every header margin is wider than the largest overhang, so none is cut today.
- **Keep the line at every button size.** A button is 32px with a mouse and 44px on a phone or a touch screen, also in the desktop layout ([Spacing](./spacing.md#hit-targets)); only the overhang changes. Never place an edge button by its own edge: a 44px Back at the margin puts its icon 11px inside the content below it, while the ⋮ at the other end, placed by its icon, stays on the line, and the two ends stop mirroring.
- **Mirror the two ends.** Left and right follow the same rule, so Back and the last button sit at the same distance from their edges.
- **Leave shapes and text where they are.** A filled button, a sticker or a title at the end of a header lands on the same margin by its edge or its letters ([Usage](#usage)).
- **Don't shift a button to match its icon's ink.** Every icon has a different amount of space inside its box (an arrow, a gear and a vertical ellipsis differ by up to 9px), so the buttons would move with the icon and the two ends would stop mirroring. The same goes for narrow icons such as the vertical ellipsis.
- **Use `arrow-left` for Back, not a chevron.** A chevron's ink fills only the middle of its box and would need a shift of its own; an arrow fills the box like other icons.

A phone's top bar once put its icon boxes 2px outside the margin, 14px from the screen edge, so that a common icon's ink (about 2px inside its box) landed near 16px. That made the phone the only header aligned by ink rather than by icon box, and a touch screen in the desktop layout then had no rule at all: it placed Back by the button's edge, 11px inside the line. One rule by icon box holds on every screen and every button size.

In raft-ui the header owns the margin and each frameless icon button declares how far its icon box sits inside it, `(button − icon) / 2`; the header pulls its first and last child out by that much ([Panel](../../packages/ui/src/components/panel/panel.md#rules)).

## Related

- [Spacing](./spacing.md): the margins and header heights.
- [Typography](./typography.md): the type scale each line height comes from.
- [Forms](../patterns/forms.md): how a control, its label and its description go together.
- [Iconography](./iconography.md#sizes): the icon sizes, including an icon that leads text.
- [Page structure](../patterns/page-structure.md): one edge per column across a desktop screen.
