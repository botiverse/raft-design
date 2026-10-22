---
title: Field
summary: 表单控件周围的标签、帮助文字和错误信息，并为辅助技术与控件关联起来。
sourceHash: 04c4e8a1
---

# Field

Field 把标签放在表单控件上方、帮助文字放在下方，值无效时用错误信息替换帮助文字。表单里的每个输入框、多行输入框和下拉选择都放在 Field 里。

```example
field/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 表单中带标签的控件：输入框、多行输入框、下拉选择 | Field |
| 标签在旁边的复选框、单选按钮或开关 | Field 加 `FieldItem` |
| 带开关的设置行 | 设置行（[ListRow](../list-row/list-row.md)）加 [Switch](../switch/switch.md) |
| 大表单中的一节，带标题和说明 | [FormSection](../form-section/form-section.md) |

## 结构 {#anatomy}

- `Field`：容纳各部分的那一列。必需。
- `FieldLabel`：标签，在控件上方。必需，除非控件自己有无障碍名称。
- 控件：[Input](../input/input.md)、[InputGroup](../input-group/input-group.md)、[Textarea](../textarea/textarea.md)、[Select](../select/select.md)，其他原生控件用 `FieldControl`。
- `FieldDescription`：控件下方的帮助文字。可选。
- `FieldError`：错误信息，替换帮助文字的位置。只在字段无效时显示。
- `FieldItem`：一行，把复选框、单选按钮或开关放在它的标签和说明旁边，间隔 8px。它通过移动控件让控件对准标签的第一行居中，所以行高不变：开关会超出标签那一行，而不是把行撑高。它根据自身的行高计算位置，所以**给它和标签相同的 `size`**：`<FieldItem size="sm">` 配 `<FieldLabel size="sm">`。不一致时控件会偏 1px（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。
- `FieldValidity`：读取字段的有效性状态，用于自定义消息。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `FieldLabel` 默认 | 表单字段 |
| `FieldLabel size="sm"` | 紧凑的布局，默认标签在那里太大 |

```example
field/compositions/compact-label
```

## 状态 {#states}

```example
field/compositions/error
```

- **无效：**在 `Field` 上设置 `invalid`，在控件上设置 `data-invalid`。控件的边框变成 `danger-strong`，`FieldError` 以 `danger-strong` 显示，取代 `FieldDescription`。什么时候校验、提示怎么写，见[表单](../../../../../design/patterns/forms.md#validation)。
- **禁用：**`Field` 上的 `disabled` 会把标签、帮助文字和错误信息变成 `foreground-disabled`。

## 内容 {#content}

标签和帮助文字放在哪里，见[表单](../../../../../design/patterns/forms.md#fields)。

- 标签始终可见。不要用浮动标签，也不要用占位文字代替标签。
- 标签用句首大写（sentence case）：Agent name。
- 用 `optional` 标出可选字段，它会加上 "(optional)"。不要标必填字段：标出可选的就够了。
- 帮助文字写一行，说明这个值用来做什么：Shown in chat and on tasks。
- 错误信息要说明怎么改，并给一个正确的例子：Use lowercase and dashes: launch-week（[写作](../../../../../design/content/writing.md#do-and-dont)）。
- 标签、帮助文字或错误信息无论多长都会换行，比一行还宽的单词会在词内断开，所以它们不会把字段、对话框或屏幕撑宽。出于同样的原因，`FieldItem` 允许标签那一列收缩（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)）。

## 无障碍 {#accessibility}

Field 包装 Base UI Field。它把标签、说明和错误信息关联到 Base UI 控件（Input、Select、Checkbox、Switch、RadioGroup），并把字段的无效和禁用状态传给控件。

- 控件不是 Base UI 控件时（例如 [Textarea](../textarea/textarea.md)），给 `FieldLabel` 一个与控件 `id` 匹配的 `htmlFor`，并把 `aria-describedby` 指向说明。
- `FieldError` 带有 `role="alert"`，所以错误出现时会被读出来。
