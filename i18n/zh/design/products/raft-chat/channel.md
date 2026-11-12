---
title: Raft Chat — 频道
summary: 一个频道：它的标题栏和详情，它的公告，它的 Tasks 和 Files 分区，它的消息输入框，在频道里怎样建任务，以及它的消息列。
sourceHash: 209668c4
---

# Raft Chat — 频道

频道是人和 Agent 共用一条时间线的地方，底部是消息输入框。在手机上它是一个推入页面；在桌面端它占满主区域。它的任务和文件以分区的形式打开在时间线旁边，让人们在聊天时也能看到。时间线、消息、消息输入框和消息列遵循[对话](../../patterns/conversation.md)；这一页只写 Raft Chat 的频道额外加了什么。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelHeader`）：位置图块、频道名和副标题；手机上前面还有返回。副标题是频道描述；谁在工作不放在标题栏里（[正在工作的 Agent](../../people-and-agents/working-agents.md#rows-and-subtitles)）。右侧是四个图标按钮：Search（"Search this channel"）、Tasks（"Open tasks"）、Files（"Open files"）和 Settings（"Channel details and settings"），最后一个是开关，频道详情打开时处于按下状态；频道旁边还开着别的列时，后面是 Expand。标题栏放不下时，这四个按钮从最后一个开始收进 Expand 前面的 ⋯（[Panel](../../../packages/ui/src/components/panel/panel.md#rules)）。
2. **公告横条**，频道有公告时显示（[公告](#the-announcement)）。
3. **时间线**，最新的在底部。
4. **消息输入框**，正上方浮着一行，显示谁在频道里工作、谁在输入（[谁在这里工作](../../people-and-agents/working-agents.md#who-is-working-here)）。

时间线和消息输入框旁边，是打开着的 Tasks 分区和 Files 分区（[页面结构](../../patterns/page-structure.md#sidebar-and-side-panel)）。

```example
conversation-panel/compositions/conversation-panel
```

## 规则 {#rules}

- 频道的图标用 `hash`，私有频道用 `lock`，在公开页面上可读的频道用带地球的井号。外部频道，即侧栏 External 分区里的频道（它有访客、访客服务器或开放的邀请，所以每个联合频道也算），用外部图标，一把带向外箭头的锁。还没进入 External 分区的联合频道，因为它还在转换中，用 `git-branch`。
- 频道的图标只从一个来源取，在每个界面上画同一个图标：标题栏里的位置图块（27px，手机上也是），侧栏和主页里那一行 19px 的图标框，动态和草稿的行以及它们的徽标，搜索结果和筛选，频道选择器，转发目标，消息输入框里的 # 建议，添加成员对话框，以及设置里的列表。同一个频道不管出现在哪里，都要读作同一个地方。以前只有侧栏显示外部图标时，一个外部频道在侧栏里是一个图标，在它自己的标题栏里和其他提到它的地方却是锁或 `#`（cindyz，2026-11-10）。在网页 App 里，来源是 `channelKindIconProps`（slock 的 `components/channel/channelKind.ts`），由 `ChannelIcon` 绘制；任何界面都不自己根据频道类型去选 `hash`、`lock` 或 `git-branch`。
- 推入页面的标题按它显示的内容来写：频道带位置图块，私信带对方的头像，消息列不带图标。
- 让标题栏的 Search 按钮只搜索这个频道，打开一个推入页面，页面顶部是搜索框，没有位置图块，并写明搜索范围：In #launch-week。从那里搜索全部内容会切换到搜索标签，带着同样的查询（[导航](../../patterns/navigation.md#search-on-a-phone)）。

### 频道详情 {#the-channel-details}

频道详情说明频道是什么、里面有谁、怎样设置。获批的设计是 Kirby 的（任务 #proj-raft-ui:#232），stdrc 批准了它，并做了下面这些决定（stdrc，2026-11-10，#proj-raft-ui:dae8db07）。

- 把详情作为对话所在这一行的一列打开，在对话旁边，就像消息列或个人资料打开那样：在侧边列里占同样的位置，记住宽度，可以拖动它的接缝线，也和任何一列一样能变窄成一条（[频道的侧边列](../../patterns/responsive.md#the-channels-side-columns)）。没有遮罩，也没有阴影：人们一边聊天一边读描述或查看设置，以前的模态面板挡住了对话、让它不能用，而这些内容只是放在旁边读的。
- 从标题栏的 Settings 按钮打开它，这是一个 `PanelToggleAction`，详情打开时处于按下状态，再按一次就关闭详情，和 Tasks、Files 一样；也可以点标题栏里的频道名打开，人们点频道名就是想了解这个频道，其他聊天 App 也是这样。
- 它的头部是标题 Details 和 Close（×），没有 Expand：设置和描述用上整行的宽度也没有好处（[Panel](../../../packages/ui/src/components/panel/panel.md#rules)）。在手机上它是推入页面，头部是 Back 和 Details：频道名是页面的第一行，所以头部不重复它（stdrc，2026-11-10）。
- 先以阅读的样子显示。顶部是频道的图标、名称和标签（Public、Private 或 External），描述作为正文，超过三行就折叠，带 Show more。能编辑频道的人在名称那一行的末端有 Edit；它把这一块原地变成 Name 和 Description 两个输入框，下面在行首放 Save 和 Cancel，再加一行说明谁能看到它们（[表单](../../patterns/forms.md#forms-in-a-dialog)）。大多数人打开详情是为了读，所以只在有人编辑时才出现表单，而不是一直摆着两个禁用的按钮。不能编辑的人看不到 Edit，也看不到输入框。
- 然后是成员，放在一张卡片里：一个标题行，Members 加「6 humans · 6 agents ›」，点它在这一列里打开成员列表，带 Back；然后最多三行头像，能添加成员的人在最后看到添加图块（虚线）。看到这里有谁，比一个数字更有用；完整的列表只差一次点按。
- 然后是公告，占一行（[公告](#the-announcement)）；外部频道再列出它的各个服务器，每个一行。
- 然后是设置，用[设置行](../../patterns/forms.md#a-settings-row)，分成两组：**Channel settings**，对频道里的每个人都一样，只给能管理频道的人看（Public 或 Private，带 Make private 或 Make public；Sort by latest activity；Visible to visitors；Slack，带 Connect 或 Change）；**Your preferences**，只对这个人自己生效（Notifications、Sidebar section、Collapse long messages）。这样每项设置读起来都一样，而分组告诉人们，改的是频道，还是只是自己看到的样子。两组的标题不带提示文字：它们的名字已经说明一项设置影响到谁（[写作](../../content/writing.md#principles)）。
- 把 Make private 和 Make public、Hide #all 和 Restore #all 放在 Channel settings 的 Public 或 Private 那一行里，不放在末尾的操作里：它是频道的可见性设置。它保留确认步骤，因为它会让不是成员的人再也看不到这个频道。
- 在 Slack 那一行的 Connect 或 Change 打开的对话框里连接 Slack，对话框里有 Slack 频道、它的帮助说明和 Refresh，用对话框自己的 Connect 提交：连接有副作用，所以它是一个说出这个动作的按钮，从不并进另一个 Save 里（[表单](../../patterns/forms.md#when-a-change-takes-effect)）。
- 最后是一张由行组成、没有标题的卡片，放操作：Archive channel、Leave channel 和 Stop all agents（`tone="warning"`，橙色：它们会打断，但可以撤销），最后是 Delete channel 或 Disconnect channel（`tone="danger"`，红色：不可撤销），每一项都和以前一样需要确认（[表单](../../patterns/forms.md#danger-zone)，[ListRow](../../../packages/ui/src/components/list-row/list-row.md#an-actions-risk)）。可以撤销的打断用 warning（橙色），不可撤销的用 danger（红色）。用行代替全宽居中的按钮，减轻了分量，颜色仍然给风险排出高低。不能管理频道的人只看到 Leave channel。
- 私信和 Agent Lounge 打开同样的一列，里面只有 Your preferences。
- 有人在有未保存修改时关闭详情或离开频道，询问是继续编辑、放弃修改，还是保存。

### 公告 {#the-announcement}

频道的公告是频道里一个所有人都该读的 Artifact：规则、日期、链接。它显示为频道标题栏下面的一条横条，在 Artifact 列里打开。代码里它叫 `ChannelAnnouncement`，以免和 [AnnouncementDialog](../../../packages/ui/src/components/announcement-dialog/announcement-dialog.md) 混淆，后者是产品介绍新东西的对话框；界面上叫它 Announcement（Remy 和 Kirby，2026-11-10，#proj-chat:89bf8a03）。这些规则来自 Kirby 的设计（Artifact 3pcWgS5eJupMGj7yrdC4QR）里的摆放方案 A，tygg 批准了它（tygg，2026-11-10，#proj-chat:89bf8a03）。

#### 显示在哪里 {#where-it-shows}

- 把公告放在频道标题栏下面的一条横条里，和对话一样宽，而不是放在标题栏里一个单独的按钮上。它要做的事是「这里的每个人都该知道这件事」，所以不用找就要能看到：标题栏按钮，比如 Tasks 和 Files，只有已经知道它在那里的人才会找到，新成员永远不会。Tasks 和 Files 故意不显示计数，所以第五个标题栏按钮上的提醒圆点，会要求一种标题栏在别处从不要求的注意，还会让标题栏更早收起（tygg，2026-11-10，#proj-chat:89bf8a03）。
- 让横条在任何宽度下都只有一行，手机上和比 560px 窄的横条也一样：标题，然后是正文的第一行，或者在这次更新还没被看过时显示更新的那一行，放不下就截断。没有东西会变成第二行；想多读，就点它，它会打开（tygg，2026-11-10，#proj-chat:#29）。用鼠标时横条高 40px。
- 把它放在对话顶部那块区域里，排在最后，紧挨在时间线上面：从标题栏往下，先是 `PanelNotice`（这个面板出了问题），然后是建议在 App 或桌面 App 里打开的提示，然后是横条。会消失的东西在前，一直在的横条守在消息旁边。
- 横条画在纸面上（`layer-canvas`），下面一条 `line-seam`，从不用提示的色调或图标：它是频道保留的内容，不是提示，而 `PanelNotice` 的意思是「这个面板有问题」（[反馈](../../patterns/feedback.md#errors-by-scope)）。它也不是 [Banner](../../../packages/ui/src/components/banner/banner.md)：Banner 是对话框或表单里的提示。
- 从行首开始依次是：`foreground-muted` 的 `megaphone` 图标、标题、后面那一行文字、`text-mono-meta` 和 `foreground-hint` 的时间，以及 ⋯。标题最多占横条的 55%，放不下就截断；后面那行文字先让出空间。完整的标题是链接的无障碍名称（「Announcement: Release rules for 1.9」）。
- 整行都能打开公告；⋯ 是一个单独的按钮。Artifact 列显示着公告时，横条保持 `fill-subtle`，就像打开了自己那一项的行；不用黄色，黄色是导航的选中。

#### 有更新和已看过 {#updated-and-seen}

- 这个人还没看过当前版本时，标题用粗体，并在文字后面放提醒圆点（Status `variant="accent"`），和侧栏行上的未读信号一样。那一行说明是谁更新的，带上他的头像：「Bugen updated it」，或者这个版本有说明时显示说明（「Bugen: Added the freeze dates for 1.9」）。Agent 的更新和人的看起来一样，带 Agent 的头像和名字。
- 这个人打开过之后，标题用常规字重，那一行是公告的第一行，带上日期。横条上没有任何粉色。
- 「看过」读的是 Artifact 自己的已读状态：打开当前版本就算看过，在每台设备上都是。新版本就是一个新的版本号；只改说明不会让它重新变成没看过（Remy 和 Kirby，2026-11-10，#proj-chat:89bf8a03）。

#### 横条的菜单 {#the-strips-menu}

- ⋯（Announcement options）里放 Copy link；对能修改公告的人，后面再加一条分隔线和 Announcement settings，它打开频道详情，定位到 Announcement 那一行。
- 不提供隐藏横条的办法：菜单里没有 Hide，标题栏里没有把它找回来的按钮，也不为某个人保存隐藏状态。只要频道有公告，横条就一直显示。公告是固定在那里、频道里每个人都该看到的内容，所以它一直在；作为代价，它保持轻巧：只占一行，看过之后就是标题和正文的第一行，手机上也是（tygg，2026-11-10，#proj-chat:#29）。

#### 打开它 {#opening-it}

- 在频道的 Artifact 列里打开公告，和 Artifact 卡片打开的方式一样：同一个查看器、宽度、Expand、×、评论和版本历史；在手机上全屏，带 Back。查看器的头部保持原样，让标题在 480px 的列里保留它的空间（在头部加一个标签时，标题只剩 116px）。
- 页面开头是一行署名：Announcement、「Updated by Bugen · 5m ago」和 Version history。这个人第一次打开一个新版本时，署名行还显示这个版本的说明，写成「What's new in v4」。

#### 设置、替换和移除 {#setting-replacing-and-removing}

- 只有频道的所有者，以及服务器的所有者和管理员，能设置、替换或移除公告，Agent 也要通过同样的检查（Remy，2026-11-10，#proj-chat:89bf8a03）。其他人一个入口都看不到：行里没有按钮，Artifact 的 ⋯ 里没有这一项，横条的菜单里没有 Announcement settings。
- 在频道详情里，成员后面放一个 Announcement 行：公告本身，点它打开，然后是 Remove（`ghost`）和 Replace。没有公告时，这一行用一行字说明它是做什么的，再加 Set announcement。不能修改公告的人只看到公告本身，没有公告时连这一行也没有。
- 在 Artifact 的 ⋯ 里，Version history 后面放 Set as channel announcement，只出现在归属于这个频道的 Artifact 上。在当前的公告上，它是 Remove as channel announcement。另一个 Artifact 是公告时，它打开 Replace 的确认。
- Set announcement 打开一个 `size="md"` 的 Dialog，里面是一个 ChoiceList：最前面是 New announcement（这个频道里一个空的 Markdown Artifact，在列里打开，供人撰写），然后是频道里的各个 Artifact。
- 用 `size="sm"` 的 Dialog 确认 Replace 和 Remove，先是 Cancel，然后是 `primary` 的确认按钮，不用 `danger`：没有东西被删除，Artifact 留在频道里，还可以再设回来（[Button](../../../packages/ui/src/components/button/button.md#which-color)）。在正文里说清楚：「"Release rules for 1.9" stays in the channel as an Artifact.」

#### 在频道里发什么 {#what-posts-in-the-channel}

- 公告更新时，不在频道里发任何东西，不管是谁更新、改动有多大：横条变成粗体就是通知，对每个人都持续到他打开为止。想让大家注意某次更新的人，自己把 Artifact 的卡片发到频道里（Remy，2026-11-10，#proj-chat:89bf8a03）。
- 设置、替换或移除公告是对频道的一次改动，和重命名一样，会在时间线里发一条事件行：「Martin set the announcement: Release rules for 1.9」（tygg，2026-11-10，#proj-chat:89bf8a03）。它和任何事件行一样遵循频道的通知设置：把频道静音的人不会因此收到通知。

### 任务和文件 {#tasks-and-files}

- 把 Tasks（`list-todo`）和 Files（`paperclip`）做成标题栏里的开关（`PanelToggleAction`，[Panel](../../../packages/ui/src/components/panel/panel.md)）：按下时，开关是一张黄色贴纸，它的分区打开。它们的标签随之变成 Close tasks 和 Close files。
- 两个开关上都不显示计数：大多数任务是 Agent 自己的事，所以分区是在有人想看时才在那里，而不是来要人注意的东西。
- 用开关或分区的 × 关闭分区；在手机上用 Back。两个都打开时，Tasks 在 Files 上面。
- 哪些分区打开着，按人记住，而不是按频道：分区跟着人从一个频道到另一个频道，和消息列那一栏一样。
- 私信也有同样的两个开关。
- Tasks 分区按[任务](./tasks.md#a-channels-tasks-section)里的描述显示。
- Files 分区显示频道里发过的文件列表；文件在预览里打开。

### 频道里的消息输入框 {#the-composer-in-a-channel}

- 把 Attach media 和 Attach file 放在工具栏左侧，把 As task 放在右侧、Send 前面，频道和私信里都这样：以 As task 发送的消息会在它下面创建一个任务（[消息输入框里的 As task](../../patterns/tasks.md#as-task-in-the-composer)）。消息列的消息输入框没有 As task。
- @ 建议分成 "In this channel"、"Not in this channel"、Computers 和 Apps 几组（[对话](../../patterns/conversation.md#mentions)）。

### 对话中的任务 {#tasks-in-the-conversation}

时间线里的任务遵循[任务](../../patterns/tasks.md#tasks-in-a-conversation)。

- 通过发送消息来创建任务：用消息输入框里的 As task；用 Tasks 分区里的 +，它会勾选消息输入框里的 As task，并把焦点放到那里；或者对已经发出的消息，用消息菜单里的 Create task from message。Create task from message 打开一个对话框，引用这条消息，并把消息的文字作为初始标题；在那里创建的每个任务都链接到这条消息，一条消息可以有多个任务。消息列里的回复没有 Create task from message（[在哪里创建任务](../../patterns/tasks.md#where-tasks-are-created)）。
- 从消息创建的任务显示在消息下面，也显示在消息列顶部那条消息的下面。
- 在任务详情或任务页面上修改任务状态（在看板的卡片上，或者用选中任务的工具栏一次改多个任务），或者用消息下面任务那一行上的完成控件完成它；不从消息菜单修改。

### 消息列 {#threads}

- 在消息列标题栏的右侧，先在关注者的头像堆旁边放 "2 agents following"，然后是一个菜单（Search in thread、View in channel、Mark as unread、Unfollow thread；人没有关注的消息列是 Follow thread，没有 Mark as unread），然后是 Expand：它让消息列占满这一行，其他每一列，包括对话，都成为旁边 160px 的窄条，按钮随之变成 Restore，用来把这一行恢复回来（一个窗口控制按钮，紧挨在 × 前面，从不放进菜单；消息列叠在对话上、旁边没有别的列时隐藏：[Panel](../../../packages/ui/src/components/panel/panel.md#rules)），宽屏上最后还有 ×。标题栏放不下时，关注者收进菜单，成为 Following agents；叠在对话上时，标题栏以 Back 开头，没有 ×（[频道的侧边列](../../patterns/responsive.md#the-channels-side-columns)）。
- 在消息列里，每条消息的菜单都有 Mark thread as unread，排在 Unfollow thread 后面：它写 "Thread"，是因为这是一条消息的菜单，而它把整个消息列标为未读，不只是从这条消息往后。这两项都是消息列在动态里那一行的操作，用同一个 `message-square-dot` 图标：消息列在它的频道里和动态里都显示为未读。人还在这个消息列里，所以它保持打开，一直是未读，直到人离开它，和人在一个标为未读的频道里时一样。在动态的详情栏里，在消息列里做操作就会把它标为已读，和点选它的行一样。人没有关注的消息列两项都没有，和它在动态里的行一样：取消关注一个消息列会立即清掉它的未读。

### 套餐时间范围之外的历史 {#history-behind-the-plans-window}

Free 服务器只显示频道、私信、消息列和任务对话最近 30 天的内容。在显示出来的历史开始的地方，会话用历史付费墙代替历史说明（[MessageList](../../../packages/ui/src/components/message-list/message-list.md#rules)）。

- 在最早加载的消息原本所在的位置放一张和消息行一样宽的 [Card](../../../packages/ui/src/components/card/card.md)：`CardLeading` 里放 20px 的 `History`（不用锁：锁表示私有频道），标题说清楚隐藏了多少条、在哪里（"6 earlier messages are older than 30 days"、"All 13 messages in this channel…"、"The first message and 3 replies…"），一行说明 Free 显示什么、Pro 能恢复什么，再加一个 `primary` 小号的 Upgrade to Pro 按钮。所有角色点按钮都打开升级弹窗，由弹窗决定谁付款、谁去请所有者。
- 卡片上方用消息行显示最新的两条被隐藏消息：发送者、时间和前 40 个字，最多两行，越往上越淡。它们不能交互。只显示聊天消息；只有系统消息被隐藏时，只出卡片。如果消息列开头的消息也被隐藏，它排在最前面。
- 卡片下面的第一条日期线写成 "Last 30 days · Tuesday, October 20"。消息列没有日期线，就单独加一条 "Last 30 days"。
- 所有消息都被隐藏时，把预览和卡片放在输入框上方，也就是最新消息原本所在的位置，下面用 `MessageListNotice` `muted` 写 "No new messages in the last 30 days"。输入框照常可用，新消息出现在卡片下面。
- 链接或搜索打开一条超过 30 天的消息时，停在卡片处，以那条消息为中心：它均匀变浅，显示前 80 个字，上下更淡的相邻消息分别往上、往下淡出，标题写 "The message you're looking for is older than 30 days"。
- 升级以后卡片消失，更早的消息在上方加载出来，不用刷新。

