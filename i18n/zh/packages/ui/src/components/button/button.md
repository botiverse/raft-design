---
title: Button
summary: 执行操作的按钮，可以带标签也可以不带；颜色说明它是哪一类操作，尺寸由它所在的位置决定。
sourceHash: 728773a6
---

# Button

按钮启动一个操作。它的颜色说明这是哪一类操作：粉色用于这个界面存在的那一个操作，其余用墨色边框，取消和次要操作没有框，橙色用于会打断的操作，红色用于不可撤销的操作。只有图标的按钮是同一个组件，用图标尺寸。

```example
button/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 带标签的操作 | Button |
| 图标不用文字也能看懂的操作：搜索、更多、返回、关闭、复制、附件 | 图标尺寸的 Button；见[图标按钮](#icon-buttons) |
| 图标需要文字才能看懂的操作 | 带标签的 Button |
| 界面上最安静的控件，无论是不是操作 | [TextLink](../text-link/text-link.md)：悬停时出现下划线的文字 |
| 针对同一个东西的一组操作 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 选一个值 | [Select](../select/select.md) |

## 变体 {#variants}

| 变体 | 用于 | 例子 |
| --- | --- | --- |
| `variant="primary"` | 界面存在的那个操作：粉色贴纸 | Send、Create Channel、Bring an Agent |
| `variant="default"` | 其他所有操作，包括列表每一行都重复的操作：墨色边框 | Assign、Approve、Claim |
| `variant="ghost"` | 在自己画出边缘的表面里的取消和次要操作：没有框 | 对话框里的 Cancel |
| `variant="warning"` | 会打断但可以撤销的操作：橙色贴纸 | Stop Wug、Leave Channel、Reset |
| `variant="danger"` | 不可撤销的操作，用在确认对话框的确认按钮上：红色贴纸 | Delete Agent |
| `variant="on-frame"` | 外框上没有框的按钮：导航条、网页顶栏、桌面端标题栏 | 工作空间按钮 |

`accent` 的渲染与 `primary` 相同，`outline`、`information`、`muted` 和 `success` 与 `default` 相同。用表里的名字。

```example
button/compositions/on-frame
```

在外框上，按钮用外框的墨色（`foreground-on-frame`），悬停、按下以及弹出层打开期间在自身上叠一层 `fill-frame-medium`。文字和图标尺寸变成 36px 的外框项。

### 用哪种颜色 {#which-color}

**强调程度是相对于容纳按钮的表面而言的，不是操作本身的属性。** 一个没有框的 Cancel，在对话框里读起来是控件，在页面上读起来是一行文字；操作没变，变的是包着它的东西。判断标准是：这个表面打开时，是否自己画出边缘并获得焦点。对话框、底部面板、菜单、弹出层、工具栏、卡片、面板头部都是；页面和页面里的一节不是。如果一个表面不在这个列表里，用这个标准判断，不要猜：如果按钮是唯一能标出它所在位置的东西，就给它加边框。

每个按钮都是平的：标出它是控件的是墨色边框或贴纸，永远不是阴影（[层级](../../../../../design/foundations/elevation.md)）。彩色按钮用墨色文字（[颜色](../../../../../design/foundations/color.md#stickers)）。

- 主操作用粉色。每个界面最多一个粉色按钮；也可以没有。未读数和提醒圆点不算在这一个里。
- 一个界面有第二个主操作时，用 `default`。
- 其他所有操作都用墨色边框（`default`）。
- 在自己画出边缘的表面里，取消和次要操作不加框（`ghost`）。在页面上，同样的操作用墨色边框（`default`）。
- 阶梯的最底层用 [TextLink](../text-link/text-link.md)：连无框按钮都显得太重的地方，比如登录页上的 Forgot Password，或分节标题旁边的 See All。它可以承载操作，但它是界面上最安静的控件，永远不是在拥挤的一行里多塞一个按钮的办法。它不是 Button 的变体：文字链接是一行里的一个词，不是一个框，所以它跟随周围文字的大小；而 Button 会带来高度、边框和内边距，每一样都得再去掉。
- 会打断但可以撤销的操作用橙色（`warning`）：停止、离开、重置。
- 红色（`danger`）只用于不可撤销的操作，而且只用在确认对话框里（[AlertDialog](../alert-dialog/alert-dialog.md)）。菜单里的破坏性项不要上色（[DropdownMenu](../dropdown-menu/dropdown-menu.md)）。
- 不要用 `danger-secondary` 或 `danger-outline`：描边按钮上的红字会让红色出现在确认对话框之外。
- 永远不要把按钮做成黄色：黄色表示「你」（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。

### 尺寸 {#sizes}

尺寸跟随用途。同样的用途在哪里都是同样的尺寸，没有别的尺寸。`lg`、`icon-lg` 和 `xl` 用控件高度（[间距](../../../../../design/foundations/spacing.md#heights)）：在手机和触屏上是手指的大小，在桌面端（768px 起，使用鼠标或触控板）是飞书 PC 端的尺寸。在桌面端，`lg` 和 `md` 一样高，但内边距更宽，标签用 `text-subhead`。仍然按表里的用途选 `lg`：同一份代码在手机上运行，那里 `lg` 是这个用途需要的手指大小的按钮；在桌面端它不多占高度。

| 尺寸 | 高度 | 用于 |
| --- | --- | --- |
| `size="lg"` | 手机上 44px；桌面端 32px，点击区域 44px | 对话框和抽屉的底栏、表单提交按钮、面板底部占满宽度的一列操作（Remove Member、Leave Channel、Archive Channel） |
| `size="md"`（默认） | 32px，点击区域 44px | 列表行、卡片、横幅、工具栏和面板头部里的操作 |
| `size="xl"` | 手机上 52px，桌面端 40px | 只用于登录、注册或设置表单上占满宽度的粉色按钮 |

这三种加上两种图标尺寸 `icon-md` 和 `icon-lg`，就是全部尺寸。`xs` 和 `sm` 的渲染与 `md` 完全相同，`icon-xs` 和 `icon-sm` 与 `icon-md` 完全相同。它们是已弃用的别名，保留到 raft-ui 1.0。`node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <src>` 会把它们改名，屏幕上什么都不会变。

一个地方看起来放不下 32px 的按钮时，改容器，不要改按钮。带按钮的横幅就是标准横幅，不是 `sm`。

#### 按位置选尺寸 {#size-by-place}

每个位置只有一个答案。位置由容器的某个部件决定时，跟随它：尺寸随位置而来，不随按钮而来。

| 位置 | 尺寸 | 谁决定 |
| --- | --- | --- |
| 对话框、抽屉和底部面板的底栏 | `lg` | `DialogFooter`：Cancel 和提交按钮是 `lg`。移到手机头部的 `DialogCommit` 是 `md` |
| 表单的提交；装有输入框的卡片上的 Save | `lg` | 你，因为上面有输入框 |
| 输入框旁边：复制链接、删除一行、添加 | `lg`、`icon-lg` | 你：它和输入框一样高（[图标按钮](#icon-buttons)） |
| 登录、注册或设置表单上占满宽度的按钮 | `xl` | 你 |
| 面板底部占满宽度的一列操作 | `lg` | 你 |
| 横幅的按钮和它的 Dismiss | `md` | `BannerAction` 负责摆放；`BannerClose` 是它自己的 32px × |
| 轻提示的操作 | 无 | `ToastAction` 是轻提示自己的文字操作；不用 Button 尺寸 |
| 桌面端面板头部 | 无 | `PanelAction` 和 `PanelToggleAction` 是它们自己的按钮，桌面端 32px，手机上 44px |
| 卡片和消息操作卡片上的操作；设置分节里的单个操作 | `md` | 你 |
| 列表行或表格行的末尾 | `md`、`icon-md` | 你 |
| 工具栏、筛选栏、空状态、弹出层底部、Load More | `md`、`icon-md` | 你 |
| 手机顶栏；媒体查看器 | `icon-lg` | 顶栏、`Lightbox` |
| 导航条、网页顶栏、桌面端标题栏 | `md` 或 `icon-md`（36px）的 `on-frame` | 外框 |
| 菜单、手机上的溢出菜单 | 不用 Button：用菜单项 | `DropdownMenu`、底部面板 |

#### 浮动工具栏里 {#inside-a-floating-toolbar}

浮在内容上方的工具栏会出现在鼠标指针下的每条消息上，所以它比页面更紧凑。消息悬停工具栏和文字选择工具栏高 36px，按钮 28px，距外框 4px，彼此间隔 4px，圆角为 `radius-chip`。尺寸由容器决定：`MessageItemToolbarButton` 和 `MessageTextSelectionToolbarButton` 是工具栏自己的部件，`MessageMultiSelectToolbarActions` 会把放进去的 `md` Button 变成 28px（[MessageItem](../message-item/message-item.md)）。唯一的另一个 28px 按钮是侧边栏分节 16px 标题行上的 `SidebarSectionControl`。28px 不是 Button 的尺寸，所以不要自己把 Button 做成 28px。

### 图标按钮 {#icon-buttons}

| 位置 | 属性 | 尺寸和图标 |
| --- | --- | --- |
| 手机顶栏，或输入框旁边 | `variant="ghost" size="icon-lg"` | 手机上 44px，图标 22px；桌面端 32px，图标 18px，点击区域 44px |
| 桌面端面板头部、消息输入框工具、卡片和命令行里的复制 | `variant="ghost" size="icon-md"` | 32px，图标 18px，点击区域 44px |
| 在内容里单独出现的工具 | 图标尺寸的 `variant="default"` | `layer-card` 上的墨色边框 |
| Send | 图标尺寸的 `variant="primary"` | 粉色贴纸 |
| 导航条、网页顶栏、桌面端标题栏 | `variant="on-frame" size="icon-md"` | 36px，图标 20px |

- 输入框旁边的图标按钮（复制链接、删除一行）和输入框一样高：`size="icon-lg"`，它在手机和桌面端都跟随输入框的高度。
- 面板头部的多个图标按钮放进 `PanelActions`（[Panel](../panel/panel.md)），它会把按钮对齐到末端并留好间隔。
- 有新内容的铃铛，在右上角加提醒圆点。
- 发送按钮算作这个界面的粉色按钮。

各场景的图标尺寸见[图标](../../../../../design/foundations/iconography.md#sizes)。

## 状态 {#states}

悬停、按下、焦点和禁用遵循[状态](../../../../../design/foundations/states.md)：每个按钮悬停和按下时都用中档（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）：贴纸在自身上叠 `sticker-medium`，纸面色的按钮叠 `fill-medium`。

- **禁用，无框：** 无框的图标按钮（图标尺寸的 `ghost`）和 `on-frame` 按钮只把图标和文字变成 `foreground-disabled`，不出现填充或边框。
- **禁用，彩色：** 禁用的粉色、橙色或红色按钮不再是贴纸：它用统一的禁用样式。
- **加载中：** `loading` 显示像素加载指示器（[Spinner](../spinner/spinner.md)），并保持按钮的宽度和颜色。按钮触发的任何等待都用它（[选择组件](../../../../../design/components/overview.md#waiting)）。

## 内容 {#content}

- 以动词开头，说出结果：写 Send for Review，不写 OK 或 Submit。在对话框里，标题已经说出对象，所以主按钮只写动词：Create Channel 里写 Create（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 用 Title Case（每个实词首字母大写）（[写作](../../../../../design/content/writing.md#casing)），并在按钮打开的对话框里重复按钮上的词（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 图标放在标签前面（`data-icon="inline-start"`），Return 或箭头放在标签后面（`data-icon="inline-end"`）。
- 加载时，说出正在发生什么：Creating…。

## 无障碍 {#accessibility}

Button 包装 Base UI Button，渲染原生的 `<button>`。用于导航时，改为渲染真正的链接：`render={<a href="…" />}`。

- 每个只有图标的按钮都加一个 Title Case 的 `aria-label`（Add Reaction）。在有鼠标指针的设备上，加一个同名并带快捷键的 [Tooltip](../tooltip/tooltip.md)。
- `loading` 期间，按钮是 `aria-disabled`，加载指示器的名称由 `loadingLabel` 提供。把 `loadingLabel` 设为正在发生的事。
- 需要用 Tooltip 解释操作为什么不可用时，用 `focusableWhenDisabled`：按钮保持可聚焦，同时保持禁用样式。
