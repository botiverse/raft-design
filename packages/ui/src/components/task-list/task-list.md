---
title: TaskList
summary: The list view of tasks — one collapsible group per status, in status order, each holding task cards.
status: stable
aliases: []
category: content
related: [task-card, task-board, tasks]
---

# TaskList

A TaskList groups tasks by status, one collapsible group per status, in the same order as the columns of a [TaskBoard](../task-board/task-board.md). It is the default view on a phone. When to show which view, and which groups start collapsed, is in [Tasks](../../../../../design/patterns/tasks.md#rules).

```example
task-list/compositions/task-list
```

## When to use

| Situation                                   | Use                                      |
| ------------------------------------------- | ---------------------------------------- |
| Tasks on a phone or in a narrow panel       | TaskList                                 |
| Tasks by status, with room for five columns | [TaskBoard](../task-board/task-board.md) |
| One task                                    | [TaskCard](../task-card/task-card.md)    |

## Anatomy

- `TaskListRoot`: the stack of groups. Required.
- `TaskSection`: one status. A collapsible section. Required, one per status.
  - `TaskSectionTrigger`: the group heading, which collapses the group.
    - `TaskSectionChevron`: the arrow before the heading.
    - `TaskSectionHeading`: `TaskSectionBadge` (the status pixel and name) and `TaskSectionCount`.
  - `TaskSectionPanel` and `TaskSectionItems`: the cards.
  - `TaskSectionEmpty`: what an empty group says.

## States

| State       | Look                                                                |
| ----------- | ------------------------------------------------------------------- |
| Collapsed   | Only the heading and its count show                                 |
| Empty group | A dashed `line-seam` box with one line of text in `foreground-hint` |

```example
task-list/compositions/task-list-empty-sections
```

## Behavior

- Scroll every group in one viewport. Groups don't scroll on their own.
- Mount only the visible cards of a tall group with a virtualizer of your own; raft-ui doesn't virtualize.

## Content

- Write an empty group as "No", the status and "tasks", with the status spelled as on its chip ([Writing](../../../../../design/foundations/writing.md#voice)): "No In Review tasks."

## Accessibility

- Each group is a Base UI `Collapsible` rendered as a `section`; its trigger is a button with `aria-expanded`, named by the status and count it contains.
- Show the count in the heading also when the group is collapsed, so the trigger still says how many tasks it hides.
