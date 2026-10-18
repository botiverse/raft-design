---
title: Color
summary: The surfaces, ink, lines and signal colors, what each one means, and the contrast they guarantee.
placeholder: true
---

# Color

Color in Raft carries meaning before it decorates. Yellow is reserved for the frame and for "you"; content sits on white paper; every colored block is a sticker with an ink edge.

## Principles

- **Yellow only on the frame.** The frame is on every screen and nobody reads it, so color costs little there. Everything people read is on paper.
- **Less color toward the content.** Yellow frame, cream sidebar, white paper.
- **Colored blocks are stickers.** Every brand-colored block has a 1.5px ink edge, and the text on it is always ink, in both modes.
- **A color is an identity, a state, a signal or a consequence.** If it is none of these, remove it.

## Surfaces

From the outside in, each layer has less color than the one around it.

```tokens
layer
```

## Ink and lines

Three lines, three meanings: the hairline inside content, the seam between regions, the ink line on controls.

```tokens
foreground
```

```tokens
line
```

## Signals

| Color  | Means                  | Used for                                                         |
| ------ | ---------------------- | ---------------------------------------------------------------- |
| Yellow | You                    | The frame, selection in navigation, mentions of you, search hits |
| Pink   | To do                  | The one primary action per screen, unread counts                 |
| Cyan   | This item, information | Selection in content, in progress, information banners           |
| Orange | Interrupts             | Stop and leave actions, warnings, to-do                          |
| Red    | Cannot be undone       | Delete actions                                                   |

```tokens
signal
```

## Contrast

- Ink text at every level (`foreground`, `foreground-muted`, `foreground-hint`) is at least 4.5:1 on every surface and every soft fill.
- Sticker colors are 1.4–2.8:1 against white, which is why they always have an ink edge.
- The seam line is 3.0:1 on white and 2.8:1 on yellow.

## Related

- [Feedback](/proposal/patterns/feedback): which signal color each kind of feedback uses.
- [Button](/proposal/components/button): the pink primary action.
