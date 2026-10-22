---
title: ComboboxSelect
summary: 现成的可搜索选择框，由一组选项驱动，用于从很多值里选一个或几个，支持分组、远程搜索和新建。
sourceHash: a3565f91
---

# ComboboxSelect

ComboboxSelect 是一个控件高度的输入框（手机上 44px，桌面端 32px），人在里面输入文字，从一长串值里找出一个或几个，手机和桌面端都一样。它用于筛选、在服务器上搜索和新建值；只需要选、不需要输入的输入框用 [Select](../select/select.md)。它接收一组选项，可以是平铺的，也可以分组，并据此生成输入框、列表、标签片，以及空状态和加载中的那一行。它从 `@botiverse/raft-ui/wip` 导出，API 在任何版本中都可能变化。

```example
combobox-select/compositions/preview
```

## 何时使用 {#when-to-use}

各种选择控件之间怎么选，完整说明见[选择组件](../../../../../design/components/overview.md#picking-something)。

| 场景 | 使用 |
| ----------------------------------------------------------------- | ----------------------------------- |
| 从很多值里选一个，需要搜索 | ComboboxSelect |
| 从很多值里选几个（人、agent、标签） | 带 `multiple` 的 ComboboxSelect |
| 值在人输入时从服务器获取 | 带 `remote` 的 ComboboxSelect |
| 从最多 10 个值里选一个，或者不用输入就能选的任何值 | [Select](../select/select.md) |
| 对列表做筛选，或者选项数组表达不了的布局 | [Combobox](../combobox/combobox.md) |

## 变体 {#variants}

| 变体 | 用于 |
| ------------------------ | ------------------------------------------------------------------------------------- |
| 单选（默认） | 一个值。列表在当前值上显示一个勾 |
| `multiple` | 几个值。每个选中的值在输入框里变成一个标签片 |
| 分组选项 | 属于同一类的值，比如按提供方分组的模型。每组以组标签开头 |
| `remote` 加 `onSearch` | 由调用方获取的结果。组件直接显示，不做筛选 |
| `create` | 人可以输入新值来添加的值 |

```example
combobox-select/compositions/combobox-select
```

```example
combobox-select/compositions/model-select
```

```example
combobox-select/compositions/async-search
```

## 状态 {#states}

- **加载中：** `loading` 在列表里显示一行加载中。正在保存选择时保持列表打开，并用 `loading` 表示。
- **尚未加载：** 选中的值对应的选项还没到时，`fallbackOption` 给它一个标签，让输入框仍然可读。
- **无效：** `status="error"` 或 `aria-invalid` 让输入框显示 `danger-strong` 边框。
- **无匹配：** 列表用一行文字说明。不要留下一个空的弹出层。

## 行为 {#behavior}

- 人输入时筛选选项，除非设置了 `remote`。
- 有 `multiple` 时，选中一个值后列表保持打开；点击外面或按 Esc 关闭。输入接在最后一个标签片后面继续。
- 选项的高度由内容决定：一行是 36px，第二行只加上它自己的高度，文字上下的留白不变（[表单](../../../../../design/patterns/forms.md#option-height)）。
- 选项太长时折成两行，再长就截断；标签片太长时按输入框的宽度截断。被截断时，各自用完整文字作为 `title`（[表单](../../../../../design/patterns/forms.md#long-values-in-fields)）。
- 标签片、清除按钮和展开按钮距输入框外边缘 6px，彼此相隔 6px：桌面端 20px，手机上 32px，所以放了标签片的输入框高度不变。它们和所有嵌在外框里的控件一样用 `radius-chip`；标签片的移除按钮用 `radius-sticker`，在标签片内 2px，焦点环画在按钮里面（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 有 `maxTagCount` 时，输入框没有焦点期间，超出数量的标签片收成一个数字。获得焦点时全部恢复。
- 列表最高 16rem（256px），包括上下各 4px 的内边距：六行 36px 再加第七行的一部分，表示下面还有。超过后滚动。`listMaxHeight`（CSS 长度或像素，量法相同）可以改这个上限，`listMaxHeight="16rem"` 和不写一样。输入框下方有一大块专属空间时调高，比如很高的底部 [Drawer](../drawer/drawer.md)；列表会挡住人在选择时需要看到的东西时调低。

### 在手机上 {#on-a-phone}

这里的手机指比桌面端布局窄的触屏，即 `(width < 48rem) and (pointer: coarse)`。ComboboxSelect 在手机上和桌面端一样是一个文本输入框，因为它就是用来输入的：点一下获得焦点并弹出键盘，输入时筛选列表，`create` 和 `remote` 都在输入框里完成。没有底部面板。如果人只需要选、从不需要输入，改用 [Select](../select/select.md)：它打开时不会弹出键盘。

- 列表总是在输入框下方打开，位于输入框和键盘之间，像原生的自动补全一样，从不翻转。哪一边空间更大取决于键盘碰巧是否弹出，所以按空间选方向的列表，在同一个输入框上会这次向下开、下次向上开。下方放不下三行时，改为把输入框滚到可见区域的顶部。键盘弹出或收起、地址栏移动、筛选后的列表变短变长时，只有列表的高度变化：输入框位置不动。
- 输入文字在每个 `size` 下都保持 16px 或以上，这样 iOS 不会放大页面。
- `size="lg"` 是 52px 的输入框，里面是 40px 的标签片和按钮，距边 6px；`size="sm"` 是 28px 的输入框，里面是 22px 的标签片和按钮，距边 3px，和分段控件的选项与轨道的距离一样近。
- 放在底部 [Drawer](../drawer/drawer.md) 里时，给抽屉一个不随键盘变化的高度（用 `lvh`，不用 `dvh`），在输入框下方给列表留出空间；抽屉较高时调高 `listMaxHeight`。

```example
combobox-select/compositions/in-drawer
```

```example
combobox-select/compositions/many-options
```

这里说的是在列表里找一个值。[Combobox](../combobox/combobox.md) 是用于提及和标签的自由文本输入框，它会有自己的手机模式：输入框固定在面板或全屏页的顶部，建议列在它和键盘之间。

## 内容 {#content}

- 占位文字写要做什么：Choose a model。
- 空状态那一行写什么没找到：No models match "zz"。

## 无障碍 {#accessibility}

ComboboxSelect 封装了 Base UI Combobox：一个 `role="combobox"` 的文本输入框，控制一个列表框（listbox）。

- 用 `FieldLabel`（[Field](../field/field.md)）为输入框命名，其 `htmlFor` 与输入框的 `id` 对应；或者用 `aria-label`。
- 在输入框开头按左方向键，焦点移到标签片上；按 Backspace 或 Delete 移除获得焦点的标签片。每个移除按钮以它的值命名（Remove Bugen）。
- 在手机上，输入框是同一个文本输入框，命名方式相同。
- 界面不是英文时，用 `messages` 翻译这些播报内容。
