---
title: Markdown
summary: Markdown 渲染器把节点映射到的一组带样式的元素，包括标题、段落、链接、列表、引用、表格、图片和任务复选框，用于人和 agent 写的文字。
sourceHash: 0bcfdb37
---

# Markdown

Markdown 部件为人和 agent 用 Markdown 写的内容设置样式：消息正文、任务描述、agent 的笔记。raft-ui 为每种 Markdown 元素导出一个部件，不提供解析器。你的渲染器解析源文本，把每个节点映射到对应的部件；文档站的渲染器（[`markdown.tsx`](../../../../../apps/doc/src/lib/markdown/markdown.tsx)）用 react-markdown 解析 GitHub 风格的 Markdown，并转义源文本中的 HTML。

```example
message-reference/compositions/mixed-long-message
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 有人用 Markdown 写的文字 | Markdown 部件 |
| 文字中的提及、频道、消息列或任务 | 消息的引用部件，不用 `MarkdownLink`（[MessageItem](../message-item/message-item.md#in-the-body)） |
| 围栏代码块 | [CodeBlock](../code-block/code-block.md) |
| 由产品排版的表格，比如用量或账单 | [Table](../table/table.md) |
| 产品自己写的文字：标签、描述、空状态 | 承载这些文字的组件，或 [Text](../text/text.md) |

## 结构 {#anatomy}

每个部件渲染同名的元素。

- `MarkdownHeading`：`h1` 到 `h6`，由 `level` 决定。
- `MarkdownParagraph`：段落。一个块里的最后一段下方没有间距。
- `MarkdownLink`：正文中的链接。
- `MarkdownMark`：高亮的一段文字，用于搜索命中。
- `MarkdownList`、`MarkdownOrderedList` 和 `MarkdownListItem`：无序和有序列表。
- `MarkdownCheckbox`：任务列表项（`- [x]`）的方框。一个只读的 [Checkbox](../checkbox/checkbox.md)。
- `MarkdownBlockquote`：引用。
- `MarkdownRule`：分隔线。
- `MarkdownImage`：图片，铺在透明棋盘格上。
- `MarkdownInlineCode`：句子里的代码（[InlineCode](../inline-code/inline-code.md)），字号与周围文字相同。
- `MarkdownTableScroll`、`MarkdownTable`、`MarkdownTableRow`、`MarkdownHeaderCell` 和 `MarkdownCell`：表格。`MarkdownTableScroll` 是容器，表格比正文宽时可以横向滚动。

| 元素 | 样子 |
| --- | --- |
| 1 到 3 级标题 | `text-title`、`text-headline` 和 `text-subhead`，粗体 |
| 4 到 6 级标题 | `text-footnote`，粗体，用 `foreground-muted` |
| 链接 | `foreground-link`，带 40% 的 2px 下划线，是唯一在静止时就带下划线的可点击文字（[可点击的文字](../../../../../design/foundations/states.md#clickable-text)）：单靠链接蓝，与 `foreground` 的对比度在浅色模式下只有 2.75:1，深色模式下只有 1.44:1，都低于 3:1。悬停时下划线变为满色，文字向正文墨色靠近 20%，浅色模式下变深，深色模式下变浅，因此两种模式下它与纸面的对比度都会提高 |
| 搜索命中 | 一张小的黄色贴纸，与 `MessageItemSearchMatch` 相同 |
| 引用 | 左侧一条 2px 的竖条，文字用 `foreground-muted` |
| 分隔线 | 一条 `line-hairline` |
| 表格 | `line-hairline` 的外框和分隔线，`radius-container`；表头行铺 `fill-muted`（[由现有部件搭成](../../../../../design/components/overview.md#diagrams-and-markdown-tables)） |
| 图片 | `line-hairline` 的外框，`radius-container`，最宽不超过正文 |

## 行为 {#behavior}

- 部件本身不增加宽度：文字按容器换行，长表格在 `MarkdownTableScroll` 里滚动，而不是把消息撑宽。
- 任务列表的复选框显示源文本中写的状态。人不能在渲染后的文字里改变它。

## 内容 {#content}

- 作者写了什么就渲染什么，包括中文和 emoji，都作为正文：emoji 是内容，不是图标（[图标](../../../../../design/foundations/iconography.md)）。

## 无障碍 {#accessibility}

- 这些部件是普通的 HTML 元素，所以标题、列表、引用和表格保留原生语义。
- `MarkdownLink` 在键盘聚焦时显示 `focus-ring`。
- `MarkdownCheckbox` 用 `readOnly` 包装 Base UI 的 `Checkbox`；它的无障碍名称是列表项的文字。
- 把源文本中图片的替代文字传给 `MarkdownImage`。

## 规则 {#rules}

- 渲染前转义或清理源文本中的 HTML：人写的 Markdown 不能注入标记。
- 每个 `MarkdownTable` 都包在 `MarkdownTableScroll` 里，这样宽表格会滚动，而不是溢出消息。
- 围栏代码渲染成 [CodeBlock](../code-block/code-block.md)，不要渲染成自己加样式的 `pre`。
- 用 `MarkdownMark` 标出搜索命中，不要用粗体或自选的颜色：命中在消息文字、Markdown 和搜索结果里看起来都一样（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
