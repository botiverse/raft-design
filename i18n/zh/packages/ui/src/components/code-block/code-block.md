---
title: CodeBlock
summary: 放在带框的代码表面上的多行代码或一段日志，可以加一个头部，写文件名、放复制操作。
sourceHash: 36f52363
---

# CodeBlock

多行代码或一段日志，放在带框的代码表面上，过长时横向滚动而不是换行。可选的头部写明文件名，并放 Copy 这样的操作。里面的代码由你来渲染，纯文本或高亮都可以。

```example
code-block/compositions/shiki
```

## 何时使用 {#when-to-use}

| 情况                          | 用                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 多行代码，或一段日志    | CodeBlock                                                                                                                   |
| 一条让人复制去运行的命令    | [CopyableCode](../copyable-code/copyable-code.md)                                                                           |
| 句子里出现的代码名称 | [InlineCode](../inline-code/inline-code.md)                                                                                 |
| 图表或 Markdown 表格      | 同一个容器（[用现有部件组合](../../../../../design/components/overview.md#diagrams-and-markdown-tables)） |

## 结构 {#anatomy}

- `CodeBlock`：外框。必需。
- `CodeBlockHeader`：可选的顶栏，下面有一条细线。
  - `CodeBlockTitle`：文件名，用 Space Mono。
  - `CodeBlockActions`：顶栏右端的操作。
- `CodeBlockBody`：代码面板。把代码放在 `CodeBlockPre` 里，`code` 在它里面。必需。
- `CodeBlockPre`：代码的 `pre`，滚动时可以用键盘到达（[无障碍](#accessibility)）。
- `CodeBlockAction`：32px 的图标按钮，用 `radius-chip`，和所有嵌在外框里的控件一样。图标和它做什么由你提供。

## 变体 {#variants}

| 变体          | 用于                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 带头部    | 来自某个文件的代码：头部写出文件名                                                                                   |
| 不带头部 | 没有文件名的代码片段或日志；放在代码面板里的 `CodeBlockActions` 在右上角自成一列 |
| 高亮      | 已知语言的代码，用 Shiki 高亮                                                                        |
| 纯文本            | 日志和没有语言的文本                                                                                         |

```example
code-block/compositions/plain
```

```example
code-block/compositions/without-header
```

```example
code-block/compositions/animated-copy
```

## 行为 {#behavior}

- 长行在代码面板里横向滚动。代码不换行。
- 复制之后，复制图标变成对勾，过一会儿再变回来，和 [CopyableCode](../copyable-code/copyable-code.md) 一样。

## 内容 {#content}

- 标题写文件名，带扩展名：`raft.config.ts`。
- 没有文件名时不要头部。

## 无障碍 {#accessibility}

- 每个 `CodeBlockAction` 都要有 `aria-label`，例如 "Copy code"：它只有图标。
- 复制完成时要播报出来，例如在按钮上用 `aria-live`，不要让图标的变化成为唯一的信号。
- 代码保持在 `pre` 和 `code` 里，这样它会被当作代码读出，并保留空白。
- 在 `CodeBlockPre` 里渲染代码。长行在它里面滚动；滚动时它是一个键盘可以到达的区域（`tabindex="0"`、`role="region"`），由它的 `aria-label` 命名（默认是 "Code"；按语言命名，如 "ts code"）：Safari 不让键盘到达无法获得焦点的滚动容器，而没有角色的 `pre` 无法带名称。放得下的代码不增加 Tab 停留点。`pre` 变大小或代码变了（晚到的高亮、流式输出的代码），它都会重新量，所以变长的行会得到 Tab 停留点。键盘聚焦时显示内嵌的墨色焦点环。

## 规则 {#rules}

- 代码用 Space Mono，`text-mono-code`。
- 代码块放在 `layer-code` 上，用 `line-hairline` 边框和 `radius-container`。
- 操作距代码块的角 6px，彼此相隔 4px。没有头部时，它们在代码旁边自成一列，宽度与操作相同，所以无论有几个操作，都不会有代码行从它们下面穿过，而且代码块至少高到让它们下面留出 6px。在头部里时，它们在 40px 的头部里垂直居中，距头部末端 6px（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
