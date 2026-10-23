---
title: FormSection
summary: 大表单中的一个部分：一个小标题、一个低调的状态标签、一行说明这部分用途的文字，以及它的输入框；用在宽对话框和抽屉表单里。
sourceHash: 4bd0ffb2
---

# FormSection

表单分区是大表单中的一个部分：一个小标题、一个可选的状态标签、一行说明这部分用途的文字，然后是它的输入框。大表单由一叠分区组成，放在宽的 [Dialog](../dialog/dialog.md) 或 [Drawer](../drawer/drawer.md) 里；两者用的是同一种分区。

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 大表单对话框中的一部分，列在它的 `DialogNav` 里 | FormSection |
| 抽屉中表单的一部分 | FormSection |
| 只有 2 到 3 个输入框的表单 | 不分区：把输入框直接放在 [Dialog](../dialog/dialog.md) 的主体里 |

大表单对话框怎样围绕分区搭建，见[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)。

## 结构 {#anatomy}

FormSection 只有一个部件。它依次渲染：

- 标题：`text-footnote`，粗体，`foreground-muted`。必需。
- 状态，在标题行末尾：一个浅色底、低调的 [Badge](../badge/badge.md)。可选。
- 描述，在标题下面：`text-footnote`，`foreground-hint`。可选。
- 子元素：输入框（[Field](../field/field.md)）和操作行。

## 行为 {#behavior}

- 分区内的输入框相隔 12px。
- 分区之间相隔 16px，两个分区之间有一条 `line-hairline`。第一个分区紧贴主体顶部开始。

## 内容 {#content}

- 状态写成一个低调的词，说明这个分区处于什么情况：Complete、Optional、Off、Private。
- 描述写成一行，说明这个分区用来做什么："Public identity and Marketplace-facing metadata."

## 无障碍 {#accessibility}

- FormSection 渲染为一个带 `h3` 标题的 `section`。把它放在对话框或抽屉标题之下，那个标题是上一级。
- `DialogNav` 链接到某个分区时，给这个分区一个 `id`，这样分区列表才能跳过去。

## 规则 {#rules}

- 分区里的操作写成普通的行，并且只显示在保存一项之前就能填写的分区，见[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)。
