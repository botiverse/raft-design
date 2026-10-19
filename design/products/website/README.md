---
title: Website
summary: How raft.build uses the design system — product UI shown on the site, what color means there, the marketing layer, and what the site may do that the product doesn't.
---

# Website

The website at [raft.build](https://raft.build) is where most people first see Raft, often only once, before they sign up. It uses the same materials as the product (the yellow, the ink line, the square pixel, Space Grotesk and Space Mono, the palette) at the loudest level of [Brand](../../foundations/brand.md#how-much-brand): the product turns these materials down for all-day use, and the website is where they are at full volume. This page covers how the website uses the system. The materials themselves, and why the product is quieter, are in [Why Raft looks this way](../../principles/why-raft-looks-this-way.md).

## Structure

The site is a single landing page: the hero with the product's main actions, the logos of teams that use Raft, the features, what people say, the team, the FAQ and a final call to action. Each feature pairs a short text with the product UI it describes.

## Rules

### Product UI on the site

- Render product UI with raft-ui, or use a screenshot of the real product. Don't draw an imitation: people who choose Get Started should land in the product the site showed them.
- Pin the raft-ui version the site renders product UI with: a mockup shows the product at one moment, and once the product changes, an unchecked mockup becomes the imitation this rule exists to prevent.
- List the components that may change a website mockup in each raft-ui release PR. The website's owner checks those mockups against the product before moving the site to the new version: a check nobody owns doesn't happen.
- Take screenshots only on a demo server, filled with the docs' recurring cast ([Writing guide](../../authoring/writing.md#examples-and-sample-content)): never show a real person's, team's or customer's content.
- To show a product screen as a picture, use the same treatment as the brand pane of the page that creates a server: the screen tilted −1° with the hard sticker shadow (`shadow-sticker`), on the frame color with halftone dots ([Brand](../../foundations/brand.md#how-much-brand)).

### Color

The site uses the palette and keeps each color's meaning from [Color](../../foundations/color.md#meanings-of-color). Yellow has two uses there, and the site may use both:

| Yellow as | On the website |
| --- | --- |
| A surface, as the product's frame | Any size, including full-width sections, because a surface doesn't mark anything |
| A mark inside content | Only for "you": the selected row or a mention of you inside a mockup. Don't use yellow to highlight a selling point in marketing copy |

- Give pink, cyan, orange, red, lime, lavender and stone their product meanings wherever they appear inside content: a status color on the site means what it means in the product. Pink marks the primary action, one per section (see the table below).
- Use the colors as palette and role tokens from `@botiverse/raft-ui/tokens.json`. Don't add color values of the site's own: the site's colors already match the palette, and the token file keeps them matched when the palette changes.

### Marketing components

- Build the site's own sections (the hero, testimonials, the FAQ, pricing cards) as components in the website's repository, raft-landing, on raft-ui tokens and components. Don't add them to `packages/ui`: `packages/ui` holds business-agnostic parts, and these sections carry marketing content.
- Use raft-ui components for anything the product also has: buttons, avatars, inputs, links.

## Differences from the shared patterns

The website may use everything in the table in [Brand](../../foundations/brand.md#how-much-brand), and also:

| The website may | The product doesn't, because |
| --- | --- |
| Fill a section or the whole screen with yellow | A yellow surface people read on all day costs attention every minute; the product keeps yellow on the frame |
| Use 2px ink lines between regions | The product separates regions with one 1px seam and keeps the ink border for controls ([Why Raft looks this way](../../principles/why-raft-looks-this-way.md#why-the-product-turns-the-volume-down)) |
| Put the hard sticker shadow on buttons, lift a button on hover and press it down on click | Each button on the site is pressed once and has to draw attention. A product button is pressed hundreds of times a day, and movement there is noise that also shakes its neighbors, so in the product press doesn't move ([Motion](../../foundations/motion.md)) |
| Have one pink primary action in each section | The product allows at most one pink button per screen. The website is one long page read section by section, and each section ends in its own action ([Color](../../foundations/color.md#meanings-of-color)) |
| Set short labels in Space Mono in all caps, such as the label above the logos of teams that use Raft. Only labels: never a sentence, a heading or a button | [0002](../../decisions/0002-no-all-caps.md) bans all caps because it removes the shape of words and slows reading, and because capitalized English stands out too much in mixed Chinese and English text. A short mono label is glanced at, not read, and the website is in English only, so neither reason applies there. The all-caps mono label is part of the website's brutal style |
| Use floating stickers and animated drawings anywhere on the page | The product keeps brand illustration out of working pages ([Brand](../../foundations/brand.md#principles)) |

These are exceptions for the website only. They don't loosen a product rule: a product screen that borrows one of them breaks the rule it departs from.

## Related

- [Brand](../../foundations/brand.md): how much brand each kind of page may use, the logo.
- [Color](../../foundations/color.md): the meanings of the colors.
- [Why Raft looks this way](../../principles/why-raft-looks-this-way.md): the materials and why the product turns them down.
- [Raft Chat](../raft-chat/README.md): the product the website shows.
