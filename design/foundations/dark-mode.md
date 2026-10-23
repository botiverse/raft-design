---
title: Dark mode
summary: What changes in dark mode, what stays the same, and the die-cut edge that every sticker gets.
---

# Dark mode

In dark mode the surfaces, ink, lines and tints change; the stickers don't. A sticker keeps its color and its ink type, and gains a die-cut edge so it still separates from the dark surface around it.

## Principles

- **Surfaces get lighter inward.** The frame and sidebar are the darkest; paper, cards, popups and sunken fills each step lighter.
- **Stickers never invert.**
- **Check every new component in both modes.**

## What changes

- Surfaces: `layer-frame` and `layer-sidebar`, then `layer-canvas`, `layer-card`, `layer-popover` and `fill-muted`, each lighter than the one before. The values are in [Color](./color.md#surfaces).
- Ink, lines and soft tints.
- The colors of the task status pixels.
- The frame is a neutral dark, not yellow. The selected item on the rail is still a yellow sticker: it means "you are here", which is not part of the frame.

## What stays the same

Stickers keep their color and ink type: avatars, pink buttons, yellow selection, switches, the location tile, badges, the workspace tile (yellow on ink) and reactions.

## The die-cut edge

A sticker's edge is ink, which disappears against a dark surface. In dark mode every sticker gets a die-cut edge (`sticker-edge`) outside its ink edge.

- Add the die-cut edge to every sticker:
  - avatars;
  - yellow selection: sidebar rows, rail items, tabs, segmented controls, toggle groups, the phone tab bar;
  - pink, orange and red buttons (not when disabled: a disabled button is no longer a sticker);
  - switches;
  - count and @ badges;
  - reply counts.
- A mention of the person reading in a message's text is the exception. It is a chip in running text, the size of the chips beside it and 2px shorter than its line, so it keeps only its ink edge, drawn inside ([Chips in running text](../../packages/ui/src/components/message-item/message-item.md#chips-in-running-text)).
- The die-cut edge sits outside the sticker's box. So the box aligns to the grid and the visible edge aligns with it: in dark mode an avatar and a tab sticker line up, instead of being 3px apart.
- Don't clip a container that holds stickers, because the edge sits outside the box. Truncate only text: keep chips, badges and avatars in a row outside the text that is cut off with an ellipsis.

## Related

- [Color](./color.md): the tokens and their values in both modes.
- [Brand](./brand.md#reactions): reactions in dark mode.
