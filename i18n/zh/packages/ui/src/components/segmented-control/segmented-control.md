---
title: SegmentedControl
summary: 灰色轨道里的 2 到 4 个分段，在原处切换同一内容的显示方式；选中的分段是一张黄色贴纸。
sourceHash: 0cb65948
---

# SegmentedControl

分段控件（SegmentedControl）在原处切换同一内容的 2 到 4 种视图：同一批任务的看板或列表，浅色或深色外观。分段放在灰色轨道里，选中的那个是一张黄色贴纸。

```example
segmented-control/compositions/view-mode
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 同一内容的另一种视图：Board / List、Light / Dark / System | SegmentedControl |
| 一个页面的几个部分，各有各的内容 | [Tabs](../tabs/tabs.md) |
| 随表单提交的答案，比如公开还是私密 | [RadioGroup](../radio-group/radio-group.md) |
| 选项多到放不进分段 | [Select](../select/select.md) |
| 可以同时选好几个的选项，比如要显示哪些 runtime | [Checkbox](../checkbox/checkbox.md)，或者 [DropdownMenu](../dropdown-menu/dropdown-menu.md) 里的勾选项 |
| 给列表筛选、分组、排序：状态、runtime、分组、排序 | 显示当前值的筛选按钮（[Select › 筛选](../select/select.md#filters)） |
| 本来就在某个菜单里的设置 | 那个 [DropdownMenu](../dropdown-menu/dropdown-menu.md) 里的单选项或勾选项 |

分段控件是从 2 到 4 个都能排在一行里的短选项里选一个：要么是紧跟在它下面那份内容换一种看法（Board / List），要么是一项立即生效的设置（12 小时制 / 24 小时制，[表单](../../../../../design/patterns/forms.md#a-settings-row)）。别的都不要做成分段（Artea，2026-11-09，#proj-raft-ui:c1fde219）：

- 不能同时有好几个分段被选中。一排分段读起来就是「选一个」，选了好几个看起来像 bug。可以组合的选项用勾选框。
- 分段不能折到第二行。需要更多地方的选择，用 Select 或菜单里的单选项。
- 不要把列表的筛选、分组和排序做成一排排分段控件，工具栏里不行，sheet 里也不行：它们是显示当前值的筛选按钮（[Select › 筛选](../select/select.md#filters)）。菜单里的设置也不要：在菜单里，每一项都是一组单选项或勾选项，菜单本来就是这样表示选择的。

完整的表格见[选择组件](../../../../../design/components/overview.md#picking-something)。Board / List 在任务列表里放在哪里，见[任务](../../../../../design/patterns/tasks.md)。

## 结构 {#anatomy}

- `SegmentedControl`：轨道，用 `fill-muted`。
- `SegmentedControlItem`：一个 32px 的分段，标签前可选一个图标。
- `SegmentedControlLabel`：分段的文字。会截断。
- `SegmentedControlCount`：标签后面的数量，用 Space Mono 字体。

```example
segmented-control/compositions/filters
```

## 状态 {#states}

- 选中：一张黄色贴纸，标签加粗。悬停时不变，和选中的标签页一样；按下时叠一层 `sticker-medium`（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。
- 其他分段是 `foreground-muted`，悬停和按下时用中间一档 `fill-medium`。
- 禁用：设置在整个控件上，见[状态](../../../../../design/foundations/states.md)。
- 放在外框里（顶栏）时，设 `variant="on-frame"`：轨道用外框的中档填充色，其他分段用 `foreground-on-frame-muted`（悬停和按下时用 `foreground-on-frame`，并叠加外框的中档叠加层 `overlay-frame-medium`），选中的分段用外框的激活色：`layer-frame-active` 加 `line-frame-active` 描边、`foreground-on-frame-active` 文字。黄色外框上是白色，深色外框上是黄色，和导航条上选中的一项一样。黄色贴纸放在黄色外框上看不出是选中的，旁边白色的那一格反而像被选中了。在手机上顶栏放不下它，就把它放进菜单，不放在顶栏上。

```example
segmented-control/compositions/disabled
```

## 行为 {#behavior}

- 分段距轨道 3px，彼此相隔 3px，所以两个分段之间的间隔等于分段到轨道的间隔（[间距](../../../../../design/foundations/spacing.md#spacing)）。
- 把分段控件放在页面背景上，它切换的内容紧接在它下面。不要给只放一个分段控件的行一条上下带分隔线的专属栏：控件属于它的内容（[桌面端密度](../../../../../design/foundations/desktop-density.md#7-a-divider-separates-regions-not-a-control-from-what-it-controls)）。有几个工具的工具栏保留接缝。
- 它是行里唯一的东西时，从行的起点开始。只有在有意和其他工具编组时才放在末端（stdrc，2026-11-04）。
- 头部下面单独的分段控件是内容的一部分，它周围的空白要说明这一点：上方是内容的顶部内边距（`page-top`：用鼠标时 12px，触屏上是页面内边距，和头部下面没有控件时内容开始的距离一样）；下方到内容第一项是组内间距（8px），所以较大的间距在上方，它和它切换的内容读成一个整体。轨道从内容的边距开始，而不是对齐头部的按钮（stdrc，2026-11-05；[桌面端密度](../../../../../design/foundations/desktop-density.md#4-space-says-what-belongs-together)）。
- 轨道紧贴它的分段。不要把它拉伸到填满容器：拉伸的轨道会在分段旁边留出一段空的灰色。
- 分段从不缩小。行太窄时，先让旁边的元素让位，然后分段只显示图标（[响应式布局](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)）。如果行还要更窄，或者调用方没有设 `iconsOnlyBelow`，轨道缩到行的宽度，分段在轨道里横向滚动，选中的那段保持可见，而不是溢出到旁边的控件上；这时它带 `data-overflowing`。这是最后的退路，不是布局：在可能变窄的行里，设 `iconsOnlyBelow="auto"`。
- 要让分段只显示图标，设 `iconsOnlyBelow="auto"`。这样控件恰好在带标签的分段放不进给它的宽度时只显示图标，放得下时又显示标签。每个分段变成只显示图标的 32px 正方形：它的标签和数量仍是它的无障碍名称，悬停和键盘聚焦时用工具提示显示标签。控件保持 32px 高度和原来的字号。只有每个分段都有图标时才设置 `iconsOnlyBelow`：没有图标的分段会变成空的，raft-ui 在开发环境下会发出警告。
- 优先用 `auto`，而不是一个宽度。标签的宽度随语言、数量和字体变化，为其中一种情况选的宽度对其他情况就不对；控件拿到的宽度也随旁边的东西变化（一个时有时无的 Mark all read 按钮）。`auto` 拿带标签的分段和控件拿到的空间比较，不管旁边是什么：在一行里，让控件可以自由缩小（它是 `min-w-0`；不要设成 `shrink-0`），和旁边的元素分享这一行。它在第一帧绘制之前做判断，之后每当空间、某个标签、某个数量或选中项变化时再判断一次，而且总是按带标签的布局来量，所以只有标签放得下时才回到标签，在临界宽度上从不闪烁。
- 在 [FitToolbar](../fit-toolbar/fit-toolbar.md) 里，控件跟随工具栏：把工具栏的 `label` 步骤给它（把 `useFitItem({ label })` 的 props 展开到它上面），这一步生效期间它只显示图标。它自己的 `iconsOnlyBelow` 在那里不起作用，这样工具栏和控件不会把同一块空间量两遍、得出不同的结果；工具栏知道还有什么要先让位。只有文字的控件（带计数的 Mine 和 All）拒绝这一步，保留标签：没有图标，就没有东西可显示了（Jasper 和 sindresorhus，2026-11-10）。
- 固定的宽度则是容器查询：用 `@container` 标记这一行，把 `iconsOnlyBelow` 设为一个行宽，低于它时分段只显示图标。它可以是 Tailwind 的容器尺寸 `xs`（20rem）、`sm`（24rem）、`md`（28rem）、`lg`（32rem）、`xl`（36rem）或 `2xl`（42rem），也可以是任意以 `px`、`rem` 或 `em` 为单位的长度（`"18.5rem"`、`"296px"`）。长度由脚本对照最近的 `@container` 来量（没有时对照控件的父元素）；尺寸则是 CSS 容器查询。按行的宽度来选，而不是按窗口：同一行会出现在不同宽度的列里，容器查询跟随的是列。
- 只有当它是表单里唯一的选择时才拉伸它。这时让它单独占一行、用满宽度（`w-full`），不要和其他控件放在同一行，并让各分段平分宽度：在一行里，不能缩小的满宽轨道会挤到旁边的元素。
- 在手机上，最多用 4 个分段，放不下时用 `iconsOnlyBelow="auto"` 只显示图标（[响应式布局](../../../../../design/patterns/responsive.md#phone)）。
- 在触屏上，分段在手指抬起时切换，这样一次停下滚动列表的点按也能切换（[手指抬起时切换](../../../../../design/patterns/navigation.md#switching-on-finger-lift)）。

```example
segmented-control/compositions/fit-row
```

用 `auto` 或长度时，分段只显示图标期间，轨道带 `data-icons-only`，供按它给某个部分设样式的调用方使用（`in-data-icons-only:`）。用尺寸时它是容器查询，轨道什么都不带。

```example
segmented-control/compositions/narrow-row
```

## 内容 {#content}

- 每个分段的标签用 1 到 2 个词，用 sentence case：Board、List；Relevant、Recent（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 数量放在 `SegmentedControlCount` 里，永远不要写进标签文字。
- 默认选项放在第一个：卡片是默认时 Cards 在 List 前面，System 在 Light 和 Dark 前面（stdrc，2026-11-05）。键盘顺序随之改变。本身是刻度或位置的顺序（Small、Medium、Large；Top、Middle、Bottom）保持不变。

## 无障碍 {#accessibility}

- `SegmentedControl` 封装了 Base UI RadioGroup，每个 `SegmentedControlItem` 是渲染为按钮的 Base UI Radio：整个控件是一个 Tab 停靠点，方向键移动选择。
- 在 [FitToolbar](../fit-toolbar/fit-toolbar.md) 里，控件是工具栏的一个项，工具栏仍只有一个 Tab 停靠点：只有当控件持有工具栏的停靠点时，它的分段才在 Tab 顺序里；工具栏的方向键按阅读顺序和工具栏的其他控件一起在分段间移动焦点，但不选中；按空格或 Enter 选中。工具栏里多出一个 Tab 停靠点，或方向键一边移动一边选中，都会打破工具栏只有一个停靠点的键盘模型（[FitToolbar › Accessibility](../fit-toolbar/fit-toolbar.md#accessibility)，WCAG 2.4.3）。
- 用 `aria-label` 按它切换的内容给控件命名：「Task view」「Time format」。
- 给每个只有图标的分段一个 `aria-label`。因为 `iconsOnlyBelow` 而只显示图标的分段不需要：它的标签仍在里面，只是视觉上隐藏，辅助技术仍能读到。
