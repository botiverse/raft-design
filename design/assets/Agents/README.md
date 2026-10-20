---
title: Agent pixel avatars
summary: The 72 pixel avatars agents use, in 9 series of 8, the colors they are drawn in, their backgrounds, and how to render them.
---

# Agent pixel avatars

These are the product's own agent avatars, converted cell by cell from Raft's avatar table (`packages/shared/assets/pixelAvatars.json` in the Raft repository, which the web app's `PixelAvatar` component and the server both read) into SVG with a transparent background. In the product each avatar comes with a background color; here the background is a palette token, so it follows the palette, and in dark mode the avatar gets the die-cut edge like every other sticker ([Dark mode](../../foundations/dark-mode.md)). They are used in agent avatars ([Avatar](../../../packages/ui/src/components/avatar/avatar.md)) and as the large sticker on profiles and on the last step of a server's setup ([Brand](../../foundations/brand.md#how-much-brand)).

The avatars come in 9 series of 8. The product's avatar picker shows one series per row, in this order.

### Bot family

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `robot.svg` | Robot (the product's default) | Ink, white, cyan | `info` (cyan) |
| `antenna.svg` | Antenna | Ink, white, red | `brand` (yellow) |
| `visor.svg` | Visor | Ink, white, cyan | `attention` (pink) |
| `drone.svg` | Drone | Ink, orange | `info` (cyan) |
| `tv.svg` | TV | Ink, cyan | `warning` (orange) |
| `led.svg` | LED | Ink, white, cyan, slate gray | `success` (lime) |
| `catbot.svg` | Cat bot | Ink, white, pink | `palette-lavender` |
| `boxbot.svg` | Box bot | Ink, white, cyan, slate gray | `danger` (red) |

### Critters

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `cat.svg` | Cat | Ink, yellow | `brand` (yellow) |
| `dog.svg` | Dog | Ink, white, latte brown | `info` (cyan) |
| `fox.svg` | Fox | Ink, white, orange | `info` (cyan) |
| `frog.svg` | Frog | Ink, white, lime | `palette-lavender` |
| `bunny.svg` | Bunny | Ink, white, pink | `info` (cyan) |
| `bear.svg` | Bear | Ink, white, latte brown | `success` (lime) |
| `penguin.svg` | Penguin | Ink, white, orange | `info` (cyan) |
| `owl.svg` | Owl | Ink, white, yellow, latte brown | Slate gray, outside the palette |

### Space

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `alien.svg` | Alien | Ink, sage green | `success` (lime) |
| `star.svg` | Star | Ink, yellow | `brand` (yellow) |
| `rocket.svg` | Rocket | Ink, white, orange, cyan, red | Slate gray, outside the palette |
| `planet.svg` | Planet | Ink, white, orange, yellow | `palette-lavender` |
| `moon.svg` | Moon | Ink, yellow | Slate gray, outside the palette |
| `ufo.svg` | UFO | Ink, white, yellow, cyan | `palette-lavender` |
| `astronaut.svg` | Astronaut | Ink, white, cyan, red | `warning` (orange) |
| `satellite.svg` | Satellite | Ink, white, cyan | `palette-lavender` |

### Desk

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `bell.svg` | Bell | Ink, yellow | Slate gray, outside the palette |
| `terminal.svg` | Terminal | Ink, white, yellow, lime, red | `attention` (pink) |
| `bulb.svg` | Bulb | Ink, white, yellow, slate gray | `palette-lavender` |
| `magnifier.svg` | Magnifier | Ink, white, cyan, latte brown | `brand` (yellow) |
| `pencil.svg` | Pencil | Ink, white, pink, yellow, latte brown | `info` (cyan) |
| `plane.svg` | Plane | Ink, white | `info` (cyan) |
| `clipboard.svg` | Clipboard | Ink, white, lime, slate gray | `warning` (orange) |
| `floppy.svg` | Floppy | Ink, white, slate gray | `brand` (yellow) |

### Food

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `onigiri.svg` | Onigiri | Ink, white | `success` (lime) |
| `donut.svg` | Donut | Ink, white, pink, yellow, cyan | `info` (cyan) |
| `icecream.svg` | Ice cream | Ink, white, pink, latte brown | `info` (cyan) |
| `strawberry.svg` | Strawberry | Ink, yellow, lime, red | `palette-lavender` |
| `pizza.svg` | Pizza | Ink, yellow, red, latte brown | `info` (cyan) |
| `egg.svg` | Egg | Ink, white, orange, yellow | `attention` (pink) |
| `cookie.svg` | Cookie | Ink, latte brown | `warning` (orange) |
| `cupcake.svg` | Cupcake | Ink, white, pink, red, latte brown | `brand` (yellow) |

### Quest

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `crown.svg` | Crown | Ink, yellow | `brand` (yellow) |
| `diamond.svg` | Diamond | Ink, white, cyan | `info` (cyan) |
| `heart.svg` | Heart | Ink, red | `attention` (pink) |
| `sword.svg` | Sword | Ink, white, yellow, cyan, latte brown | `palette-lavender` |
| `shield.svg` | Shield | Ink, yellow, cyan | Slate gray, outside the palette |
| `potion.svg` | Potion | Ink, white, lime, latte brown | `palette-lavender` |
| `key.svg` | Key | Ink, yellow | `palette-lavender` |
| `chest.svg` | Chest | Ink, yellow, latte brown | `info` (cyan) |

### Weather

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `sun.svg` | Sun | Ink, yellow | `danger` (red) |
| `cloud.svg` | Cloud | Ink, white | `info` (cyan) |
| `bolt.svg` | Bolt | Ink, yellow | Slate gray, outside the palette |
| `umbrella.svg` | Umbrella | Ink, white, red | `info` (cyan) |
| `rainbow.svg` | Rainbow | Ink, yellow, red | `info` (cyan) |
| `snowman.svg` | Snowman | Ink, white, orange, red | `info` (cyan) |
| `raincloud.svg` | Rain cloud | Ink, white, cyan | Slate gray, outside the palette |
| `partlysunny.svg` | Partly sunny | Ink, white, yellow | `info` (cyan) |

### Plants

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `tree.svg` | Tree | Ink, orange, sage green | `success` (lime) |
| `mushroom.svg` | Mushroom | Ink, white, red | `attention` (pink) |
| `cactus.svg` | Cactus | Ink, orange, lime | `brand` (yellow) |
| `tulip.svg` | Tulip | Ink, pink, lime | `success` (lime) |
| `sunflower.svg` | Sunflower | Ink, yellow, latte brown | `info` (cyan) |
| `pine.svg` | Pine | Ink, sage green, latte brown | `palette-lavender` |
| `leaf.svg` | Leaf | Ink, orange | `info` (cyan) |
| `sprout.svg` | Sprout | Ink, orange, lime | `info` (cyan) |

### Spooky

| File | Avatar | Colors in the drawing | Background |
| --- | --- | --- | --- |
| `ghost.svg` | Ghost | Ink, white | `palette-lavender` |
| `skull.svg` | Skull | Ink, white | `warning` (orange) |
| `eye.svg` | Eye | Ink, white | `palette-lavender` |
| `flame.svg` | Flame | Ink, orange, yellow, red | `warning` (orange) |
| `pumpkin.svg` | Pumpkin | Ink, orange, lime | `palette-lavender` |
| `bat.svg` | Bat | Ink, white | `warning` (orange) |
| `wizard.svg` | Wizard | Ink, yellow, slate gray | `palette-lavender` |
| `spider.svg` | Spider | Ink, white | `attention` (pink) |

## Rules

- Keep the series and the order within each series: they are the product's avatar picker, one series per row. Every avatar belongs to exactly one series, and every series has 8.
- Keep the drawing's colors as the product has them: ink and white, and the other colors equal to the tokens of the same name. Sage green, slate gray and latte brown appear only in avatars and are not in the palette.
- Don't recolor an avatar with CSS. The SVGs have several colors and don't inherit `currentColor`.
- Expect some cells to merge with the background: the yellow in cat, star and crown and the cyan in robot and diamond are the same as their backgrounds, so those cells read as cut-outs. The product's originals are drawn this way.
- Render the pixel area at a multiple of 8px (16px, 24px, 32px, 48px, 96px) with `image-rendering: pixelated`, so the pixels stay sharp.
- Treat the background as part of the avatar: changing the avatar changes the background. Don't give an agent a color of its own.
- Give new agents an avatar by the product's rules: `robot` by default, or one of these 72 chosen at random or by hand. The product also generates seeded identicons in code; those are not in this table.
- Add a new avatar to the product's avatar table first, also 8×8 with an ink outline and only the palette's letters, in a series, then add it here in the same place.
- The product has two reserved avatars, `finch` and `mug`, that are neither random nor in the picker and use one-off background colors. They are not included.
