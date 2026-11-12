---
title: BrandIllustration
summary: Raft's ten two-color pixel illustrations as inline SVGs, drawn in tokens, for the brand pane of sign-up and of the pages that create an account or a server.
status: experimental
aliases: [Illustration, Brand illustration, Pixel illustration, Spot illustration]
layer: core
category: identity
related: [brand-collage, logo, avatar]
---

# BrandIllustration

`BrandIllustration` draws one of the ten pixel illustrations a designer drew for Raft: people and agents working together, in ink with a paper inside. It is for the brand pane only, the pane beside the form on sign-up and on the pages that create an account or a server ([Brand](../../../../../design/foundations/brand.md#how-much-brand)). On the pane it usually sits in a [BrandCollage](../brand-collage/brand-collage.md).

```example
brand-illustration/compositions/preview
```

## When to use

| Situation                                                                                    | Use                                                                                                                                                         |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The brand pane of a page that creates nothing visible yet (sign-up, onboarding's first page) | [BrandCollage](../brand-collage/brand-collage.md), which places one `BrandIllustration` with agent faces around it                                          |
| One illustration on the brand pane, without faces                                            | `BrandIllustration`                                                                                                                                         |
| A working page, its empty states included                                                    | Nothing: brand illustration stays out of working pages ([Brand](../../../../../design/foundations/brand.md#principles))                                     |
| A page that creates something visible (the account's identity, a server)                     | The preview of what it creates, not an illustration ([Onboarding](../../../../../design/products/raft-chat/onboarding.md#creating-an-account-and-a-server)) |

## Drawings

`name` picks the drawing. Each is on its own grid of square cells, in the files of [`design/assets/Illustrations`](../../../../../design/assets/Illustrations/README.md).

| `name`        | Shows                                      | Grid (cells) |
| ------------- | ------------------------------------------ | ------------ |
| `fist-bump`   | Two fists bumping                          | 37 × 19      |
| `hand-off`    | A hand passing a checked card to another   | 38 × 21      |
| `award`       | Two hands holding up a medal               | 29 × 19      |
| `deliver`     | A finished piece handed over               | 39 × 25      |
| `raft`        | A raft with two oars: all in the same boat | 37 × 20      |
| `task-collab` | One task card split into three             | 37 × 25      |
| `review`      | A report under a magnifier with a check    | 29 × 27      |
| `shared-data` | A chart on a screen, shared to two laptops | 36 × 29      |
| `sync`        | A document passing between two screens     | 38 × 24      |
| `idea`        | A light bulb lighting up                   | 14 × 24      |

```example
brand-illustration/compositions/all
```

## Sizes

The size is the drawing's grid times `cell`, the CSS pixels per cell: 8 (the default) on the brand pane, 4 where it has to be small. `raft` is 296 × 160 at 8 and 148 × 80 at 4.

- A cell is a multiple of 4 CSS pixels because that is a whole number of device pixels at every common pixel ratio (1, 1.25, 1.5, 1.75, 2 and 3). At 3px or 6px a cell is 3.75 or 7.5 device pixels on a 1.25 screen, and its pixels come out in two widths.
- Don't size it with CSS (`h-*`, `w-*`, `size-*`): a size that isn't the grid times 4 or 8 makes the pixels uneven, the same as a 32px avatar ([Avatar](../avatar/avatar.md#rules)).
- Use one `cell` for every illustration on a surface, so all their pixels are the same size.

## Colors

The ink is `foreground-on-frame` and the paper `layer-frame`, the brand pane's own text and surface tokens, so the drawing follows the mode and the theme of the frame: ink on yellow in light mode, light ink on the near-black frame in dark mode. Paper fills only the cells the ink encloses, so the pane's halftone stays out of the shapes and shows around them.

Where a drawing sits on another surface, set `--illustration-paper` (and `--illustration-ink` if the text color differs) to that surface's tokens on the element or an ancestor: `[--illustration-paper:var(--layer-canvas)]`. Use the raw tokens (`var(--layer-canvas)`), not Tailwind's `--color-*` names, which are resolved at the root and miss a `.dark` island.

## Accessibility

- The SVG is hidden from assistive technology (`aria-hidden`): the drawings say nothing in particular, and the page's title and form carry its meaning.
- Where a drawing does carry meaning, pass `aria-hidden={false}`, `role="img"` and an `aria-label`.

## Rules

- Use it on the brand pane only. The rules for where brand illustration may appear, and why, are in [Brand](../../../../../design/foundations/brand.md#how-much-brand).
- Keep it flat: no tilt, no shadow. It has no edge for a shadow to follow, so a box shadow would draw a rectangle it doesn't have; and a turned pixel drawing loses its square pixels.
- Don't recolor it with other tokens or with the colors of the files. The two colors are what make it read as one family with the logo and the pixel avatars.
- Add or change a drawing in `design/assets/Illustrations`, then run `vp run @botiverse/raft-ui#build:illustrations`; a test fails when the component and the files disagree.
