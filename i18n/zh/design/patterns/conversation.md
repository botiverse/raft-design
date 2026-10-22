---
title: 对话
summary: 消息和事件行组成的时间线，一条消息能放什么，消息的操作、提及、消息输入框、消息列，以及对话中的搜索。
sourceHash: c2c20a7b
---

# 对话

一段对话是一条时间线，由消息、事件行和日期组成，最新的在最下面。人和 Agent 发的是同一种消息，因为在 Raft 里他们在同一个地方做同样的工作；区分 Agent 靠头像，而不是另一种消息。

## 适用范围 {#when-it-applies}

所有人和 Agent 交谈的地方：频道、私信、消息列、任务的讨论。消息本身见 [MessageItem](../../packages/ui/src/components/message-item/message-item.md)。一个产品有哪些地方、它们的标题栏里放什么，写在产品自己的页面上（[Raft Chat — 频道](../products/raft-chat/channel.md)）。

## 结构 {#structure}

```example
conversation-panel/compositions/conversation-panel
```

- 时间线：消息、事件行（[SystemMessage](../../packages/ui/src/components/system-message/system-message.md)）和日期行，最新的在最下面。
- 消息里面：提及、引用标签片、蓝色链接、行内代码、代码块、引用、附件和操作卡片。
- 消息下面：先是从它创建的任务列表（[任务](./tasks.md#tasks-in-a-conversation)），然后是一行，放收藏标记和回应；再下面是消息列的回复，最多预览 3 条（[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)）。
- 最底部：[Composer](../../packages/ui/src/components/composer/composer.md)，工具栏左侧是附件按钮，右侧是发送按钮。

## 规则 {#rules}

### 日期和分组 {#dates-and-grouping}

- 在时间线的第一条消息前、每个新的一天的第一条消息前放一条日期行：Today、Yesterday，或星期和日期。
- 同一天里同一个发送者的连续消息合并，不限时间间隔：一个发送者连着发的消息读起来就是一轮发言。
- 带任务或消息列的消息不合并，事件行也不合并进消息。
- 一个人的助手替他发的消息，当作另一个发送者：它不合并进这个人自己的消息，这个人的消息也不合并进它。一组消息只有第一行显示头像和名字行，所以一条消息如果合并在这个人自己的标题下，看起来就像是他本人写的。同一个助手替同一个人连续发的消息照常合并，每条续接的消息末尾都写 "(sent by Friday)"（[身份与在线状态](../people-and-agents/identity-and-presence.md#sent-by-an-assistant)）。
- 消息的时间紧跟在发送者后面，不要放到这一行的另一端：谁说的和什么时候说的要连在一起读（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。
- 悬停时，在合并消息左侧的空白处显示它的时间，不加动画。
- 在触屏上，合并消息静止时不显示时间：每条消息旁都有时间，会重复标题里的信息，让列表显得杂乱；而且点按一条消息已经有别的用途。改由消息菜单显示时间（见[操作](#actions)）。
- 连续 2 条或更多事件行折叠成一行，带一个展开控件（"There are 3 task updates"），免得一个忙碌的 Agent 把消息挤出视野。

### 提及 {#mentions}

- 提及别人时用墨色粗体，只在悬停时加墨色下划线，和所有可点击的文字一样（[可点击的文字](../foundations/states.md#clickable-text)）。
- 提及正在阅读的这个人时，显示为一张黄色小贴纸：黄色是「你」（[颜色](../foundations/color.md#meanings-of-color)）。
- @ 建议按是否在这个地方分组：在的排前面，人和 Agent 混在一起；然后是不在的，变暗显示。在消息列里，回复过的人排在最前。
- 一条消息提及了不在这个地方的人之后，在消息输入框上方的一条提示栏里提供添加或通知他们的选项。否则这个提及谁也收不到，而且没有任何东西会告诉你。

### 操作 {#actions}

- 在桌面端，在悬停消息的上边缘显示一个小工具栏：Reply in Thread、Add Reaction、Save Message。在消息列里，去掉 Reply in Thread。
- 其他所有操作都放在消息菜单里。桌面端右键、触屏上长按打开的是同一个菜单，所以每个操作在每种设备上都只在一个地方。
- 菜单顶部是这条消息的完整日期和时间，作为一个不能选的标签：在触屏上，这是合并消息的时间唯一显示的地方；完整日期也能说清一个很长的消息组跨了哪几天。方向键会跳过它。
- 它下面第一行是快捷回应，回应和操作之间有一条分隔线。
- 触屏上不显示悬停工具栏：没有悬停，而且长按会打开菜单。
- 悬停从不让消息移动：工具栏浮在这一行的右上角，标题栏不给它留位置，也不重新排版。在窄栏里，工具栏出现时，长发送者行的末尾在它下面淡出；平时整行都在（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。
- 要对多条消息操作（转发、复制），在菜单里选 Select Message；选中消息的工具栏出现在对话底部（[用现有部件搭建](../components/overview.md#toolbar-for-selected-messages)）。

```example
message-item/compositions/context-menu-showcase
```

### 消息输入框 {#the-composer}

- 发送按钮是对话里唯一的粉色按钮：发送正是这个屏幕存在的目的（[颜色](../foundations/color.md#meanings-of-color)）。
- 占位文字里写出这个地方的名字："Message #launch-week"、"Message @Martin"。
- 竖握的触屏上，Return 插入新行，用发送按钮发送，因为没有 Shift 键可按。其他情况下，Return 发送，Shift+Return 插入新行。
- 创建任务不放在消息输入框里：在有任务的产品里，任务是在消息发出之后从消息创建的（[任务](./tasks.md#tasks-in-a-conversation)）。

### 消息列 {#threads}

```example
thread-panel/thread-panel
```

- 消息列在侧面板中打开（[ThreadPanel](../../packages/ui/src/components/thread-panel/thread-panel.md)），这样它所属的对话还留在视野里。根据宽度，它放在对话旁边或盖住对话（[响应式布局](./responsive.md)）；在手机上它总是盖住对话，带 Back。
- 标题写 Thread，副标题是地方和回复数："#launch-week · 4 replies"。选中标题会滚动到消息列顶部。
- 最上面是消息列开始的那条消息，然后是回复，然后是消息输入框。消息列没有标签页。
- 当这个人不在消息列所属的地方时，把消息输入框换成一个粉色的 Join 按钮（Raft Chat 里是 "Join channel to reply"），这样不能回复的原因同时也是解决的办法。
- 关注这个消息列的 Agent 放在标题栏右侧，显示为一叠头像和一个数字。
- Follow Thread 和 Unfollow Thread 放在消息列标题栏右侧的 More 菜单里，不单独做一个开关：关注是一个命令，不是一项设置。任务详情把 Follow Task 放在同样的位置（[任务](./tasks.md)），所以两者的关注方式一样。

### 浮动控件 {#floating-controls}

有三种控件浮在对话上方：列表上的跳转胶囊（Back to Bottom、"3 New Messages"、"Next Unread Thread (3)"，[MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)），消息上的悬停工具栏，以及选中文字上方的工具栏（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。它们是一家，共用一套尺寸：标签用 `text-control`、字重 700（手机上 13/18，桌面端 14/22），图标 16px，控件 32px。胶囊从一边到另一边是 32px，和普通按钮（比如设置行里的 Save）一样大（[Button](../../packages/ui/src/components/button/button.md#sizes)）；工具栏的按钮是 28px，放在 36px 的工具栏里。

- 单个操作用 `outline`、`md` 的 Button：也就是跳转胶囊。它单独存在，所以靠自己的墨色边表明是控件；它按 Button 的配方搭建，所以不会和 Raft 其他地方的按钮走样。
- 针对一条消息或一处选区的一组操作用工具栏：28px 的按钮，距外框 4px，彼此间隔 4px，所以工具栏高 36px，用 `layer-popover`，带一圈接缝线和柔和阴影。它是浮在所作用内容上方的弹出层，悬停或选中时出现（[层级](../foundations/elevation.md#tokens)）；外框就是边，所以里面的按钮没有自己的边，而且按 28px 算，三个按钮能放在发送者那一行上而不盖住它。
- 不要给胶囊加工具栏的外框或阴影，也不要把工具栏的按钮做成 Button：胶囊是在列表滚动时留在原处的控件；工具栏随下面的内容出现和消失。

### 搜索 {#search}

- 结果按类型分组：地方和人在前，然后是消息。同一个消息列里的命中归到那个消息列下。
- 匹配的词显示为黄色小贴纸（[Search](../../packages/ui/src/components/search/search.md)）。
- 结果跳转到的那条消息，按[导航](./navigation.md#going-somewhere)里的方式高亮。

## 相关 {#related}

- [交接与审批](../people-and-agents/handoffs-and-approvals.md)：事件行、状态和操作卡片。
- [导航](./navigation.md)：引用标签片和链接。
- [评论](./comments.md)：文档上的评论，放在它所说的那段文字旁边；它们不是消息。
- [用现有部件搭建](../components/overview.md#built-from-existing-parts)：链接卡片、转发的消息、翻译和多选。
