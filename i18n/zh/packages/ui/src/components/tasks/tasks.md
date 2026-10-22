---
title: Tasks
summary: 所有任务视图共用的部件：显示任务进行到哪一步的状态徽标和任务标签片、状态像素点，以及任务面板的外壳。
sourceHash: bba3bb86
---

# Tasks

这些是所有任务视图共用的部件。`TaskStatusBadge` 把任务的状态写成一个状态标签：状态的浅色底、它的像素和它的名称。`TaskChip` 是同样的标签片，只是里面装的是一个任务：消息下方的任务标记，或正文里提到的任务。`TasksPanelRoot` 和它的部件是任务页面的外壳。五种状态以及任务怎么显示，见[任务](../../../../../design/patterns/tasks.md)；它们的颜色见[颜色](../../../../../design/foundations/color.md#statuses)。

```example
tasks/compositions/task-status
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 任务的状态：在卡片上、属性里、详情里 | `TaskStatusBadge` |
| 消息下方的任务 | 消息底部的 `TaskChip`（[MessageItem](../message-item/message-item.md)） |
| 正文里提到的任务 | `variant="inline"` 的 `TaskChip` |
| 词旁边用一个像素表示的任务状态 | `TaskStatusIcon` |
| 一个任务页面或任务标签页 | 带工具栏和视口的 `TasksPanelRoot` |
| 看板上或列表里作为一行的任务 | [TaskCard](../task-card/task-card.md) |
| agent 处于什么状态 | agent 状态标签（[Status](../status/status.md#agent-state-chips)） |

## 结构 {#anatomy}

- `TaskStatusBadge`：带状态像素点和状态名称的 `TaskChip`，名称由调用方提供。
- `TaskChip`：标签片。`status` 设置它的浅色底。子元素依次是状态图标、任务编号、负责人。
- `TaskStatusIcon`，以及 `TaskTodoIcon`、`TaskInProgressIcon`、`TaskInReviewIcon`、`TaskDoneIcon`、`TaskClosedIcon`：状态像素点。
- `TasksPanelRoot`：任务页面的那一列。
  - `TasksPanelToolbar`：顶部的栏，下面有一条接缝线。里面放 `TasksPanelToolbarNewTask`、`TasksPanelToolbarFilters` 和 `TasksPanelToolbarView`（Board / List），并在窄屏上排好它们。其他内容用 `TasksPanelToolbarGroup` 和 `TasksPanelToolbarLabel`。
  - `TasksPanelViewport`：滚动的内容：一个 [TaskBoard](../task-board/task-board.md) 或一个 [TaskList](../task-list/task-list.md)。
  - `TasksPanelEmpty`：没有任务时放一个 [EmptyState](../empty-state/empty-state.md)。
- `TaskLoadingList`、`TaskLoadingRow`：任务加载时的占位行。
- `taskStatusSoft`、`taskStatusStrong` 和 `TASK_STATUS_IDS`：用同一组 `task-status-*` token 搭建其他状态界面的配方。

```example
tasks/compositions/tasks-panel
```

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 单独出现的标签片：消息下方、卡片上、详情行里 |
| `variant="inline"` | 正文里的标签片；它跟随周围文字的大小 |
| `size="sm"` | 和小徽标排在同一行的默认标签片，比如动态条目的元数据行 |

```example
task-chip/compositions/task-chip-variants
```

```example
task-chip/compositions/task-chip-in-footer
```

```example
task-chip/compositions/task-chip-in-markdown
```

```example
task-chip/compositions/task-chip-sizes
```

## 状态 {#states}

- **加载中**：在解析任务期间，`loading` 让 `TaskChip` 变暗并忽略鼠标指针。
- **面板加载中**：`TaskLoadingList`，和它所代表的卡片一样大（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。
- **没有任务**：`TasksPanelEmpty`，没有任务时显示一种空状态，筛选条件没有匹配结果时显示另一种。
- **加载失败**：在面板范围内显示错误，带 Retry。

```example
task-chip/compositions/task-chip-statuses
```

```example
tasks/compositions/tasks-empty-states
```

```example
tasks/compositions/tasks-error
```

## 行为 {#behavior}

- 任务卡片上的状态标签做成按钮，点开状态列表，名称后面带一个向下的箭头（[TaskCard](../task-card/task-card.md)）。其他改状态的方式见[任务](../../../../../design/patterns/tasks.md#rules)。
- 消息下方的任务标记点开后打开这个任务。

## 内容 {#content}

- 状态写作 Todo、In Progress、In Review、Done 和 Closed（中文界面为待办、进行中、待确认、完成、已关闭）。`TaskStatusBadge` 没有内置标签：由调用方传入并翻译。
- 任务编号用 Space Mono：`#25`（[字体排印](../../../../../design/foundations/typography.md#usage)）。
- 在任务标记里，先写编号，再写负责人：`#25` @Bugen。

## 无障碍 {#accessibility}

这些部件都不包装 Base UI 原语；`TaskChip` 渲染一个 `<span>`，除非 `render` 把它变成链接或按钮。

- 状态像素点对辅助技术隐藏。始终传入状态名称，或者让任务编号紧挨着它。
- 能打开任务的任务标记渲染成 `<a>` 或 `<button>`，如果文字没说明它打开什么，就加一个说明的 `aria-label`（"Open task #25"）。`title` 不是无障碍名称。

## 规则 {#rules}

- 任何显示任务状态的新界面，都用 `taskStatusSoft` 和 `taskStatusStrong` 搭建，这样一种状态在哪里都是同一种颜色。
- 不要给标签片加边框：浅色底是高亮，不是贴纸（[Status](../status/status.md#rules)）。
