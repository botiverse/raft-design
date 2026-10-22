---
title: ThreadPanel
summary: 一个消息列的侧面板：标题栏写明它是什么，下面是原始消息、回复和消息输入框，没有标签页。
sourceHash: 7d4a8d5a
---

# ThreadPanel

ThreadPanel 在一条消息所属的对话旁边显示对它的回复。它不是窄一点的对话面板：它的标题栏写明这个消息列以及它在哪里，原始消息放在最前面，而且没有标签页。

```example
thread-panel/thread-panel
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 对一条消息的回复，在对话旁边阅读 | ThreadPanel |
| 对话本身 | [ConversationPanel](../conversation-panel/conversation-panel.md) |
| 对话旁边的任务、文件或个人资料 | 带 `edge="attached"` 的 [Panel](../panel/panel.md) |
| 如何从一条消息进入消息列 | [MessageReplies](../message-replies/message-replies.md) |

## 结构 {#anatomy}

- `ThreadPanelRoot`：面板本身。它是带 `edge="attached"` 的 `Panel`，所以自己画左侧的接缝线。
- `ThreadPanelHeader`：56px 的标题栏，基于 `PanelHeaderRoot` 构建。
  - `ThreadPanelTitle`：标题 "Thread"，后面是说明消息列位置的 `ThreadPanelTitleMeta`。
  - `ThreadPanelActions`：`PanelAction` 按钮。最后一个是 ×（[导航](../../../../../design/patterns/navigation.md#closing)）。
- `ThreadPanelContent`：标题栏下面的所有内容。
  - `ThreadPanelSearch`，带 `ThreadPanelSearchTrailing` 和 `ThreadPanelSearchCount`：可选的一行，用于在消息列内搜索。
  - `ThreadPanelOriginalMessage`：消息列所回复的那条消息，下方一条细线。这条细线是一条分界：它在消息最后一行下方一个分段档（24px）处，回复从它下方一个分段档处开始（`ThreadPanelReplySummary`）（[时间线节奏](../../../../../design/foundations/spacing.md#timeline-rhythm)）。
  - `ThreadPanelBody`：可滚动的回复。`ThreadPanelReplySummary` 和 `ThreadPanelReplyCount` 位于回复列表的开头。
  - `ThreadPanelFooter`：消息输入框（[Composer](../composer/composer.md)），上方不加自己的空白，和 [ConversationPanel](../conversation-panel/conversation-panel.md#anatomy) 里一样。

## 行为 {#behavior}

- 消息列和个人资料可以同时打开：从消息列打开的个人资料放在它旁边，从对话打开的个人资料会替换它（[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)）。
- 它的宽度见[间距](../../../../../design/foundations/spacing.md#layout-widths)。什么时候放在对话旁边、什么时候盖住对话，由产品规则决定（[Raft Chat](../../../../../design/products/raft-chat/README.md)）。
- 在手机上，消息列是推入页面：同一个面板盖住对话，用 Back 代替 ×，标签栏保持隐藏，和在对话里一样（[响应式布局](../../../../../design/patterns/responsive.md)）。在桌面端，旁边放不下时，它也同样盖住对话。

## 内容 {#content}

- 面板标题写 "Thread"。
- 在标题栏里写明消息列在哪里、有几条回复："#launch-week · 3 replies"。

## 无障碍 {#accessibility}

- `ThreadPanelRoot` 渲染为 `section`。用 `aria-label="Thread"` 给它命名。
- `ThreadPanelTitle` 渲染为 `h2`。
- 每个只有图标的操作都要有 `aria-label`："Search in Thread"、"Close Thread"。

## 规则 {#rules}

- 不要给消息列加标签页。它只放原始消息、回复和消息输入框，别的都不放。
- 原始消息上方留 20px。悬停工具栏压在消息的上边缘（[MessageItem](../message-item/message-item.md)）；原始消息是滚动区域里的第一项，空间不够时工具栏会被截掉，看起来像钉在标题栏下面。
- 原始消息和回复之间用 `line-hairline` 分隔，不用接缝线：两者都是同一个面板里的内容。
