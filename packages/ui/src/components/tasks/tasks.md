---
title: Tasks
summary: The parts every task view shares — the status badge and task chip that show where a task is, the status pixels, and the shell of a task panel.
status: stable
aliases: [TaskChip, TaskStatusBadge, TaskStatusIcon, TasksPanel, task marker, task status]
layer: collaboration
category: tasks
related: [status, task-card, task-board, task-list, badge, message-item]
---

# Tasks

These are the parts every task view shares. `TaskStatusBadge` writes a task's status as a status chip: the status's soft tint, its pixel and its name. `TaskChip` is the same chip carrying a task instead, such as a task mentioned in running text (`#design:#25`). `TasksPanelRoot` and its parts are the shell of a page of tasks. The six statuses and how tasks are shown are in [Tasks](../../../../../design/patterns/tasks.md); their colors are in [Color](../../../../../design/foundations/color.md#statuses).

```example
tasks/compositions/task-status
```

## When to use

| Situation                                             | Use                                                                                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A task's status: on a card, in properties, in details | `TaskStatusBadge`                                                                                                                         |
| The tasks created from a message                      | A list of compact rows under it, each with a `TaskStatusBadge` ([Tasks](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)) |
| A task mentioned in running text                      | `TaskChip` with `variant="inline"`                                                                                                        |
| A task's status as a pixel beside a word              | `TaskStatusIcon`                                                                                                                          |
| A page or a tab of tasks                              | `TasksPanelRoot` with its toolbar and viewport                                                                                            |
| A task as a row on a board or in a list               | [TaskCard](../task-card/task-card.md)                                                                                                     |
| How an agent is                                       | An agent state chip ([Status](../status/status.md#agent-state-chips))                                                                     |

## Anatomy

- `TaskStatusBadge`: a `TaskChip` with the status pixel and the status name, which the caller supplies.
- `TaskChip`: the chip. `status` sets its tint. Its children are a status icon, then the task number, then the assignee.
- `TaskStatusIcon`, and `TaskTodoIcon`, `TaskInProgressIcon`, `TaskInReviewIcon`, `TaskDoneIcon`, `TaskClosedIcon`: the status pixel.
- `TasksPanelRoot`: the column of a task page.
  - `TasksPanelToolbar`: the bar on top, with a seam under it. It holds `TasksPanelToolbarNewTask`, `TasksPanelToolbarFilters` and `TasksPanelToolbarView` (Board / List), and lays them out by the panel's own width: below 28rem (448px) New Task and the view switch share the first line and the filters take the second; from 28rem they share one row that wraps. A task column 360px wide on a wide window takes the narrow layout ([Switch on the region's width](../../../../../design/patterns/responsive.md#switch-on-the-regions-width)). `TasksPanelToolbarGroup` and `TasksPanelToolbarLabel` are for anything else in it.
  - `TasksPanelViewport`: the scrolling content: a [TaskBoard](../task-board/task-board.md) or a [TaskList](../task-list/task-list.md).
  - `TasksPanelEmpty`: holds an [EmptyState](../empty-state/empty-state.md) when there are no tasks.
- `TaskLoadingList`, `TaskLoadingRow`: placeholder rows while tasks load.
- `taskStatusSoft`, `taskStatusStrong` and `TASK_STATUS_IDS`: the recipes for building another status surface from the same `task-status-*` tokens.

Not yet implemented: these parts know five statuses. Backlog, the sixth, isn't in `TASK_STATUS_IDS`, and `TaskStatusIcon` and `TaskChip` don't draw it; until raft-ui adds it, draw its pixel and chip by hand ([Color](../../../../../design/foundations/color.md#statuses)).

```example
tasks/compositions/tasks-panel
```

Not yet implemented: this example shows the tasks before [0042](../../../../../design/decisions/0042-tasks-as-a-to-do-list.md), with five statuses and no completion control.

## Variants

| Variant             | Use for                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"` | A chip on its own: on a task row, on a card, in a details row                                                                                             |
| `variant="inline"`  | A chip in running text, in the box every chip in a message's text shares ([Chips in running text](../message-item/message-item.md#chips-in-running-text)) |
| `size="sm"`         | A default chip in one row with small badges, such as the metadata row of an Activity item                                                                 |

```example
task-chip/compositions/task-chip-variants
```

```example
task-chip/compositions/task-chip-in-footer
```

```example
task-chip/compositions/task-chip-in-markdown
```

```example
task-chip/compositions/task-chip-sizes
```

## States

- **Loading**: `loading` dims a `TaskChip` and ignores the pointer while the task is resolved.
- **The panel is loading**: `TaskLoadingList`, the same size as the cards it stands for ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)).
- **No tasks**: `TasksPanelEmpty`, with one empty state when there are no tasks and another when the filters match none.
- **Failed to load**: an error at the panel's scope, with Retry.

```example
task-chip/compositions/task-chip-statuses
```

```example
tasks/compositions/tasks-empty-states
```

```example
tasks/compositions/tasks-error
```

## Behavior

- Make a status chip on a task card a button that opens the list of statuses, with a down arrow after the name ([TaskCard](../task-card/task-card.md)). The other ways to change a status are in [Tasks](../../../../../design/patterns/tasks.md#rules).
- Make a task reference in running text open the task. A task row under a message opens it too; only its completion control changes the status ([Tasks in a conversation](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)).

## Content

- Spell the statuses Backlog, Todo, In Progress, In Review, Done and Closed. `TaskStatusBadge` has no built-in label: the caller passes it, and translates it.
- Set the task number in Space Mono: `#25` ([Typography](../../../../../design/foundations/typography.md#usage)).
- In a task reference, write the place, then the number: `#design:#25` ([Referring to a task](../../../../../design/patterns/tasks.md#referring-to-a-task)).

## Accessibility

None of these parts wraps a Base UI primitive; `TaskChip` renders a `<span>` unless `render` makes it a link or a button.

- The status pixel is hidden from assistive technology. Always pass the status name, or keep the task number next to it.
- Render a task chip that opens the task as an `<a>` or a `<button>`, and give it an `aria-label` that says what it opens ("Open task #25") when its text doesn't. A `title` is not an accessible name.

## Rules

- Build any new surface that shows a task status from `taskStatusSoft` and `taskStatusStrong`, so a status has one color everywhere.
- Don't give a chip a border: the tint is a highlight, not a sticker ([Status](../status/status.md#rules)). Backlog's chip, which has no tint, is the exception ([Color](../../../../../design/foundations/color.md#statuses)).
- A chip splits its padding evenly between its two ends: 7px each, 5px when `sm`, 4.5px inline, the same total as before. The status pixel is drawn to its edges, so the space before it is all padding; with 2px less on that end, the pixel sat 6px from the edge and the last letter 8.5px ([Alignment](../../../../../design/foundations/alignment.md#chips)). An inline chip keeps the status pixel in its own 10px box, 4px from the text ([Chips in running text](../message-item/message-item.md#chips-in-running-text)).
