---
title: CoachMark
summary: One stop of a tour — a 300px popover with an arrow, anchored to the thing it explains, which holds the Located wash while the stop is open.
status: experimental
aliases: [Tour, Coach marks, Product tour]
layer: core
category: overlays
related: [popover, tooltip]
---

# CoachMark

A coach mark is one stop of a tour of a screen the person has just entered: a bubble that points at one thing, says what it is in a sentence, and moves on with Next. When to run a tour, how many stops, what they say and where focus goes after it are in [Coach marks](../../../../../design/patterns/coach-marks.md); this page is the part that draws a stop. Experimental, from `@botiverse/raft-ui/wip`.

```example
coach-mark/coach-mark-tour
```

## When to use

| Situation                                                   | Use                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| A tour of a screen the person enters for the first time     | CoachMark, one per stop                                |
| One sentence about a control, on hover                      | [Tooltip](../tooltip/tooltip.md)                       |
| A little choice or input the person opened                  | [Popover](../popover/popover.md)                       |
| An error, a confirmation or anything the person must answer | [Feedback](../../../../../design/patterns/feedback.md) |

## Anatomy

- `CoachMark`: the root of one stop. `anchor` is its target, an element or a ref (read after every render, so a ref that moves to another element moves the stop); `open` (default `true`) shows it; `onDismiss` is called when the person ends the tour from the bubble: Esc in it, or a `PopoverClose` in it. Required.
- `CoachMarkContent`: the bubble, 300px, 8px from the target and at least 8px from the window's edge, with an arrow on whichever side it opens (`side`, default `bottom`; `align`, default `center`). Required.
- `PopoverBody` with `PopoverTitle` and `PopoverDescription`: the thing's name and one sentence about it.
- `CoachMarkAction`: optional, one more thing the stop offers, an `outline` button on its own row under the text (Turn on notifications).
- `CoachMarkActions`: the last row. `CoachMarkCount` ("2 of 6") at its start, then Skip (a `ghost` Button) and `CoachMarkNext`.
- `CoachMarkNext`: Next, or Done on the last stop, the pink button.

The product owns the tour: which stop is open, its words, and what Skip, Next and Done do. Render one `CoachMark` for the open stop and change its `anchor` and text for the next one.

## Behavior

- The target holds the Located wash at full strength while its stop is open, and loses it when the stop closes or moves on: `CoachMark` sets `data-located="held"` on it and puts back what was there ([Located](../../../../../design/foundations/states.md#located)). A target that is already selected keeps its selection. For a list row, anchor the whole row, so the wash takes the row's inset shape (`fill-cell-selected`).
- It is non-modal. No scrim, and a press outside and focus leaving the bubble don't close it: the person may be answering the agent under it.
- In the Tab order the bubble comes right after its target: Tab from the target (or its last control, or the last control before it when the target takes no focus) goes to the bubble's first button, Tab from its last button goes on to what follows the target, and Shift+Tab goes back the same way. The bubble has no trigger for Base UI to return to, so CoachMark places it.
- When a stop opens, and when it moves to the next target (another `anchor`), focus goes to `CoachMarkNext`, unless the person is typing in a field: then it stays there. When the same `anchor`, a ref, comes to point at a new element (a row given a new key), the stop stays where it is and focus moves to `CoachMarkNext` only if it was already in the bubble. Pass a different ref (or element) for each stop, never the same ref moved to the next target.
- Esc while focus is in the bubble calls `onDismiss`: the person ended the tour. Esc elsewhere, in the composer for instance, goes on to what has focus (closing its suggestions, cancelling an edit) and leaves the tour open.
- Closing moves no focus: the product puts it in the composer when the tour ends, by Skip, Done or Esc.

## Accessibility

- The bubble has the `dialog` role and is named by its `PopoverTitle`.
- Focus moves only as above, never out of a field the person is typing in.
- The Located wash is only a look; the bubble's title names the thing for a screen reader.

## Rules

- Make the bubble 300px wide; `CoachMarkContent` does.
- Write a title and one sentence. A stop that needs two sentences is two stops.
- Count the stops on every bubble; leave Skip off the last one, which has Done.
- Point each stop at one thing, and anchor it to something every platform has.
- The other rules of a tour are in [Coach marks](../../../../../design/patterns/coach-marks.md#rules).
