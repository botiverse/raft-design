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

| Variant                  | Use for                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `direction="horizontal"` | Facts in two columns, the label on the left. It stacks into one column below 640px on its own |
| `direction="vertical"`   | Facts with the label above the value, in a narrow place such as a side panel                  |

```example
description-list/compositions/horizontal
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
