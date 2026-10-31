---
title: TextSelectionToolbar
summary: 浮在人选中的文字上方的工具栏，提供 Quote、Copy、Comment 这类针对这段文字的操作，用在消息、Artifact 或其他任何供人阅读的文字里。
sourceHash: ac54e8c8
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
| 针对几条选中消息的操作 | `MessageMultiSelectToolbar`（[MessageItem](../message-item/message-item.md)） |
| 从控件打开的一列选项 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |

## 结构 {#anatomy}

- `TextSelectionToolbar`：浮动的外框。必需。
- `TextSelectionToolbarButton`：一个操作，一个图标加一个标签。
- `TextSelectionToolbarSeparator`：各组操作之间的一条线。
- `createTextSelectionAnchor(selection)`：把工具栏放到选中文字上的锚点，传给 `PopoverContent` 的 `anchor`。

以消息命名的部件（`MessageTextSelectionToolbar`、`MessageTextSelectionToolbarButton`、`MessageTextSelectionToolbarSeparator`、`createMessageTextSelectionAnchor`）是这些部件已弃用的别名，保留到各应用改用通用名称为止。

## 外观 {#look}

它和消息的悬停工具栏长得完全一样，所以两者看起来是同一类东西：

- 高 36px：`radius-container`，细线画在内部（`ring-inset`），围着 28px 的 `radius-chip` 按钮，距外框 4px，按钮之间间隔 4px。
- 按钮在 16px 的 `foreground-muted` 图标后面带文字标签。悬停时用中档 `fill-medium`，而不是菜单行的 `brand-soft`：工具栏里的操作是按钮，不是菜单行（[状态](../../../../../design/foundations/states.md)）。
- `TextSelectionToolbarSeparator` 高 20px，两侧各留工具栏的 4px。

## 行为 {#behavior}

- 它锚定在选区焦点端所在的那一行，也就是人松手的地方，而不是整个选区：整行或跨多段的选区横跨整个文字栏，它的中间离鼠标指针很远。用 `createTextSelectionAnchor(selection)` 生成锚点，传给 `PopoverContent` 的 `anchor`；锚点每次被读取时都会重新测量那一行，所以文字滚动时工具栏会跟着走。
- 它始终留在视口内：默认在那一行上方，没有空间时翻到下方，靠近左右边缘时沿着那一行平移。

## 内容 {#content}

- 标签用 Title Case（每个单词首字母大写）。标签从不换行：中文可以在任意两个字之间断开，所以挤在窗口边缘的工具栏曾把两个字的标签断成了两行。

## 无障碍 {#accessibility}

- `TextSelectionToolbar` 封装了 Base UI `Toolbar`；给它一个 `aria-label`。它的按钮是 Base UI 的工具栏按钮：用方向键在它们之间移动。
