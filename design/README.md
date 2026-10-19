---
title: Raft Design System
summary: The design language of every Raft product — its materials, its principles, and how the guidelines are organized.
---

# Raft Design System

The Raft Design System is the design language of every Raft product: Raft Chat today, and Tasks, Calendar, Artifacts, Sites, Meeting and Canvas next. Raft is a shared workspace for many people, many agents and many screens, where people and agents chat, hand off work, write, meet and ship in the same place.

The system keeps a few things from the brutal style of the Raft website: the yellow, the ink lines, the square pixels, Space Grotesk and Space Mono. It uses them differently. The website wants to be remembered at a glance; the product is used for hours a day, so brand color goes only in a few fixed places. In one line: **yellow goes on the frame, and content sits on white paper.**

Structure and behavior follow the product code: the Raft web app, raft-ui, the product's visual test scenarios and the product decisions recorded in its code. Color, lines, shape and where the brand appears are decided here. Where the system deliberately differs from the product code, the difference has a [decision record](./decisions/).

The system is two things: the guidelines in this folder and in each component's doc, and [raft-ui](../packages/ui/), the React components that implement them. Product code uses raft-ui.

## The guidelines

| Section | What it covers |
| --- | --- |
| [Foundations](./foundations/) | The values and the rules for using them: [color](./foundations/color.md), [typography](./foundations/typography.md), [spacing](./foundations/spacing.md), [alignment](./foundations/alignment.md), [shape](./foundations/shape.md), [elevation](./foundations/elevation.md), [motion](./foundations/motion.md), [states](./foundations/states.md), [iconography](./foundations/iconography.md), [brand](./foundations/brand.md), [dark mode](./foundations/dark-mode.md) and [writing](./content/writing.md) |
| Components | One doc per component, next to its code in `packages/ui/src/components/<component>/<component>.md` |
| [Patterns](./patterns/) | How components combine into screens, in every Raft product: page structure, navigation, agents, tasks, conversation, forms, feedback, responsive layout, and choosing a component |
| [Products](./products/) | Structure that belongs to one product only: its destinations, its screens and what goes where. [Raft Chat](./products/raft-chat/README.md) first |
| [Decisions](./decisions/) | Why the system chose one option over another, and the questions still open |

Rules that hold for every product (color, components, page structure, navigation) are in the foundations, the component docs and the patterns. The structure of one product ("which four destinations the phone tab bar shows", "what the first three rows of Home are") is on that product's page. Each new product adds its own page.

How the docs are written and organized is in [Authoring](./authoring/README.md).

## Materials

- **Paper**: the background content sits on. Content is white; the desktop sidebar is the website's cream.
- **Ink**: the color of text and of control borders.
- **Stickers**: every block of color (avatars, selection, location, the primary action) has an ink edge.
- **The frame**: the top bar of a phone's top-level pages, the desktop rail, and the web app's top bar with search. It has the website's yellow. Color steps down from the outside in: yellow, then cream, then white.

## Principles

1. **Yellow goes on the frame only.** The frame is on every screen but nobody reads it, so color there costs almost nothing; everything people read sits on paper. In dark mode the frame is a neutral dark. See [Color](./foundations/color.md) and [Page structure](./patterns/page-structure.md).
2. **Three lines, three meanings.** A hairline inside content, a seam between regions, an ink border on controls. An ink border means "this is a control". See [Color](./foundations/color.md#lines).
3. **A block of color is a sticker.** Every block of brand color has a 1.5px ink edge and ink type, and doesn't invert in dark mode. Soft tints are highlights and have no edge. Controls have no shadow. See [Color](./foundations/color.md#stickers) and [Elevation](./foundations/elevation.md).
4. **Yellow is you, pink is to do, notices are neutral.** Yellow is where you are, what you selected, what calls you and what you searched for. Pink is at most one primary button per screen, and what waits for you. The item singled out in content is cyan. See [Color](./foundations/color.md#meanings-of-color).
5. **Status colors have fixed meanings.** Five task statuses, five presence lights, none of them blinking. Something going wrong is orange; red is only for consequences that cannot be undone. See [Color](./foundations/color.md#statuses).
6. **Square is Raft.** Every identity is a square sticker, and every dot is a square pixel. Round is only for switches and radios, which follow platform convention. See [Shape](./foundations/shape.md).
7. **No all caps.** Clickable text is Title Case, everything else is sentence case, and hierarchy comes from size, weight and color. Space Grotesk is what people say; Space Mono is what machines write. See [Typography](./foundations/typography.md).

## Before you build something new

1. Does every product need this, or only one? The first follows the [patterns](./patterns/); the second goes on that product's page. Either way, look first at how the product already does it.
2. Is it content, a region or a control? That decides which line it uses.
3. Which is the screen's primary action? Only that one is pink, and a screen may have none.
4. Is this color an identity, a status, a signal or a consequence? If it is none of these, remove it.
5. Does it work in dark mode, at 320px wide, and with the keyboard alone?
6. Will it tire someone who looks at it for hours? If so, remove color first, then lines, then motion.

## Building with the system

- Use real elements. Anything clickable is a `<button>` or an `<a>` with an `href`; checkboxes and radios hold a native input; a switch is a button with `role="switch"`.
- Give every icon-only button an `aria-label`.

## Files

| Path | What it is |
| --- | --- |
| `fonts/` | Space Grotesk and Space Mono |
| `assets/` | The logos, the agents' pixel avatars and the reactions, as SVG with notes |
