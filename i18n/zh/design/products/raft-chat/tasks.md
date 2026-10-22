---
title: Raft Chat — 任务
summary: 任务这个目的地：标题和计数，Channel、Creator 和 Assignee 筛选，它不包含什么，频道的 Tasks 标签页，以及它们的空状态。
sourceHash: 33a2d7e1
---

# Raft Chat — 任务

任务是列出服务器里所有频道任务的一级页面。频道的 Tasks 标签页是只针对一个频道的同一个面板。状态、看板和列表、任务详情、更改状态以及筛选的行为遵循[任务](../../patterns/tasks.md)；这一页只写 Raft Chat 自己的选择。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelSectionHeader`，手机上在外框上）：标题 Tasks，下面是用 Space Mono 写的计数："12 channel tasks"，有筛选时是 "3 of 12 channel tasks"。
2. **筛选栏**：Channel、Creator 和 Assignee，有筛选时后面跟 Clear All，最右端是 Board / List。
3. **任务**：看板或列表，卡片上写着所属的频道。

```example
tasks/compositions/tasks-panel
```

## 规则 {#rules}

- 提供三个筛选：Channel、Creator 和 Assignee。Creator 和 Assignee 共用一份服务器里人和 agent 的列表。
- 这个页面上不要放创建操作。任务总是属于某个频道，所以在频道里创建（[频道](./channel.md#tasks-in-the-conversation)）。
- 这个页面不包含私信和 agent 的任务，页面为空时要说明这一点。
- 先只加载进行中的状态：Done 和 Closed 在展开它们的分组时才加载。任务更多的分组用 Load more 分页。频道的 Tasks 标签页一次加载它的全部任务。

### 频道的 Tasks 标签页 {#a-channels-tasks-tab}

- 让它和这个页面是同一个面板，只是没有标题栏，也没有 Channel 筛选。
- 在它的筛选栏里放一个墨色描边的小号 Create Task 按钮（带 `plus`）。它打开 Create Task，一个小型对话框，每个任务一行，带 Add Another。

### 空状态 {#empty-states}

| 情况 | 标题 | 句子 |
| --- | --- | --- |
| 没有任务的频道 | No tasks yet | Create one with the Create Task button. |
| 没有任务的任务页面 | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| 筛选后什么都不剩 | No tasks match this filter | Try a different combination or clear the current selection. |

- 用 `square-check-big` 图标，不放按钮：Create Task 按钮已经在筛选栏里了（[EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)）。
