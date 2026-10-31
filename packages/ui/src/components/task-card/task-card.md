---
title: TaskCard
summary: The card that shows one task — its completion control, number, title and a status chip that changes the status — on a task board and in a task list.
status: stable
aliases: []
layer: collaboration
category: tasks
related: [task-board, task-list, tasks, select, description-list]
---

# TaskCard

A TaskCard shows one task: a round completion control, its number, its title and a status chip people can change. A board and a list use the same card. How tasks are shown, filtered and opened is in [Tasks](../../../../../design/patterns/tasks.md).

```example
task-card/compositions/task-card-state-matrix
```

Not yet implemented: the examples on this page show the card before [0042](../../../../../design/decisions/0042-tasks-as-a-to-do-list.md), with no completion control and a menu of five statuses.

## When to use

| Situation                                                     | Use                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A task on a board or in a list                                | TaskCard, inside a [TaskBoard](../task-board/task-board.md) column or a [TaskList](../task-list/task-list.md) group                              |
| A task in a conversation                                      | Not a card: a row in the list of tasks under the message it came from ([Tasks](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)) |
| A task's status or number in running text, a row or a heading | `TaskChip` or `TaskStatusBadge` ([Tasks components](../tasks/tasks.md))                                                                          |
| The task's details                                            | A centered dialog; see [Tasks](../../../../../design/patterns/tasks.md#structure)                                                                |

## Anatomy

- `TaskCard`: the card. Pass `onClick` to make it open the task's details.
- `TaskCardRow` and `TaskCardBody`: the layout around the text.
- `TaskCardMeta`: the first line. It starts with the completion control: put a [TaskCompletionControl](../task-completion-control/task-completion-control.md) first in it ([Completing a task](../../../../../design/patterns/tasks.md#completing-a-task)).
  - `TaskCardChannel`: the place the task belongs to (#launch-week). Optional; see [Content](#content).
  - `TaskCardStatus`: the status chip. Required.
  - `TaskCardNumber`: the task number (#25). Required.
  - `TaskCardLegacy`: a marker for a task from the old task system. Optional.
- `TaskCardTitle`: the task's title, at most 3 lines. Required.
- `TaskCardDescription`: a short description, at most 2 lines. Optional.

## States

| State                                    | Use for                                                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `busy` on `TaskCard` or `TaskCardStatus` | A status change is being saved; the chip can't be pressed until it finishes                                                                                   |
| `disabled`                               | A task that can't be opened or changed: a `fill-muted` card with `foreground-disabled` text                                                                   |
| Dragging                                 | On a board, the lifted copy of the card is the only card with `shadow-float`; the card stays in its column at 40% ([TaskDnd](../task-dnd/task-dnd.md#states)) |

```example
task-card/compositions/task-card-state-matrix
```

## Behavior

- A card with an `onClick` hovers with the subtle tier, like the other cards people read, and presses with the medium tier; its status chip hovers medium ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
- Pressing the status chip opens a list of all six statuses, from any status, with a check on the current one ([Select](../select/select.md)). Choosing one changes the status at once.
- Pressing the completion control completes or reopens the task ([Completing a task](../../../../../design/patterns/tasks.md#completing-a-task)).
- Pressing the chip or the completion control doesn't open the card: stop the click from reaching `TaskCard`.

```example
task-card/compositions/task-status-select
```

## Content

- Write the title in sentence case, as a verb and its object: "Polish the onboarding flow".
- Show the channel only where tasks from several places are listed together, such as a product's task page. In a place's own Tasks view every task belongs to that place, so leave it out.
- Set the channel and the number in Space Mono; the parts do this.
- Spell the statuses Backlog, Todo, In Progress, In Review, Done and Closed ([Writing](../../../../../design/content/writing.md#voice)).

## Accessibility

- `TaskCard` uses Base UI's `useRender` and renders an `article`. With `onClick` it is clickable but not a button: give the keyboard a way to open the task, such as a link or button on the title.
- `TaskCardStatus` is a native `button` and the trigger of the status [Select](../select/select.md). Give it an accessible name that includes the task: `aria-label="Change status for task #25"`.
- The completion control's semantics are in [Completing a task](../../../../../design/patterns/tasks.md#completing-a-task), and the keys of a list of cards in [Keyboard in a list of tasks](../../../../../design/patterns/tasks.md#keyboard-in-a-list-of-tasks).
- `busy` sets `aria-busy`; `disabled` sets `aria-disabled` on the card.

## Rules

- Make the completion control and the status chip the only things that can be changed on the card. Assignee and creator are changed in the task's details.
- Don't add a shadow, a colored band or an accent border to the card: it is a white card with a hairline ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
