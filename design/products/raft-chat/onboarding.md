---
title: Raft Chat — Onboarding
summary: The first-run screens, the one place inside the product that may use the website's full brand.
---

# Raft Chat — Onboarding

The first time the app opens, it may bring in the whole website: a full-screen yellow, tilted floating pixel stickers, halftone dots and a large headline. It is the last row of [How much brand](../../foundations/brand.md#how-much-brand), where the brand is used most.

## Structure

From top to bottom:

1. **Top**: the logo and Skip (`variant="ghost"`).
2. **Stickers**: 2 extra-large and 3 large avatar stickers, each tilted and floating, over a patch of halftone dots. In light mode the whole screen is yellow, so pick avatars whose background isn't yellow.
3. **Text**: the step dots, the step label "Step 1 of 3" (Space Mono, 12px, all caps: the only all-caps text in the app), the headline in `text-hero` and one paragraph.
4. **Bottom**: a full-width pink button at the large size (52px), and a ghost secondary button.

No composition shows this screen yet.

## Rules

- In light mode, fill the screen with `brand`, and set all text in `sticker-ink`. In dark mode, return to `layer-canvas`; the stickers keep their colors.
- Keep the full-screen yellow, halftone, the 40px headline and the all-caps step label to onboarding, sign-in and marketing pages. Agent profiles use only the large sticker; working pages, empty states included, use none of them.
