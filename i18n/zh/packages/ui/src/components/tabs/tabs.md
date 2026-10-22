---
title: Tabs
summary: 一排标签页，对应同一页面的各个部分，每个部分有自己的内容；选中的标签页是一张黄色贴纸，标签页放不下时这一排可以滚动。
sourceHash: a74ac108
---

# Tabs

标签页在同一页面的各个部分之间切换，每个部分有自己的内容，比如一个频道的聊天、任务和文件。选中的标签页是一张黄色贴纸，和选中的侧栏行或分段控件一样，表示「你在这里」。标签页放不下时，这一排可以横向滚动。

```example
tabs/compositions/placement
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 同一页面的各个部分，每个部分有自己的内容 | Tabs |
| 同一内容的另一种视图 | [SegmentedControl](../segmented-control/segmented-control.md) |
| 一个流程中按顺序排列的步骤 | [Steps](../steps/steps.md) |
| 产品的目的地 | [AppRail](../app-rail/app-rail.md)、[MobileNav](../mobile-nav/mobile-nav.md) |

有多种内容的地方，比如频道，在头部下面用一排贴纸标签页展示它们（[导航](../../../../../design/patterns/navigation.md#several-views-of-one-place)）。

## 结构 {#anatomy}

- `Tabs`：根部件。保存选中的值和 `placement`。
- `TabsList`：一排标签页。
- `TabsTab`：一个标签页，`TabsLabel` 前面可以有一个图标。
- `TabsPanel`：一个标签页的内容。
- `SortableTabsList` 和 `SortableTabsTab`：人们可以拖动来重新排序的一排标签页。`useOrderedTabs` 恢复保存过的顺序。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 贴纸标签页：选中的标签页是一张黄色贴纸。默认值 |
| `variant="underline"` | 标签页很多，或者所在的地方已经有很多颜色：选中的标签页是墨色文字，在这一排的底边上有一条 2px 的墨色线 |

贴纸标签页是默认值，也是产品实际用的那种：选中的标签页表示「你在这里」，和选中的侧栏行或分段一样，所以用同样的黄色贴纸（[导航](../../../../../design/patterns/navigation.md#where-you-are)）。下划线保留为一个变体。`placement` 把这一排放在面板的上方（默认）、下方、左侧或右侧。

## 行为 {#behavior}

- 标签页放不下时，这一排自己滚动。标签页从不换到第二行，也从不缩小文字。
- 这一排不显示滚动条，竖向滚动鼠标滚轮会让它横向滚动。
- 藏着标签页的那一侧在 32px 内渐隐。
- 选中的标签页总是滚动到可见范围内。

## 标签页自己的控件 {#a-tabs-own-controls}

一个标签页的内容有自己的控件时（视图切换、筛选、搜索、排序），把它们放在标签页内容顶部、标签页下方的一行工具栏里。每个有控件的标签页都用同样的一行，即任务标签页画的那一行（[TasksPanelToolbar](../tasks/tasks.md)），这样一个人学会了一个标签页，就知道在下一个标签页里往哪儿看：

- 这一行有自己的高度和内边距，两侧是内容的边距，下方是一条 `line-seam`，内容在它下面滚动时它保持固定。内容从不紧贴这一行开始，也从不向上滚到贴着标签页。
- 筛选和搜索从这一行的左侧开始；切换视图的 [SegmentedControl](../segmented-control/segmented-control.md) 放在右端。视图切换放在左侧会正好在选中的标签页下面，两张黄色贴纸上下叠在一起，看起来像同一级。
- 没有控件的标签页就没有这一行。

## 内容 {#content}

- 标签页用 1 到 2 个词，Title Case：Chat、Tasks、Files（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 数量放在标签后面单独的 Space Mono 元素里，不要写进标签文字。

## 无障碍 {#accessibility}

- `Tabs` 包装了 Base UI Tabs，后者提供标签列表、标签页和面板的语义以及方向键操作。
- 用它所属的地方给 `TabsList` 命名：`aria-label="launch-week"`。
- 每个只有图标的标签页都要有 `aria-label`。
- 可排序的标签页用鼠标指针或触屏重新排序；不支持用键盘重新排序。

## 规则 {#rules}

- 每个屏幕只用一排标签页。
- 贴纸标签页高 32px，点击区域 44px，上下各留 8px 的行高，这样选中的贴纸到上方线的距离和到下方线的距离相等。宽度跟随标签文字，背后没有轨道。
- 下划线标签页高 44px，相邻标签页相隔 20px，只有文字。
- 两种变体都在这一排下面画一条 `line-seam`。改变文字或这一排的尺寸时，检查选中的标签页上下的空间是否仍然相等。
- 第一张贴纸从内容的边缘开始，和面板头部第一个元素的边距相同（[页面结构](../../../../../design/patterns/page-structure.md#one-edge-per-column)）。深色模式下，选中的贴纸和所有贴纸一样有模切边，所以它与头部的头像对齐（[深色模式](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)）。
