---
title: LegacyTaskPanel
summary: A read-only task details panel built on the thread panel; deprecated, because task details are a dialog with a description list.
status: deprecated
aliases: [Task panel, TaskPanel]
category: layout
related: [dialog, description-list, timeline, thread-panel]
replacedBy: dialog
---

# LegacyTaskPanel

LegacyTaskPanel lays out a task's details as a side panel: a header with the task's title, then fields, a status and meta rows, built on [ThreadPanel](../thread-panel/thread-panel.md). No product uses it, and it is removed in raft-ui 1.0. Task details are a centered [Dialog](../dialog/dialog.md) instead, with the properties in a [DescriptionList](../description-list/description-list.md) and the history in a collapsed [Timeline](../timeline/timeline.md); how they are assembled is in [Composites](../../../../../design/patterns/composites.md#task-details), and the dialog's size is in [Tasks](../../../../../design/patterns/tasks.md#structure).

## When to use

| Situation                                         | Use                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A task's details                                  | A [Dialog](../dialog/dialog.md), built as in [Composites](../../../../../design/patterns/composites.md#task-details) |
| A task's properties: Status, Assignee, Created by | [DescriptionList](../description-list/description-list.md)                                                           |
| What happened to the task                         | A collapsed [Timeline](../timeline/timeline.md)                                                                      |
| A task in a list or on a board                    | [TaskCard](../task-card/task-card.md)                                                                                |
