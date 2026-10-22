---
title: 组件
summary: raft-ui 的两层组件（任何应用都需要的核心组件，以及承载 Raft 产品概念的协作组件）、如何选择组件，以及哪些东西由已有组件拼成。
sourceHash: fdb9b97f
---

# 组件

raft-ui 的组件分两层。**核心（Core）**是任何应用都需要的部件：按钮、输入框、对话框、标签页、表格、头像。**协作（Collaboration）**是承载 Raft 自身概念的部件：消息、消息列、任务、agent、动态（Activity）和通知、搜索和文件。本页说明每一层用来做什么，几个组件看起来都合适时该选哪个，以及哪些东西应该用已有部件拼出来，而不是重新设计。选定之后怎么用，见各组件自己的文档。

## 两层 {#two-layers}

### 核心 {#core}

核心组件是通用的。它们对消息、任务或 agent 一无所知：API 只谈值、条目、插槽和状态，放进一个完全没有 Raft 概念的应用里也能原样工作。Button、Field、Select、Dialog、Drawer、Tabs、Table、Markdown、Avatar 和 Status 都是核心组件。

核心组件按部件的作用分组：

| 类别 | 包含什么 |
| --- | --- |
| 操作（Actions） | 按钮 |
| 输入（Inputs） | 表单控件及其周边部件：输入框、选择器、开关、标签和字段 |
| 导航（Navigation） | 在不同地方和区块之间移动：导航条、侧边栏、手机标签栏、标签页、步骤、分段控件 |
| 浮层（Overlays） | 所有浮在页面之上的东西：对话框、抽屉、菜单、弹出层、工具提示、图片查看器 |
| 反馈（Feedback） | 告诉人一个结果、一个问题、一段等待或一个空视图 |
| 布局（Layout） | 屏幕的框架和各个区域：应用外壳、面板、卡片、分隔线、可调整大小的列 |
| 数据展示（Data display） | 展示内容和事实：文字、Markdown、代码、表格、描述列表、列表行、虚拟化长列表、徽标、状态像素点 |
| 身份（Identity） | 代表某人或某物的东西：头像、图标块、会话图标、logo |

### 协作 {#collaboration}

协作组件体现 Raft 的协作领域。每个组件都承载一个产品概念以及随之而来的规则：消息正文下方显示什么，一个消息列怎样概括在发起它的消息下面，任务按什么顺序经历哪些状态，agent 的审批请求处理完之后记录什么。它们由核心部件构建。

协作组件按概念分组：

| 类别 | 包含什么 |
| --- | --- |
| 消息（Messages） | 单条消息及其组成部分（附件、嵌入内容、回复、翻译）、事件行、消息列表、消息输入框，以及会话面板和消息列面板 |
| 任务（Tasks） | 任务卡片、看板和列表视图、所有任务视图共用的部件，以及展示任务历史的时间线 |
| Agent（Agents） | 人或 agent 的个人资料，以及 agent 附在消息上、请人确认的卡片 |
| 收件箱（Inbox） | 动态、动态的行，以及通知中心 |
| 搜索（Search） | 搜索入口和搜索结果的行 |
| 文件（Files） | 某个地方共享的文件，以及显示文件类型的图标 |

### 为什么这样分 {#why-the-split}

- **核心组件可以在任何地方复用。** 每个 Raft 产品（现在是 Raft Chat，接下来是 Tasks、Calendar 等）和任何内部工具都可以拿走一个核心部件，而不必带上 Raft 的数据模型。raft-ui 在代码里保证这一点：核心组件从不导入协作组件，而协作组件构建在核心组件之上。
- **每条规则只在一个地方。** 关于颜色、线、形状或状态的规则属于核心部件，每个产品都继承它。关于产品概念的规则（一个消息列显示几条回复预览、任务状态的顺序）属于承载这个概念的协作部件，所以改变概念只需改一个组件，而不是每个显示它的屏幕。
- **它告诉你去哪里找。** 构建和消息、任务、agent、动态或通知有关的东西时，从协作组件开始：你需要的部件（或者它的大部分）很可能已经存在，并且已经遵守产品规则。构建通用的东西时，留在核心组件里，不要因为某个协作部件看起来合适就借来用。InboxItem 是表示别处发生了某件事的行；设置列表用 [ListRow](../../packages/ui/src/components/list-row/list-row.md)，尽管两者都是带图标和标题的行。

### 新组件属于哪一层 {#which-layer-a-new-component-belongs-to}

只问一个问题：在一个没有消息、任务、agent、动态或通知的应用里，这个部件还说得通吗？

- **说得通：** 它是核心组件。按它做的事命名（如果 `Timeline` 不知道任务状态，它就会是核心组件），不给它任何产品相关的 props，放进它所做之事的类别。
- **说不通：** 它的名字、props 或规则提到了 Raft 的概念，所以它是协作组件。用核心部件构建它，放进它所属概念的类别。

一个核心部件开始需要产品概念时，它就已经变成了两个部件：把通用的那个留在核心层，在协作层基于它构建产品的那个。

## 如何选择组件 {#how-to-choose-a-component}

同一件事可能有好几个组件看起来都合适。下面的表格为每种情况选定一个，每一节开头都是起决定作用的那个问题。每次往屏幕上放控件、消息、弹出内容或行时都用这些表格。产品不推翻这些选择；某个产品特有的情况写在该产品的页面上。

### 选择 {#picking-something}

选择器由两个问题决定：选择何时生效，以及有多少个值。立即生效的控件（Switch、菜单）必须能放心切换，不需要保存；随表单保存的控件（Checkbox、RadioGroup、Select）可以等人检查一遍（[表单](../patterns/forms.md)）。单选按钮把每个选项都显示出来，所以只适合少数几个；下拉选择把值收在一个字段后面，所以能容纳更多；再多的话，人就需要搜索了。

| 你需要 | 使用 |
| --- | --- |
| 对一样东西执行操作 | 菜单（[DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)）；在手机上长按会打开同一个菜单（[ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)） |
| 是或否，立即生效 | [Switch](../../packages/ui/src/components/switch/switch.md) |
| 是或否，保存时生效 | [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) |
| 2 到 5 个选项中选一个，随表单提交 | [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md) |
| 同一内容的另一种视图 | [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md) |
| 同一个页面的另一种语言 | 一个列出各种语言的菜单，每种语言用它自己的名字（[DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)，用单选项） |
| 同一页面的不同区块，各有自己的内容 | [Tabs](../../packages/ui/src/components/tabs/tabs.md) |
| 最多 10 个值中选一个 | [Select](../../packages/ui/src/components/select/select.md) |
| 很多值中选一个 | 一个可以输入文字来筛选列表的字段，手机上也一样（[ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md)）。如果人只选不输入，用 [Select](../../packages/ui/src/components/select/select.md)：ComboboxSelect 总会弹出手机键盘 |
| 几个值中选几个 | 多选：每项前面有一个复选框，字段里显示已选的值（带 `multiple` 的 [Select](../../packages/ui/src/components/select/select.md)） |
| 很多值中选几个（人、agent、标签） | 带搜索的多选：已选的值在字段里变成标签片，可以接着在后面输入（带 `multiple` 的 [ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md)，或带标签片的 [Combobox](../../packages/ui/src/components/combobox/combobox.md)） |
| 筛选一个列表 | 筛选器：从 [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md) 打开的下拉选择或组合框 |
| 原地修改某一项的一个属性 | [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) 里的值打开一个选择器 |

SegmentedControl 和 Tabs 看起来很像，由内容决定用哪个：分段控件用另一种方式显示同样的内容（Board 或 List），标签页切换到不同的内容。

### 告诉人一件事 {#telling-people-something}

消息的作用范围决定它放在哪里，情况持续多久决定消息停留多久。范围越大，位置越靠外：输入框的错误在输入框下方，面板的问题在面板头部下方，服务器的问题在通知中心（[反馈](../patterns/feedback.md)）。

| 情况 | 使用 | 停留多久 |
| --- | --- | --- |
| 这个人刚做的事有了结果 | [Toast](../../packages/ui/src/components/toast/toast.md) | 几秒 |
| 他们需要在操作前知道 | [Banner](../../packages/ui/src/components/banner/banner.md)，放在对话框或表单里 | 一直显示 |
| 某个面板里有东西失败了：agent 无法启动，会话的某项设置没保存上 | 面板头部下方的通栏提示（`PanelNotice`，[Panel](../../packages/ui/src/components/panel/panel.md)） | 直到问题解决或被关闭 |
| 整个服务器的状态：计算机离线、配额快满、有更新 | 通知中心（[NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)），铃铛上显示提醒圆点 | 直到状态改变 |
| 别处发生了这个人应该看到的事 | 动态（[ActivityInbox](../../packages/ui/src/components/activity-inbox/activity-inbox.md)）；它的入口显示提醒圆点或数字 | 直到被读过 |
| Agent 需要审批 | 会话里的操作卡片（[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)） | 直到被处理 |
| 这个人必须马上做决定 | [Dialog](../../packages/ui/src/components/dialog/dialog.md) | 直到做出决定 |
| 输入无效 | 输入框的错误状态（[Field](../../packages/ui/src/components/field/field.md)） | 直到改正 |
| 图标是什么意思 | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) | 悬停期间 |

- 不要把漏看了就会让人困惑的内容放进轻提示。轻提示会自己消失，所以它只能确认这个人已经预料到的事。

### 浮层 {#overlays}

浮层对人的要求越多，占的屏幕就越大。只提供信息的，悬停时打开；小的选择，在被点击的东西旁边打开；人要看一会儿的内容，从侧边滑入，页面仍在后面；必须完成才能继续的，放在中间，背后有遮罩。

| 情况 | 使用 |
| --- | --- |
| 悬停时显示一句话 | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) |
| 悬停时显示一个人或 agent | 个人资料卡（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)） |
| 点击或长按时显示一组操作 | [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) |
| 点击时选一个值 | [Select](../../packages/ui/src/components/select/select.md)，值多时带搜索 |
| 点击时选几个值 | 多选，值多时带搜索。选中一个值不会关闭列表 |
| 点击时做一点输入 | [Popover](../../packages/ui/src/components/popover/popover.md) |
| 人要看一会儿的详情和设置 | [Drawer](../../packages/ui/src/components/drawer/drawer.md) |
| 一次填完的大表单 | 宽的 [Dialog](../../packages/ui/src/components/dialog/dialog.md)；见[表单](../patterns/forms.md#the-large-form-dialog) |
| 从顶栏打开的短列表：Working now、通知、服务器列表 | [Popover](../../packages/ui/src/components/popover/popover.md)，手机上也一样。在手机上，服务器列表锚定在顶栏下方（[导航](../patterns/navigation.md#servers)） |
| 手机上的简短说明 | 底部面板（[Drawer](../../packages/ui/src/components/drawer/drawer.md)） |
| 手机上有多个字段、长列表或多个步骤的对话框 | 占屏幕高度 90% 的面板；做决定、只供阅读的内容或单个输入框仍用居中的对话框（[Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)） |
| 确认 | `size="sm"` 的 [Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)，400px，与 AlertDialog 同宽，带 Cancel 和确认按钮；见[反馈](../patterns/feedback.md#confirming)。Raft Chat 的确认都基于 Dialog 构建，只有两处用 [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md)：放弃对 agent 个人资料未保存的修改，以及打开一个会跳转到其他应用的链接 |
| 任务详情 | 居中对话框，960px 宽，手机上全屏：Dialog 四种尺寸之外的一个工作空间浮层（[任务](../patterns/tasks.md)，[Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)） |

- 每个居中浮层背后都放遮罩：对话框、确认、搜索、任务详情、大表单。浮层怎么运动，见[动效](../foundations/motion.md#usage)。

### 等待 {#waiting}

对一段等待了解得越多，它的指示就越具体。已知布局的，用骨架屏占住，内容到达时就不会跳动；已知百分比的，用进度条；两者都不知道的，用加载指示器；由按钮发起的等待，留在按钮上，因为人本来就在看那里。

| 情况 | 使用 |
| --- | --- |
| 布局已知 | [Skeleton](../../packages/ui/src/components/skeleton/skeleton.md) |
| 时长未知，也没有布局可以占位 | 像素加载指示器（[Spinner](../../packages/ui/src/components/spinner/spinner.md)） |
| 百分比已知 | [Progress](../../packages/ui/src/components/progress/progress.md) |
| 由按钮发起的等待 | 按钮的加载状态（[Button](../../packages/ui/src/components/button/button.md)） |

- 这些都不要用粉色。它们是被动的，而粉色表示有东西在等这个人处理。
- Raft Chat 还有两处没遵守骨架屏的规则：会话时间线和个人资料面板在等待时显示文字 "Loading…"。

### 行 {#rows}

行跟随它所代表的东西，而不是它出现的位置：一个地方在侧边栏里和在手机的地方列表里看起来一样，其他各类行则带上各自主体需要的东西（待查看事项的提醒圆点、任务的状态标签）。同一类行在应用的各个标签页里也是同样大小（[同一类，同样大小](../foundations/spacing.md#the-same-kind-the-same-size)）。

| 位置 | 使用 |
| --- | --- |
| 桌面端侧边栏 | 侧边栏的行（[Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)） |
| 手机上的地方列表：主页的频道和私信、Members、Settings 列表 | 同样的侧边栏行，在手机上高 44px（[Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)） |
| 详情页或个人资料页上的 agent、人和应用，比如一台计算机的 agent | [ListRow](../../packages/ui/src/components/list-row/list-row.md)，放在内嵌分组里。产品用自己的一份副本（`AvatarListRow`）绘制这种行 |
| 动态和通知 | [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) |
| 搜索找到的消息 | 搜索结果行（[Search](../../packages/ui/src/components/search/search.md)） |
| 一个任务 | [TaskCard](../../packages/ui/src/components/task-card/task-card.md)，在看板或列表里 |

## 由已有部件拼成 {#built-from-existing-parts}

产品里有些东西没有自己的设计：它们由已有组件拼成。按这里的描述构建，不要新增颜色、形状或线。每多一个容器、颜色或线，人就要多学一样东西，系统也要多维护一样在浅色和深色、手机和桌面端之间保持一致的东西；而组合出来的东西会自动继承各部件的状态、深色模式和无障碍支持。

如果你需要的东西这里没有，也没有合适的组件，先按 [README](../principles/designing-a-new-feature.md#the-questions-to-ask) 里的六个问题过一遍，再添加任何东西。

### 任务详情 {#task-details}

一个居中的 [Dialog](../../packages/ui/src/components/dialog/dialog.md)，960px 宽，是 Dialog 四种尺寸之外的一个工作空间浮层：一条显示所在地方和任务编号的栏，标题和描述，一行属性（Status、Assignee、Created by）放在 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) 里，折叠起来的 [Timeline](../../packages/ui/src/components/timeline/timeline.md) 里是 History，然后是任务的消息列和一个 [Composer](../../packages/ui/src/components/composer/composer.md)。它的尺寸和那条栏见[任务](../patterns/tasks.md#structure)。

### 文件查看器 {#file-viewer}

从消息里打开的每个文件，无论是图片、PDF、文本、Markdown、表格、网页、视频还是音频，都在同一个查看器里打开：一个 [Lightbox](../../packages/ui/src/components/lightbox/lightbox.md)，上方是 `LightboxToolbar`，下方是文件自己的主体。只有主体随文件类型变化。人只需学一次文件的操作在哪里，之后对每个文件都适用。

- **每种类型的工具栏都一样：** 类型徽标、文件名，然后是按固定顺序排列的操作（Comments、Copy、Download，最后是 Close）。不适用于某个文件的操作省略掉，其余的保持顺序。
- **在手机上**，工具栏保留文件名、一个 More 菜单和 Close。Comments、Copy 和 Download 移进菜单；如果只有 Download 这一个操作，它仍作为单独的按钮。类型徽标和图库计数去掉，因为文件名需要空间，而缩略图已经显示了位置。
- **评论**：查看器渲染的文档上的评论放在旁边的边栏里，与对应段落对齐；查看器较窄时，段落旁的标记会在底部面板里打开评论（[评论](../patterns/comments.md)）。
- **纯文本**放在 [CodeBlock](../../packages/ui/src/components/code-block/code-block.md) 的框里，但会自动换行。查看器里的文件是从上往下读的，页内查找必须能找到每一行。消息里的代码片段仍然横向滚动。
- **图片**保留舞台区域、上一张和下一张，以及工具栏下方的缩略图。

```example
lightbox/compositions/attachment-preview-shell
```

### 链接卡片、转发的消息、引用预览 {#link-cards-forwarded-messages-quoted-previews}

文件卡片（[MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)）的结构，加上消息（[MessageItem](../../packages/ui/src/components/message-item/message-item.md)）的头部：[MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md)、[MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md)、[MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md)。

```example
message-forwarded-bundle/compositions/forwarded-bundle
```

```example
message-quoted-preview/compositions/quoted-preview
```

### 图表和 Markdown 表格 {#diagrams-and-markdown-tables}

与代码块（[CodeBlock](../../packages/ui/src/components/code-block/code-block.md)）相同的容器：`layer-code`、细线边框、`radius-container`。

### 翻译、已读和收藏标记 {#translation-read-and-saved-markers}

消息下方那一行里再加一个小标签片（Saved），或者一行简短的 Space Mono 文字：翻译放在原文下方，"Read" 作为一行状态，放在私信最后一条消息下方（[MessageTranslation](../../packages/ui/src/components/message-translation/message-translation.md)）。不要为它们新增颜色。

```example
message-translation/compositions/translation-showcase
```

### 选中消息时的工具栏 {#toolbar-for-selected-messages}

选中消息时，一个工具栏在会话底部取代消息输入框的位置：Select All、Cancel、Forward、Copy link，以及一个包含 Generate image 和 Copy MD 的 More 菜单。消息菜单里的 Select Message 开始选择；每条消息会出现一个复选框（[MessageItem](../../packages/ui/src/components/message-item/message-item.md)）。它是一个浮动工具栏，和悬停工具栏一样高 36px：里面的按钮 28px，距工具栏边缘 4px，按钮之间间隔 4px，使用 `radius-chip`（[形状](../foundations/shape.md#inside-a-frame)）。

```example
message-item/compositions/selection-showcase
```

### 可调整大小的列 {#resizable-columns}

两列之间的接缝线是唯一的线，拖动手柄就在它上面（[Resizable](../../packages/ui/src/components/resizable/resizable.md)）。

### 表格 {#tables}

优先用 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) 或 [ListRow](../../packages/ui/src/components/list-row/list-row.md) 的行。必须用表格时，比如用量或账单（[Table](../../packages/ui/src/components/table/table.md)）：

- 表头用 `text-footnote`、`foreground-hint`。
- 行之间用 `line-hairline` 分隔。
- 数字用 Space Mono，右对齐。

### 选择日期 {#picking-a-date}

[Select](../../packages/ui/src/components/select/select.md) 弹出层里的一列日期，日期用 Space Mono。

### 一排切换按钮 {#a-row-of-toggle-buttons}

一排筛选按钮（[ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md)），每个都可以单独选中。

```example
toggle-group/compositions/formatting
```

### 授权（OAuth） {#authorization-oauth}

[Dialog](../../packages/ui/src/components/dialog/dialog.md) 的结构，请求的权限列在 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) 里。

### 切换服务器 {#switching-servers}

- 在每个表面上，触发器都是 [WorkspaceButton](../../packages/ui/src/components/workspace-button/workspace-button.md)：服务器的头像、名称和一个 V 形箭头。
- 在桌面端，网页顶栏左侧的工作空间按钮在它下方以菜单形式打开列表，256px 宽（[Popover](../../packages/ui/src/components/popover/popover.md)）。按钮旁边的那排服务器头像点一下就能切换。
- 在手机上，主页上的工作空间按钮打开同一个列表，作为锚定在顶栏下方的弹出层，距两侧各 8px（[Popover](../../packages/ui/src/components/popover/popover.md)，[导航](../patterns/navigation.md#servers)）。
- 每一行是工作空间图块、它的名称，以及用 Space Mono 显示的地址（`/launch`）。当前服务器用勾号和粗体名称标出；其他服务器的未读数显示为粉色计数，服务器被静音时显示为灰色计数。
- 每一行都有拖动手柄，让人可以调整列表顺序。那排头像也按同样的顺序排列。
- 列表末尾，在分隔线之后，依次是 Join Community（直到这个人加入为止）、Switch or Create Server 和 Invite Human。

## 所有组件 {#every-component}

[组件索引](../../packages/ui/src/components/)列出 raft-ui 导出的每个组件，先按层、再按类别分组，附有摘要和状态。已弃用的组件保留文档，但不出现在导航中。同样的列表也以 `components.json` 和 `llms.txt` 的形式提供给 agent。

## 相关内容 {#related}

- [反馈](../patterns/feedback.md)：按作用范围处理错误。
- [表单](../patterns/forms.md)：哪些控件立即生效，哪些要保存。
- [对话](../patterns/conversation.md)：大部分由已有部件拼成的东西出现的地方。
- [编写指南](../authoring/README.md)：把组件归入它的层和类别的 front matter。
