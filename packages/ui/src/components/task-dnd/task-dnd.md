---
title: TaskDnd
summary: The drag-and-drop parts that let people move task cards between columns and around other cards, with the drop policy and the move left to the caller.
status: stable
aliases: [Drag and drop, DnD, TaskDraggable, TaskDropZone]
layer: collaboration
category: tasks
related: [task-board, task-card, task-list, tasks]
---

# TaskDnd

TaskDnd is the drag-and-drop wiring behind the [TaskBoard](../task-board/task-board.md): a provider, the cards people drag, the places they drop them, the gap a card lands in and the copy of the card that follows the pointer. It decides nothing about tasks. The caller says which drops are allowed and what a move does, such as changing #25 from Todo to In Review.

```example
task-dnd/compositions/task-dnd
```

## When to use

| Situation                                                       | Use                                                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Moving a card to another column of a board to change its status | TaskDnd, inside a [TaskBoard](../task-board/task-board.md)                                                                  |
| Reordering a card among the cards of a column                   | TaskDnd, with a drop target on each card                                                                                    |
| Changing a status without dragging                              | The status chip on the card, or the property in the task's details ([Tasks](../../../../../design/patterns/tasks.md#rules)) |
| Reordering composer attachments                                 | The composer's own sortable attachments ([Composer](../composer/composer.md))                                               |
| Resizing a column                                               | [Resizable](../resizable/resizable.md)                                                                                      |

## Anatomy

- `TaskDndProvider`: wraps the board and its overlay. It holds `isDropAllowed`, the caller's policy, and calls `onMove` when a card is dropped on an allowed target. Required.
- `TaskDropZone`: a place a card can be dropped, usually a `TaskBoardColumn` through `render`. It reports `dropState`: `idle`, `allowed` or `blocked`.
- `TaskDraggable`: wraps one [TaskCard](../task-card/task-card.md) and makes it draggable. With `dropId` it is also a drop target, so a card can land before or after it.
- `TaskDropPlaceholder`: the gap where the card would land, before or after a card, or in an empty column. It shows only while the drop there is allowed.
- `TaskDragOverlay`: the copy of the card that follows the pointer. Render the dragged card inside it, and nothing when no card is dragged.

## States

| State                  | Look                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Dragging               | The copy in `TaskDragOverlay` is the only card with `shadow-float` ([TaskCard](../task-card/task-card.md#states))                     |
| Over an allowed target | `TaskDropPlaceholder` shows a dashed `line-strong` box with the height of the dragged card                                            |
| Over a blocked target  | No placeholder; the target's `dropState` is `blocked`, and an empty column says why ([TaskBoard](../task-board/task-board.md#states)) |
| Dragging turned off    | `disabled` on the provider removes every way to drag; `disabled` on a `TaskDraggable` removes it for that card                        |

## Behavior

- With a mouse, a drag starts once the pointer has moved 5px, so a click on the card isn't a drag.
- On a touch screen, a drag starts after a press and hold of 200ms.
- Where the card lands follows the middle of the dragged card: above the middle of the card under it is `before`, below is `after`.
- The card doesn't animate back or into place on drop. The move is the caller's: `onMove` may return a promise, and `onMoveError` receives its rejection, so the caller can undo the change and say what went wrong.

## Accessibility

- The parts wrap dnd-kit, not Base UI. `TaskDraggable` carries dnd-kit's attributes: it is focusable, with a role description and instructions for screen readers.
- Keyboard: Space picks the focused card up, the arrow keys move it, Space drops it and Escape cancels.
- dnd-kit's own announcements name cards by their ID. Announce each move in words in a polite live region, such as "Task #25 moved to In Review"; the [TaskBoard](../task-board/task-board.md#accessibility) composition shows how.
- `TaskDropPlaceholder` is hidden from assistive technology.

## Rules

- Decide in `isDropAllowed` which drops are allowed, so the target says while the card is over it that it can't move there ([TaskBoard](../task-board/task-board.md#content)).
- Offer another way to change a status: dragging is one of three ([Tasks](../../../../../design/patterns/tasks.md#rules)).
- Put the dragged card's own `TaskCard` in `TaskDragOverlay`, so the card under the pointer reads the same as the one in the column.
