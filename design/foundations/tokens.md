---
title: Tokens
summary: Every token group with its values in both modes, how token names are built, where tokens.json lives and how foundation.css is generated from it, and how to move off the deprecated names.
---

# Tokens

A token is a named value: a color, a shadow, a size. Components and products use the name, never the value, so a value can change in one place and every screen follows in both modes. This page is the reference for every token. The rules for choosing between tokens belong to the foundation that owns each group, linked from each section below.

## Principles

- **One source.** Every token in `tokens.json` is written once there. `foundation.css` is generated from it, and nothing else defines a token value.
- **Names say the role, not the color.** `attention`, not pink; `layer-canvas`, not white. A token keeps its name when its value changes, and the dark value lives under the same name.
- **Use the role token before the palette.** Reach for `palette-*` only where no role fits; see [Color](./color.md#palette).
- **A value used three times becomes a token.** A one-off value can stay inline, as an ink step or an `oklch()` literal; on its third use, add a token.

## Where tokens live

| File | What it holds |
| --- | --- |
| `packages/ui/src/tokens.json` | The source for colors, shadows, the focus ring and the metric tokens, in the [Design Tokens Community Group format](https://www.designtokens.org/tr/2025.10/) (2025.10). Published as `@botiverse/raft-ui/tokens.json` for tools outside CSS. |
| `packages/ui/src/foundation.css` | Generated from `tokens.json`: every token as a CSS custom property, for light mode, dark mode and the system setting. Published as `@botiverse/raft-ui/foundation.css` for plain CSS. |
| `packages/ui/src/styles.css` | The Tailwind entry. It imports `foundation.css`, maps tokens to utilities (`bg-layer-canvas`, `text-foreground-muted`, `shadow-float`) and defines the tokens that exist only as Tailwind theme values: radii, type styles and `ease-slide`. |
| `packages/ui/src/fonts.css` | The font families: Space Grotesk, Space Mono and the Chinese fallbacks. |

An app that uses Tailwind imports `@botiverse/raft-ui/styles.css`. A page without Tailwind imports `@botiverse/raft-ui/foundation.css` and reads the custom properties: `var(--layer-canvas)`.

## How foundation.css is generated

`packages/ui/scripts/build-tokens.mjs` reads `tokens.json` and writes `foundation.css`. Never edit `foundation.css` by hand.

```sh
vp run @botiverse/raft-ui#build:tokens          # write src/foundation.css
node packages/ui/scripts/build-tokens.mjs --check   # exit 1 if it is out of date
```

- Change a value in `tokens.json`, run `build:tokens`, and commit both files. A test (`foundation.generated.test.ts`) fails when `foundation.css` doesn't match `tokens.json`.
- A token's path becomes its property name: `{layer.canvas}` is `--layer-canvas`. `$root` names the group itself: `{foreground.$root}` is `--foreground`. A reference (`"{palette.cyan.800}"`) becomes `var(--palette-cyan-800)`.
- The format has no field for modes, so `tokens.json` adds an extension, `build.botiverse.raft`:

| Field | Meaning |
| --- | --- |
| `modes.dark` | The dark-mode value. A token without it has the same value in both modes |
| `desktop` | The value on a desktop: from 768px, where the desktop layout begins, with a mouse or trackpad ([Spacing](./spacing.md#hit-targets)); the token's own value is then the phone's and a touch screen's. Used by metric tokens such as `field-font-size` |
| `scope: "root"` | A value that doesn't change with the mode, such as the palette: declared once on `:root` |
| `scope: "every-mode"` | An alias of a token that changes with the mode: declared again in each mode scope, so it resolves against that mode's value |
| `css: true` | A value kept as a CSS expression that the format has no type for: `color-mix()`, a shadow with several layers |
| `static: true` | A deprecated alias of a value that doesn't change with the mode |

The generated file has, in order:

1. the palette, on `:where(:root)`;
2. light mode, on `:where(:root)` and `.light`;
3. dark mode, on `.dark`;
4. dark mode again under `@media (prefers-color-scheme: dark)` for a root without `.light` or `.dark`, so the page has the right colors before the app sets a class;
5. the aliases declared in every mode, then the deprecated names;
6. the desktop values, under `@media (width >= 48rem) and (pointer: fine)` (the query of the desktop type in `styles.css` too), on the same selectors as the values they replace.

A `.light` element inside a dark page is a light island, for a preview or a portal; the `dark:` variant in `styles.css` follows the nearest mode class. See [Dark mode](./dark-mode.md).

## Token grammar

Names are built from a few parts, so a name you haven't seen tells you what it is for.

| Kind | Pattern | Examples |
| --- | --- | --- |
| Neutral roles | `{role}(-{purpose})(-{intensity})` | `layer-canvas`, `foreground-hint`, `line-seam`, `fill-pressed`, `foreground-on-hud` |
| Color roles | `{family}(-{slot})` | `brand`, `brand-soft`, `danger-strong`, `info-muted` |
| Ink steps | `ink-{alpha}` | `ink-8`, `ink-40` |
| Palette | `palette-{color}-{step}` | `palette-yellow-400`, `palette-lavender-800` |
| Statuses | `task-status-{status}(-soft\|-strong)`, `presence-{state}` | `task-status-in-review-soft`, `presence-busy` |
| Stickers | `sticker-{part}` | `sticker-ink`, `sticker-edge`, `sticker-pressed` |
| Shadows | `elevation-{level}`, `focus-ring` | `elevation-float`, `elevation-sticker` |
| Metrics | `{part}-{property}` | `field-font-size`, `card-title-line-height` |

**Neutral roles.** The role is one of four:

- `foreground-*`: text and icons;
- `layer-*`: a surface, in the order things stack (frame, sidebar, canvas, card, popover);
- `line-*`: a line;
- `fill-*`: a fill laid into or over a surface.

The purpose says where the token is used: `frame`, `sidebar`, `canvas`, `card`, `popover`, `code`, `hud`, `on-frame`, `on-hud`, `link`, `field`. Intensity runs from the bare name down to `-muted`, then `-hint` for text, and from `-hairline` through `-seam` to `-strong` for lines.

**Color roles.** The family is one of `brand`, `attention`, `info`, `success`, `warning`, `danger` or `inactive`. The slot says which shade:

| Slot | Is |
| --- | --- |
| bare (`info`) | The solid color: a sticker's fill |
| `-strong` | A deep shade, readable as text |
| `-muted` | A strong tint |
| `-soft` | A pale tint, without a border; see [Soft tints](./color.md#soft-tints) |
| `-foreground` | Text on the solid color, where a family has its own |
| `-hover`, `-active` | The pair a solid fill takes on hover and press. A family has both or neither |
| `-50` to `-950` | The numbered ramp. Only `brand` and `attention` have one |

**Opacity.** Every `layer` token is opaque except the two scrims, `layer-backdrop` and `layer-backdrop-nested`. `fill-muted` and `fill-strong` are opaque. `fill-pressed`, `fill-frame-pressed` and `sticker-pressed` are translucent: they are overlays laid on top of a control ([Pressed overlays](./color.md#pressed-overlays)).

**Utilities.** A Tailwind utility is the property's prefix and the token name: `bg-layer-card`, `text-foreground-muted`, `border-line-strong`. Shadows are named apart: `shadow-float` for `elevation-float`, `shadow-sticker` for `elevation-sticker`, `shadow-focus` for `focus-ring`. The numbered palette steps are only custom properties, not utilities; the bare `bg-palette-yellow` and its siblings are the exception.

## Token groups

Each block below is generated from `tokens.json` and shows the light and dark values.

### Palette

The raw colors the roles point at. The rules for using them directly are in [Color](./color.md#palette).

```tokens
palette
```

### Text and icons

`foreground` and its tiers, and the text colors for the frame and the HUD. Usage and contrast: [Color](./color.md#text-and-icons), [Typography](./typography.md#color-tiers).

```tokens
foreground
```

### Surfaces

Usage: [Color](./color.md#surfaces).

```tokens
layer
```

### Fills

Usage: [Color](./color.md#surfaces) and [Pressed overlays](./color.md#pressed-overlays).

```tokens
fill
```

### Lines

Usage and widths: [Color](./color.md#lines), [Shape](./shape.md#stroke-widths).

```tokens
line
```

### Ink steps

Translucent steps of ink that lines, secondary text and overlays are made from. Use the role tokens; reach for an ink step only for a one-off wash.

```tokens
ink
```

### Color roles

What each color means: [Meanings of color](./color.md#meanings-of-color).

```tokens
brand
```

```tokens
attention
```

```tokens
info
```

```tokens
success
```

```tokens
warning
```

```tokens
danger
```

```tokens
inactive
```

### Statuses

Task statuses and presence lights: [Statuses](./color.md#statuses).

```tokens
task-status
```

```tokens
presence
```

### Stickers

Usage: [Stickers](./color.md#stickers).

```tokens
sticker
```

### Shadows and the focus ring

Usage: [Elevation](./elevation.md), [Accessibility](./accessibility.md#focus-and-keyboard).

```tokens
elevation
```

```tokens
focus
```

### Metrics

The type metrics a field and a card title share with the parts laid out beside them. Usage: [Typography](./typography.md#metric-tokens).

```tokens
field
```

```tokens
card-title
```

### Tokens defined in styles.css

These are Tailwind theme values in `styles.css`, not entries in `tokens.json`, so they have no generated table.

| Tokens | Owner |
| --- | --- |
| `radius-sticker`, `radius-chip`, `radius-control`, `radius-container`, `radius-dialog` | [Shape](./shape.md#radii) |
| `text-hero` to `text-label`, `text-mono-meta`, `text-mono-code`, `text-control`, each with a phone and a desktop value | [Typography](./typography.md#type-scale) |
| `ease-slide` | [Motion](./motion.md#easing) |
| `font-sans`, `font-heading`, `font-mono` | [Typography](./typography.md#font-families) |

## Deprecated names

Earlier names are kept as aliases until raft-ui 1.0, in the `deprecated` group of `tokens.json`. Each one points at the token to use instead, so old code keeps working while it moves.

```tokens
deprecated
```

The renames follow a few patterns:

```text
primary-*                  ->  brand-*
accent-*                   ->  attention-*
color-brutal-{color}-{n}   ->  palette-{color}-{n}   (purple -> lavender)
secondary-{n}              ->  palette-stone-{n}
layer-panel                ->  layer-canvas
layer-canvas-muted         ->  layer-sidebar
layer-inset                ->  fill-muted
layer-hud-foreground       ->  foreground-on-hud
foreground-strong          ->  foreground
foreground-icon            ->  foreground-muted
foreground-placeholder     ->  foreground-hint
line                       ->  line-seam
line-muted                 ->  line-hairline
theme-shadow-float/lg/xl   ->  elevation-float       (utility: shadow-float)
theme-shadow-sticker       ->  elevation-sticker     (utility: shadow-sticker)
theme-focus-ring           ->  focus-ring            (utility: shadow-focus)
theme-shadow-xs/sm/md      ->  none: controls cast no shadow, drop the class
```

### The codemod

raft-ui ships a codemod that rewrites the old names in Tailwind utilities (`bg-…`, `hover:border-…/50`) and in CSS custom properties (`var(--…)`):

```sh
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <dir-or-file>... [--dry]
```

- It rewrites `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css` and `.html` files, and skips `node_modules`, `dist` and `build`. `--dry` lists the files it would change.
- It renames references and leaves declarations alone, so running it twice is safe.
- Review the result by hand. A guard that forbade an old name (a lint rule, a test, an allowlist) now forbids the new one, and a pattern built from parts, such as a regular expression over class names, keeps the old name.
- The docs never use a deprecated name: `scripts/check-docs.mjs` fails a page that does.

## Changing a token

- Add or change a value only in `tokens.json`, then regenerate `foundation.css` in the same change.
- Give a new token a name that follows the grammar above, and add its utility to `styles.css` if components need one.
- Rename a token by keeping the old name in the `deprecated` group, pointing at the new one, and adding the rename to the codemod. Remove aliases only in a major version.
- When a text, surface or tint value changes, recheck the contrast guarantees in [Color](./color.md#contrast) for both modes.
- Update the foundation page that owns the token in the same pull request ([Authoring](../authoring/README.md#changing-the-system)).

## Related

- [Color](./color.md): what each color token is for, and the contrast it guarantees.
- [Typography](./typography.md): the type styles and the metric tokens.
- [Elevation](./elevation.md): shadows and the focus ring.
- [Dark mode](./dark-mode.md): what changes between the modes.
