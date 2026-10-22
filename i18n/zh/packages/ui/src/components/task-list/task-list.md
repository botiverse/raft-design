---
title: TaskList
summary: 任务的列表视图：每种状态一个可折叠的分组，按状态顺序排列，每组里放任务卡片。
sourceHash: a3d6857d
---

# TaskList

TaskList 按状态给任务分组，每种状态一个可折叠的分组，顺序与 [TaskBoard](../task-board/task-board.md) 的列相同。它是手机上的默认视图。什么时候显示哪种视图、哪些分组默认折叠，见[任务](../../../../../design/patterns/tasks.md#rules)。

```example
task-list/compositions/task-list
```

## 何时使用 {#when-to-use}

| 情况                                   | 用                                      |
| ------------------------------------------- | ---------------------------------------- |
| 手机上或窄面板里的任务       | TaskList                                 |
| 按状态排列的任务，且放得下五列 | [TaskBoard](../task-board/task-board.md) |
| 一个任务                                    | [TaskCard](../task-card/task-card.md)    |

## 结构 {#anatomy}

- `TaskListRoot`：一摞分组。必需。
- `TaskSection`：一种状态。一个可折叠的部分。必需，每种状态一个。
  - `TaskSectionTrigger`：分组标题，用来折叠分组。
    - `TaskSectionChevron`：标题前的箭头。
    - `TaskSectionHeading`：`TaskSectionBadge`（状态像素点和名称）和 `TaskSectionCount`。
  - `TaskSectionPanel` 和 `TaskSectionItems`：卡片。
  - `TaskSectionEmpty`：空分组显示的文字。

## 状态 {#states}

| 状态       | 外观                                                                |
| ----------- | ------------------------------------------------------------------- |
| 折叠   | 只显示标题和数量                                 |
| 空分组 | 一个 `line-seam` 虚线框，里面一行 `foreground-hint` 文字 |

```example
task-list/compositions/task-list-empty-sections
```

## 行为 {#behavior}

- 所有分组在同一个视口里滚动。分组不单独滚动。
- 很长的分组只挂载可见的卡片：把 [VirtualList](../virtual-list/virtual-list.md) 作为视口，分组标题和卡片作为它的行，或者用你自己的虚拟化方案。

## 内容 {#content}

- 空分组写成 "No" + 状态 + "tasks"，状态的拼写和它的状态标签一致（[写作](../../../../../design/content/writing.md#voice)）："No In Review tasks."

## 无障碍 {#accessibility}

- 每个分组是渲染为 `section` 的 Base UI `Collapsible`；它的触发器是带 `aria-expanded` 的按钮，名称由它包含的状态和数量组成。
- 分组折叠时标题里也要显示数量，这样触发器仍然说明它藏了多少个任务。
