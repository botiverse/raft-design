---
title: TaskCompletionControl
summary: 任务行或任务卡片最前面的圆形勾选控件，按一下就把任务标为 Done，或把已完成的任务重新打开。
sourceHash: 036649c5
---

# TaskCompletionControl

TaskCompletionControl 让一组任务能像待办清单一样逐项处理：按一下就把任务标为 Done，在已完成的任务上按一下就重新打开它。它是每个任务行和任务卡片最前面的圆形勾选控件，出现在对话旁边、消息下面、看板上和列表里。它什么时候显示、按下后任务会怎样，见[完成任务](../../../../../design/patterns/tasks.md#completing-a-task)。

```example
task-completion-control/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 完成或重新打开任务，放在它的行或卡片最前面 | TaskCompletionControl |
| 选中一行，以便一次对多行操作 | [Checkbox](../checkbox/checkbox.md)，或在自带语义的行里用 `CheckboxIndicator` |
| 把任务改成其他任何状态 | 状态标签的菜单（[TaskCard](../task-card/task-card.md)） |
| 随表单保存的是或否 | [Checkbox](../checkbox/checkbox.md) |

## 结构 {#anatomy}

- `TaskCompletionControl`：一个带复选框语义的原生 `button`，里面是一个 20px 的圆形 `CheckboxIndicator`（`shape="circle"`）。每个任务行和任务卡片上都必需。它外面的行或卡片、它名称里用到的标题，以及它的工具提示，都由调用方负责。

## 状态 {#states}

```example
task-completion-control/compositions/states
```

- **未勾选：** 墨色边框的空心圆，用在除 Done 以外的所有状态上，Backlog 和 Closed 也是。
- **悬停：** 未勾选时，只有鼠标指针停在控件本身上，才显示一个淡淡的对勾。悬停在行的其他地方是悬停在行上，什么都不预览，即使这一行或它外面的某一列是 Tailwind 的 `group` 也一样。
- **已勾选：** 墨色的圆，对勾镂空，只用在 Done 的任务上。
- **禁用：** 给不能修改这个任务的人：禁用的样子、`aria-disabled`，不预览。它不设原生的 `disabled`，因为那会让键盘够不到这个按钮：焦点在任务列表里移动时停不到它上面，读屏软件永远听不到它被锁定了，它的工具提示也打不开。它仍然能获得焦点，按它或按 Space 都没有效果。

## 行为 {#behavior}

- 根据任务的状态传入 `checked`，在 `onCheckedChange` 里修改任务：完成任务时它以 `true` 调用，重新打开时以 `false` 调用。控件自己不保存状态；完成之后发生什么（Toast、任务移进 Done 之前的停顿、Undo）由调用方负责（[完成任务](../../../../../design/patterns/tasks.md#completing-a-task)）。
- 按下止于控件本身：它的点击、Space 和 Enter 都不会传到它所在的行或卡片，所以按它永远不会同时打开任务；在 [TaskBoard](../task-board/task-board.md) 的卡片上，Space 完成任务，而不是拿起卡片。方向键仍然会传到列表，用来在行之间移动。
- 调用了 `event.preventDefault()` 的 `onClick` 会阻止 `onCheckedChange` 被调用。
- 它的点击区域在 20px 的圆外，用鼠标时延伸 8px（36px），在触屏上延伸 12px（44px）（[无障碍](../../../../../design/foundations/accessibility.md#hit-targets)）。用鼠标时它向两侧延伸得比 Checkbox 的 12px 少，因为 12px 会盖住旁边的任务编号。

## 内容 {#content}

- 用任务给它命名：先是编号，再是标题，"#25 Fix onboarding copy"。
- 如果产品显示工具提示，把操作写在工具提示里：Complete；在已完成的任务上是 Reopen（[Tooltip](../tooltip/tooltip.md)）。

## 无障碍 {#accessibility}

TaskCompletionControl 渲染一个带 `role="checkbox"` 的原生 `button`，不封装任何 Base UI 基础组件。只有已完成的任务 `aria-checked` 为 true。它不是 Base UI 的 Checkbox，因为它完全用不到那个复选框的隐藏 input（任务的状态不是表单值），Enter 永远不能切换它，而且点击必须停在这个按钮上，不能传到它下面的行或卡片。

- 给它一个写明任务的 `aria-label`（或 `aria-labelledby`）；它的类型要求必须提供。状态变了，名称保持不变：勾选状态已经说明了任务是否完成，所以如果名称说的是按下会做什么（"Reopen #25"），就会被读成 "Reopen #25, checkbox, checked"。
- 按 Space 切换它。和所有复选框一样，Enter 不切换它，所以它不会被当成行的 Enter，行的 Enter 是打开任务。
- 它显示自己的焦点环，和行的焦点环分开。
- 里面的 `CheckboxIndicator` 是 `aria-hidden`；role、状态和名称都由按钮承载。

## 规则 {#rules}

- 保持圆形。行首的方框读作「选中这一行」，Checkbox 放在那里就是这个意思；圆圈读作「完成」，和待办清单里一样。它是「只有开关、单选按钮和拖动条是圆的」这条规则的例外（[形状](../../../../../design/foundations/shape.md#principles)）。
- 只把它用于完成任务。不要把圆形的 `CheckboxIndicator` 或圆形的 Checkbox 用在其他任何地方（[Checkbox](../checkbox/checkbox.md#rules)）。
- 只在 Done 的任务上显示为勾选。在其他任何状态上按它，Backlog 和 Closed 也一样，都会完成任务。
- 把它放在任务行或任务卡片的最前面，作为叠在行或卡片上面的独立按钮：按行或卡片的其他部分仍然打开任务。
