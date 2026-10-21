---
title: Tasks
summary: The five task statuses, task lists and boards, task details, tasks created from messages and listed beside a conversation, how status changes and how tasks are filtered.
---

# Tasks

A task has one of five statuses, each with a fixed color: Todo, In Progress, In Review, Done and Closed. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, or as compact rows beside a conversation, with details in a centered dialog. People and agents work from the same task, so it has to look and behave the same on every screen that shows it.

## When it applies

A product's task page and the task view of a place. In Raft Chat these are the Tasks destination and a channel's Tasks card ([Raft Chat — Tasks](../products/raft-chat/tasks.md)); which filters and which create actions a product offers is on its own page.

## Structure

```example
tasks/compositions/tasks-panel
```

- **Task list or board**: a filter bar on top, with Board / List at its right end ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)). On a phone, Board / List shows only its icons.
  - A board has one column per status, each 232px wide ([TaskBoard](../../packages/ui/src/components/task-board/task-board.md)).
  - A list groups tasks by status ([TaskList](../../packages/ui/src/components/task-list/task-list.md)).
  - Both use the same card ([TaskCard](../../packages/ui/src/components/task-card/task-card.md)), and both show the five statuses in the order above, each with a collapsible heading and a count.
- **Task details**: a centered dialog, 960px wide (or the window less 32px) and at most 900px high (86% of the window), full screen on a phone. From top to bottom:
  1. A bar with the task's reference (`#design:#25`: the place, then the number; see [Referring to a task](#referring-to-a-task)), in a product with conversations the agents that follow the task and the More menu (Follow Task or Unfollow Task), as in a thread's header ([Threads](./conversation.md#threads)), and ×. On a phone the bar has Back instead of ×. The bar has no button to open the task in a window of its own, as a thread has none: a task window opens from its URL, the same way a thread window does.
  2. The title and the description, which folds after 3 lines.
  3. The properties in an inline [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline) (`direction="inline"`): Status, Assignee, Source, Created by and Created at. The assignee reads as on a task row, avatar and name, with the name on the same baseline as the other values. Source is there only for a task created from a message: the sender's avatar and name, the first line of the message and its time. Every label and value of the row stands on one baseline: a value's text sits on its label's baseline, and an avatar or an icon in a value (the assignee's, the sender's, the ↗ after Source) centers on that text's line and never sets the baseline itself ([Alignment](../foundations/alignment.md#a-shape-beside-plain-text)). A task created before tasks had their own discussion also gets Earlier discussion, with the number of replies its message has.
  4. History, collapsed ([Timeline](../../packages/ui/src/components/timeline/timeline.md)).
  5. In a product with conversations, the task's discussion and its composer ("Message this task").

## Rules

- Use only the five statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot. Don't add a "needs you" group or color either: a sixth bucket would hold tasks that are also in one of the five, and what waits for a person already has its place in the conversation.
- Default to the list on a phone and to the board on desktop, because a phone has no room for five columns. Remember the person's last choice.
- Collapse Done and Closed by default, on the board and in the list: they only grow, and the work in progress is what people come for.
- Make the status chip the only thing on a card that changes in place. Selecting the rest of the card opens the task details.
- Let people change status from the status chip on the card, from the property in the details, or by dragging the card to another column of the board. A person who can't change tasks sees the chip without a menu and can't drag.
- Offer only the moves that are allowed from the current status in the chip's menu, so people never pick a move that then fails.
- Open task details as a centered dialog, never in the side panel or a side card: a task holds its own discussion, so it isn't read beside the conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)). Close it with ×, Esc or a press outside the dialog.
- Name the task's place on a card only where tasks from several places are listed. In the view of one place, the place is already the page.
- While a list loads, show skeleton cards in its place ([Feedback](./feedback.md#empty-loading-and-failed)).

### Where tasks are created

- Put the create action in the place a task belongs to, not on a page that collects tasks from several places: a task created there would have no place.
- In a place with a conversation, put a create button in the header of its Tasks card ([Tasks beside a conversation](#tasks-beside-a-conversation)), and Create Task from Message in the message menu.

### Tasks in a conversation

In a product where tasks come from conversations, a task is created from a message; the message is not the task. The task has its own title, description and discussion, and links back to the message it came from. A message can be the source of several tasks, and a task can belong to the place without any message.

- Show the tasks created from a message as a list under its content and above its replies: one row per task with the number (`#25`), the title followed by the number of messages in its discussion, then the assignee (avatar and name; the person reads "You") and the status chip together at the right. A list holds any number of tasks; the replies stay the discussion of the message itself. The rows are the compact rows of [Rows in a compact list](#rows-in-a-compact-list).
- Size the list by its content, at least 320px (or the whole column, if that is narrower) and at most the width of the message column. Keep a title to one line and end it with an ellipsis when the row runs out of room: a task created before tasks had their own discussion has the whole message as its title, and its details show all of it.
- Put the number of messages right after the title, inline: right after its last word, or right after the ellipsis when the title is cut, with the same small space either way. Never leave a gap between a cut title and the number: the title gives up only the room the row lacks. It counts the discussion the title names, so it belongs to the title, not to the assignee.
- Keep the assignee and the status chip as one group at the right of each row, the assignee right next to the chip. Don't line them up in columns across rows. Where a row is too narrow for a readable title and the group, the group wraps, as a whole, to a second line, still at the right, instead of squeezing the title.
- Show the same list under the message at the top of its thread.
- Open the task details from a row. Don't change status from the row: it is a link to the task, and status changes in the details.
- Let people create tasks from a message with Create Task from Message in the message menu. It opens Create Task with the message quoted and its text as the first title, which they can change.
- Don't offer As Task in the composer: people send messages, and tasks are created from them afterwards, by a person or an agent.
- Write what happens to a task (created, claimed, assigned, moved) as event lines in the task's discussion, not in the conversation and not in the thread of the message it came from ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#claiming-work)).
- Show the task's discussion inside the task details, so the discussion and the status are read together. Follow a task as you follow a thread ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#following-a-task)).
- In the details of a task created from a message, select Source to close the dialog and go to the message in its place. Select Earlier discussion to open the replies of the message the task used to be.
- Show the number of messages in a task's discussion, in Space Mono, once it has any. Add the attention dot before it only for people who follow the task.
- A task created before tasks had their own discussion, when the message was the task, gets one only when something is first written to it. Show an empty state in its place ("No discussion in this task yet", saying the earlier discussion is in the replies of its message) with the composer ready, not the message's replies; the first message starts the task's discussion.

### Tasks beside a conversation

A place's tasks open as a Tasks card beside its conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)), so people see the work moving while they talk. People don't need to read every task there: the card answers what is moving and what waits for them.

- Put the title Tasks in the card's header, then the count in Space Mono ("5 active · 1 for you"), then the create button and ×. On a phone the card covers the conversation under the place's header, and the header's Back closes it: the card draws no Back or × of its own, so there is one Back on screen.
- Under the header, put All / For Me ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)), each with the number of its active tasks. For Me lists the tasks assigned to the person.
- Group the tasks by status in the order In Progress, In Review, Todo, Done, Closed: in a narrow card the work that is moving comes first. Each group has a collapsible heading in gray with the status pixel and a count, and Done and Closed start collapsed.
- Give each task one compact row: the number, the title on one line (ending in an ellipsis when cut) with the number of messages in its discussion right after it, then the assignee (avatar and name; an agent's avatar carries its presence light, and the person reads "You") and a chevron at the right. Leave the status chip out of the row: the group already names the status. Where the card is too narrow, the assignee wraps to a second line at the right, as in the list under a message. The rows are the same compact rows as under a message and in the Files card ([Rows in a compact list](#rows-in-a-compact-list)).
- Open the task details from a row.

### Rows in a compact list

The tasks under a message, the Tasks card and the Files card are one kind of list and use one row. Like a [ListRow](../../packages/ui/src/components/list-row/list-row.md) list it is content: hairlines between the rows, the whole row the target, and no card for each row. A row reads as one line: what it is on the left, who has it and where it stands on the right.

| Part | Spec |
| --- | --- |
| Row | One line, at least 36px tall with a mouse and 44px on a phone or a touch screen ([Spacing](../foundations/spacing.md#hit-targets)), 6px above and below its content. Its inline padding is the margin of the column it sits in: 16px in a side card, so a row starts on the card header's line, and 12px inside the box under a message |
| Leading | Optional, on the title's line: a task's number (`#25`) in Space Mono and `foreground-hint`, or a file's 20px type icon or thumbnail |
| Title | `text-callout` in `foreground`, on one line, ending in an ellipsis when cut |
| Inline meta | Right after the title, 6px from it, or right after the ellipsis: a task's number of messages (an icon and the number in Space Mono) or a file's size in Space Mono. It belongs to the title, so the title gives up only the room the row lacks |
| Trailing group | At the right, its parts 8px apart. A task: the assignee (a 19px avatar and the name in `text-caption`), then the status chip or, in the Tasks card, a chevron. A file: the time it was shared, compact and in Space Mono (today the clock, in the person's 12-hour or 24-hour choice; earlier this year the month and day, Oct 21; an earlier year the date, 2025-10-21; the full date and time in its tooltip), then its actions (Jump to Message and Download, or a ⋮ menu below 560px), the last icon box on the row's margin with its hit area hanging outward, sideways and 4px above and below, so a file row is as tall as a task row ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). The group wraps, whole, to a second line, still at the right, only where the title would get less than 160px: at a card's usual 320px or more, a task row and a file row each stay on one line |
| Dividers | `line-hairline` between rows, from edge to edge of the list. None above the first row of a list or of a status group |
| Container | Under a message the rows sit in a box sized by its content (see [Tasks in a conversation](#tasks-in-a-conversation)): `line-hairline` border, `radius-control`, `layer-card`. In a side card the card is the box: rows run edge to edge with no gap between them |
| States | Hover lays `fill-row-hover` over the whole row, press the pressed overlay, keyboard focus an inset ring ([Row hover](../foundations/states.md#row-hover)). A file's actions stay their own buttons on top of the row |

- Don't give the rows of these lists a card each or a gap between them. A card per row turns a narrow side card into a stack of controls, and the three lists stop reading as one.
- Don't put a second line of details (size, time, role) under the title: details go in the inline meta or the trailing group. A row has a second line only when its trailing group wraps.
- Don't line up the trailing groups in columns across rows.

### Referring to a task

A task number is unique only in its place, so a reference names the place first: `#design:#25`, and `dm:@ada:#25` in a direct conversation. It reads as "#25 of #design" and opens the task from anywhere.

- Write a task reference as the place, `:`, then the number with its `#`. Agents write and read the same reference.
- Render a reference as a link that opens the task details, in any place, for people who can see that place. For anyone else it stays plain text.
- `#25` on its own still refers to task 25 of the place being read.

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
