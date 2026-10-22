---
title: MessageForwardedBundle
summary: 消息下方的一张卡片，装着从另一个对话转发来的一条或多条消息，带作者、时间和附件，内容太长时折叠。
sourceHash: 35e24625
---

# MessageForwardedBundle

一张装着某人转发的消息的卡片：顶部是 Forwarded 标题，带条数和来源，下面是每条消息，带作者、时间、文字和附件。它基于 [MessageEmbed](../message-embed/message-embed.md) 构建，放在 `MessageItemEmbedded` 里，位于转发它的那条消息的正文下方（[MessageItem](../message-item/message-item.md)）。内容长的转发会自动折叠。

```example
message-forwarded-bundle/compositions/forwarded-bundle
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 从另一个对话转来的一条或多条消息 | MessageForwardedBundle |
| 指向一条消息的链接，显示为摘录 | [MessageQuotedPreview](../message-quoted-preview/message-quoted-preview.md) |
| 文字中行内的、指向消息或频道的链接 | 引用标签片（[MessageItem](../message-item/message-item.md#in-the-body)） |
| 在消息里手动输入的引用 | Markdown 引用块（[MessageItem](../message-item/message-item.md#in-the-body)） |

## 结构 {#anatomy}

- `MessageForwardedBundle`：卡片本身。必需。
- `MessageForwardedBundleHeader`：顶部那一行；栏宽窄时会换行。必需。
  - `MessageForwardedBundleHeaderContent`，内含 `MessageForwardedBundleHeaderLabel`（一个图标和 Forwarded）和 `MessageForwardedBundleHeaderCount`（Space Mono，`foreground-hint`）。
  - 来源，放在这一行末尾：可以打开时用 `MessageForwardedBundleSource`，不能打开时用 `MessageForwardedBundleSourceLabel`。可选。
- `MessageForwardedBundleItems`：消息列表，也是会折叠的部分。必需。
- `MessageForwardedBundleItem`：一条转发的消息。至少 1 条。
  - `MessageForwardedBundleItemMeta`：`MessageForwardedBundleItemAuthor`，后面是 Space Mono 的时间。
  - `MessageForwardedBundleItemContent`：文字。必需：折叠只测量这一部分。
  - `MessageForwardedBundleAttachments`：`MessageForwardedBundleAttachment` 标签片（`MessageForwardedBundleAttachmentName`、`MessageForwardedBundleAttachmentMeta`），以及 `MessageForwardedBundleGallery`，每张图片一个 `MessageForwardedBundleGalleryTile`。可选。
- `MessageForwardedBundleFooter` 加 `MessageForwardedBundleFooterAction`：展开列表的操作。可选。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 几条短消息 | 常见情况：完整显示，没有底部栏 |
| 内容很长 | 文字超过折叠上限：列表折叠，出现底部栏 |
| 可以打开的来源（`MessageForwardedBundleSource`） | 人可以打开的来源，例如公开频道或其中的消息列 |
| 静态来源（`MessageForwardedBundleSourceLabel`） | 不能打开的来源，例如消息输入框里的预览，或已经不存在的消息 |
| `fullWidth` | 卡片要占满整栏、不保持最大宽度的地方 |

```example
message-forwarded-bundle/compositions/forwarded-bundle-compact
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-long-content
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-thread
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-static-source
```

## 行为 {#behavior}

- 卡片最宽 544px，栏更窄时随之变窄。
- 默认由转发卡片自己折叠：所有条目的文字加起来超过 `foldLineLimit` 行（8 行）时，列表在这个高度截断，底部渐隐到 `layer-card`。
- 底部栏只在列表折叠时出现。它的操作可以展开列表，也可以再次折叠；展开时用 `expandedContent` 作为它的标签。
- 内容加载进来或宽度变化时，卡片会重新测量。人一旦手动折叠或展开过，就保持他留下的样子，除非内容已经不需要折叠。
- 想自己控制折叠时，给 `MessageForwardedBundleItems` 传 `collapsed`，例如显示全部内容的详情视图。这时底部栏总是渲染，标签由你来写。
- 要让底部栏的操作打开详情视图而不是展开，在它的 `onClick` 里调用 `preventDefault`。
- `MessageForwardedBundleGallery` 把图片排成每行 3 张，4 张图片排成 2 行、每行 2 张，尺寸与消息自身的图库相同（[MessageAttachment](../message-attachment/message-attachment.md)）。

## 内容 {#content}

- 标题写 Forwarded，条数用 Space Mono："3 messages"。
- 来源写成 "from #launch-week"，是消息列时加 "· thread"。
- 只在人有权查看时显示来源；私信、私有频道或来源缺失时不显示。
- 每个作者用显示名称，不用用户名（handle）（[写作](../../../../../design/content/writing.md#voice)）。
- 底部栏的操作用 Title Case 写明它做什么：Show All 6 Messages，然后是 Collapse。
- 每个附件标签片写文件名和类型："release-notes.md · markdown"。

## 无障碍 {#accessibility}

- 这些部件是用 Base UI `useRender` 构建的普通元素；每个 `MessageForwardedBundleItem` 是一个 `<article>`。
- `MessageForwardedBundleSource` 是一个 `<button>`。用于跳转时，把它渲染成 `<a>`，`aria-label` 写明目的地："Open source thread in #launch-week"。
- 由卡片自己控制折叠时，`MessageForwardedBundleFooterAction` 会设置 `aria-expanded`。使用 `collapsed` 时，需要自己设置。
- 每条消息的时间放在带 `dateTime` 的 `<time>` 元素里。
- `MessageForwardedBundleAttachment` 上的 `interactive` 只加上悬停和聚焦的样式。把标签片渲染成能打开文件的 `<button>` 或 `<a>`，并加上 `aria-label`，例如 "Open release-notes.md"。
- 图库图片的 `alt` 按 [MessageAttachment](../message-attachment/message-attachment.md#accessibility) 的规则写。

## 规则 {#rules}

- 每条消息的文字都要包在 `MessageForwardedBundleItemContent` 里：放在外面的文字不会被测量，卡片也就不会折叠。
- 不要渲染没有条目的转发卡片。
