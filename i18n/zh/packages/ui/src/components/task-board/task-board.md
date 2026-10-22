---
title: TaskBoard
summary: 任务的看板视图：每个状态一列，按状态顺序排列，卡片可以拖到另一列来改变状态。
sourceHash: 2134d971
---

# TaskBoard

TaskBoard 把任务按状态分列显示，每个状态一列，从待办到已关闭。把卡片拖到另一列就改变了它的状态。它是一组任务的两种视图之一，另一种是 [TaskList](../task-list/task-list.md)。何时显示哪一种，见[任务](../../../../../design/patterns/tasks.md)。

```example
task-board/compositions/task-board
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 按状态查看任务，有放五列的空间 | TaskBoard |
| 在手机上或窄面板里查看任务 | [TaskList](../task-list/task-list.md) |
| 单个任务 | [TaskCard](../task-card/task-card.md) |

## 结构 {#anatomy}

- `TaskBoardRoot`：一排列。必需。
- `TaskBoardColumn`：一个状态。一个可折叠的区块。必需，每个状态一个。
  - `TaskBoardColumnTrigger`：列标题，用来折叠这一列。
    - `TaskBoardColumnHeading`：`TaskBoardColumnBadge`（状态像素点和名称）和 `TaskBoardColumnCount`。
    - `TaskBoardColumnChevron`：显示这一列是否展开的箭头。
  - `TaskBoardColumnPanel` 和 `TaskBoardColumnItems`：卡片。
  - `TaskBoardColumnEmpty`：空列显示的文字，有三种：平时是 `TaskBoardColumnEmptyIdle`，卡片可以放进来时是 `TaskBoardColumnEmptyAllowed`，不能放进来时是 `TaskBoardColumnEmptyBlocked`。

拖放来自 `TaskDnd` 部件（`TaskDndProvider`、`TaskDropZone`、`TaskDraggable`），由看板的组合示例接入。

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 空列 | 一个 `line-seam` 虚线框，里面一行 `foreground-hint` 文字 |
| 卡片可以放进来 | 空框隐藏，显示放置占位；折叠的列加上 `line-strong` 虚线轮廓 |
| 卡片悬在某一列上 | 这一列保持原来的填充；只用放置占位标出卡片会落在哪里，这样只有一个信号说明位置，而不是两个 |
| 卡片不能放进来 | 空框用 `foreground-muted` 说明原因 |

```example
task-board/compositions/task-board-empty-columns
```

## 行为 {#behavior}

- 列的顺序是 Todo（待办）、In Progress（进行中）、In Review（待确认）、Done（完成）、Closed（已关闭）。
- 用筛选栏右端的 Board / List 在看板和列表之间切换（[任务](../../../../../design/patterns/tasks.md#structure)），并记住这个人的选择。
- 整个看板在一个视口里横竖两个方向滚动。列保持宽度，从不单独滚动。
- 很长的列只挂载可见的卡片，用你自己的虚拟化组件读取看板的滚动位置，如下所示。

```example
task-board/compositions/task-board-virtualization
```

## 内容 {#content}

- 空文字的写法和列表里的空分组一样（[TaskList](../task-list/task-list.md#content)）。
- 卡片被拖到一个空列上方时，说出它将得到的状态，或者说明它不能移到那里。

## 无障碍 {#accessibility}

- 每一列是一个渲染为 `section` 的 Base UI `Collapsible`；它的触发按钮是一个带 `aria-expanded` 的按钮。
- 给每一列一个无障碍名称：触发按钮里的状态名，或者 section 上的 `aria-label`。
- 卡片可以用键盘移动：拖动部件使用 dnd-kit 的键盘传感器（Space 拿起，方向键移动，Space 放下，Escape 取消）。
- 在一个 polite 实时区域里播报每次移动："Task #25 moved to In Review"。看板不会自己播报。

## 规则 {#rules}

- 每个列标题都显示卡片数量，用 Space Mono。
