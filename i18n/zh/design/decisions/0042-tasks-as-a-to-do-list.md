---
title: 任务像待办清单一样用，有六种状态，状态变更不设限制
summary: 任务新增第六种状态 Backlog，它没有色相；任何状态都可以改成任何状态；每个任务都以圆形的完成控件开头，输入标题就能添加；负责人、审查和每个任务自己的讨论都保留。
sourceHash: a099cc7c
---

# 0042. 任务像待办清单一样用，有六种状态，状态变更不设限制

## 背景 {#context}

任务原来有五种状态（Todo、In Progress、In Review、Done 和 Closed），状态菜单只提供从当前状态允许的变更。完成一个任务要用菜单或拖动；添加一个任务要用 Create Task 对话框。任务 v2 的工作以 Google Tasks 为基准，要让任务在日常情况下像待办清单一样用：勾掉一个任务，输入下一个，把一个先放着留到以后。「先放着」没有去处：现在不打算做的任务要么留在 Todo 里，被算作当前要做的工作，要么被 Closed，而 Closed 的意思是不会做。

Raft 的任务还带着待办清单没有的东西：负责人可以是人，也可以是 Agent；Done 之前有一步审查；每个任务有自己的讨论。重新设计必须保留这些。

每种色相都已经有了含义（[颜色](../foundations/color.md#meanings-of-color)），灰色属于 Closed。

## 决定 {#decision}

- 第六种状态 Backlog（「现在不做」）放有人创建了、或者先放到一边、现在不打算做的工作。Closed 仍然是「不会做」。Backlog 不占用色相（[颜色](../foundations/color.md#statuses)）。它不算作当前要做的工作，它的分组默认收起。
- 任何状态都可以改成任何状态，人和 Agent 都可以，用状态菜单、详情里的 Status 属性、在看板上拖动或用完成控件都行；没有哪种状态要求先有负责人。移到 Backlog 时会请人填一个可选的原因，记录在历史和任务的讨论里。看板只会因为状态以外的原因拒绝一张卡片，比如这个人不能修改的任务。
- 每个任务行和卡片都以一个圆形的完成控件开头：点一下就把任务标为 Done（在 In Review 的任务上，这就是接受工作成果），在已完成的任务上点一下则把它重新打开为 Todo。
- 在频道的 Tasks 分区里，在 "Add a task" 里输入标题就能添加任务。Create Task 可以设置状态（Backlog、Todo 或 In Progress）和负责人。标题和描述在详情里就地编辑。

项目负责人（stdrc）于 2026-10-31 批准了用 raft-ui 0.55.0 做的高保真设计稿。

## 影响 {#consequences}

- 规则写在[任务](../patterns/tasks.md)、[颜色](../foundations/color.md#statuses)、[形状](../foundations/shape.md#principles)和任务组件的文档里。文档里每一处「五种状态」现在都写成六种。
- Agent 工作的顺序，先 In Review 再 Done，是 Raft 的 Agent 指南里的指引，不是产品强制的限制（[交接与审批](../people-and-agents/handoffs-and-approvals.md#handing-off)）。谁在什么时候移动了任务，仍然记在它的事件行和历史里。
- raft-ui 尚未实现：`TASK_STATUS_IDS`、`TaskStatusIcon` 和 `TaskChip` 只认识五种状态，也没有完成控件的部件。在 raft-ui 加上它们之前，产品要手工绘制 Backlog 的像素点和标签片，以及完成控件；文档里的示例（任务面板、任务卡片、看板、Create Task）显示的是这个决定之前的任务。raft-ui 的改动另外跟进。
- 圆形的完成控件是「圆形只用于开关、单选框和拖动条」的例外，记录在[形状](../foundations/shape.md#principles)和 [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md#rules) 里。
- 撤销这个决定：从状态列表和状态顺序里去掉 Backlog，恢复只列出允许变更的菜单，去掉完成控件和快速添加。没有别的东西依赖它们。

## 考虑过的其他方案 {#alternatives-considered}

- **给 Backlog 一种色相。** 每种色相都已经有含义，而灰色的像素点会读成 Closed。空心的像素点表示「还什么都没填」，不需要新的颜色。
- **保留状态变更的限制，再把 Backlog 加进去。** 菜单藏起一部分变更，人们要把任务放到它的工作实际所在的状态，就得绕远路；而且事件行和历史已经记录了每一次移动。
- **在行首放方形复选框。** 那里的方框读作「选中这一行」，用于批量操作；圆圈是待办清单的惯例，读作「完成」。
- **在服务器级的任务页面上快速添加。** 任务总是属于一个地方，而那个页面汇集了多个地方的任务，在那里添加的任务就没有所属的地方。

## 相关 {#related}

- [任务](../patterns/tasks.md)
- [颜色](../foundations/color.md#statuses)
- [Raft Chat — 任务](../products/raft-chat/tasks.md)
