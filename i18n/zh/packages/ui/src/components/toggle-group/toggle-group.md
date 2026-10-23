---
title: ToggleGroup
summary: 灰色轨道里一排紧凑的切换按钮，每个按钮各自开关，或者只能开其中一个或都不开；按下的按钮是一张黄色贴纸。
sourceHash: 06c4b156
---

# ToggleGroup

切换按钮组是灰色轨道里的一排按钮，人可以把它们按下或弹起：Bold、Italic 和 Underline，或一排筛选条件，每个都可以单独选中（[由现有部件搭成](../../../../../design/components/overview.md#a-row-of-toggle-buttons)）。带 `multiple` 时，可以有任意多个按下；不带时，只能按下一个或一个都不按。按下的按钮是一张黄色贴纸。

```example
toggle-group/compositions/formatting
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 紧凑的一排里有几个选项，每个各自开关 | 带 `multiple` 的 ToggleGroup |
| 几个选项中选一个，或者都不选 | ToggleGroup |
| 2 到 4 个视图中选一个，并且总有一个被选中 | [SegmentedControl](../segmented-control/segmented-control.md) |
| 随表单一起保存的选项 | [Checkbox](../checkbox/checkbox.md) |
| 一项立即生效的设置 | [Switch](../switch/switch.md) |
| 按某个值筛选列表 | 筛选器（[PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md)） |

完整的表格见[选择组件](../../../../../design/components/overview.md#picking-something)。

## 结构 {#anatomy}

- `ToggleGroup`：轨道，用 `fill-muted`。它的 `value` 是按下的项的列表。必需。
- `ToggleGroupItem`：一个 32px 的按钮，由它的 `value` 标识。必需，至少 2 个。
  - 图标：可选，16px。可以单独使用（必须有 `aria-label`，见[无障碍](#accessibility)）。
  - `ToggleGroupLabel`：可见的标签。这一排太窄时会截断。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `multiple` | 可以组合的选项：Bold 和 Italic 可以同时开 |
| 不带 `multiple` | 互相排斥、并且都不选也是一种答案的选项：可以清除的对齐方式 |
| `orientation="vertical"` | 窄列里竖着排的一组切换按钮 |

```example
toggle-group/compositions/alignment
```

```example
toggle-group/compositions/vertical
```

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 未按下 | 轨道上的 `foreground-muted` 文字；悬停和按下时用中档 |
| 已按下 | 一张黄色贴纸，标签加粗（[颜色](../../../../../design/foundations/color.md#stickers)）。悬停时不变；按下时铺上 `sticker-medium`（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)） |
| 禁用的项、禁用的组 | `foreground-disabled` 文字，对悬停和按下没有反应（[状态](../../../../../design/foundations/states.md)） |

```example
toggle-group/compositions/item-disabled
```

```example
toggle-group/compositions/disabled
```

## 行为 {#behavior}

- 横向的组放不下所有项时会换到新的一行，宽度从不超过它的容器。
- 两种变体下，按一个已按下的项都会把它弹起。
- 各项在轨道内缩进 3px，彼此间隔 3px，和 [SegmentedControl](../segmented-control/segmented-control.md) 的分段一样。
- 各项高 32px，不把点击区域扩展到 44px。在触屏上，这低于[点击目标](../../../../../design/foundations/spacing.md#hit-targets)的要求。

## 内容 {#content}

- 每一项的标签写它开启的东西，用 Title Case：Bold、Numbered List（[写作](../../../../../design/content/writing.md#casing)）。

## 无障碍 {#accessibility}

- `ToggleGroup` 包装 Base UI 的 ToggleGroup，每个 `ToggleGroupItem` 包装 Base UI 的 Toggle：每一项都是带 `aria-pressed` 的按钮，方向键沿 `orientation` 的方向在各项之间移动焦点，到两端时循环（`loopFocus`）。
- 用 `aria-label` 按它控制的东西给组命名："Text formatting"、"Text alignment"。
- 每个只有图标的项都要有 `aria-label`（"Align left"），并隐藏它的图标（`aria-hidden`）。

## 规则 {#rules}

- 不要用切换按钮组来切换视图或分区：总要显示一个视图，而切换按钮组可以一个都不选。改用 [SegmentedControl](../segmented-control/segmented-control.md) 或 [Tabs](../tabs/tabs.md)。
