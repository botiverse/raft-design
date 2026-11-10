---
title: Raft Chat — 任务
summary: 任务这个目的地（Mine 和 All，它的头部和计数，Channel、Status、Creator 和 Assignee 筛选，排序，New task，选中任务的操作，它不包含什么），频道的 Tasks 分区，以及它们的空状态。
sourceHash: b4f7dbb0
---

# Raft Chat — 任务

任务是列出服务器里频道任务的一级页面：Mine 里是这个人自己的任务，All 里是这个人能看到的所有任务。频道自己的任务在它的 Tasks 分区里，放在它的对话旁边。状态、页面的列表和看板、选择任务、在列表旁边打开的任务、对话旁边的分区、任务详情、任务的完成、添加和编辑、更改状态以及筛选的行为遵循[任务](../../patterns/tasks.md)；这一页只写 Raft Chat 自己的选择。这个页面是 stdrc 在 2026-11-10 批准的那一版（#wg-task-v2:8a7ae237；[决策 0045](../../decisions/0045-the-tasks-page.md)），用在开启了任务对话的服务器上；没有开启任务对话的服务器保留以前的任务页面。

## 结构 {#structure}

页面占满导航条右边的主区域；任务没有侧栏。从上到下：

1. **头部**（`PanelSectionHeader`；手机上是这个一级页面的顶栏）：标题 Tasks，旁边是用 Space Mono 写的计数 "12"，有筛选或搜索缩小列表时是 "3 / 12"；末端是搜索框 "Search tasks"。在手机上，搜索框在工具栏下面。
2. **工具栏**：Mine / All，各带它的计数；Channel、Status、Creator 和 Assignee，有筛选生效时后面跟 Clear all；末端是排序、List / Board 和 New task。
3. **任务**：列表里是 Mine 的两个分区 Assigned to you 和 Started by you，或者 All 的一个列表；或者看板。每一行和每张卡片都写着所属的频道。
4. **选中任务的工具栏**，有任务被选中时浮在底部。

任务在列表右边的一列里打开，在手机上作为推入页面打开（[打开的任务](../../patterns/tasks.md#the-open-task)）。

```example
tasks/compositions/tasks-panel
```

raft-ui 尚未实现：这个示例展示的是 [0045](../../decisions/0045-the-tasks-page.md) 之前的任务页面，一个按状态分栏的看板，没有标签页、排序和选择。

## 规则 {#rules}

- 标签页叫 Mine 和 All，Mine 的两个分区叫 Assigned to you 和 Started by you。Started by you 放这个人创建的、以及从这个人的消息创建的（「从我的消息创建的」，stdrc，2026-11-09）、由别人负责或没有人负责的任务。
- 提供四个筛选：Channel、Status、Creator 和 Assignee。Creator 和 Assignee 共用一份服务器里人和 Agent 的列表，Creator 最前面是 "Created by me"，Assignee 最前面是 "Assigned to me" 和 "Unassigned"（[筛选](../../patterns/tasks.md#filters)）。Status 列出五种状态和它们的像素点，没有搜索。
- 提供三种排序：Recently updated（默认）、Least recently updated 和 Recently created。
- New task 是带 `plus` 的主按钮，放在工具栏最后。它打开带 Channel 字段的 Create task；Channel 筛选恰好选了一个频道时，这个字段预先填好（[在哪里创建任务](../../patterns/tasks.md#where-tasks-are-created)）。这个字段列出这个人加入了、能发消息的频道，不包括已归档的。新任务在列表旁边打开。
- 选中任务的工具栏有 Status、Assignee、Nudge、Follow 和 Delete，其中 Follow 和 Delete 是 `secondary`（[选择任务](../../patterns/tasks.md#selecting-tasks)）。Assignee 的菜单先是 Me，然后是 Unassigned，然后是人和 Agent：筛选和行里都把没有负责人的任务叫作 Unassigned，所以菜单也用这个词（Noel 和 Jasper，2026-11-10）。Nudge 要等服务器有了对每个负责人未完成工作的统一计数（Agent 的空闲提醒也用这个计数）才会加上；在那之前，工具栏只有另外四个。
- 这个页面不包含私信和 Agent 的任务，页面为空时要说明这一点。
- 每个分区和看板的每一栏一次读取 20 个任务，滚动时再读取下 20 个；收起的栏在展开之前什么都不读取。频道的 Tasks 分区一次加载它的全部任务。

### 频道的 Tasks 分区 {#a-channels-tasks-section}

这个分区遵循[对话旁边的任务](../../patterns/tasks.md#tasks-beside-a-conversation)。在 Raft Chat 里：

- All 上计数未完成的任务（Todo、In progress），For me 上计数指派给这个人的未完成任务。标题栏自己不带计数。
- 在 × 前面放一个幽灵样式的 Create task 图标按钮（`plus`）。它打开 Create task（[在哪里创建任务](../../patterns/tasks.md#where-tasks-are-created)），标题下面用 Space Mono 写着所在的频道："In #launch-week"。
- 在一个状态分组里，最新的任务排在最前：人们是在聊天时看这个分区的，所以刚从对话里创建的任务出现在它所在分组的最上面，正是他们找它的地方。
- 分区和任务页面不同的地方，要保持不同：它的标签页是 All / For me，按未完成的任务计数，而不是 Mine / All；它的行按状态分组，Backlog、Done 和 Closed 收起；每一行以完成控件开头，而不是选择复选框；任务在居中的对话框里打开，而不是在列表旁边，因为分区本身已经在频道的对话旁边；它有快速添加；它没有排序、没有看板，也没有选择。它回答的是人们在一个频道里聊天时，这个频道里什么在推进；而页面回答的是整个服务器里哪些是这个人的（[任务](../../patterns/tasks.md)）。

### 空状态 {#empty-states}

| 情况 | 标题 | 句子 |
| --- | --- | --- |
| 没有任务的频道 | No tasks yet | Tasks that people and agents create in this channel show up here. |
| For me，没有指派给这个人的任务 | Nothing is waiting on you | Tasks assigned to you in this channel show up here. |
| 任务页面上的 All，没有任务 | No tasks yet | DM and agent task boards are intentionally excluded from this server-wide view. |
| 筛选后什么都不剩 | No tasks match this filter | Try a different combination or clear the current selection. |
| Mine 里没有任务的分区 | No tasks，标题下面的一行，标题已经写明了是哪个分区（Noel，2026-11-10，#wg-task-v2:8a7ae237） | 无 |

- 用 `square-check-big` 图标，不放按钮：Create task 和 Clear all 已经在页面的工具栏或分区的头部里了（[EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)）。
