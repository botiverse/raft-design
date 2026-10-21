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

| Variant                  | Use for                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `direction="horizontal"` | Facts in two columns, the label on the left. It stacks into one column below 640px on its own               |
| `direction="vertical"`   | Facts with the label above the value, in a narrow place such as a side panel                                |
| `direction="inline"`     | A few short facts in one row, each label beside its value, wrapping onto the next line: a task's properties |

```example
description-list/compositions/horizontal
```

### Inline

`direction="inline"` lays the facts out like a line of text. Every label and value sits on one baseline, so a status chip, a button and plain text read as one line; the label is 12px from its value, the facts 24px apart, and a row that wraps leaves 8px between lines.

Every fact has the same line box, 28px tall with its text's baseline where callout text centered in it has its baseline, so the lines of a wrapped list are evenly spaced: their baselines are 36px apart (28px plus the 8px between lines), whatever the facts on them. A value drawn in a shape (a 22px chip, a trigger around an avatar, a padded button) fits inside that line and never makes it taller; raft-ui holds the line with an empty strut at the start of each fact. A taller value would break the rhythm: keep a shape in a fact at most 28px tall, centered on its text.

Every fact follows the same flow, whatever its value: it wraps to the next line only when it doesn't fit on this one, with the same 24px and 8px gaps as the others. A fact is at most 24rem wide, or the row's width if that is narrower. A long value, such as the message a task came from, ends in an ellipsis at that width; don't give it a line of its own, a full width or other gaps. This is the layout for dense metadata such as a task's properties: a two-column grid (`direction="horizontal"`) gives each fact a line, so a handful of short facts takes a screen's height, and stacks into one column on a phone anyway.

A value that leads with an avatar or an icon (an assignee, the message a task came from) still puts its text on that baseline: raft-ui lays the parts of `DescriptionDetails` on the baseline and centers an avatar or an icon among them on the text's line, which in Space Grotesk is the cap-height center ([Alignment](../../../../../design/foundations/alignment.md#a-control-and-its-label)). A box with no text, such as an avatar, otherwise gives its bottom edge as the baseline, and a value that starts with one stands several pixels above its label.

A value wrapped in its own trigger (a button around an avatar, a name, an excerpt and a time) does the same inside the trigger, and lets the avatar's badge (a presence light at its corner) hang outside the trigger's box: give the trigger `overflow-visible` and truncate the name itself, so a Badge's own `overflow-hidden` doesn't cut the badge. Inside the trigger: lay its parts out with `items-baseline`, center the avatar and the icons with `self-center`, and size the trigger by its padding, not a fixed height, so its line box is the text's. A trigger that centers its parts (`items-center`) takes its baseline from the avatar and lifts the whole value off the row.

A value drawn in a shape hangs its padding into the 12px gap, so its text starts where plain text would and its fill reaches outward ([Alignment](../../../../../design/foundations/alignment.md#a-shape-beside-plain-text)). raft-ui does this for a Badge, TaskChip, TaskStatusBadge or Button that comes first in `DescriptionDetails`; the Button takes the chip's 6px padding to fit. Any other shape, or one wrapped in another element, needs the same pull from its caller: a negative left margin equal to its left padding, and its `max-width` grown by as much.

```example
description-list/compositions/inline
```

## Behavior

- Make a value that can be changed a trigger with no frame: it shows the pressed overlay on hover and press, and opens the popup of a [Select](../select/select.md) or a combobox.
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
