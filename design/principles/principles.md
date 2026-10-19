---
title: Principles
summary: The seven rules every Raft screen follows, each with the reasoning that lets you apply it to a case the docs don't cover.
order: 2
---

# Principles

Seven rules hold on every screen of every Raft product. Each one is short enough to check in review, and each comes with its reason, because a rule without a reason gets broken the first time it is inconvenient. When a case isn't covered anywhere in the docs, the reasons decide it. Where the look comes from is in [Why Raft looks this way](./why-raft-looks-this-way.md); how to use these rules on new work is in [Designing a new feature](./designing-a-new-feature.md).

The numbers are stable: other pages refer to a principle by its number.

## 1. Yellow goes on the frame only

The frame (the desktop rail, the web top bar, the top bar of a phone's top-level pages) is yellow. Everything people read sits on paper. In dark mode the frame is a neutral dark.

**Why.** The frame is on every screen, but nobody reads it, so color there carries the brand at almost no cost to attention. Content is read for hours; a saturated yellow behind text tires the eye and leaves no room for yellow to mean anything else. Keeping yellow off the content is also what lets yellow mean "you" (principle 4): a selected row can only stand out if the page around it isn't yellow. In dark mode the frame turns neutral because dark mode exists to bring brightness down, and a yellow frame would be the brightest thing on the screen ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)). A web top bar is part of the frame, not content, so it is yellow like the rail ([Page structure](../patterns/page-structure.md#the-web-top-bar)).

To apply it to something new, ask whether people read it or whether it holds the screen together. Chrome that is on every screen and holds no content is frame; a panel, a page or a card that people read is paper.

Applied in: [Color](../foundations/color.md#principles), [Page structure](../patterns/page-structure.md#layers-from-the-outside-in), [Brand](../foundations/brand.md#how-much-brand), [Dark mode](../foundations/dark-mode.md#what-changes).

## 2. Three lines, three meanings

A hairline sits inside content, a seam sits between regions, and an ink border marks a control. Two regions are separated by exactly one line.

**Why.** Lines are read as structure, so each kind of line answers one question: a hairline says "these items belong together", a seam says "one region ends here", and an ink border says "you can press or type here". If a card had an ink border it would look clickable; if regions were separated by heavy black lines the screen would read as a stack of boxes ([0009](../decisions/0009-seams-and-no-control-shadows.md)). The seam is 45% ink because, of the values tried, it is the lightest that passes 3:1 on white, and on the yellow frame it reads as a dark gold; at 50% it starts to look like a control's border. Two 1px lines side by side read as one 2px line, which is why only one region owns the line between two regions.

To apply it, name the boundary before you draw a line. If it isn't inside content, between regions or around a control, it doesn't need a line; change the fill or the spacing instead.

Applied in: [Color](../foundations/color.md#lines), [Shape](../foundations/shape.md#stroke-widths), [Page structure](../patterns/page-structure.md#one-line-between-two-regions).

## 3. A block of color is a sticker

Every block of brand color has a 1.5px ink edge and ink type, and doesn't invert in dark mode. Soft tints are highlights and have no edge. Controls have no shadow.

**Why.** Sticker colors are only 1.4:1 to 2.8:1 apart from paper, so without an edge a block of color doesn't hold its shape. Ink type on a sticker reaches at least 6.8:1, where white type on pink reaches 2.4:1 ([0014](../decisions/0014-pink-unread-with-ink.md)). A sticker stays the same in both modes, so a pink button or an avatar is one thing everywhere; dark mode adds a die-cut edge instead of changing the sticker, and components never switch styles ([0023](../decisions/0023-stickers-in-dark-mode.md)). Soft tints exist for the opposite case: a screen can hold a dozen status chips, and a tint with one saturated pixel keeps that screen quiet ([Color](../foundations/color.md#soft-tints)). Controls have no shadow because "press here" is already said by the ink border, the pink and the one-per-screen rule; a shadow is a fourth signal, doesn't show in dark mode, and a press that moves the control shakes what is next to it ([0009](../decisions/0009-seams-and-no-control-shadows.md)).

To apply it, decide whether the color is a thing (a sticker: edge, ink type, same in both modes) or a highlight behind a thing (a soft tint: no edge). Only things that float above the page cast a shadow, and all of them cast the same soft one.

Applied in: [Color](../foundations/color.md#stickers), [Dark mode](../foundations/dark-mode.md#the-die-cut-edge), [Elevation](../foundations/elevation.md#principles).

## 4. Yellow is you, pink is to do, notices are neutral

Yellow is where you are, what you selected, what calls you and what you searched for. Pink is at most one primary button per screen, and what waits for you. The item singled out in content is cyan. Toasts and tooltips are neutral dark.

**Why.** When each color has one meaning, a color on screen always tells the person something, and they learn it once for every product. The meanings are chosen so they never compete:

- Selection has three meanings, so it has three looks: where you are in navigation is yellow, the item singled out in content is cyan, and a chosen value is ink. If all three were yellow, opening a list would fill it with yellow ([0011](../decisions/0011-yellow-navigation-selection.md), [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md#states)).
- Pink marks one primary action, so a second pink button removes the primary action instead of adding one. Unread is pink, not yellow, because yellow is also the busy light of a working agent ([0014](../decisions/0014-pink-unread-with-ink.md)).
- A notice is an aside. A yellow toast would compete with selection, so toasts and tooltips are neutral, and no button is yellow ([Color](../foundations/color.md#principles)).
- Meaning wins over placement: in dark mode the frame is neutral, but the selected rail item is still a yellow sticker, because "you are here" is not part of the frame ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).

To apply it, say which meaning a new use of color has: you, to do, this item, interrupts or irreversible, or an identity or a status. If it has none of them, remove the color.

Applied in: [Color](../foundations/color.md#meanings-of-color), [States](../foundations/states.md#usage), [Button](../../packages/ui/src/components/button/button.md).

## 5. Status colors have fixed meanings

Five task statuses and five presence lights, each with one color, none of them blinking. Something going wrong is orange; red is only for consequences that cannot be undone.

**Why.** Statuses are read at a glance, across many rows, screens and products, so their colors have to mean the same thing everywhere and stay the same over time; `presence-busy` even has its own value, so that a change of brand color doesn't change what busy looks like. Red is kept for what cannot be undone so that it still stops people at a delete button; if every error were red, the one irreversible action would look like everything else, so recoverable problems, warnings and actions that stop or reset are orange. Status never moves on its own: a looping animation makes the page render at the screen's refresh rate (144fps and 80% GPU against 2fps and 3% once stopped), and a dozen pulsing avatars get in the way of reading ([0006](../decisions/0006-working-agents-in-place.md)). A working agent is a still yellow light and a sentence about what it is doing.

To apply it, map a new state to an existing status before inventing a color. A state that loops or blinks needs another way to show itself: words, or a change that happens once.

Applied in: [Color](../foundations/color.md#statuses), [Motion](../foundations/motion.md#principles), [Agents](../people-and-agents/working-agents.md#where-working-shows).

## 6. Square is Raft

Every identity is a square sticker, and every dot is a square pixel. Round is only for switches and radios, which follow platform convention.

**Why.** The square pixel is the brand's own shape, from the website's pixel grid to the agents' 8×8 faces, and it is what makes a Raft screen recognizable when the color is turned down. People and agents both have square avatars: the face already says who it is, so the shape doesn't need to say it again ([0023](../decisions/0023-stickers-in-dark-mode.md)). Dots and the spinner are square for the same reason ([Shape](../foundations/shape.md#principles)). Pixels are hard and containers are soft: cards, menus and dialogs have radii, because they hold content rather than stand for something. Switches and radios are the exception because people recognize them by their round shape; a square switch isn't read as a switch ([Switch](../../packages/ui/src/components/switch/switch.md#rules)).

To apply it, ask whether the new element stands for someone or something (square, from the pixel family), holds content (a soft container radius), or is a control people know only by its round shape (round, and there are two).

Applied in: [Shape](../foundations/shape.md#radii), [Avatar](../../packages/ui/src/components/avatar/avatar.md), [Spinner](../../packages/ui/src/components/spinner/spinner.md).

## 7. No all caps

Clickable text is Title Case, everything else is sentence case, and hierarchy comes from size, weight and color. Space Grotesk is what people say; Space Mono is what machines write.

**Why.** All caps removes the shape of words, which makes them slower to read, and Chinese has no case, so in mixed text capitalized English stands out more than intended ([0002](../decisions/0002-no-all-caps.md)). Title Case is kept for what people can click, so casing itself tells them what is a control. The two typefaces separate two voices: messages, labels and titles in Space Grotesk; IDs, times, counts, runtimes, event lines and code in Space Mono. In a workspace where agents write as much as people, that lets a reader tell at a glance what a person said from what a machine produced, even inside one sentence ("Bugen claimed #25").

To apply it, set anything a machine produced in Space Mono, anything clickable in Title Case and everything else in sentence case, and make a heading stand out by size or weight, never by capitals.

Applied in: [Typography](../foundations/typography.md#casing), [Writing](../content/writing.md#casing).

## When principles pull apart

The principles rarely conflict, and when they seem to, the system resolves them the same way:

- **Meaning comes before placement.** A yellow sticker that means "you are here" stays yellow on a neutral dark frame ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).
- **Legibility comes before the exact brand value.** Pink is lighter than the product's original pink so ink on it reaches the contrast of the other stickers ([0001](../decisions/0001-softer-pink.md)); tertiary and error text are adjusted until they pass 4.5:1 on every surface ([Color](../foundations/color.md#contrast)).
- **Less comes before more.** When a screen tires the eye, remove color first, then lines, then motion.

## Related

- [Why Raft looks this way](./why-raft-looks-this-way.md): the character these rules come from.
- [Designing a new feature](./designing-a-new-feature.md): the questions and the checklist built on these rules.
- [Decisions](../decisions/): the major choices, and the alternatives they were weighed against.
