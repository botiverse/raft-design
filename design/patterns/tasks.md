---
title: Tasks
summary: The six task statuses, task lists and boards, task details, completing, adding and editing tasks, tasks created from messages and listed beside a conversation, how status changes and how tasks are filtered.
---

# Tasks

A task has one of six statuses: Backlog, Todo, In Progress, In Review, Done and Closed. Five of them have a fixed color; Backlog has none. Tasks work as a to-do list: every task starts with a round completion control that marks it Done in one click, a task can be added by typing its title, and any status can be set from any other. On top of that, a task keeps what Raft adds to a to-do: an assignee who can be a person or an agent, a review step, and its own discussion. Tasks are shown the same way wherever they appear: as a board or a list under one filter bar, or as compact rows beside a conversation, with details in a centered dialog. People and agents work from the same task, so it has to look and behave the same on every screen that shows it.

## When it applies

A product's task page and the task view of a place. In Raft Chat these are the Tasks destination and a channel's Tasks section ([Raft Chat — Tasks](../products/raft-chat/tasks.md)); which filters and which create actions a product offers is on its own page.

## Structure

```example
tasks/compositions/tasks-panel
```

- **Task list or board**: a filter bar on top, with Board / List at its right end ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)). On a phone, Board / List shows only its icons.
  - A board has one column per status, each 232px wide ([TaskBoard](../../packages/ui/src/components/task-board/task-board.md)).
  - A list groups tasks by status ([TaskList](../../packages/ui/src/components/task-list/task-list.md)).
  - Both use the same card ([TaskCard](../../packages/ui/src/components/task-card/task-card.md)), which starts with the completion control ([Completing a task](#completing-a-task)), and both show the six statuses in the order Backlog, Todo, In Progress, In Review, Done, Closed, the way work flows from left to right, each with a collapsible heading and a count.
- **Task details**: a centered dialog, 960px wide (or the window less 32px) and at most 900px high (86% of the window), full screen on a phone. From top to bottom:
  1. A bar with the task's reference (`#design:#25`: the place, then the number; see [Referring to a task](#referring-to-a-task)), in a product with conversations the agents that follow the task and the More menu (Follow Task or Unfollow Task, then a separator and Delete Task), as in a thread's header ([Threads](./conversation.md#threads)), and ×. On a phone the bar has Back instead of ×. The bar has no button to open the task in a window of its own, as a thread has none: a task window opens from its URL, the same way a thread window does.
  2. The title and the description, which folds after 3 lines. Both are edited in place ([Editing a task](#editing-a-task)).
  3. The properties in an inline [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline) (`direction="inline"`): Status, Assignee, Source, Created by and Created at. The assignee reads as on a task row, avatar and name. Source is there only for a task created from a message: the sender's avatar and name, the first line of the message and its time. On a line of properties, the texts share one baseline: the labels, the status chip's and the assignee's names, Source's sender and excerpt, and the times ([Text of different sizes on one line](../foundations/alignment.md#text-of-different-sizes-on-one-line)). The marks without text, the avatars, the chevrons and the ↗ after Source, are centered on the row's line box ([A mark that leads text](../foundations/alignment.md#a-mark-that-leads-text)). No trimming of the text and no nudges. A task row follows the same rule ([Rows in a compact list](#rows-in-a-compact-list)). A task created before tasks had their own discussion also gets Earlier discussion, with the number of replies its message has.
     Every property follows the one flow of an inline DescriptionList: the facts run on like a line of text, 24px apart, and a fact moves to the next line, 8px under, only when it doesn't fit on this one. No fact gets a line, a width or a gap of its own. Every fact is the same 28px row, so the lines are evenly spaced, their centers 36px apart: the line with the status chip and the assignee's avatar is no taller than a line of plain text, and the avatar's presence light shows whole, never cut by its trigger. Each fact is at most 24rem wide (or the dialog's width, if narrower), so a long Source ends in an ellipsis and shares its line: in a desktop dialog Status, Assignee, Source and Created by stand on one line; on a phone, where each fact fills more of the line, they wrap in the same order with the same gaps. This flow, not a label/value grid, because the properties are a handful of short facts: a grid gives each its own line and pushes the discussion down.
  4. History, collapsed ([Timeline](../../packages/ui/src/components/timeline/timeline.md)).
  5. In a product with conversations, the task's discussion and its composer ("Message this task").

## Rules

- Use only the six statuses. "Needs you" is not a status: it is an action (the button of an action card) and an attention dot. Don't add a "needs you" group or color either: a seventh bucket would hold tasks that are also in one of the six, and what waits for a person already has its place in the conversation.
- Put work that someone created or parked and doesn't plan to do now in Backlog ("not now"), and work that won't be done in Closed. Backlog keeps a task that may come back without counting it as active work; Closed ends it.
- Draw Backlog without a hue: its status pixel is hollow, the same 10px square and 1.5px edge as the other pixels with nothing inside, and its chip is outlined, a `line-hairline` border with no tint ([Color](../foundations/color.md#statuses)). Every hue already has a meaning, and gray is Closed's.
- Default to the list on a phone and to the board on desktop, because a phone has no room for six columns. Remember the person's last choice.
- Collapse Backlog, Done and Closed by default, on the board and in the list: Backlog is work not planned now, Done and Closed only grow, and the work in progress is what people come for.
- Start every task card and every task row with the completion control ([Completing a task](#completing-a-task)). The completion control and the status chip are the only things on a card that change in place; selecting the rest of the card opens the task details.
- Let people change status from the status chip on the card, from the Status property in the details, by dragging the card to another column of the board, or with the completion control. A person who can't change tasks sees the chip without a menu and the completion control without an action, and can't drag.
- Offer every status from every status, to people and agents alike: the chip's menu and the Status property list all six with a check on the current one, and a card can be dropped in any column of the board. There are no transition limits: a status says where the work is, and whoever knows that sets it in one step, while the event line and History keep who moved it and when.
- Ask for a short reason when a task is moved into Backlog, from any status and by any route (the menu, a drag): what would bring it back. Record the reason in the task's History and in the event line the move writes in its discussion ("Martin moved #25 to Backlog: waits for the server-side record"). Creating a task directly in Backlog needs no reason.
- In a list of tasks (the rows beside a conversation and under a message, the cards of a [TaskList](../../packages/ui/src/components/task-list/task-list.md)), let ↑ and ↓ move focus to the previous and next task, Enter open the focused task, and Space complete it or reopen it. Show the focus ring on the focused row or card ([Focus](../foundations/states.md#focus)). When Space sends the task into the collapsed Done group, move focus to the next task, so the keyboard stays in the list. On the board, Space still picks a card up to move it ([TaskBoard](../../packages/ui/src/components/task-board/task-board.md#accessibility)), and the completion control is reached with Tab.
- Open task details as a centered dialog, never in the side panel or a side section: a task holds its own discussion, so it isn't read beside the conversation ([Page structure](./page-structure.md#sidebar-and-side-panel)). Close it with ×, Esc or a press outside the dialog.
- Name the task's place on a card only where tasks from several places are listed. In the view of one place, the place is already the page.
- While a list loads, show skeleton cards in its place ([Feedback](./feedback.md#empty-loading-and-failed)).

### Completing a task

The completion control is how a to-do list is worked through: one click and the task is done. It leads every task row and card, beside a conversation, under a message, on the board and in the list.

- Draw it as a round `CheckboxIndicator` (`shape="circle"`) inside a button that acts as a checkbox: `role="checkbox"`, `aria-checked` true on a done task. Round, not the square of a [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md), because a square box at the start of a row reads as "select this row", and this control does the work instead of selecting it. Unchecked, it previews the check on hover (`previewOnHover`).
- Name it by what a click does: "Complete #25", "Accept and complete #25" on an In Review task, "Reopen #25" on a done task.
- Let one click mark the task Done from any status. On an In Review task it accepts the work ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#handing-off)).
- Show the result in place, then move the task: the title is struck through in `foreground-hint`, a Toast says "Completed #25" with Undo ([Toast](../../packages/ui/src/components/toast/toast.md)), and the task stays in its group, struck through, for 650ms before it moves into the collapsed Done group. Undo puts it back in the status it came from. A task that jumps away at the click reads as lost; the pause and the Toast say where it went.
- Let a click on a done task's control reopen it to Todo.
- Make the control its own button on top of the row or card, with a hit area 8px past its 20px circle on every side. Selecting the rest of the row or card still opens the task.

### Where tasks are created

- Put the create action in the place a task belongs to, not on a page that collects tasks from several places: a task created there would have no place. A product's page of tasks from several places has no create button and no quick add.
- In a place with a conversation, put a create button in the head of its Tasks section ([Tasks beside a conversation](#tasks-beside-a-conversation)), the quick add under its All / For Me, and Create Task from Message in the message menu.
- Make the quick add an input row with the placeholder "Add a task". Enter creates a Todo task with that title; in For Me it is assigned to the person, in All it is unassigned. Focus stays in the input, empty, for the next task, and Esc clears it. It creates a task in one keystroke, as a to-do list does; anything more (a description, another status, an assignee) is in Create Task or in the task's details afterwards.
- Make Create Task a small form dialog ([Forms](./forms.md#forms-in-a-dialog)), from top to bottom:
  1. The titles: one input per task, and Add Another to create several at once. With more than one title the dialog is Create Tasks and its button says how many ("Create 3 Tasks").
  2. Description, optional, only while there is exactly one title: a description belongs to one task.
  3. Status and Assignee, side by side. Status offers Backlog, Todo and In Progress, Todo by default, each with its pixel. Assignee lists Unassigned, then the people and the agents who can take the task, Unassigned by default. In Review, Done and Closed can't be chosen: a task gets there through its work, not at its creation. The status and the assignee apply to every title.
  4. With more than one title, a line under them: "Status and assignee apply to all 3 tasks."
- Require an assignee for In Progress: work in progress has someone on it. While In Progress has no assignee, show the error inline under Assignee ("In Progress needs someone on it. Pick an assignee.") and disable the create button ([Validation](./forms.md#validation)).

### Editing a task

- Edit the title and the description in place in the task details: select the text, or its Edit button (a ghost `pencil` icon button that shows on hover and on focus), to turn it into a field. Enter or leaving the field saves; Esc cancels and restores the text. In the description Shift+Enter starts a new line. A task without a description shows "Add a description" in its place.
- Write a saved change as an event line in the task's discussion ("Martin changed the title", "Martin changed the description"). A change of wording notifies nobody else: followers see the line when they next read the task.
- Put Delete Task last in the details' More menu, after a separator. It asks first in an [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md) that names the task and says its discussion goes with it and that this can't be undone, with a danger Delete Task button.

### Tasks in a conversation

In a product where tasks come from conversations, a task is created from a message; the message is not the task. The task has its own title, description and discussion, and links back to the message it came from. A message can be the source of several tasks, and a task can belong to the place without any message.

- Show the tasks created from a message as a list under its content and above its replies: one row per task with the completion control, the number (`#25`), the title followed by the number of messages in its discussion, then the assignee (avatar and name; the person reads "You") and the status chip together at the right. A list holds any number of tasks; the replies stay the discussion of the message itself. The rows are the compact rows of [Rows in a compact list](#rows-in-a-compact-list).
- Size the box that holds the list by its content: at least 320px wide (or the whole column, if that is narrower) and at most the width of the message column. Keep a title to one line and end it with an ellipsis when the row runs out of room: a task created before tasks had their own discussion has the whole message as its title, and its details show all of it.
- Put the number of messages right after the title, inline: right after its last word, or right after the ellipsis when the title is cut, with the same small space either way. Never leave a gap between a cut title and the number: the title gives up only the room the row lacks. It counts the discussion the title names, so it belongs to the title, not to the assignee.
- Keep the assignee and the status chip as one group at the right of each row, the assignee right next to the chip. Don't line them up in columns across rows. Where a row is too narrow for a readable title and the group, the group wraps, as a whole, to a second line, still at the right, instead of squeezing the title.
- Show the same list under the message at the top of its thread.
- Open the task details from a row. The completion control is the one thing on the row that changes the task: selecting the rest of the row opens the task, and every other change of status is made in the details.
- Let people create tasks from a message with Create Task from Message in the message menu. It opens Create Task with the message quoted and its text as the first title, which they can change.
- Don't offer As Task in the composer: people send messages, and tasks are created from them afterwards, by a person or an agent.
- Write what happens to a task as event lines in the task's discussion: created, claimed, assigned, moved, completed ("Martin completed #25"), accepted (completed from In Review), reopened, moved to Backlog with its reason, and its title or description changed. Not in the conversation and not in the thread of the message it came from ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#claiming-work)).
- Show the task's discussion inside the task details, so the discussion and the status are read together. Follow a task as you follow a thread ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#following-a-task)).
- In the details of a task created from a message, select Source to close the dialog and jump to the message in its place, which shows the located highlight, as every jump does ([Located](../foundations/states.md#located)). Select Earlier discussion to open the replies of the message the task used to be.
- Show the number of messages in a task's discussion, in Space Mono, once it has any. Add the attention dot before it only for people who follow the task.
- A task created before tasks had their own discussion, when the message was the task, gets one only when something is first written to it. Show an empty state in its place ("No discussion in this task yet", saying the earlier discussion is in the replies of its message) with the composer ready, not the message's replies; the first message starts the task's discussion.

### Pulling the task head down

On a phone, and on the web wherever the task details are full screen, the task's head (the title, the description, the properties and History) is the conversation's first row and scrolls away with it. Scrolling back up to read the status would lose the reader's place in the discussion, so the bar pulls the head down over the conversation instead.

- Once the head has scrolled out of view, the bar collapses: under the reference line, `Task #N`, the status chip and the assignee's avatar alone, then a small chevron. The avatar is named for screen readers; the name shows beside it only where the bar has room for it whole. The reference line (`#design:#25`) stays in both states. Until the head has scrolled away, the line under it is `Task #N` alone, with no status chip, avatar, or chevron.
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
- Under the header, put All / For Me ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)), each with the number of its active tasks: Todo, In Progress and In Review. Backlog, Done and Closed are not counted, since none of them is work going on now. For Me lists the tasks assigned to the person.
- Right under All / For Me, put the quick add, an input row with the placeholder "Add a task", on the section's 20px margin ([Where tasks are created](#where-tasks-are-created)). The head's create button still opens Create Task, for a description, another status or several tasks at once.
- Group the tasks by status in the order In Progress, In Review, Todo, Backlog, Done, Closed: in a narrow section the work that is moving comes first, then what waits, then what is over. Each group has a collapsible heading in gray with the status pixel and a count, and Backlog, Done and Closed start collapsed. Each heading has 16px above its words and 6px below, in a 40px box (the spacing the [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md) section header had before its list took the 8px under it), and the groups have no gap of their own, so a heading sits on its own rows, noticeably farther from the group above (about 25px) than from its first row (16px) ([Spacing rhythm](../foundations/comfort.md#spacing-rhythm)). By touch its target reaches 4px up, to 44px.
- Give each task one compact row: the completion control, the number, the title on one line (ending in an ellipsis when cut) with the number of messages in its discussion right after it, then the assignee (avatar and name; an agent's avatar carries its presence light, and the person reads "You") and a chevron at the right. Leave the status chip out of the row: the group already names the status. Where the section is too narrow, the assignee wraps to a second line at the right, as in the list under a message. The rows are the same compact rows as under a message and in the Files section ([Rows in a compact list](#rows-in-a-compact-list)).
- Open the task details from a row.

### Rows in a compact list

The tasks under a message, the Tasks section and the Files section are one kind of list and use one row. It is content: hairlines between the rows, the whole row the target, and no card for each row. These compact rows keep their lines for now; the other lists of rows (Activity, search, the sidebar, phone lists of ListRow cells) have none and draw their states on an inset shape ([Lists](./lists.md)). A row reads as one line: what it is on the left, who has it and where it stands on the right.

| Part | Spec |
| --- | --- |
| Row | One line, at least 36px tall with a mouse and 44px on a phone or a touch screen ([Spacing](../foundations/spacing.md#hit-targets)), 6px above and below its content. Its inline padding is the margin of the column it sits in: 20px in a side section (16px on a phone), so a row starts on the section head's line, and 12px inside the box under a message |
| Alignment | The texts on the row's line share one baseline: the task's number, the title, the number of messages, the assignee's name, the words of the status chip, a file's size and time ([Text of different sizes on one line](../foundations/alignment.md#text-of-different-sizes-on-one-line)). The marks without text, the completion control, the avatar, the status pixel, the chevron and the icons (a file's type icon, the icon of the number of messages, the actions), are centered on the title's line box ([A mark that leads text](../foundations/alignment.md#a-mark-that-leads-text)). No trimming of the text and no nudges, as on a line of properties |
| Completion control | A task row only, first on the row: the 20px round control ([Completing a task](#completing-a-task)), 10px before the number, its hit area 8px past it on every side. It is its own button on top of the row; the rest of the row opens the task. A file row has none |
| Leading | Optional, on the title's line: a task's number (`#25`) in Space Mono and `foreground-hint`, 8px before the title, or a file's 20px type icon or thumbnail |
| Title | `text-callout` in `foreground`, on one line, ending in an ellipsis when cut. A done task's title is struck through, in `foreground-hint` |
| Inline meta | Right after the title, 6px from it, or right after the ellipsis: a task's number of messages (an icon and the number in Space Mono) or a file's size in Space Mono. It belongs to the title, so the title gives up only the room the row lacks |
| Trailing group | At the right, its parts 8px apart. A task: the assignee (a 19px avatar and the name in `text-caption`), then the status chip or, in the Tasks section, a chevron. A file: the time it was shared, compact and in Space Mono (today the clock, in the person's 12-hour or 24-hour choice; earlier this year the month and day, Oct 21; an earlier year the date, 2025-10-21; the full date and time in its tooltip), then its actions (Jump to Message and Download, or a ⋮ menu below 560px), the last icon box on the row's margin with its hit area hanging outward, sideways and 4px above and below, so a file row is as tall as a task row ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). The group wraps, whole, to a second line, still at the right, only where the title would get less than 160px: at a side column's default 360px, a task row and a file row each stay on one line |
| Dividers | `line-hairline` between rows, running as far as the list's container visibly goes ([Separators](../foundations/comfort.md#separators)). Under a message the box holds only the rows, so its lines run edge to edge and meet its border. In a side section, floating or beside the messages, and on a phone, the list is one part of a section that also holds a head, a filter and group headings, or of a page with no edge at all, so its lines are inset by the row's inline padding on both sides: they start where the row's content starts and end where it ends, 20px in from each edge (16px on a phone). The hover still fills the whole row. None above the first row of a list or of a status group |
| Container | Under a message the rows sit in a box sized by its content (see [Tasks in a conversation](#tasks-in-a-conversation)): `line-hairline` border, `radius-container` (it is a container, [Shape](../foundations/shape.md)), `layer-card`. In a side section the rows run edge to edge with no gap between them, and the section's head, filter and group headings share their 20px margin (16px on a phone) |
| Group headings | A status heading in the Tasks section folds its group. It is a label over its rows, not a row, so it takes the states of a collapsible group heading: hover and press turn its words and chevron from `foreground-hint` to `foreground`, with no fill and no underline, and keyboard focus shows the inset ring ([Collapsible group headings](../foundations/states.md#collapsible-group-headings)). A fill would read as one more row, and would frame the words unevenly, since the heading keeps its words at the bottom of its box, on the rows they name |
| States | Hover lays the subtle overlay (`overlay-subtle`) over the whole row, press the medium one (`overlay-medium`), keyboard focus an inset ring ([Hover and press](../foundations/states.md#hover-and-press)). The completion control shows its own focus ring. A file's actions stay their own buttons on top of the row; Jump to Message lands on the message with the located highlight ([Located](../foundations/states.md#located)) |

- Don't give the rows of these lists a card each or a gap between them. A card per row turns a narrow side column into a stack of controls, and the three lists stop reading as one.
- Don't put a second line of details (size, time, role) under the title: details go in the inline meta or the trailing group. A row has a second line only when its trailing group wraps.
- Don't line up the trailing groups in columns across rows.

### Referring to a task

A task number is unique only in its place, so a reference names the place first: `#design:#25`, and `dm:@ada:#25` in a direct conversation. It reads as "#25 of #design" and opens the task from anywhere.

- Write a task reference as the place, `:`, then the number with its `#`. Agents write and read the same reference.
- Render a reference as a link that opens the task details, in any place, for people who can see that place. For anyone else it stays plain text.
- Render the link as the task chip in the task's status colors (its status pixel and soft tint), the same chip the task list under a message uses, so a reference reads "which task, and where it stands". Do not split the reference into differently colored parts: it is one name, and the status already has the pixel and the tint. When the product has not loaded the task (another place's task), it reads the task by place and number; until then the reference is an outlined chip, a `line-hairline` border around `foreground-muted` words, with no tint and no pixel. Never show it as a gray chip, which reads as Closed. A Backlog task's chip is outlined too, but carries its hollow pixel and its words in `foreground`: the pixel is what tells a task in Backlog from a task not loaded yet.
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
- [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md): `CheckboxIndicator`, drawn round in the completion control.
- [0042](../decisions/0042-tasks-as-a-to-do-list.md): why tasks work as a to-do list, with Backlog and no transition limits.
