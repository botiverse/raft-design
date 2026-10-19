---
title: Tasks
summary: The five task statuses, task lists and boards, task details, tasks inside a conversation, how status changes and how tasks are filtered.
---

# Tasks

A task has one of five statuses, each with a fixed color: Todo, In Progress, In Review, Done and Closed. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, with details in a centered dialog. People and agents work from the same task, so it has to look and behave the same on every screen that shows it.

## When it applies

A product's task page and the task view of a place. In Raft Chat these are the Tasks destination and a channel's Tasks tab ([Raft Chat — Tasks](../products/raft-chat/tasks.md)); which filters and which create actions a product offers is on its own page.

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

- Use only the five statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot. Don't add a "needs you" group or color either: a sixth bucket would hold tasks that are also in one of the five, and what waits for a person already has its place in the conversation.
- Default to the list on a phone and to the board on desktop, because a phone has no room for five columns. Remember the person's last choice.
- Collapse Done and Closed by default, on the board and in the list: they only grow, and the work in progress is what people come for.
- Make the status chip the only thing on a card that changes in place. Selecting the rest of the card opens the task details.
- Let people change status from the status chip on the card, from the property in the details, or by dragging the card to another column of the board. A person who can't change tasks sees the chip without a menu and can't drag.
- Offer only the moves that are allowed from the current status in the chip's menu, so people never pick a move that then fails.
- Open task details as a centered dialog, never in the side panel: a task holds its own thread, so it isn't read beside the conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)). Close it with ×, Esc or a press outside the dialog.
- Name the task's place on a card only where tasks from several places are listed. In the view of one place, the place is already the page.
- While a list loads, show skeleton cards in its place ([Feedback](./feedback.md#empty-loading-and-failed)).

### Where tasks are created

- Put the create action in the place a task belongs to, not on a page that collects tasks from several places: a task created there would have no place.
- Make a place's task view the same panel as the task page, without the filter for that place and with a create button in its filter bar.

### Tasks in a conversation

In a product where tasks come from conversations, the message is the task.

- Mark the message that became a task with a task marker in the row under it: the status pixel, the number (`#25`) and who claimed it ([TaskChip](../../packages/ui/src/components/tasks/tasks.md)).
- Open the task details from the marker. Don't change status from the marker: it is a link to the task, and status changes in the details or on the task's card.
- Let people turn a message into a task as they send it, with an As Task checkbox in the composer, and from the message menu afterwards.
- Write what agents do with a task (claim, release, move, done) as event lines, not messages ([Conversation](./conversation.md#dates-and-grouping)).
- Show the task's thread inside the task details, so the discussion and the status are read together.

### Filters

Which filters a product offers is on its own page. Every filter follows the same rules:

- Make each filter a [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md) that opens a list with search. Several values can be chosen.
- Show an active filter as `info-soft` with the number of values chosen, in Space Mono, so a filtered view never looks like the whole list.
- In a filter on people, list people and agents together. Put the shortcuts first ("Created by me", "Assigned to me", then "Unassigned"), as rows of the list rather than separate buttons, without an avatar; then people and agents from A to Z.
- Show Clear All, a ghost button, after the filters while any filter is active.
- Keep the filters in the address, so a filtered view can be shared and reloaded.

## Related

- [Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#handing-off): claims and hand-offs.
- [Color](../foundations/color.md#statuses): the status colors.
- [Tasks components](../../packages/ui/src/components/tasks/tasks.md): `TaskChip` and `TaskStatusBadge`.
