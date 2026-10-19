---
title: Shape
summary: The five radii, the two stroke widths, and why nothing is attached to the edge of a rounded container.
---

# Shape

Square is Raft. Every identity is a square sticker and every dot is a square pixel; pixels are hard and containers are soft. Round is only for switches and radios, which follow platform convention.

## Principles

- **Identities and dots are square.** Avatars, workspace tiles, channel tiles, presence lights, attention dots and pixel spinners all use square pixels.
- **Round only for switches and radios.** Nothing else uses a full radius.
- **Two stroke widths.** 1px for lines, 1.5px for controls and stickers.

## Radii

| Token | Use for |
| --- | --- |
| `radius-sticker` | The pixel family: avatars, workspace tiles, channel tiles, checkboxes, badges, steps, skeletons; inline marks in running text (inline code, a mention of you, search hits, reference chips) |
| `radius-chip` | 22px chips, task markers, value chips, reactions, tooltips |
| `radius-control` | Controls and selection stickers: buttons, inputs, selects, filters, segmented controls, tabs, sidebar rows, rail items, the tab bar's icon sticker, menu items, the workspace pill |
| `radius-container` | Containers: cards, inset groups, the composer, banners, menus, toasts, profile cards, file cards |
| `radius-dialog` | Dialogs, and the top corners of bottom sheets |
| `rounded-full` | Switches and radios only |

- Use a 2px radius for presence lights and the images inside avatars at 9px to 11px: they are too small for `radius-sticker`.

## Stroke widths

| Width | Use for |
| --- | --- |
| 1px | `line-hairline` and `line-seam` |
| 1.5px | `line-strong`: the ink border of controls and the edge of stickers |

- Draw the presence light on a 99px avatar with a 2px edge, scaled up with the avatar.
- The 2px bar before a quote is a mark, not a line.
- A 3px to 4px progress bar is a line in itself: it has no border.

## Nothing on the edge of a rounded container

Don't attach a progress bar, a colored band or a thicker accent border to one edge of a rounded container (a card, file card, input, composer or thumbnail): where it meets the corner, it is cut into an odd shape.

- Put progress inside the container, on its own 4px track: 2px radius, `fill-muted` track (`layer-card` over an image), cyan progress.
  - In a file card, put it under the file name, aligned with the text.
  - In a thumbnail, inset it 6px from all four edges.
- To emphasize a whole container, change its fill or its border. Don't add a band to one edge.

## Related

- [Color](./color.md#lines): what each line means.
- [Elevation](./elevation.md): shadows and the focus ring.
- [Feedback](../patterns/feedback.md): when to show progress.
