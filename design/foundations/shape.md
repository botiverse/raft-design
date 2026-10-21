---
title: Shape
summary: The five radii, the two stroke widths, and why nothing is attached to the edge of a rounded container.
redirectFrom: [decisions/0021-square-dots-and-spinner, decisions/0026-upload-progress-track]
---

# Shape

Square is Raft. Every identity is a square sticker and every dot is a square pixel; pixels are hard and containers are soft. Round is only for switches and radios, which follow platform convention.

## Principles

- **Identities and dots are square.** Avatars, workspace tiles, channel tiles, presence lights, attention dots and pixel spinners all use square pixels. A round dot or a ring spinner would be the one round mark among square pixels; the square pixel is the brand's own shape ([Principles](../principles/principles.md#6-square-is-raft)).
- **Round only for switches and radios.** Nothing else uses a full radius.
- **Two stroke widths.** 1px for lines, 1.5px for every control, field and sticker.

## Radii

| Token | Use for |
| --- | --- |
| `radius-sticker` | The pixel family: avatars, workspace tiles, channel tiles, checkboxes, badges, steps, skeletons; inline marks in running text (inline code, a mention of you, search hits, reference chips) |
| `radius-chip` | Chips (value chips, the chips in a field, task markers, reactions), tooltips, the highlighted item in a popup, and every control embedded in another component's frame ([Inside a frame](#inside-a-frame)) |
| `radius-control` | Controls and selection stickers that stand on their own: buttons, inputs, selects, filters, segmented controls, tabs, sidebar rows, rail items, the tab bar's icon sticker, the workspace button |
| `radius-container` | Containers: cards, inset groups, the composer, banners, menus, toasts, profile cards, file cards |
| `radius-dialog` | Dialogs, and the top corners of bottom sheets |
| `rounded-full` | Switches and radios only |

- Use a 2px radius for presence lights and the images inside avatars at 9px to 11px: they are too small for `radius-sticker`.

## Inside a frame

The radius belongs to the element; the space around it adapts to the frame it sits in. Frames keep their own radius whatever they hold: a field and the composer, a card, a popup, a toolbar and a dialog never round off to fit what is inside them, because hard edges are Raft's.

| Element | Radius | Space to the frame's outer edge | Between two of them |
| --- | --- | --- | --- |
| A Button standing on its own | `radius-control` | — | — |
| A control embedded in another component's frame: the clear, toggle and end buttons of a field, the composer's buttons and its send button, the buttons of a floating toolbar (message hover toolbar, text selection toolbar, the lightbox's info bar, the multi-select bar), the corner action of a card or of media (a code block's copy, a video, a gallery image, a file card's download) | `radius-chip` | 6px in a field, the composer and a corner; 4px in a floating toolbar | The same as the space to the frame |
| A chip in a field | `radius-chip`, its remove button `radius-sticker` | 6px; the remove button 2px inside the chip | 6px |
| The highlighted item in a popup | `radius-chip` | 4px | 0 |
| The thumb of a segmented control or toggle group | `radius-control` | 3px | 3px |

- **One shape for one kind of thing.** The same small button wears the same corner in a field, the composer, a card corner and a toolbar, and the same corner as the chips beside it. At `radius-control` a 20px button in a field reads almost round; under `radius-chip` it reads hard.
- **The space is even on every side.** A control embedded in a frame sits the same distance from the frame's top, bottom and side, and two of them sit that distance apart, so no gap is wider than the others. In a field the embedded controls and chips are the field's height less that space on both sides: 20px on a desktop and 32px on a phone, and the field stays 32px or 44px tall with chips in it.
- **A floating toolbar leaves 4px around its buttons**, so the buttons' corners sit evenly inside the toolbar's: at 2px the corners left a wider gap than the sides. The message hover toolbar is 36px tall.
- **Close to the frame, the inner corner follows the frame's.** A popup's highlight 4px inside the popup and a segmented thumb 3px inside its track run close to the frame's arc, so they take a radius that keeps the gap even around the corner: the popup's 10px over its highlight's `radius-chip`, the track's 11px over its thumb's `radius-control`. Further inside, as a chip 6px inside a field is, the element reads as an object of its own and simply wears its own radius.
- **Nothing covers content.** A corner action that sits on content, as a code block's copy button does when the block has no header, reserves its column: the content stops short of the button on every line.
- A focus ring that its host would clip, as on a chip's remove button, is drawn inside the element.

## Stroke widths

| Width | Use for |
| --- | --- |
| 1px | `line-hairline` and `line-seam`: lines inside content and between regions |
| 1.5px | `line-strong`: the ink border of buttons and other controls, the edge of stickers, chips with an ink edge and the selected row; `line-field`, the same ink around a field: Input, Textarea, InputGroup, Select, Combobox, ComboboxSelect, the search field, the composer and an option card |

- Draw a field's frame at 1.5px, like a button's. A field sits beside its send button, its submit button and the selected row, all at 1.5px ink; at 1px it was the one thin control among them and read as a lighter style rather than the same Raft. Ink at one weight keeps the system's hard edge. Focus, an error and selection mark a field on top of it.

- Draw the presence light on a 99px avatar with a 2px edge, scaled up with the avatar.
- The 2px bar before a quote is a mark, not a line.
- A 3px to 4px progress bar is a line in itself: it has no border.

## Nothing on the edge of a rounded container

Don't attach a progress bar, a colored band or a thicker accent border to one edge of a rounded container (a card, file card, input, composer or thumbnail): where it meets the corner, it is cut into an odd shape.

- Put progress inside the container, on its own 4px track: 2px radius, `fill-muted` track (`layer-card` over an image), cyan progress. Progress is cyan, not pink: it is a passive indicator, and pink means to do.
  - In a file card, put it under the file name, aligned with the text.
  - In a thumbnail, inset it 6px from all four edges.
- To emphasize a whole container, change its fill or its border. Don't add a band to one edge.

## Related

- [Color](./color.md#lines): what each line means.
- [Elevation](./elevation.md): shadows and the focus ring.
- [Feedback](../patterns/feedback.md): when to show progress.
