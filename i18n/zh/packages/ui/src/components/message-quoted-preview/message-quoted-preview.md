---
title: MessageQuotedPreview
summary: 链接所指消息的两行摘录，带作者、发布位置和时间，显示在包含该链接的消息下方。
sourceHash: 0a53a279
---

# MessageQuotedPreview

当一条消息链接到另一条消息时，引用预览会显示那条消息的内容：作者、发在哪里、什么时候，以及正文的前 2 行。它放在 `MessageItemEmbedded` 里，位于包含链接的正文下方（[MessageItem](../message-item/message-item.md)），点击后打开被引用的消息。

```example
message-quoted-preview/compositions/quoted-preview
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 一条消息链接到另一条消息 | MessageQuotedPreview，放在引用标签片下方 |
| 完整转发的几条消息 | [MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md) |
| 指向 Raft 以外页面的链接 | 链接卡片（[MessageEmbed](../message-embed/message-embed.md)） |
| 在消息里输入的引用 | Markdown 引用块（[MessageItem](../message-item/message-item.md#in-the-body)） |
| 一条消息的回复 | [MessageReplies](../message-replies/message-replies.md) |

## 结构 {#anatomy}

- `MessageQuotedPreview`：预览本身：左侧一条 2px 的 `line-seam` 竖条，无填充，文字用 `foreground-muted`。必需。
- `MessageQuotedPreviewHeader`：一行。必需。
  - `MessageQuotedPreviewAuthor`：一个 `xs` 尺寸的 [Avatar](../avatar/avatar.md)、`MessageQuotedPreviewAuthorName`，以及可选的 `MessageQuotedPreviewAuthorMeta`（角色）。被引用的消息由助手替作者发送时，名字后面跟着 `MessageQuotedPreviewAuthorDelegatedBy`："(sent by Friday)"。它是实验性的，从 `@botiverse/raft-ui/wip` 导出。
  - `MessageQuotedPreviewChannel`：发在哪里。
  - `MessageQuotedPreviewThread`：消息列标记。可选。
  - `MessageQuotedPreviewTimestamp`：在行末，用 Space Mono。
- `MessageQuotedPreviewContent`：必需。
  - `MessageQuotedPreviewText`：摘录，用 `text-callout`，截断到 2 行。
  - `MessageQuotedPreviewAttachments` 加若干 `MessageQuotedPreviewAttachment` 标签片。可选。
- `MessageQuotedPreviewLoading` 和 `MessageQuotedPreviewUnavailable`：在预览加载中或无法显示时代替预览。

这条竖条和消息里引用的标记是同一个（[形状](../../../../../design/foundations/shape.md#stroke-widths)）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 频道消息 | 频道里的消息；如果是消息列里的回复，带上 `MessageQuotedPreviewThread` |
| 私信 | 私信里的消息；如果是消息列里的回复，带上消息列标记 |
| 已归档频道 | 已归档频道里的消息：频道名后面加一个 Archived [Badge](../badge/badge.md) |
| 带附件 | 带文件的消息：2 行文字下方始终显示一个写着数量的标签片 |

```example
message-quoted-preview/compositions/quoted-preview-message
```

```example
message-quoted-preview/compositions/quoted-preview-direct-message
```

```example
message-quoted-preview/compositions/quoted-preview-direct-message-thread
```

```example
message-quoted-preview/compositions/quoted-preview-archived-channel
```

```example
message-quoted-preview/compositions/quoted-preview-long-content
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 加载中 | `MessageQuotedPreviewLoading`，带脉动效果，用 [Skeleton](../skeleton/skeleton.md) 显示头部和 2 行文字 |
| 不可用 | `MessageQuotedPreviewUnavailable`：竖条加一行 `foreground-hint` 文字说明原因，用于消息已删除或这个人无权查看时 |

```example
message-quoted-preview/compositions/quoted-preview-loading
```

```example
message-quoted-preview/compositions/quoted-preview-unavailable
```

## 行为 {#behavior}

- 预览占满消息栏的宽度。
- 超过 2 行的文字用省略号截断；附件标签片留在下方。
- "(sent by Friday)" 永远不截断，截断的是作者名字。作者和这个标签占满一行时（比如在手机上），位置和时间移到第二行：说明消息不是作者本人写的，靠的就是这几个字，所以不能截掉；而时间线里表明这一点的那张脸太小，放在 19px 的头像上显示不出来（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)）。

```example
message-quoted-preview/compositions/quoted-preview-delegated
```

- 选择预览会打开被引用的消息。

## 内容 {#content}

- 频道名带井号："#launch-week"。
- 私信用对方的显示名称，用 `DirectMessageIcon` 代替井号。
- 消息列标记的标签写 Thread。
- 时间用 Space Mono，带上日期："Today · 8:24 AM"、"May 4 · 3:16 PM"。
- 在标签片里写出附件数量："2 files"。
- 说明消息为什么无法显示："Message unavailable"（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。

## 无障碍 {#accessibility}

- 这些部件是用 Base UI `useRender` 构建的普通元素；`MessageQuotedPreview` 是一个 `div`。
- 预览会打开消息时，把它渲染成 `<a>`，加一个说明是哪条消息、在哪里的 `aria-label`："Open quoted message in #launch-week"。键盘聚焦时显示焦点环。
- 作者头像的 `alt` 留空：旁边的名字已经说明是谁。
- 给 `MessageQuotedPreviewLoading` 加 `aria-busy` 和 `aria-label`，比如 "Loading quoted message"。
- 不要把 `MessageQuotedPreviewUnavailable` 渲染成链接：没有东西可以打开。

## 规则 {#rules}

- 只渲染被引用消息有数据的部件：没有消息列标记、角色或附件时，就不放。
- 加载用的骨架屏做成预览的形状，这样加载完成时不会跳动（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。
