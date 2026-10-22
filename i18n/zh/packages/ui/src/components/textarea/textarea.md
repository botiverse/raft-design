---
title: Textarea
summary: 表单里的多行文本输入框，至少三行高，可选配字数计数。
sourceHash: 4d10206b
---

# Textarea

多行输入框在表单里接收几行文字：一段描述、一条备注、给 Agent 的说明。它的墨色边框和状态与 [Input](../input/input.md) 相同，高度至少是三行字段文字（手机上 96px，桌面端 90px），人可以把它拖高。

```example
textarea/compositions/with-field
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 随表单保存的几行文字 | Textarea |
| 一行文字 | [Input](../input/input.md) |
| 要发送的消息 | [Composer](../composer/composer.md) |

## 结构 {#anatomy}

- `Textarea`：输入框。必需。
- `TextareaGroup`：容纳输入框和它的计数。只在有计数时需要。
- `TextareaCounter`：当前字数和上限，在输入框下方的末端（72/280）。

## 状态 {#states}

- **无效：**`data-invalid` 给输入框加上 `danger-strong` 边框；提示信息放在字段里（[Field](../field/field.md)）。
- **超出上限：**字数一超过上限，计数就变成加粗的 `danger-strong`。
- **禁用：**统一的禁用样子（[状态](../../../../../design/foundations/states.md)），并且不能再调整大小。禁用优先于无效。

## 行为 {#behavior}

- 让人可以把输入框拖高。它永远不会矮于三行字段文字。
- 要让它随内容增高，把 `field-sizing-content` 和最大高度一起用，这样长草稿会在输入框里滚动，而不是把页面往下推。
- 值有上限时加上计数。把当前值和上限传给 `TextareaCounter`。
- 计数显示上限时，不要用原生的 `maxLength`：`maxLength` 会在达到上限时阻止输入，计数就永远无法显示文字超出了上限。

## 无障碍 {#accessibility}

Textarea 渲染原生的 `<textarea>`；它不是 Base UI 控件。

- 用 `FieldLabel` 给它命名，其 `htmlFor` 与输入框的 `id` 一致（[Field](../field/field.md)）。
- `data-invalid` 也会设置 `aria-invalid`。
- 上限重要时，在 `aria-describedby` 里引用计数，这样它会和输入框一起被读出。
