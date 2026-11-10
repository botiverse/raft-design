---
title: Raft Chat — Tasks
summary: The Tasks destination — Mine and All, its head and count, the Channel, Status, Creator and Assignee filters, the sort, New task, the selected tasks' actions, what it leaves out — and a channel's Tasks section, and their empty states.
---

# Raft Chat — Tasks

Tasks is the top-level page that lists the channel tasks of the server: the person's own in Mine, every one they can see in All. A channel's own tasks are in its Tasks section, beside its conversation. Statuses, the page's list and board, selecting, the task opened beside the list, the section beside a conversation, task details, completing, adding and editing tasks, changing status and how filters behave follow [Tasks](../../patterns/tasks.md); this page holds only Raft Chat's choices. The page is the one stdrc approved on 2026-11-10 (#wg-task-v2:8a7ae237; [decision 0045](../../decisions/0045-the-tasks-page.md)), on a server with task conversations on; with them off, the server keeps the earlier Tasks page.

## Structure

The page fills the main area right of the rail; Tasks has no sidebar. From top to bottom:

1. **The head** (`PanelSectionHeader`; on a phone, the tab's top bar): the title Tasks with the count beside it in Space Mono, "12", or "3 / 12" while a filter or the search narrows the list, then the search field, "Search tasks", at the end. On a phone the search field is under the toolbar.
2. **The toolbar**: Mine / All, each with its count; Channel, Status, Creator and Assignee, then Clear all while a filter is applied; at the end the sort, List / Board and New task.
3. **The tasks**: in the list, Mine's two sections, Assigned to you and Started by you, or All's one list; or the board. Each row and card names its channel.
4. **The selected tasks' toolbar**, floating at the bottom while tasks are selected.

A task opens in a column right of the list, or on a phone as a pushed page ([The open task](../../patterns/tasks.md#the-open-task)).

```example
tasks/compositions/tasks-panel
```

Not yet implemented in raft-ui: this example shows the tasks page before [0045](../../decisions/0045-the-tasks-page.md), a board by status with no tabs, sort or selection.

## Rules

- Name the tabs Mine and All, and Mine's sections Assigned to you and Started by you. Started by you holds the tasks the person created and the tasks created from their message ("created from my message", stdrc, 2026-11-09), that someone else or nobody has.
- Offer four filters: Channel, Status, Creator and Assignee. Creator and Assignee share one list of the server's people and agents, with "Created by me" in Creator and "Assigned to me" and "Unassigned" in Assignee first ([Filters](../../patterns/tasks.md#filters)). Status lists the five statuses with their pixels and has no search.
- Offer three sorts: Recently updated (the default), Least recently updated and Recently created.
- Put New task, a primary button with `plus`, last in the toolbar. It opens Create task with a Channel field, filled in when the Channel filter has exactly one channel ([Where tasks are created](../../patterns/tasks.md#where-tasks-are-created)). The field lists the channels the person has joined and can post in, archived ones left out. The new task opens beside the list.
- Give the selected tasks' toolbar Status, Assignee, Nudge, Follow and Delete, Follow and Delete `secondary` ([Selecting tasks](../../patterns/tasks.md#selecting-tasks)). Assignee's menu starts with Me, then No assignee, then the people and agents. Nudge comes with the server's one count of each assignee's open work, which agents' idle reminders share; until then the toolbar has the other four.
- Leave tasks of direct messages and agents out of this page, and say so when it is empty.
- Read every section and every board column 20 tasks at a time, and the next 20 as it scrolls; a collapsed column reads nothing until it opens. A channel's Tasks section loads all its tasks at once.

### A channel's Tasks section

The section follows [Tasks beside a conversation](../../patterns/tasks.md#tasks-beside-a-conversation). In Raft Chat:

- Count the active tasks (Todo, In progress) on All, and the active tasks assigned to the person on For me. The header carries no count of its own.
- Put a ghost Create task icon button (`plus`) before ×. It opens Create task ([Where tasks are created](../../patterns/tasks.md#where-tasks-are-created)), with the channel under its title in Space Mono: "In #launch-week".
- Within a status group, list the newest task first: the section is read while people talk, so a task just created from the conversation shows at the top of its group, where they look for it.
- Keep the section apart from the Tasks page where they differ: its tabs are All / For me, counted by active tasks, not Mine / All; its rows are grouped by status, Backlog, Done and Closed collapsed; each row starts with the completion control, not a selection box; a task opens in the centered dialog, not beside the list, because the section already stands beside the channel's conversation; it has the quick add; and it has no sort, no board and no selection. It answers what is moving in one channel while people talk there, and the page answers what is the person's across the server ([Tasks](../../patterns/tasks.md)).

### Empty states

| Situation | Title | Sentence |
| --- | --- | --- |
| A channel with no tasks | No tasks yet | Tasks that people and agents create in this channel show up here. |
| For me, with nothing assigned to the person | Nothing is waiting on you | Tasks assigned to you in this channel show up here. |
| All on the Tasks page, with no tasks | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| A filter that hides everything | No tasks match this filter | Try a different combination or clear the current selection. |
| A section of Mine with no task | No tasks, one line under its heading, which already names the section (Noel, 2026-11-10, #wg-task-v2:8a7ae237) | None |

- Use the `square-check-big` icon, and no button: Create task and Clear all are already in the page's toolbar or the section's head ([EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)).
