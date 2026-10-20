---
title: Why Raft looks this way
summary: Where Raft's look comes from, why the product turns the brand down for all-day use, the materials every screen is made of, and what one tone across the product line means.
order: 1
---

# Why Raft looks this way

Raft is a workspace where people and agents chat, hand off work, write, meet and ship in the same place, and people keep it open for most of their working day. Its look starts from the brutal style of the Raft website and keeps the same materials, but uses them as quietly as an all-day tool needs: brand color only where it carries a meaning, and white paper wherever people read. This page explains that reasoning, so that a new screen or a new product can follow it without a rule for every case. The rules themselves are in [Principles](./principles.md).

## Where it comes from

The Raft website at [raft.build](https://raft.build) is brutal: a flat yellow field, thick ink lines, square pixels, hard offset shadows, halftone dots, Space Grotesk for text and Space Mono for anything a machine wrote. It is built to be remembered at a glance, by someone who sees it once.

The product keeps those materials. The yellow, the ink line, the square pixel and the two typefaces are recognizably the same ones; the pixel avatars of agents, the drawn reactions and the square presence lights all come from the same pixel grid. A person who arrives from the website should know they are in the same place.

## Why the product turns the volume down

The product is not seen once. People read it for hours, every day, often with several agents working on the same screen. Every saturated color, heavy line and moving thing is paid for again each minute it is on screen, and whatever the brand spends on decoration it takes away from the signals people need: what is selected, what waits for them, what went wrong.

So the product keeps the website's materials and spends them only where they say something. In practice:

- **Yellow moves to the frame.** The outer chrome is on every screen but nobody reads it, so it can carry the brand at almost no cost. Everything people read sits on white.
- **Lines are lighter and fewer.** Regions are separated by one 1px seam at 45% ink: 2px black lines cut a screen into boxes. The ink border is kept for controls, where it means something ([0009](../decisions/0009-seams-and-no-control-shadows.md)).
- **Controls have no hard shadow.** A control already says "press here" with its ink border; a shadow would be a fourth signal, doesn't show in dark mode, and a press that moves the control shakes its neighbors. The hard shadow stays for brand illustration only ([0009](../decisions/0009-seams-and-no-control-shadows.md)).
- **Saturated color shrinks to a pixel.** A screen can hold a dozen status chips, so each one is a soft tint with one square pixel of saturated color ([Color](../foundations/color.md#soft-tints)).
- **Status stands still.** A breathing presence light makes the page render at the screen's refresh rate (measured at 144fps and 80% GPU with a dialog open, against 2fps and 3% once stopped), and a dozen pulsing avatars get in the way of reading. A working agent is a still yellow light and a sentence ([0006](../decisions/0006-working-agents-in-place.md)).
- **Overlays don't perform.** Dialogs and other centered overlays appear in place, without animation; only the drawer slides, because the slide says where it came from ([Motion](../foundations/motion.md#usage)).

The brand doesn't disappear; it is placed by how close a page is to a first impression. Working pages (lists, conversations, tasks, settings, empty states) get the frame and small stickers. A profile and the last step of a server's setup add the large pixel sticker with its hard shadow. Sign-in and the pages that create an account or a server add the logo, halftone and the tilted preview. The closer to a first impression, the more of the website a page may use ([Brand](../foundations/brand.md#how-much-brand)).

## The materials, from outside to inside

Every Raft screen is made of the same four materials, and color steps down from the outside in: yellow, then cream, then white.

| Material | What it is | Why |
| --- | --- | --- |
| **Frame** | The outer chrome: the desktop rail, the web top bar, the top bar of a phone's top-level pages. Yellow in light mode, a neutral dark in dark mode. It shows your server, not the Raft logo | It is on every screen and never read, so it carries the brand without costing attention. In dark mode a yellow frame would be the brightest thing on the screen, which is what dark mode exists to avoid ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)) |
| **Paper** | The background content sits on: white for content, the website's cream for the desktop sidebar | Reading happens here, so it has the least color. The cream sidebar is the one step between the frame and the paper |
| **Ink** | The color of text and of control borders. Lines, secondary text and pressed overlays are translucent steps of the same ink | One dark color for everything people read and press keeps the screen calm, and makes the ink border a reliable sign of "this is a control" |
| **Stickers** | Every block of brand color (avatars, the selected item, the location tile, the primary button, badges) has a 1.5px ink edge and ink type | Sticker colors are only 1.4:1 to 2.8:1 apart from paper, so without an edge a block of color doesn't hold its shape. The edge makes it read as a cut-out shape stuck on the page, as on the website |

Two consequences follow from the materials, and they decide many small cases:

- **Stickers are the same in both modes.** A pink button, a square avatar and ink type look the same in dark mode; dark mode changes only surfaces, ink, lines and tints, and adds a die-cut edge around each sticker so it still separates from the dark surface ([0023](../decisions/0023-stickers-in-dark-mode.md), [Dark mode](../foundations/dark-mode.md)). Components don't switch styles between modes.
- **Square belongs to the pixel family; soft belongs to containers.** Identities and dots are square pixels, like the website's pixels. Cards, menus and dialogs have soft radii. Only switches and radios are round, because people recognize them by that shape, and the phone's floating tab bar, which follows the phone's own floating controls ([Shape](../foundations/shape.md)).

## People and agents in one place

Raft is built for people and agents working together, and the look supports that directly:

- Agents and people use the same messages, the same rows and the same square avatars. The face says who it is; an agent's face is its pixel avatar, so the shape doesn't need to say it again ([0023](../decisions/0023-stickers-in-dark-mode.md)).
- Both profiles use the same 99px avatar on the same page ([Identity and presence](../people-and-agents/identity-and-presence.md#the-same-as-people)): agents and people are equals.
- Space Grotesk sets what people say; Space Mono sets what machines write: IDs, times, counts, runtimes and event lines such as "Bugen claimed #25". A reader can tell at a glance which is which.
- What an agent is doing is written where the agent already appears (its row, the place it works in, its avatar's light), not in a separate live bar that changes all the time ([0006](../decisions/0006-working-agents-in-place.md)).
- Agents are named and described with teammate verbs (claim, hand off, review, ship), never as "AI" or "bot", and never marked with sparkles ([Writing](../content/writing.md#voice), [Iconography](../foundations/iconography.md)).

How agents are shown in detail is in [People and agents](../people-and-agents/README.md) and [Agents](../people-and-agents/README.md).

## One tone across the product line

Raft Chat is the first product; Tasks, Calendar, Artifacts, Sites, Meeting and Canvas follow. "One tone" means that a person moving from one product to another doesn't have to learn a new language. In practice, every product shares:

- the materials and the order of color from the outside in: frame, sidebar, paper;
- the meaning of each color: yellow is you, pink is to do, cyan is this item, orange interrupts, red is irreversible, and the five task statuses and five presence lights mean the same everywhere ([Color](../foundations/color.md#meanings-of-color));
- the meaning of each line: a hairline inside content, a seam between regions, an ink border on a control;
- the shapes, the type roles, the states, the motion rules and the voice of the words;
- the components: a menu, a dialog, a status chip or an avatar is the raft-ui one in every product.

What each product decides for itself is its structure: which destinations it has, what each screen shows and what goes where. That lives on the product's own page under [Products](../products/), not in the shared rules.

So a new product doesn't get its own accent color, its own button style, its own dark theme or its own way of showing that an agent is working. It gets its own destinations and screens, built from the same materials. A fair test: put a screen of the new product next to a screen of Raft Chat. The frame, the paper, the stickers and the meaning of each color should match; only the content and the structure should differ.

## Related

- [Principles](./principles.md): the rules this reasoning leads to.
- [Designing a new feature](./designing-a-new-feature.md): how to apply them to new work.
- [Brand](../foundations/brand.md): how much brand each kind of page may use.
- [Page structure](../patterns/page-structure.md): where the frame, sidebar and paper are on each screen.
- [Decisions](../decisions/): the major choices, and the alternatives they were weighed against.
