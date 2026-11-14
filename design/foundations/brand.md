---
title: Brand
summary: How much of the brand each kind of page may use, and the rules for the logo, the pixel illustrations and the drawn reactions.
redirectFrom: [decisions/0008-reactions-in-palette]
---

# Brand

Raft keeps a few things from the brutal style of its website: the yellow, the ink lines, the square pixels, Space Grotesk and Space Mono. The website wants to be remembered at a glance; the product is used for hours a day. So the working product puts brand color only in a few fixed places, and the closer a page is to a first impression, the more of the website it may use.

## Principles

- **The working product uses the least brand.** Lists, conversations, tasks, settings and empty states get the frame and small blocks of color, nothing more.
- **Brand illustration stays out of working pages.** The large sticker with the hard shadow appears only on profiles and the last setup step; halftone, the tilted preview and the logo only on sign-in, sign-up and the pages that create an account or a server. The pixel illustrations and the collage go further in only one place: the brand pane of sign-up and of the pages that create an account or a server, never sign-in. A working page is looked at for hours, and a drawing there competes with the content for attention every time; a brand page is seen once or twice, where it sets the mood.
- **The recent-activity card has one small Ottie illustration.** This approved character treatment is a bounded exception, not permission to add brand illustration to other working pages. Keep its four poses and motion consistent with [OtterIndicator](../../packages/ui/src/components/steps/steps.md#ottie-illustration).
- **Your server is on the frame, not the logo.** The frame of a working page shows your server (the workspace button on a phone's Home, the workspace button and strip in the web top bar), never the Raft mark.

## How much brand

Each row adds to the row above it.

| Page | May use |
| --- | --- |
| Working pages: lists, conversations, tasks, settings, empty states | The yellow frame, the workspace button, at most one pink primary action, ink-bordered controls, small blocks of color such as avatars and presence lights |
| The profile of one agent or person, and the last step of a server's setup | Also: the 99px pixel sticker with the hard sticker shadow (`shadow-sticker`). On a profile it stays still; on the setup's last step it hops once ([Motion](./motion.md#usage)) |
| Sign-in | Also: the logo, in a 56px frame bar above a white page, and the Raft mark above the form's title |
| Signing up, and creating an account or a server | Also: from 1024px, a brand pane to the right of the form, on the frame color, with halftone dots (1.5px `line-seam` dots on a 14px grid) behind a preview of what the page creates, tilted −1° with the hard sticker shadow, or, where it creates nothing visible yet, a collage of one pixel illustration and agents' pixel faces ([Illustrations](#illustrations), [Onboarding](../products/raft-chat/onboarding.md#creating-an-account-and-a-server)). The logo sits at the top left of the form. Below 1024px, the same frame bar as sign-in above a plain form |

The further down the table, the closer to the website. Nothing from the last three rows appears on a working page, including its empty states. The setup of a new server, which runs as dialogs over the server's pages, is a working page apart from its last step ([Onboarding](../products/raft-chat/onboarding.md)).

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

- Use the ink outline on light backgrounds and the white outline on dark ones. The logo is two-color artwork: change the file, not its CSS `color`. raft-ui's exports switch to the white outline in dark mode on their own. The yellow outline is the website footer's version, not the product's.
- Put the mark straight on a yellow background, without a tile behind it.
- Show the logo only on brand pages (sign-in, sign-up, the pages that create an account or a server, and loading screens) and on public pages outside the app, such as a public Artifact or a public server page. A public page has no server frame, so the mark starts its header and links to Raft's website for a visitor.
- Don't put the mark on the frame of a working page.

## Illustrations

Ten two-color pixel illustrations of people and agents working together: `fist-bump`, `hand-off`, `award`, `deliver`, `raft`, `task-collab`, `review`, `shared-data`, `sync` and `idea`. They are in [`design/assets/Illustrations`](../assets/Illustrations/README.md); raft-ui draws them as [BrandIllustration](../../packages/ui/src/components/brand-illustration/brand-illustration.md), and as the brand pane's collage as [BrandCollage](../../packages/ui/src/components/brand-collage/brand-collage.md).

- Show them only in the brand pane: sign-up, and the pages that create an account or a server. Not on sign-in, which has no pane, not on a working page and not in its empty states, for the reason in [Principles](#principles).
- Use one per pane, in the collage, on a page that creates nothing visible yet: `raft` on sign-up, `task-collab` on onboarding's first page. A page that creates something shows the preview of it instead; the preview says more than a drawing.
- Draw them in ink on the pane's frame color, with paper (the frame color) inside the shapes. In dark mode the ink is the light frame text on the near-black frame, so they read as the same drawings in both modes, as the logo does.
- Render a cell at 8px on the pane (4px where it has to be small), a multiple of 4 so every pixel comes out the same size at every pixel ratio; don't size them in CSS ([BrandIllustration](../../packages/ui/src/components/brand-illustration/brand-illustration.md#sizes)).
- Keep the illustration flat, with no tilt and no shadow; the faces around it each get their own tilt and the hard sticker shadow. A drawing has no edge for a shadow to follow, and turned, its pixels stop being square; the faces are square stickers, so they take a tilt and a shadow like the preview card.
- Don't add other drawings in the product. A new illustration is drawn on a grid in ink and paper only and added to the assets first.

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
- [Raft Chat: Onboarding](../products/raft-chat/onboarding.md) and [Agent profile](../products/raft-chat/agent-profile.md).
