---
title: FilterChip
summary: 生效中的筛选，显示为一个 info-soft 标签片，放在始终写着「筛选」的 Filter 按钮旁边，带一个把筛选恢复为默认值的 ×。
sourceHash: 595af2f8
---

# FilterChip

FilterChip 放在始终写着「筛选」的 Filter 按钮旁边，写出生效中的筛选。它是已应用筛选的样子：和按钮一样高的 `info-soft` 填充，以及一个把筛选恢复为默认值的 ×。只有筛选不同于默认值时它才显示。人们很少改动、凭习惯设置的筛选，比如动态里的「未读」或「提及」，就把它和 Filter 按钮的模式（[Select › 筛选器](../select/select.md#filters)）一起使用。

```example
filter-chip/compositions/filter-button
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 人们很少改动、凭个人习惯设置的筛选，按地方为他们记住 | FilterChip，放在始终写着「筛选」的 Filter 按钮旁边 |
| 人们工作时经常改动的筛选，或者它的值就是这个视图要点的筛选（排序、频道、负责人） | 显示当前值的筛选按钮（[PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md)） |
| 能放多个值的输入框里选中的一个值（人、标签） | 组合框自己的标签片（[Combobox](../combobox/combobox.md)） |
| 不能移除的标签 | [Badge](../badge/badge.md) |

## 结构 {#anatomy}

- `FilterChip`：标签片本身。必需。
- 开头的图标：可选，14px，和菜单里这个筛选的选项用同一个图标。
- `FilterChipLabel`：筛选的名称，和菜单里写的一样（「未读」）。必需。
- `FilterChipRemove`：把筛选恢复为默认值的 ×。必需。

把标签片紧接着放在 Filter 按钮后面，相距 8px，在同一行里。

## 状态 {#states}

- 标签片本身没有悬停状态：只有 × 有悬停和按下，用中档填充（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。
- × 的键盘焦点环画在它自己的框里面，因为标签片太紧，环画不到外面。

## 行为 {#behavior}

- 只在筛选不同于默认值时渲染标签片。是默认值时，Filter 按钮单独放着。
- 按 × 一步把筛选恢复为默认值，不打开菜单。然后标签片消失。
- 标签片和 Filter 按钮一样高，32px，在手机上也是。× 是 24px，离标签片末端 4px。它的墨色比开头图标的墨色离边缘更远：和标签上的 × 一样（[对齐 › 标签片](../../../../../design/foundations/alignment.md#chips)），它保持自己的内缩距离，而不是去对齐墨色到边缘的距离。
- 一行太窄时，标签截断，图标和 × 保留。

## 内容 {#content}

- 筛选的名称和它在菜单里的选项完全一样：「未读」「提及」「已置顶」。不要加上「筛选」这个词，也不要加动词。
- 在 × 的 `aria-label` 里，按它做的事给它命名：「清除筛选」；默认值是「全部」时写「显示全部」。

## 无障碍 {#accessibility}

- FilterChip 和 FilterChipLabel 是纯文字。标签片没有角色：读屏软件在这一行的文字中读出它的标签。
- FilterChipRemove 封装了 Base UI 的 Button，并且必须有 `aria-label`，因为它只显示一个符号。
- × 会把自己移除。在它的按下处理函数里，把焦点移到 Filter 按钮上，这样键盘焦点留在这一行里，而不是掉回页面。
- 开头的图标对辅助技术隐藏（`aria-hidden`）。

## 规则 {#rules}

- 只在始终写着「筛选」的 Filter 按钮旁边用 FilterChip：显示值的筛选按钮已经写出了筛选，再加一个标签片就说了两遍。
- 每个 Filter 按钮只显示一个标签片，对应它应用的那一个筛选。
- 不要把标签片本身做成按钮。Filter 按钮改变筛选；× 只是把它恢复为默认值。
