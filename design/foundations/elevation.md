---
title: Elevation
summary: Which things float and cast a shadow, how popups are positioned, and the focus ring.
---

# Elevation

Controls and cards sit flat on the page. Only things that float above it (menus, popups, dialogs, toasts) cast a shadow, and they all cast the same soft one.

## Principles

- **No shadow on controls and cards.** A control is marked by its ink border, not a shadow.
- **One soft shadow for everything that floats.**
- **The hard sticker shadow is for brand illustration only.**

## Tokens

```tokens
elevation
```

```tokens
focus
```

| Token (utility) | Use for |
| --- | --- |
| `elevation-float` (`shadow-float`) | Menus, select lists, drawers, bottom sheets, dialogs, profile cards, tooltips, toasts |
| `elevation-sticker` (`shadow-sticker`) | Brand illustration only: the 99px avatar on a profile and on the last setup step, and the workspace preview on the page that creates a workspace ([Brand](./brand.md#how-much-brand)). Nothing else |
| `focus-ring` (`shadow-focus`) | Every element that can be reached with the keyboard |

## Popups

Menus, select and filter lists, and profile cards open next to the element that opened them.

- Float popups above the whole page. They never take space in the layout.
- Move or flip a popup to the other side when it meets the window edge, and never make it larger than the space left.
- Don't scroll or shift the page when a popup opens or when someone types in it.

## Focus ring

`focus-ring` is a 2px gap in the surface color followed by 2px of ink.

- Give every element that can be reached with the keyboard a visible focus ring.
- Use an inset 2px ink outline instead for elements that touch the edge of their container, such as the search row of a menu.
- Keep a sticker's own ink edge when it takes focus (a mention marker, a selected sidebar row, a filter), and draw the focus ring outside it. Don't replace the edge with the ring.
- Which part of a compound control shows the ring is in [States](./states.md#focus).

## Related

- [States](./states.md): hover, press and focus.
- [Brand](./brand.md): where the sticker shadow may appear.
- [Choosing a component](../patterns/choosing-components.md): which popup to use.
