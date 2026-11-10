---
title: The Tasks page lists the person's own work first, opens a task beside the list and creates tasks with a place
summary: The page of tasks from several places has Mine and All, a list grouped by the person's relation to each task as its default view, selection with a floating toolbar, the task opened as a column of the page's row, New task with a channel field, and no completion control.
number: 0045
status: accepted
date: 2026-11-10
---

# 0045. The Tasks page lists the person's own work first, opens a task beside the list and creates tasks with a place

## Context

Raft Chat's Tasks page listed every channel task in the server as a board by status on desktop and a list by status on a phone, under three filters, with task details in a centered dialog. The design system said the page had no create button, since a task belongs to a place, and [decision 0042](./0042-tasks-as-a-to-do-list.md) put a round completion control at the start of every task row and card.

With task conversations, most of the work is done by agents, and people mostly hand work out, decide and accept it. Someone who opens the page asks, in this order: is anything waiting on me, how is the work I handed out going, and what is everyone else's work. A status answers none of these well: who has a task and whether it moved say more.

Noel redesigned the page in #wg-task-v2 (thread 8a7ae237) from 2026-11-09 to 2026-11-10, with stdrc reviewing each step on a hi-fi, clickable design built from raft-ui (artifact 4ijP1hMNwQm5MtV6dmVhkc, v16), and built it in slock #13852 behind the task v2 flag. The live Tasks panel already had New task and a "3 / 12" count, which the design system didn't describe.

## Decision

- The page has two tabs, Mine and All. Mine is the default and lists the tasks assigned to the person, then the tasks they started that are someone else's or nobody's. Finished tasks are left out, but the second section keeps those done in the last day. All is one flat list. Neither is grouped by status.
- The list is the default view on desktop as on a phone; the board, by status, is one press away. On the board only Closed starts collapsed. A column's cards follow the page's sort, so a column is one drop target.
- Every filter (Channel, Status, Creator, Assignee) and the sort work in both tabs. The count reads "3 / 12" while a filter or the search narrows the list. On a phone the filters scroll sideways on one line.
- Rows can be selected, and the selected tasks are changed in bulk from the SelectionToolbar that selected messages use. Hover and press fill the whole row, the selection box inside the fill.
- A task opens in a column of the page's row, the list standing as the conversation, with a thread's widths, clipping, Expand and Esc. On a phone it is a pushed page.
- The page has New task, and its Create task asks for the channel.
- The page's rows and cards have no completion control.

stdrc approved the design on 2026-11-10 ("follow the design") and gave the rules on the row, the task's column, Expand, wrapping and the board's drop target in the same thread that day. stdrc asked why a task still had a checkbox in front of it on 2026-11-09, and the completion control was taken out of the page's design.

## Consequences

- The rules live in [Tasks](../patterns/tasks.md#a-page-of-tasks), [Raft Chat — Tasks](../products/raft-chat/tasks.md), [Responsive layout](../patterns/responsive.md#the-tasks-pages-row), [Drag and drop](../patterns/drag-and-drop.md#where-it-will-land) and the task component docs.
- Task details have two forms: the centered dialog from a place's view (a channel's Tasks section, a message, a reference) and a column of the row on the Tasks page. A channel's Tasks section keeps the dialog: it stands beside the channel's conversation, and a task holds its own discussion, so it isn't read beside that conversation.
- The completion control of decision 0042 stays the rule for a place's views. Neither slock nor the mobile app has built it yet.
- Every task still belongs to a place: the page's Create task can't be sent without a channel, and the page has no quick add.
- With task conversations off, a server keeps the earlier Tasks panel.
- To undo it: put the status groups back in the list, the board back as the desktop default, and the dialog back for the page's task. The rest (Mine and All, the filters, selection) stands on its own.

## Alternatives considered

- **A page in three blocks: what waits on you, what you handed out (moving, stuck, done since your last visit), and what everyone is doing, by person.** stdrc found the block names and their explanations hard to read and the last block of little use (2026-11-10). The two tabs keep the first two answers, and the filters and the sort give the rest.
- **A second tab for admins, with the unassigned tasks and the tasks updated least recently.** stdrc first asked for the second tab to be an admin's view (2026-11-10). Once All had every filter and the sort, Assignee set to Unassigned and the sort by least recently updated gave the same lists, so All is shown to everyone, as the earlier page was.
- **The board as the desktop default.** It sorts by status, the weakest of the signals people come for.
- **The task in a centered dialog, as elsewhere.** The page has no conversation of its own to keep in view, and the dialog hides the list people go back to for the next task. A column keeps both and works as the thread does in chat.
- **No create button, as the design system had it.** The earlier page had one, and stdrc asked that the page lose none of what it could do. A Channel field in Create task keeps every task in a place.
- **A round completion control before the selection box.** Two boxes at the start of a row, one round and one square, look alike and do different things.

## Related

- [Tasks](../patterns/tasks.md)
- [0042](./0042-tasks-as-a-to-do-list.md)
- [Raft Chat — Tasks](../products/raft-chat/tasks.md)
