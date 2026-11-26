---
title: Brand
summary: How much of the brand each kind of page may use, and the rules for the logo and the drawn reactions.
redirectFrom: [decisions/0008-reactions-in-palette]
---

# Brand

Raft keeps a few things from the brutal style of its website: the yellow, the ink lines, the square pixels, Space Grotesk and Space Mono. The website wants to be remembered at a glance; the product is used for hours a day. So the working product puts brand color only in a few fixed places, and the closer a page is to a first impression, the more of the website it may use.

## Principles

- **The working product uses the least brand.** Lists, conversations, tasks, settings and empty states get the frame and small blocks of color, nothing more.
- **Brand illustration stays out of working pages.** The large sticker with the hard shadow appears only on profiles and the last setup step; halftone, the tilted preview or collage and the logo only on sign-in, sign-up, the pages that create an account or a server, and in onboarding v3 every page before the App.
- **The recent-activity card has one small Ottie illustration.** This approved character treatment is a bounded exception, not permission to add brand illustration to other working pages. Keep its four poses and motion consistent with [OtterIndicator](../../packages/ui/src/components/steps/steps.md#ottie-illustration).
- **Your server is on the frame, not the logo.** The frame of a working page shows your server (the workspace button on a phone's Home, the workspace button and strip in the web top bar), never the Raft mark.

## How much brand

Each row adds to the row above it.

| Page | May use |
| --- | --- |
| Working pages: lists, conversations, tasks, settings, empty states | The yellow frame, the workspace button, at most one pink primary action, ink-bordered controls, small blocks of color such as avatars and presence lights |
| The profile of one agent or person, and the last step of a server's setup | Also: the 99px pixel sticker with the hard sticker shadow (`shadow-sticker`). On a profile it stays still; on the setup's last step it hops once ([Motion](./motion.md#usage)) |
| Sign-in | Also: the logo, in a 56px frame bar above a white page, and the Raft mark above the form's title |
| Signing up, creating an account or a server, and in onboarding v3 every page before the App | Also: from 1024px, a brand pane to the right of the form, on the frame color, with halftone dots (1.5px `line-seam` dots on a 14px grid) behind a preview of what the page creates, tilted −1° with the hard sticker shadow, or, where it creates nothing visible yet, a collage of agents' pixel faces and widgets ([Onboarding](../products/raft-chat/onboarding.md#split-pages)). The logo sits at the top left of the form. Below 1024px, the same frame bar as sign-in above a plain form |

The further down the table, the closer to the website. Nothing from the last three rows appears on a working page, including its empty states. In the shipped flow, the setup of a new server runs as dialogs over the server's pages and is a working page apart from its last step; in onboarding v3 the setup steps are split pages with the brand pane, and the App opens after them ([Onboarding](../products/raft-chat/onboarding.md)).

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

## Reactions

Raft draws its 8 quick reactions itself, in this order: thumbs_up, heart, party_popper, eyes, fire, joy, check_mark and beers (beers drawn 2026-11-23, made a quick reaction 2026-11-26; huxijin, #proj-raft-ui:#313). They are in [`design/assets/Reactions`](../assets/Reactions/).

- Draw them on a 24px grid with a 2px line. Take every fill from the palette (yellow, cyan, red, lavender, pink), at its most saturated step that still works on both canvases, and draw highlights as white square pixels. The product's original set had sage green, light steel blue and cream curved highlights, which are not in the palette; recolored, the reactions speak the same language as stickers and pixel avatars. The one exception is check_mark: the palette's only green, lime, is either too pale (`lime.200`) or too grey (`lime.400` and darker) for it, so it has two greens of its own, used nowhere else: fill `#58CF4E` (oklch 0.76 0.20 142) and outline `#3D8F35` (oklch 0.58 0.15 142) (huxijin, 2026-11-26, #proj-raft-ui:#304). Its check is also the one exception to ink details: it is cream `yellow.50`, as in the version huxijin picked, so the check reads as a white tick on green. That is only 1.9:1 against the fill: the check is told apart by its shape, and the square's outline and fill carry the glyph.
- Draw each outline in a darker or more saturated shade of the drawing's main color, not in ink. Details inside a drawing, such as eyes and mouths, stay ink. One set works in both modes, with the edge carried differently on each: on the light surfaces (white and the hover grey `#EBEBEB`) the outline draws the edge; on the dark ones (the canvas `#251C15` and the card `#362C24`) the fill does, and the outline reads as color, not as a dark gap that makes the drawing look smaller. Aim for 3:1 ([Accessibility](./accessibility.md)) for the outline on the light surfaces and for the fill on the dark ones, and measure a new reaction on all four. Don't require the outline to reach 3:1 on all four surfaces: that pins every outline to mid lightness and greys the set (the 2026-11-23 rule, replaced on 2026-11-26). The colors in use:

  | Fill | Outline | Used on |
  | --- | --- | --- |
  | `yellow.400` | `orange.500` | thumbs_up, joy, beers |
  | `red.500` | `red.600` | heart, fire |
  | `lavender.600` | `lavender.700` | party_popper |
  | `cyan.400` | `cyan.500` | eyes |
  | `#58CF4E` | `#3D8F35` | check_mark |

  Two known shortfalls, accepted for saturation: the `orange.500` and `cyan.500` outlines are 2.9:1 on white and 2.4:1 on the hover grey (the outline is still clearly visible), and the `lavender.600` fill is 2.9:1 on the dark card.
- Don't add the die-cut edge to reactions. A reaction is content in a message, not a sticker, and at 16px the extra ring makes it look heavy and crowded. An ink outline fails in dark mode (1.1:1 on the dark canvas), and a second set for dark mode would be one more set for the web and the app to keep in step (huxijin, 2026-11-23, #proj-raft-ui:6ed5ba75).
- Size them at 16px in a reaction, 22px among the quick reactions of a menu, and 18px on their own.
- Use the system emoji for every other reaction. Draw a new one only when the product asks for it, to these rules.
- Hide the drawing from assistive technology and give the button that holds it an `aria-label`.

## Related

- [Color](./color.md): the meanings of the brand colors.
- [Page structure](../patterns/page-structure.md): where the frame is.
- [Raft Chat: Onboarding](../products/raft-chat/onboarding.md) and [Agent profile](../products/raft-chat/agent-profile.md).
