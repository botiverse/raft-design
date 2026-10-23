---
title: FilePreview
summary: 显示文件类型的小图标（文档、压缩包、代码或媒体缩略图），附一个写明类型的标签片。
sourceHash: 8188139e
---

# FilePreview

一个 40px 的图标，显示文件属于哪一类：文档是一页纸，还有压缩包、代码页，或者图片、视频的缩略图，并附一个写明类型的小标签片。凡是列出文件的地方，它都放在文件名前面。

```example
file-preview/compositions/default
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 消息输入框里还没发出的文件 | FilePreview，放在消息输入框的附件里（[Composer](../composer/composer.md)） |
| 文件列表中的一个文件 | 行首的 FilePreview |
| 一行文字中，名字旁边的类型 | `FilePreviewBadge`，设 `placement="inline"` |
| 已发送消息附带的文件 | 文件卡片（[MessageAttachment](../message-attachment/message-attachment.md)） |

## 结构 {#anatomy}

- `FilePreview`：40px 的方框。必需。
- 文件的图示，必选其一：
  - `FilePreviewDocument`：带横线的一页纸，用于文档；
  - `FilePreviewCode`：一页代码；
  - `FilePreviewFile`：压缩包或其他文件；
  - `FilePreviewMedia`：缩略图；里面放图片或视频封面。
- `FilePreviewBadge`：类型标签片。在图标上时，它位于底部角落（`placement="corner"`）；在一行文字中时，它放在名字前面（`placement="inline"`）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| Document | PDF、DOCX、TXT 等文档 |
| Code | 源代码文件、HTML |
| File | 压缩包和其他所有文件 |
| Media | 图片和视频，显示文件本身 |

```example
file-preview/compositions/formats
```

```example
file-preview/compositions/media
```

```example
file-preview/compositions/illustrations
```

```example
file-preview/compositions/inline-badge
```

## 内容 {#content}

- 文档在标签片里用扩展名标注：PDF、DOCX、TXT。
- 代码、图片和其他文件，由图示来表明类型。
- 扩展名用大写。它是缩写，不是全大写的样式（[字体排印](../../../../../design/foundations/typography.md#casing)）。

## 无障碍 {#accessibility}

- 图示是装饰性的，对辅助技术隐藏。图标旁边的文件名说明这是什么文件；不要只靠图标。
- 标签片的文字按原样朗读。

## 规则 {#rules}

- 类型标签片保持中性：`fill-muted` 加一条细线，Space Mono 字体。含义由旁边的名字承担，所以类型不加颜色。
- 不要按类型给文件上色：没有含义的颜色要去掉（[颜色](../../../../../design/foundations/color.md)）。只有媒体缩略图显示颜色，因为它就是文件本身。
