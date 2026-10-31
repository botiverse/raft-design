---
title: TextSelectionToolbar
summary: The toolbar that floats over text someone selects, with actions on that text such as Quote, Copy and Comment, in a message, an Artifact or any other readable text.
status: stable
aliases: [Selection toolbar]
layer: core
category: overlays
related: [message-item, popover, mode-bar]
---

# TextSelectionToolbar

`TextSelectionToolbar` floats over text the person selects, with actions on that text such as Quote, Copy and Comment. It is the same toolbar wherever text can be selected: in a message, in an Artifact, in any other text people read.

```example
text-selection-toolbar/text-selection-toolbar
```

## When to use

| Situation                                   | Use                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Actions on text the person selected         | TextSelectionToolbar                                                         |
| Actions on a message under the pointer      | The message's hover toolbar ([MessageItem](../message-item/message-item.md)) |
| Actions on several selected messages        | `MessageMultiSelectToolbar` ([MessageItem](../message-item/message-item.md)) |
| A list of choices that opens from a control | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                            |

## Anatomy

- `TextSelectionToolbar`: the floating frame. Required.
- `TextSelectionToolbarButton`: one action, an icon and a label.
- `TextSelectionToolbarSeparator`: a line between groups of actions.
- `createTextSelectionAnchor(selection)`: the anchor that places the toolbar on the selected text, for `PopoverContent`'s `anchor`.

## Look

It is built like a message's hover toolbar, so the two read as one kind of thing. The one difference is that its buttons have text labels, where the hover toolbar's are icons alone:

- It is 36px high: `radius-container` with its hairline drawn inside (`ring-inset`), around 28px buttons with `radius-chip`, 4px from the frame and 4px apart.
- Its buttons have text labels after 16px icons in `foreground-muted`. On hover they take the medium tier, `fill-medium`, not the `brand-soft` of a menu row: a toolbar's actions are buttons, not menu rows ([States](../../../../../design/foundations/states.md)).
- `TextSelectionToolbarSeparator` is 20px high, with the toolbar's 4px on each side.

## Behavior

- It anchors to the line where the selection's focus end is, where the person let go, not to the whole range: a whole-line or multi-paragraph selection spans the text column, and the middle of that is nowhere near the pointer. Build the anchor with `createTextSelectionAnchor(selection)` and pass it to `PopoverContent`'s `anchor`; it measures the line each time it is read, so the toolbar follows the text when it scrolls.
- It stays inside the viewport: above the line by default, it flips below when there is no room and shifts along the line near a side edge.

## Content

- Write labels in Title Case. They never wrap: Chinese text can break between any two characters, so a toolbar squeezed at the edge of the window broke a two-character label onto two lines.

## Accessibility

- `TextSelectionToolbar` wraps Base UI `Toolbar`; give it an `aria-label`. Its buttons are Base UI toolbar buttons: the arrow keys move between them.
