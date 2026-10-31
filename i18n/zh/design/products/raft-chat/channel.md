---
title: Raft Chat — 频道
summary: 一个频道：它的标题栏和详情，它的 Tasks 和 Files 分区，它的消息输入框，在频道里怎样建任务，以及它的消息列。
sourceHash: 54c6aeec
---

# Raft Chat — 频道

频道是人和 Agent 共用一条时间线的地方，底部是消息输入框。在手机上它是一个推入页面；在桌面端它占满主区域。它的任务和文件以分区的形式打开在时间线旁边，让人们在聊天时也能看到。时间线、消息、消息输入框和消息列遵循[对话](../../patterns/conversation.md)；这一页只写 Raft Chat 的频道额外加了什么。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelHeader`）：位置图块、频道名和副标题；手机上前面还有返回。副标题先是工作状态行（[正在工作的 Agent](../../people-and-agents/working-agents.md#rows-and-subtitles)），然后是频道描述。右侧是四个图标按钮：Search（"Search this channel"）、Tasks（"Open Tasks"）、Files（"Open Files"）和 Settings（"Channel details and settings"），最后一个打开频道详情。
2. **时间线**，最新的在底部。
3. **消息输入框**。

时间线和消息输入框旁边，是打开着的 Tasks 分区和 Files 分区（[页面结构](../../patterns/page-structure.md#sidebar-and-side-panel)）。

```example
conversation-panel/compositions/conversation-panel
```

## 规则 {#rules}

- 频道的图标用 `hash`，私有频道用 `lock`，联合频道用 `git-branch`，在公开页面上可读的频道用带地球的井号。同一个图标出现在标题栏的位置图块里（27px，手机上也是），也出现在侧栏和主页里那一行 19px 的图标框里。
- 推入页面的标题按它显示的内容来写：频道带位置图块，私信带对方的头像，消息列不带图标。
- 让标题栏的 Search 按钮只搜索这个频道，打开一个推入页面，页面顶部是搜索框，没有位置图块，并写明搜索范围：In #launch-week。从那里搜索全部内容会切换到搜索标签，带着同样的查询（[导航](../../patterns/navigation.md#search-on-a-phone)）。

### 频道详情 {#the-channel-details}

- 从 Settings 按钮以右侧抽屉的形式打开详情（[Raft Chat](./README.md#overlays)）。它的关闭方式同[导航](../../patterns/navigation.md#closing)。
- 顶部放频道名、可见性（Public、Private 或 Joint）和描述。然后是成员，显示为一排头像加一个添加图块，点击后在抽屉里打开成员列表；再往下是频道的设置、偏好（静音、折叠长消息）、Stop All Agents 和 Leave Channel。
- 有人在有未保存修改时关闭抽屉，询问是保存还是放弃。

### 任务和文件 {#tasks-and-files}

- 把 Tasks（`list-todo`）和 Files（`paperclip`）做成标题栏里的开关（`PanelToggleAction`，[Panel](../../../packages/ui/src/components/panel/panel.md)）：按下时，开关是一张黄色贴纸，它的分区打开。它们的标签随之变成 Close Tasks 和 Close Files。
- 两个开关上都不显示计数：大多数任务是 Agent 自己的事，所以分区是在有人想看时才在那里，而不是来要人注意的东西。
- 用开关或分区的 × 关闭分区；在手机上用 Back。两个都打开时，Tasks 在 Files 上面。
- 哪些分区打开着，按人记住，而不是按频道：分区跟着人从一个频道到另一个频道，和消息列那一栏一样。
- 私信也有同样的两个开关。
- Tasks 分区按[任务](./tasks.md#a-channels-tasks-section)里的描述显示。
- Files 分区显示频道里发过的文件列表；文件在预览里打开。

### 频道里的消息输入框 {#the-composer-in-a-channel}

- 把 Attach media 和 Attach file 放在工具栏左侧。消息输入框没有 As Task：人们发送的是消息，任务从消息创建（[对话中的任务](#tasks-in-the-conversation)）。
- @ 建议分成 "In this channel"、"Not in this channel"、Computers 和 Apps 几组（[对话](../../patterns/conversation.md#mentions)）。

### 对话中的任务 {#tasks-in-the-conversation}

时间线里的任务遵循[任务](../../patterns/tasks.md#tasks-in-a-conversation)。

- 创建任务：用 Tasks 分区里的 +，创建一个不关联消息的频道任务；或者用消息菜单里的 Create Task from Message。Create Task from Message 打开 Create Task，引用这条消息，并把消息的文字作为初始标题；在那里创建的每个任务都链接到这条消息，一条消息可以有多个任务。
- 从消息创建的任务显示在消息下面，也显示在消息列顶部那条消息的下面。
- 在任务详情或 Tasks 页面上修改任务状态，不从消息菜单修改。

### 消息列 {#threads}

- 在消息列标题栏的右侧，先在关注者的头像堆旁边放 "2 Agents following"，然后是一个菜单（Focus Mode、Search in Thread、View in Channel、Mark as Unread、Unfollow Thread；人没有关注的消息列是 Follow Thread，没有 Mark as Unread），宽屏上最后还有 ×。
- 在消息列里，每条消息的菜单都有 Mark Thread as Unread，排在 Unfollow Thread 后面：它写 "Thread"，是因为这是一条消息的菜单，而它标记的是整个消息列，不是从这条消息开始。这两项都是消息列在动态里那一行的操作，用同一个 `message-square-dot` 图标：消息列在它的频道里和动态里都显示为未读。人还在这个消息列里，所以它保持打开，一直是未读，直到人离开它，和人在一个标为未读的频道里时一样。在动态的详情栏里，在消息列里做操作就会把它标为已读，和点选它的行一样。人没有关注的消息列两项都没有，和它在动态里的行一样：取消关注一个消息列会立即清掉它的未读。

### 套餐时间范围之外的历史 {#history-behind-the-plans-window}

Free 服务器只显示频道、私信、消息列和任务对话最近 30 天的内容。在显示出来的历史开始的地方，会话用历史付费墙代替历史说明（[MessageList](../../../packages/ui/src/components/message-list/message-list.md#rules)）。

- 在最早加载的消息原本所在的位置放一张和消息行一样宽的 [Card](../../../packages/ui/src/components/card/card.md)：`CardLeading` 里放 20px 的 `History`（不用锁：锁表示私有频道），标题说清楚隐藏了多少条、在哪里（"6 earlier messages are older than 30 days"、"All 13 messages in this channel…"、"The first message and 3 replies…"），一行说明 Free 显示什么、Pro 能恢复什么，再加一个 `primary` 小号的 Upgrade to Pro 按钮。所有角色点按钮都打开升级弹窗，由弹窗决定谁付款、谁去请所有者。
- 卡片上方用消息行显示最新的两条被隐藏消息：发送者、时间和前 40 个字，最多两行，越往上越淡。它们不能交互。只显示聊天消息；只有系统消息被隐藏时，只出卡片。如果消息列开头的消息也被隐藏，它排在最前面。
- 卡片下面的第一条日期线写成 "Last 30 days · Tuesday, October 20"。消息列没有日期线，就单独加一条 "Last 30 days"。
- 所有消息都被隐藏时，把预览和卡片放在输入框上方，也就是最新消息原本所在的位置，下面用 `MessageListNotice` `muted` 写 "No new messages in the last 30 days"。输入框照常可用，新消息出现在卡片下面。
- 链接或搜索打开一条超过 30 天的消息时，停在卡片处，以那条消息为中心：它均匀变浅，显示前 80 个字，上下更淡的相邻消息分别往上、往下淡出，标题写 "The message you're looking for is older than 30 days"。
- 升级以后卡片消失，更早的消息在上方加载出来，不用刷新。

