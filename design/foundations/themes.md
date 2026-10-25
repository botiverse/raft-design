---
title: Themes
summary: The themes a person can choose, what a theme may change and what it never changes, and the frame decorations.
---

# Themes

A theme changes the frame and the surfaces around the content. It never changes what a color means. Raft Yellow, the foundation itself, is the default; a person picks another theme for themselves, and it follows their account to every server.

## Principles

- **A theme is a frame, not a new palette.** It recolors the frame (the rail, the web top bar, the phone's top bar), the sidebar and, in dark mode, the dark surfaces. Content stays on white paper in light mode.
- **Meaning never changes.** The pink primary button, unread and @ counts, status lights, warnings and errors look the same in every theme, so a person who switches themes doesn't have to learn the product again.
- **A theme quiets the environment, never information.** What is addressed to you (`you`) and what is selected or on (`selected`) keep Raft yellow in every theme, Boring Gray included ([Signals](#signals)). The frame is the exception: the rail, and anything on the frame (a segmented control with `variant="on-frame"`), is environment, so its selected item takes the theme's frame colors (`layer-frame-active`), not `selected`.
- **Each theme has a light and a dark version.** In dark mode the canvas, sidebar, cards and popups take the theme's hue at low chroma. A neutral black panel inside a colored frame looked pasted on.
- **Decorations are optional.** A theme from the avatar series can draw its pixel sprites on the frame; the person can turn them off and keep the colors.

## The themes

| Theme | Frame | Decorations |
|---|---|---|
| Raft Yellow (default) | The foundation: yellow frame, cream sidebar | None |
| Boring Gray | Near-white frame and sidebar, gray brand art and washes; yellow only where something is selected or addressed to you | None |
| Bots, Critters, Space, Desk, Food, Quest, Weather, Plants, Spooky | One per avatar series in `design/assets/Agents`, colored after it | That series' sprites |

Boring Gray is the one theme that also changes the brand. Besides its gray frame and sidebar, `brand` and its washes become neutral grays: the brand art (the panel header's icon sticker, the workspace tile's letter), the popup cursor (`brand-soft` on menu, option and suggestion rows), the wash under commented passages and selected text. That is the environment a person who picks Boring Gray opts out of. The yellow that is left is small and local, one row, one segment or one chip, and it appears only where something is selected or addressed to you ([Signals](#signals)).

## Signals

Yellow carries two meanings in Raft, and both are information, not decoration ([Meanings of color](./color.md#meanings-of-color)). They have their own tokens, which point at the raw yellow instead of `brand`, so no theme reaches them:

| Token | Means | Use for |
|---|---|---|
| `you` | Addressed to you | A mention of you (`MessageReferenceText variant="primary"`), the sidebar's @ marker (`SidebarItemIndicator`), a search hit, the passage of the comment you opened |
| `selected` | Where you are, what is on | The active sidebar row, the selected segment, tab and tab bar item, a pressed toggle or panel action, an on switch, the current step |

- Only on paper. On the frame (the rail's selected item, an `on-frame` segmented control) the selection is the theme's `layer-frame-active` and `line-frame-active`: white in light themes, gray in Boring Gray. The frame is the environment a theme recolors.
- Each keeps the sticker's 1.5px ink edge (`sticker-ink`) and ink type, in every theme.
- Gray can't stand in for them. When Boring Gray painted them with its gray `brand`, a selected segment was ΔE 1.4 (OKLab × 100) from a hovered one in light mode, under the 2 a person can notice; the selected sidebar row was 5.0 from the sidebar and a mention of you 7.5 from the page. The yellow is 16.5 to 20. A gray dark enough to match it is a mid-gray slab, heavier than the yellow it replaces. `themes.contrast.test.ts` holds every theme to ΔE 10.
- Paint a new "you" signal or a selected sticker with these tokens, not with `brand`: `brand` is the environment and follows the theme.

## What a theme may change

- `layer-frame`, `layer-frame-active`, `foreground-on-frame` and its `-muted` and `-active` tiers, `fill-frame-medium`, `line-frame-active`: the frame.
- `layer-sidebar`.
- In dark mode, `layer-canvas`, `layer-card` and `layer-popover`, tinted to the theme's hue.
- Boring Gray only: `brand`, `brand-soft`, `brand-strong`, `brand-glow`, `brand-edge` and `selection`.

Anything else stays the foundation's value. No theme changes `you` or `selected` ([Signals](#signals)). A frame light enough for ink type uses ink on it and a white `layer-frame-active`; a dark frame uses light type and keeps the yellow selected item, as the dark-mode rail does ([0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)).

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
