---
title: Timeline
summary: 按顺序列出发生过的事：任务的历史用任务状态的颜色和平实的文字，Agent 的活动日志用在线状态的颜色和 Space Mono。
sourceHash: 2a2b1bea
---

# Timeline

Timeline 按顺序列出发生过的事。每一步是细线上的一个状态像素点，带标题和时间。它有两种用途：任务的 History，用任务状态的颜色和平实的文字；Agent 的活动日志，用在线状态灯的颜色和 Space Mono。

```example
timeline/compositions/preview
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 任务的 History，在任务详情里折叠在属性下方 | Timeline（[用现有部件组合](../../../../../design/components/overview.md#task-details)） |
| Agent 做了什么（[交接与审批](../../../../../design/people-and-agents/handoffs-and-approvals.md#the-record-afterwards)） | Timeline，作为活动日志 |
| 人要走过的一个流程的各个步骤 | [Steps](../steps/steps.md) |
| 关于一个条目的事实，而不是事件 | [DescriptionList](../description-list/description-list.md) |
| 对话里的消息和事件行 | 对话里的 [SystemMessage](../system-message/system-message.md)（[对话](../../../../../design/patterns/conversation.md)） |

## 结构 {#anatomy}

- `Timeline`：有序列表。必需。
- `TimelineItem`：一步，带标记和通往下一步的线。必需。
  - `TimelineTitle`：发生了什么。必需。
  - `TimelineContent`：一行 Space Mono 的详情：一个 commit、文件数。可选。
  - `TimelineTime`：时间，用 Space Mono，在第一行的右端。可选。

只有标题和时间共用第一行。下面的详情占满条目的整个宽度：时间只为第一行保留它那一栏，如果让详情也排在它旁边，详情就会被一个从不与它相邻的时间挤窄；在手机上，那几乎是整行。没有标题的条目保持一行，这时详情才排在时间旁边。

长标题和长时间仍会在第一行上争空间，因为时间不换行。在栏宽较窄的地方，时间要写短。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 任务历史：每个条目设置 `taskStatus` | 像素点表示这一步之后任务的状态，用对应的 `task-status-*` 颜色 |
| 活动日志：每个条目设置 `color`（或 `variant`） | 像素点用在线状态灯的颜色：工作中用 `presence-busy`（黄色），出错用 `presence-error`（橙色），完成用青柠色（`success`） |
| 条目上设置 `icon` | 用图标代替像素点，颜色同条目，用于需要图标的步骤 |
| `itemPlacement="right"` | 标记在右侧，文字向标记对齐 |
| `horizontal` | 排成一行的一小串里程碑 |

```example
timeline/compositions/icon
```

```example
timeline/compositions/placement
```

```example
timeline/compositions/horizontal
```

## 内容 {#content}

### 任务历史 {#task-history}

- 每个标题写成谁做了什么，名字加粗："**Bugen** claimed it"、"**Bugen** moved it to In Review"。
- 依据放在详情行里："commit c41e09 · 4 files changed"。

### 活动日志 {#activity-log}

- 标题和详情都用 Space Mono：日志是机器写的（[字体排印](../../../../../design/foundations/typography.md#principles)）。
- 由 subagent 完成的步骤，加一个 `subagent` 标签。
- 只写 Agent 做了什么。不要显示它的提示词或输出。

## 无障碍 {#accessibility}

- `Timeline` 渲染原生的 `ol`，每个 `TimelineItem` 渲染 `li`，所以顺序和步骤数会被读出。raft-ui 没有引入 Base UI 的基础组件。
- 标记和线对辅助技术隐藏。颜色带有含义时，标题里也要写出来："moved it to In Review"、"failed: CI"。

## 规则 {#rules}

- 不要让时间线可点击。要前往某一步涉及的对象，就在标题里链接那个对象：任务、commit、文件。
- 失败的步骤用橙色标记（`warning`，日志里用 `presence-error`），不用 `danger`：红色只用于不可撤销的后果（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
