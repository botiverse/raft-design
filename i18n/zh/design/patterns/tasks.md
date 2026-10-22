---
title: 任务
summary: 五种任务状态，任务列表和看板，任务详情，对话中的任务，状态怎么改，以及任务怎么筛选。
sourceHash: 581e53df
---

# 任务

任务有五种状态之一，每种状态的颜色固定：Todo、In Progress、In Review、Done 和 Closed。任务出现在哪里都以同样的方式显示：同一个筛选栏下的看板或列表，详情在居中的对话框里。人和 Agent 处理的是同一个任务，所以它在每个显示它的屏幕上都必须看起来一样、用起来一样。

## 适用范围 {#when-it-applies}

产品的任务页面，以及一个地方的任务视图。在 Raft Chat 里，就是 Tasks 这个目的地和频道的 Tasks 标签页（[Raft Chat — 任务](../products/raft-chat/tasks.md)）；一个产品提供哪些筛选和哪些创建操作，写在它自己的页面上。

## 结构 {#structure}

```example
tasks/compositions/tasks-panel
```

- **任务列表或看板**：顶部是筛选栏，右端是 Board / List（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)）。在手机上，Board / List 只显示图标。
  - 看板每种状态一栏，每栏 232px 宽（[TaskBoard](../../packages/ui/src/components/task-board/task-board.md)）。
  - 列表按状态给任务分组（[TaskList](../../packages/ui/src/components/task-list/task-list.md)）。
  - 两者用同一种卡片（[TaskCard](../../packages/ui/src/components/task-card/task-card.md)），都按上面的顺序显示五种状态，每种都有可折叠的标题和计数。
- **任务详情**：居中的对话框，960px 宽（或窗口宽度减 32px），最高 900px（窗口的 86%），在手机上全屏。从上到下：
  1. 一条栏：第一行是地方，下一行是任务编号（"Task #25"），一个在任务所在地方打开它的消息列的按钮，以及 ×。在手机上，这条栏用 Back 代替 ×。
  2. 标题和描述，描述超过 3 行后折叠。
  3. 一行属性（Status、Assignee、Created by），用行内的 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline)（`direction="inline"`）。
  4. 历史，默认收起（[Timeline](../../packages/ui/src/components/timeline/timeline.md)）。
  5. 在有对话的产品里，任务的消息列和它的消息输入框。

## 规则 {#rules}

- 只用这五种状态。"Needs you" 不是状态：它是一个操作（操作卡片上的按钮）和一个提醒圆点。也不要加一个 "needs you" 分组或颜色：第六个分组里的任务同时也在五种状态之一里，而等着人处理的东西在对话里已经有它的位置。
- 手机上默认用列表，桌面端默认用看板，因为手机放不下五栏。记住这个人上次的选择。
- 看板和列表里，Done 和 Closed 默认收起：它们只会越来越多，而人们来看的是进行中的工作。
- 状态标签是卡片上唯一能就地修改的东西。选中卡片的其他部分会打开任务详情。
- 人们可以从卡片上的状态标签、详情里的属性改状态，也可以把卡片拖到看板的另一栏。不能修改任务的人看到的状态标签没有菜单，也不能拖动。
- 状态标签的菜单里只提供从当前状态允许的变更，这样人们永远不会选到一个随后会失败的操作。
- 任务详情用居中的对话框打开，从不放在侧面板里：任务有自己的消息列，所以不是放在对话旁边读的（[页面结构](./page-structure.md#sidebar-and-side-panel)）。用 ×、Esc 或点击对话框外部关闭。
- 只在列出多个地方的任务时，才在卡片上写出任务所在的地方。在一个地方的视图里，页面本身就是那个地方。
- 列表加载时，在它的位置显示骨架屏卡片（[反馈](./feedback.md#empty-loading-and-failed)）。

### 在哪里创建任务 {#where-tasks-are-created}

- 创建操作放在任务所属的地方，不放在汇集多个地方任务的页面上：在那里创建的任务没有所属的地方。
- 一个地方的任务视图和任务页面用同一个面板，去掉针对这个地方的筛选，并在筛选栏里加一个创建按钮。

### 对话中的任务 {#tasks-in-a-conversation}

在任务来自对话的产品里，消息就是任务。

- 变成任务的消息，在它下面那一行放一个任务标记：状态像素点、编号（`#25`）和认领人（[TaskChip](../../packages/ui/src/components/tasks/tasks.md)）。
- 从标记打开任务详情。不要从标记改状态：它是指向任务的链接，状态在详情里或任务卡片上修改。
- 人们可以在发送时用消息输入框里的 As Task 复选框把消息变成任务，也可以之后从消息菜单里操作。
- Agent 对任务做的事（认领、释放、移动、完成）写成事件行，不写成消息（[对话](./conversation.md#dates-and-grouping)）。
- 任务的消息列显示在任务详情里，让讨论和状态放在一起读。

### 筛选 {#filters}

一个产品提供哪些筛选，写在它自己的页面上。每个筛选都遵守同样的规则：

- 每个筛选是一个 [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md)，打开一个带搜索的列表。可以选多个值。
- 生效的筛选显示为 `info-soft`，并用 Space Mono 写出选中值的数量，这样筛选过的视图看起来永远不会像完整的列表。
- 按人筛选时，人和 Agent 列在一起。快捷项放在最前（"Created by me"、"Assigned to me"，然后是 "Unassigned"），作为列表里的行而不是单独的按钮，不带头像；然后是按 A 到 Z 排列的人和 Agent。
- 有任何筛选生效时，在筛选后面显示 Clear All，一个幽灵按钮。
- 筛选保存在地址里，这样筛选过的视图可以分享和重新加载。

## 相关 {#related}

- [交接和审批](../people-and-agents/handoffs-and-approvals.md#handing-off)：认领和交接。
- [颜色](../foundations/color.md#statuses)：状态颜色。
- [任务组件](../../packages/ui/src/components/tasks/tasks.md)：`TaskChip` 和 `TaskStatusBadge`。
