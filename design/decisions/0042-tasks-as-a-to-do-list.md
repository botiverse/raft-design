---
title: Tasks work as a to-do list, with six statuses and no transition limits
summary: Tasks gain Backlog as a sixth status with no hue, any status can be set from any status, and every task starts with a round completion control and can be added by typing its title, while assignees, review and per-task discussion stay.
number: 0042
status: accepted
date: 2026-10-31
---

# 0042. Tasks work as a to-do list, with six statuses and no transition limits

## Context

Tasks had five statuses (Todo, In Progress, In Review, Done and Closed), and the status menu offered only the moves allowed from the current status. Finishing a task took a menu or a drag; adding one took the Create Task dialog. The task v2 work set out to make tasks work as a to-do list, with Google Tasks as the baseline, for the everyday case: tick a task off, type the next one, park one for later. Parking had no place: a task not planned now stayed in Todo and was counted as active work, or was Closed, which says it won't be done.

Raft's tasks also carry what a to-do list doesn't: an assignee who can be a person or an agent, a review step before Done, and a discussion of their own. The redesign had to keep these.

Every hue already has a meaning ([Color](../foundations/color.md#meanings-of-color)), and gray is Closed's.

## Decision

- A sixth status, Backlog ("not now"), holds work someone created or parked and doesn't plan to do now. Closed stays "won't do". Backlog spends no hue ([Color](../foundations/color.md#statuses)). It isn't counted as active work, and its group starts collapsed.
- Any status can be set from any status, by people and agents, from the status menu, the details' Status property, a drag on the board or the completion control, and no status requires an assignee. A move into Backlog asks for an optional reason, recorded in History and in the task's discussion. A board refuses a card only for a reason outside the statuses, such as a task the person may not change.
- Every task row and card starts with a round completion control that marks the task Done in one click (on an In Review task, it accepts the work) and reopens a done task to Todo.
- A channel's Tasks section adds a task from a title typed into "Add a task". Create Task sets the status (Backlog, Todo or In Progress) and the assignee. The title and the description are edited in place in the details.

The lead (stdrc) approved the hi-fi mockup, built with raft-ui 0.55.0, on 2026-10-31.

## Consequences

- The rules live in [Tasks](../patterns/tasks.md), [Color](../foundations/color.md#statuses), [Shape](../foundations/shape.md#principles) and the task component docs. Every "five statuses" in the docs now says six.
- The order of agents' work, In Review before Done, is guidance in the Raft agent guide, not a limit the product enforces ([Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#handing-off)). Who moved a task, and when, stays in its event lines and History.
- Not yet implemented in raft-ui: `TASK_STATUS_IDS`, `TaskStatusIcon` and `TaskChip` know only five statuses, and there is no part for the completion control. Until raft-ui adds them, products draw the Backlog pixel and chip and the completion control by hand, and the docs' examples (the tasks panel, the task card, the board, Create Task) show the tasks before this decision. A raft-ui change follows separately.
- The round completion control is an exception to "round only for switches, radios and grab handles", recorded in [Shape](../foundations/shape.md#principles) and [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md#rules).
- To undo it: remove Backlog from the status lists and orders, put back the allowed-moves menu, and drop the completion control and the quick add. Nothing else depends on them.

## Alternatives considered

- **A hue for Backlog.** Every hue already means something, and a gray pixel would read as Closed. An empty pixel says "nothing filled in yet" without a new color.
- **Keep the transition limits and add Backlog to them.** A menu that hides moves sends people the long way round to put a task where its work already is, and the event lines and History already record every move.
- **A square checkbox at the start of the row.** A square box there reads as "select this row" for a bulk action; the circle is the to-do convention and reads as "done".
- **Quick add on the server-wide Tasks page.** A task always belongs to a place, and that page collects tasks from several, so a task added there would have none.

## Related

- [Tasks](../patterns/tasks.md)
- [Color](../foundations/color.md#statuses)
- [Raft Chat — Tasks](../products/raft-chat/tasks.md)
