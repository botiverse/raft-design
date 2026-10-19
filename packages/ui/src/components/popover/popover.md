---
title: Popover
summary: A small panel that opens next to the element people click, for a little input such as a choice, a field and a button.
status: stable
aliases: []
category: overlays
related: [preview-card, tooltip, dropdown-menu, drawer]
---

# Popover

A popover is a small panel that opens next to the element people click and holds a little input: a choice of a few options, a field, a button. Snoozing a notification or renaming something fits in one. It closes on a click outside or Esc.

## When to use

| Situation                                               | Use                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| One sentence about something, on hover                  | [Tooltip](../tooltip/tooltip.md)                                                                       |
| A summary of a person or an agent, on hover, with links | [PreviewCard](../preview-card/preview-card.md)                                                         |
| A little choice or input, on click (snooze, rename)     | Popover, with a [RadioGroup](../radio-group/radio-group.md), an [Input](../input/input.md) and buttons |
| A list of actions                                       | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                                                      |
| Something that stays open and scrolls                   | [Drawer](../drawer/drawer.md)                                                                          |

Which overlay fits which job is in [Choosing a component](../../../../../design/patterns/choosing-components.md#overlays).

## Anatomy

- `Popover`: the root. Owns the open state. Required.
- `PopoverTrigger`: the element that opens it. Required.
- `PopoverContent`: the panel, portaled and positioned next to the trigger. Required.
- `PopoverHeader`: a row with `PopoverTitle` and an optional `PopoverClose`.
- `PopoverTitle` and `PopoverDescription`: the title and a sentence under it.
- `PopoverSeparator`: a hairline between parts of the panel.
- `PopoverClose`: a button that closes the popover.
- `PopoverArrow`: an optional pointer toward the trigger.
- `PopoverBackdrop`: a transparent layer behind the panel that catches clicks outside it.
- `PopoverPortal`, `PopoverViewport` and `PopoverPopup`: lower-level parts. `PopoverPopup` is the panel surface without positioning.

## Behavior

- The popover opens below its trigger, aligned to its start edge, and moves or flips when it meets the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- A click outside and Esc close it. A Cancel button closes it too.
- It has no scrim; the page behind it stays as it is.

## Content

- Write button labels in Title Case, with the confirm button repeating the verb: Snooze, Rename ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).

## Accessibility

- Popover wraps the Base UI Popover. It provides the `dialog` role on the panel, moves focus into it on open, and returns focus to the trigger on Esc.
- Name the panel: `PopoverTitle` labels it. Without a visible title, put an `aria-label` on `PopoverContent`.
- Give an icon-only trigger an `aria-label`.

## Rules

- Make a popover 300px wide, with 16px padding.
- Don't put a pink button in a popover. Confirm with an ink-border button (`variant="outline"`) and cancel with `variant="ghost"`: a popover is a small step, not the screen's primary action.
