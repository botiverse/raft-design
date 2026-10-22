---
title: Meter
summary: A bar that shows how much of an allowance is left, such as a usage limit that resets, full to start and draining as it is used.
status: experimental
aliases: [Usage meter, Quota, Usage limit, Remaining]
layer: core
category: feedback
related: [progress, notification-center, banner]
---

# Meter

A meter shows how much of an allowance is left: a usage limit that resets every few hours, a monthly quota. Like a phone battery, it starts full and drains as the allowance is used, because the question it answers is "can I keep working, and for how long". Next to it, a label says which allowance it is, and the value says how much is left and when it comes back.

```example
meter/compositions/preview
```

## When to use

| Situation                                                               | Use                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| How much of an allowance that is used up and comes back is left         | Meter                                                                                |
| How far a task with a known percentage has got: an upload, a conversion | [Progress](../progress/progress.md)                                                  |
| An amount with no limit, such as spend or tokens so far                 | Numbers in a [DescriptionList](../description-list/description-list.md), with no bar |

Meter vs Progress: a meter is a quantity within a range that rises and falls; a progress bar is a task that only moves forward and is done at 100%. A full progress bar turns `success`, so an untouched allowance drawn as progress would read as finished.

## Anatomy

- `Meter`: the root. Required. Takes what is `used` and the whole allowance, `max` (100 unless set), as the provider reports them, and draws what is left, `max - used`. Takes `valueText`, the value in words, which `MeterValue` shows and assistive technology reads.
- `MeterHeader`: an optional row above the track, holding `MeterLabel` and `MeterValue`.
- `MeterLabel`: which allowance it is.
- `MeterValue`: the `valueText`. Leave it out for a bar with no words beside it; the text is still read out.
- `MeterTrack`: the `fill-muted` track. Required.
- `MeterIndicator`: the fill, a sticker with an ink edge. Required.

## Sizes

| Size                                    | Use for                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| The default (`size="md"`), an 8px track | A meter on its own: a settings page, a plan                                    |
| `size="sm"`, a 6px track                | Several meters stacked in a card or popover, such as the limits of one account |

## States

The color follows what is left; there is no `variant`.

| State       | When                                           | Looks                                                                                    |
| ----------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Plenty left | More than `low` is left                        | A neutral fill (`ink-40`), up to a full bar. Nothing to notice, so no color, at full too |
| Low         | `low` or less is left: 20% of `max` unless set | A `warning` fill and a `warning-strong` value                                            |
| Used up     | `used` reaches `max`                           | An empty `warning-muted` track with a 1px `warning` edge, and a `warning-strong` value   |

```example
meter/compositions/states
```

- `low` means at or below, unlike HTML's `<meter low>`, which is strictly below: with the default, 20% left is already low. It is in the units of `max` and clamped to 0 to `max`.
- Give the used-up track its warning edge because the empty track has to read on its own: the edge measures 2.0:1 against white in light mode and 7.2:1 to 8.5:1 against the dark surfaces (popover to canvas), where a normal track is 1.1:1 and 1.1:1 to 1.5:1. The `warning-soft` wash alone measured 1.16:1 on the dark canvas, fainter than a normal track.
- Don't use `danger` for a low or used-up allowance: it comes back at the reset, so it interrupts work but isn't irreversible ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- Don't color a meter cyan or lime: cyan reads as a progress bar, and lime as something finished.
- Keep the default `low` unless an allowance needs another: the same amount left should look the same on every screen.

## Content

- Name the allowance in `MeterLabel`: "5-hour limit", "Weekly limit".
- Lead `valueText` with what is left, then when it comes back: "38% left · resets in 3h".
- When nothing is left, say so in place of the percentage: "Used up · resets in 3h".
- Don't write "% used": people would subtract it from 100 to know where they stand.
- When the reset time is unknown, leave the second half out: "38% left".

## Accessibility

Meter wraps Base UI's Meter, which gives it `role="meter"`. Its `aria-valuenow` is what is left, and its `aria-valuetext` is `valueText`.

- `MeterLabel` gives the meter its accessible name. Without a visible label, pass `aria-label` to `Meter`.
- `valueText` is required and is the only way to set the spoken value, so what a screen reader says ("38% left · resets in 3h") is always what is shown, and never a bare "38%" that could mean used or left.

## Rules

- Pass `used` as the provider reports it; don't work out what is left yourself. Meter does it, so the bar, the words and the spoken value can't disagree.
- Put the meter inside its container on its own track, never along an edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
