---
title: TaskCard
summary: 显示一个任务的卡片，包含任务编号、标题和一个可以修改状态的状态标签，用在任务看板和任务列表里。
sourceHash: eb9dc713
---

# TaskCard

TaskCard 显示一个任务：编号、标题，以及一个人可以修改的状态标签。看板和列表用同一张卡片。任务怎样显示、筛选和打开，见[任务](../../../../../design/patterns/tasks.md)。

```example
task-card/compositions/task-card-state-matrix
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 看板或列表里的一个任务 | TaskCard，放在 [TaskBoard](../task-board/task-board.md) 的列或 [TaskList](../task-list/task-list.md) 的分组里 |
| 对话里的一个任务 | 不用卡片：消息本身就是任务，下面挂一个任务标记（[MessageItem](../message-item/message-item.md)） |
| 正文、一行或一个标题里的任务状态或编号 | `TaskChip` 或 `TaskStatusBadge`（[任务组件](../tasks/tasks.md)） |
| 任务详情 | 居中对话框；见[任务](../../../../../design/patterns/tasks.md#structure) |

## 结构 {#anatomy}

- `TaskCard`：卡片。传入 `onClick` 让它打开任务详情。
- `TaskCardRow` 和 `TaskCardBody`：文字周围的布局。
- `TaskCardMeta`：第一行。
  - `TaskCardChannel`：任务所属的地方（#launch-week）。可选；见[内容](#content)。
  - `TaskCardStatus`：状态标签。必需。
  - `TaskCardNumber`：任务编号（#25）。必需。
  - `TaskCardLegacy`：标记来自旧任务系统的任务。可选。
- `TaskCardTitle`：任务标题，最多 3 行。必需。
- `TaskCardDescription`：简短描述，最多 2 行。可选。

## 状态 {#states}

| 状态 | 用于 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `TaskCard` 或 `TaskCardStatus` 上的 `busy` | 正在保存状态更改；完成之前状态标签不能按 |
| `disabled` | 不能打开或更改的任务：`fill-muted` 卡片，文字用 `foreground-disabled` |
| 拖动中 | 在看板上，只有正在拖动的卡片带 `shadow-float`（[TaskBoard](../task-board/task-board.md)） |

```example
task-card/compositions/task-card-state-matrix
```

## 行为 {#behavior}

- 带 `onClick` 的卡片悬停时用浅档，和其他供人阅读的卡片一样，按下时用中档；它的状态标签悬停时用中档（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。
- 按状态标签会打开五种状态的列表，当前状态上有一个勾（[Select](../select/select.md)）。选中一个即立即更改状态。
- 按状态标签不会打开卡片：阻止点击事件传到 `TaskCard`。

```example
task-card/compositions/task-status-select
```

## 内容 {#content}

- 标题用 sentence case，写成动词加宾语："Polish the onboarding flow"。
- 只在汇总多个地方的任务时显示频道，比如产品的任务页。在某个地方自己的「任务」视图里，每个任务都属于那个地方，所以不显示。
- 频道和编号用 Space Mono；这些部分会自动处理。
- 状态拼写为 Todo、In Progress、In Review、Done 和 Closed（[写作](../../../../../design/content/writing.md#voice)）。

## 无障碍 {#accessibility}

- `TaskCard` 使用 Base UI 的 `useRender`，渲染为 `article`。带 `onClick` 时它可以点击，但不是按钮：给键盘一个打开任务的方式，比如标题上的链接或按钮。
- `TaskCardStatus` 是原生 `button`，也是状态 [Select](../select/select.md) 的触发器。给它一个包含任务的无障碍名称：`aria-label="Change status for task #25"`。
- `busy` 会设置 `aria-busy`；`disabled` 会在卡片上设置 `aria-disabled`。

## 规则 {#rules}

- 状态标签是卡片上唯一可以更改的东西。负责人和创建者在任务详情里更改。
- 不要给卡片加阴影、色带或强调边框：它是带细线的白色卡片（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。
