---
title: Badge
summary: 小标签：最主要的是粉色的未读数和黄色的 @ 标记，另外还有浅色底标签和细线标签。
sourceHash: 6e83c97f
---

# Badge

Badge 是一个小标签。它的主要用途是未读数：一张粉色贴纸，表示有东西在等这个人。有人提及这个人时，换成黄色的 @ 标记，因为它更具体。Badge 的其他外观用来做浅色底标签和细线标签，状态标签和标签片都由它们搭成（[Status](../status/status.md)）。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 列表行或侧栏行上的未读消息；消息列的新回复；新动态 | 未读数：`variant="accent"`（`attention` 色）。侧栏里用 `SidebarItemCount`（[Sidebar](../sidebar/sidebar.md)） |
| 有人提及了这个人 | @ 标记：`variant="primary"`（`brand` 色）加 `at-sign` 图标。侧栏里用 `SidebarItemIndicator` |
| 已设为免打扰的地方有未读内容 | 用 Space Mono 写的灰色数字（`text-mono-meta`、`foreground-hint`），不用徽标 |
| 导航条图标、标签栏图标或铃铛上有东西在等 | 提醒圆点：一个粉色像素（[Status](../status/status.md)），永远不用数字 |
| 任务进行到哪一步，或 Agent 处于什么状态 | 状态标签：`TaskStatusBadge`（[Tasks](../tasks/tasks.md)），或带像素的浅色底 Badge（[Status](../status/status.md#agent-state-chips)） |
| 表明这是一个 Agent；它在哪里运行 | `agent` 标签和运行时标签片（[Status](../status/status.md#agent-tag)） |

## 结构 {#anatomy}

- `Badge`：标签本身。里面放一个数字、一个词，或一个图标加一个词。
- `Badge.Experimental`：预设，文字为 Experimental，让每个实验性界面显示同一个标签。

## 变体 {#variants}

| 外观 | 用于 |
| --- | --- |
| `appearance="solid"` | 贴纸：在等这个人的计数或标记，墨色边、墨色文字。未读数和 @ 标记 |
| `appearance="soft"` | 没有边框的浅色底标签：Agent 状态的状态标签、运行时标签片 |
| `appearance="outline"` | 用 Space Mono 的细线标签：`agent` 标签、任务标签片旁边的回复数 |

`variant` 选择颜色角色。按颜色的含义来选，不按外观来选（[颜色的含义](../../../../../design/foundations/color.md#meanings-of-color)）：在计数上，`accent` 是表示「待办」的粉色，`primary` 是表示「你」的黄色。

## 状态 {#states}

- 渲染成按钮的 Badge（`render={<button />}`）在悬停和按下时显示中档（彩色徽标上是 `sticker-medium`），禁用时用统一的禁用样式（[状态](../../../../../design/foundations/states.md)）。
- 选中的行不显示计数，也不显示 @ 标记（[状态](../../../../../design/foundations/states.md#usage)）。

## 内容 {#content}

- 只写数字，用 Space Mono。超过 99 写 99+。
- @ 标记里不要写数字：它只表示有人提及了这个人。

## 无障碍 {#accessibility}

Badge 渲染一个 `<span>`，不包装任何 Base UI 原语。

- 旁边没有文字的计数或 @ 标记，加上 `role="img"` 和说明含义的 `aria-label`："3 unread"、"Mentions you"。
- 渲染成按钮的 Badge，如果文字没说明操作，就加一个说出操作的 `aria-label`（"Open thread replies"）。

## 规则 {#rules}

- 每行最多一个徽标，和时间放在同一列。
- 一行同时有未读消息和提及时，只显示 @ 标记。
- 免打扰的地方用灰色数字，永远不用粉色贴纸：这个人已经选择不让它来叫自己。
- 导航条图标、标签栏图标和铃铛上只放提醒圆点，永远不放数字。
