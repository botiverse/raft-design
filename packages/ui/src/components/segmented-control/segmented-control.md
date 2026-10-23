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

- Selected: a yellow sticker with a bold label. It doesn't change on hover, like a selected tab; a press lays `sticker-medium` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
- The other segments are `foreground-muted`, with the medium tier, `fill-medium`, on hover and press.
- Disabled: set on the whole control, as in [States](../../../../../design/foundations/states.md).
- In the frame (a top bar), set `variant="on-frame"`: the track is the frame's medium fill, the other segments are `foreground-on-frame-muted` (`foreground-on-frame` and the frame's medium overlay, `overlay-frame-medium`, on hover and press), and the selected segment takes the frame's active colours, `layer-frame-active` with a `line-frame-active` edge and `foreground-on-frame-active` text: white on the yellow frame, yellow on the dark one, as a selected rail item. A yellow sticker on the yellow frame would not read as selected, and the white segment beside it would look chosen instead. On a phone, where the top bar has no room for it, put the control in the menu rather than the bar.

```example
segmented-control/compositions/disabled
```

## Behavior

- The segments sit 3px inside the track and 3px apart, so the gap between two of them is the gap to the track ([Spacing](../../../../../design/foundations/spacing.md#spacing)).
- The track hugs its segments. Don't stretch it to fill its container: a stretched track leaves an empty run of gray beside the segments.
- The segments never shrink. When the row is too narrow, its neighbors give way first, then the segments show only their icons ([Responsive layout](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)). If the row is narrower still, or the caller set no `iconsOnlyBelow`, the track shrinks to the row and its segments scroll sideways inside it, the checked one kept in view, rather than spilling onto the next control: it sets `data-overflowing` while they do. Treat that as the last resort it is, not as the layout: in a row that may narrow, set `iconsOnlyBelow="auto"`.
- To let the segments show only their icons, set `iconsOnlyBelow="auto"`. The control then shows only its icons exactly when its labelled segments don't fit the width it is given, and its labels again once they fit. Every segment becomes a 32px square that shows only its icon: its label and its count stay its accessible name, and its label shows in a tooltip on hover and on keyboard focus. The control keeps its 32px height and its text size. Set `iconsOnlyBelow` only when every segment has an icon: a segment without one would be left empty, and raft-ui warns in development.
- Prefer `auto` to a width. The labels' width changes with the language, a count and the font, so a width picked for one of them is wrong for the others, and the width the control is given changes with what sits beside it (a Mark all read button that comes and goes). `auto` measures the labelled segments against the room the control is given, whatever sits beside it: in a row, leave the control free to shrink (it is `min-w-0`; don't make it `shrink-0`) and let it share the row with its neighbors. It decides before the first frame paints and again whenever the room, a label, a count or the selection changes, and always against the labelled layout, so it comes back to its labels only once they fit and never flickers at the boundary.
- A fixed width is a container query instead: mark the row with `@container` and set `iconsOnlyBelow` to the row width below which the segments show only their icons, either Tailwind's container sizes, `xs` (20rem), `sm` (24rem), `md` (28rem), `lg` (32rem), `xl` (36rem) or `2xl` (42rem), or any length in `px`, `rem` or `em` (`"18.5rem"`, `"296px"`). A length is measured in script against the nearest `@container` (the control's parent when there is none); a size is a CSS container query. Pick the width from the row, not the window: the same row sits in columns of different widths, and a container query follows the column.
- Stretch it only when it is the only choice in a form. Then give it the full width (`w-full`) on its own line, not in a row beside other controls, and let the segments share it equally: in a row, a full-width track that can't shrink pushes past its neighbors.
- On a phone, use at most 4 segments and show only their icons when they don't fit, with `iconsOnlyBelow="auto"` ([Responsive layout](../../../../../design/patterns/responsive.md#phone)).

```example
segmented-control/compositions/fit-row
```

With `auto` or a length, the track carries `data-icons-only` while its segments show only their icons, for a caller that styles a part by it (`in-data-icons-only:`). With a size it is a container query, and the track carries nothing.

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
