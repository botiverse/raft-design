---
title: RadioGroup
summary: 一组圆形选项，用来从 2 到 5 个答案里选一个、随表单提交，每个选项都有写一句话的空间。
sourceHash: 5b2f66b3
---

# RadioGroup

单选组提供 2 到 5 个互斥的答案，每个答案配一行说明：谁会收到通知，谁可以提及 @everyone。选中的答案有一个墨色圆点。单选按钮和开关是系统里仅有的圆形控件。

```example
radio-group/compositions/reset-mode
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 从 2 到 5 个答案里选一个，每个都值得写一句话 | RadioGroup |
| 原地切换同一内容的另一个视图 | [SegmentedControl](../segmented-control/segmented-control.md) |
| 从许多值里选一个，或者需要搜索的值 | [Select](../select/select.md) |
| 立即生效的是或否 | [Switch](../switch/switch.md) |
| 随表单保存的是或否 | [Checkbox](../checkbox/checkbox.md) |

## 结构 {#anatomy}

- `RadioGroup`：这一组。保存选中的值。必需。
- `RadioGroupItem`：一个答案的 20px 圆圈，带 1.5px 的墨色边框，里面有一个隐藏的原生 input。必需，每个答案一个。
- `RadioGroupIndicator`：选中的圆圈里 8px 的墨色圆点。`RadioGroupItem` 默认会渲染它。
- 标签：把每一项、它的标签和描述包进一个 `<label>`，这是一个带 `items-start` 和 `gap-2` 的 flex 行，承载标签的字体样式。无论最小高度多少，圆圈都会自动和标签的第一行居中对齐，位于标签前 8px；不要加 `margin-top`（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `appearance="default"` | 一列答案，每个都有圆圈 |
| `appearance="none"` | 本身就显示选择的选项卡片：圆圈在视觉上隐藏，由卡片画出选中状态 |

```example
radio-group/compositions/reset-mode-restored
```

## 状态 {#states}

- **选中：** 墨色圆点，不是黄色填充。选中的值是墨色的，和勾选的复选框一样，所以单选按钮和复选框保持一致，黄色留给「你在这里」（[状态](../../../../../design/foundations/states.md)）。
- **禁用：** 圆圈和标签都用统一的禁用样式。

## 行为 {#behavior}

- 每个答案是至少 44px 高的一行，整行都可点击。在这一行里，圆圈的点击区域超出它的轮廓 4px，即答案之间 8px 间隔的一半，所以点在两个答案之间会落到较近的那个上；其余部分以标签为点击目标。
- 始终有一个答案被选中。默认选最常用、最安全的答案。

## 内容 {#content}

- 每个答案的标签用 `text-subhead`、字重 600，描述用 `text-footnote` 和 `foreground-muted`。

## 无障碍 {#accessibility}

RadioGroup 封装了 Base UI 的 RadioGroup，`RadioGroupItem` 封装了 Base UI 的 Radio。整组是一个 Tab 停靠点；方向键在答案之间移动并选中它们。每一项隐藏的原生 input 驱动它的选中、禁用和焦点状态，焦点环画在圆圈上（[状态](../../../../../design/foundations/states.md#focus)）。

- 给这一组命名：用 `aria-label`，或用 `aria-labelledby` 指向可见的问题（Notify me about）。
- 用包住每个答案的 `<label>` 给它命名。
