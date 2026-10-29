---
title: Tasks
summary: The five task statuses, task lists and boards, task details, tasks created from messages and listed beside a conversation, how status changes and how tasks are filtered.
---

# Tasks

A task has one of five statuses, each with a fixed color: Todo, In Progress, In Review, Done and Closed. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, or as compact rows beside a conversation, with details in a centered dialog. People and agents work from the same task, so it has to look and behave the same on every screen that shows it.

## When it applies

A product's task page and the task view of a place. In Raft Chat these are the Tasks destination and a channel's Tasks section ([Raft Chat — Tasks](../products/raft-chat/tasks.md)); which filters and which create actions a product offers is on its own page.

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
  3. The properties in an inline [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline) (`direction="inline"`): Status, Assignee, Source, Created by and Created at. The assignee reads as on a task row, avatar and name. Source is there only for a task created from a message: the sender's avatar and name, the first line of the message and its time. On a line of properties, the texts share one baseline: the labels, the status chip's and the assignee's names, Source's sender and excerpt, and the times ([Text of different sizes on one line](../foundations/alignment.md#text-of-different-sizes-on-one-line)). The marks without text, the avatars, the chevrons and the ↗ after Source, are centered on the row's line box ([A mark that leads text](../foundations/alignment.md#a-mark-that-leads-text)). No trimming of the text and no nudges. A task row follows the same rule ([Rows in a compact list](#rows-in-a-compact-list)). A task created before tasks had their own discussion also gets Earlier discussion, with the number of replies its message has.
     Every property follows the one flow of an inline DescriptionList: the facts run on like a line of text, 24px apart, and a fact moves to the next line, 8px under, only when it doesn't fit on this one. No fact gets a line, a width or a gap of its own. Every fact is the same 28px row, so the lines are evenly spaced, their centers 36px apart: the line with the status chip and the assignee's avatar is no taller than a line of plain text, and the avatar's presence light shows whole, never cut by its trigger. Each fact is at most 24rem wide (or the dialog's width, if narrower), so a long Source ends in an ellipsis and shares its line: in a desktop dialog Status, Assignee, Source and Created by stand on one line; on a phone, where each fact fills more of the line, they wrap in the same order with the same gaps. This flow, not a label/value grid, because the properties are a handful of short facts: a grid gives each its own line and pushes the discussion down.
  4. History, collapsed ([Timeline](../../packages/ui/src/components/timeline/timeline.md)).
  5. In a product with conversations, the task's discussion and its composer ("Message this task").

## Rules

- Use only the five statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot. Don't add a "needs you" group or color either: a sixth bucket would hold tasks that are also in one of the five, and what waits for a person already has its place in the conversation.
- Default to the list on a phone and to the board on desktop, because a phone has no room for five columns. Remember the person's last choice.
- Collapse Done and Closed by default, on the board and in the list: they only grow, and the work in progress is what people come for.
- Make the status chip the only thing on a card that changes in place. Selecting the rest of the card opens the task details.
- Let people change status from the status chip on the card, from the property in the details, or by dragging the card to another column of the board. A person who can't change tasks sees the chip without a menu and can't drag.
- Offer only the moves that are allowed from the current status in the chip's menu, so people never pick a move that then fails.
- Open task details as a centered dialog, never in the side panel or a side section: a task holds its own discussion, so it isn't read beside the conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)). Close it with ×, Esc or a press outside the dialog.
- Name the task's place on a card only where tasks from several places are listed. In the view of one place, the place is already the page.
- While a list loads, show skeleton cards in its place ([Feedback](./feedback.md#empty-loading-and-failed)).

### Where tasks are created

- Put the create action in the place a task belongs to, not on a page that collects tasks from several places: a task created there would have no place.
- In a place with a conversation, put a create button in the head of its Tasks section ([Tasks beside a conversation](#tasks-beside-a-conversation)), and Create Task from Message in the message menu.

### Tasks in a conversation

In a product where tasks come from conversations, a task is created from a message; the message is not the task. The task has its own title, description and discussion, and links back to the message it came from. A message can be the source of several tasks, and a task can belong to the place without any message.

- Show the tasks created from a message as a list under its content and above its replies: one row per task with the number (`#25`), the title followed by the number of messages in its discussion, then the assignee (avatar and name; the person reads "You") and the status chip together at the right. A list holds any number of tasks; the replies stay the discussion of the message itself. The rows are the compact rows of [Rows in a compact list](#rows-in-a-compact-list).
- Size the box that holds the list by its content: at least 320px wide (or the whole column, if that is narrower) and at most the width of the message column. Keep a title to one line and end it with an ellipsis when the row runs out of room: a task created before tasks had their own discussion has the whole message as its title, and its details show all of it.
- Put the number of messages right after the title, inline: right after its last word, or right after the ellipsis when the title is cut, with the same small space either way. Never leave a gap between a cut title and the number: the title gives up only the room the row lacks. It counts the discussion the title names, so it belongs to the title, not to the assignee.
- Keep the assignee and the status chip as one group at the right of each row, the assignee right next to the chip. Don't line them up in columns across rows. Where a row is too narrow for a readable title and the group, the group wraps, as a whole, to a second line, still at the right, instead of squeezing the title.
- Show the same list under the message at the top of its thread.
- Open the task details from a row. Don't change status from the row: it is a link to the task, and status changes in the details.
- Let people create tasks from a message with Create Task from Message in the message menu. It opens Create Task with the message quoted and its text as the first title, which they can change.
- Don't offer As Task in the composer: people send messages, and tasks are created from them afterwards, by a person or an agent.
- Write what happens to a task (created, claimed, assigned, moved) as event lines in the task's discussion, not in the conversation and not in the thread of the message it came from ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#claiming-work)).
- Show the task's discussion inside the task details, so the discussion and the status are read together. Follow a task as you follow a thread ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#following-a-task)).
- In the details of a task created from a message, select Source to close the dialog and jump to the message in its place, which shows the located highlight, as every jump does ([Located](../foundations/states.md#located)). Select Earlier discussion to open the replies of the message the task used to be.
- Show the number of messages in a task's discussion, in Space Mono, once it has any. Add the attention dot before it only for people who follow the task.
- A task created before tasks had their own discussion, when the message was the task, gets one only when something is first written to it. Show an empty state in its place ("No discussion in this task yet", saying the earlier discussion is in the replies of its message) with the composer ready, not the message's replies; the first message starts the task's discussion.

### Pulling the task head down

On a phone, and on the web wherever the task details are full screen, the task's head (the title, the description, the properties and History) is the conversation's first row and scrolls away with it. Scrolling back up to read the status would lose the reader's place in the discussion, so the bar pulls the head down over the conversation instead.

- Once the head has scrolled out of view, the bar collapses to one line: `Task #N`, the status chip and the assignee's avatar alone, then a small chevron. The avatar is named for screen readers; the name shows beside it only where the bar has room for it whole. Before the head has scrolled away, the bar keeps the task's reference.
- A tap on the bar pulls the head down as a panel that hangs from under the bar across its whole width, over the conversation. It is the same head as the conversation's first row, editable the same way (Status, Assignee, Show More, Source, History). No scrim, and nothing under it moves.
- Draw the panel on `layer-canvas` with `shadow-float` along its edge and no 1px divider: the shadow already parts it from the conversation, and a hairline on top of a shadow is a second edge saying the same thing ([Elevation](../foundations/elevation.md#tokens)). It is at most 70% of the screen tall; beyond that its own content scrolls.
- It slides down from the bar and back up in 220ms with `ease-slide`, the shortest slide ([Motion](../foundations/motion.md#usage)), and the chevron turns with it. With reduced motion it appears and goes at once.
- It closes on:
  - a second tap on the bar;
  - a tap outside it, including the composer and its buttons. The tap still lands where it was aimed. A menu the head opened (Status, Assignee) is inside the panel;
  - focus moving outside it, such as into the composer;
  - Back, the system back on a phone, and Esc. Back closes the panel before it leaves the page;
  - an upward swipe of at least 40px on the panel once its content is scrolled to its end. Until then the swipe scrolls the panel's content;
  - the reader starting to scroll the conversation. An arriving message does not close it;
  - the head scrolling back into view.
- The panel doesn't follow the finger: a swipe up past 40px closes it with the same slide, and a shorter one leaves it where it is. A panel that tracks the finger looks like a sheet that can be dragged to any height, which this panel can't. This holds on the web and on a phone (decided 2026-10-28).
- Focus moves into the panel when it opens and back to the bar when it closes, except after a tap outside: that tap puts focus where the reader meant. The bar is a button with `aria-expanded` that controls the panel, named by what it shows ("Task #7, In Progress, Kirby"); the panel is a region named by the task ("Task #7").
- Keep the conversation bottom-anchored, newest message on the composer, and let the head fold away only as far as the conversation fills the room it leaves. A short task keeps its head in view and shows no gap above "Beginning of conversation"; its bar never collapses, so there is nothing to pull down.
- On a tablet or a wide window the head stays pinned above the conversation, so there is no collapsed bar and no panel.

The web builds this as `TaskHeadPullDown` (slock `packages/web/src/components/task/TaskHeadPullDown.tsx`, slock #11722); the phone as `RaftPullDownPanel` (mobile #3884), with the fold limit that keeps a short task free of a gap in mobile #3899. It is not a [Popover](../../packages/ui/src/components/popover/popover.md) or a [Drawer](../../packages/ui/src/components/drawer/drawer.md): it is neither modal nor anchored to a point.

### Tasks beside a conversation

A place's tasks open as a Tasks section beside its conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)), so people see the work moving while they talk. People don't need to read every task there: the section answers what is moving and what waits for them.

- Put the title Tasks in the section's head, then the create button and ×. The header has no count: the All and For Me filter right under it already carries the numbers. On a phone the section covers the conversation under the place's header, and the header's Back closes it: the section draws no Back or × of its own, so there is one Back on screen.
- Under the header, put All / For Me ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)), each with the number of its active tasks. For Me lists the tasks assigned to the person.
- Group the tasks by status in the order In Progress, In Review, Todo, Done, Closed: in a narrow section the work that is moving comes first. Each group has a collapsible heading in gray with the status pixel and a count, and Done and Closed start collapsed. Each heading has 16px above its words and 6px below, in a 40px box (the spacing the [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md) section header had before its list took the 8px under it), and the groups have no gap of their own, so a heading sits on its own rows, noticeably farther from the group above (about 25px) than from its first row (16px) ([Spacing rhythm](../foundations/comfort.md#spacing-rhythm)). By touch its target reaches 4px up, to 44px.
- Give each task one compact row: the number, the title on one line (ending in an ellipsis when cut) with the number of messages in its discussion right after it, then the assignee (avatar and name; an agent's avatar carries its presence light, and the person reads "You") and a chevron at the right. Leave the status chip out of the row: the group already names the status. Where the section is too narrow, the assignee wraps to a second line at the right, as in the list under a message. The rows are the same compact rows as under a message and in the Files section ([Rows in a compact list](#rows-in-a-compact-list)).
- Open the task details from a row.

### Rows in a compact list

The tasks under a message, the Tasks section and the Files section are one kind of list and use one row. It is content: hairlines between the rows, the whole row the target, and no card for each row. These compact rows keep their lines for now; the other lists of rows (Activity, search, the sidebar, phone lists of ListRow cells) have none and draw their states on an inset shape ([Lists](./lists.md)). A row reads as one line: what it is on the left, who has it and where it stands on the right.

| Part | Spec |
| --- | --- |
| Row | One line, at least 36px tall with a mouse and 44px on a phone or a touch screen ([Spacing](../foundations/spacing.md#hit-targets)), 6px above and below its content. Its inline padding is the margin of the column it sits in: 20px in a side section (16px on a phone), so a row starts on the section head's line, and 12px inside the box under a message |
| Alignment | The texts on the row's line share one baseline: the task's number, the title, the number of messages, the assignee's name, the words of the status chip, a file's size and time ([Text of different sizes on one line](../foundations/alignment.md#text-of-different-sizes-on-one-line)). The marks without text, the avatar, the status pixel, the chevron and the icons (a file's type icon, the icon of the number of messages, the actions), are centered on the title's line box ([A mark that leads text](../foundations/alignment.md#a-mark-that-leads-text)). No trimming of the text and no nudges, as on a line of properties |
| Leading | Optional, on the title's line: a task's number (`#25`) in Space Mono and `foreground-hint`, or a file's 20px type icon or thumbnail |
| Title | `text-callout` in `foreground`, on one line, ending in an ellipsis when cut |
| Inline meta | Right after the title, 6px from it, or right after the ellipsis: a task's number of messages (an icon and the number in Space Mono) or a file's size in Space Mono. It belongs to the title, so the title gives up only the room the row lacks |
| Trailing group | At the right, its parts 8px apart. A task: the assignee (a 19px avatar and the name in `text-caption`), then the status chip or, in the Tasks section, a chevron. A file: the time it was shared, compact and in Space Mono (today the clock, in the person's 12-hour or 24-hour choice; earlier this year the month and day, Oct 21; an earlier year the date, 2025-10-21; the full date and time in its tooltip), then its actions (Jump to Message and Download, or a ⋮ menu below 560px), the last icon box on the row's margin with its hit area hanging outward, sideways and 4px above and below, so a file row is as tall as a task row ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). The group wraps, whole, to a second line, still at the right, only where the title would get less than 160px: at a side column's default 360px, a task row and a file row each stay on one line |
| Dividers | `line-hairline` between rows, running as far as the list's container visibly goes ([Separators](../foundations/comfort.md#separators)). Under a message the box holds only the rows, so its lines run edge to edge and meet its border. In a side section, floating or beside the messages, and on a phone, the list is one part of a section that also holds a head, a filter and group headings, or of a page with no edge at all, so its lines are inset by the row's inline padding on both sides: they start where the row's content starts and end where it ends, 20px in from each edge (16px on a phone). The hover still fills the whole row. None above the first row of a list or of a status group |
| Container | Under a message the rows sit in a box sized by its content (see [Tasks in a conversation](#tasks-in-a-conversation)): `line-hairline` border, `radius-container` (it is a container, [Shape](../foundations/shape.md)), `layer-card`. In a side section the rows run edge to edge with no gap between them, and the section's head, filter and group headings share their 20px margin (16px on a phone) |
| Group headings | A status heading in the Tasks section folds its group. It is a label over its rows, not a row, so it takes the states of a collapsible group heading: hover and press turn its words and chevron from `foreground-hint` to `foreground`, with no fill and no underline, and keyboard focus shows the inset ring ([Collapsible group headings](../foundations/states.md#collapsible-group-headings)). A fill would read as one more row, and would frame the words unevenly, since the heading keeps its words at the bottom of its box, on the rows they name |
| States | Hover lays the subtle overlay (`overlay-subtle`) over the whole row, press the medium one (`overlay-medium`), keyboard focus an inset ring ([Hover and press](../foundations/states.md#hover-and-press)). A file's actions stay their own buttons on top of the row; Jump to Message lands on the message with the located highlight ([Located](../foundations/states.md#located)) |

- Don't give the rows of these lists a card each or a gap between them. A card per row turns a narrow side column into a stack of controls, and the three lists stop reading as one.
- Don't put a second line of details (size, time, role) under the title: details go in the inline meta or the trailing group. A row has a second line only when its trailing group wraps.
- Don't line up the trailing groups in columns across rows.

### Referring to a task

A task number is unique only in its place, so a reference names the place first: `#design:#25`, and `dm:@ada:#25` in a direct conversation. It reads as "#25 of #design" and opens the task from anywhere.

- Write a task reference as the place, `:`, then the number with its `#`. Agents write and read the same reference.
- Render a reference as a link that opens the task details, in any place, for people who can see that place. For anyone else it stays plain text.
- Render the link as the task chip in the task's status colors (its status pixel and soft tint), the same chip the task list under a message uses, so a reference reads "which task, and where it stands". Do not split the reference into differently colored parts: it is one name, and the status already has the pixel and the tint. When the product has not loaded the task (another place's task), it reads the task by place and number; until then the reference is an outlined chip, a `line-hairline` border around `foreground-muted` words, with no tint and no pixel. Never show it as a gray chip, which reads as Closed.
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
