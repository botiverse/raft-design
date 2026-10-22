---
title: MessageReplies
summary: 消息下方的消息列摘要：一块灰色区域，显示回复数、粉色的新回复数和最多 3 条预览，整块作为一个控件打开消息列。
sourceHash: 1dd495e3
---

# MessageReplies

消息下方的消息列摘要：一块浅灰色区域，写出有多少条回复，有新回复时显示粉色计数，并预览最新的几条回复。整块是一个控件，点击打开消息列。

```example
message-replies/compositions/default
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 一条消息在消息列里有回复 | MessageReplies，放在消息正文下方 |
| 正文里指向某个消息列的链接 | 引用标签片（[MessageItem](../message-item/message-item.md#in-the-body)） |
| 消息列本身 | [ThreadPanel](../thread-panel/thread-panel.md)：桌面端放在对话旁边，手机上盖住对话、带返回（[对话](../../../../../design/patterns/conversation.md#threads)） |

## 结构 {#anatomy}

- `MessageReplies`：整块区域。默认是 `button`；消息列有 URL 时渲染成链接。必需。
- `MessageRepliesSummary`：第一行。必需。
  - `MessageRepliesSummaryItem`：其中的一项信息："4 replies"、"1 new"、"Draft"。渲染成 `strong` 时，它就是粉色的新回复计数。
- `MessageRepliesItem`：一条回复预览，最多 3 条：
  - 一个小 [Avatar](../avatar/avatar.md)；
  - `MessageRepliesItemSender`：名字；
  - `MessageRepliesItemContent`：回复的开头部分；
  - `MessageRepliesItemTime`：发送时间，用 Space Mono。

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 没有新回复 | 摘要用 `foreground-muted` |
| 有新回复 | 摘要用墨色，新回复数显示为粉色贴纸 |
| 消息列里有草稿 | 摘要里有一项 Draft |

```example
message-replies/compositions/single-unread
```

```example
message-replies/compositions/unread-draft
```

## 行为 {#behavior}

- 选择整块区域的任意位置都会打开消息列。这块区域是用来读的，所以悬停用浅档，按下用中档（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。
- 这块区域与消息文字对齐，最宽 480px。
- 每条预览只占一行：内容截断，名字和时间保留。

## 内容 {#content}

- 数量写成 "1 reply" 或 "4 replies"，新回复数写成 "1 new"。
- 摘要里的各项用中间点分隔。
- 显示最新的回复，最多 3 条（[对话](../../../../../design/patterns/conversation.md#structure)）。

## 无障碍 {#accessibility}

- `MessageReplies` 是一个 `button` 或链接；里面的东西都不可聚焦。
- 给它一个说明打开哪个消息列的 `aria-label`，比如 "Open the #launch-week checklist thread"：它的内容很长，否则会被整段读出来。
- 分隔符和末尾的 V 形箭头对辅助技术隐藏（`aria-hidden`）。
- 每个 `MessageRepliesItemTime` 渲染时带上 `dateTime`。

## 规则 {#rules}

- 这块区域放在 `fill-muted` 上，不加边框：它是消息的一部分，不是卡片。
- 新回复显示为粉色计数、墨色文字，和所有未读计数一样（[状态](../../../../../design/foundations/states.md)）。消息列回复不要用别的颜色。
