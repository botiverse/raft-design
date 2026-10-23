---
title: Select
summary: 打开一列值并显示选中值的字段，用于从最多 10 个值里选一个，或从若干值里选几个。
sourceHash: 76afa3c1
---

# Select

选择框是一个控件高度、带墨色边框的字段，和输入框一样：手机上 44px，桌面端 32px。点击它会打开一列值，当前值旁有勾号。用它来保存一个值。如果选择后是要执行一个操作，就用菜单。

## 何时使用 {#when-to-use}

各种选择器之间怎么选，完整说明见[选择组件](../../../../../design/components/overview.md#picking-something)。

| 情况 | 用 |
| --- | --- |
| 从最多 10 个值里选一个 | Select |
| 从若干值里选几个 | 带 `multiple` 的 Select |
| 从很多值里选一个或几个，需要搜索 | [ComboboxSelect](../combobox-select/combobox-select.md) 或 [Combobox](../combobox/combobox.md) |
| 从 2 到 5 个答案里选一个，每个答案值得用一句话说明 | [RadioGroup](../radio-group/radio-group.md) |
| 选择后执行一个操作，而不是保存一个值 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 筛选一个列表 | 从筛选器打开的 Select 或 Combobox；见[筛选器](#filters) |

## 结构 {#anatomy}

- `Select`：根组件。保存值和打开状态。必需。
- `SelectTrigger`：打开列表的字段。必需。
- `SelectValue`：触发按钮里显示的选中值，或占位文字。
- `SelectIcon`：触发按钮末尾的 V 形箭头。
- `SelectContent`：列表的弹出层，定位在触发按钮旁边。必需。
- `SelectList`：可滚动的选项列表。
- `SelectItem`：一个值，包含 `SelectItemText` 和 `SelectItemIndicator`（勾号）。`SelectItemLeading` 放文字前面的图标或头像。`SelectItemDescription` 是文字下方可选的第二行。
- `SelectGroup` 和 `SelectGroupLabel`：小标题下的一组值。`SelectSeparator` 是分组之间的细线。
- `SelectLabel`：选择框不在 [Field](../field/field.md) 里时用的标签。
- `SelectScrollUpArrow`、`SelectScrollDownArrow`、`SelectPortal`、`SelectPopup`：用于自定义弹出层的底层部件。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `chrome="default"` | 表单之外的选择框，比如在设置行或工具栏里 |
| `chrome="field"` | 表单里、和输入框并排的选择框：值和选项用字段的字体，与输入框一致 |
| `multiple` | 从若干值里选几个 |

### 筛选器 {#filters}

筛选器是从列表上方的 [PickerTriggerButton](../picker-trigger-button/picker-trigger-button.md) 打开的 Select 或 [Combobox](../combobox/combobox.md)。

```example
picker-trigger-button/compositions/select-filter
```

- 筛选器高 32px，点击区域 44px。
- 未应用的筛选器用 `line-seam` 描边。已应用的筛选器用 `info-soft` 填充，并显示它有几个值。
- 在筛选器后面放一个 `ghost` 的 Clear All 按钮。
- 打开的列表和其他选择器一样：单选或多选，值很多时带搜索。

## 状态 {#states}

- **没有值：** `SelectValue` 用 `foreground-hint` 显示占位文字。
- **无效：** 触发按钮上的 `data-invalid` 让它显示 `danger-strong` 边框。
- 触发按钮是字段，所以没有悬停效果；按下时盖上中档（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。
- **禁用**和列表里的悬停高亮遵循[状态](../../../../../design/foundations/states.md)。

## 行为 {#behavior}

- 列表和字段一样宽，至少 220px。选项更长时列表会变宽，最多到 24rem，且不超过屏幕宽度减去两侧各 8px；再长就折成两行并截断（[表单和设置](../../../../../design/patterns/forms.md#long-values-in-fields)）。
- 触发按钮里的选中值保持一行并截断；被截断时，完整文字放在 `title` 里。
- 筛选器的列表与筛选器的左边缘对齐，空间不够时与右边缘对齐。所有弹出层怎么定位，见[层级](../../../../../design/foundations/elevation.md#popups)。
- 在手机上也打开同样的列表。不要换成底部面板：底部面板用于去往某个地方（[选择组件](../../../../../design/components/overview.md#overlays)）。
- 使用 `multiple` 时，选中一个值后列表保持打开。点击外部或按 Esc 关闭。
- 使用 `multiple` 时，每个选项前面放一个方框（`SelectItemLeading` 里的 `CheckboxIndicator`），选中时为墨色（[Checkbox](../checkbox/checkbox.md)）。触发按钮显示选中的值，放不下时显示计数（3 selected）。

## 内容 {#content}

- 用 `SelectGroupLabel` 按类型给值分组（Agents、People）。
- 次要信息（运行时、角色、在线状态）放在选项末尾，用 `foreground-hint`。
- 对一个值含义的简短说明（某个模型擅长什么、某个级别做什么）放在第二行，用 `SelectItemDescription`。不要把标签换个形式再写一遍，比如写成小写的 id：没有新信息的一行只会让列表变长。

```example
select/compositions/descriptions
```

选项的高度由内容决定，内边距不变（[表单和设置](../../../../../design/patterns/forms.md#option-height)）：一行是 36px；折行的标签或描述只增加它自己的高度，文字上下的空间与单行选项相同。`SelectItemDescription` 与 `SelectItemText` 并列，而不是放在它里面，所以触发按钮只显示标签。有 `SelectItemLeading` 时，描述从标签下方开始，在图标之后。

- 如果有空选项，放在第一个，比如 Unassigned（[任务](../../../../../design/patterns/tasks.md#filters)）。

## 无障碍 {#accessibility}

Select 封装了 Base UI 的 Select：一个打开 listbox 的按钮，支持输入跳转和方向键导航。

- 用 `FieldLabel`（[Field](../field/field.md)）、`SelectLabel` 或触发按钮上的 `aria-label` 给选择框命名。
- 多选时，每个选项前的方框只是装饰；Base UI 用 `aria-selected` 表示选中状态。
- `SelectItemDescription` 是选项的无障碍描述：选项只由 `SelectItemText` 命名，并通过 `aria-describedby` 指向描述，所以读屏软件会先读标签，再读描述，各读一次。
