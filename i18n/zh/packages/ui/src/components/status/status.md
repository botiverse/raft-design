---
title: Status
summary: 方形的状态像素点（在线状态灯、提醒圆点，或文字旁的状态色），以及用它构成的状态标签、Agent 标签和运行时标签片。
sourceHash: 06955a77
---

# Status

Status 是一个状态色的方形像素。单独使用时，它是在线状态灯或提醒圆点；放在文字旁边时，它是状态标签：一块浅色底，加一个像素和一个词，说明某件事进行到哪里，或某个 Agent 处于什么状态。任务状态标签是 `TaskStatusBadge`（[Tasks](../tasks/tasks.md)）；本文档介绍像素、Agent 状态的标签，以及跟在 Agent 名字后面的两个小标签片：`agent` 标签和运行时标签片。

```example
status/compositions/default
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 任务进行到哪里：在卡片上、属性中、详情中 | `TaskStatusBadge`（[Tasks](../tasks/tasks.md)） |
| 正文里提到的任务 | `TaskChip`（[Tasks](../tasks/tasks.md)） |
| Agent 或人的状态，显示在头像上 | 在线状态灯 `AvatarBadge`（[Avatar](../avatar/avatar.md)） |
| 用文字写出 Agent 的状态：资料卡、属性 | Agent 状态标签 |
| 文字旁边的状态色：分组标题、导航副标题、事件行 | Status |
| 有东西在等待，显示在没有地方放数字的图标上 | 提醒圆点：设 `variant="accent"` 的 Status |
| 一个 Agent 读过了提及它的消息 | 不是灯：一个青柠色的对勾，`MessageReferenceReadMark`（[MessageItem](../message-item/message-item.md#read-receipts-on-a-mention)） |
| 一个计数 | [Badge](../badge/badge.md) |
| 表示这是一个 Agent | `agent` 标签 |
| Agent 运行在什么上面 | 运行时标签片 |

## 结构 {#anatomy}

- `Status`：带墨色边的像素。`presence` 画出五种在线状态灯之一；`variant` 画出一种颜色角色。`size` 设定像素大小。

## 尺寸 {#sizes}

- **文字旁边的状态灯只有一种尺寸：10px**（`md`，默认值），带 1.5px 的墨色边：用在徽标、面板头部、侧栏行、列表行中。这些地方不要传 size。10px 是 7px 的颜色（多于分清绿、黄、橙所需的 6px）加两条 1.5px 的墨色边，大约等于旁边 14px 文字的大写字母高度。
- **状态灯是偶数，因为它所在的行是偶数。** 它所在的每一行、每一个盒子都是偶数像素（16px 到 24px 的行、20px 和 22px 的标签片、36px 的行），所以偶数的状态灯上下留白相等，落在整像素上。它取代的 9px 状态灯会多出半个像素，而屏幕无法把它平分：灯的上方比下方多一个设备像素，在 1x 屏上比中心低 0.5px，在 3x 屏上低 0.17px。由 stdrc 于 2026-10-22 决定，取代 [#670](https://github.com/botiverse/raft-design/pull/670) 的 9px。文字旁边的每一盏灯、每一个圆点都是同样的 10px：任务状态像素点、未读行的提醒圆点、通知或操作卡片的状态、时间线的标记。它们都不再是 9px。
- **头像上的状态灯跟随头像**，而不是跟随文字：`AvatarBadge` 随头像把它的尺寸设为 6px 到 20px（[Avatar](../avatar/avatar.md)），约为头像的三分之一，放在角上，而不是在一行里居中。27px 头像上的 9px 属于这个比例，不是文字旁边的状态灯，保持不变。
- 状态灯位于一行文字开头时，与第一行垂直居中对齐（[文字前的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。Badge 和 PanelActivity 会这样放置其中的 `Status`，并且无论传入什么尺寸都保持 10px；在其他地方，给它加 `className="lead-dot"`。
- 提示（轻提示、横幅、面板提示）从不用状态灯说明自己是哪一类提示（成功、信息、警告、错误）；它以意图对应的图标开头，讲的是某个人时用头像（[Banner](../banner/banner.md#variants)、[Toast](../toast/toast.md#variants)）。一种方形标记不能承载几种含义，而状态灯保留它自己的含义，也就是[何时使用](#when-to-use)里的那些：Agent、人或计算机是否在工作或在线，任务的状态，以及标出有事等待或未读的方形提醒圆点。讲的是其中某件事的提示，仍然可以在里面显示那件事的状态灯。
- `xs`、`sm` 和 `lg`（6px、8px 和 11px）不用于文字旁边的状态灯。`sm` 是图标角上的提醒圆点（侧栏导航项、服务器弹出层里的页面按钮）。

## 变体 {#variants}

### 在线状态灯 {#presence-lights}

| `presence` | 文字 |
| --- | --- |
| `online` | Online |
| `busy` | Working |
| `error` | Error |
| `offline` | Offline |
| `external` | External agent |

它们的颜色，以及五种任务状态的颜色，见[颜色](../../../../../design/foundations/color.md#statuses)。

### Agent 状态标签 {#agent-state-chips}

Agent 状态标签是一个浅色的 [Badge](../badge/badge.md)，里面放一个带对应 `presence` 的 Status 和上表中的文字。底色是状态灯颜色的浅色一级：Working 用 `brand-soft`，其他状态用同一色系的 `*-soft` 浅色底（[浅色底](../../../../../design/foundations/color.md#soft-tints)）。

### Agent 标签 {#agent-tag}

`agent` 标签跟在 Agent 的名字后面，里面写着 `agent` 这个词。它是一个描边的 [Badge](../badge/badge.md)：Space Mono 字体、`foreground-muted`，带细线边框。把文字换成 `users` 图标，同样的标签就用来显示成员数。

### 运行时标签片 {#runtime-chip}

运行时标签片写明 Agent 运行在什么上面：Claude Code、Codex。它是 `info-soft` 上的墨色 Space Mono 文字，带一个 `cpu` 图标。raft-ui 还没有对应的组件部分。

## 内容 {#content}

- 每个状态色都要配一个词。这个词用 Title Case：In Progress、Working。
- 标签片里的 ID 用 Space Mono：`#25`。

## 无障碍 {#accessibility}

Status 渲染一个 `<span>`，不封装任何 Base UI 原语。

- 像素旁边有对应文字时，对辅助技术隐藏像素（`aria-hidden`）。
- 旁边没有文字的像素，比如标签页或导航条项目上的提醒圆点，给它 `role="img"` 和一个说明其含义的 `aria-label`。

## 规则 {#rules}

- 饱和色只用在像素那么大的面积上。标签片上的其余部分是浅色底，即没有边框的高亮：一个界面上可能有十几个标签片。
- 每个标签片都是 22px 高，用 `radius-chip`，让标签片排成一行时对齐；Badge 和 TaskChip 已经是这样。
- 新的状态要归入五种任务状态或五种在线状态灯之一；不要发明新颜色。"Stuck"（卡住）是 Agent 的错误状态。"Needs you"（需要你）是一个提醒圆点加一个操作按钮，不是一种状态（[Tasks](../../../../../design/patterns/tasks.md#rules)）。
- 不要自定义 `--status-color`：每种状态色都有固定的含义。
- 状态永远不加动画：正在工作的 Agent 是一盏静止的灯（[动效](../../../../../design/foundations/motion.md)）。
