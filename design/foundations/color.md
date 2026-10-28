---
title: Color
summary: The surface, text, line and role colors, what each color means, and the contrast they guarantee.
redirectFrom: [decisions/0010-neutral-toasts-and-tooltips, decisions/0017-soft-status-chips, decisions/0018-tertiary-text-contrast, decisions/0019-error-text-contrast, decisions/0020-stone-offline-light]
---

# Color

Color in Raft works in two ways. Surfaces get less color from the outside in: the yellow frame, then the cream sidebar, then white paper where content sits. On top of that, each brand color has one fixed meaning, so a color on screen always tells the person something: who they are, what waits for them, or what a status is. A color that means none of these is removed.

## Principles

- **Yellow goes on the frame only.** The frame is on every screen but nobody reads it, so color there costs almost nothing. Everything people read (messages, lists, cards, the content of pushed pages) sits on paper. The frame is the desktop rail, the web top bar and the top bar of a phone's top-level pages; see [Page structure](../patterns/page-structure.md).
- **Each color has one meaning.** Yellow is you, pink is to do, cyan is this item, orange interrupts, red is irreversible. Status colors are fixed too; see [Meanings of color](#meanings-of-color).
- **A block of brand color is a sticker.** It has a 1.5px ink edge and ink type on it, in both modes; see [Stickers](#stickers).
- **Notices are neutral.** Toasts and tooltips are dark gray (`layer-hud`), not a brand color, and no button is yellow. A notice is an aside: a yellow toast would compete with selection, and yellow means only "you" (where you are, what you selected, what calls you). A panel in a mode the person turned on, such as commenting, says so on the same dark gray, because a mode has no intent to tint ([ModeBar](../../packages/ui/src/components/mode-bar/mode-bar.md#why-it-is-dark)). That yellow stays yellow in every theme, Boring Gray included: it is information, so it has its own tokens, `you` and `selected` ([Themes](./themes.md#signals)).

## Tokens

### Surfaces

Surfaces step down in color from the frame inward. In light mode `layer-canvas`, `layer-card` and `layer-popover` are all white and are told apart by lines; in dark mode they are told apart by lightness, each one lighter than the one beneath it.

```tokens
layer
```

| Token | Use for |
| --- | --- |
| `layer-frame` | The frame: the top bar of a phone's top-level pages, the desktop rail, the web top bar |
| `layer-sidebar` | The desktop sidebar |
| `layer-canvas` | Paper: the desktop main area, every phone screen |
| `layer-card` | Raised containers: cards, inset groups, inputs, the composer, the tab bar |
| `layer-popover` | Popups: menus, drawers, bottom sheets, dialogs, profile cards |
| `fill-muted` | Sunken fills: tracks, inline code, skeletons, neutral tiles, reactions, thread previews |
| `layer-code` | Code blocks and command lines |
| `layer-hud` | Toasts, tooltips and the strip of a panel in a mode ([ModeBar](../../packages/ui/src/components/mode-bar/mode-bar.md)); text on it is `foreground-on-hud` and `foreground-on-hud-muted` |
| `layer-backdrop` | The scrim behind centered overlays, modal drawers, bottom sheets and the lightbox |
| `layer-backdrop-nested` | The lighter scrim under a modal surface opened from another one ([Stacked overlays](./elevation.md#stacked-overlays)) |
| `layer-veil` | The cover over something busy or loading in place: an image uploading or that failed to, a preview being prepared |

- **Three layers are translucent, by contract.** `layer-backdrop` and `layer-backdrop-nested` dim the page under a modal surface; `layer-veil` covers one thing that is busy, so it shows through, dimmed, under a spinner or a line that says what is happening. The veil is the page's color at 80% (white in light mode, `layer-canvas` in dark), so a default-color [Spinner](../../packages/ui/src/components/spinner/spinner.md#size) and `foreground` text read on it in both modes. It replaces the card and canvas colors at 75%, 80% and 90% that loading covers used before. Every other layer is opaque.
- **Dim a thumbnail on the scrim with the nested scrim.** The lightbox's thumbnails lie on `layer-backdrop`, dark in both modes, and the ones not shown are dimmed with `layer-backdrop-nested` (40%), 28% on hover (`/70`), never a raw black ([Lightbox](../../packages/ui/src/components/lightbox/lightbox.md)).

Fills are laid into or over a surface: the sunken fill and the hover overlays ([Hover overlays](#hover-overlays)).

```tokens
fill
```

### Text and icons

```tokens
foreground
```

| Token | Use for |
| --- | --- |
| `foreground` | Ink: body text, titles, control borders |
| `foreground-muted` | Secondary text: previews, descriptions, labels |
| `foreground-hint` | Tertiary text: times, IDs, group headings, placeholders |
| `foreground-disabled` | Disabled text and icons |
| `foreground-link` | Links in running text |
| `danger-strong` | Error text: the border and help text of an invalid input, a failed upload |

### Lines

There are three kinds of line, and each one means something. See [Shape](./shape.md#stroke-widths) for their widths.

```tokens
line
```

| Token | Meaning | Use for |
| --- | --- | --- |
| `line-hairline` | Inside content | List dividers, card outlines |
| `line-seam` | Between regions | Rail and sidebar, a header and its content, the edge of a menu, drawer or dialog |
| `line-strong` | This is a control | The 1.5px ink border of controls and the edge of stickers |
| `line-field` | This is a field | The 1.5px ink frame of a field and the composer, the same ink and width as `line-strong` |

Lines, secondary text and overlays are made from translucent steps of ink. Use the role tokens above; the steps are listed for reference.

```tokens
ink
```

### Color roles

```tokens
brand
```

`you` and `selected` are the yellow of the two things yellow means. They have the value of `brand` in Raft Yellow, but their own, not a reference to it, so a theme that grays the brand keeps them ([Themes](./themes.md#signals)).

| Token | Value, both modes | Use for |
| --- | --- | --- |
| `you` | `oklch(0.8829 0.1623 91.9)` | What is addressed to you: a mention of you, the sidebar's @ marker, a search hit, the passage of the comment you opened |
| `selected` | `oklch(0.8829 0.1623 91.9)` | The selected sticker: where you are (a sidebar row, a segment, a tab, the tab bar's item, the current step) and what is on (a switch, a pressed toggle or panel action) |

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

## Meanings of color

| Color | Role | Means | Use for |
| --- | --- | --- | --- |
| Yellow | `brand`, `you`, `selected` | You | The frame, the location tile of the place you are in, your server (the workspace tile, yellow on ink): `brand`. A mention of you, search hits, the passage of the comment you opened: `you`. The selected item in navigation, an on switch: `selected` |
| Pink | `attention` | To do | At most one primary button per screen; unread counts and attention dots |
| Cyan | `info` | This item, information | In Progress, runtimes, external agents, progress bars; `info-soft` for the item singled out in content, an active filter, an info banner |
| Orange | `warning` | Interrupts | Buttons that stop, leave or reset; warnings; Todo; the error presence light |
| Red | `danger` | Irreversible | Delete buttons |
| Lime | `success` | Done | Done, online, success banners, a read mention (a bare check: `read-mark`, `palette-lime-700` in light mode, the online lime in dark mode) |
| Lavender | `palette-lavender-*` | — | In Review, and people without a photo |
| Stone | `inactive` | Closed | Closed, offline |

- Use orange when something goes wrong: red is only for consequences that cannot be undone.
- Use blue (`foreground-link`) only for links in running text. It is a deep, quiet blue, close to the link blue of Claude's apps and docs: in light mode it has about half the chroma of a bright link blue, so it sits beside black ink and yellow without being the loudest thing on a page full of links, and it still reads as a link at a glance. Dark mode uses the same blue, lightened to read on the dark canvas.
- Lime, lavender and stone only mark a status. Don't use them for anything else.

### Warnings in charts

A failure or warning drawn as a graphic, such as a failed route in a migration chart or a failed bar, is filled or stroked with `warning-graphic`. A chart mark is read by its shape and color alone, with no ink edge, so it needs the 3:1 against what it sits on that [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks of graphics. The `warning` sticker orange is 2.04:1 on white: enough with a sticker's edge, too faint for a bare mark.

| Mode | `warning-graphic` | Canvas | Sidebar | Card | Popover |
| --- | --- | --- | --- | --- | --- |
| Light | `oklch(0.64 0.16 50)` | 3.56:1 | 3.42:1 | 3.56:1 | 3.56:1 |
| Dark | `oklch(0.77 0.135 50)` | 7.98:1 | 9.00:1 | 7.20:1 | 6.75:1 |

- Keep the warning hue (50) and change only lightness and chroma, so the mark reads as the same orange as the warning around it.
- Use it for graphics only: a fill, a stroke, a marker, a legend swatch. Text about the failure, a value label or a legend entry's words take `warning-strong`, which is deep enough for text; `warning-graphic` is 3.56:1, under the 4.5:1 text needs.
- A failure in a chart is `warning-graphic`, not `danger`: red is only for what cannot be undone.

### Statuses

Tasks and presence each have five colors, and they never change meaning. Task statuses are spelled Todo, In Progress, In Review, Done and Closed.

```tokens
task-status
```

| Task status | Token | Presence light | Token |
| --- | --- | --- | --- |
| Todo (orange) | `task-status-todo` | Online (lime) | `presence-online` |
| In Progress (cyan) | `task-status-in-progress` | Busy (yellow) | `presence-busy` |
| In Review (lavender) | `task-status-in-review` | Error (orange) | `presence-error` |
| Done (lime) | `task-status-done` | Offline (stone) | `presence-offline` |
| Closed (stone) | `task-status-closed` | External agent (cyan) | `presence-external` |

```tokens
presence
```

The sixth presence swatch, `presence-busy-soft`, is not a light: it is the tint of the Working chip ([Soft tints](#soft-tints)).

- Put a status chip on its `task-status-*-soft` tint.
- `presence-busy` has its own value instead of pointing at `brand`, so that a change of brand color doesn't change what busy looks like, and neither does a theme: Boring Gray grays `brand`, and a working agent stays yellow ([Themes](./themes.md#signals)). The Working chip's tint, `presence-busy-soft`, is its own copy of `brand-soft` for the same reason.
- `presence-offline` is stone from the palette, not a default gray: raft-ui doesn't use Tailwind's default palette, so every presence light comes from the same palette.
- Presence lights never blink; see [Motion](./motion.md).

A read mention is marked by a bare check, not a light, in its own token: `read-mark` is `palette-lime-700` in light mode (6.2:1 on white) and the online lime in dark mode (10.5:1 on the dark canvas). The online lime alone is 1.64:1 on white, enough inside a light's ink edge but not for a bare 10px check ([Read receipts on a mention](../../packages/ui/src/components/message-item/message-item.md#read-receipts-on-a-mention)).

```tokens
read-mark
```

### Soft tints

A soft tint (`*-soft`) is a highlight, never a sticker: it has no border.

- Draw status chips and runtime chips as a soft tint, with one square pixel or an icon carrying the saturated color, not as a saturated fill with an ink border. A screen can hold a dozen of them, and when the saturated color is only one pixel large, the screen stays quiet.

| Tint | Use for |
| --- | --- |
| `brand-soft` | Menu highlight |
| `presence-busy-soft` | The Working chip |
| `info-soft` | The selected item in content, filters, info banners, runtime chips, thread references, a message inside a notification |
| `attention-soft` | Channel references, a reaction you added |
| `success-soft` | Success banners, the Done chip |
| `warning-soft` | Warning banners, the Todo chip, errors and warnings in notifications |
| `danger-soft` | Danger banners |
| `task-status-in-review-soft` | The In Review chip |
| `task-status-closed-soft` | The Closed chip |

- Draw a used-up usage meter's track in `warning-muted` with a 1px `warning` edge, not `warning-soft`: on the dark canvas `warning-soft` is 1.16:1, fainter than an empty track, and a soft tint can't take an edge ([Meter](../../packages/ui/src/components/meter/meter.md)).

### Text selection

Selected text has its own token, `selection`. A selection has to show clearly where it starts and ends against the page, while the text on it stays easy to read; a menu row's highlight only has to mark one row. The two needs part in dark mode, so they don't share a value.

| Mode | `selection` | Against the canvas | Selected text |
| --- | --- | --- | --- |
| Light | `brand-soft` | 1.14:1 | 16.5:1, APCA Lc 96 |
| Dark | `brand` over the page at 22%, the wash of a commented passage ([Comment](../../packages/ui/src/components/comment/comment.md#highlights)) | 1.77:1 | 7.7:1, APCA Lc 80 |

- In dark mode `brand-soft` left a selection at 1.23:1 against the canvas, so it was hard to see what was selected. 30% would reach 2.25:1 but drop the selected text to Lc 74, under the Lc 75 that body text needs; 22% keeps both.
- Paint `::selection` (Tailwind's `selection:` variant) with `selection` and leave the text its own color.

### Hover overlays

Hover and press lay a translucent overlay over a control instead of changing its fill, in two tiers; see [Hover and press](./states.md#hover-and-press).

| Token | Tier | Over |
| --- | --- | --- |
| `fill-subtle` | Subtle | Hover on a row, a message or a readable card (a comment, attachment or task card, the replies bar), and a row with its menu open |
| `fill-medium` | Medium | Hover on paper-colored controls (buttons, icon buttons, chips, tabs, segments) and press on everything |
| `sticker-medium` | Medium | Hover and press on a colour sticker |
| `fill-frame-medium` | Medium | Hover and press on anything on the frame |

`fill-subtle` is lighter than every selection tint, so a hovered row never looks selected and its text keeps its contrast. The names these tokens had before the two tiers keep working as deprecated aliases until raft-ui 1.0; `codemods/token-names.mjs` renames them.

## Stickers

A sticker is a block of brand color: avatars, the selected item, the location tile, the primary button, badges.

- Give every block of brand color a 1.5px `line-strong` edge: stickers and paper are only 1.4:1 to 2.8:1 apart, so without an edge a sticker doesn't hold its shape.
- Put ink type on a sticker (`sticker-ink`), never white, in both modes.
- Don't invert stickers in dark mode. Sticker colors have the same value in both modes; dark mode adds the die-cut edge instead (see [Dark mode](./dark-mode.md)).
- Don't put a shadow on a control. The hard sticker shadow is only for brand illustration; see [Elevation](./elevation.md).

```tokens
sticker
```

## Contrast

- `foreground`, `foreground-muted` and `foreground-hint` are at least 4.5:1 on every surface, every soft tint and every popup, in both modes, and on a hovered row over any of them. There are no exceptions to remember.
- `foreground-hint` is slightly darker in light mode and lighter in dark mode than 60% ink, the value the product used before it adopted these tokens, which fails 4.5:1 on some tints and popups. Tertiary text carries times, IDs and counts people need to read, so it gets the same guarantee as body text.
- Error text and the border of an invalid input use `danger-strong`, a dark red at 6.1:1 on paper. The brighter reds the product used before were 4.2:1 and 2.8:1 on white, below the 4.5:1 text needs. The delete button keeps `danger`, because the text on it is ink.
- Ink on a sticker is at least 6.8:1.
- `line-seam` is 3.0:1 on white and 2.8:1 on yellow.

## Palette

The role tokens point at a small palette. Use the palette directly only where no role fits, such as lavender for people without a photo. The palette tokens are `palette-<color>-<step>`, with the bare utilities `bg-palette-<color>`.

```tokens
palette
```

## Related

- [Dark mode](./dark-mode.md): what changes and what stays in dark mode.
- [Themes](./themes.md): the themes a person can pick and what each may change.
- [States](./states.md): the colors of hover, selection, unread and error.
- [Brand](./brand.md): how much brand color each kind of page may use.
- [Button](../../packages/ui/src/components/button/button.md): which button color to use for which action.
