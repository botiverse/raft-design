---
title: Raft Chat — 频道
summary: 一个频道：它的标题栏和详情，它的 Tasks 和 Files 卡片，它的消息输入框，在频道里怎样建任务，以及它的消息列。
sourceHash: bdcad1d2
---

# Raft Chat — 频道

频道是人和 Agent 共用一条时间线的地方，底部是消息输入框。在手机上它是一个推入页面；在桌面端它占满主区域。它的任务和文件以卡片的形式打开在时间线旁边，让人们在聊天时也能看到。时间线、消息、消息输入框和消息列遵循[对话](../../patterns/conversation.md)；这一页只写 Raft Chat 的频道额外加了什么。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelHeader`）：位置图块、频道名和副标题；手机上前面还有返回。副标题先是工作状态行（[正在工作的 Agent](../../people-and-agents/working-agents.md#rows-and-subtitles)），然后是频道描述。右侧是四个图标按钮：Search（"Search this channel"）、Tasks（"Open Tasks"）、Files（"Open Files"）和 Settings（"Channel details and settings"），最后一个打开频道详情。
2. **时间线**，最新的在底部。
3. **消息输入框**。

时间线和消息输入框旁边，是打开着的 Tasks 卡片和 Files 卡片（[页面结构](../../patterns/page-structure.md#sidebar-and-side-panel)）。

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

- 把 Tasks（`list-todo`）和 Files（`paperclip`）做成标题栏里的开关（`PanelToggleAction`，[Panel](../../../packages/ui/src/components/panel/panel.md)）：按下时，开关是一张黄色贴纸，它的卡片打开。它们的标签随之变成 Close Tasks 和 Close Files。
- 两个开关上都不显示计数：大多数任务是 Agent 自己的事，所以卡片是在有人想看时才在那里，而不是来要人注意的东西。
- 用开关或卡片的 × 关闭卡片；在手机上用 Back。两张都打开时，Tasks 在 Files 上面。
- 哪些卡片打开着，按人记住，而不是按频道：卡片跟着人从一个频道到另一个频道，和消息列那一栏一样。
- 私信也有同样的两个开关。
- Tasks 卡片按[任务](./tasks.md#a-channels-tasks-card)里的描述显示。
- Files 卡片显示频道里发过的文件列表；文件在预览里打开。

### 频道里的消息输入框 {#the-composer-in-a-channel}

- 把 Attach media 和 Attach file 放在工具栏左侧。消息输入框没有 As Task：人们发送的是消息，任务从消息创建（[对话中的任务](#tasks-in-the-conversation)）。
- @ 建议分成 "In this channel"、"Not in this channel"、Computers 和 Apps 几组（[对话](../../patterns/conversation.md#mentions)）。

### 对话中的任务 {#tasks-in-the-conversation}

时间线里的任务遵循[任务](../../patterns/tasks.md#tasks-in-a-conversation)。

- 创建任务：用 Tasks 卡片里的 +，创建一个不关联消息的频道任务；或者用消息菜单里的 Create Task from Message。Create Task from Message 打开 Create Task，引用这条消息，并把消息的文字作为初始标题；在那里创建的每个任务都链接到这条消息，一条消息可以有多个任务。
- 从消息创建的任务显示在消息下面，也显示在消息列顶部那条消息的下面。
- 在任务详情或 Tasks 页面上修改任务状态，不从消息菜单修改。

### 消息列 {#threads}

- 在消息列标题栏的右侧，先在关注者的头像堆旁边放 "2 Agents following"，然后是一个菜单（Focus mode、Search in thread、View in channel、Follow Thread），宽屏上最后还有 ×。
