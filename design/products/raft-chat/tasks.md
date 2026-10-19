---
title: Raft Chat — Tasks
summary: The Tasks destination — its title and count, the Channel, Creator and Assignee filters, what it leaves out, a channel's Tasks tab and their empty states.
---

# Raft Chat — Tasks

Tasks is the top-level page that lists every channel task in the server. A channel's Tasks tab is the same panel for one channel. Statuses, the board and the list, task details, changing status and how filters behave follow [Tasks](../../patterns/tasks.md); this page holds only Raft Chat's choices.

## Structure

From top to bottom:

1. **The header** (`PanelSectionHeader`, on the frame on a phone): the title Tasks and, under it, the count in Space Mono: "12 channel tasks", or "3 of 12 channel tasks" while a filter is on.
2. **The filter bar**: Channel, Creator and Assignee, then Clear All while a filter is on, and Board / List at the right end.
3. **The tasks**: the board or the list, whose cards name their channel.

```example
tasks/compositions/tasks-panel
```

## Rules

- Offer three filters: Channel, Creator and Assignee. Creator and Assignee share one list of the server's people and agents.
- Don't put a create action on this page. A task always belongs to a channel, so it is created there ([Channel](./channel.md#tasks-in-the-conversation)).
- Leave tasks of direct messages and agents out of this page, and say so when it is empty.
- Load only the active statuses first: Done and Closed load when their group is opened. Page any group that has more tasks with Load more. A channel's Tasks tab loads all its tasks at once.

### A channel's Tasks tab

- Make it the same panel as this page, without its header and without the Channel filter.
- Put an ink-bordered, small Create Task button (with `plus`) in its filter bar. It opens Create Task, a small dialog with one row per task and Add Another.

### Empty states

| Situation | Title | Sentence |
| --- | --- | --- |
| A channel with no tasks | No tasks yet | Create one with the Create Task button. |
| The Tasks page with no tasks | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| A filter that hides everything | No tasks match this filter | Try a different combination or clear the current selection. |

- Use the `square-check-big` icon, and no button: the Create Task button is already in the filter bar ([EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)).
