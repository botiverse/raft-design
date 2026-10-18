---
title: Brand
summary: How much of the brand each kind of page may use, and the rules for the logo and the drawn reactions.
---

# Brand

Raft keeps a few things from the brutal style of its website: the yellow, the ink lines, the square pixels, Space Grotesk and Space Mono. The website wants to be remembered at a glance; the product is used for hours a day. So the working product puts brand color only in a few fixed places, and the closer a page is to a first impression, the more of the website it may use.

## Principles

- **The working product uses the least brand.** Lists, conversations, tasks, settings and empty states get the frame and small blocks of color, nothing more.
- **Brand illustration stays out of working pages.** Large stickers, hard shadows, halftone and logos appear only on profile and brand pages.
- **Your workspace is on the frame, not the logo.** The frame of a working page shows your workspace (the workspace pill on a phone's Home, the tile at the top of the desktop rail), never the Raft mark.

## How much brand

Each row adds to the row above it.

| Page | May use |
| --- | --- |
| Working pages: lists, conversations, tasks, settings, empty states | The yellow frame, the workspace pill, at most one pink primary action, ink-bordered controls, small blocks of color such as avatars and presence lights |
| The profile of one agent or person | Also: a large pixel sticker, the hard sticker shadow (`shadow-sticker`), slow floating ([Motion](./motion.md)) |
| Onboarding, sign-in, marketing pages inside the product | Also: a full-screen yellow, halftone dots, the 40px headline (`text-hero`), an all-caps step label, the logo |

The further down the table, the closer to the website. Nothing from the last two rows appears on a working page, including its empty states.

## Logo

| File | Use on |
| --- | --- |
| `raft-logo.svg` | Light backgrounds |
| `raft-logo-yellow.svg` | Dark backgrounds (the website's footer colors) |
| `raft-mark.svg`, `raft-mark-yellow.svg` | The same two backgrounds, mark only |

The files are in [`design/assets/Logos`](../assets/Logos/). raft-ui exports the mark as `RaftLogo`, the wordmark as `RaftWordmark` and the two together as `RaftLogoLockup`.

- Use the ink outline on light backgrounds and the yellow outline on dark ones. The logo is two-color artwork: change the file, not its CSS `color`.
- Put the mark straight on a yellow background, without a tile behind it.
- Show the logo only on brand pages: onboarding, sign-in and loading screens.
- Don't put the mark on the frame of a working page.

## Reactions

The 7 quick reactions are Raft's own drawings: thumbs_up, heart, party_popper, eyes, fire, joy and check_mark. They are in [`design/assets/Reactions`](../assets/Reactions/).

- Draw them on a 24px grid with a 2px ink line. Take every fill from the palette (yellow, cyan, orange, red, lavender, lime, pink), and draw highlights as white square pixels.
- In dark mode, add the die-cut edge around them, as on stickers ([Dark mode](./dark-mode.md)).
- Size them at 16px in a reaction, 22px among the quick reactions of a menu, and 18px on their own.
- Use the system emoji for every other reaction. Don't draw more.
- Hide the drawing from assistive technology and give the button that holds it an `aria-label`.

## Related

- [Color](./color.md): the meanings of the brand colors.
- [Page structure](../patterns/page-structure.md): where the frame is.
- [Raft Chat](../products/raft-chat/README.md): the onboarding and agent profile screens.
