---
title: SaveStatus
summary: 立即生效的设置下方的一行，只在改动失败时出现，说明哪里失败了；其他时候它不占空间。
sourceHash: cf0be470
---

# SaveStatus

SaveStatus 是自己保存的设置下方的一行：选择器、分段控件，或带开关的设置行。它只在改动失败时显示，说明哪里失败了。改动保存中和保存好之后，它什么都不显示，也不占空间：控件显示出新的值，这本身就是确认，和 macOS、iOS 的设置一样。

```example
save-status/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 立即生效的设置没能保存 | SaveStatus |
| 保存之前就不对的值：缺少名称、URL 无效 | `FieldError`（[Field](../field/field.md)） |
| 用 Save 保存的卡片的结果 | Save 按钮，它会短暂变成带对勾的 "Saved"（[表单](../../../../../design/patterns/forms.md#settings-saved-together)） |
| 一个分区的设置存在哪里（"Saved on this device"） | 给这个分区写一行，放在它的标题下或它的分组下，不用 SaveStatus（[表单](../../../../../design/patterns/forms.md#settings-that-apply-at-once)） |
| 涉及不止一项设置的失败 | 按它的范围放到对应的位置（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)） |

哪些设置立即生效，见[表单](../../../../../design/patterns/forms.md#when-a-change-takes-effect)。

## 结构 {#anatomy}

- `SaveStatus`：这一行。紧接着控件放它：在 `Field` 里放在选择器或分段控件之后、任何 `FieldDescription` 之前；在设置行的 `ListRowBody` 里放在最后，在描述之后，没有描述的行里在标题之后。每种状态下都渲染它；里面没有内容时，它是隐藏的，不占高度。必需。
- `SaveStatusError`：说明哪里失败了，用 `danger-strong`，一行 footnote 文字（18px），可以换行。只在改动失败期间把它放进 `SaveStatus`。
- `SaveStatusSaved`：已弃用。不管子元素是什么，它都不渲染任何东西，所以放着它的 `SaveStatus` 仍然是空的。不要用它。

## 状态 {#states}

```example
save-status/compositions/failed
```

- **空闲、保存中和已保存：** `SaveStatus` 里没有内容。它什么都不显示，也不占空间。控件已经显示了新的值，这就是确认；"Saved" 只会重复它，而为它保留的一行让每个这样的行都比相邻的行高（cindyz，2026-11-10，#proj-raft-ui:4ae1a74e）。
- **失败：** 控件回到原来的值，所以它从不显示一个不属实的值；`SaveStatusError` 说明哪里失败了，一直显示到下一次改动。

## 行为 {#behavior}

- 为空时，这一行不占高度，也没有间隔，所以带着它的设置和没有它的设置一样高。在设置行里，开关（或行末的值、箭头、按钮）以整行居中，和任何行一样。
- 改动失败时，这一行出现在前面那一项下方 4px：`Field` 里的选择器或分段控件，或者设置行里的描述，行没有描述时则是标题，于是错误占了描述的位置。设置随这一行变高，设置行里的开关下移这一行的一半，带着错误仍以整行居中。在 `Field` 里，这一行从字段 6px 的间隔往上移 2px；在 `ListRowBody` 里，它在主体 2px 的间隔上再加 2px。在其他地方，把控件和这一行一起放进一个没有间隔的独立块里，这一行就在控件下方 4px。
- 超过一行的失败信息会换行，而不是被截断；把它控制在一句短句里。

## 内容 {#content}

- 失败写成没做成什么、该怎么做：Couldn't mute this server. Try again. 请求返回时带着原因的话，显示这个原因（[写作](../../../../../design/content/writing.md)）。
- 不要写 "Saved"，也不要在设置的行上说它存在哪里。"Saved on this device" 对一个分区只说一次（[表单](../../../../../design/patterns/forms.md#settings-that-apply-at-once)）。

## 无障碍 {#accessibility}

- `SaveStatusError` 有 `role="alert"`，所以失败在出现时就被播报。
- 控件自己会播报它的新值（开关的开或关，分段控件或选择器选中的项），所以保存成功的改动不需要另外播报。
- 把控件的 `aria-describedby` 指向这一行的 `id`（在 `SaveStatus` 上），和已有的描述放在一起，让失败和控件一起被读出。
