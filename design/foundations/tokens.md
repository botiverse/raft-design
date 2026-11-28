---
title: Tokens
summary: Every token group with its values in both modes, how token names are built, where tokens.json lives, how foundation.css and tokens.resolved.json are generated from it, which component sizes the web and the apps share, and how to move off the former names.
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
| `packages/ui/src/tokens.resolved.json` | Generated from `tokens.json`: every numeric token as a plain number in each context, for readers that can't evaluate CSS, such as the iOS and Android apps ([Resolved values](#resolved-values)). Published as `@botiverse/raft-ui/tokens.resolved.json`. |
| `packages/ui/src/styles.css` | The Tailwind entry. It imports `foundation.css`, maps tokens to utilities (`bg-layer-canvas`, `text-foreground-muted`, `shadow-float`) and defines the tokens that exist only as Tailwind theme values: radii, type styles and `ease-slide`. |
| `packages/ui/src/fonts.css` | The font families: Space Grotesk, Space Mono and the CJK fallbacks (Simplified Chinese by default; Traditional Chinese, Japanese and Korean under their `lang`). |

An app that uses Tailwind imports `@botiverse/raft-ui/styles.css`. A page without Tailwind imports `@botiverse/raft-ui/foundation.css` and reads the custom properties: `var(--layer-canvas)`.

## How foundation.css is generated

`packages/ui/scripts/build-tokens.mjs` reads `tokens.json` and writes `foundation.css` and `tokens.resolved.json`. Never edit either by hand.

```sh
vp run @botiverse/raft-ui#build:tokens          # write src/foundation.css and src/tokens.resolved.json
node packages/ui/scripts/build-tokens.mjs --check   # exit 1 if either is out of date
```

- Change a value in `tokens.json`, run `build:tokens`, and commit the three files. A test (`foundation.generated.test.ts`) fails when `foundation.css` or `tokens.resolved.json` doesn't match `tokens.json`.
- A token's path becomes its property name: `{layer.canvas}` is `--layer-canvas`. `$root` names the group itself: `{foreground.$root}` is `--foreground`. A reference (`"{palette.cyan.800}"`) becomes `var(--palette-cyan-800)`.
- The format has no field for modes, so `tokens.json` adds an extension, `build.botiverse.raft`:

| Field | Meaning |
| --- | --- |
| `modes.dark` | The dark-mode value. A token without it has the same value in both modes |
| `fine` | The value with a mouse or a trackpad at any width, `(pointer: fine)`: a size that follows the input, not the width, such as a list row's least height. A narrow window with a mouse takes it; a desktop takes it too unless the token also has `desktop`, which wins from 768px. The token's own value is still the phone's and a touch screen's |
| `desktop` | The value on a desktop: from 768px, where the desktop layout begins, with a mouse or trackpad ([Spacing](./spacing.md#hit-targets)); the token's own value is then the phone's and a touch screen's. Used by metric tokens such as `field-font-size`. It wins over `fine` |
| `wideTouch` | The value from 768px by touch, `(width >= 48rem) and (pointer: coarse)`: a tablet, an unfolded foldable, a phone held sideways that wide; the apps' wide touch layout, from 744pt. Only for a size a wide touch screen draws differently from a phone, such as a head's height (artin, #wg-mobile-sync:#265). The token's own value is still the phone's |
| `scope: "root"` | A value that doesn't change with the mode, such as the palette: declared once on `:root` |
| `scope: "every-mode"` | An alias of a token that changes with the mode: declared again in each mode scope, so it resolves against that mode's value |
| `css: true` | A value kept as a CSS expression that the format has no type for: `color-mix()`, a shadow with several layers |
| `static: true` | A deprecated alias (in the `deprecated` group) of a value that doesn't change with the mode |

The generated file has, in order:

1. the palette, on `:where(:root)`;
2. light mode, on `:where(:root)` and `.light`;
3. dark mode, on `.dark`;
4. dark mode again under `@media (prefers-color-scheme: dark)` for a root without `.light` or `.dark`, so the page has the right colors before the app sets a class;
5. the aliases declared in every mode, then the deprecated names;
6. the values with a fine pointer, under `@media (pointer: fine)` (Tailwind's `pointer-fine:`), on the same selectors as the values they replace;
7. the desktop values, under `@media (width >= 48rem) and (pointer: fine)` (the query of the desktop type in `styles.css` too), on the same selectors as the values they replace. They come after the fine values, so a token's `desktop` wins over its `fine`;
8. the wide touch values, under `@media (width >= 48rem) and (pointer: coarse)`, on the same selectors as the values they replace. The query never matches with the desktop's, so the order between them doesn't matter.

A `.light` element inside a dark page is a light island, for a preview or a portal; the `dark:` variant in `styles.css` follows the nearest mode class. See [Dark mode](./dark-mode.md).

## Resolved values

`tokens.resolved.json` holds every token whose type is a number (`dimension`, `number`, `fontWeight`, `duration`) resolved to a plain number in each of the four contexts ([Component tokens](#component-tokens)). An app that can't evaluate CSS reads it instead of `tokens.json`, whose derived sizes are CSS expressions such as `calc(var(--control-height-small) + 2 * var(--list-toolbar-air) + 1px)`.

- It keeps the groups of `tokens.json`. A token is an object with its `$type` and a `$value` holding one number per context: `touch` (the token's own value), `fine` (`fine`, else the token's own value), `desktop` (`desktop`, else `fine`, else the token's own value) and `wideTouch` (`wideTouch`, else the token's own value).
- A `dimension` is in px (1rem is 16px), a `duration` in ms; a `number` and a `fontWeight` have no unit.
- The generator evaluates every reference, `var()` and `calc()` in the context it resolves, as the browser does under the same media query: on a desktop, `list-toolbar-height` is the desktop header height, 44. A value it can't evaluate (a function other than `var()` and `calc()`, a unit other than px, rem, ms and s, a missing or circular reference) fails the build with the token and the context in the message.
- Colors, shadows and easing curves aren't in it; read them from `tokens.json` or `foundation.css`.

```json
{
  "list-toolbar": {
    "height": {
      "$type": "dimension",
      "$value": { "touch": 49, "fine": 49, "desktop": 44, "wideTouch": 49 }
    }
  },
  "list-row": {
    "min-height": {
      "$type": "dimension",
      "$value": { "touch": 56, "fine": 0, "desktop": 0, "wideTouch": 56 }
    }
  },
  "header": {
    "height": {
      "$type": "dimension",
      "$value": { "touch": 56, "fine": 56, "desktop": 44, "wideTouch": 48 }
    }
  }
}
```

The file itself writes every object on its own lines.

## Token grammar

Names are built from a few parts, so a name you haven't seen tells you what it is for.

| Kind | Pattern | Examples |
| --- | --- | --- |
| Neutral roles | `{role}(-{purpose})(-{intensity})` | `layer-canvas`, `foreground-hint`, `line-seam`, `fill-medium`, `foreground-on-hud` |
| Color roles | `{family}(-{slot})` | `brand`, `brand-soft`, `danger-strong`, `info-muted` |
| Signals | `you`, `selected` | `you`, `selected` |
| Ink steps | `ink-{alpha}` | `ink-8`, `ink-40` |
| Palette | `palette-{color}-{step}` | `palette-yellow-400`, `palette-lavender-800` |
| Statuses | `task-status-{status}(-soft\|-strong)`, `presence-{state}(-soft)` | `task-status-in-review-soft`, `presence-busy`, `presence-busy-soft` |
| Stickers | `sticker-{part}` | `sticker-ink`, `sticker-edge`, `sticker-medium` |
| Shadows | `elevation-{level}`, `focus-ring` | `elevation-float`, `elevation-sticker` |
| Metrics | `{part}-{property}` | `field-font-size`, `card-title-line-height`, `list-row-min-height` ([Component tokens](#component-tokens)) |

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
| `-graphic` | A chart mark's fill or stroke, 3:1 against the surfaces. Only `warning` has one; see [Warnings in charts](./color.md#warnings-in-charts) |
| `-foreground` | Text on the solid color, where a family has its own |
| `-hover`, `-active` | The pair a solid fill takes on hover and press. A family has both or neither |
| `-50` to `-950` | The numbered ramp. Only `brand` and `attention` have one |

**Signals.** `you` and `selected` are the yellow of what is addressed to you and of the selected sticker. They hold their own value instead of pointing at `brand`, so no theme grays them ([Themes](./themes.md#signals)).

**Opacity.** Every `layer` token is opaque except the two scrims, `layer-backdrop` and `layer-backdrop-nested`, and the cover over something busy, `layer-veil` ([Surfaces](./color.md#surfaces)). `fill-muted` and `fill-strong` are opaque. `fill-subtle`, `fill-medium`, `fill-frame-medium` and `sticker-medium` are translucent: they are the hover tiers, laid on top of a control or a row, and `fill-medium` is also the track of a meter or progress bar ([Hover overlays](./color.md#hover-overlays)).

**Utilities.** A Tailwind utility is the property's prefix and the token name: `bg-layer-card`, `text-foreground-muted`, `border-line-strong`. Shadows are named apart: `shadow-float` for `elevation-float`, `shadow-sticker` for `elevation-sticker`, `shadow-focus` for `focus-ring`. The numbered palette steps are only custom properties, not utilities; the bare `bg-palette-yellow` and its siblings are the exception.

## Component tokens

A component token is a size that the web and the iOS and Android apps both draw: a row's height, a control's or a toolbar's height, a step of spacing between parts. It lives in `tokens.json` so that both read one value, and a change reaches every platform at once.

**What goes in.** Only a decision both the web and the apps must follow: something a person comparing a phone web page with the app's page would see as a difference. A list row's least height, the toolbar over a list, the avatar column of a message and its gap to the text.

**What stays out.** A pixel the web needs for its own drawing stays in the component's recipe: an optical offset, a hit area the app gets from its platform, a radius that follows a height, a size only a mouse ever sees, and anything an app draws natively, such as the iOS tab bar ([Navigation](../patterns/navigation.md#what-each-platform-draws)). A value that exists already isn't registered twice: a size equal to another token is written as that token (`var(--header-height)`), so they move together, and a size that follows from other tokens is derived where it is used, as the timeline's row step is twice `timeline-row-inset`.

**Four contexts.** A token's own value (`$value`) is what a phone shows, and a touch screen at any width unless the token has `wideTouch`; it is the value an app reads. `desktop` is the value from 768px with a mouse or a trackpad. `fine` is the value with a mouse or a trackpad at any width, for a size that follows the input rather than the width: a narrow window with a mouse takes it, and a desktop takes it unless the token has `desktop` too. `wideTouch` is the value from 768px by touch (the apps' wide touch layout, from 744pt), for the few sizes a wide touch screen draws differently from a phone: a head and its bar buttons (artin, #wg-mobile-sync:#265, Raft 1.29). Never write a phone's value as an extension: it is the token's own, so an app never has to read one.

| Context | Gets | In `tokens.resolved.json` |
| --- | --- | --- |
| A phone, a touch screen under 768px (the apps under 744pt) | The token's own value | `touch` |
| A touch screen from 768px (the apps from 744pt) | `wideTouch`, else the token's own value | `wideTouch` |
| A window under 768px with a mouse or a trackpad | `fine`, else the token's own value | `fine` |
| A desktop: from 768px with a mouse or a trackpad | `desktop`, else `fine`, else the token's own value | `desktop` |

A device with no pointer at all takes the token's own value.

**Names.** A component token is `{component}-{property}`: the group is the kind of thing it sizes, in the words the docs use (`list-row`, `list-toolbar`, `avatar-column`, `mobile-nav`), and the property is one of `height`, `min-height`, `size`, `width`, `inset` (above and below the content; `inset-bottom` below it), `gap` (between two parts) or `air` (around a control in a bar). A suffix says what kind of bound it is: `-min` for a least value (`mobile-nav-inset-bottom-min`). A size of the same kind as a group that exists joins it (`control-height-small`) instead of starting a group, and one size two components share is one group they both read (`avatar-column`, for a message row and a list row), never a copy in each.

**Descriptions.** Every component token's `$description` says what it sizes, its value on a phone and on a desktop in words, why it is that size, and why it is shared: which screens on the web and in the apps draw it. It names the decision (who, when, where) when there was one. A description that can't say why the apps need the value is a sign the value belongs in a recipe.

**Using them.** A recipe reads a component token through its utility (`h-control-small`, `min-h-list-row`, `py-list-row-inset`, `w-avatar-column`, `size-avatar-column`, `gap-avatar-column-gap`, `min-h-list-toolbar`, `py-list-toolbar-air`, in `styles.css`) or, where there is none, its custom property (`min-h-[calc(var(--mobile-nav-height)+…)]`), and adds no breakpoint and no pointer query of its own for that property: the token switches once, in the token layer. Where the web needs a different value on top, such as a mouse's 64px floor on ListRow, the line that adds the breakpoint sits right under a comment saying so, `// web-only: <reason>`, the one comment a recipe's class list takes, so a check can tell a deliberate refinement from a breakpoint left over from before the token.

```ts
const listRow = tv({
  base: [
    "min-h-list-row py-list-row-inset",
    // web-only: with a mouse ListRow keeps its 64px floor and 12px inset, its current values until someone rules on them
    "pointer-fine:min-h-16 pointer-fine:py-3",
  ],
});
```

`packages/ui/src/size-tokens.test.ts` checks three things: a token's value written by hand (`h-8 md:pointer-fine:h-control` where `h-control-small` is meant, also inside a `calc()`); a breakpoint on a property a token sets in the same class list, unless it is under a `web-only` comment; and a size that switches with the pointer (`py-3 pointer-fine:py-2`) where no token is read, unless it is under a `web-only` comment. The pointer switches written before the third check are listed in the test as sizes still to lift into tokens. The list only shrinks: a new switch fails, and so does an entry that is no longer in the code.

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

Usage: [Color](./color.md#surfaces) and [Hover overlays](./color.md#hover-overlays).

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

The control metrics: a default control's height, the small control's (`control-height-small`), its icon and hit area, and what a control embedded in a frame keeps: `control-embedded-inset`, its distance from the frame's outer edge and from its sibling, and `control-embedded-size`, a chip's or a button's height in a field ([Spacing](./spacing.md#heights), [Shape](./shape.md#inside-a-frame)).

```tokens
control
```

The bars and the items in them: a header's height and air, a bar button and its icon (`bar-icon-size`), a row's icon-only action (`row-action-size`, Button `icon-sm`), an item on the frame, the rail, and the switch's track ([Spacing](./spacing.md#heights), [Responsive layout](../patterns/responsive.md)).

```tokens
header
```

```tokens
bar-button
```

```tokens
bar-icon
```

```tokens
row-action
```

```tokens
frame-item
```

```tokens
rail
```

```tokens
switch
```

The rows: a sidebar row, an option of a popup list, and the inset of a settings row ([Spacing](./spacing.md#heights)).

```tokens
row
```

```tokens
option
```

```tokens
settings-row
```

The page: the gap between two sections of a form, and a page's top and inset ([Page structure](../patterns/page-structure.md#one-edge-per-column), [Desktop density](./desktop-density.md)).

```tokens
section
```

```tokens
page
```

The component tokens shared with the apps ([Component tokens](#component-tokens)): a row with an avatar and a preview (`list-row`), the toolbar over a list (`list-toolbar`), the avatar column a message row and a list row start with (`avatar-column`), and the phone tab bar the Android app draws itself (`mobile-nav`).

```tokens
list-row
```

```tokens
list-toolbar
```

```tokens
avatar-column
```

```tokens
mobile-nav
```

The timeline rhythm: the message step and the section step between the lines of a conversation, and the row inset each row keeps around its text ([Spacing](./spacing.md#timeline-rhythm)).

```tokens
timeline
```

The fade lengths: `fade-content` where content is cut across its height, `fade-edge` at the sides of a strip that scrolls ([Edges fade](./spacing.md#edges-fade)). And the dimmed opacity, for something present but not active ([Dimmed](./states.md#dimmed)).

```tokens
fade
```

```tokens
opacity
```

### Tokens defined in styles.css

These are Tailwind theme values in `styles.css`, not entries in `tokens.json`, so they have no generated table.

| Tokens | Owner |
| --- | --- |
| `radius-sticker`, `radius-chip`, `radius-control`, `radius-container`, `radius-dialog` | [Shape](./shape.md#radii) |
| `text-hero` to `text-label`, `text-mono-meta`, `text-mono-code`, `text-control`, each with a phone and a desktop value | [Typography](./typography.md#type-scale) |
| `ease-slide` | [Motion](./motion.md#easing) |
| `spacing-timeline-message`, `spacing-timeline-section`, `spacing-timeline-row` (the timeline tokens as spacing utilities) and `spacing-timeline-turn`, `spacing-timeline-lead`, `spacing-timeline-start`, `spacing-timeline-end`, derived from them. Products use only `timeline-start` and `timeline-end` | [Spacing](./spacing.md#timeline-rhythm) |
| `font-sans`, `font-heading`, `font-mono` | [Typography](./typography.md#font-families) |

## Former names

The names tokens had before the current ones were deprecated aliases up to raft-ui 0.56 and are removed after it. The codemod below still rewrites them, so code written against an older raft-ui can move in one step. The renames follow a few patterns:

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

One former utility name is still declared because an app uses it: `bg-fill-row-hover`, which paints `fill-subtle`. Use `bg-fill-subtle`.

### The codemod

raft-ui ships a codemod that rewrites the old names in Tailwind utilities (`bg-…`, `hover:border-…/50`) and in CSS custom properties (`var(--…)`):

```sh
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <dir-or-file>... [--dry]
```

- It rewrites `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css` and `.html` files, and skips `node_modules`, `dist` and `build`. `--dry` lists the files it would change.
- It renames references and leaves declarations alone, so running it twice is safe.
- Review the result by hand. A guard that forbade an old name (a lint rule, a test, an allowlist) now forbids the new one, and a pattern built from parts, such as a regular expression over class names, keeps the old name.
- The docs never use a deprecated name: `scripts/check-docs.mjs` fails a page that names a token in the `deprecated` group.

## Changing a token

- Add or change a value only in `tokens.json`, then regenerate `foundation.css` in the same change.
- Give a new token a name that follows the grammar above, and add its utility to `styles.css` if components need one.
- Add a component token only if it passes the rule in [Component tokens](#component-tokens), with a description that says why the web and the apps share it.
- Rename a token by keeping the old name in the `deprecated` group, pointing at the new one, and adding the rename to the codemod. Remove aliases only in a release that lists breaking changes (before 1.0, a minor version), once no app uses them.
- When a text, surface or tint value changes, recheck the contrast guarantees in [Color](./color.md#contrast) for both modes.
- Update the foundation page that owns the token in the same pull request ([Authoring](../authoring/README.md#changing-the-system)).

## Related

- [Color](./color.md): what each color token is for, and the contrast it guarantees.
- [Typography](./typography.md): the type styles and the metric tokens.
- [Elevation](./elevation.md): shadows and the focus ring.
- [Dark mode](./dark-mode.md): what changes between the modes.
