---
title: InputGroup
summary: 在同一个带边框的方框里放固定前缀、后缀、图标或按钮的输入框，例如域名、单位或搜索图标。
sourceHash: 5ee5c18a
---

# InputGroup

InputGroup 把固定文字、图标或按钮放进输入框的方框里：服务器地址前的域名、预算后的单位、搜索词前的搜索图标。方框、边框和状态都属于这个组，所以输入框和附加部分看起来是一个控件。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 带固定前缀或后缀的值：`raft.build/`、`#`、USD / day | InputGroup |
| 搜索框 | 带搜索图标的 InputGroup |
| 里面带操作（例如清除或复制）的输入框 | 带按钮附加部分的 InputGroup |
| 普通的值 | [Input](../input/input.md) |
| 在整个服务器里搜索 | [Search](../search/search.md) |

## 结构 {#anatomy}

- `InputGroup`：带边框的方框。必需。
- `InputGroupAddon`：开头或结尾的图标或按钮（`align`）。
- `InputGroupAddon.Text`：开头或结尾的固定文字，用 Space Mono 和 `foreground-hint`。
- `InputGroupInput`：输入框本身，自己没有边框。必需。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 附加部分 `variant="default"` | 字段里的轻量标记：搜索图标、键盘提示、清除按钮 |
| 附加部分 `variant="container"` | 值结构的一部分：协议、域名、单位。它铺在 `fill-muted` 上，和输入框之间用细线隔开 |

## 状态 {#states}

- 把 `data-invalid` 和 `disabled` 放在 `InputGroupInput` 上。由组来绘制这些状态：无效时是 `danger-strong` 边框，禁用时用统一的禁用样式（[状态](../../../../../design/foundations/states.md)）。
- 焦点环围绕整个组（[状态](../../../../../design/foundations/states.md#focus)）。

## 行为 {#behavior}

- 在搜索框里，开头放一个 18px 的搜索图标，有文字后在结尾放一个清除按钮。
- 结尾附加部分里的 Button 是嵌在字段里的控件：桌面端 20px，手机 32px，用 `radius-chip` 和 16px 的图标。它是附加部分的最后一个子元素时，离字段末端 6px，和离上下边的距离相同；Esc 这样的提示放在它前面，不要放在后面（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 文字附加部分最多占组的一半，超出就截断，并把完整文字设为它的 `title`，所以总有地方输入（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)）。

## 无障碍 {#accessibility}

`InputGroupInput` 包装 Base UI Input；组本身是一个普通的 `<div>`。

- 用 `FieldLabel` 给输入框命名（[Field](../field/field.md)），没有可见标签的搜索框用 `aria-label`（Search）。
- 给按钮附加部分单独的 `aria-label`（Clear Search）。
- 文字附加部分不会作为值的一部分读出。前缀对理解值很重要时，在标签或帮助文字里说出来。
