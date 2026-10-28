---
title: Meter
summary: A bar or a ring that shows how much of an allowance is left, such as a usage limit that resets, full to start and draining as it is used.
status: experimental
aliases: [Usage meter, Quota, Usage limit, Remaining, Usage ring, Meter ring]
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

Bar or ring:

| Situation                                                                                                     | Use                                        |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| One meter, or a few stacked, with room for a label above: a settings page, a plan, a card, a popover          | The bar: `MeterTrack` and `MeterIndicator` |
| A dense row or a table cell, or several meters side by side, such as the limits of each runtime on a computer | The ring: `MeterRing`                      |

A bar needs width to read: in a 48px table row with three runtimes side by side, each bar would be a thin sliver beside its neighbor's. A ring the size of an icon, with its value beside it, takes the room of an icon and a word.

Meter vs Progress: a meter is a quantity within a range that rises and falls; a progress bar is a task that only moves forward and is done at 100%. A full progress bar turns `success`, so an untouched allowance drawn as progress would read as finished.

## Anatomy

- `Meter`: the root. Required. Takes what is `used` and the whole allowance, `max` (100 unless set), as the provider reports them, and draws what is left, `max - used`. Takes `valueText`, the value in words, which `MeterValue` shows and assistive technology reads.
- `MeterHeader`: an optional row above the track, holding `MeterLabel` and `MeterValue`.
- `MeterLabel`: which allowance it is.
- `MeterValue`: the `valueText`. Leave it out for a bar with no words beside it; the text is still read out.
- `MeterTrack`: the `fill-muted` track. Required.
- `MeterIndicator`: the fill, a sticker with an ink edge. Required.
- `MeterRing`: the ring, in place of `MeterTrack` and `MeterIndicator`. It draws the same track and fill as an arc, and holds a child, such as an icon, at its centre. Put `MeterValue` beside it, inside `Meter`, and leave out `MeterHeader`: the meter lays the ring and the value out in a row, as wide as they are.

The ring is a part of `Meter`, not a `variant` of it or of `MeterIndicator`, because it is a different structure: one SVG in place of a track holding a fill, with a centre of its own, and no header above it. The root keeps what the two share, `used`, `max`, `low`, `valueText` and the level they give, so a bar and a ring of the same allowance can't disagree. `MeterIndicator` can't bend: Base UI sizes it by its width inside the track.

## Sizes

| Size                                    | Use for                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| The default (`size="md"`), an 8px track | A meter on its own: a settings page, a plan                                    |
| `size="sm"`, a 6px track                | Several meters stacked in a card or popover, such as the limits of one account |

The ring takes its own `size`, matched to the icon sizes ([Iconography](../../../../../design/foundations/iconography.md)); `Meter`'s `size` sets only the bar.

| Size                            | Band  | An icon at the centre | Use for                                                                 |
| ------------------------------- | ----- | --------------------- | ----------------------------------------------------------------------- |
| `size="sm"`, 16px               | 2px   | 9px                   | A ring with no icon, beside 16px icons: a menu, a small button          |
| The default (`size="md"`), 20px | 2.5px | 11px                  | Table cells and list rows, with or without an icon: the Rack's runtimes |
| `size="lg"`, 24px               | 3px   | 14px                  | A ring around an icon that has to be recognized, such as a brand mark   |

## States

The color follows what is left; there is no `variant`.

| State       | When                                           | Looks                                                                                                                   |
| ----------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Plenty left | More than `low` is left                        | The `info` fill, as on Progress, up to a full bar or a closed ring. A full meter stays `info`: it has no complete color |
| Low         | `low` or less is left: 20% of `max` unless set | A `warning` fill and a `warning-strong` value                                                                           |
| Used up     | `used` reaches `max`                           | An empty `warning-muted` track with a 1px `warning` edge, and a `warning-strong` value                                  |

```example
meter/compositions/states
```

- `low` means at or below, unlike HTML's `<meter low>`, which is strictly below: with the default, 20% left is already low. It is in the units of `max` and clamped to 0 to `max`.
- Give the used-up track its warning edge because the empty track has to read on its own: the edge measures 2.0:1 against white in light mode and 7.2:1 to 8.5:1 against the dark surfaces (popover to canvas), where a normal track is 1.1:1 and 1.1:1 to 1.5:1. The `warning-soft` wash alone measured 1.16:1 on the dark canvas, fainter than a normal track.
- Don't use `danger` for a low or used-up allowance: it comes back at the reset, so it interrupts work but isn't irreversible ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- Keep the fill `info`, the color of Progress, so a meter and a progress bar read as one family, and let it turn orange only when little is left: the color changes when there is something to act on.
- Don't turn a full meter lime: a full allowance is untouched, not finished. This is why a meter isn't drawn with Progress, which turns `success` at 100%.
- Keep the default `low` unless an allowance needs another: the same amount left should look the same on every screen.

## The ring

The ring is the bar bent round: the same states, the same tokens, the same light and dark values. The arc starts at the top and runs clockwise for what is left; untouched, it is a closed ring, and it shortens towards the top as the allowance is used.

```example
meter/compositions/ring-states
```

- The band has no ink edge, unlike the bar's fill: at 2px to 3px it is a line in itself, as a thin progress bar is ([Shape](../../../../../design/foundations/shape.md#stroke-widths)). With an edge, the color was a stripe narrower than the ink and the ring read dark in every state.
- The used-up ring keeps the bar's 1px `warning` edge on both sides of its `warning-muted` band, so an empty ring still reads as a ring on any surface, for the bar's reasons above. A low ring never closes, so a whole orange circle can only mean used up.
- The ring is round, the one measure that is: a share of a whole reads evenly only around a circle ([Shape](../../../../../design/foundations/shape.md#principles)).

Put an icon at the centre to say whose allowance it is, as each runtime's mark does in a table row. The icon takes the size of the centre and the `foreground` color, so pass it with neither of its own (a brand mark keeps its colors), and `aria-hidden`: the meter's name says whose it is.

```example
meter/compositions/ring-icon
```

In a table, give each meter a cell or a group of its own, with its value beside it. Several runtimes' rings fit side by side in a 48px row.

```example
meter/compositions/ring-table
```

- Keep the value beside the ring. A ring alone is a shape to compare at a glance, not a number to read; a ring with no `MeterValue` needs its `valueText` somewhere a person can see, such as a tooltip on the row.
- Use the ring for the row and the bar for the card: when the same allowance is shown both ways, the states match.

## Content

- Name the allowance in `MeterLabel`: "5-hour limit", "Weekly limit".
- Lead `valueText` with what is left, then when it comes back: "38% left · resets in 3h".
- When nothing is left, say so in place of the percentage: "Used up · resets in 3h".
- Don't write "% used": people would subtract it from 100 to know where they stand.
- When the reset time is unknown, leave the second half out: "38% left".

## Accessibility

Meter wraps Base UI's Meter, which gives it `role="meter"`. Its `aria-valuenow` is what is left, and its `aria-valuetext` is `valueText`.

- `MeterLabel` gives the meter its accessible name. Without a visible label, pass `aria-label` to `Meter`, as a ring always does: name the allowance and whose it is ("Claude Code weekly limit"), since the icon at the centre is hidden.
- The ring's drawing is hidden from assistive technology; the meter's role and `valueText` say everything it shows.
- `valueText` is required and is the only way to set the spoken value, so what a screen reader says ("38% left · resets in 3h") is always what is shown, and never a bare "38%" that could mean used or left.

## Rules

- Pass `used` as the provider reports it; don't work out what is left yourself. Meter does it, so the bar, the words and the spoken value can't disagree.
- Put the meter inside its container on its own track, never along an edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
