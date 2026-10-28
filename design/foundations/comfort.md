---
title: Visual comfort
summary: The rules that keep a screen calm to read all day — where a line goes and how far it runs, spacing rhythm, insets, alignment, density, contrast between levels of text, and when a surface gets a card.
---

# Visual comfort

People keep Raft open all day, so a screen has to be easy to read at a glance and restful to look at for hours. Comfort comes from a few relationships the eye checks without being asked: what belongs together, where a thing starts and ends, and what matters most. Each rule below is one sentence with the reason behind it; the values come from [Spacing](./spacing.md), [Alignment](./alignment.md), [Typography](./typography.md), [Color](./color.md#lines) and [Elevation](./elevation.md), and this page says how they work together.

## Principles

- **A line runs as far as its container visibly goes.** Inside a bordered box it meets the border; without a visible edge it is inset to the content ([Separators](#separators)).
- **Closer inside a group than between groups.** Every space comes from the spacing scale ([Spacing rhythm](#spacing-rhythm)).
- **The same inset from every edge.** Nested insets add up ([Edges](#edges)).
- **Text on one baseline, marks centered; one start edge per column** ([Alignment](#alignment)).
- **Density follows the input, never the content.** A row of a compact list stays at least 44px by touch and 36px with a mouse ([Density](#density-and-touch-targets)).
- **Few levels of text, far apart.** Secondary text is muted, not small ([Hierarchy](#hierarchy-contrast)).
- **A card is for an object that sits inside other content.** A region beside another region takes a seam, and a group takes space, not a card ([Surfaces](#surfaces)).

## Separators

A line separates siblings inside a container, so it spans what that container visibly bounds. These rules are for the compact lists: the task rows under a message and in the Tasks section, and the rows of the Files section ([Rows in a compact list](../patterns/tasks.md#rows-in-a-compact-list)). Other lists keep their own dividers (the end of this section).

- **Inside a bordered box, run the line edge to edge, so it meets the border on both sides.** The box and its lines then make one set of cells. A line that stops short of the border leaves a gap at each end, and the box reads as a frame with scratches in it. The tasks under a message sit in such a box: their lines meet its border ([Tasks](../patterns/tasks.md#rows-in-a-compact-list)).
- **Without a visible edge, inset the line at both ends to the content: from where the text starts to where the last mark ends.** With nothing to meet, a full-width line reads as the edge of a region, a seam, and cuts the page into strips. A line that starts and ends with the content belongs to the content. A list inside a larger card or a side section, and the phone page a side section becomes, have no edge of their own around the list, so their lines are inset: 20px from each side of a side section and 16px from each side of the phone screen.
- **The container is the nearest one with a visible edge that holds only these siblings.** A box that holds nothing but the rows is the rows' container. A card or side section that also holds a header, filters and group headings is not: there the list is one part among others, has no edge of its own, and its lines are inset like the rest of the content. This is why the Tasks section's lines stop 20px from its edges while the box under a message has lines that meet its border.
- **Prefer space to a line where the grouping already reads.** A heading, a gap or a change of fill already separates groups, so put no line between a heading and its rows, above the first row or under the last, or between two groups that have their own headings. A line next to a border, a seam or another line is never needed: two 1px lines side by side read as one 2px line ([Page structure](../patterns/page-structure.md#one-line-between-two-regions)).
- **Hover still fills the whole row.** An inset line is drawn on the row, not by narrowing it, so the row's target and its hover run edge to edge whatever the line does.

What each kind of line means (hairline, seam, ink) is in [Principles](../principles/principles.md#2-three-lines-three-meanings). The other lists keep their dividers as they are today, and this rule doesn't change them: an [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) list (Activity) and a [ListRow](../../packages/ui/src/components/list-row/list-row.md) list start their line at the text and run it to the right edge, and ListRow's settings variant, rows in an inset card, starts its lines 16px in rather than at the card's border. Don't copy those dividers into a new compact list.

## Spacing rhythm

Put things that belong together closer to each other than to anything else, with every space taken from the one scale.

- **Take every space from the scale in [Spacing](./spacing.md#spacing)**, its half steps included. A value off it (5px, 14px, 18px) is a sign that something is being nudged instead of laid out.
- **Make the space between groups about twice the space inside one, or more.** Proximity is how the eye groups things before it reads them. When the gaps are close in size, nothing groups, and the screen reads as an even gray.
- **Keep a heading clearly closer to what it names than to what comes before it**: a status heading in the Tasks section has the Sidebar section header's spacing, 16px above its words and 6px below, and the groups have no gap of their own, so its words are noticeably farther from the rows above (about 25px) than from its own (16px). A heading as far from the rows above as from its own looks as if it belonged to both. Where the heading is a toggle, let its touch target reach into the space above it rather than push it away from its rows.
- **A row's own padding counts.** Measure a gap between letters and marks, not between boxes: a 36px row with 14px of text already has 11px of space above and below its letters.

## Edges

Content keeps the same inset from every edge of its container, so the container looks centered around it.

- **Inset the first and the last visible thing by the same amount**: the first letter or the leading mark on the left, the last icon box or word on the right ([Alignment](./alignment.md#usage)). A file row in the Files section starts its type icon 20px from the section's left edge and ends its last action's icon box 20px from the right, its hit area hanging outward, so the row sits centered in the section ([Rows in a compact list](../patterns/tasks.md#rows-in-a-compact-list)). Placed by the buttons' boxes instead, the actions would end further in than the icon starts, and the row would look pushed to one side, even if nobody could say why.
- **A small mark in a wider box moves the edge.** A 32px icon button placed by its own edge puts its 18px icon 7px inside the inset, and a 44px Back puts its 22px icon 11px inside the content below it. Land the mark on the inset and let the rest of the box hang outward ([The ends of a header](./alignment.md#the-ends-of-a-header)).
- **A frameless button at the end of a bar lands by its words or its icon box**, its padding hanging outward: Mark All Read at the right of Activity's filters ends its letters on the margin the rows' times end on ([Alignment](./alignment.md#usage)).
- **Nested insets add up.** A container inside another starts at the outer inset, and its own content at the inner inset on top of that: a box under a message starts on the message's text column, and its rows start 12px inside the box. Don't cancel an inset with a negative margin to make the numbers come out; change the container. The one exception is hanging padding: a shape beside plain text, such as a chip among the values of an inline DescriptionList, is pulled out by its own padding, so its words start where plain text would and its fill hangs outward ([A shape beside plain text](./alignment.md#a-shape-beside-plain-text)).
- **A container that has to be a minimum width keeps it after its margins.** The minimum is set by what the container has to hold, such as a row's title and its trailing group; a gutter around it is space around the container, not room for its content, so taking the gutter out of the minimum would shrink the very thing the minimum protects.

## Alignment

Where each part of a row and of a column lands is set in [Alignment](./alignment.md), with its reasons; this page adds no rule of its own. The rows these rules were written for follow it as they are:

- A task row, a file row and a line of properties put their texts of different sizes on one baseline ([Text of different sizes on one line](./alignment.md#text-of-different-sizes-on-one-line)) and center their marks without text, the avatars, pixels, chevrons and icons ([A mark that leads text](./alignment.md#a-mark-that-leads-text)).
- A panel's title, its filters, its group headings and its rows start on the panel's margin ([The ends of a header](./alignment.md#the-ends-of-a-header)).

## Density and touch targets

How much fits on a screen follows the input, not how much there is to show.

- **A row of a compact list is at least 44px by touch and 36px with a mouse** ([Rows in a compact list](../patterns/tasks.md#rows-in-a-compact-list)). The sizes of controls and their hit areas are in [Spacing](./spacing.md#hit-targets).
- **When there isn't room, truncate or wrap: never shrink the spacing or the type.** A title ends in an ellipsis, and a trailing group wraps, whole, to a second line. Spacing tighter than the scale makes everything harder to target and to read; the person who wants more on screen picks a smaller message size ([Typography](./typography.md#desktop-and-phone)).
- **A row has at most two lines**, the second only when its trailing group wraps. A third line is a sign the row holds a card's worth of content.

## Hierarchy contrast

A screen has a few levels of text, and each level is clearly apart from the next.

- **Use a few sizes and weights.** On a desktop most text is 14/22 and notes are 12/18; a list row uses one size for its title and one for its notes. Inside a list or a card, a title stands out by weight, not by a size of its own; only the title of a whole surface, a page, a panel or a dialog, takes the type scale's headline ([Sizes by use](./typography.md#sizes-by-use)).
- **Separate two levels by at most two of size, weight and color** ([Notes on deeper surfaces](./typography.md#notes-on-deeper-surfaces)). Three differences at once shout.
- **Secondary text is muted or hint, not smaller and smaller.** Numbers, times, counts and group headings are `foreground-hint`; descriptions are `foreground-muted` ([Color tiers](./typography.md#color-tiers)).
- **What a surface is about is set as a title, never as body text.** In a task's details the task's title is the surface's title, so it takes the headline (`text-headline`), at 600 under the 700 bar that names the dialog; set as plain 16px text it read as weaker than the bar's "Task #1".

## Surfaces

Give content a card or a border only when it is an object of its own.

- **A card is warranted for an object inside a flow of other content**: an attachment, the tasks under a message, a file card. Its edge says "this is one thing, separate from the message around it".
- **A region beside another region takes a seam, not a card**: a channel's side sections stand in columns with a `line-seam` edge, flat, as a thread does ([The channel's side columns](../patterns/responsive.md#the-channels-side-columns)).
- **Don't put a card around what already has an edge**: a page, a panel, a dialog, or a phone screen the content fills. On a phone the Tasks section covers the conversation as a page: it has no card, and its lines are inset.
- **Don't give each row a card, and don't nest cards with the same edge.** A card per row turns a list into a stack of controls; a bordered box in a bordered box is a second line where one would do. Group with space and headings first, then with a change of fill, and only then with a line ([Principles](../principles/principles.md#2-three-lines-three-meanings)).
- **Only what floats casts a shadow** ([Elevation](./elevation.md#principles)): a card in the layout is marked by its edge alone.

## Related

- [Spacing](./spacing.md): the scale, hit targets and layout widths.
- [Alignment](./alignment.md): what lands on a margin or a center line.
- [Typography](./typography.md): the type scale and the text tiers.
- [Elevation](./elevation.md): what floats and casts a shadow.
- [Tasks](../patterns/tasks.md#rows-in-a-compact-list): the compact rows these rules were first written for.
