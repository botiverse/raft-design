---
title: ModeBar
summary: A dark strip across a panel, under its header, while the panel is in a mode people entered on purpose, such as commenting on an Artifact, with the action that ends it.
status: experimental
aliases: [Mode strip, Mode bar, Commenting bar]
layer: core
category: feedback
related: [panel, banner, toast, comment]
---

# ModeBar

A mode bar says that a panel works differently for now, because the person asked it to: while they comment on an Artifact, a selection makes a draft comment instead of copying text. It runs the full width of the panel under its header, on the dark HUD surface, with what the mode is, what to do in it, and the action that ends it.

```example
mode-bar/compositions/preview
```

## When to use

| Situation                                                                                                        | Use                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| The person turned on a mode in this panel and turns it off with one action: commenting on an Artifact, with Done | ModeBar                                                                      |
| Something in one panel failed: an agent won't start, a setting didn't save                                       | `PanelNotice` ([Panel](../panel/panel.md)), on the intent's tint             |
| Something to know before acting in a dialog or a form                                                            | [Banner](../banner/banner.md)                                                |
| The result of something the person just did                                                                      | [Toast](../toast/toast.md)                                                   |
| Several messages are selected, with actions on them                                                              | `MessageMultiSelectToolbar` ([MessageItem](../message-item/message-item.md)) |

## Anatomy

- `ModeBar`: the strip. Required. Place it directly under the panel header, across the full width of the panel.
- `ModeBarContent`: the words, which take the width left and wrap. Required. It is a polite live region.
  - `ModeBarTitle`: the mode and its state, bold: "Commenting · 1 draft."
  - `ModeBarDescription`: what to do in the mode, in the muted HUD ink, after the title on the same line: "Select text to comment on it." It brings the space before it.
- `ModeBarAction`: the text action that ends the mode, at the end of the first line. Required.

## Why it is dark

A mode is not a notice. Nothing is wrong and nothing needs the person's attention, so it has no intent and takes no intent tint: a yellow or blue strip would say "warning" or "information" about a state the person chose. It is still the product speaking, not the content, so it takes the surface the product speaks on, the HUD of toasts and tooltips ([Color](../../../../../design/foundations/color.md#principles)). The dark fill stands out from every tint and from paper in both modes, so for as long as it is there it reads as "the panel is in another mode", and when it goes the panel looks as it always does. A neutral `PanelNotice` on `fill-muted` would sit too close to the header and read as a note about the panel, not a change in how it works.

## Behavior

- Show it while the mode is on and remove it when the mode ends; the panel does not move under the header except for the strip's height.
- Its edges and its height for one line are `PanelNotice`'s: 20px from the panel's sides (16px on a phone), 10px above and below the text, at least 40px. Two strips under a header are one size.
- Its text is `text-callout`, 14/22 on a desktop and 14/20 on a phone. It wraps; the action stays at the end of the first line.
- It draws no seam under it: the dark fill is its edge. The seam above it is the header's.

On a phone, or in a narrow panel, the words wrap and Done keeps its place:

```example
mode-bar/compositions/narrow
```

## Content

- Name the mode and its state in the title, with a period: "Commenting · 1 draft." Keep the count in the title, so the person sees the batch grow.
- Say how to work in the mode in the description, in one short sentence: "Select text to comment on it."
- Label the action with the end of the mode, one word: Done. Never Cancel or ×: ending the mode keeps what was done in it (the drafts stay).

## Accessibility

- `ModeBarContent` has `role="status"`, so a change to its words, such as the draft count, is read out politely. `ModeBarAction` sits outside the live region, so "Done" is not read with every change.
- `ModeBarAction` renders a `button` with `type="button"`, reached with Tab after the words. Give the control that turns the mode on its pressed state (a `PanelToggleAction`), so entering and leaving the mode is announced there.
- The strip lays out with `start` and `end`, so it mirrors in a right-to-left language.

## Rules

- Show at most one mode bar in a panel, and never with a `PanelNotice` for the same thing.
- Give it one action, the one that ends the mode, as a text action on the HUD: bold `foreground-on-hud` that underlines on hover, the same as a toast's action ([Clickable text](../../../../../design/foundations/states.md#clickable-text)). Never a Button: a button's fill and ink border don't belong on the dark strip.
- Put the mode's other actions (Submit, Discard) where they live without it, such as the panel header, not in the strip.
- Don't put an icon before the words: the dark strip already says what kind of thing it is.
