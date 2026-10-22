---
title: 表单和设置
summary: 立即生效的设置、一起保存的一组字段、对话框里的表单、一次填完的大表单对话框、校验、输入框里的长值、选项高度和危险区。
sourceHash: aea7d6c8
---

# 表单和设置

立即生效的控件没有 Save 按钮。一起编辑的字段（个人资料、服务器的名称和描述）在这一组的末尾有自己的 Save。对话框里的表单，底部有 Cancel 和提交按钮。一次填完的大表单（比如注册一个应用）以带分区列表的宽对话框打开。

## 适用范围 {#when-it-applies}

设置页、对话框和抽屉里的表单，以及大型配置表单。一个值该用什么控件，见[选择组件](../components/overview.md#picking-something)。

## 结构 {#structure}

### 输入框 {#fields}

- 标签放在输入框上方，帮助文字放在下方（[Field](../../packages/ui/src/components/field/field.md)）。
- 选填的输入框标 "(optional)"，必填的标星号。
- 输入框下方预留一行，放帮助文字或错误信息，这样出现错误时表单不会跳动。
- 设置的描述要说明结果，不要重复标题：标题已经说了这是什么设置，人们往下读是想知道它有什么作用。
- 复选框、单选按钮或开关放在标签前 8px，与标签第一行居中对齐；在设置行里则放在行尾，以整行居中。raft-ui 会把它放在这些位置（`FieldItem`、复选框或单选按钮的 `<label>` 行、`ListRow`）；不要用外边距去挪它（[对齐](../foundations/alignment.md#a-control-and-its-label)）。开关始终是 50 × 30，复选框和单选按钮始终是 20px，手机和桌面端都一样。

```example
field/compositions/preview
```

### 立即生效的设置 {#settings-that-apply-at-once}

- 独立的设置（外观、字号、公开页面是否开启）用开关、分段控件或选择器，每次改动立即生效。不要加 Save 按钮：改动已经显示出来了。

### 一起保存的设置 {#settings-saved-together}

- 一起编辑的字段放在同一张卡片里，末尾放 Save：个人资料、密码、服务器的名称和描述。Save 只保存这一张卡片，所以改了一半的卡片不会连带保存另一张。
- 保存后，按钮短暂变成带对勾的 "Saved"。
- 和卡片一起保存的是非选项（比如将服务器设为免打扰）用复选框，不用开关：开关看起来像是已经生效了。

### 对话框里的表单 {#forms-in-a-dialog}

- 对话框里的表单，底部放 Cancel 和提交按钮。Cancel 在对话框里是幽灵按钮，在页面上则带墨色边框（[Button](../../packages/ui/src/components/button/button.md#which-color)）。Cancel 在前；提交按钮是这个界面上的粉色按钮，写明它执行的操作，通常就是标题里的动词：Create Channel 里的 Create；标题是 Edit 时，按钮是 Save（[写作](../content/writing.md#actions-and-their-dialogs)）。两个按钮都是 `size="lg"`，和上面输入框一样高（[间距](../foundations/spacing.md#heights)）。
- 只有几个字段的表单用小对话框，即默认的 `size="md"`，宽 448px：创建频道、Agent 或任务。内容需要更宽的表单（比如键值行或命令）用 `size="lg"`，宽 640px（[Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)）。

### 大表单对话框 {#the-large-form-dialog}

一次填完的大表单（比如注册或编辑一个应用）以宽对话框打开（[Dialog](../../packages/ui/src/components/dialog/dialog.md)）：居中，宽 896px，高度固定为 760px 和窗口高度减 32px 中较小的那个。它不放到设置页或抽屉里：字段很多的表单需要作为一个整体来看，而不是贴着边缘的一长条。

- 56px 的头部放这一项的图标、标题和 ×。标题就是打开它的那几个词（Register App）；编辑时是 Edit 加这一项的名称。不要把提交按钮放在头部。
- 头部下方放一条横栏，放表单滚动时必须一直看得到的东西：表单的错误，或只显示一次的密钥。
- 左侧放 208px 宽的分区列表，让人能在长表单里跳转（侧边栏行；正在阅读的分区是一张黄色贴纸，随滚动移动），右侧放各个分区（[FormSection](../../packages/ui/src/components/form-section/form-section.md)：一个小标题、一个状态标签、一行描述，分区之间一条细线）。
- 底部 Cancel 在前，粉色按钮在最后。
- 点击对话框外部时不要关闭，免得误点一下就丢掉一张长表单。×、Esc 和 Cancel 可以关闭它。
- 宽度小于 768px 时，去掉分区列表。
- 创建时，只显示保存之前就能填的分区。关于已存在的项的分区（分发、删除）在保存后才出现。
- 分区里的操作写成普通的行，左边是描述，右边是按钮，不要做成卡片里套卡片。

## 规则 {#rules}

### 校验 {#validation}

- 在提交表单时检查字段，不要在人们还在输入时检查。表单打开时值就有错的字段，立即显示错误。
- 无效的输入框用 `danger-strong` 边框表示，错误信息放在预留的那一行，说明怎么改。
- 整个表单的问题（比如请求失败）放在表单内的橙色横幅里（[Banner](../../packages/ui/src/components/banner/banner.md)）。不要在横幅里重复字段的错误。
- 校验错误不要用轻提示：轻提示会消失，而错误在输入框下方有自己的位置。

### 输入框里的长值 {#long-values-in-fields}

一个值可以是任意长度：粘贴进来的没有空格的链接、很长的中文名字、翻译成长单词的标签。表单里没有任何东西比它的输入框宽，也没有输入框比它所在的对话框、抽屉或屏幕宽，屏幕窄到 320px 也一样（[响应式布局](./responsive.md#phone)）。哪部分让步，取决于这部分是不是按设计就只有一行。

- **标签、帮助文字和错误信息换行**，单个词比一行还宽时在词中断开。这些是解释输入框的文字，截断就会藏起人们需要的部分。复选框、单选按钮或开关旁边的标签也一样。
- **单行控件里的值用省略号截断**：Select 选中的值、标签片、文字前缀。控件保持高度，这样值变化时表单不会跳动（[间距](../foundations/spacing.md#heights)）。被截断时，完整的值作为这部分的 `title`，并始终是它的无障碍名称。
- **人们输入的值在输入框内滚动。** Input 把文字保持在一行并滚动；Textarea 让文字换行。
- **列表里的选项先换成两行，再截断**，完整文字作为 `title`。两行能让人分辨开头相同的两个长值，一行做不到；同时每个选项又足够短，便于扫读。触发器里选中的值仍然只有一行。
- **标签片在输入框宽度处截断**，末尾的移除按钮始终可见。
- **InputGroup 里的文字前缀最多占输入框的一半**，超出就截断，所以总有地方可以输入。
- **列表的宽度永远不超过屏幕宽度减去两侧各 8px。** 它至少和输入框一样宽，且至少 220px。Select 或 Combobox 的列表会变宽以容纳较长的选项，最宽到 24rem（如果输入框更宽，就到输入框的宽度）；ComboboxSelect 的列表保持输入框的宽度。超出后，选项换行。

每个控件自己遵守这些规则，所以表单从不自己加 `min-w-0` 或 `truncate`。截断值的控件通过 `useOverflowTitle`（[`use-overflow-title.ts`](../../packages/ui/src/lib/use-overflow-title.ts)）得到 `title`，它只在值被截断时设置。传给这个 hook 的 ref 要稳定，用 ref 对象或经过 memo 的回调：内联的回调 ref 会在每次渲染时重建它的观察器。把输入框放进 flex 行的布局，仍然要给输入框所在的列加 `min-w-0`，因为没有它，flex 子项不会缩到比内容更窄。

### 选项高度 {#option-height}

选项的高度跟随内容，内边距不变。弹出列表里的每一行都是如此：Select、Combobox 或 ComboboxSelect 的选项，DropdownMenu 或 ContextMenu 的菜单项，不管带对勾、带单选标记还是都不带。

- **一行是 36px，鼠标和触屏都一样。** 弹出列表中的行是 44px 触摸目标的唯一例外：它们一行紧挨着一行，点击区域没法伸出自己的行；横跨整个宽度的行容易点中，点错了也容易看到、容易改回来（[间距](../foundations/spacing.md#hit-targets)）。文字上下的空间，是这一行在一行选项文字周围留下的空间：桌面端 22px 的行高上下各 7px，触屏 20px 的行高上下各 8px。
- **第二行只增加它自己的高度，别的不变**，不管是标签换行（[输入框里的长值](#long-values-in-fields)），还是下面有一行描述。上下空间保持和单行选项一样，所以两行的选项看起来和旁边的选项一样宽松而不局促，两个两行选项也永远不会挤在一起。
- **列表从不设置选项的高度。** 同一个列表里的选项高度可以不同，内边距永远相同。不要给选项设固定高度、固定行框或 `leading-none`，也不要给列表设固定行高：一行能放下，第二行就会被截掉或挤扁。一次只显示部分选项的列表要逐个测量。
- **文字旁边的部分要放进这一行里**：16px 的图标、对勾、计数。它不会让单行选项变高。
- **高亮在弹出层内缩 4px**，用 `radius-chip`：离弹出层边缘这么近时，它跟随弹出层的圆角，所以拐角处和两侧的间距一样均匀。分隔线上下也留同样的 4px（[形状](../foundations/shape.md#inside-a-frame)）。

```example
select/compositions/option-height
```

组件自己处理这些（`py-option-inset` 是 36px 的行在一行文字周围留下的空间，`min-h-option` 是没有文字行的选项的最小高度），所以产品从不自己给选项加内边距。窗口较矮（高 600px 或以下）时，菜单不再收紧到 `py-1`：单行菜单项在那里本来就保持 36px 的最小高度，所以这项改动只挤压了两行的菜单项；现在矮屏幕（比如横着拿的手机）上的菜单可能要多滚动一点。

### 危险区 {#danger-zone}

- 危险区放在页面末尾，远离人们常改的设置。
- 会打断但可以撤销的操作（停止、离开、重置）用橙色，不可撤销的操作（删除）用红色（[颜色](../foundations/color.md#meanings-of-color)）。
- 删除服务器前，要求输入服务器的地址，因为它会为所有人删除其中的一切。其他删除操作用对话框确认，并写明删除的是什么（[反馈](./feedback.md#confirming)）。

### 前提条件 {#prerequisites}

- 不要显示还不能用的表单。缺了什么，就说缺了什么，并给出下一步：先连接一台计算机，再创建 Agent。

## 相关 {#related}

- [写作](../content/writing.md#actions-and-their-dialogs)：标题和按钮文字。
- [反馈](./feedback.md)：其他错误放在哪里。
- [Input](../../packages/ui/src/components/input/input.md)、[Switch](../../packages/ui/src/components/switch/switch.md)、[Checkbox](../../packages/ui/src/components/checkbox/checkbox.md)、[RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md)、[Select](../../packages/ui/src/components/select/select.md)。
