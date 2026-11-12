---
title: BrandCollage
summary: The brand pane's collage on a page that creates nothing visible yet — one pixel illustration in the middle and agents' pixel faces around it like stickers.
status: experimental
aliases: [Collage, Brand pane collage, Sign-up collage]
layer: core
category: identity
related: [brand-illustration, avatar, logo]
---

# BrandCollage

`BrandCollage` fills the brand pane of a page that creates nothing visible yet, such as sign-up and onboarding's first page: a [BrandIllustration](../brand-illustration/brand-illustration.md) in the middle and four or five agents' pixel faces around it ([Onboarding](../../../../../design/products/raft-chat/onboarding.md#creating-an-account-and-a-server)). It says nothing in particular and doesn't change with what the person types. Every app that draws these pages renders the same collage from it, so the places, tilts and shadows are decided once.

```example
brand-collage/compositions/sign-up
```

## When to use

| Situation                                                               | Use                                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Sign-up                                                                 | `BrandCollage illustration="raft"`                                                |
| Onboarding's first page (what the agent team should work on)            | `BrandCollage illustration="task-collab"`                                         |
| A page that creates something visible: the account's identity, a server | The preview of what it creates, tilted −1° with the sticker shadow, not a collage |
| Any working page                                                        | Nothing ([Brand](../../../../../design/foundations/brand.md#principles))          |

```example
brand-collage/compositions/first-page
```

## Anatomy

- `BrandCollage`: a 576 × 480 box, the illustration named by `illustration` in its middle at 8px a cell.
- Its children: four or five `Avatar type="agent"` at `lg` (51px) or `md` (35px), each with its `AvatarImage` and the fill that comes with the pixel face. They take five places in order: top left, top right, bottom right, bottom left, bottom. A sixth is not drawn.

Put it in the middle of the brand pane, on the pane's frame color and halftone ([Brand](../../../../../design/foundations/brand.md#how-much-brand)).

## Behavior

- Each face is tilted on its own (−3°, 2°, −2°, 3°, −1° in order) and has the hard sticker shadow (`shadow-sticker`), like the preview card on the other pages of the flow: separate stickers laid on the pane, each at its own angle, read as a collage rather than a grid.
- The illustration stays flat and has no shadow. It has no edge for the shadow to follow (a box shadow would draw a rectangle it doesn't have), and a pixel drawing turned by a degree loses its square pixels.
- The box and every illustration are a whole number of pixels from its middle, so the drawing's cells fall on the screen's pixels.
- The places keep the faces clear of the largest illustration (312 × 232) for faces up to `lg`. Don't use the 99px `xl` face here: it is the profile's and the last setup step's sticker, and it would cover the drawing.
- Nothing in it moves or responds to input.

## Accessibility

The collage is hidden from assistive technology (`aria-hidden`): it says nothing the page doesn't. Give the faces an empty `alt`.

## Rules

- Use it only on the brand pane, from 1024px; below 1024px the pages have a frame bar and no pane ([Brand](../../../../../design/foundations/brand.md#how-much-brand)).
- Choose faces whose fill isn't the brand yellow (`cat`, `star`, `crown` and the others on `brand`): on the light pane, which is the same yellow, their edge is all that would show.
- Don't fill it from what the person types (their name, their agents): the collage only sets the mood, and the pages that show the person's data use a preview instead.
