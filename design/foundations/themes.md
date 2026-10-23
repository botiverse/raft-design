---
title: Themes
summary: The themes a person can choose, what a theme may change and what it never changes, and the frame decorations.
---

# Themes

A theme changes the frame and the surfaces around the content. It never changes what a color means. Raft Yellow, the foundation itself, is the default; a person picks another theme for themselves, and it follows their account to every server.

## Principles

- **A theme is a frame, not a new palette.** It recolors the frame (the rail, the web top bar, the phone's top bar), the sidebar and, in dark mode, the dark surfaces. Content stays on white paper in light mode.
- **Meaning never changes.** The pink primary button, unread and @ counts, status lights, warnings and errors look the same in every theme, so a person who switches themes doesn't have to learn the product again.
- **Each theme has a light and a dark version.** In dark mode the canvas, sidebar, cards and popups take the theme's hue at low chroma. A neutral black panel inside a colored frame looked pasted on.
- **Decorations are optional.** A theme from the avatar series can draw its pixel sprites on the frame; the person can turn them off and keep the colors.

## The themes

| Theme | Frame | Decorations |
|---|---|---|
| Raft Yellow (default) | The foundation: yellow frame, cream sidebar | None |
| Boring Gray | Near-white frame and sidebar, gray selection; no yellow, no ink edge on selection | None |
| Bots, Critters, Space, Desk, Food, Quest, Weather, Plants, Spooky | One per avatar series in `design/assets/Agents`, colored after it | That series' sprites |

Boring Gray is the one theme that also changes the brand, so it is the one exception to "where you are is yellow" ([Navigation](../patterns/navigation.md), [States](./states.md)): `brand` and its washes become neutral grays and `brand-edge` is transparent, so selected rows are a plain gray fill. Its selection keeps ink type in both modes, like every sticker ([Color](./color.md)), so in dark mode it is a light gray.

## What a theme may change

- `layer-frame`, `layer-frame-active`, `foreground-on-frame` and its `-muted` and `-active` tiers, `fill-frame-medium`, `line-frame-active`: the frame.
- `layer-sidebar`.
- In dark mode, `layer-canvas`, `layer-card` and `layer-popover`, tinted to the theme's hue.
- Boring Gray only: `brand`, `brand-soft`, `brand-strong`, `brand-glow`, `brand-edge` and `selection`.

Anything else stays the foundation's value. A frame light enough for ink type uses ink on it and a white `layer-frame-active`; a dark frame uses light type and keeps the yellow selected item, as the dark-mode rail does ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).

## Decorations

A decorated theme draws its series' sprites, at 2× and 3× pixel scale, only where the frame is empty:

- on the web top bar, right of the search field (`frame-decor-top`), only from 1024px wide, where the centered search field leaves room for it;
- on the desktop rail, under its items (`frame-decor-rail`, drawn by AppRail's nav as its last item). It is laid out after the items, so it never sits behind one, and a rail with less room shows less of it.

Never put a sprite where it could be mistaken for a control, an avatar or a status, and never behind text.

## Using themes

- Import `@botiverse/raft-ui/themes.css` after `foundation.css`.
- Put `data-theme="<id>"` on the element that carries the mode class (`.light` / `.dark`; the app puts both on `<html>`). Without `data-theme` the app is Raft Yellow.
- Put `data-theme-decor="off"` on the same element to turn decorations off.
- A top bar the app draws itself takes the `frame-decor-top` utility; the rail draws its own.
- Themes are generated: edit `packages/ui/src/themes.json`, then run `vp run @botiverse/raft-ui#build:themes` (a test fails when `themes.css` is stale).

## Related

- [Color](./color.md): the tokens a theme overrides.
- [Dark mode](./dark-mode.md): what changes in dark mode, which every theme follows.
