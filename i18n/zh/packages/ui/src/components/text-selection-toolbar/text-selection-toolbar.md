---
title: TextSelectionToolbar
summary: 浮在人选中的文字上方的工具栏，提供 Quote、Copy、Comment 这类针对这段文字的操作，用在消息、Artifact 或其他任何供人阅读的文字里。
sourceHash: df1cc60b
---

# TextSelectionToolbar

`TextSelectionToolbar` 浮在人选中的文字上方，提供 Quote、Copy、Comment 这类针对这段文字的操作。凡是能选中文字的地方，用的都是同一个工具栏：在消息里，在 Artifact 里，在其他任何供人阅读的文字里。

```example
text-selection-toolbar/text-selection-toolbar
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 针对人选中的文字的操作 | TextSelectionToolbar |
| 针对鼠标指针下那条消息的操作 | 消息的悬停工具栏（[MessageItem](../message-item/message-item.md)） |
| 针对几条选中消息或任务的操作 | [SelectionToolbar](../selection-toolbar/selection-toolbar.md) |
| 从控件打开的一列选项 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |

## 结构 {#anatomy}

- `TextSelectionToolbar`：浮动的外框。必需。
- `TextSelectionToolbarButton`：一个操作，一个图标加一个标签。
- `TextSelectionToolbarSeparator`：各组操作之间的一条线。
- `createTextSelectionAnchor(selection)`：把工具栏放到选中文字上的锚点，传给 `PopoverContent` 的 `anchor`。

## 外观 {#look}

它的构造和消息的悬停工具栏一样，所以两者看起来是同一类东西。唯一的区别是它的按钮带文字标签，而悬停工具栏的按钮只有图标：

- 在触屏上高 36px，围着 28px 的 `radius-chip` 按钮；用鼠标时高 42px，围着控件高度（34px）的 `radius-control` 按钮（stdrc，2026-11-05）：`radius-container`，细线画在内部（`ring-inset`），按钮距外框 4px，按钮之间间隔 4px。
- 按钮在 16px 的 `foreground-muted` 图标后面带文字标签。悬停时用中档 `fill-medium`，而不是菜单行的 `brand-soft`：工具栏里的操作是按钮，不是菜单行（[状态](../../../../../design/foundations/states.md)）。
- `TextSelectionToolbarSeparator` 高 20px，两侧各留工具栏的 4px。

## 行为 {#behavior}

- 它锚定在选区焦点端所在的那一行，也就是人松手的地方，而不是整个选区：整行或跨多段的选区横跨整个文字栏，它的中间离鼠标指针很远。用 `createTextSelectionAnchor(selection)` 生成锚点，传给 `PopoverContent` 的 `anchor`；锚点每次被读取时都会重新测量那一行，所以文字滚动时工具栏会跟着走；文字滚出视野后，工具栏隐藏，直到文字滚回视野。滚动容器直接装着裸文本节点、没有块级子元素时，显式传入 `contextElement`。
- 它始终留在视口内：默认在那一行上方，没有空间时翻到下方，靠近左右边缘时沿着那一行平移。在触屏上它完全不锚定在选区上：它放在文字所在那一栏的底部，在这一栏里居中，位于底部固定的东西（消息输入框、标签栏、安全区）上方，阴影和按钮都一样。是那一栏，不是屏幕：平板把文字显示在几栏中的一栏里，而在对话里，底部是消息输入框。底部放着一条用来就同一段文字写东西的栏时，比如手机上文档查看器的对话栏，不显示工具栏：那条栏留在原处，上方贴一行选区的引用，按下那条栏就评论选区，所以从不会出现第二条栏（[评论](../../../../../design/patterns/comments.md#one-bar-at-a-time)）。在触屏选区附近，工具栏放在哪里都会和别的东西打架：选区手柄挂在选区两端的下方，系统自己的菜单（拷贝、查询）在选区上方，靠近屏幕顶部时在下方；页面没法知道那个菜单在哪里，也没法往里面加自己的项。放在底部就避开了这两样，所以一有选区它就出现，拖动手柄时也停在原处，而不是隐藏了再回来。选区消失时它也离开（xxchan、Remy、Kirby，2026-11-25，#proj-workspace:#423，参照 iOS 上的 Notion）。它从不抢走焦点，也不用遮罩盖住页面：人必须能继续调整选区。

## 内容 {#content}

- 标签用 sentence case（只有第一个词和名称首字母大写）。标签从不换行：中文可以在任意两个字之间断开，所以挤在窗口边缘的工具栏曾把两个字的标签断成了两行。

## 无障碍 {#accessibility}

- `TextSelectionToolbar` 封装了 Base UI `Toolbar`；给它一个 `aria-label`。它的按钮是 Base UI 的工具栏按钮：用方向键在它们之间移动。
