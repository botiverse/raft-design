---
title: In Review is retired for tasks with their own conversation
summary: Agents finish work to Done and tell the person who asked; a task on a person means it waits on them. In Review stays only on older tasks.
number: 0043
status: accepted
date: 2026-11-02
---

# 0043. In Review is retired for tasks with their own conversation

## Context

[Decision 0042](./0042-tasks-as-a-to-do-list.md) kept In Review as one of six statuses. In use, agents moved nearly all their finished work to In Review and assigned it to a person, so people spent their time clearing a pile of tasks instead of looking at the few that needed them. Having a review step on offer made it the default place to leave finished work.

## Decision

- Tasks have five statuses: Backlog, Todo, In Progress, Done and Closed.
- Finished work goes to Done, and the result goes to the person who asked.
- A task assigned to a person means it waits on them. It stays In Progress. Agents do this only when the person asked to see the work first, or the task is blocked on their decision or input.
- There is no separate marker for "waiting on a person": the assignee says it.
- A task from before task conversations can still be in In Review, and keeps its chip, its color and its group or column until it moves. Where task conversations are off, the product is unchanged.
