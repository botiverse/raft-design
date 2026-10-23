---
title: SegmentedControl
summary: 灰色轨道里的 2 到 4 个分段，在原处切换同一内容的显示方式；选中的分段是一张黄色贴纸。
sourceHash: 2ddc571a
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
| 随表单提交的答案 | [RadioGroup](../radio-group/radio-group.md) |
| 选项多到放不进分段 | [Select](../select/select.md) |

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
- 轨道紧贴它的分段。不要把它拉伸到填满容器：拉伸的轨道会在分段旁边留出一段空的灰色。
- 分段从不缩小。行太窄时，先让旁边的元素让位，然后分段只显示图标（[响应式布局](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)）。如果行还要更窄，或者调用方没有设 `iconsOnlyBelow`，轨道缩到行的宽度，分段在轨道里横向滚动，选中的那段保持可见，而不是溢出到旁边的控件上；这时它带 `data-overflowing`。这是最后的退路，不是布局：在可能变窄的行里，设 `iconsOnlyBelow`。
- 要让分段只显示图标，用 `@container` 标记这一行，并在控件上把 `iconsOnlyBelow` 设为标签放不下时的行宽：`xs`（20rem）、`sm`（24rem）、`md`（28rem）、`lg`（32rem）、`xl`（36rem）或 `2xl`（42rem）。低于这个宽度时，每个分段变成只显示图标的 32px 正方形：它的标签和数量仍是它的无障碍名称，悬停和键盘聚焦时用工具提示显示标签。控件保持 32px 高度和原来的字号。只有每个分段都有图标时才设置 `iconsOnlyBelow`：没有图标的分段会变成空的。
- 按行的宽度来选，而不是按窗口：同一行会出现在不同宽度的列里，容器查询跟随的是列。
- 只有当它是表单里唯一的选择时才拉伸它。这时让它单独占一行、用满宽度（`w-full`），不要和其他控件放在同一行，并让各分段平分宽度：在一行里，不能缩小的满宽轨道会挤到旁边的元素。
- 在手机上，最多用 4 个分段，放不下时用 `iconsOnlyBelow` 只显示图标（[响应式布局](../../../../../design/patterns/responsive.md#phone)）。

```example
segmented-control/compositions/narrow-row
```

## 内容 {#content}

- 每个分段的标签用 1 到 2 个词，Title Case：Board、List；Relevant、Recent（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 数量放在 `SegmentedControlCount` 里，永远不要写进标签文字。

## 无障碍 {#accessibility}

- `SegmentedControl` 封装了 Base UI RadioGroup，每个 `SegmentedControlItem` 是渲染为按钮的 Base UI Radio：整个控件是一个 Tab 停靠点，方向键移动选择。
- 用 `aria-label` 按它切换的内容给控件命名：「Task view」「Time format」。
- 给每个只有图标的分段一个 `aria-label`。因为 `iconsOnlyBelow` 而只显示图标的分段不需要：它的标签仍在里面，只是视觉上隐藏，辅助技术仍能读到。
