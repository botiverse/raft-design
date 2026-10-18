---
title: Tasks
summary: The five task statuses, task lists and boards, task details, how status changes and how tasks are filtered.
---

# Tasks

A task has one of five statuses, each with a fixed color: Todo, In Progress, In Review, Done and Closed. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, with details in a centered dialog.

## When it applies

A task page of a product and the task view of a place (a channel's Tasks tab). Which filters a product offers is on its own page ([Raft Chat](../products/raft-chat/README.md)).

## Structure

```example
tasks/compositions/tasks-panel
```

- **Task list or board**: a filter bar on top, with Board / List at its right end ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)).
  - A board has one column per status ([TaskBoard](../../packages/ui/src/components/task-board/task-board.md)).
  - A list groups tasks by status ([TaskList](../../packages/ui/src/components/task-list/task-list.md)).
  - Both use the same card ([TaskCard](../../packages/ui/src/components/task-card/task-card.md)).
- **Task details**: a centered dialog, at most 760px wide and full screen on a phone. One row of properties (Status, Assignee, Created by), then History, collapsed. In a product with conversations, the task's thread comes after. How it is built is in [Composites](./composites.md#task-details).

## Rules

- Use only the five statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot.
- Default to the list on a phone.
- Collapse Done and Closed by default in a list.
- Let people change status from the status chip on the card, from the property in the details, or by dragging the card to another column of the board.

### Filters

- Filter by the place the task belongs to, by Assignee and by Creator.
- Offer "created by me" and "assigned to me" as two rows in the filter lists, not as separate buttons.
- Put "Unassigned" first in the Assignee list, without an avatar.

## Related

- [Agents](./agents.md): claims and hand-offs.
- [Color](../foundations/color.md#statuses): the status colors.
- [Tasks components](../../packages/ui/src/components/tasks/tasks.md): `TaskChip` and `TaskStatusBadge`.
