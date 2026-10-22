---
title: Combobox
summary: 由部件组成、可以搜索的值列表，用于带搜索的筛选器，以及从许多值里选几个、显示成标签片。
sourceHash: ff8b2a11
---

# Combobox

组合框（Combobox）是一个人们靠输入来缩小范围的值列表。raft-ui 以部件的形式提供它：一个打开带搜索行列表的筛选器，一个供人输入的输入框，或者一个装多个值的标签片输入框。如果要一个由选项数组驱动的现成输入框，用 [ComboboxSelect](../combobox-select/combobox-select.md)。

```example
combobox/compositions/tasks-channel-filter
```

## 何时使用 {#when-to-use}

各种选择器之间怎么选，完整说明见[选择组件](../../../../../design/components/overview.md#picking-something)。

| 场景 | 使用 |
| --- | --- |
| 对值很多的列表做筛选，比如频道 | 带 `ComboboxTrigger` 和搜索行的 Combobox |
| 从许多值（人、agent、标签）里选几个，在输入框里显示成标签片 | 带 `ComboboxChips` 的 Combobox |
| 在表单里从选项数组中选一个或几个 | [ComboboxSelect](../combobox-select/combobox-select.md) |
| 从最多 10 个值里选一个 | [Select](../select/select.md) |

## 结构 {#anatomy}

- `Combobox`：根部件。保存值、输入的文字和打开状态。必需。
- 打开列表的部件，三选一：
  - `ComboboxTrigger`：筛选按钮，带图标、标签、`ComboboxTriggerCount` 和 `ComboboxTriggerIndicator`；
  - `ComboboxControl`：控件高度（手机上 44px，桌面端 32px）、带墨色边框的输入框，里面是 `ComboboxInput`、`ComboboxClear` 和 `ComboboxTriggerIndicator`；
  - `ComboboxChips`：至少为控件高度的输入框，每个已选的值一个 `ComboboxChip`，每个都带一个 `ComboboxChipRemove`，后面是 `ComboboxInput`。
- `ComboboxContent`：弹出层。必需。
- `ComboboxHeader`：弹出层的顶行，带 `ComboboxLabel` 和一个 `ComboboxClear`。`ComboboxSeparator` 是它下面的细线。
- `ComboboxInputGroup`：列表顶部的搜索行，里面是 `ComboboxInput`。
- `ComboboxList`：可滚动的 `ComboboxItem` 列表，每项带一个 `ComboboxItemIndicator`（对勾）。`ComboboxGroup` 和 `ComboboxGroupLabel` 给它们分组；`ComboboxRow` 和 `ComboboxCollection` 用于网格和嵌套集合的布局。
- `ComboboxEmpty`：没有匹配项时显示的那一行。
- `ComboboxValue`、`ComboboxPortal`、`ComboboxPopup`：更底层的部件。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 筛选器（`ComboboxTrigger`） | 筛选列表：筛选器的样子见 [Select › 筛选器](../select/select.md#filters) |
| 输入框（`ComboboxControl`） | 在表单里输入以找到一个值 |
| 标签片（带 `multiple` 的 `ComboboxChips`） | 从许多值里选几个，在输入框里显示成标签片 |

```example
picker-trigger-button/compositions/combobox-filter
```

## 状态 {#states}

- **已应用的筛选器：** 有值的 `ComboboxTrigger` 填充 `info-soft` 并显示数量。
- **无匹配：** `ComboboxEmpty` 说明搜什么没找到：No one matches "zz"。
- **焦点：** 标签片输入框整体显示焦点环（[状态](../../../../../design/foundations/states.md#focus)）；弹出层里的搜索行用内嵌的墨色轮廓（[层级](../../../../../design/foundations/elevation.md#focus-ring)）。

## 行为 {#behavior}

- 随着输入筛选列表。
- 没有匹配项时显示 `ComboboxEmpty`。不要让一个空的弹出层开着。
- 用 `multiple` 时，选中一个值后列表保持打开。点击外面或按 Esc 关闭。
- 已选的值变成 `fill-muted` 上的标签片，末尾带一个移除按钮。输入接在最后一个标签片后面。
- 标签片距输入框外边缘 6px，与下一个标签片相隔 6px，所以它在桌面端高 20px、在手机上高 32px，标签片换行之前输入框保持控件高度。它和所有标签片一样用 `radius-chip`；它的移除按钮用 `radius-sticker`，缩进标签片 2px，焦点环画在按钮里面，因为画在外面会被标签片裁掉。输入框里的清除按钮距输入框末端 6px，用 `radius-chip`（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 把标签片的文字放在单独的元素里（一个 `<span>`）：值太长时在那里截断，宽度不超过输入框，完整文字作为标签片的 `title`，移除按钮保持可见（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)）。
- 选项的高度随内容：一行是 36px，每多一行只增加那一行自身的高度，文字上下的空间不变（[表单](../../../../../design/patterns/forms.md#option-height)）。
- 长选项按需要换成多行。列表随之变宽，最宽 24rem（如果输入框更宽，就到输入框的宽度），永远不超过屏幕宽度减去两边各 8px。
- 结果来自服务器时，传 `filter={null}`，让列表原样显示结果，并让输入的文字保持受控。

## 无障碍 {#accessibility}

Combobox 封装了 Base UI Combobox：一个 `role="combobox"` 的文本输入框，控制一个列表框，支持方向键导航，并播报高亮的选项。

- 给输入框命名：用 `FieldLabel`（[Field](../field/field.md)），或者在弹出层的搜索行上用 `aria-label`（Search Channels）。
- 在标签片输入框里，每个标签片的移除按钮和输入框都能用键盘到达。按值给每个移除按钮命名（Remove Bugen）。
- `ComboboxClear` 只显示图标时，给它一个说明清除什么的标签。
