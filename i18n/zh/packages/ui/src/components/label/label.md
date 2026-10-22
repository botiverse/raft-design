---
title: Label
summary: 独立使用的表单标签，样式与输入框标签相同，可以带必填或选填标记，以及一行次要文字。
sourceHash: f96cf817
---

# Label

Label 是一个 `label` 元素，样式与输入框标签相同：`text-footnote`、半粗体、`foreground-muted`。控件需要标签但不在 [Field](../field/field.md) 里时用它；在 Field 里，标签是 `FieldLabel`，它会自己关联到控件。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 表单里的控件：输入框、多行输入框、选择器 | [Field](../field/field.md) 里的 `FieldLabel` |
| 表单里旁边带标签的复选框、单选框或开关 | [Field](../field/field.md) 里的 `FieldItem` |
| 不在 Field 里的控件的标签，比如列表里的复选框 | Label |
| 可选择的选项卡片的标题 | `variant="option"` 的 [Card](../card/card.md) 里的 `CardTitle` |

## 结构 {#anatomy}

- `Label`：标签本身。文字说明控件里装的是什么。必需。
- `LabelOptional`：文字后面的选填标记 "(optional)"，用 `foreground-hint`。
- `LabelAsterisk`：必填标记，一个 `foreground-hint` 的星号。
- `LabelSub`：标签后面的其他次要文字，用 `foreground-hint`、常规字重。

这些标记也可以写成 `Label.Optional`、`Label.Asterisk` 和 `Label.Sub`。`FieldLabel` 通过 `optional` 和 `required` 属性画出同样的两种标记。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `size="md"`（默认） | 表单和设置里的标签 |
| `size="sm"` | 默认尺寸放不下的紧凑布局 |

## 状态 {#states}

- **禁用：** `disabled` 把标签和它的标记变成 `foreground-disabled`，并设置 `aria-disabled`。它不会禁用控件：控件也要禁用。

## 内容 {#content}

- 标签写成名词，说明控件里装的是什么，用 sentence case（句首大写）：Email address（[写作](../../../../../design/content/writing.md#casing)）。
- 选填的输入框用 `LabelOptional` 标出（[表单](../../../../../design/patterns/forms.md#fields)）。

## 无障碍 {#accessibility}

- Label 渲染原生的 `label`。用 `htmlFor` 和控件的 `id` 把它和控件关联起来，或者把控件包在它里面。
- 标记会作为标签的一部分被读出来："Middle name (optional)"。
