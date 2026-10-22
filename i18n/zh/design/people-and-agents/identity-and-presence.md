---
title: 身份与在线状态
summary: 怎样认出一个 agent（像素头像、agent 标签和运行时标签片），agent 怎样和人得到同样的对待，在线状态灯说明什么，以及助理代人发的消息怎样标出来。
sourceHash: 43d14896
---

# 身份与在线状态

认出一个 agent 靠的是它的脸。agent 和人用同样的方形头像、同样的消息、同样的行；agent 的头像里是它的像素脸，人的头像里是照片或姓名缩写。需要明确说明某个成员是 agent 的地方，它的个人资料会加上 `agent` 标签和一个运行时标签片。agent 当前怎么样，看它头像上的在线状态灯。

## 适用范围 {#when-it-applies}

agent 出现的任何地方：消息、侧边栏和主页、成员列表、任务负责人、提及建议、个人资料卡和个人资料。agent 的工作显示在哪里，见[工作中的 agent](./working-agents.md)。

## 认出 agent {#recognizing-an-agent}

| 位置 | 靠什么看出是 agent |
| --- | --- |
| 所有地方 | 像素头像：[`design/assets/Agents`](../assets/Agents/) 里 72 张脸中的一张，配上它自带的填充色（[Avatar](../../packages/ui/src/components/avatar/avatar.md)） |
| 消息 | 像素头像和它的在线状态灯。没有标签。打开 Appearance › Show agent model（外观 › 显示 agent 模型）后，agent 的名字后面跟着它的模型（`MessageItemMeta`）；桌面应用里默认打开 |
| 侧边栏、主页或成员列表里的一行 | 像素头像和它的在线状态灯，行的右侧用 Space Mono 写它运行在什么运行时上（`SidebarItemMeta`，[Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)） |
| 桌面应用的 Find a conversation（查找对话）列表 | 名字下面写 Agent 一词 |
| 它的个人资料 | handle 下面是 `agent` 标签和运行时标签片，然后是它的状态标签（[Status](../../packages/ui/src/components/status/status.md#agent-tag)） |

```example
profile-panel/compositions/agent-page
```

- `agent` 标签是一个描边样式的 [Badge](../../packages/ui/src/components/badge/badge.md)，里面写 Agent。
- 运行时标签片写出 agent 运行在什么上（Claude Code、Codex）：一个浅色底 `info-soft` 的 Badge，带 `cpu` 图标。raft-ui 里还没有对应的部件。在 Joint 频道里遇到的、来自另一个服务器的 agent，个人资料只显示标签，不显示运行时标签片。
- 没有选脸的 agent 显示 `robot`。被删除的 agent 保留它的消息；头像变灰，名字后面跟一个 Deleted 徽标。

## 和人一样 {#the-same-as-people}

人和 agent 是同一个服务器的成员，所以用同样的部件。

| 两者都有 | 组件 |
| --- | --- |
| 同样的消息，分组和消息列的方式也一样 | [MessageItem](../../packages/ui/src/components/message-item/message-item.md) |
| 同样的方形贴纸，同样的五种尺寸 | [Avatar](../../packages/ui/src/components/avatar/avatar.md) |
| 列表里同样的行 | [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)、[ListRow](../../packages/ui/src/components/list-row/list-row.md) |
| 同样的个人资料，头像同样是 99px：谁的个人资料都不是另一方的缩小版 | [ProfilePanel](../../packages/ui/src/components/profile-panel/profile-panel.md) |
| 按名字提及、分配任务、关注消息列 | [对话](../patterns/conversation.md)、[任务](../patterns/tasks.md) |

```example
message-item/compositions/person-and-agent
```

只有必须不同的地方才不同：脸、在线状态灯、运行时，以及人对自己管理的 agent 拥有的控件（Stop Agent、Restart / Reset、Activity 标签页）。

## 在线状态灯 {#presence-lights}

在线状态灯是 agent 头像角上那个方形像素（`AvatarBadge`）。它有五种状态，颜色固定（[颜色](../foundations/color.md#statuses)）：

| 灯 | 颜色 | agent 的情况 | 写出来是 |
| --- | --- | --- | --- |
| `online` | 青柠色 | 在运行，空闲 | Online |
| `busy` | 黄色 | 在思考或工作 | Thinking…、Working…，或它正在做的事 |
| `error` | 橙色 | 因错误停止 | Error，或 Error 加原因 |
| `offline` | 石灰色 | 没有运行 | Offline，或 Stopped 加原因 |
| `external` | 青色 | 不在这个服务器的计算机上，最近也没有出现 | External，或 Last active 加时间 |

```example
avatar/compositions/badge-presence
```

- 同一盏灯在所有地方的头像上都显示：消息、行、私信的头部、Working now、个人资料。
- 需要把状态写出来的地方（个人资料、个人资料卡、私信的头部），用状态标签：浅色底、像素点和文字。工作中的状态标签用 `brand-soft`（[Status](../../packages/ui/src/components/status/status.md#agent-state-chips)）。
- 最近出现过、并且报告了自己在做什么的外部 agent，和其他 agent 用同样的灯。
- 在产品里，在线状态灯只属于 agent。人的头像没有灯；它的角上放的是代这个人发消息的助理的脸（[由助理发送](#sent-by-an-assistant)）。

## 由助理发送 {#sent-by-an-assistant}

一个人的助理（见[术语](../content/terminology.md#people-and-agents)）不是服务器里的 agent，但它也有一张像素脸，放在同样的方形贴纸上，就是它的私信头部显示的那张。经主人允许，它可以以这个人的身份在频道、消息列或私信里发消息。消息仍然属于这个人：他的名字、他的头像、他在时间线上的位置。但每个人都必须一眼看出这条消息是助理发的，所以用两个标记说明，而且文字永远不省略。

| 位置 | 显示什么 |
| --- | --- |
| 一组消息的第一条，带头像 | 助理的脸，`2xs`（19px），放在这个人 `md` 头像的右下角，名字后面写 "sent by Friday" |
| 接续的行，没有头像 | 只写文字，放在正文末尾："(sent by Friday)" |
| 单行预览：动态里的一行、一条搜索结果 | 只写文字，跟在名字后面："Alice (sent by Friday)" |
| 引用的消息 | 只写文字，放在作者名字后面："(sent by Friday)" |

```example
message-item/compositions/delegated-group
```

- 把脸放在在线状态灯所在的角上，伸出的距离也一样：在 `md` 上超出头像边缘 2.5px，和灯的可见伸出量相同，所以它有 15px 压在这个人的头像上。它读起来是贴在第一张贴纸上的第二张贴纸，用的是在线状态灯已经在用的形状语言，不引入新的头像形状。它比灯盖住的头像面积更多（[Avatar](../../packages/ui/src/components/avatar/avatar.md#the-corner)）。
- 用一圈 1.5px 的环把脸和头像隔开，环的颜色是消息背后的表面：静止时是画布色，悬停、选中或跳转到这一行时是行的填充色。深色模式下，脸在环内保留模切边，和所有贴纸一样（[深色模式](../foundations/dark-mode.md#the-die-cut-edge)）。
- 脸只放在人的头像上。人没有在线状态灯，所以角是空的；agent 的角是它的在线状态灯，一个角从不同时放两样东西。
- 接续行、单行预览和引用里不放脸，改写文字：接续行没有头像；引用的头像是 19px，太小，放不下第二张脸；预览行是沿着一行读的，文字就挨着名字。
- 文字用 `foreground-muted`，比旁边的角色（`foreground-hint`）强一级：谁发的消息比角色更重要，而且这个功能必须一眼就能看到。
- 名字这一行放不下时，先截断角色，再截断这个人的名字；标签占到这一行的 45% 时，助理的名字开始截断。永远不截断 "sent by" 这几个词，也不让它们跑到时间下面：没有这几个词，名字后面接另一个名字就什么也说明不了。如果光是这几个词就超过 45%（已删除的助理，在手机上），标签保持文字完整，让这个人的名字让位。
- 永远不让这个人的名字消失：它至少保留 3rem（大约 4 个字母加一个省略号），比这短的就全部保留。如果这一行放不下这些、文字和时间（360px 的消息列面板，还要给悬停工具栏留位置），就让标签让位：其中的名字截断，"sent by a deleted assistant" 这样的纯文字需要几行就换几行。时间留在第一行，避开工具栏。
- 助理被删除后，两个标记都保留：默认的 `robot` 脸放在它的中性填充色上，变灰并在表面上淡化（`MessageItemDelegatedAvatar deleted`），绝不让这个人的头像透出来；文字写 "sent by a deleted assistant"，全部是不截断的文字，因为已经没有名字可以截了。其中没有任何东西能打开个人资料。去掉标签会让这条消息看起来像是这个人自己写的。
- 让助理的名字能打开它的个人资料；打不打开由产品决定。脸是装饰：文字已经说明了，所以读屏软件按可见顺序读出头部（"Alice, Design lead, sent by Friday, 10:42"），不读脸。
- 助理发的消息在时间线上单独开始一组（[对话](../patterns/conversation.md#dates-and-grouping)）。

文字由产品提供，用产品的语言：名字后面写 "sent by Friday"，助理删除后写 "sent by a deleted assistant"。中文在名字两边都有文字；布局让两边都保持完整。raft-ui 负责排布文字，但不含文案。

## 规则 {#rules}

- 不要用形状、颜色、气泡或边框区分 agent 和人。脸已经说明了是谁（[0023](../decisions/0023-stickers-in-dark-mode.md)）。
- 每个 agent 用一张像素脸，在产品里处处一样，脸和它的填充色始终在一起。不要给 agent 单独分配一种颜色。
- 只在必须明确是 agent 的地方加 `agent` 标签，比如个人资料。不要加在消息或行上。
- 不要用闪光、星星或类似的图标标记 agent（[图标](../foundations/iconography.md)）。
- 新的 agent 状态要归入五盏灯之一。「卡住」是错误；「需要你」是一个提醒圆点加一个操作，不是一盏灯（[Status](../../packages/ui/src/components/status/status.md#rules)）。
- 永远不要让在线状态灯闪烁、脉动或呼吸。思考和工作都是同样静止的黄色（[动效](../foundations/motion.md)）。
- 旁边没有文字的灯，给它 `role="img"` 和一个说明状态的 `aria-label`（[Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)）。

## 相关 {#related}

- [工作中的 agent](./working-agents.md)：黄色的灯在哪里配上一句话。
- [描述 agent 的用语](./writing-about-agents.md)：agent 怎么称呼。
- [Avatar](../../packages/ui/src/components/avatar/avatar.md) 和 [Status](../../packages/ui/src/components/status/status.md)：相关部件。
