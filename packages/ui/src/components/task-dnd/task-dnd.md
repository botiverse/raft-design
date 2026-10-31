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

TaskDnd is the drag-and-drop wiring behind the [TaskBoard](../task-board/task-board.md): a provider, the cards people drag, the places they drop them, the gap a card lands in and the copy of the card that follows the pointer. It follows the one drag model ([Drag and drop](../../../../../design/patterns/drag-and-drop.md)) and is built on its parts ([Drag](../drag/drag.md)). It decides nothing about tasks. The caller says which drops are allowed and what a move does, such as changing #25 from Todo to In Review.

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

- `TaskDndProvider`: wraps the board and its overlay. It holds `isDropAllowed`, the caller's policy, calls `onMove` when a card is dropped on an allowed target, and announces the drag from `describe`. Required.
- `TaskDropZone`: a place a card can be dropped, usually a `TaskBoardColumn` through `render`. It reports `dropState`: `idle`, `allowed` or `blocked`.
- `TaskDraggable`: wraps one [TaskCard](../task-card/task-card.md) and makes it draggable. With `dropId` it is also a drop target, so a card can land before or after it.
- `TaskDropPlaceholder`: the gap where the card would land, before or after a card, or in an empty column, in the one dashed look (`DropPlaceholder`). It shows only while the drop there is allowed, and never next to the dragged card itself.
- `TaskDragOverlay`: the copy of the card that follows the pointer, a [`DragLift`](../drag/drag.md#anatomy) with the card's radius. Render the dragged card inside it, and nothing when no card is dragged.

## States

| State                  | Look                                                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dragging               | The copy in `TaskDragOverlay` is lifted: `layer-popover`, `shadow-float` and a `line-seam` ring. The card itself stays in its column at 40% (`data-drag-origin`)                                                 |
| Over an allowed target | `TaskDropPlaceholder` shows the dashed `line-strong` place on `fill-subtle`, with the height of the dragged card                                                                                                 |
| Over its own card      | No placeholder: dropping there moves nothing                                                                                                                                                                     |
| Over a blocked target  | No placeholder; the target's `dropState` is `blocked`, and an empty column says why ([TaskBoard](../task-board/task-board.md#states)). Render a `DragRefusalHint` with the reason, as the board composition does |
| Dragging turned off    | `disabled` on the provider removes every way to drag; `disabled` on a `TaskDraggable` removes it for that card                                                                                                   |

## Behavior

- With a mouse, a drag starts once the pointer has moved 6px, so a click on the card isn't a drag (`useDragSensors`).
- On a touch screen, hold the card still for 500ms, then move it: the drag starts on that move. Moving before the hold is up scrolls the board instead ([Dragging on a touch screen](../../../../../design/foundations/states.md#dragging-on-a-touch-screen)).
- Where the card lands follows the middle of the dragged card: above the middle of the card under it is `before`, below is `after`.
- While a `TaskDragOverlay` is rendered, the dragged card stays in its place at 40% instead of moving with the pointer; keep it in its column while it is dragged. A board that still takes the card out of its column while it is dragged keeps working, as before.
- On a drop the copy glides into the card's new place, and on a cancel back to the card, in 160ms (`motion-drag-settle-*`; none with reduced motion). The move is the caller's: render the card in its new place in `onMove`, so the copy has a place to glide to. `onMove` may return a promise, and `onMoveError` receives its rejection, so the caller can undo the change and say what went wrong.
- A drop on the dragged card's own target, or on nothing, calls no `onMove`.
- The board scrolls while the pointer is within 48px of the edge of anything that scrolls (`DragLift`).

## Accessibility

- The parts wrap dnd-kit, not Base UI. `TaskDraggable` carries dnd-kit's attributes: it is focusable, with a role description and instructions for screen readers.
- Keyboard: Tab to a card, then Space picks it up; Enter never does, so Enter can open the card. ArrowDown and ArrowUp move it one slot down or up its column, before or after each card; ArrowLeft and ArrowRight move it to the nearest drop target in the next column, such as an empty column or the card level with it. Space drops it and Escape cancels. The keys step between drop targets, so a card moves the same way whether or not it leaves its column while it is dragged.
- After a keyboard drop, focus stays where dnd-kit leaves it. Moving focus to the moved card, which has a new place in the DOM, is the caller's job: focus it in `onMove` or `onDragEnd` once the board has rendered the move.
- The instructions read with each card say Space, not Enter (`dragInstructions`). Each step is announced by name from `describe`: the card's title (`name`), the status or column it would land in (`place`) and why a place refuses it (`refusal`), built with `createDragAnnouncements`; pass your translations as `messages`. Without `describe` nothing is announced: dnd-kit's own announcements, which read out ids, never ship. `accessibility` goes to dnd-kit's `DndContext` as is, over both. The [TaskBoard](../task-board/task-board.md#accessibility) composition shows how.
- `TaskDropPlaceholder` is hidden from assistive technology.

## Rules

- Decide in `isDropAllowed` which drops are allowed, so the target says while the card is over it that it can't move there ([TaskBoard](../task-board/task-board.md#content)).
- Offer another way to change a status: dragging is one of four ([Tasks](../../../../../design/patterns/tasks.md#rules)).
- Put the dragged card's own `TaskCard` in `TaskDragOverlay`, so the card under the pointer reads the same as the one in the column.
