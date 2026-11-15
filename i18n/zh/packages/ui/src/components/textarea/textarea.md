---
title: Textarea
summary: 表单里的多行文本输入框，至少三行高，可选配字数计数。
sourceHash: d7d34b7f
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
- 要让它随内容增高，把 `field-sizing-content` 和最大高度一起用，这样长草稿会在输入框里滚动，而不是把页面往下推。会滚动的输入框用 `ScrollAreaTextarea`（[会滚动的输入框](#a-field-that-scrolls)）。
- 值有上限时加上计数。把当前值和上限传给 `TextareaCounter`。
- 计数显示上限时，不要用原生的 `maxLength`：`maxLength` 会在达到上限时阻止输入，计数就永远无法显示文字超出了上限。

## 会滚动的输入框 {#a-field-that-scrolls}

`Textarea` 是原生的 `<textarea>`，而会滚动的原生 textarea 显示的是平台自己的滚动条：在 Windows 上，或者在设为始终显示滚动条的 Mac 上，是一条经典滚动条，出现时会占掉文字的空间，颜色也是平台的颜色。大多数多行输入框只有几行，从不滚动，所以 `Textarea` 保持原生。输入框本来就会滚动时（高度有上限 `max-h-*`，或者 `rows` 固定而文字很长，比如给 Agent 的说明），用 [`ScrollAreaTextarea`](../scroll-area/scroll-area.md#textarea)，画成输入框的样子。textarea 里放不下 raft-ui 的滚动条，所以 `ScrollAreaTextarea` 在 textarea 外面套一层外框，把滚动条画在外框上。

```example
textarea/compositions/scrolling
```

- `textareaScrollAreaVariants()`（`@botiverse/raft-ui/wip`）给出输入框的样子，分在两个元素上：`wrapper()` 给 `wrapperClassName`，`textarea()` 给 `className`。外框画边框、圆角、背景和焦点环；textarea 保留输入框的字体和内边距。不要手动把 Textarea 的 class 复制到任何一个元素上。
- 高度上限设在外框上：`wrapper({ className: "max-h-40" })`，让 textarea 长到这个高度：`textarea({ className: "field-sizing-content" })`。固定高度的输入框，把 `rows` 传给 textarea。textarea 永远不会比有上限的外框高，所以它的调整大小手柄停在上限处，和有上限的 Textarea 一样；没有上限时，外框随它一起增高。输入框永远不矮于三行字段文字，和 Textarea 一样；值相同时，两者的尺寸也相同。
- 状态从外框里的 textarea 读取：`disabled` 给出统一的禁用样子，`data-invalid` 给出 `danger-strong` 边框。在 `data-invalid` 旁边自己设置 `aria-invalid`：`Textarea` 会加上它，`ScrollAreaTextarea` 则把原生属性原样传下去。
- 鼠标指针在输入框上或文字滚动时显示滚动条，并且只在文字比输入框高时显示。它在下方角落之前停下，那里是 textarea 调整大小的手柄。
- 和任何多行输入框一样命名：用 `FieldLabel`，其 `htmlFor` 与它的 `id` 一致。`id`、`ref`、`value` 和其他所有原生属性都传给 textarea，而不是外框。

## 无障碍 {#accessibility}

Textarea 渲染原生的 `<textarea>`；它不是 Base UI 控件。

- 用 `FieldLabel` 给它命名，其 `htmlFor` 与输入框的 `id` 一致（[Field](../field/field.md)）。
- `data-invalid` 也会设置 `aria-invalid`。
- 上限重要时，在 `aria-describedby` 里引用计数，这样它会和输入框一起被读出。
