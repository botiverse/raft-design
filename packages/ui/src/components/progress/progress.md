---
title: Progress
summary: A bar that shows how far a measurable task has gone, such as an upload or usage against a limit, with a label and its value.
status: stable
aliases: [ProgressBar, Loading]
category: feedback
related: [spinner, skeleton, file-preview, message-attachment]
---

# Progress

A progress bar shows how far something with a known percentage has gone: an upload, a file being processed, usage against a quota. Next to it, a label says what it is and how far it has got. Which loading indicator fits which wait is in [Choosing a component](../../../../../design/patterns/choosing-components.md#waiting).

```example
progress/compositions/preview
```

## When to use

| Situation                              | Use                                                  |
| -------------------------------------- | ---------------------------------------------------- |
| The percentage is known                | Progress                                             |
| The duration is unknown                | [Spinner](../spinner/spinner.md), not a progress bar |
| The layout of what is loading is known | [Skeleton](../skeleton/skeleton.md)                  |

## Anatomy

- `Progress`: the root; takes the `value`. Required.
- `ProgressHeader`: an optional row above the track, holding `ProgressLabel` (what it is) and `ProgressValue` (how far, in Space Mono).
- `ProgressTrack`: the `fill-muted` track. Required.
- `ProgressIndicator`: the fill, a sticker with an ink edge. Required.

## Variants

| Variant                           | Use for                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| The default (`variant="primary"`) | Progress of any kind: an `info` fill                                 |
| `variant="warning"`               | Usage at 90% of a limit or more                                      |
| Complete                          | When `value` reaches the maximum the fill turns `success` on its own |

- Don't use `variant="danger"`: reaching a limit interrupts, it isn't irreversible ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- `information` and `accent` are the same as the default. Use the default.

```example
progress/compositions/embedded-progress
```

## States

- Don't show a bar whose percentage can't be computed. Use a [Spinner](../spinner/spinner.md) instead of a fake or indeterminate bar.

## Content

- Name what is in progress in `ProgressLabel`: "Uploading design-crop.png", "Agent hours this month".
- Show how far it has got in `ProgressValue`, as a percentage or as an amount out of the limit.

## Accessibility

Progress wraps Base UI's Progress, which gives it `role="progressbar"` and its value.

- `ProgressLabel` gives the bar its accessible name. Without a visible label, pass `aria-label` to `Progress`.
- Keep `ProgressLabel` even when you leave out `ProgressValue`.

## Rules

- Put a bar inside a file card, thumbnail or other rounded container on its own thin track, never along its edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
