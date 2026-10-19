---
title: Brand
summary: How much of the brand each kind of page may use, and the rules for the logo and the drawn reactions.
redirectFrom: [decisions/0008-reactions-in-palette]
---

# Brand

Raft keeps a few things from the brutal style of its website: the yellow, the ink lines, the square pixels, Space Grotesk and Space Mono. The website wants to be remembered at a glance; the product is used for hours a day. So the working product puts brand color only in a few fixed places, and the closer a page is to a first impression, the more of the website it may use.

## Principles

- **The working product uses the least brand.** Lists, conversations, tasks, settings and empty states get the frame and small blocks of color, nothing more.
- **Brand illustration stays out of working pages.** The large sticker with the hard shadow appears only on profiles and the last setup step; halftone, the tilted preview and the logo only on sign-in and on the pages that create an account or a server.
- **Your server is on the frame, not the logo.** The frame of a working page shows your server (the workspace pill on a phone's Home, the workspace button and strip in the web top bar), never the Raft mark.

## How much brand

Each row adds to the row above it.

| Page | May use |
| --- | --- |
| Working pages: lists, conversations, tasks, settings, empty states | The yellow frame, the workspace pill, at most one pink primary action, ink-bordered controls, small blocks of color such as avatars and presence lights |
| The profile of one agent or person, and the last step of a server's setup | Also: the 99px pixel sticker with the hard sticker shadow (`shadow-sticker`). On a profile it stays still; on the setup's last step it hops once ([Motion](./motion.md#usage)) |
| Sign-in and sign-up | Also: the logo, in a 56px frame bar above a white page, and the Raft mark above the form's title |
| Creating an account or a server | Also: from 1024px, a brand pane beside the form, on the frame color, with halftone dots (1.5px `line-seam` dots on a 14px grid) behind a preview of the new server, tilted −1° with the hard sticker shadow. The logo sits at the top left of the form. Below 1024px, the same frame bar as sign-in above a plain form |
| The website, raft.build | Also: full yellow sections, 2px ink lines, one pink primary action per section, the hard shadow and a hover lift on buttons, all-caps mono labels, floating stickers and animated drawings. Only on the website, never in the product; see [Website](../products/website/README.md) |

The further down the table, the closer to the website. Nothing from the last four rows appears on a working page, including its empty states. The setup of a new server, which runs as dialogs over the server's pages, is a working page apart from its last step ([Onboarding](../products/raft-chat/onboarding.md)).

- Set a sign-in page's title in `text-title`, and the title of the page that creates a server in `text-title`, `text-display` from 640px. `text-hero` is used only for the name of the service on the page where a person signs in to another service with Raft (Login with Raft).
- Don't fill the whole screen with yellow, and don't add floating stickers: the product's brand pages use the frame pane above instead.
- Write the step label of the setup in sentence case ("Set up your server"). [0002](../decisions/0002-no-all-caps.md) still allows one all-caps step label on an onboarding screen; the product doesn't use it.

## Logo

| File | Use on |
| --- | --- |
| `raft-logo.svg` | Light backgrounds |
| `raft-logo-yellow.svg` | Dark backgrounds (the website's footer colors) |
| `raft-mark.svg`, `raft-mark-yellow.svg` | The same two backgrounds, mark only |

The files are in [`design/assets/Logos`](../assets/Logos/). raft-ui exports the mark as `RaftLogo`, the wordmark as `RaftWordmark` and the two together as `RaftLogoLockup`.

- Use the ink outline on light backgrounds and the yellow outline on dark ones. The logo is two-color artwork: change the file, not its CSS `color`.
- Put the mark straight on a yellow background, without a tile behind it.
- Show the logo only on brand pages: sign-in, sign-up, the pages that create an account or a server, and loading screens.
- Don't put the mark on the frame of a working page.

## Reactions

The 7 quick reactions are Raft's own drawings: thumbs_up, heart, party_popper, eyes, fire, joy and check_mark. They are in [`design/assets/Reactions`](../assets/Reactions/).

- Draw them on a 24px grid with a 2px ink line. Take every fill from the palette (yellow, cyan, orange, red, lavender, lime, pink), and draw highlights as white square pixels. The product's own set has sage green, light steel blue and cream curved highlights, which are not in the palette; recolored, the reactions speak the same language as stickers and pixel avatars, and every color is readable in both modes.
- In dark mode, add the die-cut edge around them, as on stickers ([Dark mode](./dark-mode.md)).
- Size them at 16px in a reaction, 22px among the quick reactions of a menu, and 18px on their own.
- Use the system emoji for every other reaction. Don't draw more.
- Hide the drawing from assistive technology and give the button that holds it an `aria-label`.

## Related

- [Color](./color.md): the meanings of the brand colors.
- [Page structure](../patterns/page-structure.md): where the frame is.
- [Website](../products/website/README.md): how raft.build uses the system.
- [Raft Chat: Onboarding](../products/raft-chat/onboarding.md) and [Agent profile](../products/raft-chat/agent-profile.md).
