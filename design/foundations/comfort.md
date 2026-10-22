---
title: Visual comfort
summary: The rules that keep a screen calm to read all day — where a line goes and how far it runs, spacing rhythm, insets, alignment, density, contrast between levels of text, and when a surface gets a card.
---

# Visual comfort

People keep Raft open all day, so a screen has to be easy to read at a glance and restful to look at for hours. Comfort comes from a few relationships the eye checks without being asked: what belongs together, where a thing starts and ends, and what matters most. Each rule below is one sentence with the reason behind it; the values come from [Spacing](./spacing.md), [Alignment](./alignment.md), [Typography](./typography.md), [Color](./color.md#lines) and [Elevation](./elevation.md), and this page says how they work together.

## Principles

- **A line runs as far as its container visibly goes.** Inside a bordered box it meets the border; without a visible edge it is inset to the content ([Separators](#separators)).
- **Closer inside a group than between groups.** Every space comes from the one 4px scale ([Spacing rhythm](#spacing-rhythm)).
- **The same inset from every edge.** Nested insets add up ([Edges](#edges)).
- **One center line per row, one start edge per column** ([Alignment](#alignment)).
- **Density follows the input, never the content.** Targets stay 44px by touch and 36px by mouse ([Density](#density-and-touch-targets)).
- **Few levels of text, far apart.** Secondary text is muted, not small ([Hierarchy](#hierarchy-contrast)).
- **A card is for an object that sits inside other content or beside another region.** Not for every group ([Surfaces](#surfaces)).

## Separators

A line separates siblings inside a container, so it spans what that container visibly bounds.

- **Inside a bordered box, run the line edge to edge, so it meets the border on both sides.** The box and its lines then make one set of cells. A line that stops short of the border leaves a gap at each end, and the box reads as a frame with scratches in it. The tasks under a message sit in such a box: their lines meet its border ([Tasks](../patterns/tasks.md#rows-in-a-compact-list)).
- **Without a visible edge, inset the line at both ends to the content: from where the text starts to where the last mark ends.** With nothing to meet, a full-width line reads as the edge of a region, a seam, and cuts the page into strips. A line that starts and ends with the content belongs to the content. A phone page, a panel, the Activity list and a list inside a larger card have no edge of their own, so their lines are inset: 16px from each side of a phone screen and of a side card, and in Activity from the text after the avatar to 16px from the right.
- **The container is the nearest one with a visible edge that holds only these siblings.** A box that holds nothing but the rows is the rows' container. A card that also holds a header, filters and group headings is not: there the list is one section among others, has no edge of its own, and its lines are inset like the card's content. This is why the Tasks card's lines stop 16px from its edges while the box under a message has lines that meet its border.
- **Prefer space to a line where the grouping already reads.** A heading, a gap or a change of fill already separates groups, so put no line between a heading and its rows, above the first row or under the last, or between two groups that have their own headings. A line next to a border, a seam or another line is never needed: two 1px lines side by side read as one 2px line ([Page structure](../patterns/page-structure.md#one-line-between-two-regions)).
- **Hover still fills the whole row.** An inset line is drawn on the row, not by narrowing it, so the row's target and its hover run edge to edge whatever the line does.

What each kind of line means (hairline, seam, ink) is in [Principles](../principles/principles.md#2-three-lines-three-meanings). Two components still differ from this rule, and are to be changed with the screens that use them rather than copied into new work: a [ListRow](../../packages/ui/src/components/list-row/list-row.md) list starts its line at the text but runs it to the right edge, and its settings variant, rows in an inset card, starts its lines 16px in rather than at the card's border. [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) and the task lists already follow it.

## Spacing rhythm

Put things that belong together closer to each other than to anything else, with every space taken from the one scale.

- **Use only the 4px steps** ([Spacing](./spacing.md#spacing)): 4px and 8px inside a row or a chip, 12px and 16px between groups, 24px and 32px between sections. A value off the scale (5px, 14px, 18px) is a sign that something is being nudged instead of laid out.
- **Make the space between groups about twice the space inside one, or more.** Proximity is how the eye groups things before it reads them. When the gaps are close in size, nothing groups, and the screen reads as an even grey.
- **Keep a heading closer to what it names than to what comes before it**, by about twice: a status heading in the Tasks card has the Sidebar section header's spacing, 16px above its words and 6px below, and the groups have no gap of their own (about 25px from the rows above, 16px to its own). A heading as far from the rows above as from its own looks as if it belonged to both. Where the heading is a toggle, let its touch target reach into the space above it rather than push it away from its rows.
- **A row's own padding counts.** Measure a gap between letters and marks, not between boxes: a 36px row with 14px of text already has 11px of space above and below its letters.

## Edges

Content keeps the same inset from every edge of its container, so the container looks centred around it.

- **Inset the first and the last visible thing by the same amount**: the first letter or the leading mark on the left, the last icon box or word on the right ([Alignment](./alignment.md#usage)). A toast whose status pixel sat 21.5px in while its Undo ended 16px from the edge looked pushed to one side, even if nobody could say why.
- **A small mark in a wider slot moves the edge.** A 9px pixel centred in a 20px slot starts 5.5px inside the inset. Size the slot to the mark, so its edge lands on the inset ([Toast](../../packages/ui/src/components/toast/toast.md)).
- **A frameless button at the end of a bar lands by its words or its icon box**, its padding hanging outward: Mark All Read at the right of Activity's filters ends its letters on the margin the rows' times end on ([Alignment](./alignment.md#usage)).
- **Nested insets add up.** A container inside another starts at the outer inset, and its own content at the inner inset on top of that: a box under a message starts on the message's text column, and its rows start 12px inside the box. Don't cancel an inset with a negative margin to make the numbers come out; change the container.
- **A container that has to be a minimum width keeps it after its margins.** A side card that is at least 280px is 280px inside its 12px gutter, not 268px.

## Alignment

One center line per row, one start edge down a column. The rules and their reasons are in [Alignment](./alignment.md); in short:

- **A row with boxes and text** (a chip, an avatar, an icon, a word) **centers every part on the row's line box**, with no trimming of the text and no per-engine correction ([A mark that leads text](./alignment.md#a-mark-that-leads-text)).
- **A line of text alone** shares one baseline across sizes and faces ([Text of different sizes on one line](./alignment.md#text-of-different-sizes-on-one-line)).
- **A column shares one start edge**: a panel's title, its filters, its group headings and its rows all start on the panel's margin, and an icon button at either end puts its icon box on it ([The ends of a header](./alignment.md#the-ends-of-a-header)).

## Density and touch targets

How much fits on a screen follows the input, not how much there is to show.

- **Touch targets are 44px, mouse targets at least 32px** ([Hit targets](./spacing.md#hit-targets)); a row of a compact list is 44px by touch and 36px by mouse.
- **When there isn't room, truncate or wrap: never shrink the spacing or the type.** A title ends in an ellipsis, and a trailing group wraps, whole, to a second line. Spacing tighter than the scale makes everything harder to target and to read; the person who wants more on screen picks a smaller message size ([Typography](./typography.md#desktop-and-phone)).
- **A row has at most two lines**, the second only when its trailing group wraps. A third line is a sign the row holds a card's worth of content.

## Hierarchy contrast

A screen has a few levels of text, and each level is clearly apart from the next.

- **Use a few sizes and weights.** On a desktop most text is 14/22 and notes are 12/18; a list row uses one size for its title and one for its notes. Titles stand out by weight, not by a size of their own ([Sizes by use](./typography.md#sizes-by-use)).
- **Separate two levels by at most two of size, weight and color** ([Notes on deeper surfaces](./typography.md#notes-on-deeper-surfaces)). Three differences at once shout.
- **Secondary text is muted or hint, not smaller and smaller.** Numbers, times, counts and group headings are `foreground-hint`; descriptions are `foreground-muted` ([Color tiers](./typography.md#color-tiers)).
- **What a surface is about is set as a title, never as body text.** In a task's details the task's title is a heading (`text-headline` at 600) under the bar that names the dialog; set as plain 16px text it read as weaker than the bar's "Task #1".

## Surfaces

Give content a card or a border only when it is an object of its own.

- **A card is warranted for an object inside a flow of other content**: an attachment, the tasks under a message, a file card. Its edge says "this is one thing, separate from the message around it".
- **A card is warranted for a region beside another region** where no seam is there to separate them, such as the side cards beside a message list.
- **Don't put a card around what already has an edge**: a page, a panel, a dialog, or a phone screen the content fills. On a phone the Tasks card covers the conversation as a page: it has no card, and its lines are inset.
- **Don't give each row a card, and don't nest cards with the same edge.** A card per row turns a list into a stack of controls; a bordered box in a bordered box is a second line where one would do. Group with space and headings first, then with a change of fill, and only then with a line ([Principles](../principles/principles.md#2-three-lines-three-meanings)).
- **Only what floats casts a shadow** ([Elevation](./elevation.md#principles)): a card in the layout is marked by its edge alone.

## Related

- [Spacing](./spacing.md): the scale, hit targets and layout widths.
- [Alignment](./alignment.md): what lands on a margin or a center line.
- [Typography](./typography.md): the type scale and the text tiers.
- [Elevation](./elevation.md): what floats and casts a shadow.
- [Tasks](../patterns/tasks.md#rows-in-a-compact-list): the compact rows these rules were first written for.
