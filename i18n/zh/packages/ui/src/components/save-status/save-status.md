---
title: SaveStatus
summary: 立即生效的设置下方的一行，短暂显示「Saved」或说明哪里失败了；没有内容时也保留它的空间。
sourceHash: 590aeab0
---

# SaveStatus

SaveStatus 是自己保存的设置下方的一行：选择器、分段控件，或带开关的设置行。改动保存好后，它短暂显示「Saved」，或者说明哪里失败了。这一行始终存在，什么都没发生时是空的，所以结果出现又消失时，卡片、行和开关都不会移动。

```example
save-status/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 立即生效的设置的结果 | SaveStatus |
| 保存之前就不对的值：缺少名称、URL 无效 | `FieldError`（[Field](../field/field.md)） |
| 用 Save 保存的卡片的结果 | Save 按钮，它会短暂变成带对勾的「Saved」（[表单](../../../../../design/patterns/forms.md#settings-saved-together)） |
| 涉及不止一项设置的失败 | 按它的范围放到对应的位置（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)） |

哪些设置立即生效，见[表单](../../../../../design/patterns/forms.md#when-a-change-takes-effect)。

## 结构 {#anatomy}

- `SaveStatus`：这一行，不管有没有内容，都是一行 footnote 文字的高度（18px）。紧接着控件放它：在 `Field` 里放在选择器或分段控件之后、任何 `FieldDescription` 之前；在设置行的 `ListRowBody` 里放在描述之后。必需。
- `SaveStatusSaved`：一个对勾加「Saved」，用 `foreground-muted`；这个对勾就是 Save 按钮变成「Saved」时显示的那个（[表单](../../../../../design/patterns/forms.md#settings-saved-together)）。它是 polite 实时区域，所以什么都没发生时把它渲染成空的，改动保存好后再放入文字；对勾只和文字一起显示。
- `SaveStatusError`：说明哪里失败了，用 `danger-strong`，代替 `SaveStatusSaved`。

## 状态 {#states}

```example
save-status/compositions/failed
```

- **空闲和保存中：** `SaveStatusSaved` 里没有内容。这一行是空的，保持它的高度。保存中不显示任何东西：控件已经显示了新的值。
- **已保存：** 带对勾的「Saved」，显示 2 秒，然后又变空。
- **失败：** 控件回到原来的值，所以它从不显示一个不属实的值；`SaveStatusError` 说明哪里失败了，一直显示到下一次改动。

## 行为 {#behavior}

- 这一行在每种状态下都保持高度，所以结果出现时，卡片和行都不会变高，以行居中的开关也不会移动（stdrc，2026-10-30）。
- 不管控件是什么，它都在控件下方 4px：选择器、分段控件，或者行的描述。在 `Field` 和 `ListRowBody` 里，它自己抵消与它们自身间隔（6px 和 2px）的差。在其他地方，把控件和这一行一起放进一个没有间隔的独立块里，这一行就在控件下方 4px。
- 它预留一行。超过一行的失败信息会换行，设置随之变高，而不是被截断；把它控制在一句短句里，就不会这样。

## 内容 {#content}

- 只写「Saved」，不多写：设置本身已经说明了改了什么。
- 失败写成没做成什么、该怎么做：Couldn't mute this server. Try again. 服务器给出了自己的原因时，显示这个原因（[写作](../../../../../design/content/writing.md)）。

## 无障碍 {#accessibility}

- `SaveStatusSaved` 有 `role="status"` 和 `aria-live="polite"`。什么都没发生时也保持挂载，让它在「Saved」到来之前就已经存在：和文字一起插入的实时区域常常不会被播报。
- 新的一次保存开始时清空 `SaveStatusSaved`，让每一次「Saved」都是一次变化，再被播报一次。
- `SaveStatusError` 有 `role="alert"`，所以失败在出现时就被播报。把它渲染在 `SaveStatusSaved` 的位置上，绝不要放在它里面。
- 把控件的 `aria-describedby` 指向这一行的 `id`（在 `SaveStatus` 上），和已有的描述放在一起，让结果和控件一起被读出。
