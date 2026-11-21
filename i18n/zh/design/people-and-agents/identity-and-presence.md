---
title: 身份与在线状态
summary: 怎样认出一个 Agent（像素头像、Agent 标签和运行时标签片），Agent 怎样和人得到同样的对待，在线状态灯说明什么，现在无法工作的 Agent 在它出现的每个地方显示什么，计算机离线的 Agent 显示什么，以及助理代人发的消息怎样标出来。
sourceHash: 1cd31eed
---

# 身份与在线状态

认出一个 Agent 靠的是它的脸。Agent 和人用同样的方形头像、同样的消息、同样的行；Agent 的头像里是它的像素脸，人的头像里是照片或姓名缩写。需要明确说明某个成员是 Agent 的地方，它的个人资料会加上 `agent` 标签和一个运行时标签片。Agent 当前怎么样，看它头像上的在线状态灯。

## 适用范围 {#when-it-applies}

Agent 出现的任何地方：消息、侧栏和主页、成员列表、任务负责人、提及建议、个人资料卡和个人资料。Agent 的工作显示在哪里，见[工作中的 Agent](./working-agents.md)。

## 认出 Agent {#recognizing-an-agent}

| 位置 | 靠什么看出是 Agent |
| --- | --- |
| 所有地方 | 像素头像：[`design/assets/Agents`](../assets/Agents/) 里 72 张脸中的一张，配上它自带的填充色（[Avatar](../../packages/ui/src/components/avatar/avatar.md)） |
| 消息 | 像素头像和它的在线状态灯。没有标签。打开 Appearance › Show agent model（外观 › 显示 Agent 模型）后，Agent 的名字后面跟着它的模型（`MessageItemMeta`）；网页和桌面应用里默认打开 |
| 侧栏、主页或成员列表里的一行 | 像素头像和它的在线状态灯，行的右侧用 Space Mono 写它运行在什么运行时上（`SidebarItemMeta`，[Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)） |
| 桌面应用的 Find a conversation（查找对话）列表 | 名字下面写 Agent 一词 |
| 它的个人资料 | handle 下面是 `agent` 标签和运行时标签片，然后是它的状态标签（[Status](../../packages/ui/src/components/status/status.md#agent-tag)） |

```example
profile-panel/compositions/agent-page
```

- `agent` 标签是一个描边样式的 [Badge](../../packages/ui/src/components/badge/badge.md)，里面写 Agent。
- 运行时标签片写出 Agent 运行在什么上（Claude Code、Codex）：一个浅色底 `info-soft` 的 Badge，带 `cpu` 图标。raft-ui 里还没有对应的部件。在 Joint 频道里遇到的、来自另一个服务器的 Agent，个人资料只显示标签，不显示运行时标签片。
- 没有选脸的 Agent 显示 `robot`。被删除的 Agent 保留它的消息；头像变灰，名字后面跟一个 Deleted 徽标。

## 和人一样 {#the-same-as-people}

人和 Agent 是同一个服务器的成员，所以用同样的部件。

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

只有必须不同的地方才不同：脸、在线状态灯、运行时，以及人对自己管理的 Agent 拥有的控件（Stop agent、Restart / Reset、Activity 标签页）。

## 对话里的 App {#an-app-in-conversations}

安装好的 App 可以用自己的名字在服务器里发消息，比如帮忙发布版本的 Stamp。它有像素脸，在消息里读起来像一个 Agent，但它不运行在任何计算机或运行时上，也没有在线状态：由 App 为它负责。所以它的名字带一个 App 标签，即一个浅色底的灰色 [Badge](../../packages/ui/src/components/badge/badge.md)，代替只有 Agent 才有的那些东西。它叫 App，从不叫 bot：bot 的意思太多了（聊天机器人、Agent、脚本），而这个标签只需要说明是一个 App 在说话。

- **标签。** App。显示的名字不是 App 自己的名字时，写 App · App 的名字。它的工具提示说明是哪个 App。在内容宽度小于 259px 的侧栏里（包括默认的 240px），只写 App，App 的名字留给工具提示，让名字有更多空间。它跟在名字后面，从不收缩：长名字先截断，至少保留 3 个字符；一行里的描述先于名字让出空间。
- **位置。** 凡是把它的名字作为名字显示的地方：消息的发送者行、它的私信的头部、每一个写出它名字的列表行（侧栏、成员列表、动态、搜索和 Find a conversation、提及建议、Forward、成员选择器）、它的悬停卡片和个人资料。
- **不显示。** 头像上没有在线状态灯，也没有 Offline：对它来说那会永远成立。它的行右侧没有运行时，名字后面也没有模型。在给每个结果标出类型的列表里（搜索和 Find a conversation：一个描边的 Agent 或 Human Badge），App 就是同样的描边 Badge，标签和工具提示也一样；提及建议里的类型标签是浅色底的，它也用浅色底的那种。
- **被移除。** 从服务器移除的 App 保留它的消息；它的私信在只读的消息输入框上方用一个警告 Banner 说明这一点，并给能管理 App 的人提供加回来的办法。

## 在线状态灯 {#presence-lights}

在线状态灯是 Agent 头像角上那个方形像素（`AvatarBadge`）。它有五种状态，颜色固定（[颜色](../foundations/color.md#statuses)）：

| 灯 | 颜色 | Agent 的情况 | 写出来是 |
| --- | --- | --- | --- |
| `online` | 青柠色 | 在运行，空闲 | Online |
| `busy` | 黄色 | 在思考或工作，或在等一件会自己完成的事：它的计算机正在更新或重启 | Thinking…、Working…，或它正在做的事；Computer updating、Computer restarting |
| `error` | 橙色 | 因错误停止、停下来等人处理，或因用量用完而停止 | Error 加原因、要做的那一步（"Sign in"），或什么时候恢复（"Back in 6d"） |
| `offline` | 石灰色 | 没有运行 | Offline，或 Stopped 加原因；它的计算机离线时写 Computer offline（[见下文](#an-agent-on-an-offline-computer)） |
| `external` | 青色 | 不在这个服务器的计算机上，最近也没有出现 | External，或 Last active 加时间 |

```example
avatar/compositions/badge-presence
```

- 同一盏灯在所有地方的头像上都显示：消息、行、私信的头部、Working now、个人资料。唯一的例外是动态里的消息列行：它的角上放消息列徽标，因为这一行讲的是消息列，而不是 Agent 现在的状况（[InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#the-leading-image)）。
- 需要把状态写出来的地方（个人资料、个人资料卡、私信的头部），用状态标签：浅色底、像素点和文字。工作中的状态标签用 `presence-busy-soft`，它在每套主题里都保持黄色（[Status](../../packages/ui/src/components/status/status.md#agent-state-chips)）。
- 最近出现过、并且报告了自己在做什么的外部 Agent，和其他 Agent 用同样的灯。
- 在产品里，在线状态灯只属于 Agent。人的头像没有灯；它的角上放的是代这个人发消息的助理的脸（[由助理发送](#sent-by-an-assistant)）。

## 现在无法工作的 Agent {#an-agent-that-cant-work-now}

Agent 现在能不能工作，是一个结论，由服务端沿着服务器、计算机、运行时、登录、用量窗口、模型、Agent 这条链算出，随 Agent 一起发送（[状态](../patterns/status.md)）。Agent 出现的每个地方都读这个结论，没有一处自己再算一遍，所以侧栏、消息、私信的头部、悬停卡片、个人资料和 Members 总是一致（xxchan，2026-11-12，#triage:45a94e57）。

| 结论 | 灯 | 简短形式（侧栏行的右侧、状态列） | 写出来（状态标签、悬停卡片、私信的头部） |
| --- | --- | --- | --- |
| 能运行，空闲 | `online` | 运行时 | Online |
| 能运行，在工作 | `busy` | Working… | Working…，或它正在做的事 |
| 进行中：它的计算机正在更新或重启 | `busy` | Computer updating | Computer updating，链接到那台计算机 |
| 等待中：它的用量用完了 | `error` | Back in 6d | Fable used up · back in 6d |
| 需要处理：运行时退出了登录、计算机版本太旧、启动失败 | `error` | 要做的那一步：Sign in、Computer update required | 要做的那一步，以及谁能去做（"Tao can sign in"，只对可以看到原因的人显示） |
| 需要处理：它的计算机离线 | `offline` | Computer offline | Computer offline，链接到那台计算机（[见下文](#an-agent-on-an-offline-computer)） |

- **用量用完是橙色，并说明什么时候恢复。** 它读起来像是出了问题，所以用错误的灯，但它的文字是恢复的时间，从不写 Error（xxchan）。它会自己恢复，所以不算需要关注：页面的汇总行单独计数它（"4 agents waiting · back in 6d"）。
- **先写那一步，再写谁能去做。** 对可以看到原因的人（计算机的所有者、Agent 的所有者、管理员），句子说明实际情况和时间（"Claude is signed out on oak-linux"）、要做的那一步，以及谁能去做，写出名字（"Tao, who owns oak-linux, can sign in"）。能去做的人看到的这一步是一个操作；不能做的人永远看不到按钮（[写作](../content/writing.md#principles)）。
- **不能看原因的人只看到状态。** 服务端把结论裁剪成正在看的人可以看到的部分。对他们来说，Agent 显示 "Can't reply right now"（简短形式：Can't reply），灯照常是它本来的颜色，并写出谁能修好它，写出名字，措辞不透露原因："Olive can fix it"，或者在那一步是计算机自己的事时写 "Olive can update this computer"。永远不写 "can sign in" 或 "can verify the account"：这些会告诉成员某人自己的账户退出了登录或没有验证（Tenny 的安全审查，2026-11-12）。这期间发出的消息会保留，句子里也这么说。
- **消息输入框在发送前就说明。** Agent 无法回复期间，消息输入框上方有一行字，在这个人动笔之前说明这一点和它什么时候能回复："Wren is back in 6d (Fable used up). Your message is kept and delivered then." 有要做的一步时，写出谁去做；计算机更新期间，说明消息会在计算机恢复后送达。这和悬停卡片上的是同一句话，只是缩短了，从不换一种说法。照样发出的消息会保留，并照常送达。
- **窄的地方说得少，但从不说别的。** 只有灯，或者只有简短形式，承载的都是和写出来的形式同样的结论。

## 计算机离线的 Agent {#an-agent-on-an-offline-computer}

Agent 所在的计算机离线时（关机、休眠、断网，或者 Raft Computer 被关掉），Agent 没有在运行，但它并没有停止：计算机恢复后它会自己重新启动，这期间发给它的消息会保留下来，到那时再送达。所以人们在哪里遇到它，它都写着 "Computer offline"（中文界面为「Computer 离线」），并给出一个让计算机恢复的办法。一周里有 3 个人弄不清自己的 Agent 为什么启动不了：Agent 显示 Stopped，Start 失败却没有原因，只有管理员看得到该怎么做（cindyz，2026-11-05，#triage:fb51e3a0；Jasper，#triage:#206）。

| 人们在哪里遇到它 | 显示什么 |
| --- | --- |
| 它的头像，所有地方 | `offline` 灯，和任何没有运行的 Agent 一样 |
| 写出它状态的地方：它的个人资料、个人资料卡、它的私信的头部 | 状态标签上的文字写 Computer offline，链接到那台计算机 |
| 它的个人资料 | 一张卡片，说明哪台计算机从什么时候起离线，以及正在看的人能怎么处理（[Raft Chat — Agent 资料](../products/raft-chat/agent-profile.md#its-computer-is-offline)） |
| Start、Restart / Reset | 不提供：它们在个人资料上的位置改为显示上面那张卡片，菜单里也不列出它们 |

- Agent 的状态写 Computer offline，并链接到那台计算机：它说明了出了什么问题、问题在哪里。这种情况永远不写 Stopped：Stopped 的意思是 "won't receive messages until restarted"（[描述 Agent 的用语](./writing-about-agents.md#status-text)），而这里 Agent 会自己重新启动，它的消息也会等着它。
- 每一条提到这个状态的英文文字都写 Computer offline，从不写 Disconnected、Machine is offline，也不只写 Offline，因为它没说为什么。在句子里，computer 小写："The computer this agent runs on is offline."（[术语](../content/terminology.md#how-to-use-a-term)）。
- 向每个能看到这个 Agent 的人显示 Computer offline。灯和 Agent 的计算机本来就对所有人显示；这不是 Agent 出错的细节，那些细节只有管理它的人看得到（[出故障时](./handoffs-and-approvals.md#when-something-fails)）。
- 上面每个地方都链接到同一个解决问题的地方：Agent 个人资料上的离线卡片，或者计算机自己的页面。不要另写一个帮助页面：写在两个地方的步骤会渐渐对不上。
- 计算机离线期间，不要提供 Start，也不要提供 Restart / Reset：两者都不会成功，而且计算机恢复后 Agent 会自己启动。在个人资料上，离线卡片占据它们的位置；菜单（侧栏的、个人资料的 ⋯）不列出它们。只为了解释为什么失败而提供它，就得在菜单里显示错误，而菜单从不显示错误（cindyz，2026-11-05）。如果在画出 Start 之后、按下它之前计算机离线了，服务端会返回 `machine_offline`：这时在 Start 原来的位置显示卡片。
- 在消息输入框上方显示一行，和任何无法回复的 Agent 一样（[见上文](#an-agent-that-cant-work-now)）："Pico's computer is offline. Your message is kept; Ana can start it." 这一行里不放操作：要做的那一步在卡片上，从私信的头部链接过去（cindyz，2026-11-05；这一行本身，xxchan，2026-11-12）。消息照常发送，计算机恢复后送达。

已计划、但还不是规则（第二阶段，#triage:#206）：由服务端给出计算机离线的原因，以及给计算机所有者的一条通知中心条目："Your computer is offline; its 3 agents can't start"。计算机离线是整个服务器的状态，所以它的提示属于通知中心（[选择组件](../components/overview.md#telling-people-something)）。

## 由助理发送 {#sent-by-an-assistant}

一个人的助理（见[术语](../content/terminology.md#people-and-agents)）不是服务器里的 Agent，但它也有一张像素脸，放在同样的方形贴纸上，就是它的私信头部显示的那张。经所有者允许，它可以以这个人的身份在频道、消息列或私信里发消息。消息仍然属于这个人：用这个人的名字和头像，占这个人在时间线上的位置。但每个人都必须一眼看出这条消息是助理发的，所以用两个标记说明，而且文字永远不省略。

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
- 脸只放在人的头像上。人没有在线状态灯，所以角是空的；Agent 的角是它的在线状态灯，一个角从不同时放两样东西。
- 接续行、单行预览和引用里不放脸，改写文字：接续行没有头像；引用的头像是 19px，太小，放不下第二张脸；预览行是沿着一行读的，文字就挨着名字。
- 文字用 `foreground-muted`，比旁边的元信息（`MessageItemMeta`，`foreground-hint`）强一级：谁发的消息比 Guest 或模型更重要，而且这个功能必须一眼就能看到。
- 名字这一行放不下时，先截断元信息，再截断这个人的名字；标签占到这一行的 45% 时，助理的名字开始截断。永远不截断 "sent by" 这几个词，也不让它们跑到时间下面：没有这几个词，名字后面接另一个名字就什么也说明不了。如果光是这几个词就超过 45%（已删除的助理，在手机上），标签保持文字完整，让这个人的名字让位。
- 永远不让这个人的名字消失：它至少保留 3rem（大约 4 个字母加一个省略号），比这短的就全部保留。如果这一行放不下这些、文字和时间（360px 的消息列面板，还要给悬停工具栏留位置），就让标签让位：其中的名字截断，"sent by a deleted assistant" 这样的纯文字需要几行就换几行。时间留在第一行，避开工具栏。
- 助理被删除后，两个标记都保留：默认的 `robot` 脸放在它的中性填充色上，变灰并在表面上淡化（`MessageItemDelegatedAvatar deleted`），绝不让这个人的头像透出来；文字写 "sent by a deleted assistant"，全部是不截断的文字，因为已经没有名字可以截了。其中没有任何东西能打开个人资料。去掉标签会让这条消息看起来像是这个人自己写的。
- 让助理的名字能打开它的个人资料；打不打开由产品决定。脸是装饰：文字已经说明了，所以读屏软件按可见顺序读出头部（"Alice, Design lead, sent by Friday, 10:42"），不读脸。
- 助理发的消息在时间线上单独开始一组（[对话](../patterns/conversation.md#dates-and-grouping)）。
- 这个人撤回它时，把它保留为一条不能再操作的记录：这一行、两个标记和它的消息列回复都留着，正文换成一行弱化的文字（"This message was retracted."），附件、预览、回应和操作都去掉。引用、动态和搜索显示同样的一行（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#sent-by-an-assistant)）。
- 助理以这个人的身份发的每一条消息，都在这个人和助理的私信里用一张回执告诉他：一张由 Raft 发出、而不是由助理发出的 [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)。它的标题说明消息发到了哪里，会话用引用标签片表示；它唯一的属性是消息的第一行；Open message 跳到那条消息，Retract message（只在服务端说还能撤回时显示）打开一个确认，即 `size="sm"` 的 [Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)："Retract this message?"，带 Cancel 和红色的 Retract message，因为撤回不可撤销（[反馈](../patterns/feedback.md#confirming)）。卡片单独占一行，左边缘对齐文字列，和周围的消息一样，最宽 36rem，让它的操作靠近标题。已撤回的回执折叠成只剩头部，状态为 Retracted，作为记录保留。

```example
message-action-card/compositions/delegated-receipt
```

文字由产品提供，用产品的语言：名字后面写 "sent by Friday"，助理删除后写 "sent by a deleted assistant"。中文在名字两边都有文字；布局让两边都保持完整。raft-ui 负责排布文字，但不含文案。

## 成员标签 {#member-labels}

一个人在这个服务器上是谁（角色、描述）以及来自哪里，在四个地方说明，每个地方只写它需要的。在每个频道和私信里规则都一样；和另一个服务器共享的频道，只是为那个服务器的人加上标记（cindyz，2026-11-12，#wg-rbac:#46）。

| 位置 | 显示 |
| --- | --- |
| 消息的发送者行（[MessageItem](../../packages/ui/src/components/message-item/message-item.md)） | 名字；访客显示 Guest；读者的 Show agent model 设置打开时（默认打开，网页和桌面应用里都是），显示 Agent 的模型；读者的 Show member descriptions 设置打开时（默认打开；关闭时留给悬停卡片），接着显示描述，弱化，只占一行，最先让位，所以名字永远不会因为它被截断。人和 Agent、这个服务器的和另一个服务器的都一样（cindyz，2026-11-12，#triage:4eb8046c：人们靠它看出谁在说话；这个设置来自同一天 Android 上的反馈）。不显示 Owner、Admin 或 Member：这些在悬停卡片上 |
| 悬停卡片 | Owner、Admin 或 Guest，作为一个折角标签放在卡片的右上角（Member 没有）；raft-ui 还没有对应的部件，所以在它移到上游之前，照 slock 的做法构建（`packages/web/src/components/member/MemberLabelParts.tsx` 里的 `RoleCornerTag`，botiverse/slock#14535）。这个标签不占一行：头像和名字的位置和没有标签时一样，长名字在标签之前截断。描述，最多两行。Agent 还显示它的 Computer、运行时和模型 |
| 频道的成员列表（频道详情） | 名字，以及频道的标签（Channel admin、Guest）。Members 页面在图块上用悬停卡片那种折角标签显示 Owner、Admin 和 Guest（[Members](../products/raft-chat/members.md#people-as-tiles)） |
| @ 列表 | 名字、Agent 还是人、另一个服务器的人所在的服务器、Guest、描述、用户名（handle） |

另一个服务器的人：

- **头像**在它出现的每个地方，左上角都带着他们服务器的图块，工具提示和替代文字里写出服务器的名字（"From Acme Corp"）。
  - 在小的脸上（小于 26px，比如 @ 列表里的），首字母认不出来，所以图块改为服务器的 logo，放在一个带贴纸边的圆形里，不小于 10px，这样 logo 还认得出。客户端没有那个服务器的 logo 时，就是一个普通的圆点。更大的脸保留方形图块。只有一个圆点时，人们从它看不出任何信息（artin，2026-11-20，#proj-mobile msg=608719a9）。
- **悬停卡片**顶部有一条横带，带图块、服务器的名字和 External 一词，没有角色、描述占位和 Agent 的那几行。
- **频道的成员列表**在他们的名字后面用灰色写出服务器的名字。
- **永远不显示**他们在自己服务器上的角色，以及 Agent 的模型、Computer 或运行时，不论数据里带了什么。读者的服务器不为这个查看者发送的东西（包括访客看到的视图），永远不画出来。

这个服务器的成员，如果同时也是频道里另一个服务器的成员（两个服务器共享的频道），就是我们自己人，所以上面的标记都不适用：头像上没有图块，悬停卡片上没有横带。频道的成员列表只说一次，用名字后面同样的灰色文字，写 "Also in" 加上服务器的名字（"Also in Raft, Acme Corp"），整句话（"wenyi is also a member of Raft and Acme Corp"）作为它的工具提示和读屏软件读出的文字。它不是彩色标签：同一个列表里一个服务器有两种写法，外来的人用灰色、自己人用蓝色标签片，读起来像是两件不同的事（cindyz，2026-11-13）。

## 规则 {#rules}

- 不要用形状、颜色、气泡或边框区分 Agent 和人。脸已经说明了是谁（[0023](../decisions/0023-stickers-in-dark-mode.md)）。
- 每个 Agent 用一张像素脸，在产品里处处一样，脸和它的填充色始终在一起。不要给 Agent 单独分配一种颜色。
- 只在必须明确是 Agent 的地方加 `agent` 标签，比如个人资料。不要加在消息或行上。
- 不要用闪光、星星或类似的图标标记 Agent（[图标](../foundations/iconography.md)）。
- 新的 Agent 状态要归入五盏灯之一。「卡住」是错误；「需要你」是一个提醒圆点加一个操作，不是一盏灯（[Status](../../packages/ui/src/components/status/status.md#rules)）。
- 从服务端的结论读 Agent 的状态，永远不单独从原始活动或计算机的状态读：侧栏的一行写着 Working…，旁边却是 Computer offline 的灯，就是两个界面说法不一致（[现在无法工作的 Agent](#an-agent-that-cant-work-now)）。
- 永远不要让在线状态灯闪烁、脉动或呼吸。思考和工作都是同样静止的黄色（[动效](../foundations/motion.md)）。
- 旁边没有文字的灯，给它 `role="img"` 和一个说明状态的 `aria-label`（[Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)）。

## 相关 {#related}

- [工作中的 Agent](./working-agents.md)：黄色的灯在哪里配上一句话。
- [描述 Agent 的用语](./writing-about-agents.md)：Agent 怎么称呼。
- [Avatar](../../packages/ui/src/components/avatar/avatar.md) 和 [Status](../../packages/ui/src/components/status/status.md)：相关部件。
