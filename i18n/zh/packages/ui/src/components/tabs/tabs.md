---
title: Tabs
summary: 一排标签页，对应同一页面的各个部分，每个部分有自己的内容；选中的标签页是一张黄色贴纸，标签页放不下时这一排可以滚动。
sourceHash: 182905da
---

# Tabs

标签页在同一页面的各个部分之间切换，每个部分有自己的内容，比如一个 Agent 的资料、动态和工作区。选中的标签页是一张黄色贴纸，和选中的侧栏行或分段控件一样，表示「你在这里」。标签页放不下时，这一排可以横向滚动。

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

有多种内容的地方，比如一个 Agent，在头部下面用一排贴纸标签页展示它们（[导航](../../../../../design/patterns/navigation.md#several-views-of-one-place)）。频道的任务和文件不是标签页：它们是对话旁边的侧边分区。只有在一列太矮、放不下上下叠放的两个分区，或者分区盖住面板时，才用一行 Tasks / Files 标签页在它们之间切换（[频道的侧边列](../../../../../design/patterns/responsive.md#the-channels-side-columns)）。

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
- 藏着标签页的那一侧按边缘渐隐的长度 24px 渐隐（`mask-fade-x`，[边缘渐隐](../../../../../design/foundations/spacing.md#edges-fade)）。以前是 32px；现在和所有横向滚动的条带一致。
- 选中的标签页总是滚动到可见范围内。
- 在触屏上，标签页在手指抬起时切换，所以让滚动中的列表停下的那一次点按，也会完成切换（[手指抬起时切换](../../../../../design/patterns/navigation.md#switching-on-finger-lift)）。
- 在 `SortableTabsList` 里拖动标签页遵循[拖放](../../../../../design/patterns/drag-and-drop.md)：标签页被拿起的副本跟着手走，原位的标签页保持 40%，直到它移开，它的位置变成虚线标出的落点，其他标签页向两侧滑开，放下或取消时用 160ms 滑行到位。鼠标移动 6px 后拿起标签页；手指要先按住 500ms。拿起的副本渲染在 `document.body` 里（用 `container` 改变位置），所以抽屉或对话框的 transform 不会让它偏移。

```example
tabs/compositions/sortable
```

## 标签页自己的控件 {#a-tabs-own-controls}

一个标签页的内容有自己的控件时（视图切换、筛选、搜索、排序），把它们放在标签页内容顶部、标签页下方的一行工具栏里。每个有控件的标签页都用同样的一行，即 Tasks 页面画的那一行（[TasksPanelToolbar](../tasks/tasks.md)），这样一个人学会了一个标签页，就知道在下一个标签页里往哪儿看：

- 这一行有自己的高度和内边距，两侧是内容的边距，下方是一条 `line-seam`，内容在它下面滚动时它保持固定。内容从不紧贴这一行开始，也从不向上滚到贴着标签页。
- 筛选和搜索从这一行的左侧开始；切换视图的 [SegmentedControl](../segmented-control/segmented-control.md) 放在右端。视图切换放在左侧会正好在选中的标签页下面，两张黄色贴纸上下叠在一起，看起来像同一级。
- 没有控件的标签页就没有这一行。

## 内容 {#content}

- 标签页用 1 到 2 个词，Title Case：Profile、Activity、Workspace（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 数量放在标签后面单独的 Space Mono 元素里，不要写进标签文字。

## 无障碍 {#accessibility}

- `Tabs` 包装了 Base UI Tabs，后者提供标签列表、标签页和面板的语义以及方向键操作。
- 用它所属的地方给 `TabsList` 命名：`aria-label="launch-week"`。
- 每个只有图标的标签页都要有 `aria-label`。
- 可排序的标签页可以用鼠标指针、触屏或键盘重新排序：空格拿起获得焦点的标签页，ArrowLeft 和 ArrowRight（竖排时是 ArrowUp 和 ArrowDown）移动它，空格放下，Escape 放回原处。回车选中获得焦点的标签页；在可排序的一排里，空格不选中标签页，而是拿起它。标签页被拿起时，方向键移动的是它，而不是焦点（[拖放](../../../../../design/patterns/drag-and-drop.md#keyboard)）。
- 拖动标签页的每一步都会播报，说的是标签页的名称（它的 `aria-label` 或文字）和它在这一排里的位置，这一排用 `TabsList` 的 `aria-label` 来称呼；从不说它的值。把你的翻译作为 `messages` 传入。

## 规则 {#rules}

- 每个屏幕只用一排标签页。
- 贴纸标签页高 32px，点击区域 44px，上下各留 8px 的行高，这样选中的贴纸到上方线的距离和到下方线的距离相等。宽度跟随标签文字，背后没有轨道。
- 下划线标签页高 44px，相邻标签页相隔 20px，只有文字。
- 两种变体都在这一排下面画一条 `line-seam`。改变文字或这一排的尺寸时，检查选中的标签页上下的空间是否仍然相等。
- 第一张贴纸从内容的边缘开始，和面板头部第一个元素的边距相同（[页面结构](../../../../../design/patterns/page-structure.md#one-edge-per-column)）。深色模式下，选中的贴纸和所有贴纸一样有模切边，所以它与头部的头像对齐（[深色模式](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)）。
