---
title: Steps
summary: Where someone is in a short flow of 3 to 5 steps — finished steps in ink, the current step as a yellow sticker, the steps ahead outlined.
status: stable
aliases: [Stepper]
layer: core
category: navigation
related: [progress, tabs]
---

# Steps

Steps show where someone is in a short flow of 3 to 5 steps, such as setting up a server. Finished steps are ink, the current step is a yellow sticker, and the steps ahead are outlined.

```example
steps/compositions/preview
```

## When to use

| Situation                                                 | Use                                                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A flow of 3 to 5 steps taken in order                     | Steps                                                                                                                            |
| A flow of more than 5 steps                               | Split it into 2 flows, each with its own Steps                                                                                   |
| How far one operation has got                             | [Progress](../progress/progress.md)                                                                                              |
| Sections people visit in any order                        | [Tabs](../tabs/tabs.md)                                                                                                          |
| The step label of a server's setup ("Set up your server") | A line of Space Mono in the dialog's header, not Steps; see [Onboarding](../../../../../design/products/raft-chat/onboarding.md) |

## Anatomy

- `Steps`: the ordered list. `current` sets the current step, counted from 1.
- `Step`: one step: a 20px square marker with its number in Space Mono, a title, and an optional description. A short `line-seam` connects it to the next step.
- `OtterIndicator`: an illustration with one pose per step status, at 48px or larger. It is exported beside Steps; the system has no rule for it yet.

## Variants

| Variant                                          | Use for                                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| A row (default)                                  | Most flows                                                                             |
| `vertical`                                       | The steps in a column                                                                  |
| Clickable (`onUpdateCurrent`)                    | A flow where people can return to an earlier step. A `disabled` step can't be selected |
| Custom marks (`icon`, `finishIcon`, `errorIcon`) | An icon in place of a step's number, check or cross                                    |

```example
steps/compositions/vertical
```

```example
steps/compositions/clickable
```

```example
steps/compositions/icon
```

## States

| `status`  | Look                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wait`    | Ahead: a `line-seam` outline on paper, the title in `foreground-hint`                                                                                   |
| `process` | Current: a yellow sticker with an ink number                                                                                                            |
| `finish`  | Finished: solid ink with a check                                                                                                                        |
| `error`   | Failed: an orange sticker with a cross, because something going wrong is orange ([Color](../../../../../design/foundations/color.md#meanings-of-color)) |

```example
steps/compositions/status
```

## Behavior

- A row of steps fills its row and switches on its own width, not the window's ([Switch on the region's width](../../../../../design/patterns/responsive.md#switch-on-the-regions-width)). Below 40rem (640px) of its own width each step stacks its text under its marker and the steps share the width, the titles wrapping; so it does in a dialog or a 400px panel on a wide window as on a phone. From 40rem the titles sit beside their markers, and a row too long for its width wraps onto a second line. Put it in a parent with a definite width (a block, a stretched flex or grid item, or a set width), not one that shrinks to its content (`inline-block`, `w-fit`, an absolutely positioned box or floating layer with no width, a flex item with `flex-basis: auto` and no width): as its own container it takes no width from what it holds and would collapse to nothing.
- Where the row is too narrow for every title, show only the current step's title.

## Content

- Title each step with a short noun phrase: Your team, Computer, First agent. Use sentence case, and Title Case when the steps are clickable ([Typography](../../../../../design/foundations/typography.md#casing)).

## Accessibility

- Steps is not built on a Base UI primitive. `Steps` renders an `ol`; name it with `aria-label` after the flow ("Setup").
- The current step gets `aria-current="step"`.
- A finished or failed step reads `finishLabel` or `errorLabel` after its title, because its mark says it only by look.
- In clickable steps, each title is a button, described by the step's description.
