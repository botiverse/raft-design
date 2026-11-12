---
title: TaskBoard
summary: 任务的看板视图：每个状态一列，按状态顺序排列，卡片可以拖到另一列来改变状态。
sourceHash: d0457095
---

# TaskBoard

TaskBoard 把任务按状态分列显示，每个状态一列，从 Backlog 到 Closed。把卡片拖到另一列就改变了它的状态。它是任务页面的两种视图之一；另一种是页面的列表，也是默认视图。何时显示哪一种，见[任务](../../../../../design/patterns/tasks.md#rules)。

```example
task-board/compositions/task-board
```

raft-ui 尚未实现：这个示例展示的是 [0042](../../../../../design/decisions/0042-tasks-as-a-to-do-list.md) 之前的看板，有五列，卡片上没有完成控件。

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 按状态查看任务，有放五列的空间 | TaskBoard |
| 任务页面的默认视图 | 它由行组成的列表（[任务](../../../../../design/patterns/tasks.md#the-list)） |
| 在一列里按状态查看任务 | [TaskList](../task-list/task-list.md) |
| 单个任务 | [TaskCard](../task-card/task-card.md) |

## 结构 {#anatomy}

- `TaskBoardRoot`：一排列。必需。
- `TaskBoardColumn`：一个状态。一个可折叠的区块。必需，每个状态一个。
  - `TaskBoardColumnTrigger`：列标题，用来折叠这一列。
    - `TaskBoardColumnHeading`：`TaskBoardColumnBadge`（状态像素点和名称）和 `TaskBoardColumnCount`。
    - `TaskBoardColumnChevron`：显示这一列是否展开的箭头，收起时朝右，展开时朝下。它始终显示，静止时用 `foreground-hint`：收起的一列只显示它的标题，没有箭头的话，空白上方的「Closed 2」读起来像是两个没加载出来的任务（Kirby，2026-11-10，#wg-task-v2:8a7ae237）。没有传入子元素时，它画 `ChevronDown`。
  - `TaskBoardColumnPanel` 和 `TaskBoardColumnItems`：卡片。
  - `TaskBoardColumnEmpty`：空列显示的文字，有三种：平时是 `TaskBoardColumnEmptyIdle`，卡片可以放进来时是 `TaskBoardColumnEmptyAllowed`，不能放进来时是 `TaskBoardColumnEmptyBlocked`。

拖放来自 `TaskDnd` 部件（`TaskDndProvider`、`TaskDropZone`、`TaskDraggable`），由看板的组合示例接入。

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 空列 | 一个 `line-seam` 虚线框，里面一行 `foreground-hint` 文字 |
| 卡片可以放进来 | 空框隐藏，显示放置占位；折叠的列加上 `line-strong` 虚线轮廓 |
| 卡片悬在某一列上 | 列里的卡片是放置目标时，这一列保持原来的填充；只用放置占位标出卡片会落在哪里，这样只有一个信号说明位置，而不是两个 |
| 卡片悬在排好序的一列上 | 整列显示 `fill-subtle`，卡片之间不出现放置占位：放下后，卡片会去排序给它的位置，所以这一列本身就是那个位置（它的 `TaskDropZone` 上的 `dragInto`，[它将落在哪里](../../../../../design/patterns/drag-and-drop.md#where-it-will-land)） |
| 卡片不能放进来 | 没有填充；空框用 `foreground-muted` 说明原因 |

```example
task-board/compositions/task-board-empty-columns
```

## 行为 {#behavior}

- 列的顺序是 Backlog、Todo（待办）、In progress（进行中）、Done（完成）、Closed（已关闭），一开始只有 Closed 是收起的（[任务](../../../../../design/patterns/tasks.md#rules)）。
- 不要因为卡片现有的状态或将得到的状态而拒绝放下：任何状态都可以改成任何状态（[任务](../../../../../design/patterns/tasks.md#rules)）。一列只会因为状态以外的原因拒绝一张卡片，比如这个人不能修改的任务。
- 用页面工具栏靠末尾处的 List / Board 在列表和看板之间切换（[任务](../../../../../design/patterns/tasks.md#structure)），并记住这个人的选择。
- 整个看板在一个视口里横竖两个方向滚动。列保持宽度，从不单独滚动。
- 很长的列只挂载可见的卡片，用你自己的虚拟化组件读取看板的滚动位置，如下所示。

```example
task-board/compositions/task-board-virtualization
```

## 内容 {#content}

- 空文字的写法和列表里的空分组一样（[TaskList](../task-list/task-list.md#content)）。
- 卡片被拖到一个空列上方时，说出它将得到的状态；这一列拒绝它时，说明原因（"You can't change this task's status"）。

## 无障碍 {#accessibility}

- 每一列是一个渲染为 `section` 的 Base UI `Collapsible`；它的触发按钮是一个带 `aria-expanded` 的按钮。
- 给每一列一个无障碍名称：触发按钮里的状态名，或者 section 上的 `aria-label`。
- 卡片可以用键盘移动：空格拿起卡片，左右方向键在列之间移动它（只有这一列按这个人自己的顺序排列时，上下方向键才在列内移动它），空格放下，Escape 放回原处。Enter 打开卡片（[拖放](../../../../../design/patterns/drag-and-drop.md#keyboard)）。
- 用名字播报每一步（"Picked up Task #25. Over Todo."、"Dropped Task #25 in In progress."）。把卡片和状态的名字传给 `TaskDndProvider` 的 `describe`；看板的组合示例展示了怎么做。看板不会自己播报，没有 `describe` 就什么都不播报。

## 规则 {#rules}

- 每个列标题都显示卡片数量，用 Space Mono。
