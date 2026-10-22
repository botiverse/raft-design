---
title: InboxItem
summary: 在别处发生、需要这个人看到的事情所对应的一行（提及、审批、交接）；未读时带提醒圆点，所需的操作就在这一行里。
sourceHash: c78266a9
---

# InboxItem

InboxItem 是在别处发生、需要这个人看到的一件事：有人提及了他，有 agent 在等他审批，有工作交接给了他。未读的条目标题加粗，并带一个粉色提醒圆点；它需要的操作就放在这一行里。它是 [ActivityInbox](../activity-inbox/activity-inbox.md) 中的行。

```example
activity/compositions/activity-preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 别处发生了需要这个人看到的事情 | InboxItem，放在动态里（[ActivityInbox](../activity-inbox/activity-inbox.md)） |
| 整个服务器的状态：某台计算机离线、配额快满了 | 通知（[NotificationCenter](../notification-center/notification-center.md)） |
| 这个人所做操作的结果 | [Toast](../toast/toast.md) |
| 在对话框或表单中，操作前需要阅读的内容 | [Banner](../banner/banner.md) |
| 列表中的频道、私信或成员 | 侧边栏的行（[Sidebar](../sidebar/sidebar.md)） |

哪种消息放在哪里，见[选择组件](../../../../../design/components/overview.md#telling-people-something)。

## 结构 {#anatomy}

- `InboxItem`：这一行。必需。
- `InboxItemTrigger`：覆盖整行、用来打开条目的隐形按钮。必需。
- `InboxItemSelection`：用于多选条目的 [Checkbox](../checkbox/checkbox.md)。可选。
- `InboxItemLeading`：文字前面 36px 的前置视觉元素：人或 agent 的头像，或者频道的 [IconTile](../icon-tile/icon-tile.md)。分隔线从它后面开始。可选。
  - `InboxItemLeadingBadge`：消息列徽标，位于头像或图块的右下角，里面放一个图标 `ThreadIcon`（[Icons](../icons/icons.md)）。只用在消息列的行上（[前置图像](#the-leading-image)）。可选；实验性，来自 `@botiverse/raft-ui/wip`。
- `InboxItemContent`：文字列。必需。
  - `InboxItemContext`：事情发生在哪里：频道、任务、计算机。
  - `InboxItemHeading` 加 `InboxItemTitle`：发生了什么，前面可以带一个 14px 的图标。
  - `InboxItemSubtitle`：第二行上下文，比如 "Thread in #launch-week"。
  - `InboxItemBody` 或 `InboxItemMessage`：摘录，以 `InboxItemSender` 开头。
  - `InboxItemMetadata`：任务、回复和提及的标签片。
  - `InboxItemHoverTarget`：包住带工具提示的徽标，让鼠标指针能触到它（其余文字会让指针穿透到触发按钮上）。点击它仍然会打开条目。
- `InboxItemTrailing`：`InboxItemTimestamp`、`InboxItemActions`，以及未读时的提醒圆点。
  - `InboxItemMarks`：摘录那一行末尾的标记：提及、已静音、未读数。可选。
- `InboxItemSkeleton`，放在 `InboxItemSkeletonList` 里：列表加载时代替 `InboxItem` 的行（[加载中](#loading)）。可选；实验性，来自 `@botiverse/raft-ui/wip`。

### 前置图像 {#the-leading-image}

前置图像显示条目所在的对话。消息列不是一个独立的对话，所以它的行显示消息列所在的对话，并在角上加消息列徽标：

| 行 | 前置图像 | 第二行 |
| --- | --- | --- |
| 频道 | 频道的 IconTile，用这个频道自己的图标 | 最新消息："Avery: …" |
| 私信 | 对方（人或 agent）的头像；agent 的头像带在线状态灯 | 最新消息 |
| 频道里的消息列 | 频道的 IconTile，带消息列徽标 | "#launch-week · Mira: …" |
| 私信里的消息列 | 对方（人或 agent）的头像，带消息列徽标，没有在线状态灯 | "Lagoon: …"，不带 "@Lagoon ·" |

```example
inbox-item/compositions/thread-rows
```

- **频道的图块用这个频道自己的图标**，和侧栏、频道顶栏一致：普通频道用 `hash`，私有频道用 `lock`，joint channel 用 `git-branch`，公开页面可读的频道用带地球的 #（[Raft Chat 频道](../../../../../design/products/raft-chat/channel.md)）。在 joint channel 或私有频道上画一个普通的 `#`，等于说它是普通频道，频道本身那一行和它的消息列那一行都一样。
- **显示对话，而不是频道的形状。** 私信里的消息列用 `#` 图块，等于说这个消息列在某个频道里。头像说明对话是和谁进行的，而且正是这个人在那个私信里已经熟悉的面孔。
- **徽标在图块上和在头像上一样**：同样的尺寸，放在同一个角，所以「这是一个消息列」在列表的两种开头上读起来一样。
- **在头像上，徽标占用在线状态灯的那个角。** 一个角只放一个标记（[Avatar](../avatar/avatar.md#the-corner)）。这一行讲的是消息列，不是 agent 现在的状态，所以徽标优先，消息列的行不显示在线状态灯。在线状态灯留在私信自己的那一行上。
- **第二行不重复前置图像。** 在私信里，头像已经说明了对方是谁，"@Lagoon · Lagoon: …" 会把名字说两遍；这一行直接以最新消息开头。图块不会说出它是哪个频道，所以频道里的消息列在前面保留 "#channel ·"。
- **读屏软件仍然能听到消息列在哪里。** 这一行触发按钮的 `aria-label` 保留对话的名称（"Thread in a direct message with Lagoon: …"），即使屏幕上已经没有 "@Lagoon ·"，看不到头像的人也知道这个消息列属于哪个私信。
- **私信加载完成之前，用放着 `DirectMessageIcon` 的 `IconTile` 开头**，永远不用 `#` 图块：这一行不能声称自己在某个频道里，哪怕只有一瞬间。
- **消息列跟随它所在对话的设置。** 已静音私信里的消息列也是静音的，和已静音频道里的消息列一样。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 默认 | 需要阅读的条目：标题和摘录各最多 2 行，带元数据标签片 |
| `density="compact"` | 对话列表：标题和最新消息各一行，旁边是 `InboxItemLeading` |

在 `density="compact"` 中，时间和 `InboxItemMarks` 放在 `InboxItemTrailing` 里，各自位于一行旁边。那里的未读数已经说明这一行未读，所以 `data-unread` 只让标题加粗，没有提醒圆点。已静音的对话不加 `data-unread`，并用一个静音标记代替它的未读数。

```example
activity/compositions/activity-conversation-list
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 未读（`InboxItem` 上的 `data-unread`） | 标题用 `foreground`、字重 700，右侧一个粉色提醒圆点 |
| 已读 | 标题用 `foreground-muted`、字重 600；没有圆点 |
| `active` | 在列表旁边打开的条目：一层 `info-soft` 底色 |
| 菜单打开 | `InboxItem` 上有 `data-popup-open`，或者从其中某个按钮打开了菜单：`fill-subtle`，与悬停时同一个浅层级；`active` 的条目保持 `info-soft`（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)） |
| `disabled` | 没有悬停，没有按下；触发按钮不能按 |

### 加载中 {#loading}

列表加载时，在 `InboxItemSkeletonList` 里显示 `InboxItemSkeleton` 行。每一行都是用加载后那一行的部件搭成的 `InboxItem`，每一行文字的位置换成一根横条，所以它有加载后那一行的内边距、分隔线和行高，条目到达时什么都不会移动（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。让它和它代表的行形状一致：有上下文行就设 `context`，有头像或图块就设 `leading`，`density` 也一样。给列表设 `delay={1000}`，这样等待超过 1 秒后这些行才出现；在那之前，列表是空的，并带 `aria-busy`（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。

```example
activity/compositions/loading-activity
```

```example
activity/compositions/loading-conversation-list
```

## 行为 {#behavior}

- 触发按钮覆盖整行。行内的按钮位于它上方，每个都可以单独按下。
- 条目之间用 `line-hairline` 分隔，从文字处开始；有 `InboxItemLeading` 时，从它后面开始。
- 使用鼠标时，只在这一行被悬停、持有焦点、处于 `active` 或打开了菜单时才显示 Mark as Done：给 `InboxItemActions` 设 `reveal="hover"`。每一行都显示按钮的列表看起来像一堵按钮墙，而这一行本身才是主要目标。操作显示时，它们占据 `InboxItemTrailing` 其余内容的位置：时间、标记和提醒圆点让开。
- 在触屏上，Mark as Done 在静止时就显示，并且也放进长按菜单里；滑动手势可以作为额外的快捷方式，但永远不能取代它（[响应式布局](../../../../../design/patterns/responsive.md#touch-screens)）。`reveal="hover"` 会这样处理：`InboxItemTrailing` 的其余内容移开，给它腾出位置。

- 在默认密度下，`InboxItemTrailing` 只在 `InboxItemContent` 的前两行旁边占位（上下文行和标题，或者标题和摘录）；之后的行占满整个宽度，排在它下方。这一列大约两行高（时间和圆点，或 32px 的 Mark as Done），如果在每一行旁边都占位，只会让手机上本来就窄的行更容易换行、变得更高。在 `density="compact"` 中，它在两行旁边都保留。

- `data-unread` 同时打开加粗标题和提醒圆点。在默认密度下，圆点是辨认未读条目的方式；保留它。在 `density="compact"` 中，`InboxItemMarks` 里的未读数代替了它，所以不显示圆点。
- 文字会让鼠标指针穿透到触发按钮上，所以文字里的徽标得不到悬停。把带工具提示的徽标包在 `InboxItemHoverTarget` 里。
- 在触屏上（`pointer: coarse`，任何宽度），`InboxItemActions` 里的每个操作保持 44px 的点击区域，操作之间相隔 12px，让点击区域不重叠；使用鼠标时，它们保持 32px，相隔 2px。

```example
activity/compositions/activity-hover-actions
```

## 内容 {#content}

- 上下文行写事情发生的地方：#launch-week · task #25。
- 标题写谁做了什么，用队友口吻的动词："Martin needs your OK"、"Bugen handed off #25"（[写作](../../../../../design/content/writing.md#voice)）。
- 摘录最多 2 行。
- 在消息列的行上，只有当前置图像是频道的图块时，第二行才以频道开头："#launch-week · Mira: …"。在私信里，以最新消息开头："Lagoon: …"（[前置图像](#the-leading-image)）。

## 无障碍 {#accessibility}

- 各部分通过 Base UI 的 `useRender` 渲染原生元素。`InboxItemTrigger` 是原生的 `button`；设了 `disabled` 时，它会带上 `aria-disabled` 并忽略点击。
- 给触发按钮一个说明条目的无障碍名称：`aria-label="Open Martin needs your OK"`。在打开的那个条目的触发按钮上设 `aria-current`。
- 给选择复选框和每个只有图标的操作命名：`aria-label="Select activity item"`、`aria-label="Mark as done"`。
- 设了 `reveal="hover"` 的操作在隐藏时仍留在 Tab 键顺序中，焦点一到达这一行或它们本身就会显示。
- 提醒圆点用 CSS 绘制，不会被朗读。在触发按钮的名称里写上 "unread"，或者加一个视觉上隐藏的词。
- `InboxItemLeadingBadge` 对辅助技术隐藏。在触发按钮的名称里写上 "thread"：`aria-label="Open thread with Lagoon"`。
- `InboxItemSkeleton` 对辅助技术隐藏；`InboxItemSkeletonList` 带 `aria-busy`，直到被加载后的列表替换。

## 规则 {#rules}

- 行内的操作用墨色描边的小按钮，永远不用粉色：一个列表里可能同时有好几个等着这个人处理的条目（[Button](../button/button.md)）。
- 有「谁」的时候，以「谁」开头：人或 agent 的头像。系统发出的提示没有「谁」；见 [NotificationCenter](../notification-center/notification-center.md#anatomy)。
- 消息列的行以它所在的对话开头：频道的图块，或者在私信里用对方的头像，各自在角上带消息列徽标。永远不要给私信里的消息列用 `#` 图块，也永远不要在消息列的行上显示在线状态灯（[前置图像](#the-leading-image)）。
- 条目列表加载时显示平铺的 `InboxItemSkeleton` 行，永远不要显示成卡片：不要有加载后的列表没有的边框、卡片或间距（[加载中](#loading)）。
