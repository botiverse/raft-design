---
title: Resizable
summary: 可以拖动分隔位置的列或行，拖动手柄就在两者之间的接缝线上，或者在没有接缝线的卡片之间的空隙里。
sourceHash: 7e7fbc27
---

# Resizable

Resizable 让人拖动两个区域之间的边界，改变各自占多少空间：侧栏和主区域，或者一段对话和它的消息列。两列之间的接缝线是唯一的线，拖动手柄就在这条线上（[用现有部件搭成](../../../../../design/components/overview.md#resizable-columns)）。排在面板里的卡片没有接缝线，所以它们的手柄是卡片之间的空隙（[空隙手柄](#the-gap-handle)）。

```example
app-shell/compositions/collapsible-sidebar
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 人会调整的分栏：侧栏、消息列面板 | Resizable |
| 设计里固定的宽度 | [AppShell](../app-shell/app-shell.md) 的插槽，或普通布局 |
| 在主区域旁边打开和关闭的侧面板 | 外壳里的 [Panel](../panel/panel.md) |
| 暂时盖住页面的详情 | [Drawer](../drawer/drawer.md) |

## 结构 {#anatomy}

- `ResizableGroup`：容器。`orientation="horizontal"`（默认）让面板左右并排；`orientation="vertical"` 让面板上下堆叠。必需。
- `ResizablePanel`：一个区域，有默认、最小和最大尺寸。至少 2 个。
- `ResizableHandle`：两个面板之间的拖动手柄。每对相邻面板之间都必须有：没有手柄的组就是普通布局。

面板本身不画表面、边或内边距。每个面板里的区域自己画，包括两者之间那一条接缝线（[页面结构](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 在接缝线上 | 在接缝线处相接的列：侧栏和主区域，一段对话和它的消息列。默认，由 `ResizableHandle` 画 |
| 在空隙里 | 排在面板里、周围有 12px 空隙的卡片：对话旁边的侧边卡片（[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)） |

### 空隙手柄 {#the-gap-handle}

排在面板里的卡片，比如对话旁边的 Tasks 和 Files 卡片，没有可拖动的接缝线：每张卡片画自己的边，它和旁边之间的 12px 是空的。所以手柄就是空隙本身：卡片左边的 12px（消息列表自己的右内边距），以及两张上下堆叠的卡片之间的 12px。在空隙里画一条线，就成了卡片排布时特意不要的那条接缝线，所以手柄改为显示一根短条，读起来是一个抓手，而不是一条边。

| 状态 | 样子 |
| --- | --- |
| 静止 | 什么都没有 |
| 悬停 | 空隙中间沿着它出现一根 56 × 4px 的短条，`line-seam`，`rounded-[1px]`，和 [Drawer](../drawer/drawer.md) 的拖动条一样，停顿 150ms 后才出现，这样路过的指针不会让它闪一下；带 Resize 工具提示，鼠标指针变成调整大小的样式 |
| 拖动中 | 短条变成 `foreground-muted` |
| 键盘焦点 | 短条变成 `foreground` |

- 点击区域是沿着卡片的整条 12px 空隙，在粗略指针下是 24px，所以不占卡片的空间。双击恢复默认尺寸。
- 两条空隙交叉的地方，它们相交的 12px 方块（触屏时 24px）用移动光标同时拖动两边，就像网格的交叉点那样，悬停或拖动它时两根短条都亮起。双击它把两边都复位。这个方块只给鼠标指针用：每条空隙都保留自己的键盘手柄，和接缝线上的一样，是一个可聚焦的 `separator`。
- `ResizableHandle` 目前只画接缝线上的手柄；Raft Chat 的侧边卡片自己画空隙手柄。

## 状态 {#states}

这些是接缝线上手柄的状态；空隙手柄的状态见[空隙手柄](#the-gap-handle)。

| 状态 | 样子 |
| --- | --- |
| 静止 | 什么都没有：区域画的接缝线就标出了手柄的位置 |
| 悬停、拖动中 | 接缝线上盖一条 1px 的 `foreground-muted` 线，鼠标指针变成调整大小的样式 |
| 键盘焦点 | 接缝线上盖一条 2px 的 `foreground` 线 |

## 行为 {#behavior}

- 手柄宽 12px，居中在边界上，两边各压住面板 6px，所以不占任何一边的空间。在粗略指针下（平板上的手指）宽 24px。
- 双击手柄，列恢复默认宽度。
- 默认、最小和最大宽度用[间距](../../../../../design/foundations/spacing.md#layout-widths)里的值：每一列有自己的范围，侧栏在每个页面上保持同一个宽度（[调整列宽](../../../../../design/foundations/spacing.md#resizing-columns)）。
- 在侧栏的面板上传 `groupResizeBehavior="preserve-pixel-size"`，这样窗口变化时侧栏保持宽度，差值由主区域承担。
- 在 Raft Chat 里，768px 以下没有可以调整的并排列；服务器的公开页面从 640px 起保留它的列（[响应式布局](../../../../../design/patterns/responsive.md)）。

## 无障碍 {#accessibility}

- Resizable 包装 react-resizable-panels。每个 `ResizableHandle` 都是可聚焦的 `separator`，带 `aria-valuenow`、`aria-valuemin`、`aria-valuemax` 和 `aria-controls`。
- 键盘：沿组方向的方向键小步调整大小，Home 和 End 跳到最小和最大，Enter 折叠或恢复可折叠的面板，F6 移到下一个手柄。
- 每个手柄都加一个说明调整对象的 `aria-label`："Resize sidebar"。

## 规则 {#rules}

- Resizable 只用于人会调整的分栏。不要因为「以后可能要调整」就把固定布局包进组里。
- 不要在接缝线的手柄上画线，也不要给面板画第二条边：区域的接缝线是唯一的线。空隙手柄只画它的短条，而且只在悬停、拖动和聚焦时画。
