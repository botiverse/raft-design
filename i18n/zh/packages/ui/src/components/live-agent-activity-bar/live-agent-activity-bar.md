---
title: LiveAgentActivityBar
summary: 位于标签栏上方或侧边栏底部、显示正在工作的 Agent 的实时条；已弃用，因为正在工作的 Agent 会在它们本来出现的地方显示。
sourceHash: b7f2b2ab
---

# LiveAgentActivityBar

LiveAgentActivityBar 是一条由头像、一盏状态灯和一行说明 Agent 在做什么的文字组成的条，放在手机标签栏上方或桌面端侧边栏底部。它已弃用，在 raft-ui 1.0 中移除，也没有单独一个组件来替代它。这条实时条占据了屏幕上人最常触及的位置，一直在变，而且说的通常不是正在阅读的这个页面（[0006](../../../../../design/decisions/0006-working-agents-in-place.md)）。它显示的内容现在回到 Agent 本来出现的地方，列在[正在工作的 Agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows) 中。

## 何时使用 {#when-to-use}

| 要显示 | 用 |
| --- | --- |
| 有没有人在工作，是谁 | 摘要行：一组叠放的头像（`AvatarGroup`，[Avatar](../avatar/avatar.md)）和一个数字，放在网页顶栏、手机的主页顶栏，或者没有顶栏时放在侧边栏头部 |
| 某个 Agent 在做什么 | 它自己那一行的右侧：[Sidebar](../sidebar/sidebar.md) 里的那一行，桌面端和手机都一样 |
| 某个地方有谁在工作 | 该地方标题栏的 `PanelMeta` 行（[Panel](../panel/panel.md#content)） |
| 对话里某个 Agent 正在工作 | 它头像上那盏不闪烁的黄灯（[MessageItem](../message-item/message-item.md)） |
| 所有正在工作的 Agent | Working now（正在工作）：从摘要打开的列表，放在 [Popover](../popover/popover.md) 里，手机上也一样 |
