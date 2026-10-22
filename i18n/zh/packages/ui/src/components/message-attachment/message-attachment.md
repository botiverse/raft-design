---
title: MessageAttachment
summary: 消息附带的文件、图片和视频：文件是一张卡片，带名称、大小和一个操作；图片和视频直接显示在消息里。
sourceHash: 7319ebe1
---

# MessageAttachment

消息附带的东西。文件是一张卡片：名称、大小，以及一两个操作，比如 Download。图片以图集的形式直接显示，视频显示在播放器里。附件位于消息正文下方，放在 `MessageItemAttachments` 里（[MessageItem](../message-item/message-item.md)）。

```example
message-attachment/compositions/message-attachments-showcase
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 已发送消息附带的文件 | `MessageAttachmentCard`，放在 `MessageAttachmentGroup` 里 |
| 消息附带的图片 | `MessageImageGallery` |
| 消息附带的视频 | `MessageVideoPreview` |
| 等待发送的文件 | [Composer](../composer/composer.md) 里的缩略图 |
| 以图标表示文件类型 | [FilePreview](../file-preview/file-preview.md) |
| 指向某个页面的链接、转发的消息 | 链接卡片（[用现有部件组合](../../../../../design/components/overview.md#link-cards-forwarded-messages-quoted-previews)） |

## 结构 {#anatomy}

文件卡片：

- `MessageAttachmentGroup`：容纳各张卡片，最宽 360px。
- `MessageAttachmentCard`：一个文件。必需。
- `MessageAttachmentTitle`：文件名。开头可以放文件类型图标。必需。
- `MessageAttachmentSummary`：可选的一行内容摘要；评论数用 `MessageAttachmentCommentSummary`，改动的行数用 `MessageAttachmentDiffSummary`、`MessageAttachmentDiffAddition` 和 `MessageAttachmentDiffDeletion`。
- `MessageAttachmentMeta`：底部一行，包含 `MessageAttachmentMetaStart`（大小和类型）和 `MessageAttachmentMetaEnd`（操作）。
- `MessageAttachmentAction`：图标按钮，比如 Download 或 Preview。

图片：`MessageImageGallery` 及其各行（`MessageImageGalleryRow`，由 `buildMessageImageGalleryRows` 排布）；每个 `MessageImageGalleryItem` 里有 `MessageImageGalleryMedia`、一个打开图片的 `MessageImageGalleryPreview` 按钮、可选的 `MessageImageGalleryAction`，以及待处理时显示的 `MessageImageGalleryOverlay`。

视频：`MessageVideoPreview`，包含 `MessageVideoPreviewMedia`、`MessageVideoPreviewAction`、`MessageVideoPreviewFallback` 和 `MessageVideoPreviewFailure*` 系列部件。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| Download | 人要保存的文件 |
| Preview | 在 Raft 里打开的文件，比如 HTML 或音频 |
| 带摘要 | 带评论的文档，或带改动行数的 diff |
| 带类型图标 | 从名称看不出类型的文件 |

```example
message-attachment/compositions/file-attachments
```

```example
message-attachment/compositions/document-summaries
```

```example
message-attachment/compositions/diff-attachment
```

| 图片数 | 布局 |
| --- | --- |
| 1 | 保持原有比例 |
| 2 张及以上 | 按图片形状排成若干行 |

```example
message-media/compositions/image-gallery-single
```

```example
message-media/compositions/image-gallery-pair
```

```example
message-media/compositions/image-gallery-triple
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 上传中 | 元信息行显示 "Uploading · 64%"，文件名下方有一条 4px 的进度轨道，位于卡片内部，与文字对齐（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)） |
| 打开或处理中 | 卡片上设置 `aria-busy`，操作的位置换成 [Spinner](../spinner/spinner.md) |
| 待处理的图片 | 图片在 `MessageImageGalleryOverlay` 下变暗 |
| 失败 | `danger-strong` 边框，一行说明原因，以及 Remove 或 Retry |

```example
message-attachment/compositions/attachment-statuses
```

```example
message-media/compositions/image-gallery-pending
```

```example
message-media/compositions/video-states
```

## 行为 {#behavior}

- 整张卡片都可点击：文件名是链接，覆盖整张卡片。操作按钮位于其上方，各自独立工作。
- 卡片是用来读的，所以悬停用浅档，和文件行或评论卡片一样，按下用中档；它的操作按钮悬停用中档（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。
- 选中图片或文件会在文件查看器里打开它（[用现有部件组合](../../../../../design/components/overview.md#file-viewer)）。
- 图集的操作按钮在悬停和键盘聚焦时显示。
- 卡片或媒体角上的操作（文件卡片的 Download、视频或图片的操作）是嵌在外框里的控件：距角 6px，使用 `radius-chip`（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。

## 内容 {#content}

- 文件名原样显示，一行，放不下时截断。
- 大小和类型用 Space Mono 写："2.4 MB · PDF"。
- 失败时说明原因并给出限制："Larger than 25 MB. Remove it, or compress it and try again." 按钮写 Remove 和 Retry。
- 文件处理期间说清正在发生什么，比如 "Uploading · 64%"；不要写 "Processing…"（[写作](../../../../../design/content/writing.md#do-and-dont)）。

## 无障碍 {#accessibility}

- 不要把按钮放在文件名的 `<a>` 里面：把操作叠放在链接上方，让每个操作都是独立的控件。
- 给每个 `MessageAttachmentAction` 一个包含操作和文件名的 `aria-label`："Download release-notes.pdf"。
- 上传进度设置 `role="progressbar"`，标签写正在上传的文件。
- 卡片上传或打开期间设置 `aria-busy`。
- 每张图片都要有说明其内容的 `alt`。给 `MessageImageGalleryPreview` 一个 `aria-label`，比如 "Open onboarding-step-2.png"。

## 规则 {#rules}

- 文件卡片最宽 360px。
- 图片最宽 360px 显示，使用 `radius-container` 和 `line-hairline` 边框。
