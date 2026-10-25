---
title: Text
summary: 基础的字体排印部件：Text.Heading、Text.Sans 和 Text.Mono，用于没有其他组件承载的文字，使用系统的两种字体。
sourceHash: 73213f5f
---

# Text

Text 用于排一段没有其他组件承载的文字：头像下的名字、文件名旁的大小、自定义布局里的一行帮助文字。`Text.Sans` 是 Space Grotesk，用于人说的话；`Text.Mono` 是 Space Mono，用于机器写的内容；`Text.Heading` 是标题。哪种字体用于什么，见[字体排印](../../../../../design/foundations/typography.md#principles)。

```example
text/compositions/inline-list-row
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 自己的布局里的文字，没有对应的组件 | Text |
| 组件里的标题、标签、描述 | 组件自己的部件：`PanelTitle`、`FieldLabel`、`DescriptionTerm` |
| 有人用 Markdown 写的文字 | [Markdown](../markdown/markdown.md) |
| 句子里来自代码的名称 | [InlineCode](../inline-code/inline-code.md) |
| 句子里的 ID、时间或数量 | `Text.Mono` 加 `render={<span />}`，不加填充（[字体排印](../../../../../design/foundations/typography.md#usage)） |

## 结构 {#anatomy}

- `Text.Heading`（`TextHeading`）：`h1` 到 `h6`，由 `level` 决定。
- `Text.Sans`（`TextSans`）：Space Grotesk 的段落，大小由 `size` 决定：`large`、`body`、`small`、`caption` 或 `group`。`group` 是一组行或面板里一个区块的标题（`text-footnote`，字重 700，`foreground-hint`，见[字体排印](../../../../../design/foundations/typography.md)）。
- `Text.Mono`（`TextMono`）：Space Mono 的段落，大小由 `size` 决定：`code`、`meta` 或 `tabular`。

每个部件都接受一个 `variant` 来设置颜色。不设时由大小决定：较大的字号用 `foreground`，`small`、`caption` 和 `meta` 用 `foreground-muted`，`group` 用 `foreground-hint`。

```example
text/compositions/semantic-elements
```

## 变体 {#variants}

| 变体 | 用于 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant="muted"` | 次要文字：预览、描述、标签（`foreground-muted`） |
| `variant="placeholder"` | 第三级文字：时间、ID、分组标题、缺失的值（`foreground-hint`） |
| `variant="information"`、`"success"`、`"warning"`、`"danger"`、`"primary"`、`"accent"` | 带有其颜色含义的文字（[颜色的含义](../../../../../design/foundations/color.md#meanings-of-color)） |
| `size="tabular"` | 一列数字，数字等宽 |

- `variant="primary"` 是 `brand-strong`，即品牌色给文字用的那一档：在白色上 8.9:1，在深色画布上 12.5:1。它以前用 `brand-700`，在深色画布上只有 3.1:1（APCA Lc 22），而且没有哪个主题会改到它，所以在无聊灰里它仍然是黄褐色。黄色文字是品牌，不是信号（信号是黄色贴纸：[主题](../../../../../design/foundations/themes.md#signals)），所以它在无聊灰里会变灰。

## 内容 {#content}

- 大小写遵循[字体排印](../../../../../design/foundations/typography.md#casing)：文字用 sentence case，只有可点击的东西用 Title Case。
- ID、时间、数量和大小用 `Text.Mono`，即使旁边是 Space Grotesk：`#25`、`10:24`、`24 KB`。

## 无障碍 {#accessibility}

- 这些部件是用 Base UI `useRender` 构建的普通元素。用 `render` 选择文档需要的元素，比如行里的 `span`，或术语列表里的 `dt` 和 `dd`，同时保留样式。
- `level` 同时决定大小和元素。要保持页面的大纲结构，用 `render` 设置元素：个人资料头像下的名字用 `level={6}` 加 `render={<h2 />}`。

## 规则 {#rules}

- 区块标题用 `Text.Sans size="group"`，sentence case。不要用 Space Mono 或全大写排小标签：产品里没有任何全大写的东西（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 错误文字不要用 `variant="danger"`。错误文字是 `danger-strong`，来自输入框的错误状态（[Field](../field/field.md)）。
