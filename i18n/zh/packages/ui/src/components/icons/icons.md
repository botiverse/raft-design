---
title: Icons
summary: raft-ui 自己绘制的四个对话图标：Message、Chat、Direct Message 和 Thread；其他图标都来自 Lucide。
sourceHash: 67c17047
---

# Icons

raft-ui 自己导出四个表示对话类型的图标：`MessageIcon`、`ChatIcon`、`DirectMessageIcon` 和 `ThreadIcon`。Raft 里的其他图标都来自 Lucide。所有图标的规则（图标集、描边、颜色和不同场景下的尺寸）见[图标](../../../../../design/foundations/iconography.md)。

```example
icons/icons
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 用图标表示消息、聊天、私信或消息列 | `MessageIcon`、`ChatIcon`、`DirectMessageIcon`、`ThreadIcon` |
| 任务的状态 | `TaskStatusIcon`（[Tasks](../tasks/tasks.md)） |
| 其他任何图标 | 同名的 Lucide 图标（[图标](../../../../../design/foundations/iconography.md#principles)） |
| Agent | 它的像素头像（[Avatar](../avatar/avatar.md)），不用图标 |
| 名称旁边的频道或其他地方 | 频道图块（[IconTile](../icon-tile/icon-tile.md)） |

## 结构 {#anatomy}

- `MessageIcon`：一个对话气泡。
- `ChatIcon`：带三个点的对话气泡。
- `DirectMessageIcon`：带一个人像的对话气泡。
- `ThreadIcon`：两个重叠的对话气泡，前面那个是实心的。

每个都是 18px 的 `svg`，用 `currentColor` 绘制，所以会继承周围文字的颜色。按所在的场景用 class 设置尺寸（[图标](../../../../../design/foundations/iconography.md#sizes)）。

## 无障碍 {#accessibility}

- 这些图标对辅助技术隐藏（`aria-hidden`），也不能获得焦点。由周围控件的文字或 `aria-label` 说明它们代表什么。
- 如果按钮里只有一个这样的图标，给按钮加 `aria-label`：Open Thread。

## 规则 {#rules}

- 不要添加自己绘制的图标。新图标都来自 Lucide（[图标](../../../../../design/foundations/iconography.md#principles)）；只有这四个是自己绘制的。
