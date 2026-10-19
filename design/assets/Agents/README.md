---
title: Agent pixel avatars
summary: The 16 pixel avatars agents use, the colors they are drawn in, their backgrounds, and how to render them.
---

# Agent pixel avatars

These are the product's own agent avatars, converted cell by cell from Raft's avatar table (`packages/web/assets/avatars/pixelAvatars.json` in the Raft web app, which its `PixelAvatar` component reads) into SVG with a transparent background. In the product each avatar comes with a background color; here the background is a palette token, so it follows the palette, and in dark mode the avatar gets the die-cut edge like every other sticker ([Dark mode](../../foundations/dark-mode.md)). They are used in agent avatars ([Avatar](../../../packages/ui/src/components/avatar/avatar.md)) and as the large sticker on profiles and on the last step of a server's setup ([Brand](../../foundations/brand.md#how-much-brand)).

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `robot.svg` | Robot (the product's default) | Ink, white, cyan | `info` (cyan) |
| `cat.svg` | Cat | Ink, yellow | `brand` (yellow) |
| `ghost.svg` | Ghost | Ink, white | `palette-lavender` |
| `skull.svg` | Skull | Ink, white | `warning` (orange) |
| `alien.svg` | Alien | Ink, sage green | `success` (lime) |
| `heart.svg` | Heart | Ink, red | `attention` (pink) |
| `star.svg` | Star | Ink, yellow | `brand` (yellow) |
| `flame.svg` | Flame | Ink, orange, yellow, red | `warning` (orange) |
| `diamond.svg` | Diamond | Ink, white, cyan | `info` (cyan) |
| `mushroom.svg` | Mushroom | Ink, white, red | `attention` (pink) |
| `eye.svg` | Eye | Ink, white | `palette-lavender` |
| `crown.svg` | Crown | Ink, yellow | `brand` (yellow) |
| `cloud.svg` | Cloud | Ink, white | `info` (cyan) |
| `sun.svg` | Sun | Ink, yellow | `danger` (red) |
| `bell.svg` | Bell | Ink, yellow | Slate gray, outside the palette |
| `tree.svg` | Tree | Ink, orange, sage green | `success` (lime) |

## Rules

- Keep the order of this table: it is the order of the product's avatar picker.
- Keep the drawing's colors as the product has them: ink and white, and the other colors equal to the tokens of the same name. Sage green and slate gray appear only in avatars and are not in the palette.
- Don't recolor an avatar with CSS. The SVGs have several colors and don't inherit `currentColor`.
- Expect some cells to merge with the background: the yellow in cat, star and crown and the cyan in robot and diamond are the same as their backgrounds, so those cells read as cut-outs. The product's originals are drawn this way.
- Render the pixel area at a multiple of 8px (16px, 24px, 32px, 48px, 96px) with `image-rendering: pixelated`, so the pixels stay sharp.
- Treat the background as part of the avatar: changing the avatar changes the background. Don't give an agent a color of its own.
- Give new agents an avatar by the product's rules: `robot` by default, or one of these 16 chosen at random or by hand. The product also generates seeded identicons in code; those are not in this table.
- Add a new avatar to the product's avatar table first, also 8×8 with an ink outline, then add it here.
- The product has two reserved avatars, `finch` and `mug`, that are neither random nor in the picker and use one-off background colors. They are not included.
