---
title: DescriptionList
summary: A list of facts about one item — label and value pairs such as a task's Status, Assignee and Created by — where a value that can be changed opens a picker.
status: stable
aliases: [PropertyList]
layer: core
category: data-display
related: [select, status, avatar, timeline, task-card]
---

# DescriptionList

A DescriptionList shows a few facts about one item, each as a label and a value: a task's Status, Assignee and Created by, or an agent's runtime and computer. A value that can be changed opens a picker in place.

```example
description-list/compositions/member-info
```

## When to use

| Situation                                     | Use                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A few facts about one item, read side by side | DescriptionList                                                                                                                                              |
| Change one property of an item in place       | The value in a DescriptionList opens a picker ([Choosing a component](../../../../../design/components/overview.md#picking-something))                       |
| The properties row of task details            | DescriptionList; see [Built from existing parts](../../../../../design/components/overview.md#task-details)                                                  |
| The permissions an authorization asks for     | DescriptionList in a dialog ([Built from existing parts](../../../../../design/components/overview.md#authorization-oauth))                                  |
| Many items with the same columns              | [ListRow](../list-row/list-row.md) rows, or a table when it has to be one ([Built from existing parts](../../../../../design/components/overview.md#tables)) |
| What happened to the item, in order           | [Timeline](../timeline/timeline.md)                                                                                                                          |

## Anatomy

- `DescriptionList`: the list. Required.
- `DescriptionItem`: one fact. Required, one per fact.
  - `DescriptionTerm`: the label. It can hold a small help button after the text.
  - `DescriptionDetails`: the value.

## Variants

| Variant                  | Use for                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `direction="horizontal"` | Facts in two columns, the label on the left. Below 24rem (384px) of the list's own width the label sits above its value, the value 2px under it (the list's row gap) and 10px between a value and the next label (the 2px row gap plus 8px above each following label), in a narrow panel as on a phone, where a 390px screen leaves the list about 358px ([Switch on the region's width](../../../../../design/patterns/responsive.md#switch-on-the-regions-width)): there a label of up to 160px and the 16px gap would leave the value less room than the label. The list is its own container: put it in a parent with a definite width, not one that shrinks to its content (`inline-block`, `w-fit`, an absolutely positioned box with no width, a flex item with `flex-basis: auto` and no width), where it would collapse to no width |
| `direction="vertical"`   | Facts with the label above the value, in a narrow place such as a side panel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `direction="inline"`     | A few short facts in one row, each label beside its value, wrapping onto the next line: a task's properties                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

```example
description-list/compositions/horizontal
```

### Inline

`direction="inline"` lays the facts out like a line of text. Every label and value sits on one baseline, so a status chip, a button and plain text read as one line; the label is 12px from its value, the facts 24px apart, and a row that wraps leaves 8px between lines.

Every fact follows the same flow, whatever its value: it wraps to the next line only when it doesn't fit on this one, with the same 24px and 8px gaps as the others. A fact is at most 24rem wide, or the row's width if that is narrower. Put a long value, such as the message a task came from, in an [Ellipsis](../ellipsis/ellipsis.md): it cuts the text at that width and shows the whole of it on hover. The list caps the width but doesn't cut the text, so plain text left outside an Ellipsis wraps inside the 24rem instead. Don't give a long value a line of its own, a full width or other gaps. This is the layout for dense metadata such as a task's properties: a two-column grid (`direction="horizontal"`) gives each fact a line, so a handful of short facts takes a screen's height, and stacks into one column in a narrow panel or on a phone anyway.

A value drawn in a shape hangs its padding into the 12px gap, so its text starts where plain text would and its fill reaches outward ([Alignment](../../../../../design/foundations/alignment.md#a-shape-beside-plain-text)). raft-ui does this for a Badge (6px), a TaskChip or TaskStatusBadge (7px) or a Button that comes first in `DescriptionDetails`; the Button takes the Badge's 6px padding to fit. Any other shape, or one wrapped in another element, needs the same pull from its caller: a negative left margin equal to its left padding, and its `max-width` grown by as much.

```example
description-list/compositions/inline
```

## Behavior

- Make a value that can be changed a trigger with no frame: it shows the medium tier on hover and press, and opens the popup of a [Select](../select/select.md) or a combobox.
- Write an empty value that can be set as the action that sets it: Add to a Channel.

raft-ui has no frameless value trigger yet; the member-info composition uses a [Badge](../badge/badge.md) rendered as a button.

## Content

- Write labels as short nouns in sentence case: Status, Assignee, Created by.
- Build values from existing parts: a status chip ([Status](../status/status.md)), an avatar and a name ([Avatar](../avatar/avatar.md)), a reference chip, a runtime chip. Set IDs and times in Space Mono ([Typography](../../../../../design/foundations/typography.md#usage)).
- Name people and agents by their display names ([Writing](../../../../../design/content/writing.md#voice)).

## Accessibility

- The parts render a native `dl`, `div`, `dt` and `dd` through Base UI's `useRender`, so screen readers pair each label with its value.
- A value that opens a picker is a button. Give it an accessible name that says what it changes: `aria-label="Change status from In Progress"`.
- Give a help button in a label an `aria-label`: `aria-label="Explain member roles"`.

## Rules

- Don't make a fact that can't be changed look clickable: no chevron, no hover, no button.
- In `direction="inline"`, give every fact the same layout: no fact on a line of its own, no width or gap of its own. Cut a long value with an ellipsis at the fact's 24rem cap, and make the whole value available elsewhere (its tooltip, or the place it links to).
