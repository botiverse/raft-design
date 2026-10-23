---
title: LegacyTaskPanel
summary: 基于消息列面板构建的只读任务详情面板；已弃用，因为任务详情改为用对话框加描述列表。
sourceHash: e30afe5c
---

# LegacyTaskPanel

LegacyTaskPanel 把任务的详情排成一个侧面板：顶部是带任务标题的标题栏，下面是字段、状态和元信息行，基于 [ThreadPanel](../thread-panel/thread-panel.md) 构建。没有产品在用它，它会在 raft-ui 1.0 中移除。任务详情改为居中的 [Dialog](../dialog/dialog.md)，属性放在 [DescriptionList](../description-list/description-list.md) 里，历史记录放在折叠的 [Timeline](../timeline/timeline.md) 里；怎样组装见[用现有部件搭建](../../../../../design/components/overview.md#task-details)，对话框的尺寸见[任务](../../../../../design/patterns/tasks.md#structure)。

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 任务的详情 | [Dialog](../dialog/dialog.md)，按[用现有部件搭建](../../../../../design/components/overview.md#task-details)中的方式组装 |
| 任务的属性：Status、Assignee、Created by | [DescriptionList](../description-list/description-list.md) |
| 任务经历了什么 | 折叠的 [Timeline](../timeline/timeline.md) |
| 列表或看板里的一个任务 | [TaskCard](../task-card/task-card.md) |
