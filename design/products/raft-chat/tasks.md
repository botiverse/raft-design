---
title: Raft Chat — Tasks
summary: The Tasks destination — its title and count, the Channel, Creator and Assignee filters, the board and the list, and a channel's Tasks tab.
---

# Raft Chat — Tasks

Tasks is the top-level page that lists every channel task in the workspace. A channel's Tasks tab is the same panel for one channel. The shared task rules (statuses, board and list, details, changing status) are in [Tasks](../../patterns/tasks.md).

## Structure

From top to bottom:

1. **The header** (`PanelSectionHeader`, on the frame on a phone): the title Tasks and, under it, the count in Space Mono: "12 channel tasks", or "3 of 12 channel tasks" while a filter is on.
2. **The filter bar**: Channel, Creator and Assignee, then Clear All while a filter is on. Board / List is at the right end; on a phone it shows only icons.
3. **The tasks**: the board on desktop and the list on a phone, with the five statuses in order (Todo, In Progress, In Review, Done, Closed), each with a collapsible heading and a count, holding [TaskCard](../../../packages/ui/src/components/task-card/task-card.md)s. On the Tasks page each card names its channel.

On desktop the page has no sidebar: the board follows the rail directly.

```example
tasks/compositions/tasks-panel
```

## Rules

- Don't put a create action on this page. A task always belongs to a channel, so tasks are created in a channel ([Channel](./channel.md#tasks-in-the-conversation)).
- Leave tasks of direct messages and agents out of this page, and say so when it is empty.
- Give the Channel filter a search box, and the Creator and Assignee filters the same list of people and agents. Name the shortcut rows Created by me and Assigned to me; the Assignee list also has Unassigned.
- Keep the filters in the address, so a filtered view can be shared and reloaded.
- Default to List on a phone and Board on desktop, and remember the person's last choice.
- Load Done and Closed only when their group is opened, and page them with Load more.
- Make the status chip the only thing on a card that changes in place. Selecting the card opens the task details (full screen on a phone, covering the tab bar).
- Don't add a "needs you" group or color. What waits for the person's approval is an action card in the conversation.

### A channel's Tasks tab

- Make it the same panel as this page, without its header and without the Channel filter. Cards don't name the channel.
- Put an ink-bordered, small Create Task button (with `plus`) in its filter bar. It opens Create Task, a small dialog with one row per task and Add Another.

### Empty states

| Situation | Title | Sentence |
| --- | --- | --- |
| A channel with no tasks | No tasks yet | Create one with the Create Task button. |
| The Tasks page with no tasks | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| A filter that hides everything | No tasks match this filter | Try a different combination or clear the current selection. |

- Use the `square-check-big` icon, and no button: the Create Task button is already in the filter bar ([EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)).

## Differences from the shared patterns

- On a phone the page name sits in the 56px navigation row, not in a large title ([0004](../../decisions/0004-title-on-every-top-level-page.md)).
