---
title: Raft Chat — Tasks
summary: The Tasks destination — its title and count, the Channel, Assignee and Creator filters, and the status groups.
---

# Raft Chat — Tasks

Tasks is the top-level page that lists every task in the workspace. The shared task rules (statuses, board and list, details, changing status) are in [Tasks](../../patterns/tasks.md).

## Structure

From top to bottom on a phone:

1. **The frame**: the large title Tasks and, under it, the count ("12 channel tasks"). The page has no workspace pill, so it has no navigation row: the title follows the status bar directly.
2. **The filter bar**: Channel, Assignee and Creator. An active filter is `info-soft` with a count. Board / List is at the right end; on a phone it shows only icons.
3. **Status groups**: Todo, In Progress, In Review, Done, Closed, each with a collapsible heading and a count, holding [TaskCard](../../../packages/ui/src/components/task-card/task-card.md)s.

On desktop the page has no sidebar: the board follows the rail directly.

```example
tasks/compositions/tasks-panel
```

## Rules

- Don't put a create action on this page. A task always belongs to a channel, so tasks are created in a channel ([Channel](./channel.md#tasks-in-the-conversation)).
- Name the two shortcut rows in the filter lists Created by me and Assigned to me.
- Default to List on a phone, and remember the person's last choice.
- When a channel's task view is empty, say how a task gets there: "No tasks yet", "Tick As Task when you send a message, and it lands here.", and a small ink-bordered Create Task ([EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)).
- Don't add a "needs you" group or color. What waits for the person's approval is in Activity, with an action card in the conversation.
- Make the status chip the only thing on a card that changes in place. Selecting the card opens the task details (full screen on a phone, covering the tab bar).
- Make a channel's task view the same panel as this page, without the Channel filter.
