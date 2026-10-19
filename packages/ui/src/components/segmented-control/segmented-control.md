---
title: SegmentedControl
summary: 2 to 4 segments in a gray track that switch how the same content is shown, in place; the selected segment is a yellow sticker.
status: stable
aliases: [Segmented button]
layer: core
category: navigation
related: [tabs, radio-group, select]
redirectFrom: [decisions/0033-segmented-control-track]
---

# SegmentedControl

A segmented control switches between 2 to 4 views of the same content, in place: a board or a list of the same tasks, a light or a dark appearance. The segments sit in a gray track, and the selected one is a yellow sticker.

```example
segmented-control/compositions/view-mode
```

## When to use

| Situation                                                             | Use                                         |
| --------------------------------------------------------------------- | ------------------------------------------- |
| Another view of the same content: Board / List, Light / Dark / System | SegmentedControl                            |
| Sections of one page, each with its own content                       | [Tabs](../tabs/tabs.md)                     |
| An answer submitted with a form                                       | [RadioGroup](../radio-group/radio-group.md) |
| More options than fit as segments                                     | [Select](../select/select.md)               |

The full table is in [Choosing a component](../../../../../design/components/overview.md#picking-something). Where Board / List goes on a task list is in [Tasks](../../../../../design/patterns/tasks.md).

## Anatomy

- `SegmentedControl`: the track, in `fill-muted`.
- `SegmentedControlItem`: one 32px segment, with an optional icon before its label.
- `SegmentedControlLabel`: the segment's text. It truncates.
- `SegmentedControlCount`: a count after the label, in Space Mono.

```example
segmented-control/compositions/filters
```

## States

- Selected: a yellow sticker with a bold label. The other segments are `foreground-muted`.
- Disabled: set on the whole control, as in [States](../../../../../design/foundations/states.md).

```example
segmented-control/compositions/disabled
```

## Behavior

- The track hugs its segments. Don't stretch it to fill its container: a stretched track leaves an empty run of gray beside the segments.
- The control never shrinks below its segments. When the row is too narrow, its neighbors give way first, then the segments show only their icons ([Responsive layout](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)).
- To let the segments show only their icons, mark the row with `@container` and set `iconsOnlyBelow` on the control to the row width below which the labels no longer fit: `xs` (20rem), `sm` (24rem), `md` (28rem), `lg` (32rem), `xl` (36rem) or `2xl` (42rem). Below it, every segment becomes a 32px square that shows only its icon: its label and its count stay its accessible name, and its label shows in a tooltip on hover and on keyboard focus. The control keeps its 32px height and its text size. Set `iconsOnlyBelow` only when every segment has an icon: a segment without one would be left empty.
- Pick the width from the row, not the window: the same row sits in columns of different widths, and a container query follows the column.
- Stretch it only when it is the only choice in a form. Then give it the full width (`w-full`) on its own line, not in a row beside other controls, and let the segments share it equally: in a row, a full-width track that can't shrink pushes past its neighbors.
- On a phone, use at most 4 segments and show only their icons when they don't fit, with `iconsOnlyBelow` ([Responsive layout](../../../../../design/patterns/responsive.md#phone)).

```example
segmented-control/compositions/narrow-row
```

## Content

- Label each segment with 1 or 2 words in Title Case: Board, List; Relevant, Recent ([Typography](../../../../../design/foundations/typography.md#casing)).
- Put a count in `SegmentedControlCount`, never in the label's text.

## Accessibility

- `SegmentedControl` wraps the Base UI RadioGroup, and each `SegmentedControlItem` is a Base UI Radio rendered as a button: the control is one tab stop, and the arrow keys move the selection.
- Name the control with `aria-label` after what it switches: "Task view", "Time format".
- Give every icon-only segment an `aria-label`. A segment that shows only its icon because of `iconsOnlyBelow` needs none: its label is still in it, hidden from sight but not from assistive technology.
