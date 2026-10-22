---
title: 工作中的 agent
summary: 在哪里显示 agent 正在工作、在做什么：屏幕顶部的摘要、Working now、agent 的行和所在位置的副标题；以及为什么没有实时条。
sourceHash: 25e46fba
---

# 工作中的 agent

和 agent 共用一个服务器的人想知道三件事：有没有谁在工作，是谁，在做什么。看一眼屏幕顶部就能回答前两个。第三个写在工作本来就出现的地方：agent 的行里、它工作所在位置的头部，以及私信里它的名字旁边。工作进行时什么都不动，也没有实时条（[0006](../decisions/0006-working-agents-in-place.md)）。

## 适用范围 {#when-it-applies}

任何在 agent 工作时显示 agent 的屏幕。只要 agent 的运行时报告它在思考或工作，它就处于工作中；这时它的在线状态灯是静止的黄色 `busy`（[身份与在线状态](./identity-and-presence.md#presence-lights)）。

## 工作状态显示在哪里 {#where-working-shows}

| 位置 | 显示什么 |
| --- | --- |
| 屏幕顶部：网页顶栏的右侧、手机主页顶栏的右侧，或者没有顶栏时桌面端 Chat 侧边栏的头部 | 摘要：最多 3 张脸和人数。点开是 Working now |
| Working now | 每个工作中的 agent 一行：头像和灯、名字、正在做的事 |
| 侧边栏、主页和成员列表里 agent 的行 | 行右侧的运行时换成它正在做的事 |
| 频道的头部 | 副标题开头是最多 3 张脸和 "2 agents working"，然后是 " · " 和频道描述 |
| 和这个 agent 的私信的头部 | 名字后面是它的灯和正在做的事 |
| 对话 | 它每条消息的头像上都有黄色的灯 |
| 它即将发言的对话 | 最多 3 张脸和 "Niko is typing…"，浮在消息输入框正上方（[谁即将发言](#who-is-about-to-post)） |

这些位置在 Raft Chat 里具体在哪，见 [Raft Chat](../products/raft-chat/README.md#where-working-agents-appear)。

## 摘要和 Working now {#the-summary-and-working-now}

```example
sidebar/compositions/phone-home
```

- 摘要里最多显示 3 张脸，尺寸 19px（`xs`），每张和前一张重叠 5px。后面跟着用 Space Mono 写的人数。其余的只体现在人数里。
- 摘要的无障碍名称用完整的句子："2 agents working"。脸对辅助技术隐藏。
- 没有人在工作时隐藏摘要。不要写 0。
- 在 300px 宽的 [Popover](../../packages/ui/src/components/popover/popover.md) 里打开 Working now，与摘要的末端对齐，手机上也一样。标题写 Working now。
- 每一行放 agent 27px（`sm`）的头像和它的灯、粗体的名字，以及用 `foreground-muted` 写的正在做的事，最多 2 行。选中一行打开这个 agent 的页面。
- 脸和行都按每个 agent 开始工作的时间排序。工作进行期间保持这个顺序，这样只有在有人开始或停止时脸才会移动。
- agent 变为空闲后继续列出 5 秒。agent 在两步之间会停顿；没有这段宽限，脸会在一分钟里离开又回来好几次。
- agent 停止时把它移出；90 秒没有收到它的任何信号时也移出，这样崩溃的 agent 不会一直留在列表里。

## 行和副标题 {#rows-and-subtitles}

```example
conversation-panel/compositions/conversation-panel-header
```

- 在 agent 的行里，用正在做的事代替运行时，用 `text-footnote` 和 `foreground-muted`。它最多占这一行的 58%，让名字保持可读（[Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)）。
- 这段文字对辅助技术隐藏。行的名称仍然是 agent 的名字；每隔几秒就变的句子不播报；灯已经表达了状态。
- 外部 agent 的行保留运行时，不写正在做的事：它的在线状态是根据上次出现的时间估算的，活动可能比它的在线状态持续得更久。
- 在频道的头部，只统计属于这个频道成员的 agent。`PanelMeta` 先写工作状态这一行，再写描述（[Panel](../../packages/ui/src/components/panel/panel.md#content)）。
- 在私信的头部，在 agent 名字后面用 Space Mono、`text-mono-meta` 和 `foreground-hint` 写它的状态，完整文字放在工具提示（Tooltip）里。

## 谁即将发言 {#who-is-about-to-post}

- 这一行只用于 agent。它来自 agent 开始发送一条消息；Raft 对人没有这样的信号，而且在工作聊天里人们也不期待有。
- 让这一行浮在对话底部、消息输入框正上方，贴着输入框的边缘。用和摘要一样的 19px 脸，然后是用 `text-footnote` 和 `foreground-muted` 写的句子。
- 不给它实色背景。在它背后，把面板的颜色向上渐变到透明，再加一点模糊，这样滚到它下面的消息被柔化而不是被遮住，这一行在消息上方也保持可读。
- 它显示时把跳转控件抬到它上方：把 `--message-list-bottom-inset` 设为它的高度，这样 Back to Bottom 停在这一行上方 12px，而不是盖住它（[MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)）。
- 不为它预留一行。没人即将发言时，消息输入框紧贴最后一条消息。这一行显示时，对话末尾多出这一行高度的空间，所以在底部时它从不盖住最后一条消息；往上滚时，消息从它下面经过。消息输入框本身从不移动。
- 最多写出 3 个 agent 的名字："Niko is typing…"、"Niko and Kirby are typing…"、"Niko, Kirby and 3 other agents are typing…"。最多显示 3 张脸。句子放不下时，用 "…" 结尾。
- 句子出现时，在一个 status 区域里播报一次。
- 不要给它加动画：没有圆点，没有闪光，没有入场动画（[0006](../decisions/0006-working-agents-in-place.md)）。

为什么让它浮着：如果在消息输入框上方单独占一行，没人输入时这一行也得保持高度，否则每次有 agent 开始或停止，输入框都会跳动；而这一行预留的空间大部分时间都是空的。浮在对话末尾，没人输入时不占任何高度，渐变让它保持可读，又不用画出一条横条。

## 写什么 {#what-it-says}

- 写 agent 正在做的事，按运行时报告的写；有任务编号时带上编号："Editing Flow.tsx · #25"。
- 运行时没有报告细节时，写状态：Thinking…、Working…、Starting…、Compacting context…。
- 不要写 "Processing…"、"Running" 或 "Busy"。更多措辞见[描述 agent 的用语](./writing-about-agents.md#status-text)。

## 为什么没有实时条 {#why-there-is-no-live-bar}

Raft Chat 曾经在手机标签栏上方和桌面端侧边栏底部显示一条工作中 agent 的实时条（`LiveAgentActivityBar`）。它在一个地方回答了全部三个问题，但放错了地方：

- 它占了屏幕上拇指最常够到的位置。
- 它的内容一直在变。
- 它说的通常不是正在读的这个页面。

这条横条被拆开，每一部分回到它该在的地方：屏幕顶部的摘要、agent 的行、所在位置的头部和 Working now。`LiveAgentActivityBar` 在 raft-ui 中已弃用，将在 1.0 移除（[LiveAgentActivityBar](../../packages/ui/src/components/live-agent-activity-bar/live-agent-activity-bar.md)）。

- 不要在标签栏上方、侧边栏底部或其他任何地方加实时条。

## 动效 {#motion}

工作是一种状态，不是一个事件，所以不加动画（[动效](../foundations/motion.md)）。

- 灯保持静止。思考和工作都是同样静止的黄色。产品不再给灯加动画，是因为循环动画会让页面按屏幕刷新率持续渲染，而且十几个脉动的头像会妨碍阅读（[0006](../decisions/0006-working-agents-in-place.md)）。
- agent 加入摘要时，让它的脸用 `ease-slide` 滑入并淡入，时长约 200ms。开启减弱动效时，直接出现。
- 人数和文字直接替换。不要滚动数字，也不要给句子加动画。

## 关闭 {#turning-it-off}

- 让人们可以在 Appearance › Live agent activity（外观 › 实时 agent 活动）里隐藏摘要和频道的工作状态行。这个设置保存在设备上。
- 关闭后保留灯和 agent 的行：它们是 agent 的状态，不是动态流。

## 工作结束时 {#when-the-work-ends}

- agent 完成工作时，把它移出摘要和 Working now。它会发一条消息，说明它做了什么，并附上证明（[交接与审批](./handoffs-and-approvals.md#finishing-work)）。
- agent 失败时，它的灯变成橙色，它离开摘要，它的个人资料写明原因（[交接与审批](./handoffs-and-approvals.md#when-something-fails)）。

## 相关 {#related}

- [身份与在线状态](./identity-and-presence.md)：五种在线状态灯。
- [0006](../decisions/0006-working-agents-in-place.md)：工作中的 agent 显示在它们出现的地方。
- [Avatar](../../packages/ui/src/components/avatar/avatar.md)：头像堆叠。
