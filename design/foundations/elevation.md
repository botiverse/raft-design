---
title: Elevation
summary: Which things float and cast a shadow, how popups are positioned, and the focus ring.
redirectFrom: [decisions/0015-ink-focus-ring, decisions/0036-popup-positioning]
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
| `elevation-float` (`shadow-float`) | Menus, select lists, drawers, bottom sheets, dialogs, profile cards, tooltips, toasts, and a card while it is dragged (it is lifted off the board; the card left behind casts nothing) |
| `elevation-sticker` (`shadow-sticker`) | Brand illustration only: the 99px avatar on a profile and on the last setup step, and the preview of the new server on the page that creates a server ([Brand](./brand.md#how-much-brand)). Nothing else |
| `focus-ring` (`shadow-focus`) | Every element that can be reached with the keyboard, when the keyboard reaches it |

## Popups

Menus, select and filter lists, and profile cards open next to the element that opened them. The same rules hold in every component, so no popup runs off a narrow screen or moves the page under the person.

- Float popups above the whole page. They never take space in the layout.
- Move or flip a popup to the other side when it meets the window edge, and never make it larger than the space left.
- Don't scroll or shift the page when a popup opens or when someone types in it.

## Stacked overlays

A modal surface (a dialog, an alert dialog, a modal sheet) dims everything under it with a scrim, so the one thing that can be used is the one on top. When one opens from another, the same must stay true: the surface below has to step back, or a white dialog sits on a white sheet with nothing to say which of the two is live.

- Put a scrim directly under every modal surface, including one opened from another. The scrim is what says "this is on top"; a shadow alone doesn't.
- The first surface gets `layer-backdrop`. One opened from it gets the lighter `layer-backdrop-nested` (40% in both themes), so the surface below dims without the page going black. In light mode one scrim leaves a white page at about 35% of its light, and two full ones would leave 12%; with the nested scrim it keeps about 21%. In dark mode the first scrim is 60%, and the nested 40% still leaves the dark surface below visibly stepped back without merging it into the page.
- Stack at most two modal surfaces. When a third would open, replace the top one, or move the flow to a page.
- A sheet opened from a sheet is the exception: the one below steps back by itself instead ([Drawer](../../packages/ui/src/components/drawer/drawer.md#behavior)).

raft-ui does this on its own. A modal `Dialog`, `AlertDialog` or `Drawer` tells everything under its root that it is open, the same way Base UI decides a dialog is nested, so a dialog, an alert dialog or a sheet opened under it draws the nested scrim. A non-modal one doesn't count: nothing below it is dimmed. Base UI draws no scrim for a nested dialog by default, which is how a confirm opened from a sheet came to sit on an undimmed sheet.

## Focus ring

`focus-ring` is a 2px gap in the surface color followed by 2px of ink. It is ink, not yellow: a yellow ring would disappear on the yellow frame and on yellow stickers.

- Give every element that can be reached with the keyboard a visible focus ring.
- Show it only after keyboard navigation, not after a click or a tap ([States](./states.md#focus)). The token itself is emptied while the root says `data-input-modality="pointer"`, so `shadow-focus` follows the rule on its own.
- Use an inset 2px ink outline instead for elements that touch the edge of their container, such as the search row of a menu. It is not the token, so it takes the `keyboard:` variant (`focus-visible:keyboard:inset-ring-2`) to follow the same rule.
- Keep a sticker's own ink edge when it takes focus (a mention marker, a selected sidebar row, a filter), and draw the focus ring outside it. Don't replace the edge with the ring.
- Which part of a compound control shows the ring is in [States](./states.md#focus).

## Related

- [States](./states.md): hover, press and focus.
- [Brand](./brand.md): where the sticker shadow may appear.
- [Choosing a component](../components/overview.md#how-to-choose-a-component): which popup to use.
