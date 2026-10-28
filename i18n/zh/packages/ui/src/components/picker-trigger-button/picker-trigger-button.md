---
title: PickerTriggerButton
summary: 紧凑的 32px 按钮，作为列表上方的筛选器打开 Select 或 Combobox；未应用筛选时是描边样式，应用后变为填充。
sourceHash: 1e438d38
---

# PickerTriggerButton

PickerTriggerButton 是筛选器的按钮：一个紧凑的 32px 触发按钮，在它所筛选的列表上方打开 [Select](../select/select.md) 或 [Combobox](../combobox/combobox.md) 的列表。它没有自己的状态。它渲染为 Select 或 Combobox 的触发按钮，打开、焦点、键盘导航和选择都由后者负责。

```example
picker-trigger-button/compositions/select-filter
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 按一个或几个值筛选列表 | PickerTriggerButton，渲染为 `SelectTrigger` 或 `ComboboxTrigger` |
| 人很少设置、凭习惯设置、按钮上不写出名字的筛选 | 始终写着「筛选」 的 PickerTriggerButton，渲染为 `DropdownMenuTrigger`，旁边放一个 [FilterChip](../filter-chip/filter-chip.md) |
| 在表单里选一个值 | Select 自己的输入框（[Select](../select/select.md)） |
| 一组操作 | 菜单（[DropdownMenu](../dropdown-menu/dropdown-menu.md)） |
| 一行选项，每项各自开或关 | [ToggleGroup](../toggle-group/toggle-group.md) |

各种选择器之间怎么选，完整说明见[选择组件](../../../../../design/components/overview.md#picking-something)。筛选器的样子、显示多少个值、Clear All 放在哪里，见 [Select › 筛选器](../select/select.md#filters)。

## 结构 {#anatomy}

PickerTriggerButton 只有一个部件。把它作为 `render` 传给 `SelectTrigger` 或 `ComboboxTrigger`（Filter 按钮传给 `DropdownMenuTrigger`，见下文），在里面按以下顺序放触发按钮的常规部件：

- 前置图标：可选，14px。
- 值：`SelectValue`，或者 Combobox 选中项的标签。必需。
- `ComboboxTriggerCount`：已应用的 Combobox 筛选器有多少个值。可选。
- 指示器：`SelectIcon` 或 `ComboboxTriggerIndicator`，一个 `foreground-hint` 的 V 形箭头。在 `DropdownMenuTrigger` 里，把 V 形箭头包在一个带 `data-picker-trigger-indicator` 的 `span` 里。

```example
picker-trigger-button/compositions/combobox-filter
```

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 未应用 | `line-seam` 轮廓里的 `foreground-muted` 文字 |
| 已应用（`data-has-value`） | `info-soft` 填充，`foreground` 文字，没有轮廓（[状态](../../../../../design/foundations/states.md#usage)：生效的筛选器属于选中的内容） |
| 无效（`data-invalid`） | `danger-strong` 轮廓 |
| 禁用 | 遵循[状态](../../../../../design/foundations/states.md#usage)：`fill-muted`，`foreground-disabled` 文字 |

- Combobox 有值时，`ComboboxTrigger` 会设置 `data-has-value`。`SelectTrigger` 总是有值，所以它从不设置：筛选器不同于默认值时，自己传 `data-has-value`。

## 行为 {#behavior}

- 列表在触发按钮旁边打开，和所有弹出层一样（[层级](../../../../../design/foundations/elevation.md#popups)）；它的宽度和对齐见 [Select › 行为](../select/select.md#behavior)。
- 触发按钮保持高度，不换行也不截断：值长了，按钮就变宽。

## 内容 {#content}

- 选了值之后，显示当前的值，而不是筛选器的名称：Relevance、#launch-week。在那之前，显示筛选器的名称：Channel、Assignee。
- 例外是 Filter 按钮：人很少设置、凭习惯设置的筛选，按钮始终写着「筛选」，旁边的 [FilterChip](../filter-chip/filter-chip.md) 说出当前生效的筛选。一个筛选用这两种中的哪一种，见 [Select › 筛选器](../select/select.md#which-filter-button)。
- 标签的一般规则见[写作](../../../../../design/content/writing.md#casing)。

## 无障碍 {#accessibility}

- PickerTriggerButton 封装了 Base UI Button。它所服务的 Select 或 Combobox 会加上触发按钮的角色、`aria-expanded` 和与弹出层的关联。
- 它的无障碍名称就是它的文字。文字只有值时（Relevance），加一个同时说出筛选器名称的 `aria-label`（「Sort: Relevance」），因为只有值说明不了它改变的是什么。
- 对辅助技术隐藏前置图标和 V 形箭头（`aria-hidden`）。
- 用 `aria-label` 给 Combobox 筛选器的搜索行命名（「Search channels」）。

## 规则 {#rules}

- PickerTriggerButton 只用于筛选器。表单里的选择器用 Select 自己带墨色边框的输入框，和周围的输入框一样高。
- 不要用它打开操作菜单：它打开的永远是值的列表。Filter 按钮的菜单里只有单选项，每个筛选一项。
- 不要自己给已应用的筛选器加样式。设置 `data-has-value`，让组件来填充。Filter 按钮从不设置它：它旁边的标签片说明已应用了筛选。
