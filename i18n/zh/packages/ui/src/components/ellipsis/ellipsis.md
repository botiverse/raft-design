---
title: Ellipsis
summary: 用 CSS 把文字截成一行或几行；只有真的被截断时，才用工具提示显示全文，或者可以展开。
sourceHash: aa0f494f
---

# Ellipsis

Ellipsis 把一段文字截成一行，或者截成 `lines` 行，并且知道自己有没有截断。文字被截断时，悬停在上面会用[工具提示（Tooltip）](../tooltip/tooltip.md)显示全文，放在 `after` 里的展开控件可以就地显示剩下的部分。放得下的文字两样都没有。行里的名字、标题栏里的标题和下面的说明，凡是文字可能比位置长的地方都用它。

```example
ellipsis/compositions/list-row
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 行或标题栏里的名字、标题、文件名，一行 | Ellipsis |
| 截成几行的说明或摘要，读者可能想读全文 | 带 `lines` 的 Ellipsis，`after` 里放一个 `EllipsisToggle` |
| 表单里 Select、Combobox 或标签片的值 | 不用：控件自己会截断它的值（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)） |
| 标签、帮助文字或错误提示 | 换行，永远不截断：它们是在解释控件 |
| 消息或文档的正文 | 用正文自己的折叠，不用行数截断：行数截断会在句子中间切开，还会藏掉整块内容 |
| 从中间截断的文件名（`launch-…-final.pdf`） | 不用 Ellipsis：它只在末尾截断 |

## 结构 {#anatomy}

- `Ellipsis`：文字和它占的位置。子元素就是文字，只能是行内内容（文字、链接、行内代码、提及）。必需。
- `EllipsisToggle`：展开控件，放在 `after` 里。是一个 [TextLink](../text-link/text-link.md) 按钮，文字由调用方传入。可选。
- `useTruncated(ref)`：只做测量，给不是 Ellipsis 的文字用。元素的文字被截断时返回 `true`，放得下时返回 `false`，还没测量或元素没有盒子时返回 `undefined`。它不需要知道行数：行内方向的两端和底边都会检查。raft-ui 的输入框也用同一套测量，给被截断的值加上 `title`。

文字用 CSS 截断（`text-overflow: ellipsis`、`line-clamp`），从不改写：页内查找、复制和读屏软件拿到的都是全文，截断处也不会把一个 emoji 或一个汉字切成两半。

## 行为 {#behavior}

### 测量 {#measuring}

- Ellipsis 只测量文字本身，测量时把 `after` 移出布局。所以单独放得下的文字，永远不会为了给一个用不着的控件腾位置而被截断。只有确定文字被截断之后，`after` 才占位置。
- 它拿文字带小数的尺寸和盒子比较，容差 0.5px。只比整数像素（`scrollWidth > clientWidth`）的话，在某些宽度和页面缩放下会漏掉 1px 甚至更多的截断，而那时省略号已经显示出来了。
- 盒子或 `after` 的尺寸变化、文字变化、`lines` 或 `expanded` 变化时，它都会重新测量；网页字体加载完成时也会，因为字体会让文字变宽，盒子却不变。它不会每次渲染都测量。
- 页面上所有 Ellipsis 共用一个 ResizeObserver、一个 MutationObserver 和一个字体监听。它们都在同一个动画帧里测量，先读完再写，所以长列表不会每一行都强制重新布局一次；结果也在这一帧绘制之前应用，`after` 不会晚一帧才出现。
- 没有盒子的文字（在 `display: none` 里、在没打开的标签页或收起的面板里）在显示出来之前，既不算截断也不算完整：没有工具提示，也没有展开控件。

### 工具提示 {#tooltip}

- 工具提示在悬停时打开；文字是按钮时（`expandOnClick`），键盘聚焦也会打开。两种情况都只在文字被截断时才打开。快要打开时 Ellipsis 会再测量一次，所以就算之前漏掉了某次变化，也不会在放得下的文字上打开，或者在被截断的文字上打不开。文字不再被截断时，它就关闭。
- `tooltip` 默认是子元素，`false` 关掉它，传入一个节点就替换它的内容。默认的工具提示不会朗读，因为读屏软件已经会读出全文。
- 它在触屏上从不打开（`(hover: none), (pointer: coarse)`）：在触屏上点一下，意思是点它所在的那一行。

### 不悬停也能读到全文 {#reading-the-whole-text-without-hover}

工具提示需要能悬停的鼠标指针。在触屏上，或者用键盘访问一段不是按钮的文字时，Ellipsis 默认不提供别的办法：只有用鼠标的人才能读到截断后面的部分。如果在手机上或用键盘时也需要读到全文，传入下面其中一项：

- `expandOnClick`，用于没有 `after` 的纯文字：被截断的文字变成一个按钮，可以用 Tab 移到它上面，点一下、按 Enter 或空格就能展开。
- `after` 里放一个 `EllipsisToggle`，用于文字里有链接，或者文字后面还有别的内容。

第一个示例里的列表用的是第一种：点一下或按 Enter，被截断的名字就会完整显示。

- 鼠标指针在 `after` 上时，工具提示不会打开，因为 `after` 有它自己的名称。

### 展开 {#expanding}

```example
ellipsis/compositions/expand
```

- `after` 位于最后一行可见文字的末尾。给它传一个函数，就能拿到 `{ truncated, expanded, toggle }`，让 `EllipsisToggle` 的文字跟着状态变：Show More、Show Less。
- `after` 只在文字被截断或已展开时显示。文字放得下时它是 `display: none`，不占位置。因为测量的永远只是文字本身，显示 `after` 不会改变测量结果，控件也就不会一会儿出现一会儿消失。
- 按下 `EllipsisToggle` 后它还是同一个元素，所以焦点还留在它上面。
- 用 `expanded`、`defaultExpanded` 和 `onExpandedChange` 把它做成受控或非受控组件。
- 打印时文字完整显示。

### 点击展开 {#expanding-on-click}

```example
ellipsis/compositions/with-link
```

- `expandOnClick` 让被截断的纯文字本身成为展开它的按钮。只有测量出它被截断之后，文字才会变成按钮。所以放得下的文字永远不是按钮，Tab 也不会停在上面；拖动选择文字的那次点击也不会让它展开。
- 展开后，文字还是同一个按钮，带 `aria-expanded="true"`：焦点留在它上面，同样点一下、点击、按 Enter 或空格就能收起。
- 文字里有链接、按钮或其他控件时，即使设了 `expandOnClick` 也不会变成按钮：按钮里不能放链接，而且点链接的同时也会展开文字。这种情况在 `after` 里放一个 `EllipsisToggle`。
- 有 `after` 的文字也不会变成按钮：控件放在 `after` 里，而按钮里不能再放一个按钮。这时 `expandOnClick` 不起作用。

### 改变尺寸 {#resizing}

```example
ellipsis/compositions/resizing
```

## 布局 {#layout}

截断不生效的文字，大多是放在了一个不让它缩小的布局里：

- 在 flex 或 grid 的一行里，Ellipsis 自己会缩小（`min-w-0`），但它和这一行之间的每一层 flex 或 grid 子元素也都要加 `min-w-0`。
- 在表格里，用 `table-layout: fixed`，或者给这一列一个宽度。
- 不要在多行 Ellipsis 的子元素里放块级元素（`<p>`、`<div>`）：它们会让行数截断失效。
- 在多行 Ellipsis 里，没有空格的长 URL 或一长串数字可能在任何位置断行。

## 无障碍 {#accessibility}

- 全文都在 DOM 里，读屏软件会把它全部读出；工具提示不会再朗读任何内容。
- `EllipsisToggle` 是一个 `<button>`，带 `aria-expanded` 和指向文字的 `aria-controls`。它在 DOM 里排在文字前面，因为它是浮动到最后一行末尾的。
- 设了 `expandOnClick` 时，被截断的文字是 `role="button"`，在 Tab 顺序里，用 `aria-expanded` 表示是否已展开；按 Enter 和空格展开、收起，焦点留在它上面。
- 按钮里永远不会再有按钮：有 `after` 时，文字就只是文字。
- 工具提示用的是 Base UI 的 Tooltip，通过 [Tooltip](../tooltip/tooltip.md) 组件提供。不是按钮的文字不能获得焦点，所以它的工具提示只在悬停时打开；见[不悬停也能读到全文](#reading-the-whole-text-without-hover)。

## 规则 {#rules}

- 永远不要截断标签、帮助文字或错误提示：让它们换行（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)）。
- 不要给 Ellipsis 加 `title`：它只在需要时显示自己的工具提示，而 `title` 总会显示，还会和它重复。
- 展开控件的文字用产品自己的说法，用 Title Case：Show More、Show Less。
