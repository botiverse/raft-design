---
title: 图标
summary: 图标集、描边和颜色、卡片、菜单和设置共用的那一张含义表、各场景的图标尺寸，以及哪些东西不是图标。
sourceHash: e83eb154
---

# 图标

Raft 的图标是 Lucide 图标，来自 `lucide-react`，描边宽度为 2。图标从周围的文字继承颜色（`currentColor`）。

## 原则 {#principles}

- **只用 Lucide。** 需要新图标时，取 Lucide 里对应名字的图标。Raft 自己画了几个 Lucide 没有的图标，用于几种对话，以及关注、加入、添加、重新打开和在新窗口中打开；它们遵循 Lucide 的网格和线条粗细。我们自己的图标放在 `@botiverse/ricons` 里，这是本仓库里一个单独的包，只从它导入：raft-ui 不导出它们。它的 `ArtifactIcon` 是 Lucide 的 `file-code`，页面画得更宽一些，这样看起来和旁边的图标一样大（[Icons](../../packages/icons/src/icons.md)）。
- **像素头像不是图标。** 它们只代表 Agent，见 [Avatar](../../packages/ui/src/components/avatar/avatar.md)。
- **Emoji 是内容，不是图标。** 不要把 emoji 当图标用。回应里的 emoji 是内容，见 [品牌](./brand.md#reactions)。
- **不用闪光图标。** 不要用闪光、星星或类似的图标来标记 Agent 或 AI，见 [身份与在线状态](../people-and-agents/identity-and-presence.md#rules)。

## 含义 {#meanings}

- **同一屏上，一个图标只有一个含义。** 一屏上两样不同的东西或两个不同的操作，从不共用一个图标。新加的东西要用的图标已经在这一屏上时，给其中一个换一个图标。
- **一个概念一个图标。** 一个概念取 Lucide 的一个图形，在所有地方都用它，不用它的变体：用 `clock`，不用 `clock-3`；用 `settings`，不用 `settings-2`；用 `lock`，不用 `lock-keyhole`。
- **More 在一排操作里是 `ellipsis`，作为一个对象的菜单是 `ellipsis-vertical`。** 横向的 ⋯ 放在横向工具栏或操作行的末尾，它的点接着旁边那排操作排下去：消息的悬停工具栏、选择工具栏。竖向的 ⋮ 打开一个对象的菜单，放在面板标题栏、卡片或列表行的尾端。
- **Back 是 `arrow-left`，不是 V 形箭头**，Forward 是 `arrow-right`（[对齐](./alignment.md#the-ends-of-a-header)）。V 形箭头用来在一组东西里翻页，比如上一张和下一张图片，或者展开和收起一个分区。
- **成功是 `circle-check`；错误或警告是 `triangle-alert`**，和 [Banner](../../packages/ui/src/components/banner/banner.md) 与 [Toast](../../packages/ui/src/components/toast/toast.md) 画的一样。不用 `circle-check-big` 或 `circle-alert`。
- **重新打开（Reopen）不是重新开始（restart）。** `rotate-ccw` 表示重新开始或重置，所以 Reopen task 有自己的图标 `ReopenTaskIcon`（[Icons](../../packages/icons/src/icons.md#action-icons)）。
- **不用方框箭头。** Lucide 的 `external-link` 和 `square-arrow-out-up-right` 会被看成离开 Raft，所以 Raft 不用它们：离开 Raft 的链接末尾用 `arrow-up-right`（[离开 Raft 的链接](../patterns/navigation.md#links-that-leave-raft)）；Open in new window 打开的是一个独立的 Raft 窗口，仍在 Raft 里，所以有自己的图标 `OpenInNewWindowIcon`（[Icons](../../packages/icons/src/icons.md#action-icons)）（Jasper、Kirby，2026-11-24，#proj-raft-ui:#302）。
- **只用描边图标。** 不要把图标填实来表示一种状态，比如已收藏：开关显示的是它提供的操作（从 Saved 里移除用 `bookmark-minus`）。媒体播放器的 Play 和 Pause 是例外。

## 一个含义，一个图标 {#one-meaning-one-icon}

卡片、菜单和设置页的图标都从这一张表里取：一个含义只有一个 Lucide 图标，同一个含义在卡片上、菜单里和设置页里画的都是同一个图标。这张表放在这里，放在设计系统里，而不是放在 App 里或某种卡片的代码里，这样新的卡片种类、新的菜单项和新的设置页都在同一个地方找图标（Kirby 和 Tenny，2026-11-23）。以前，四种操作卡片（Agent 的调用、准备好的请求、替所有者行事的助理、恢复应用的所有者）都画 `shield-alert`，图标没有告诉读的人请求的是哪一种；还有一个名为 `sparkles` 的卡片图标画的是灯泡，它的名字和它的图形说的是两回事。

| 含义 | 图标 | 用在哪里 |
| --- | --- | --- |
| 审批：Agent 请求做一件只有人才能允许的事（Agent 的调用、准备好的请求） | `hand` | 操作卡片；动态里的审批 |
| 权限或范围：应用或 Agent 能访问什么 | `shield-check` | 应用的权限范围卡片和它的权限范围列表；Agent 的应用访问权限 |
| 管理，对服务器或应用的一种角色（恢复应用的所有者） | `shield` | 那张卡片；Settings › Administration |
| 替人行事：助理以所有者的身份做一件事 | `user-round-check` | 助理的所有者卡片和它的回执 |
| 问一个人的问题 | `message-circle-question-mark` | 问题卡片 |
| 帮助 | `circle-question-mark`（`circle-help`） | 导航条上的帮助；从不用于问题卡片 |
| 添加一个人：邀请加入服务器、添加到频道 | `user-plus` | 邀请卡片和添加成员卡片；菜单里和 Members 上的 Invite 和 Add people |
| 成员，以及对话里成员的变动 | `users` | 卡片上的成员变动；频道的成员列表 |
| 凭据或机密：登录、密钥、已授权的账户 | `key-round` | Agent 的登录卡片、机密输入框；Settings › Authorized accounts |
| 付款：套餐、席位、账单 | `credit-card` | 升级卡片和席位卡片；Settings › Plan & Billing |
| 应用：注册、安装、更新应用 | `blocks` | 应用卡片（注册、更新、从应用市场安装）；导航条上的应用；Settings › Integrations |
| 与某个服务的连接（MCP 服务器） | `plug` | 连接卡片；Agent 的连接 |
| Agent：创建或移动 Agent | `bot` | Agent 卡片；Create agent |
| 频道 | `hash` | 创建频道卡片；频道行 |
| 离开一个地方：Leave channel（任何一种频道）、Leave server | `door-open` | 频道的菜单和详情；Settings › Danger zone（[Icons › Rules](../../packages/icons/src/icons.md#rules)） |
| 退出 Raft 登录 | `log-out` | 账户菜单；Settings › Account |
| 日程或提醒 | `alarm-clock` | 提醒卡片；Agent 的提醒 |
| 时间、历史记录 | `clock` | 最近的搜索、列表里的时间 |
| 文件 | `file` | 文件卡片和文件行 |
| Artifact | `ArtifactIcon`（`@botiverse/ricons`） | Artifact 卡片和行 |
| 想法或建议 | `lightbulb` | 提出建议的卡片或菜单项 |
| 完成、成功 | `circle-check` | 横幅、轻提示、已完成的行 |
| 失败、错误、警告 | `triangle-alert` | 横幅、轻提示、失败的行 |
| 在系统浏览器中打开页面：Open in browser | `compass`，`arrow-up-right` 放在快捷键的位置（[离开 Raft 的链接](../patterns/navigation.md#links-that-leave-raft)） | 桌面端浏览器标签的菜单（Jasper、Kirby，2026-11-24，#proj-raft-ui:#302） |
| 等待某人 | `hourglass` | 列出等待某人处理的事情的筛选或菜单项 |
| 这个客户端还不认识的卡片种类 | `square-dashed` | 后备的操作卡片；从不用作帮助的图标 |

- **从这张表里取含义，不要取一个看起来合适的图形。** 这里没有合适的含义时，先在这里加一行，放在同一个改动里，写明它的含义和用在哪里；这里已有的含义再配第二个图标，就说明其中一处错了。
- **按含义给卡片的图标命名。** Agent 或服务器为卡片图标发送的 key 是含义（`approval`、`question`），从不是图形的名字，这样图形可以改，key 也不会因此说错。没有 `sparkles` 这个 key，也根本不用闪光图标（[不用闪光图标](#principles)）。
- **卡片的状态不是图标。** 请求某件事的卡片用状态像素点和文字显示它所处的阶段和结果（[消息里的卡片](../patterns/cards-in-messages.md#a-card-that-asks-for-something)）；表里的等待、完成和失败用于菜单、行和横幅。

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| 36px | 空状态 |
| 22px | 顶栏，以及触屏上顶栏的栏按钮，包括选中多项时工具栏的按钮；标签栏；手机上 `icon-lg` 的图标按钮（44px） |
| 20px | 导航条、列表行、横幅、底部面板里的行 |
| 18px | 只有图标的方形按钮：32px（`icon-md`）和桌面端 34px（`icon-md` 和 `icon-lg`）；`lg` 的带标签按钮，以及本身就是一个操作的行，它们算作一个按钮（Leave channel、Archive channel、Delete channel：[ListRow](../../packages/ui/src/components/list-row/list-row.md#an-actions-risk)）；频道图块 |
| 16px | `md` 的带标签按钮、行里 28px 的纯图标操作（`icon-sm`），以及用鼠标时选中多项时工具栏的操作，不论标签显示还是已让位（Jasper，2026-11-14，#proj-raft-ui）；小按钮、消息的悬停工具栏、分段控件、菜单、标签页 |
| 14px | 标签片、引用标签片、筛选、值标签片 |
| 11px 到 12px | 小频道图块、事件行、徽标、状态标签片里的箭头 |

### 小尺寸下的标记 {#a-mark-at-small-sizes}

一个图形用于所有尺寸：Lucide 没有哪个图标画了两遍。自己画的图标，如果它的标记在 16px 及以下看不清，可以多带一个用于小尺寸的标记，画在同一个网格上，由图标上的容器查询（`data-icon-sizes`，在 `@botiverse/ricons/styles.css` 里，raft-ui 的样式表导入了它）在 18px 以下换上。图形的其余部分不变，从 18px 起，图标就只是那一个图形。只有 `UnfollowArtifactIcon` 有这样的标记：在 16px 时它的减号更粗，这样它读起来是一个标记，而不像页面轮廓又多了一段（[Icons](../../packages/icons/src/icons.md#action-icons)）。只有图标在它实际使用的尺寸下标记看不清时才加，不要用它来微调一个本来就看得清的图标。

## 相关 {#related}

- [Button](../../packages/ui/src/components/button/button.md)：图标按钮及其尺寸。
- [品牌](./brand.md)：logo 和回应。
