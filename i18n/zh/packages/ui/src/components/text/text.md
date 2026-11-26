---
title: Text
summary: 基础的字体排印部件：Text.Heading、Text.Sans 和 Text.Mono，用于没有其他组件承载的文字，使用系统的两种字体。
sourceHash: ec7ab33a
---

# Text

Text 用于排一段没有其他组件承载的文字：头像下的名字、文件名旁的大小、自定义布局里的一行辅助文字（作为 `HelperText`，用 `variant="muted"`）。`Text.Sans` 是 Space Grotesk，用于人说的话；`Text.Mono` 是 Space Mono，用于机器写的内容；`Text.Heading` 是标题。哪种字体用于什么，见[字体排印](../../../../../design/foundations/typography.md#principles)。

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

每个部件都接受一个 `variant` 来设置颜色。不设时由大小决定：除 `group` 以外的每个 Sans 字号，以及 Mono 的 `code` 和 `tabular`，用 `foreground`；Mono 的 `meta`（一条注记：时间、ID、数量）和 `group` 用 `foreground-hint`。在 raft-ui 发布 `HelperText` 之前，`small` 和 `caption` 是 `foreground-muted`，`meta` 也是：现在字号从不会让文字变灰，因为灰色文字就是辅助文字。

```example
text/compositions/semantic-elements
```

## 变体 {#variants}

| 变体 | 用于 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant="muted"` | 一行辅助文字（`foreground-muted`）。子元素只接受一个 `HelperText`，用 `helperText(content, { why, about })` 生成，并渲染出 `data-why` 和 `data-about`（[写作 › 辅助文字](../../../../../design/content/writing.md#helper-text)） |
| `variant="note"` | 注记：时间、ID、数量、缺失的值（`foreground-hint`）。以前叫 `placeholder`；`codemods/helper-text-renames.mjs` 会把它改名 |
| `variant="information"`、`"success"`、`"warning"`、`"danger"`、`"primary"`、`"accent"` | 带有其颜色含义的文字（[颜色的含义](../../../../../design/foundations/color.md#meanings-of-color)） |
| `size="tabular"` | 一列数字，数字等宽 |

```example
text/compositions/tones
```

- 一个颜色 tone 用的是它那一族的 `-strong` 墨色，即专为文字调的那一档：`information` 是 `info-strong`，`accent` 是 `attention-strong`，`success` 是 `success-strong`，`warning` 是 `warning-strong`，`danger` 是 `danger-strong`。每一个在画布、侧栏、卡片和弹出层上，在两种模式和每套主题里，对比度都至少 4.5:1（`text.tones.test.tsx`）。它们以前用的是贴纸色 `success`、`warning` 和 `danger`，这些是配墨色文字的填充色：作为白色上的文字，它们只有 1.64:1、2.03:1 和 2.76:1。`accent` 以前是 `attention-700`，在白色上 8.0:1，但在深色画布上只有 2.15:1。
- `variant="primary"` 是 `brand-strong`，即品牌色给文字用的那一档：在白色上 8.9:1，在深色画布上 12.1:1。它以前用 `brand-700`，在深色画布上只有 3.1:1（APCA Lc 22），而且没有哪个主题会改到它，所以在无聊灰里它仍然是黄褐色。黄色文字是品牌，不是信号（信号是黄色贴纸：[主题](../../../../../design/foundations/themes.md#signals)），所以它在无聊灰里会变灰。

- props 是按 `variant` 区分的联合类型：`"muted"` 时子元素是一个 `HelperText`，其他任何 tone 时子元素不限。运行时才选的 tone（`variant={quiet ? "muted" : "default"}`）两边都不符合，所以把两种情况分开写：一行辅助文字和一行数据是不同的文字。
- `Text.Heading` 没有 `muted`：标题从来不是辅助文字。

## 内容 {#content}

- 大小写遵循[字体排印](../../../../../design/foundations/typography.md#casing)：所有文字都用 sentence case，人点击的东西也一样。
- ID、时间、数量和大小用 `Text.Mono`，即使旁边是 Space Grotesk：`#25`、`10:24`、`24 KB`。

## 无障碍 {#accessibility}

- 这些部件是用 Base UI `useRender` 构建的普通元素。用 `render` 选择文档需要的元素，比如行里的 `span`，或术语列表里的 `dt` 和 `dd`，同时保留样式。
- `level` 同时决定大小和元素。要保持页面的大纲结构，用 `render` 设置元素：个人资料头像下的名字用 `level={6}` 加 `render={<h2 />}`。

## 规则 {#rules}

- 区块标题用 `Text.Sans size="group"`，sentence case。不要用 Space Mono 或全大写排小标签：产品里没有任何全大写的东西（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 不要用贴纸色或色板里的某一档给文字上色（`text-warning`、`text-success`、`text-danger`、`text-attention-700`）：用一个 tone，或者在自己的布局里用它的 `-strong` token。贴纸色是填充色，上面放墨色的文字和图标（[颜色 › 对比度](../../../../../design/foundations/color.md#contrast)）。
- 输入框的错误不要用 `variant="danger"`。它的墨色同样是 `danger-strong`，但错误属于输入框的错误状态，错误状态还会把输入框标为无效（[Field](../field/field.md)）。
