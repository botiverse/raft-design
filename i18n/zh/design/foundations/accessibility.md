---
title: 无障碍
summary: 每个 Raft 产品都遵守的规则，让它在任何视力、键盘、读屏软件、触屏或动效设置下都能用：对比度、焦点、点击区域、动效、语义、触屏和语言，以及实现这些规则的组件。
sourceHash: c4280eac
---

# 无障碍

Raft 是人们整天开着的工作空间，旁边是从不停工的 Agent。它要在每种表面上都清晰可读，只用键盘也能操作，对读屏软件清楚明白，在触屏上用着顺手，对关闭了动效的人保持静止。本页汇总适用于所有组件的规则。每份组件文档的「Accessibility」一节只补充该组件自己提供的、或需要你来提供的内容（[写作指南](../authoring/writing.md#accessibility)）。

## 原则 {#principles}

- **含义从不只靠一种感官。** 颜色、图标、像素点或动画总是配一个词，要么在屏幕上，要么在无障碍名称里。状态标签有像素点也有文字；横幅的图标重复它文字说的内容。
- **每个操作都有键盘路径和触屏路径。** 悬停、右键、长按和拖拽都是快捷方式，从不是唯一途径。
- **用平台自带的行为。** raft-ui 基于原生元素和 [Base UI](https://base-ui.com) 原语构建，由它们提供角色、焦点处理和按键。raft-ui 加上外观和默认名称，产品再加上只有它自己知道的名称。
- **这些保证没有需要记住的例外。** 对比度、焦点环和点击区域由 token 和样式配方决定，所以用了它们的组件默认就是对的。

## 对比度 {#contrast}

token 的取值保证文字不必再逐个表面检查；见[颜色](./color.md#contrast)。

- `foreground`、`foreground-muted` 和 `foreground-hint` 的文字，在浅色和深色模式下，在每种表面、每种浅色底和每个弹出层上都至少有 4.5:1。第三级文字承载人们需要读的时间、ID 和数量，所以和正文享有同样的保证（[颜色](./color.md#contrast)）。
- 错误文字和无效输入框的边框用 `danger-strong`，在纸面上至少 4.5:1。更亮的 `danger` 只用于删除按钮，那里的文字是墨色（[颜色](./color.md#contrast)）。
- 贴纸上的墨色（`sticker-ink`）在两种模式下都至少 6.8:1。贴纸上从不放白字，因为白色在黄色、青柠色或青色上不达标。
- 控件有 1.5px 的墨色边框（`line-strong`；输入框周围用 `line-field`），所以每个控件的边缘在任何表面上都清楚。浅色模式下 `line-seam` 在白色上是 3.0:1，在黄色上是 2.8:1；它用来分隔区域，从不用来标出控件。
- 用三级文字 token，不要用它们的透明度变体（`text-foreground-muted/70`）：保证只对这几个层级 token 成立。
- `foreground-disabled` 故意低于 4.5:1，这是对非活动控件的允许范围。不要把它用于人们需要读的文字。需要让人知道某个操作为什么不可用时，用 `focusableWhenDisabled` 让按钮仍能获得焦点，并在 [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) 里说明（[Button](../../packages/ui/src/components/button/button.md#accessibility)）。
- 修改 `tokens.json` 中的文字、表面或浅色底 token 时，两种模式下都要重新核对这些比值。目前还没有自动测试检查它们。

## 焦点与键盘 {#focus-and-keyboard}

用键盘的人必须始终看得到自己在哪，并能到达鼠标指针能到达的一切。

- 给每个能用键盘到达的元素在 `:focus-visible` 时加上 `focus-ring`（`shadow-focus`）：先是 2px 表面色的间隙，再是 2px 墨色。它是墨色而不是黄色，所以在黄色外框和黄色贴纸上也看得见（[层级](./elevation.md#focus-ring)）。
- 只在键盘导航后显示焦点环，点击、轻点或输入之后都不显示（[状态](./states.md#focus)）。键盘用户每次移动都看得到它；只要输入不是 raft-ui 能识别的鼠标指针（还没有任何输入时、读屏软件的浏览光标或合成的按压），它也会显示，所以满足 [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)；用鼠标指针的人则不会看到一个告诉他们刚点了什么的焦点环。
- 复合控件（输入框、带附加项的输入框）内部有元素获得键盘焦点时，给整组加焦点环；复选框或单选框则给它的方框加（[状态](./states.md#focus)）。
- 让复合控件只占一个 Tab 停留点，在内部用方向键移动：[RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md)、[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)、[Tabs](../../packages/ui/src/components/tabs/tabs.md)、[ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md) 和菜单。按键由 Base UI 提供。
- 在模态浮层中锁定焦点，用 Esc 关闭，并把焦点还给触发它的元素：[Dialog](../../packages/ui/src/components/dialog/dialog.md) 和 [Drawer](../../packages/ui/src/components/drawer/drawer.md) 已经这样做。
- 悬停时显示的东西，键盘聚焦时也要显示：消息工具栏（[MessageItem](../../packages/ui/src/components/message-item/message-item.md)）、工具提示、预览卡片（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)）、可编辑头像的浮层（[Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)）。
- 右键菜单的每个操作也要能从一个可见控件触发，比如 ⋯ 按钮：右键和长按无法用键盘完成（[ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)）。
- 给拖放提供键盘路径。任务卡片用空格拿起，用方向键移动，用空格放下，用 Escape 放回原处（[TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)、[TaskBoard](../../packages/ui/src/components/task-board/task-board.md)）。可排序的标签页目前还不能用键盘重新排序（[Tabs](../../packages/ui/src/components/tabs/tabs.md#accessibility)）。
- 如果一行里只有其中的控件可交互，把这一行渲染为 `<div>`，这样 Tab 会跳到控件上，而不是停在一个什么也不做的行上（[状态](./states.md#usage)）。
- 在操作的工具提示或菜单项里用 [Kbd](../../packages/ui/src/components/kbd/kbd.md) 显示快捷键。快捷键用符号书写时（⌘K），给它一个用文字写的 `aria-label`：Command K。

## 点击区域 {#hit-targets}

手指没有鼠标指针精确，点不中的目标会让人觉得坏了。

- 每个触屏目标在两个方向上都至少 44px（[间距](./spacing.md#hit-targets)）。
- 用点击区域达到 44px，而不是用绘制出来的图形。32px 的 [Button](../../packages/ui/src/components/button/button.md) 和 20px 的 [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) 把透明的 `::after` 扩展到 44px，这样布局保持紧凑，目标依然够大。
- 不要扩展正文中的行内链接和引用标签：它们跟随文字行。
- 只用鼠标指针操作的桌面端控件可以更小：侧栏行 36px，导航条项 40px，悬停工具栏 36px、其中按钮 28px；在桌面端（768px 起且使用鼠标或触控板），默认控件（比如输入框）32px。触屏在任何宽度下都保持 44px（[间距](./spacing.md#heights)），弹出列表中的行除外，它们在任何地方都是 36px（[间距](./spacing.md#hit-targets)）。
- [ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md) 的项是 32px，且不扩展点击区域。在它们支持之前，不要在触屏上用切换组。

## 动效 {#motion}

Raft 一看就是几个小时，动效会让人头晕，或让人从正在读的内容上分心。动效用来确认一个操作或表明某样东西从哪来，任何事都不依赖于看到它（[动效](./motion.md)）。

- 在 `prefers-reduced-motion: reduce` 下关闭所有动画和过渡。组件用 Tailwind 的 `motion-reduce:` 变体或 `@media (prefers-reduced-motion: reduce)` 块；新增动画要在同一次改动里加上它。
- 减少动效时，[Spinner](../../packages/ui/src/components/spinner/spinner.md) 停止转动并保持第一个像素点亮着，[Skeleton](../../packages/ui/src/components/skeleton/skeleton.md) 停止闪烁。两者仍然表明正在加载。
- 不要让状态循环播放。正在工作的 Agent 是一盏静止的黄灯，不是一闪一闪的。
- 居中的浮层不带动画地出现，这样不会有东西在人们没要求的情况下滑进来（[动效](./motion.md#usage)）。

## 读屏软件 {#screen-readers}

读屏软件朗读的是标记说了什么，而不是屏幕上显示了什么。每个控件都需要角色、名称和状态，每个人们必须注意到的变化都需要被播报。

### 角色与名称 {#roles-and-names}

- 用原生元素或 Base UI 原语来提供角色。不要加上 ARIA 控件角色却不提供它所承诺的焦点、键盘和关闭行为。
- 给每个纯图标按钮一个 Title Case 的 `aria-label`，与它的工具提示用词相同：Add Reaction（[Button](../../packages/ui/src/components/button/button.md#accessibility)）。
- 有可见文字的控件，其无障碍名称要以这段文字开头。用语音控制的人会说出他们看到的字。
- 给每个对话框、抽屉和底部面板一个标题；打开时播报的就是它（[Dialog](../../packages/ui/src/components/dialog/dialog.md#accessibility)）。
- 旁边已经有文字时，对辅助技术隐藏装饰（`aria-hidden`）：文字旁的状态像素点、横幅的图标、轻提示的图标和进度条（[Status](../../packages/ui/src/components/status/status.md)）。
- 给没有文字、单独存在的东西命名：在线状态灯加上 `role="img"` 和它的状态（"Online"）；提醒圆点说明在等什么；头像堆叠说出完整数量（"5 agents working"），因为它只显示 "+3"（[Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)）。
- 显示数量或圆点的触发器，名称里要包含未读状态："Notifications, 2 unread"（[NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)）。
- 用 `aria-busy="true"` 标记正在加载的区域；骨架屏是隐藏的（[Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)）。

### 实时区域 {#live-regions}

变化有多紧急，就以多紧急的方式播报。破坏性的问题会打断；其他一切都等读屏软件空闲时再播报。

| 什么变化 | 怎么播报 | 组件 |
| --- | --- | --- |
| `status="destructive"` 的横幅 | `role="alert"`，打断 | [Banner](../../packages/ui/src/components/banner/banner.md) |
| 其他横幅 | `role="status"`，礼貌 | [Banner](../../packages/ui/src/components/banner/banner.md) |
| 轻提示 | Base UI 的轻提示实时区域；轻提示获得焦点时保持打开 | [Toast](../../packages/ui/src/components/toast/toast.md) |
| 出现字段错误 | `FieldError` 上的 `role="alert"` | [Field](../../packages/ui/src/components/field/field.md) |
| 开始加载 | 加载指示器上的 `role="status"`，名称为 "Loading"，除非你说明加载的是什么 | [Spinner](../../packages/ui/src/components/spinner/spinner.md) |
| 复制成功 | 复制按钮上的 `aria-live="polite"` | [CopyableCode](../../packages/ui/src/components/copyable-code/copyable-code.md) |
| Agent 开始或停止工作 | 活动条上的 `aria-live="polite"` | [LiveAgentActivityBar](../../packages/ui/src/components/live-agent-activity-bar/live-agent-activity-bar.md) |
| 回应失败 | 一个视觉上隐藏的 `role="status"` | [MessageItem](../../packages/ui/src/components/message-item/message-item.md) |

- 让轻提示或横幅的标题承载完整含义：它的图标是隐藏的。
- 不要把人们绝不能错过的内容只放在轻提示里：它会消失（[反馈](../patterns/feedback.md)）。

## 触屏 {#touch}

触屏没有悬停、没有右键、没有键盘快捷键，而且手指会挡住按下的地方。

- 只在能悬停的设备上显示悬停样式。Tailwind 的 `hover:` 变体只在 `@media (hover: hover)` 下生效，所以用它，而不是裸写 `:hover`（[动效](./motion.md#usage)）。
- 触屏上不显示消息的悬停工具栏；长按打开消息菜单（[响应式布局](../patterns/responsive.md)、[ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)）。
- 触屏上不要依赖工具提示。把说明写在界面里，或在长按时显示（[Tooltip](../../packages/ui/src/components/tooltip/tooltip.md#accessibility)）。预览卡片在触屏上不会打开，所以把它的触发器做成真正的链接（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)）。
- 在触屏上，手指先静止按住 500ms、再移动，才开始拖拽，这样滚动列表时不会移动卡片、行或服务器，静止按住则打开菜单。所有能拖动的列表都用同一个按住时长，任务卡片也一样（[触屏上的拖动](./states.md#dragging-on-a-touch-screen)）。
- 不要让滑动成为关闭某样东西的唯一方式：抽屉和面板保留 ×、返回或一个按钮，轻提示保留 `ToastClose`（[Drawer](../../packages/ui/src/components/drawer/drawer.md#accessibility)）。
- 让输入框保持在屏幕键盘上方；手机竖持时，让回车键插入新行（[Composer](../../packages/ui/src/components/composer/composer.md)）。

## 语言与大小写 {#language-and-casing}

- 不要把文字设为全大写，无论是用 CSS 还是直接写在字符串里。全大写抹掉了单词的形状，读起来更慢，而且有些读屏软件会把简短的全大写字符串当作缩写逐个字母朗读（[0002](../decisions/0002-no-all-caps.md)、[字体排印](./typography.md#casing)）。
- 可点击的东西用 Title Case，其他一切用 sentence case，这样一个标签在屏幕上、工具提示里和无障碍名称中读起来都一样（[写作](../content/writing.md#casing)）。
- 在 `<html>` 元素上把 `lang` 设为界面语言。读屏软件据此选择嗓音和发音。Raft 网页应用在界面语言变化时都会设置它。
- 在无障碍名称里写明符号的含义：快捷键的 ⌘、数量的 +3、两条信息之间的分隔符。
- 用平实的话写错误和空状态，说明发生了什么、接下来该做什么（[语气](../content/voice-and-tone.md)）。

## 检查一次改动 {#checking-a-change}

改动上线之前，按人们实际使用的方式检查它：

- 只用键盘操作：Tab 能到达一切，用键盘移动时焦点始终可见，Esc 能关闭打开的东西。
- 读无障碍树：每个控件都有角色、以可见文字开头的名称，以及它的状态。
- 打开减少动效：什么都不动，加载仍然看得出是在加载。
- 在触屏或触屏模拟下试用：每个目标都是 44px，没有东西需要悬停。
- 在深色模式下和 320px 宽度下看一看（[设计系统](../README.md)）。

## 相关 {#related}

- [颜色](./color.md#contrast)：对比度保证及其背后的 token。
- [层级](./elevation.md#focus-ring)和[状态](./states.md#focus)：焦点环。
- [间距](./spacing.md#hit-targets)：点击区域和控件高度。
- [动效](./motion.md)：什么会动，什么从不动。
- [写作](../content/writing.md)：标签、大小写和错误措辞。
