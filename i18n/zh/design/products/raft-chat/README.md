---
title: Raft Chat
summary: Raft Chat 自己的结构：它的各个目的地、提醒圆点、铃铛和动态、桌面端布局和侧栏、桌面应用、正在工作的 Agent 显示在哪里、它的浮层，以及它和通用模式不一致的地方。
sourceHash: 1befb300
---

# Raft Chat

Raft Chat 是 Raft 的第一个产品：频道、私信、Agent 和任务都在同一个对话里。这几页只描述它自己的结构：有哪些目的地，每个屏幕显示什么，东西放在哪里。可复用的规则及其理由在[模式](../../patterns/)里；颜色、字体和间距在[基础](../../foundations/)里；每个部件在各自的组件文档里。这里的页面需要用到其中某条规则时，链接过去，不再重复。这些页面描述的是 Raft Chat 网页应用实际上线的样子。

| 页面 | 内容 |
| --- | --- |
| [主页](./home.md) | 手机上的主页 |
| [频道](./channel.md) | 一个频道：它的标题栏和详情，它的 Tasks 和 Files 卡片，它的消息输入框，在频道里建任务，消息列 |
| [任务](./tasks.md) | 任务这个目的地，以及频道的 Tasks 卡片 |
| [Agent 资料](./agent-profile.md) | 一个 Agent 的个人资料和它的页面 |
| [设置](./settings.md) | 设置这个目的地和它的各个页面 |
| [新手引导](./onboarding.md) | 服务器第一次运行时的设置 |

## 结构 {#structure}

### 目的地 {#destinations}

| 位置 | 目的地 |
| --- | --- |
| 手机标签栏 | 主页（`house`）、动态（`activity`，和桌面端导航条一样）、任务（`square-check-big`）、搜索（`search`），以及当前服务器（它的头像和名称），在贴边的标签栏上（[MobileNav](../../../packages/ui/src/components/mobile-nav/mobile-nav.md#search-and-the-server-tab)）。顺序固定。搜索是一个标签，也是搜索全部内容的唯一入口：它的页面没有返回，标签栏保持搜索选中，切换标签后它的查询、筛选、结果和滚动位置都保留（[导航](../../patterns/navigation.md#search-on-a-phone)）。移动应用和手机网页上都一样 |
| 手机上的服务器标签 | 打开一个弹出层而不是页面：先是服务器列表，然后是 Join Community、Switch or Create Server 和 Invite Human，最底部是并排一行的成员、计算机和[设置](./settings.md)。服务器自己的每个页面打开一个推入页面，带返回。切换服务器时停在当前标签（[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)）。访客没有成员和计算机 |
| 手机主页的第一行 | 收藏（带灰色计数），这是它唯一的入口；见[主页](./home.md) |
| 网页顶栏（768px 起，以及桌面应用的标题栏） | 同[页面结构](../../patterns/page-structure.md#the-web-top-bar)；搜索框打开搜索 |
| 桌面端导航条 | 聊天、动态、任务、成员、计算机；底部是帮助（`circle-help`）和设置。访客没有成员和计算机 |
| 只在[设置](./settings.md)里 | 成员和计算机（手机上），以及 Account 末尾的 Sign Out |

没有网页顶栏时（较旧的桌面版本、服务器的公开页面），导航条顶部显示工作空间图块，搜索在聊天之前，铃铛在帮助上方。

### 提醒圆点 {#attention-dots}

提醒圆点遵循[导航](../../patterns/navigation.md#where-you-are)。在 Raft Chat 里，它们标在：

- 导航条上：有未读消息时标在聊天上，有未读动态时标在动态上，有计算机需要处理时标在计算机上，反馈有新回复时标在设置上；帮助上标一次，用来宣布移动应用，直到其中的移动应用一项被打开；
- 手机标签栏上：有未读动态时标在动态上；其他服务器有未读内容时标在服务器标签的头像上，和主页的工作空间按钮一样。搜索上从不出现圆点。

目的地被选中时，它的圆点都不显示，设置和帮助也一样；圆点永远只是一个点，从不是计数（[导航](../../patterns/navigation.md#where-you-are)）。其他服务器的未读显示为服务器标签弹出层里它那一行的计数。反馈回复和需要处理的计算机不标在服务器标签上：它们各自在弹出层里自己的按钮上显示圆点，即 Settings（以及里面的 Feedback）和 Computers（在手机上，只在这里显示）。其他新内容都显示在页面里面；未读计数在动态里。

计算机的圆点表示一次你还没看到的变化，而不是一个持续的状态。在导航条和手机上都一样：

- 一台计算机进入需要处理的状态（离线、需要更新）时点亮圆点；打开计算机就算看过了。
- 看过之后，同一台计算机处于同一状态时不会再点亮。有变化才会再次点亮：计算机恢复在线后又离线，进入新的状态，或另一台计算机需要处理。
- 看过只隐藏圆点。计算机页面上那台计算机的行仍然显示它的状态，页面上离线计算机的数量也不变。

### 铃铛和动态 {#the-bell-and-activity}

- 铃铛打开通知中心：整个服务器的状态。它列出联合频道的邀请、服务商的用量上限、套餐变更、需要处理、离线或磁盘空间不足的计算机、在这台设备上安装 Raft，以及反馈的新回复。每一条都有自己的操作和 Dismiss。
- 动态列出等这个人处理的对话：有未读消息或提及的频道、私信和关注的消息列。它按 All、Unread 和 Mentions 筛选，有 Mark all read，没有搜索框，每一行有一个 Mark as Done 勾选（[InboxItem](../../../packages/ui/src/components/inbox-item/inbox-item.md)）。审批和任务不会作为单独的行出现在里面。在标签栏上再点一次动态，或点它的标题栏，会跳到下方下一个未读对话，到底后回到顶部，循环往复（[导航](../../patterns/navigation.md#going-back)）。

### 手机一级页面的顶部 {#the-tops-of-the-phones-top-level-pages}

每个都遵循[页面结构](../../patterns/page-structure.md#phone)。它们的导航行里放的是：

| 页面 | 行里 | 副标题 |
| --- | --- | --- |
| 主页 | 服务器切换器，然后末尾是工作摘要和铃铛（[主页](./home.md)） | 无 |
| 动态 | Activity；筛选在下面的筛选行里 | "3 in progress · 5 unread"，用 Space Mono |
| 任务 | Tasks；下面是筛选栏（[任务](./tasks.md)） | "12 channel tasks"，用 Space Mono |
| 搜索 | 搜索框；筛选在下面的筛选行里 | 无 |

### 桌面端布局 {#the-desktop-layout}

桌面端的一个频道，在网页顶栏下面，从左到右依次是：导航条；聊天侧栏；放频道的主区域（[频道](./channel.md)），打开时还有它的 Tasks 和 Files 卡片；打开消息列或个人资料时还有一个侧边面板。各区域和它们之间的线遵循[页面结构](../../patterns/page-structure.md#desktop)。

```example
sidebar/sidebar
```

### 桌面端侧栏 {#the-desktop-sidebar}

| 目的地 | 侧栏列出 |
| --- | --- |
| 聊天 | 收藏，然后是 Pinned、这个人自己的分组、Joint Channels、Channels 和 Direct Messages 这几个分组。分组可以拖动排序。Agent 列在私信中间 |
| 成员 | Graph，然后是 Agents（按计算机分组）和 Humans，各带一个计数和一个添加按钮 |
| 计算机 | 各台计算机，带一个添加按钮 |
| 设置 | 设置的各组（[设置](./settings.md)） |
| 任务 | 没有侧栏：看板紧接在导航条后面 |
| 搜索、动态 | 一开始没有侧栏：页面占满宽度。选中一个结果后，结果列表占据侧栏的位置，结果在它旁边打开 |

- 每个分组标题都有展开收起按钮、计数和排序菜单（Manual、Recent、A–Z），始终可见，桌面端和主页上都一样。收起的分组里有未读内容时，显示一个粉色像素点。在 Channels 的标题里放一个用于 Create Channel 的 + 按钮，在 Joint Channels 的标题里放一个用于 Create Joint Channel 的 + 按钮。
- 未读按[状态](../../foundations/states.md)显示，只有一个例外：频道行里如果有提及这个人，在粉色计数前显示黄色的 @ 标记。静音或未加入频道里的未读是灰色计数，铅笔表示草稿。
- 在网页顶栏下面，侧栏没有标题栏。没有顶栏时，标题栏写出目的地的名字，在聊天里，工作摘要放在它的右侧。

### 桌面应用 {#the-desktop-app}

桌面应用的标题栏就是网页顶栏，任何宽度下都是，再加上[页面结构](../../patterns/page-structure.md#the-web-top-bar)为桌面应用补充的内容。在 Raft Chat 里：

- 后退和前进的工具提示里写着 ⌘[ 和 ⌘]（Windows 上是 Alt+← 和 Alt+→）。
- 下载更新时显示更新标签片，下载好后变成一个带粉色像素点的 Update 按钮。
- 窗口按钮在左侧为 macOS 的红绿灯留出 82px，在 Windows 上右侧留出标题按钮的宽度。
- ⌘1 到 ⌘9（Windows 上是 Ctrl+1 到 Ctrl+9）切换到服务器条里的各个服务器。
- 聊天侧栏的列表上方有一个 "Find a conversation…" 输入框。

### 正在工作的 Agent 显示在哪里 {#where-working-agents-appear}

通用规则在[正在工作的 Agent](../../people-and-agents/working-agents.md#where-working-shows)。在 Raft Chat 里：

| 位置 | 在 Raft Chat 里 |
| --- | --- |
| 摘要 | 网页顶栏上铃铛之前；手机主页顶栏上铃铛之前；没有顶栏时在聊天侧栏的标题栏里 |
| Agent 的行 | 它在侧栏和主页上的行只有一行：带状态灯的头像、名字，右侧是它正在做什么，不工作时是用 Space Mono 写的运行时。有未读计数时，计数取代这两者 |
| 它工作的地方 | 频道标题栏的副标题 |
| 和这个 Agent 的私信 | 那个私信的标题栏 |
| 即将发言 | 浮在那个频道、私信或消息列的消息输入框正上方，下面垫一层渐隐 |

### 浮层 {#overlays}

| 浮层 | 用于 |
| --- | --- |
| 从右侧滑出的抽屉，最宽 420px（手机上全宽） | 频道详情和设置，成员列表是其中的一个页面（[频道](./channel.md#the-channel-details)） |
| 弹出层 | Working now、通知、服务器列表、Help & resources（在导航条上悬停时打开） |
| 带简短说明的底部面板（手机） | Add Raft to your Home Screen，从通知中心的 Install Raft 或 Settings › Notifications 里的 Add 按钮打开（按钮：Got it） |
| 小型表单对话框（[表单](../../patterns/forms.md#forms-in-a-dialog)） | Create Channel、Create Task、Create Agent |
| 宽表单对话框（[表单](../../patterns/forms.md#the-large-form-dialog)） | Register App、编辑一个应用（Edit Release Bot） |
| 悬停在人或 Agent 上时的个人资料卡 | 51px 的头像；名字，带状态灯和它正在做什么；handle；Computer、Runtime、Model 和 Reasoning；一行描述；对于管理这个 Agent 的人，还有它最近的动态。没有按钮 |

留在对话旁边一直打开的面板（消息列、个人资料）是侧边面板，不是抽屉，没有遮罩。

## 规则 {#rules}

### 宽屏和窄屏 {#wide-and-narrow}

这些是对[响应式布局](../../patterns/responsive.md)里通用断点的补充。

| 情况 | 布局 |
| --- | --- |
| 768px 以下 | 不要自动打开第一个频道：先显示主页。768px 起，打开服务器的根页面就打开它的第一个频道 |
| 搜索和动态的结果列表 | 380px，可在 320px 到 640px 之间调整，所有桌面宽度下都用同一个宽度（[间距](../../foundations/spacing.md#resizing-columns)） |

## 与通用模式的差异 {#differences-from-the-shared-patterns}

Raft Chat 目前在以下几处偏离了这些模式。每一行写的是产品这一边的做法；规则在链接的页面上。

| 模式 | Raft Chat 实际的做法 |
| --- | --- |
| 提及标记取代未读计数（[状态](../../foundations/states.md)） | 频道行在粉色计数前显示 @ 标记 |
| 每个推入页面都有返回（[导航](../../patterns/navigation.md#going-back)） | 在手机网页上，RaftBench 的入口页面，以及加载中的 Assistant 页面，既没有返回也没有标签栏 |
| 加载失败时不显示空状态（[反馈](../../patterns/feedback.md#empty-loading-and-failed)） | 动态或收藏的列表加载失败时，显示它的空状态 |
