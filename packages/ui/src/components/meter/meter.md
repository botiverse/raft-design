---
title: Meter
summary: A bar that shows how much of an allowance is used, such as a usage limit that resets, empty to start and filling as it is used.
status: experimental
aliases: [Usage meter, Quota, Usage limit, Used]
layer: core
category: feedback
related: [progress, notification-center, banner]
---

# Meter

A meter shows how much of an allowance is used: a usage limit that resets every few hours, a monthly quota, a disk. It starts empty and fills as the allowance is used, and turns orange as it nears the end, so the bar is most visible when it matters. Next to it, a label says which allowance it is, and the value says how much is used and when it comes back.

```example
meter/compositions/preview
```

## When to use

| Situation                                                               | Use                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| How much of an allowance or a capacity is used                          | Meter                                                                                |
| How far a task with a known percentage has got: an upload, a conversion | [Progress](../progress/progress.md)                                                  |
| An amount with no limit, such as spend or tokens so far                 | Numbers in a [DescriptionList](../description-list/description-list.md), with no bar |

Meter vs Progress: a meter is a quantity within a range that rises and falls; a progress bar is a task that only moves forward and is done at 100%. A full progress bar turns `success`, so a used-up allowance drawn as progress would read as finished.

## Why it shows what is used

Every place that shows resource usage shows what is used, not what is left: runtime limits, disk, memory and seats all fill the same way (stdrc, 2026-10-29). Before, a meter drained while the disk and memory bars beside it filled, so one row of a computer ran its bars in opposite directions. One direction everywhere means a fuller bar is always closer to the limit, and the warning grows as the bar fills: it is most visible when it matters. The colors didn't change: 88% used is the same orange as 12% left was.

## Anatomy

- `Meter`: the root. Required. Takes what is `used` and the whole allowance, `max` (100 unless set), as the provider reports them, and fills the bar with `used` of `max`. Takes `valueText`, the value in words, which `MeterValue` shows and assistive technology reads.
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

The color follows how much is used; there is no `variant`. `data-level` on the root names the state.

| State                   | When                                              | Looks                                                |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Normal (`normal`)       | Less than `warnAt` of `max` is used               | The `info` fill, as on Progress, from an empty track |
| Nearly used up (`high`) | `warnAt` or more is used: 80% of `max` unless set | A `warning` fill and a `warning-strong` value        |
| Used up (`full`)        | `used` reaches `max`                              | A full `warning` bar and a `warning-strong` value    |

```example
meter/compositions/states
```

- `warnAt` is the share of `max` used, from 0 to 1, and means at or above: with the default, 80% used is already orange. It is the old "20% or less left" said the other way round, so the same data takes the same color as before.
- Don't use `danger` for a nearly used-up or used-up allowance: it comes back at the reset, so it interrupts work but isn't irreversible ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- Keep the fill `info`, the color of Progress, so a meter and a progress bar read as one family, and let it turn orange only near the end: the color changes when there is something to act on.
- Don't turn a full meter lime or red: a used-up allowance isn't finished, and it isn't lost. It stays orange, with the words "Used up".
- Keep the default `warnAt` unless an allowance needs another: the same share used should look the same on every screen. A disk that warns only under 10% free is `warnAt={0.9}`.

## Content

- Name the allowance in `MeterLabel`: "5-hour limit", "Weekly limit", "Disk".
- Lead `valueText` with what is used, with the word, then when it comes back: "62% used · resets in 3h". Always write "used"; never a bare "62%", which could mean used or left.
- Keep the reset time next to the value, in the same `valueText`, not in a tooltip or a second line: it is the other half of the answer.
- When all of it is used, say so in place of the percentage: "Used up · resets in 3h".
- When the reset time is unknown, leave the second half out: "62% used".
- What is left, in absolute units, may go in a [Tooltip](../tooltip/tooltip.md) on the meter: "378 GB free of 994 GB". Don't put it in `valueText` next to a percentage used: two numbers in opposite directions side by side read as a contradiction.

## Accessibility

Meter wraps Base UI's Meter, which gives it `role="meter"`. Its `aria-valuenow` is what is used, and its `aria-valuetext` is `valueText`.

- `MeterLabel` gives the meter its accessible name. Without a visible label, pass `aria-label` to `Meter`.
- `valueText` is required and is the only way to set the spoken value, so what a screen reader says ("62% used · resets in 3h") is always what is shown, and never a bare "62%".

## Rules

- Pass `used` as the provider reports it. When the provider reports what is left or free, pass `used={max - left}`; Meter clamps it to 0 to `max`, so the bar, the color and the spoken value can't disagree.
- Put the meter inside its container on its own track, never along an edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).

## Migrating from the draining meter

Until 2026-10-29 the meter drew what was left. The props are the same; what changes is what the bar and the words say.

- `used` and `max` are unchanged. The bar now fills with `used`, and `aria-valuenow` is `used`, not `max - used`.
- Rewrite `valueText` from left to used: "38% left · resets in 3h" becomes "62% used · resets in 3h". "Used up" stays.
- `low`, the amount left at which the meter warned, is deprecated and still works. Replace it with `warnAt`, the share used: `low={20}` of 100 is `warnAt={0.8}`, the default, so most callers drop it. `warnAt` wins when both are set.
- `data-level` is now `normal`, `high` or `full`, not `plenty`, `low` or `empty`.
- A used-up meter is a full warning bar; the empty `warning-muted` track with a `warning` edge is gone.
