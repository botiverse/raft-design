---
title: Raft Chat — 频道
summary: 一个频道：它的标题栏和详情，它的 Chat、Tasks 和 Files 标签页，它的消息输入框，在频道里怎样建任务，以及它的消息列。
sourceHash: 9c942de7
---

# Raft Chat — 频道

频道是人和 Agent 共用一条时间线的地方，底部是消息输入框。在手机上它是一个推入页面；在桌面端它占满主区域。它的聊天、任务和文件是同一个地方的三个标签页。时间线、消息、消息输入框和消息列遵循[对话](../../patterns/conversation.md)；这一页只写 Raft Chat 的频道额外加了什么。

## 结构 {#structure}

从上到下：

1. **标题栏**（`PanelHeader`）：位置图块、频道名和副标题；手机上前面还有返回。副标题先是工作状态行（[正在工作的 Agent](../../people-and-agents/working-agents.md#rows-and-subtitles)），然后是频道描述。右侧是两个图标按钮：Search（"Search this channel"）和 Settings（"Channel details and settings"），后者打开频道详情。
2. **Chat / Tasks / Files**：标签页，图标分别是 `message-square`、`list-todo` 和 `paperclip`。
3. **时间线**，最新的在底部。
4. **消息输入框**。

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

### 聊天、任务和文件 {#chat-tasks-and-files}

- 三个标签页遵循[导航](../../patterns/navigation.md#several-views-of-one-place)：人们调整过的顺序在每个频道里都保持。
- Tasks 标签页按[任务](./tasks.md#a-channels-tasks-tab)里的描述显示。
- Files 标签页显示频道里发过的文件列表；文件在预览里打开。

### 频道里的消息输入框 {#the-composer-in-a-channel}

- 把 Attach media 和 Attach file 放在工具栏左侧。即使没有勾选 As Task，⌘ 或 Ctrl + Shift + Enter 也会以任务的形式发送。
- @ 建议分成 "In this channel"、"Not in this channel"、Computers 和 Apps 几组（[对话](../../patterns/conversation.md#mentions)）。

### 对话中的任务 {#tasks-in-the-conversation}

时间线里的任务遵循[任务](../../patterns/tasks.md#tasks-in-a-conversation)。

- 用消息输入框里的 As Task、消息菜单里的 Convert to Task，或频道 Tasks 标签页里的 Create Task 来创建任务。
- 让人们可以从消息菜单把任务标为完成，也可以重新打开。

### 消息列 {#threads}

- 在消息列标题栏的右侧，先在关注者的头像堆旁边放 "2 Agents following"，然后是一个菜单（Focus mode、Search in thread、View in channel、Follow Thread），宽屏上最后还有 ×。
