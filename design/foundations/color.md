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
- **Notices are neutral.** Toasts and tooltips are dark gray (`layer-hud`), not a brand color, and no button is yellow. A notice is an aside: a yellow toast would compete with selection, and yellow means only "you" (where you are, what you selected, what calls you).

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
| `layer-hud` | Toasts and tooltips; text on it is `foreground-on-hud` and `foreground-on-hud-muted` |
| `layer-backdrop` | The scrim behind centered overlays, modal drawers, bottom sheets and the lightbox |
| `layer-backdrop-nested` | The lighter scrim under a modal surface opened from another one ([Stacked overlays](./elevation.md#stacked-overlays)) |

Fills are laid into or over a surface: the sunken fill and the pressed overlays ([Pressed overlays](#pressed-overlays)).

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
| Yellow | `brand` | You | The frame, the selected item in navigation, an on switch, the location tile of the place you are in, a mention of you, search hits, the passage of the comment you opened; your server (the workspace tile, yellow on ink) |
| Pink | `attention` | To do | At most one primary button per screen; unread counts and attention dots |
| Cyan | `info` | This item, information | In Progress, runtimes, external agents, progress bars; `info-soft` for the item singled out in content, an active filter, an info banner |
| Orange | `warning` | Interrupts | Buttons that stop, leave or reset; warnings; Todo; the error presence light |
| Red | `danger` | Irreversible | Delete buttons |
| Lime | `success` | Done | Done, online, success banners |
| Lavender | `palette-lavender-*` | — | In Review, and people without a photo |
| Stone | `inactive` | Closed | Closed, offline |

- Use orange when something goes wrong: red is only for consequences that cannot be undone.
- Use blue (`foreground-link`) only for links in running text.
- Lime, lavender and stone only mark a status. Don't use them for anything else.

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

- Put a status chip on its `task-status-*-soft` tint.
- `presence-busy` has its own value instead of pointing at `brand`, so that a change of brand color doesn't change what busy looks like.
- `presence-offline` is stone from the palette, not a default gray: raft-ui doesn't use Tailwind's default palette, so every presence light comes from the same palette.
- Presence lights never blink; see [Motion](./motion.md).

### Soft tints

A soft tint (`*-soft`) is a highlight, never a sticker: it has no border.

- Draw status chips and runtime chips as a soft tint, with one square pixel or an icon carrying the saturated color, not as a saturated fill with an ink border. A screen can hold a dozen of them, and when the saturated color is only one pixel large, the screen stays quiet.

| Tint | Use for |
| --- | --- |
| `brand-soft` | Menu highlight, the busy chip, text selection |
| `info-soft` | The selected item in content, filters, info banners, runtime chips, thread references, a message inside a notification |
| `attention-soft` | Channel references, a reaction you added |
| `success-soft` | Success banners, the Done chip |
| `warning-soft` | Warning banners, the Todo chip, errors and warnings in notifications |
| `danger-soft` | Danger banners |
| `task-status-in-review-soft` | The In Review chip |
| `task-status-closed-soft` | The Closed chip |

### Pressed overlays

Hover and press lay a translucent overlay over a control instead of changing its fill; see [States](./states.md).

| Token | Over |
| --- | --- |
| `fill-pressed` | Paper-colored controls and content: press everywhere, and hover on buttons |
| `fill-row-hover` | Hover on a row: a sidebar item, a list row, an inbox item, a search result, a table row, a file row, a comment card |
| `fill-message-hover` | Hover on a message |
| `fill-row-open` | Any row with its menu open: a message, a sidebar item, a list row, an inbox item, a search result, a table row, a file row |
| `sticker-pressed` | Stickers |
| `fill-frame-pressed` | Anything on the frame |

The two row hovers, and `fill-row-open`, are lighter than `fill-pressed` and than every selection tint, so a hovered row never looks selected and its text keeps its contrast. The values and the reasons are in [Row hover](./states.md#row-hover).

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
- [States](./states.md): the colors of hover, selection, unread and error.
- [Brand](./brand.md): how much brand color each kind of page may use.
- [Button](../../packages/ui/src/components/button/button.md): which button color to use for which action.
