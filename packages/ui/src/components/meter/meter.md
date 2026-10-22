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

- `Meter`: the root; takes the `value`, which is what is left. Required.
- `MeterHeader`: an optional row above the track, holding `MeterLabel` and `MeterValue`.
- `MeterLabel`: which allowance it is.
- `MeterValue`: how much is left and when it resets, in words.
- `MeterTrack`: the `fill-muted` track. Required.
- `MeterIndicator`: the fill, a sticker with an ink edge. Required.

## States

The color follows the value; there is no `variant`.

| State       | When                                           | Looks                                                                                    |
| ----------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Plenty left | Above `low`                                    | A neutral fill (`ink-40`), up to a full bar. Nothing to notice, so no color, at full too |
| Low         | At or below `low`, 20% of the range unless set | A `warning` fill and a `warning-strong` value                                            |
| Used up     | At `min`                                       | An empty track washed `warning-soft`, and a `warning-strong` value                       |

```example
meter/compositions/states
```

- Don't use `danger` for a low or used-up allowance: it comes back at the reset, so it interrupts work but isn't irreversible ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- Don't color a meter cyan or lime: cyan reads as a progress bar, and lime as something finished.
- Keep the default `low` unless an allowance needs another: the same amount left should look the same on every screen.

## Content

- Name the allowance in `MeterLabel`: "5-hour limit", "Weekly limit".
- Lead `MeterValue` with what is left, then when it comes back: "38% left · resets in 3h".
- When nothing is left, say so in place of the percentage: "Used up · resets in 3h".
- Don't write "% used": people would subtract it from 100 to know where they stand.
- When the reset time is unknown, leave the second half out: "38% left".

## Accessibility

Meter wraps Base UI's Meter, which gives it `role="meter"` and `aria-valuenow`.

- `MeterLabel` gives the meter its accessible name. Without a visible label, pass `aria-label` to `Meter`.
- `MeterValue` is hidden from assistive technology. Pass the same words to `Meter` as `aria-valuetext` ("38% left, resets in 3 hours"), so a screen reader says what is left and not a bare "38%".

## Rules

- Pass what is left as `value`, never what is used: the bar and the words have to agree.
- Put the meter inside its container on its own track, never along an edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
