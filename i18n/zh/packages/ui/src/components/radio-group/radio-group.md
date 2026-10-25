---
title: RadioGroup
summary: 一组圆形选项，用来从 2 到 5 个答案里选一个、随表单提交，每个选项都有写一句话的空间。
sourceHash: fab8a9ab
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
| 任意数量的选项，且选择是对话框的主要内容 | [ChoiceList](../choice-list/choice-list.md) |
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
- 两行描述各自说的都是人们要在答案之间比较的东西时，一个答案可以有两行描述，比如先是账户的额度，再是这台机器本身（「Claude Max · 5h 72% left · this week 40% left」「3 agents · 120 GB disk free」）。每一行各自截断；没有内容可说的那一行直接去掉，从不显示成空行。
- 选择是对话框的主要内容时，用 [ChoiceList](../choice-list/choice-list.md)，它画出的就是这一条和下一条描述的样子。不管有多少个答案，它都把答案展开成一个列表；人们按名字找一个知道的答案时（始终），或者要比较一个一眼看不完的列表来选时（从 6 个答案起），列表上方有一个筛选输入框；列表可以滚动；整行都能选中答案。它的行和添加多个的列表（Add Members）的行一样，只是那个列表放复选框的地方放的是单选圆圈：同一种列表，圆圈说明只能选一个（[选择控件](../../../../../design/components/overview.md)）。筛选从不清除或改变已选的答案：选中的行始终显示在筛选出的行上方，Confirm 仍然用它。方向键只在显示出来的行之间移动；筛选没有匹配时显示一行简短的「No match」，从不显示一个空框。
- 要打开某个答案的更多信息，在它那一行的末尾放一个 32px 的无框图标按钮，对齐标签那一行的中线，放在这一项的 `<label>` **外面**：放在里面的话，按下按钮也会选中这个答案，读屏软件也会读出单选按钮里有一个按钮。按答案给它命名（「Studio Mac details」），在 [Popover](../popover/popover.md) 里打开详情，点一下也能打开，不要用悬停卡片。这一组仍然是一个 Tab 停靠点，在选中的那一行上，用方向键移动；行上的按钮在 DOM 里排在这一组之后，摆在各自的行旁边（同样几行上的第二个网格列），Tab 离开这一组后按行的顺序到达它们。在触屏这类粗略指针下，按钮保持 44px 的点击区域，和行一样（[触屏](../../../../../design/patterns/responsive.md#touch-screens)）。

## 无障碍 {#accessibility}

RadioGroup 封装了 Base UI 的 RadioGroup，`RadioGroupItem` 封装了 Base UI 的 Radio。整组是一个 Tab 停靠点；方向键在答案之间移动并选中它们。每一项隐藏的原生 input 驱动它的选中、禁用和焦点状态，焦点环画在圆圈上（[状态](../../../../../design/foundations/states.md#focus)）。

- 给这一组命名：用 `aria-label`，或用 `aria-labelledby` 指向可见的问题（Notify me about）。
- 用包住每个答案的 `<label>` 给它命名。
