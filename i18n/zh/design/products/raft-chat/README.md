---
title: Raft Chat
summary: Raft Chat 自己的结构：它的各个目的地、提醒圆点、铃铛和动态、动态的滑动操作、服务器标签、桌面端布局和侧栏、桌面应用、正在工作的 Agent 显示在哪里、它的浮层、下拉刷新、地点列表，以及它和通用模式不一致的地方。
sourceHash: b49163e2
---

# Raft Chat

Raft Chat 是 Raft 的第一个产品：频道、私信、Agent 和任务都在同一个对话里。这几页只描述它自己的结构：有哪些目的地，每个屏幕显示什么，东西放在哪里。可复用的规则及其理由在[模式](../../patterns/)里；颜色、字体和间距在[基础](../../foundations/)里；每个部件在各自的组件文档里。这里的页面需要用到其中某条规则时，链接过去，不再重复。这些页面描述的是 Raft Chat 网页应用实际上线的样子。

| 页面 | 内容 |
| --- | --- |
| [主页](./home.md) | 手机上的主页 |
| [频道](./channel.md) | 一个频道：它的标题栏和详情，它的 Tasks 和 Files 分区，它的消息输入框，在频道里建任务，消息列 |
| [任务](./tasks.md) | 任务这个目的地，以及频道的 Tasks 分区 |
| [Agent 资料](./agent-profile.md) | 一个 Agent 的个人资料和它的页面 |
| [设置](./settings.md) | 设置这个目的地和它的各个页面 |
| [新手引导](./onboarding.md) | 服务器第一次运行时的设置 |

## 结构 {#structure}

### 目的地 {#destinations}

| 位置 | 目的地 |
| --- | --- |
| 手机标签栏 | 主页（`house`）、动态（`activity`，和桌面端导航条一样）、任务（`square-check-big`）、搜索（`search`），以及当前服务器（它的头像和名称），在贴边的标签栏上（[MobileNav](../../../packages/ui/src/components/mobile-nav/mobile-nav.md#search-and-the-server-tab)）。顺序固定。搜索是一个标签，也是搜索全部内容的唯一入口：它的页面没有返回，标签栏保持搜索选中，切换标签后它的查询、筛选、结果和滚动位置都保留（[导航](../../patterns/navigation.md#search-on-a-phone)）。移动应用和手机网页上都一样 |
| 手机上的服务器标签 | 打开一个弹出层而不是页面：先是服务器列表和它底部的操作，最底部是服务器自己的页面（[服务器标签](#the-server-tab)）。服务器自己的每个页面打开一个推入页面，带返回。切换服务器时停在当前标签（[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)） |
| 手机主页的前几行 | 收藏，然后是草稿，各带一个灰色计数，在手机上都是各自唯一的入口；见[主页](./home.md) |
| 网页顶栏（768px 起，以及桌面应用的标题栏） | 同[页面结构](../../patterns/page-structure.md#the-web-top-bar)；搜索框打开搜索 |
| 桌面端导航条（网页和桌面应用） | 聊天、动态、任务、Artifacts（服务器开启了 Artifacts 时）、成员、计算机、应用（`blocks`）；底部是帮助（`circle-help`）和设置。访客没有成员、计算机和应用；他们保留 Artifacts |
| 应用桌面模式下的导航条（840dp 起） | 上面没有计算机：它在设置里（[服务器标签](#the-server-tab)） |
| 只在[设置](./settings.md)里 | Account 末尾的 Sign out |

没有网页顶栏时（较旧的桌面版本、服务器的公开页面），导航条顶部显示工作空间图块，搜索在聊天之前，铃铛在帮助上方。

### 提醒圆点 {#attention-dots}

提醒圆点遵循[导航](../../patterns/navigation.md#where-you-are)。在 Raft Chat 里，它们标在：

- 网页和桌面应用的导航条上：有未读消息时标在聊天上，有未读动态时标在动态上，有计算机需要处理时标在计算机上，反馈有新回复时标在设置上；帮助上标一次，用来宣布移动应用，直到其中的移动应用一项被打开；
- 应用桌面模式下（840dp 起）的导航条上，它没有计算机按钮：有计算机需要处理时改为标在设置上，因为这时计算机在设置里（[服务器标签](#the-server-tab)）；
- 手机标签栏上：有未读动态时标在动态上；其他服务器有未读内容时标在服务器标签的头像上，和主页的工作空间按钮一样。搜索上从不出现圆点。

目的地被选中时，它的圆点都不显示，设置和帮助也一样；圆点永远只是一个点，从不是计数（[导航](../../patterns/navigation.md#where-you-are)）。其他服务器的未读显示为服务器标签弹出层里它那一行的计数。反馈回复和需要处理的计算机不标在服务器标签上：它们各自在弹出层里自己的按钮上显示圆点，即 Settings（以及里面的 Feedback）和 Computers（在手机上，只在这里显示）。其他新内容都显示在页面里面；未读计数在动态里。

计算机的圆点表示一次你还没看到的变化，而不是一个持续的状态。在导航条和手机上都一样：

- 一台计算机进入需要处理的状态（离线、需要更新）时点亮圆点；打开计算机就算看过了。
- 看过之后，同一台计算机处于同一状态时不会再点亮。有变化才会再次点亮：计算机恢复在线后又离线，进入新的状态，或另一台计算机需要处理。
- 看过只隐藏圆点。计算机页面上那台计算机的行仍然显示它的状态，页面上离线计算机的数量也不变。

### 铃铛和动态 {#the-bell-and-activity}

- 铃铛打开通知中心：整个服务器的状态。它列出联合频道的邀请、服务商的用量上限、套餐变更、需要处理、离线或磁盘空间不足的计算机、在这台设备上安装 Raft，以及反馈的新回复。每一条都有自己的操作和 Dismiss。
- 动态列出等这个人处理的对话：有未读消息或提及的频道、私信和关注的消息列。它按 All、Unread 和 Mentions 筛选，有 Mark all read，没有搜索框，每一行有一个 Mark as Done 勾选，在手机上则改为左滑和这一行长按菜单里的一项（[手机上的动态](#activity-on-a-phone)）。审批和任务不会作为单独的行出现在里面。
- 动态按天给行分组，最新的在前，每天的标题在它的行滚动时停在顶部：Today、Yesterday，然后是星期和日期（[按天分组的行](../../patterns/lists.md#rows-grouped-by-day)）。只有今天的行，以及不到 1 小时的行（即使在 Yesterday 下面），静止时显示时间，用简短的相对时间（刚刚、3 分钟、2 小时；英文为 now、3m、2h），放在标题那一行；更早的行只在悬停或键盘聚焦时显示钟点时间，而在手机上没有悬停，它的日期标题就是它的日期（[列表行里的时间](../../patterns/lists.md#times-in-list-rows)）。一行的标记，包括任务的状态，放在第二行的末尾。使用鼠标时，Mark as Done 是在行里垂直居中的幽灵按钮，时间和标记向左给它让位（stdrc，2026-11-05，#proj-raft-ui:e09717fb，方案 C1）。
- 在开启了 task v2 对话的服务器上，动态不显示任务编号：任务的行显示任务的标题，状态放在第二行的末尾，消息前面只写频道（"#launch-week · Martin: …"，而不是 "#launch-week:#46 · Martin: …"）。在那里任务就是这个对话，用它的标题来称呼，而编号占掉了本来就不宽的行（stdrc，2026-11-05：「activity 里不应该再显示 task 编号了」）。在没有开启的服务器上，任务的行在标题后面保留编号徽标，用任务状态的颜色，因为在那里这个徽标也是这一行唯一表示状态的东西。
- 点按已选中的标签会做什么，动态是唯一的例外（[导航](../../patterns/navigation.md#going-back)；artin，2026-10-21）：它是人要逐条处理的列表，所以再点一次动态，或点它的标题栏，会跳到当前位置下方的下一个未读项，把它滚动到列表顶部，并把它标为被定位（[被定位](../../foundations/states.md#located)）。过了最后一个未读项，再点一次就回到顶部，循环重新开始；没有未读项时，回到顶部。它只在当前筛选里移动，不会把任何东西标为已读。

### 手机上的动态 {#activity-on-a-phone}

滑动本身、它的距离、它的按钮和带 Undo 的轻提示遵循[触屏](../../patterns/responsive.md#touch-screens)。在动态里：

- 用鼠标时，Mark as Done 和每个行操作一样，只在悬停时出现。在手机上它是例外：要左滑这一行或通过它的长按菜单才能用到，静止时没有按钮（stdrc，2026-10-23）。一个大多是待清理的行的列表，每行一个按钮，读起来就是一列按钮；而在手机上，人本来就是把一行滑走来清理列表的（Mail、Messages）。平板和桌面端保留这个按钮：那里的行更宽，滑动也不是习惯。
- 左滑露出这一行的按钮：先是 Done，然后关注的消息列上是 Unfollow，已加入、动态没有静音的频道上是 Mute，各自只在适用时出现；拉过 60% 就执行 Done。轻提示说明发生了什么（"Unfollowed …"、"Muted activity in #…"），带 Undo，同样的操作也在长按菜单里。
- Done 没有确切的反操作，Unfollow 也没有：取消关注一个消息列的同时会把它标为已读，重新关注也没法让它变回未读（Jasper 和 Tenny，2026-10-27）。所以两者都等着轻提示，之后才执行。如果这期间这一行有了新动态，Done 就放弃执行；Unfollow 照样执行，因为不管这个消息列接下来说什么，这个人都不再关注它了。Mute 把这一行留在列表里，标为已静音，轻提示和 Undo 都一样；已静音的行的按钮里没有 Mute。
- 右滑把这一行标为已读，已经是已读时标为未读，这一行留在原处，没有轻提示。在 Unread 或 Mentions 筛选下，刚标为已读的行仍然留着，直到人离开列表或换了筛选，和邮件客户端一样，这样往回滑时总有一行可滑。
- 下面这些行没有右滑，因为滑动没法在屏幕上改变它们的已读状态：已静音会话的行（不管里面有什么都画成已读）、直接提及的行（标为已读什么也不改变）和 Artifact 的行（可以被读，但不能再标回未读）。

### 服务器标签 {#the-server-tab}

服务器标签和工作空间图块遵循[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)。在 Raft Chat 里（手机上的做法由 stdrc 于 2026-10-22 决定，D1a，任务 #152）：

- 服务器标签占了原来「更多」的位置，所以标签栏仍是 5 个标签。
- 弹出层底部的操作是 Join community（直到这个人加入了它）、Switch or create server 和 Invite human。Invite human 留在这里，不放进页面那一行：它打开的是一个对话框，而不是一个地方。
- 最底部的按钮放服务器自己的页面：服务器开启了 Artifacts 时，Artifacts 排第一，然后是成员、计算机、应用和[设置](./settings.md)。成员、计算机和设置原来在「更多」里。它们是同一个服务器里的几个地方，所以放在一起，只占一两行，不用每个占一行；放在最底部，它们离拇指和标签栏最近，也就是原来「更多」所在的地方。五个页面排成 3 列，Artifacts、成员和计算机在上，应用和设置在下：多于 4 个时总是排成 3 列，这样每个标签在每种语言里都完整显示（Remy 和 Kirby，2026-11-06，#proj-workspace:#203；[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)）。没有 Artifacts 时，4 个页面保持一行。
- 访客没有成员、计算机和应用，他们在一行里得到 Artifacts（导航条上也给他们显示它）和设置；没有 Artifacts 时只有设置。设置里有他们的账户和 Sign out，而在手机上，弹出层是进入设置的唯一入口。
- 在应用的桌面模式下（840dp 起；Jasper，2026-10-23，任务 #8；页面那一行由 artin 于 2026-10-29 去掉）没有服务器标签：导航条头部的工作空间图块打开这个弹出层，里面没有那一行页面（[导航](../../patterns/navigation.md#the-server-in-the-apps-desktop-mode)）。这些页面每一个都已经有一个始终留在屏幕上的入口：Artifacts（服务器开启了它时）、成员和应用在导航条上，设置在导航条底部，计算机在设置里。和网页的导航条不同，这条导航条没有计算机按钮，所以两个圆点都在导航条的设置上：反馈回复的圆点，以及需要处理的计算机的圆点，因为计算机是从那里进入的。

### 手机一级页面的顶部 {#the-tops-of-the-phones-top-level-pages}

每个都遵循[页面结构](../../patterns/page-structure.md#phone)。它们的导航行里放的是：

| 页面 | 行里 | 副标题 |
| --- | --- | --- |
| 主页 | 服务器切换器，然后末尾是工作摘要和铃铛（[主页](./home.md)） | 无 |
| 动态 | Activity；筛选在下面的筛选行里 | "3 in progress · 5 unread"，用 Space Mono |
| 任务 | Tasks；下面是筛选栏（[任务](./tasks.md)） | "12 channel tasks"，用 Space Mono |
| 搜索 | 搜索框；筛选在下面的筛选行里 | 无 |

### 桌面端布局 {#the-desktop-layout}

桌面端的一个频道，在网页顶栏下面，从左到右依次是：导航条；聊天侧栏；放频道的主区域（[频道](./channel.md)），打开时还有它的 Tasks 和 Files 分区；打开消息列或个人资料时还有一个侧边面板。各区域和它们之间的线遵循[页面结构](../../patterns/page-structure.md#desktop)。

```example
sidebar/sidebar
```

### 桌面端侧栏 {#the-desktop-sidebar}

| 目的地 | 侧栏列出 |
| --- | --- |
| 聊天 | 收藏和草稿，然后是 Pinned、这个人自己的分组、Joint channels、Channels 和 Direct messages 这几个分组。分组可以拖动排序。Agent 列在私信中间 |
| 成员 | 没有侧栏：成员目录铺满 rail 旁边的整页，页头是两个添加按钮，下面是各个 tab；点开一个成员，在旁边的侧边面板里打开 |
| 计算机 | 没有侧栏：各台计算机以卡片墙或列表的形式占满导航条旁边的页面，页面头部有一个添加按钮。一台计算机在它们旁边的侧面板里打开，在卡片墙上显示为选中（[导航](../../patterns/navigation.md#opening-an-item)） |
| 设置 | 设置的各组（[设置](./settings.md)） |
| 任务 | 没有侧栏：看板紧接在导航条后面 |
| 搜索、动态 | 一开始没有侧栏：页面占满宽度。选中一个结果后，结果列表占据侧栏的位置，结果在它旁边打开 |

- 访客没有聊天侧栏。访客只属于一个频道，地点列表里只会有一行、没有可选的：聊天直接在导航条旁打开这个频道；在手机上它就是访客主页标签的页面，显示标签栏、没有返回，所以设置和退出登录始终一步可达。它的页头和顶层页一样：频道名是第一行页头，在 paper 上，下面一条 seam（[页面结构](../../patterns/page-structure.md#phone)）。访客读不了的频道或私信回到服务器根，而不是一个空的「选择频道」；一个能读的频道都没有的访客看到一个说明这一点的空状态。

- 每个分组标题都有展开收起按钮、计数和排序菜单（Manual、Recent、A–Z），始终可见，桌面端和主页上都一样。收起的分组里有未读内容时，显示一个粉色像素点。在 Channels 的标题里放一个用于 Create channel 的 + 按钮，在 Joint channels 的标题里放一个用于 Create joint channel 的 + 按钮。
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
| 确认（[浮层](../../components/overview.md#overlays)） | Dialog，只有两处用 [AlertDialog](../../../packages/ui/src/components/alert-dialog/alert-dialog.md)：放弃对 Agent 个人资料未保存的修改，以及打开一个会跳转到其他应用的链接 |
| 小型表单对话框（[表单](../../patterns/forms.md#forms-in-a-dialog)） | Create channel、Create task、Create agent |
| 宽表单对话框（[表单](../../patterns/forms.md#the-large-form-dialog)） | Register app、编辑一个应用（Edit Release Bot） |
| 悬停在人或 Agent 上时的个人资料卡 | 51px 的头像；名字，带状态灯和它正在做什么；handle；Computer、Runtime、Model 和 Reasoning；一行描述；对于管理这个 Agent 的人，还有它最近的动态。没有按钮 |

留在对话旁边一直打开的面板（消息列、个人资料）是侧边面板，不是抽屉，没有遮罩。

## 规则 {#rules}

### 宽屏和窄屏 {#wide-and-narrow}

这些是对[响应式布局](../../patterns/responsive.md)里通用断点的补充。

| 情况 | 布局 |
| --- | --- |
| 768px 以下 | 不要自动打开第一个频道：先显示主页。768px 起，打开服务器的根页面就打开它的第一个频道 |
| 搜索和动态的结果列表 | 380px，可在 320px 到 640px 之间调整，所有桌面宽度下都用同一个宽度（[间距](../../foundations/spacing.md#resizing-columns)） |

### 下拉刷新 {#pull-to-refresh}

下拉刷新遵循[导航](../../patterns/navigation.md#refreshing)：只用在加载快照的页面上。

- 加载快照、因而在手机上有下拉刷新的页面是：收藏、搜索结果（显示出搜索结果之后）、频道或消息列的文件，以及设置里的各个列表：邀请、加入链接、应用和账单。
- 由实时更新驱动、从不提供下拉刷新的页面是：消息、消息列、私信、主页的对话列表、动态、任务、成员、计算机和单台计算机的页面，以及频道的成员。

### 地点列表 {#lists-of-places}

尺寸遵循[同一类，同样大小](../../foundations/spacing.md#the-same-kind-the-same-size)。在手机上，主页的频道和私信、成员以及设置列表都是「地点列表」，都用同一种侧栏行绘制：44px，16px、字重 600 的名称和 16px 的图标。改一个就要全部一起改。固定这个尺寸的测试会在主页的行和设置列表出现偏差时失败。

## 与通用模式的差异 {#differences-from-the-shared-patterns}

Raft Chat 目前在以下几处偏离了这些模式。每一行写的是产品这一边的做法；规则在链接的页面上。

| 模式 | Raft Chat 实际的做法 |
| --- | --- |
| 提及标记取代未读计数（[状态](../../foundations/states.md)） | 频道行在粉色计数前显示 @ 标记 |
| 每个推入页面都有返回（[导航](../../patterns/navigation.md#going-back)） | 在手机网页上，RaftBench 的入口页面，以及加载中的 Assistant 页面，既没有返回也没有标签栏 |
| 已知的布局在骨架屏里等待（[等待](../../components/overview.md#waiting)） | 会话时间线和个人资料面板在等待时显示文字 "Loading…" |
| 加载失败时不显示空状态（[反馈](../../patterns/feedback.md#empty-loading-and-failed)） | 动态或收藏的列表加载失败时，显示它的空状态 |
| 独立的设置立即生效（[表单](../../patterns/forms.md#settings-that-apply-at-once)） | Language & region、Mute this server、新手引导、Hide #all、对成员隐藏人类名录和数量、为服务器开启翻译，以及成员的服务器角色，都要等 Save |
| 需要先配置的功能用一个复选框加一个 Save（[表单](../../patterns/forms.md#settings-saved-together)） | App event notifications 是一个开关，只是把地址输入框显示出来 |
| 每种途径都能撤销，公开之前先确认（[反馈](../../patterns/feedback.md#confirming)） | 动态里的 Done 和 Unfollow 只有滑动时才提供 Undo；Artifact 公开，以及在它所在的对话之外取消发布，都不经过确认；重启或升级计算机、轮换 webhook 密钥、更新邀请链接都不经过确认 |
