---
title: TaskBoard
summary: The board view of tasks — one column per status, in status order, with cards that can be dragged to another column to change their status.
status: stable
aliases: [Kanban]
layer: collaboration
category: tasks
related: [task-card, task-list, tasks, segmented-control]
---

# TaskBoard

A TaskBoard shows tasks in one column per status, from Backlog to Closed. Dragging a card to another column changes its status. It is one of the two views of a set of tasks; the other is the [TaskList](../task-list/task-list.md). When to show which is in [Tasks](../../../../../design/patterns/tasks.md).

```example
task-board/compositions/task-board
```

Not yet implemented: this example shows the board before [0042](../../../../../design/decisions/0042-tasks-as-a-to-do-list.md), with five columns and no completion control on the cards.

## When to use

| Situation                                  | Use                                   |
| ------------------------------------------ | ------------------------------------- |
| Tasks by status, with room for six columns | TaskBoard                             |
| Tasks on a phone, or in a narrow panel     | [TaskList](../task-list/task-list.md) |
| One task                                   | [TaskCard](../task-card/task-card.md) |

## Anatomy

- `TaskBoardRoot`: the row of columns. Required.
- `TaskBoardColumn`: one status. A collapsible section. Required, one per status.
  - `TaskBoardColumnTrigger`: the column heading, which collapses the column.
    - `TaskBoardColumnHeading`: `TaskBoardColumnBadge` (the status pixel and name) and `TaskBoardColumnCount`.
    - `TaskBoardColumnChevron`: the arrow that shows whether the column is open.
  - `TaskBoardColumnPanel` and `TaskBoardColumnItems`: the cards.
  - `TaskBoardColumnEmpty`: what an empty column says, with three texts: `TaskBoardColumnEmptyIdle` normally, `TaskBoardColumnEmptyAllowed` while a card can be dropped there, `TaskBoardColumnEmptyBlocked` while it can't.

Drag and drop comes from the `TaskDnd` parts (`TaskDndProvider`, `TaskDropZone`, `TaskDraggable`), which the board composition wires in.

## States

| State                   | Look                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Empty column            | A dashed `line-seam` box with one line of text in `foreground-hint`                                                |
| A card can be dropped   | The empty box hides and the drop placeholder shows; a collapsed column gets a dashed `line-strong` outline         |
| A card is over a column | The column keeps its fill; only the drop placeholder marks where the card lands, so one signal says where, not two |
| A card can't be dropped | The empty box says why, in `foreground-muted`                                                                      |

```example
task-board/compositions/task-board-empty-columns
```

## Behavior

- Order the columns Backlog, Todo, In Progress, In Review, Done, Closed, and start Backlog, Done and Closed collapsed ([Tasks](../../../../../design/patterns/tasks.md#rules)).
- Don't refuse a drop because of the status a card has or would get: any status can be set from any status ([Tasks](../../../../../design/patterns/tasks.md#rules)). A column refuses a card only for a reason outside the statuses, such as a task the person may not change.
- Switch between the board and the list with Board / List at the right end of the filter bar ([Tasks](../../../../../design/patterns/tasks.md#structure)), and remember the person's choice.
- Scroll the whole board in one viewport, both ways. Columns keep their width and never scroll on their own.
- Mount only the visible cards of a tall column with a virtualizer of your own that reads the board's scroll position, as below.

```example
task-board/compositions/task-board-virtualization
```

## Content

- Write the empty text the same way as an empty group in a list ([TaskList](../task-list/task-list.md#content)).
- While a card is dragged over an empty column, name the status it would get, or, when the column refuses it, why ("You can't change this task's status").

## Accessibility

- Each column is a Base UI `Collapsible` rendered as a `section`; its trigger is a button with `aria-expanded`.
- Give each column an accessible name: the status name in the trigger, or `aria-label` on the section.
- Cards can be moved with the keyboard: Space picks a card up, the arrow keys move it, Space drops it and Escape puts it back. Enter opens the card ([Drag and drop](../../../../../design/patterns/drag-and-drop.md#keyboard)).
- Announce each step by name: "Picked up Task #25. Over Todo." "Dropped Task #25 in In Review." Pass the card's and the status's names to `TaskDndProvider`'s `describe`; the board composition shows how. The board doesn't announce on its own, and without `describe` nothing is announced.

## Rules

- Count the cards in every column heading, in Space Mono.
