---
title: TaskCompletionControl
summary: The round check that leads a task row or card and marks the task Done in one press, or reopens a done one.
status: experimental
aliases: [Completion control, Complete toggle, Task checkbox]
layer: collaboration
category: tasks
related: [tasks, task-card, task-list, task-board, checkbox]
---

# TaskCompletionControl

TaskCompletionControl is how a list of tasks is worked through as a to-do list: one press marks the task Done, and a press on a done task reopens it. It is a round check at the start of every task row and card, beside a conversation, under a message, on a board and in a list. When it shows and what a press does to the task are in [Tasks](../../../../../design/patterns/tasks.md), under Completing a task.

```example
task-completion-control/compositions/preview
```

## When to use

| Situation                                                       | Use                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Completing or reopening a task, at the start of its row or card | TaskCompletionControl                                                                        |
| Selecting a row, to act on several at once                      | [Checkbox](../checkbox/checkbox.md), or `CheckboxIndicator` in a row that owns the semantics |
| Changing a task to any other status                             | The status chip's menu ([TaskCard](../task-card/task-card.md))                               |
| A yes or no that is saved with a form                           | [Checkbox](../checkbox/checkbox.md)                                                          |

## Anatomy

- `TaskCompletionControl`: a native `button` with checkbox semantics, holding a round `CheckboxIndicator` (`shape="circle"`), 20px. Required on every task row and card. The row or card around it, the title it names and its tooltip are the caller's.

## States

```example
task-completion-control/compositions/states
```

- **Unchecked:** an empty circle with an ink edge, on every status but Done: Backlog and Closed included.
- **Hover:** while unchecked, a faint check shows when the pointer is over the control itself. A hover elsewhere on the row is a hover on the row and previews nothing, even when the row or a column around it is a Tailwind `group`.
- **Checked:** an ink circle with the check knocked out, on a Done task only.
- **Disabled:** for a person who can't change the task: the disabled look, `disabled` and `aria-disabled`, and no preview.

## Behavior

- Pass `checked` from the task's status and change the task in `onCheckedChange`: it is called with `true` to complete the task and `false` to reopen it. The control keeps no state of its own; what completing does (the Toast, the pause before the task moves to Done, Undo) is the caller's ([Tasks](../../../../../design/patterns/tasks.md)).
- A press stops at the control: its click, Space and Enter never reach the row or card it sits on, so it never also opens the task, and on a [TaskBoard](../task-board/task-board.md) card Space completes the task instead of picking the card up. Arrow keys still reach the list, for moving between rows.
- An `onClick` that calls `event.preventDefault()` keeps `onCheckedChange` from being called.
- Its hit area reaches 8px past the 20px circle with a mouse (36px) and 12px on a touch screen (44px), as a Checkbox's does ([Accessibility](../../../../../design/foundations/accessibility.md#hit-targets)).

## Content

- Name it by the task: its number, then its title, "#25 Fix onboarding copy".
- Put the action in its tooltip if the product shows one: Complete, Accept and Complete on an In Review task, Reopen on a done one ([Tooltip](../tooltip/tooltip.md)).

## Accessibility

TaskCompletionControl renders a native `button` with `role="checkbox"` and wraps no Base UI primitive. `aria-checked` is true only on a done task.

- Give it `aria-label` (or `aria-labelledby`) with the task; the type requires one. Keep the same name when the state changes: the checked state already says whether the task is done, so a name that says what a press does ("Reopen #25") would be read as "Reopen #25, checkbox, checked".
- Space toggles it. Enter doesn't, as on any checkbox, so it isn't taken for the row's Enter, which opens the task.
- It shows its own focus ring, apart from the row's.
- `CheckboxIndicator` inside it is `aria-hidden`; the button carries the role, the state and the name.

## Rules

- Keep it round. A square box at the start of a row reads as "select this row", which is what a Checkbox there means; the circle reads as "done", as in a to-do list.
- Use it only for completing a task. Don't use a round `CheckboxIndicator` or a round Checkbox for anything else ([Checkbox](../checkbox/checkbox.md#rules)).
- Show it checked only on a Done task. A press on any other status, Backlog and Closed included, completes the task.
- Make it the first thing on a task row or card, and its own button on top of the row or card: pressing the rest still opens the task.
