---
title: Checkbox
summary: 一个方形的框，表示随表单一起保存的是或否，或附加在某个操作上的选项。
sourceHash: 3c3c7698
---

# Checkbox

复选框是一个是或否，在表单保存时生效。勾选后，它是一块墨色方块，对勾从中镂空：它表示一个值，而不是「你在这里」，所以它从不用黄色。

```example
checkbox/compositions/preview
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 需要保存的表单里的是或否：对话框、抽屉、宽表单对话框 | Checkbox |
| 要等几个输入框填好才能开启的功能：一个地址、一段文字 | Checkbox，它的输入框放在它下面，再加一个 Save（[表单](../../../../../design/patterns/forms.md#settings-saved-together)） |
| 附加在某个操作上的选项，放在执行它的按钮旁边 | 放在该操作工具栏里的 Checkbox（`ComposerToolbarLabel`，[Composer](../composer/composer.md)） |
| 在列表或多选中选择多项 | Checkbox，或在自带语义的行里用 `CheckboxIndicator` |
| 立即生效的是或否 | [Switch](../switch/switch.md) |
| 几个答案中选一个 | [RadioGroup](../radio-group/radio-group.md) |

哪些控件立即生效、哪些需要保存，见[表单](../../../../../design/patterns/forms.md)。

## 结构 {#anatomy}

- `Checkbox`：20px 的方框，带一个保存状态的隐藏原生 input。必需。
- 标签：把复选框和它的文字包在一个 `<label>` 里（用 `Label`，或在 [Field](../field/field.md) 里用 `FieldItem` 加 `FieldLabel`）。把 `<label>` 做成 flex 行，用 `gap-2` 和标签的字体样式：方框所占的盒子与标签一行等高，所以它会自己对齐到文字的行上；用 `items-start` 时对齐第一行（标签可能换行时用它），用 `items-center` 时在任何最小高度下都对齐那一行。不要加 `margin-top`（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。
- `CheckboxIndicator`：单独画出的方框，没有 input 也没有 role，用于本身已具备复选框语义的行或菜单项。

```example
checkbox/compositions/settings-group
```

## 状态 {#states}

勾选、禁用和焦点的样子遵循[状态](../../../../../design/foundations/states.md)。

- **未勾选：**墨色边框的空框。
- **已勾选：**墨色方块，对勾镂空。
- **部分勾选：**墨色方块加一个减号，用于代表一组、而组内只有部分项被勾选的复选框。

```example
checkbox/compositions/indicator
```

## 行为 {#behavior}

- 让整个标签都可点击，而不只是方框。在 `<label>` 行里，方框的点击区域超出它所在的行 4px，即到下一个选项之间 8px 间隔的一半，所以点在两者之间会落到较近的那一个上。单独使用时，它在触屏上是 44 × 44，用鼠标时是 44 × 36。

## 内容 {#content}

- 标签用 `text-callout`，字重 600。
- 在表单里，在标签下方加一行，说明不勾选时会怎样。

## 无障碍 {#accessibility}

Checkbox 封装了 Base UI Checkbox。它隐藏的原生 input 驱动勾选、禁用和焦点状态，焦点环画在方框上（[状态](../../../../../design/foundations/states.md#focus)）。

- 给每个复选框一个名称：外层的 `<label>`、`FieldLabel`，或在没有可见文字时（选择一行）用 `aria-label`。
- `CheckboxIndicator` 是 `aria-hidden`。包含它的元素必须带上 role 和勾选状态。

## 规则 {#rules}

- 方框保持方形。不要用 `shape="circle"`：圆形只用于开关和单选按钮（[形状](../../../../../design/foundations/shape.md)）。
