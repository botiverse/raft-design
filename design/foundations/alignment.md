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
- **Leave 8px between the control and its label.**
- **Never shrink the control, and move it rather than resize the row.** The switch keeps 50 × 30 and the checkbox and radio 20px wherever they sit. A control shorter than the line takes a box one line tall; a control taller than the line is moved up onto it, not given a row of its own. In a `<label>` row a box never takes less room than its 20px, so a row of `text-xs` is 20px tall; give a wrapping small label a 20px line (`leading-5`) so the box can sit on its first line.
- **Both ends of a row center on its first line.** In a settings row with a description, the leading icon or avatar and the trailing switch, value or chevron all center on the title, not on the title and its description together. One rule for both ends keeps them level with each other and with the title. A row with a title alone is centered as a whole, at its own height: 54px on a phone with a switch.
- **Let a tap between two options land on the nearer one.** A box or a circle in a `<label>` row reaches 4px past its line, half the 8px gap to the next option, and the label is the target for the rest. On its own, outside a label, its hit area is 44px on a touch screen.

raft-ui does this wherever it puts a control beside its label, so don't add a `margin-top` or `items-center` of your own:

- `FieldItem` centers a `Checkbox`, `RadioGroupItem` or `Switch` in it on the first line of its `FieldLabel`, 8px before it.
- A `Checkbox` or `RadioGroupItem` placed directly in a `<label>` row takes a box one line of the label tall, centered on that line, so it sits wherever the row puts a line of text: on the first line with `items-start`, and on the one line with `items-center`, whatever the row's min-height. Set the label's type on the `<label>`, since the box reads its line from there, and use `items-start` when the text can wrap. A switch beside a label goes in a `FieldItem` or a `ListRow`.
- A `ListRow variant="plain"` with a description centers both its ends on the title's first line; with a title alone, everything is centered.

In Space Grotesk's metrics the cap-height center and the middle of the text's box differ by 0.006em, under 0.1px at the sizes we set. Rendered, Chromium rounds the ascent and descent to whole pixels and puts an odd pixel of leading under the text, so at 11/13, 13/18, 15/20 and 16/24 the letters sit up to 0.5px above the line box's middle; Safari and Firefox center them exactly. Center on the line box anyway: a correction for one engine moves the other 0.5px the wrong way, and 0.5px alone doesn't show in a row. An odd difference between a mark and its line can also leave the mark up to 0.5px off in a given engine, which is below what shows in a row too, so we don't correct it either. A hand-tuned `margin-top` is a sign the control was aligned to the wrong thing: it is the right answer for one label at one size, and silently wrong for the next. Write the offset as the arithmetic, not as the number it currently comes to: `Banner` once carried `mt-px` for a 16px icon and `mt-[4.5px]` for a 9px status, `(18 - 16) / 2` and `(18 - 9) / 2` against an 18px line, and both went wrong when the desktop line changed. An icon or a status light that leads a line of text is centered on the first line the same way in every component ([A mark that leads text](#a-mark-that-leads-text)).

## A mark that leads text

A banner, a toast, a panel notice, an action card's notice and a status chip start their text with a mark: a Lucide icon or a status light. The mark belongs to the first line, like a control to its label. The one rule they share is where the mark sits. Each component keeps its own icon size and gap, set by the component: a banner's icon is 20px (16px in a `sm` banner), a toast's 16px, an action card notice's 14px.

- **Center the mark on the first line of its text.** Write the offset as the arithmetic, `(1lh - size) / 2`, or move the mark half a line down and back up by half its own height, so it lands on the line at every type size, on the phone scale and the desktop one, and stays on the first line when the text wraps or a description follows.
- **Center it on the line box.** In Space Grotesk's metrics the cap-height center and the middle of the text's box differ by 0.006em, under 0.1px at the sizes we set. Rendered, Chromium rounds the ascent and descent to whole pixels and puts an odd pixel of leading under the text, so at 11/13, 13/18, 15/20 and 16/24 the letters sit up to 0.5px above the line box's middle; Safari and Firefox center them exactly. Center on the line box anyway: a correction for one engine moves the other 0.5px the wrong way, and 0.5px alone doesn't show in a row. An odd difference between a mark and its line can also leave the mark up to 0.5px off in a given engine, which is below what shows in a row too, so we don't correct it either. A line of Chinese keeps Space Grotesk's line box (the fallback face doesn't make it taller), so the Latin in it has the same cap-height center; the ideographs' own ink centers scatter around it by up to 0.4px at 14px and 0.7px at 13px, differing as much from one character to the next, so there is no steady offset to correct and the same center holds for mixed and Chinese text. Never center the mark on the whole text block (it slides to the middle of a wrapped paragraph, as `items-center` does) and never place it with a fixed `margin-top`.
- **Keep a status light at its one size, 9px with a 1.5px ink edge, beside any text.** It is the same light in a toast, a banner, a chip, a panel header and a sidebar row, so it is the same size in all of them ([Status](../../packages/ui/src/components/status/status.md#sizes)): 9px is the 6px of color it takes to tell green from yellow from orange, plus two ink edges.
- **Set the type on the row, not only on the text.** The mark reads `1lh` from the type it inherits, so the row that holds the mark and the text carries the text's type, as Banner and PanelNotice do.

In raft-ui, Banner, PanelNotice, ToastIcon and MessageActionCardNotice center an icon placed in them on the first line, and Banner, PanelNotice, ToastIcon, Badge and PanelActivity do the same for a `Status`, held at 9px whatever size it was given. The `lead-icon` and `lead-dot` utilities (`styles.css`) do it for a mark you place yourself, on a row that carries the text's type; with `lead-dot`, don't pass the `Status` a size.

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

## Chips

A chip is a short run of ink in a fill: a reference in a message, a task chip, a badge, a reaction, a tag in a field. The ink at its two ends sits the same distance from the fill's edges, and its parts center on one line. Padding is only the means: a chip keeps its total padding, and its width, and splits it between the two ends so each end makes up for the empty space its own content brings.

- **Measure on the ink, not on the boxes.** The eye compares the space from the fill's edge to the first and the last thing drawn: an icon's strokes, a letter's outline, a status pixel's square.
- **Give an icon end the same padding as a text end.** A Lucide icon leaves 1/24 of its box empty at each side, 0.6px at 14px, about what a letter leaves beside it. A reference chip with an icon once split its 9px as 3px before the icon and 6px after the text: the icon sat 3.6px from the edge and the last letter 7px, and the right end looked empty. It now takes 4.5px at each end.
- **Give a mark drawn to its edges the same padding too.** A status pixel, an app's icon, an emoji and a status light carry no empty space. Task chips, task statuses and reactions once took 2px less on that end, which left 6px before the pixel and 8.5px after the text; they now split the same padding evenly.
- **A tag with a remove button is the exception.** A × sits centered in a button 4px shorter than the chip, 2px from its end, and Lucide draws it 3px inside its box, so its ink ends 6px from the edge of a 20px chip and 12px from a 32px one, against 8.4px before the text. Matching them would take padding the tag doesn't have, or move the button off its 2px inset, so the tag stays as it is.
- **Correct a fixed icon that is drawn narrower than its box.** A bookmark is drawn 2.3px inside a 14px box and a file 1.75px, so the saved marker and a forwarded file take 5.5px on the icon end and 6.5px on the text end, the same 12px in all. A reference chip can't see which icon it was given: a `#`, a pin or a file in one keeps 1px to 2px more on its left. Raft writes a channel's `#` as text.
- **Leave letters as they are.** Two letters' side bearings differ by up to 1px and change with every word, so text at both ends takes equal padding.
- **Center a smaller note on the label's letters.** A note in smaller machine type after a chip's label, such as `msg` on a link to a message, keeps the label's baseline in the layout and is drawn higher by a quarter of the size difference. Space Grotesk and Space Mono both have a 0.5em x-height, so the middles of the two x-heights meet at every type size. On the shared baseline, an 11px note sat 0.3px low beside a 12.25px label and 0.75px low beside a 14px one, and its descenders made it look lower still.
- **Keep the label on the sentence's baseline.** Never center the whole chip to bring its parts together: the label's words would float 2px above the sentence ([Marks in running text](#marks-in-running-text)). Move only the smaller part.

In raft-ui each chip's recipe holds its padding, and `MessageReferenceSuffix` is the note after a reference chip's label.

## Checking alignment

Whether a row sits on one line is measured, not judged by eye at 1x: a 1px drop is easy to miss on a screen and plain at 3x. `scripts/align-audit.mjs` measures every docs example on a desktop and on a phone and lists every row with a part 0.75px or more off, with a picture of each.

- **Find the rows.** A row is an element that lays its children out in a line, centered or on the baseline: a flex or grid row, a chip, a button with an icon, a list row, a menu item, a tab, a toast or banner line, a field's adornments.
- **Measure each part where the eye sees it.** An icon, a pixel or a light by the pixels it draws, from a screenshot with it and without it. Text by the pixels of one flat letter (an H, an E, an x, an n), since its box is not its letters, and its font's metrics for the rest: the baseline, the cap height and the x-height. A shape with words in it, such as a badge, by its box.
- **Measure against the row's main text.** That is its largest, then boldest, run. An icon or a shape is centered on its cap-height middle. On a line without a fill, such as a sender line or a name and its note, text of every size shares the baseline ([Text of different sizes on one line](#text-of-different-sizes-on-one-line)). Inside a chip, smaller text centers its x-height on the main text's, or its cap height when it has no lowercase ([Chips](#chips)).
- **Take out the renderer's share.** Chromium's rounding moves letters up to 0.5px in their line box ([A control and its label](#a-control-and-its-label)). The audit works it out for every run of text, reports it apart and flags only the rest: a row is flagged for its own code, not for the browser.
- **Keep inline chips on the sentence.** A chip in running text puts its main text on the sentence's baseline ([Marks in running text](#marks-in-running-text)); the audit checks that too.
- **Fix the rule, not the row.** A flagged row points at the element type that is off, such as a spinner in a reference chip or a note after a label. Correct where that type sits, for every row it appears in, and never its size.

Run it against the docs (`pnpm dev`) with `node scripts/align-audit.mjs --base <docs URL>`; `--only <path>` limits it to some examples. The report lists the rows by component, worst first; each picture draws a thin line through the main text's middle and one through each part's. At the end it lists the marks that sit on a half pixel of their line, for information only: that is not corrected ([A control and its label](#a-control-and-its-label)).

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
- [Visual comfort](./comfort.md): insets, separators and the rhythm around what lands on these lines.
- [Typography](./typography.md): the type scale each line height comes from.
- [Forms](../patterns/forms.md): how a control, its label and its description go together.
- [Iconography](./iconography.md#sizes): the icon sizes.
- [Page structure](../patterns/page-structure.md): one edge per column across a desktop screen.
