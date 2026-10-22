---
title: ScrollArea
summary: 使用原生滚动、并画一条只在滚动时显示的细滚动条的区域，用于固定外框里的列表和横条。
sourceHash: cbc3c912
---

# ScrollArea

ScrollArea 用原生方式滚动内容，并在边缘上画一条细滚动条，只在内容移动时显示，所以滚动条不占布局的空间。raft-ui 把它用在桌面端的消息列表、侧栏和消息输入框的附件行上。

```example
scroll-area/compositions/basic
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 在固定外框里滚动的列表或横条 | ScrollArea |
| 面板头部下面的内容 | `PanelScrollViewport`（[Panel](../panel/panel.md#anatomy)） |
| 一个对话或一个消息列里的消息 | [MessageList](../message-list/message-list.md)，它基于 ScrollArea 构建 |
| 放不下的一排标签页 | [Tabs](../tabs/tabs.md#behavior)，它自己会滚动 |
| 比正文还宽的 Markdown 表格 | `MarkdownTableScroll`（[Markdown](../markdown/markdown.md)） |

## 结构 {#anatomy}

- `ScrollArea`：外框。给它区域的尺寸。必需。
- `ScrollAreaViewport`：真正滚动的元素。必需。
- `ScrollAreaContent`：内容，至少和视口一样高。必需。
- `ScrollAreaScrollbar`：一条边上的轨道，默认是竖向的。内容两个方向都能滚动时，用 `orientation="horizontal"` 再加一条。
- `ScrollAreaThumb`：轨道里 6px 的滑块，半透明墨色。每条滚动条里都必需。
- `ScrollAreaCorner`：两条滚动条相交处的方块。只在两条都有时使用。

```example
scroll-area/compositions/both-axes
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 静止 | 没有滚动条。轨道不响应鼠标指针 |
| 滚动中 | 滚动条立即出现，滚动停止后淡出 |
| 悬停在滑块上 | 滑块变深 |

## 行为 {#behavior}

- 滚动是浏览器自己的滚动：滚轮、触控板、触屏和键盘照常滚动视口。
- 滚动到区域尽头就停下，不会带着后面的页面继续滚动。
- 上方内容尺寸变化时，视口让可见内容保持在原位。

## 无障碍 {#accessibility}

- ScrollArea 包装 Base UI `ScrollArea`。内容溢出时视口可以获得焦点，这样键盘用户可以用方向键、Page Up 和 Page Down 滚动它。
- 视口自己没有角色。给里面的内容命名并组织结构，例如带 `aria-label` 的列表。

## 规则 {#rules}

- 每个区域只有一个滚动容器：头部不动，只有内容滚动（[Panel](../panel/panel.md#behavior)）。
- 设置外框的尺寸，而不是内容的尺寸：没有高度的 ScrollArea 会随内容变高，永远不会滚动。
