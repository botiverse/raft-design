---
title: CodeBlock
summary: 放在带框的代码表面上的多行代码或一段日志，可以加一个头部，写文件名、放复制操作。
sourceHash: 88fc6f2a
---

# CodeBlock

多行代码或一段日志，放在带框的代码表面上。在消息里，长行自动换行；在人们把代码当代码读的地方，长行横向滚动（[行为](#behavior)）。可选的头部写明文件名，并放 Copy 这样的操作。里面的代码由你来渲染，纯文本或高亮都可以。

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

- `CodeBlock`：外框。必需。`defaultWrap` 让它出现时长行自动换行；这一个代码块换不换行由它记着。
- `CodeBlockHeader`：可选的顶栏，下面有一条细线。
  - `CodeBlockTitle`：文件名，用 Space Mono。
  - `CodeBlockActions`：顶栏右端的操作。
    - `CodeBlockWrapToggle`：紧挨在 Copy 前面的开关，让自动换行的代码块改成横向滚动。仍在开发中：从 `@botiverse/raft-ui/wip` 导入。
- `CodeBlockBody`：代码面板。把代码放在 `CodeBlockPre` 里，`code` 在它里面。必需。
- `CodeBlockPre`：代码的 `pre`，滚动时可以用键盘到达（[无障碍](#accessibility)）。
- `CodeBlockAction`：32px 的图标按钮，用 `radius-chip`（用鼠标时 34px，用 `radius-control`），和所有嵌在外框里的控件一样。图标和它做什么由你提供。

## 变体 {#variants}

| 变体          | 用于                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 带头部    | 来自某个文件的代码：头部写出文件名                                                                                   |
| 不带头部 | 没有文件名的代码片段或日志；放在代码面板里的 `CodeBlockActions` 在右上角自成一列 |
| 高亮      | 已知语言的代码，用 Shiki 高亮                                                                        |
| 纯文本            | 日志和没有语言的文本                                                                                         |
| 自动换行          | 消息里的代码：`CodeBlock` 上的 `defaultWrap`，加上 Copy 前面的 `CodeBlockWrapToggle`                                          |

```example
code-block/compositions/wrap
```

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

- **在消息里，长行自动换行**（`defaultWrap`）。聊天栏很窄，人们在消息里贴的代码大多是命令、日志和读起来像文字的内容；横向滚动会把行尾藏到滚动条后面，而行尾往往是要紧的部分（最后一个参数、报错）。Slack 和 Discord 也让消息里的代码自动换行。
- **在人们把代码当代码读的地方，长行横向滚动**，在代码面板里不换行：diff、完整的代码视图。不加 `defaultWrap` 时就是这样。换行会打乱缩进代码对齐的列，所以 IDE 和 GitHub 在宽屏上都保持不换行。在文件查看器里打开的纯文本会自动换行，那有它自己的理由（[文件查看器](../../../../../design/components/overview.md#file-viewer)）。
- 换行后的部分从下一行的行首接着排，没有空格的一长串（比如长 URL 或 token）在需要的地方断开（`white-space: pre-wrap`、`overflow-wrap: anywhere`）。接续的行不保留原行的缩进：CSS 没有办法按每一行自己的行首空白来缩进，而 `pre` 把代码当作文本保存，没有可以缩进的行元素。代码保留它的空白，Copy 原样复制各行，不带换行产生的断行。
- **换行开关。** 自动换行的代码块在头部有一个 `CodeBlockWrapToggle`，紧挨在 Copy 前面。按下它，这一个代码块改成横向滚动；再按一次，又自动换行。按下时它是按下的开关的黄色贴纸，和 `PanelToggleAction` 一样（[Panel](../panel/panel.md#states)），并且和所有选中的控件一样，指针移上去时保持这个样子（[状态](../../../../../design/foundations/states.md#hover-and-press)）。它只改变自己所在的代码块，也不会被记住：每个代码块对每个人都从自动换行开始，下一条消息里的代码块仍然自动换行。默认横向滚动的代码块没有这个开关。
- 复制之后，复制图标变成对勾，过一会儿再变回来，和 [CopyableCode](../copyable-code/copyable-code.md) 一样。

## 内容 {#content}

- 标题写文件名，带扩展名：`raft.config.ts`。
- 没有文件名时不要头部。

## 无障碍 {#accessibility}

- 每个 `CodeBlockAction` 都要有 `aria-label`，例如 "Copy code"：它只有图标。
- 复制完成时要播报出来，例如在按钮上用 `aria-live`，不要让图标的变化成为唯一的信号。
- 代码保持在 `pre` 和 `code` 里，这样它会被当作代码读出，并保留空白。
- 在 `CodeBlockPre` 里渲染代码。长行在它里面滚动；滚动时它是一个键盘可以到达的区域（`tabindex="0"`、`role="region"`），由它的 `aria-label` 命名（默认是 "Code"；按语言命名，如 "ts code"）：Safari 不让键盘到达无法获得焦点的滚动容器，而没有角色的 `pre` 无法带名称。放得下的代码不增加 Tab 停留点。`pre` 变大小或代码变了（晚到的高亮、流式输出的代码），它都会重新量，所以变长的行会得到 Tab 停留点。键盘聚焦时显示内嵌的墨色焦点环。自动换行作用在 `CodeBlockPre` 上（单独的 `pre` 不会换行）：自动换行的代码块不滚动，所以不增加 Tab 停留点；开关切换它时，它会重新量。
- `CodeBlockWrapToggle` 是一个 Base UI Toggle：一个 `button`，它的 `aria-pressed` 表示代码块是不是改成了横向滚动。raft-ui 不带任何文案，所以要给它一个 `aria-label`，说出按下后打开的是什么，例如 "Don't Wrap Lines"，并把同样的文字放在 `title` 里：它只有图标。

## 规则 {#rules}

- 代码用 Space Mono，`text-mono-code`。
- 代码块放在 `layer-code` 上，用 `line-hairline` 边框和 `radius-container`。
- 操作距代码块的角 6px，彼此相隔 4px。没有头部时，它们在代码旁边自成一列，宽度与操作相同，所以无论有几个操作，都不会有代码行从它们下面穿过，而且代码块至少高到让它们下面留出 6px。在头部里时，它们在 40px 的头部里垂直居中，距头部末端 6px（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 消息里的代码自动换行，并给它换行开关。被当作代码读的代码（diff、完整的代码视图）保持横向滚动，不加开关。
- 换行开关紧挨在 Copy 前面，这样 Copy 留在人们伸手去找的那个角上。
- 换行开关用 Lucide 的 `move-horizontal`，两种状态用同一个图标：按下以后长行改为横向滚动，所以图标画的是横向滚动，不是换行。用 `text-wrap` 的话，按下亮起时恰恰不换行，读起来是反的。它是一个按下的开关，所以由黄色贴纸表示按下，和 `PanelToggleAction` 一样；不要把图标填实，也不要换成第二个图形（[图标](../../../../../design/foundations/iconography.md#meanings)：一个概念一个图标，只用线框）。
