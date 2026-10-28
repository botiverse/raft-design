---
title: Raft Chat — 任务
summary: 任务这个目的地：标题和计数，Channel、Creator 和 Assignee 筛选，它不包含什么，频道的 Tasks 分区，以及它们的空状态。
sourceHash: 30d1e5e1
---

# Raft Chat — 任务

任务是列出服务器里所有频道任务的一级页面。频道自己的任务在它的 Tasks 分区里，放在它的对话旁边。状态、看板和列表、对话旁边的分区、任务详情、更改状态以及筛选的行为遵循[任务](../../patterns/tasks.md)；这一页只写 Raft Chat 自己的选择。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelSectionHeader`，手机上在外框上）：标题 Tasks，下面是用 Space Mono 写的计数："12 channel tasks"，有筛选时是 "3 of 12 channel tasks"。
2. **筛选栏**：Channel、Creator 和 Assignee，有筛选时后面跟 Clear All，最右端是 Board / List。
3. **任务**：看板或列表，卡片上写着所属的频道。

```example
tasks/compositions/tasks-panel
```

## 规则 {#rules}

- 提供三个筛选：Channel、Creator 和 Assignee。Creator 和 Assignee 共用一份服务器里人和 Agent 的列表。
- 这个页面上不要放创建操作。任务总是属于某个频道，所以在频道里创建（[频道](./channel.md#tasks-in-the-conversation)）。
- 这个页面不包含私信和 Agent 的任务，页面为空时要说明这一点。
- 先只加载进行中的状态：Done 和 Closed 在展开它们的分组时才加载。任务更多的分组用 Load more 分页。频道的 Tasks 分区一次加载它的全部任务。

### 频道的 Tasks 分区 {#a-channels-tasks-section}

这个分区遵循[对话旁边的任务](../../patterns/tasks.md#tasks-beside-a-conversation)。在 Raft Chat 里：

- All 上计数未完成的任务（Todo、In Progress、In Review），For Me 上计数指派给这个人的未完成任务。标题栏自己不带计数。
- 在 × 前面放一个幽灵样式的 Create Task 图标按钮（`plus`）。它打开 Create Task，一个小型对话框，每个任务一行，带 Add Another。
- 在一个状态分组里，最新的任务排在最前：人们是在聊天时看这个分区的，所以刚从对话里创建的任务出现在它所在分组的最上面，正是他们找它的地方。

### 空状态 {#empty-states}

| 情况 | 标题 | 句子 |
| --- | --- | --- |
| 没有任务的频道 | No tasks yet | Tasks that people and agents create in this channel show up here. |
| For Me，没有指派给这个人的任务 | Nothing is waiting on you | Tasks assigned to you in this channel show up here. |
| 没有任务的任务页面 | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| 筛选后什么都不剩 | No tasks match this filter | Try a different combination or clear the current selection. |

- 用 `square-check-big` 图标，不放按钮：Create Task 按钮已经在筛选栏或分区的头部里了（[EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)）。
