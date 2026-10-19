---
title: Tasks
summary: The five task statuses, task lists and boards, task details, how status changes and how tasks are filtered.
---

# Tasks

A task has one of five statuses, each with a fixed color: Todo, In Progress, In Review, Done and Closed. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, with details in a centered dialog.

## When it applies

A task page of a product and the task view of a place (a channel's Tasks tab). Which filters a product offers is on its own page ([Raft Chat](../products/raft-chat/tasks.md)).

## Structure

```example
tasks/compositions/tasks-panel
```

- **Task list or board**: a filter bar on top, with Board / List at its right end ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)). On a phone, Board / List shows only its icons.
  - A board has one column per status, each 232px wide ([TaskBoard](../../packages/ui/src/components/task-board/task-board.md)).
  - A list groups tasks by status ([TaskList](../../packages/ui/src/components/task-list/task-list.md)).
  - Both use the same card ([TaskCard](../../packages/ui/src/components/task-card/task-card.md)), and both show the five statuses in the order above, each with a collapsible heading and a count.
- **Task details**: a centered dialog, 960px wide (or the window less 32px) and at most 900px high (86% of the window), full screen on a phone. From top to bottom:
  1. A bar with the place on one line and the task number on the next ("Task #25"), a button that opens the task's thread in its place, and ×. On a phone the bar has Back instead of ×.
  2. The title and the description, which folds after 3 lines.
  3. One row of properties (Status, Assignee, Created by) in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md).
  4. History, collapsed ([Timeline](../../packages/ui/src/components/timeline/timeline.md)).
  5. In a product with conversations, the task's thread and its composer.

## Rules

- Use only the five statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot.
- Default to the list on a phone and to the board on desktop. Remember the person's last choice.
- Collapse Done and Closed by default, on the board and in the list.
- Let people change status from the status chip on the card, from the property in the details, or by dragging the card to another column of the board. A person who can't change tasks sees the chip without a menu and can't drag.
- Offer only the moves that are allowed from the current status in the chip's menu.
- Close task details with ×, Esc or a press outside the dialog.
- While a list loads, show skeleton cards in its place ([Feedback](./feedback.md#empty-loading-and-failed)).

### Filters

- Filter by the place the task belongs to, by Assignee and by Creator. Each filter is a [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md) that opens a list with search; several values can be chosen.
- Show an active filter as `info-soft` with the number of values chosen, in Space Mono.
- Offer "created by me" and "assigned to me" as the first rows of the Creator and Assignee lists, not as separate buttons.
- Put "Unassigned" after "assigned to me" in the Assignee list. Show these rows without an avatar, then people and agents from A to Z.
- Show Clear All, a ghost button, after the filters while any filter is active.

## Related

- [Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#handing-off): claims and hand-offs.
- [Color](../foundations/color.md#statuses): the status colors.
- [Tasks components](../../packages/ui/src/components/tasks/tasks.md): `TaskChip` and `TaskStatusBadge`.
