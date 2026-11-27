---
title: 对话
summary: 消息和事件行组成的时间线，一条消息能放什么，消息的操作、提及、消息输入框、消息列，以及对话中的搜索。
sourceHash: 2637e26d
---

# 对话

一段对话是一条时间线，由消息、事件行和日期组成，最新的在最下面。人和 Agent 发的是同一种消息，因为在 Raft 里他们在同一个地方做同样的工作；区分 Agent 靠头像，而不是另一种消息。

## 适用范围 {#when-it-applies}

所有人和 Agent 交谈的地方：频道、私信、消息列、任务的讨论。消息本身见 [MessageItem](../../packages/ui/src/components/message-item/message-item.md)。一个产品有哪些地方、它们的标题栏里放什么，写在产品自己的页面上（[Raft Chat — 频道](../products/raft-chat/channel.md)）。

## 结构 {#structure}

```example
conversation-panel/compositions/conversation-panel
```

- 顶部，在标题栏和任何 `PanelNotice` 之下：这个地方留给每个人读的内容，比如频道的公告，显示为纸面上的一条横条，下方一条接缝线。它是内容，所以从不用提示的色调或图标，它指向的东西在侧边列里打开。另一个产品要把页面固定到某个地方时，也做同样的选择（[Raft Chat — 频道](../products/raft-chat/channel.md#the-announcement)）。
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
- 消息的时间紧跟在发送者后面，不要放到这一行的另一端：谁说的和什么时候说的要连在一起读（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。唯一的例外是下面触屏上的时间展开，它只在手指按住列表时出现。
- 悬停时，在合并消息左侧的空白处显示它的时间，不加动画。
- 在触屏上，合并消息静止时不显示时间：每条消息旁都有时间，会重复标题里的信息，让列表显得杂乱；而且点按一条消息已经有别的用途。要看它的时间，就把对话向左拖（见下）。
- 在触屏上，把对话向左拖，就露出每条消息的时间，和 iMessage 一样（artin，2026-11-04，#triage:530f8c36）。所有消息行一起向左滑，头像可以滑出屏幕。每条消息的时间等在它这一行原本右边缘外 20px 处，随着这一行向左滑而露出来：合并消息所用格式的小时和分钟，按这个人的 12 小时或 24 小时设置（6:35、18:35），用 `text-mono-meta` 和 `foreground-hint`。这些行跟着手指走，松手后弹回。开启减弱动态效果时什么都不滑动，改为每条合并消息的时间在它左侧空着的位置淡入，也就是悬停时显示时间的地方，所以不会盖住文字。具体的距离和时长见[动效](../foundations/motion.md#usage)。在这种情况下，把时间放到发送者所在行的另一端是对的：它只在手指按住时出现，而且把所有时间排成一列，想知道某条消息何时发出的人要的正是一眼扫过这一列。所有触屏都有，平板也包括在内；鼠标和触控板保留悬停时显示的时间。它接手哪些拖动、不碰哪些，见[触屏](./responsive.md#touch-screens)。
- 对读屏软件隐藏展开的时间：每条消息本来就是一个以发送者和时间命名的 article，合并消息以它的时间命名（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#accessibility)）。在触屏上，不能拖动的人没有别的办法看到合并消息自己的时间；这个缺口是已知的，目前有意保留（[无障碍](../foundations/accessibility.md#touch)）。
- 不要给消息加它自己的滑动手势，回复或别的都不要：向左拖归对话，用来看时间；同一个横向拖动有两种意思，每次拖动就都成了猜测。
- 连续 2 条或更多事件行折叠成一行，带一个展开控件（"There are 3 task updates"），免得一个忙碌的 Agent 把消息挤出视野。

### 提及 {#mentions}

- 提及别人时用墨色粗体，只在悬停时加墨色下划线，和所有可点击的文字一样（[可点击的文字](../foundations/states.md#clickable-text)）。
- 提及正在阅读的这个人时，显示为一张黄色小贴纸：黄色是「你」（[颜色](../foundations/color.md#meanings-of-color)）。
- @ 建议按是否在这个地方分组：在的排前面，人和 Agent 混在一起；然后是不在的，变暗显示。在消息列里，回复过的人排在最前。
- 一条消息提及了不在这个地方的人之后，在消息输入框上方的一条提示栏里提供添加或通知他们的选项。否则这个提及谁也收不到，而且没有任何东西会告诉你。

### 操作 {#actions}

- 在桌面端，在悬停消息的上边缘显示一个小工具栏：快捷回应、Reply in thread、Forward、Save message 和 More actions（⋯），后者打开消息的菜单。在消息列里，去掉 Reply in thread。
- 工具栏上的回应按钮是一个快捷方式：它显示这个人最常用的 emoji（还没有时是 👍），点一下就加上这个回应，已经回应过则取消。指针在它上面停留 500ms，会打开完整的 emoji 选择器。用键盘时，Enter 或 Space 回应，选择器从 More actions 打开，用菜单快捷回应末尾的 +，因为停留需要指针。触屏不显示悬停工具栏，所以保留它自己的方式：双击打开快捷回应，长按打开菜单（Cindy，2026-11-10，来自用户反馈：点个赞要点两下）。按钮显示的就是 emoji 本身，所以它显示什么，点一下就做什么。每次工具栏出现时选定 emoji，显示期间不变，所以按钮从不在正要点下去的指针下面变掉，刚给出的回应从下一次出现的工具栏起才计入（Cindy，2026-11-10）。目前按设备计数，所以在计数存到服务器上之前，同一个人在另一台设备上可能看到不同的 emoji（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#accessibility)）。
- 其他所有操作都放在消息菜单里。桌面端右键、触屏上长按打开的是同一个菜单，所以每个操作在每种设备上都只在一个地方。
- 消息里有自己菜单的对象，比如 Artifact 卡片或应用的链接卡片，右键时给出它自己的那个菜单。它和对象的 ⋯ 是同一个菜单，也和它出现在别处时的菜单相同。人右键的是自己指着的东西（xxchan，2026-11-22，#proj-workspace:f6ba94df）。
- 在消息的其他任何地方右键，包括它的文字、选中的文字和行内链接，都打开消息菜单；工具栏的 More actions 在任何地方都打开消息菜单。
- 在触屏上，长按打开消息菜单，在对象上也是：在触屏上只有这一个办法进入消息菜单，而一条消息可能整条都是对象。对象的操作留在它的 ⋯ 上。
- 选择消息期间，对象不打开自己的菜单：点击或轻点它会切换这条消息的选中状态。
- 菜单第一行是快捷回应，回应和操作之间有一条分隔线。菜单里没有日期和时间那一行（artin，2026-11-04，#triage:530f8c36）。
- 触屏上不显示悬停工具栏：没有悬停，而且长按会打开菜单。
- 在触屏上，轻点消息会打开它的消息列，双击会以一条栏的形式打开快捷回应（[触屏上的轻点](../foundations/states.md#taps-on-a-touch-screen)）。在消息列里，轻点不做任何事；双击和菜单照旧。在桌面端，点击或双击消息都不做任何事（双击会选中一个词）：打开消息列的是工具栏和回复数。由 stdrc 于 2026-10-29 决定：Slack 和 Raft 的手机网页本来就是轻点打开消息列，而在 Telegram、iMessage 和 Messenger 里，双击表示「回应」；双击打开那条栏而不是直接回应，误触的双击就不会发出任何东西。选择消息期间，轻点或点击一条消息会切换它的选中状态，而不是打开消息列（[选中多项时的工具栏](../components/overview.md#toolbar-for-selected-items)）。
- 悬停从不让消息移动：工具栏浮在这一行的右上角，标题栏不给它留位置，也不重新排版。在窄栏里，工具栏出现时，长发送者行的末尾在它下面淡出；平时整行都在（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。
- 要对多条消息操作（转发、复制），在菜单里选 Select message；选中多项时的工具栏出现在对话底部（[用现有部件搭建](../components/overview.md#toolbar-for-selected-items)）。

```example
message-item/compositions/context-menu-showcase
```

### 消息输入框 {#the-composer}

- 发送按钮是对话里唯一的粉色按钮：发送正是这个屏幕存在的目的（[颜色](../foundations/color.md#meanings-of-color)）。
- 占位文字里写出这个地方的名字："Message #launch-week"、"Message @Martin"。
- 竖握的触屏上，Return 插入新行，用发送按钮发送，因为没有 Shift 键可按。其他情况下，Return 发送，Shift+Return 插入新行。
- 在有任务的产品里，在一个地方的对话的消息输入框里提供 As task，消息列的消息输入框里从不提供：任务是通过发送消息创建的，这条消息仍是一条普通消息，任务在它下面（[消息输入框里的 As task](./tasks.md#as-task-in-the-composer)）。
- 把引用的另一条消息显示成一个标签片，放在文字上方或段落之间（[消息输入框和消息里的引用](#quotes-in-the-composer-and-the-message)）。

### 消息输入框和消息里的引用 {#quotes-in-the-composer-and-the-message}

人回复一条消息，或回复其中选中的一段，是把它引用进消息输入框；一条回复最多可以有 10 条引用，放在开头或段落之间。在消息输入框里和发出的消息里，每条引用都是同一种标签片。由产品负责人（cindyz）于 2026-11-22 从三个方向（轻量的条、标签片、浅色底的块）中决定。

- 每条引用都画成一个标签片：`fill-muted` 的标签片（`radius-chip`），被引用作者的头像（`3xs`，[Avatar](../../packages/ui/src/components/avatar/avatar.md#sizes)），半粗体的作者名，然后是一行引用内容，用省略号截断。标签片很紧凑：10 条引用在桌面端大约占 320px，所以很长的回复也很少需要滚动消息输入框。
- 开头放作者的头像，而不是引号：头像是大家熟悉的回复预览，一眼就能看出引用的是谁，还能把引用和提及、引用标签片区分开，它们都没有头像。
- 只在确定作者是谁时显示头像：被引用消息的发送者，或者唯一叫这个名字的 Agent 或人。没有谁叫这个名字、或者有几个都叫这个名字时，不显示头像，不要去猜：放错的脸会把话安到别人头上。
- 开头和段落之间用同一种标签片，文字里的引用不用描边或更浅的变体：第二种样式会被读成第二种东西。
- 引用的一段以「…」开头：这样一段文字读起来就和整条消息不同。
- 标签片的文字用 `text-footnote`，比人输入的文字小一档，颜色用 `foreground-muted`：引用是为回复服务的，从不和它争夺注意力。`foreground-muted` 在两种模式下，在 `fill-muted` 和它的悬停填充上都保持 4.5:1（[对比度](../foundations/accessibility.md#contrast)）。
- 悬停时标签片加深一档（`fill-strong`）。桌面端用鼠标时标签片高 26px，手机和触屏上 30px。
- 在桌面端，标签片和它的内容一样宽，最宽 360px。在手机上，每个标签片都占满消息输入框或消息所在那一栏的整个宽度，这样每条引用的 × 都在右边对齐成一列。
- 在消息输入框里，把 × 放在标签片里面的末端，一直显示，从不只在悬停时显示：手机没有悬停，藏起来的 × 只有已经知道它的人才找得到。它自己是一个键盘停靠点。两条引用前后相接时，Reply below（在它们之间开一个段落）放在标签片里 × 的前面，所以 × 仍然对齐。在触屏上，两者各有一个 44px 高的点击区域，× 的偏向标签片的末端，Reply below 的偏向文字，所以两者从不共用一个点击区域（[点击区域](../foundations/accessibility.md#hit-targets)）。
- 在消息输入框里，按标签片的其余部分会跳到被引用的消息。
- 在紧挨着引用下面的文字开头按 Backspace，先让这条引用进入待删除状态，再按一次 Backspace 才删除它：待删除的标签片用 `danger-soft`，带 `danger-strong` 的圈，后面跟着 "Press Backspace again to remove"（中文界面为「再按 Backspace 删除」），桌面端在标签片旁边，手机上在它下面。
- 让每条引用对读屏软件来说是一个分组，名称为 "Quote from {author}: {excerpt}"（中文界面为「引用 {author}：{excerpt}」），里面是它的控件（跳到消息、×、Reply below）。
- 在发出的消息里，在引用位于文字中的位置显示同样的标签片，不带 ×；按它会跳到被引用的消息，和在消息输入框里一样；引用的是一段时，那段文字在那里高亮，读者打不开的消息会用一条轻提示说明。不要原地展开标签片，也不要在它下面加一块：只有一个操作，在两处都一样。把它命名为 "Quote from {author}: {excerpt}"，并说明它会跳到那条消息。时间线保持紧凑，和作者写的时候看到的一样；代价是读者只看到引用的第一行，其余的要跳到那条消息去看。
- 只改变引用的样子。消息的文字照原样保留引用，Agent 读的就是这些文字。

raft-ui 还没有引用标签片：Raft 网页版用 token 和 [Avatar](../../packages/ui/src/components/avatar/avatar.md) 拼出它。raft-ui 里共用的 `QuoteChip` 是后续工作。

### 消息列 {#threads}

```example
thread-panel/thread-panel
```

- 消息列在侧面板中打开（[ThreadPanel](../../packages/ui/src/components/thread-panel/thread-panel.md)），这样它所属的对话还留在视野里。根据空间，它放在对话旁边或叠到对话上（[响应式布局](./responsive.md#the-channels-side-columns)）；在手机上它总是盖住对话，带 Back。
- 标题写 Thread，副标题是地方和回复数："#launch-week · 4 replies"。选中标题会滚动到消息列顶部。
- 原消息滚出视野后，把它放进标题：发送人和第一行，"Juno: Can we ship the new header on Friday?"，一行，放不下用省略号截断。滚回原消息，标题换回 Thread。没有文字的消息写它带的东西（"Juno: Image"、"Juno: File"）。只换文字：头部高度和副标题都不变，所以地方一直写着；标题淡入淡出，系统要求减少动效时直接换。2026-11-17 定（stdrc）：在头部下面再吸一条显示原消息，会在最缺高度的手机上多占一行，还盖住回复；标题本来就说明了在哪里，滚走以后要被点名的是那条消息。任务的对话对它的头部也这样做：头部像原消息一样滚走，之后由栏写出任务的标题和状态（[把任务头部拉下来](./tasks.md#pulling-the-task-head-down)）。
- 选中 Thread，消息列滚回原消息。标题写出原消息以后，它末尾有一个小箭头，每个消息列都有；这时选中它，不再滚动，而是把原消息（最多 3 行）和它的任务从标题下拉出来，盖在回复上，和任务的栏拉下任务头部一样，用同一个面板、同样的收起方式（[把任务头部拉下来](./tasks.md#pulling-the-task-head-down)）；什么都不滚动，读到的位置不丢。点其中一行就打开那个任务。面板最后是“跳到这条消息”，它收起面板并滚回原消息；没有任务的消息列在面板里写明（“这条消息还没有任务”）。2026-11-27 定（artin，#triage:#659，Jacky 的反馈：长消息列里，人要知道它带出了哪些任务、各自到哪一步、哪个在等自己，又不想滑到顶、丢掉读到的位置）。到原消息所在的地方去，用副标题里的地方名和头部菜单里的 View in channel：两个都打开那个地方，滚到原消息并高亮。在单独的窗口里，地方就在这个窗口里打开；在专注布局里先恢复正常布局。
- 标题的无障碍名称跟着看得见的字走，前面加上 Thread（"Thread: Juno: Can we ship the new header on Friday?"），这样用语音操作的人说出看到的字就能点到它（WCAG 2.5.3）。头部不要做成 live region：名称变了，只有焦点在它上面才会播报，而滚动时焦点在回复里。
- 原消息已删除时，标题保持 Thread；无障碍名称是 "Thread: original message deleted"，地方名和 View in channel 都只打开那个地方。这个人看不到那个地方时（他不在的私密频道），地方名是不能选的普通文字，菜单里没有 View in channel，无障碍名称是 "Thread: can't view the original message"：打不开的东西不给入口。超出套餐时间范围的原消息两种都不算：标题照常写出它，地方名打开那个地方，停在历史付费墙（[Raft Chat — 频道](../products/raft-chat/channel.md#history-behind-the-plans-window)）。
- 标题写出原消息、而它有任务时，副标题在回复数后面加上任务摘要，只写适用的部分：还没完成或关闭的任务数，"#ops · 48 条回复 · 2 个任务 · 1 个等你"；都完成了写“任务都已完成”；等你的数用 `attention-strong`（分配给你、状态是待办、进行中或待确认的任务，和 Activity 的“等你”相同；[Raft Chat](../products/raft-chat/README.md#the-bell-and-activity)）。头部窄于 32rem 时（消息列在对话旁边），标题和副标题像手机上一样分两行，摘要才放得下；头部高度不变。
- 最上面是消息列开始的那条消息，然后是回复，然后是消息输入框。消息列没有标签页。在它下面、以及标题拉下的面板里，只要还有没完成的任务，已完成和已关闭的就折成一行，放在没完成的后面（“2 个已完成”），点开在原处展开：人回到一个消息列，要看的是还剩什么没做。
- 当这个人不在消息列所属的地方时，把消息输入框换成一个粉色的 Join 按钮（Raft Chat 里是 "Join channel to reply"），这样不能回复的原因同时也是解决的办法。
- 关注这个消息列的 Agent 放在标题栏右侧，显示为一叠头像和一个数字。
- Follow thread 和 Unfollow thread 放在消息列标题栏右侧的 More 菜单里，不单独做一个开关：关注是一个命令，不是一项设置。任务详情把 Follow task 放在同样的位置（[任务](./tasks.md)），所以两者的关注方式一样。

### 谁读过 {#who-has-read-it}

在频道或消息列里，每个 Agent 的脸停在它读过的最后一条消息上，位于那条消息最后一行的行尾（[MessageItemTrailing](../../packages/ui/src/components/message-item/message-item.md#trailing)）。这些脸说明谁读了什么：脸在你的消息上的 Agent 已经读过它，脸在它上方的 Agent 还没读到，而回复会作为一条消息出现。

- 脸原地变化，不加动画。Agent 往下读时，它的脸在同一帧里离开原来那条消息、出现在读到的那条消息上：不在两者之间滑动，不淡入淡出，也不改变大小；没有离开的脸在这一行里换了位置时，立即到位，不移动过去。从脸离开的那一行滑过来，读起来像一次奇怪的跳动，几个 Agent 同时往下读时最糟（Artea，2026-11-08，#proj-raft-ui）。
- 不要在你的消息下面加一行文字，重复这些脸（"Kirby read"、"Lagoon replied"）。它只是用文字把脸已经显示的内容又说了一遍（stdrc，2026-11-08，#proj-raft-ui:0c3f4e06）。Agent 正在工作，显示在[正在工作的 Agent](../people-and-agents/working-agents.md) 规定的位置。
- 只为看不到你最新消息的 Agent，在这条消息下面写一行：不再关注这个消息列的（"Stopped following: Kirby"），或者把频道设为静音的（"Muted: Kirby"），并写出怎样找到它：提及它。它的脸说不出这一点，因为脸已经不再移动；而写消息的人在等回复之前需要知道（artin，2026-11-08）。
- 这一行放不下时，先减少名字，减到只剩其余的人数（"Kirby +2"）。一个名字都放不下时，改写总数（"Muted: 4 agents"）：只写 "+4" 读起来是「还有四个」（Kirby，2026-11-08）。状态（"Muted:"）和人数保持完整，因为少了它们，这一行就不再说明发生了什么；只有一个名字都不剩时，才截掉提示（"mention it"）的末尾。完整的句子留在工具提示和无障碍名称里（Remy，2026-11-08，#proj-raft-ui:0c3f4e06）。
- 这一行用 `text-caption` 和 `foreground-hint`，和私信的 Read 那一行一样（两者都是 `MessageReadStatusLine`）：它是一句话，所以用 sans，不用 Space Mono（[字体排印](../foundations/typography.md#usage)）。

### 消息列的时间线 {#a-threads-timeline}

长的消息列里大多是 Agent 在工作，人写的那几条消息，也就是说明这个消息列要做什么的消息，被埋在下面。时间线列出这些消息，让人能找到自己问过什么，再回到那里（Artea，2026-11-06，#proj-raft-ui:#206）。

- 先列出消息列开始的那条消息，不管是谁写的，然后是人在消息列里写的每条消息，最早的在前。不列 Agent 的消息、事件行，以及助手替主人发的消息：时间线是消息列里人的那一面。撤回的消息从时间线上移除。
- 人在消息列里写满四条消息后，才给它时间线。三条或更少，滚动一两屏就能找到，而只有三个刻度的刻度条也说明不了什么（Jasper，2026-11-08）。
- 标出读者所在的位置：视野中最上面那条消息所在的一项，或它之前最近的一项，是当前项。跳转之后，跳到的那条消息一直是当前项，直到它滚出视野。
- 用鼠标时，时间线显示为列表右边缘的一列刻度，每项一个刻度，最高 240px，在列表的高度上居中；它随读者滚动，让当前刻度保持在中间。当前刻度更长，用 `foreground`，读者自己消息的刻度比别人的深。指向刻度条，或用 Tab 移到它上面，会打开一张卡片，每项一行，一行的 [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) 显示它其余的文字。刻度条只给鼠标用：10px 的刻度不是手指能点中的目标，屏幕边缘的一条也会和系统的边缘滑动手势冲突。
- 在每种设备上，都把 Timeline 放在消息列的 More 菜单里，位于 Search 之后。它是时间线唯一在任何地方都能用的入口：触屏没有刻度条，窄于 360px 的消息列也放不下刻度条。
- 从菜单打开的 Timeline，在手机上是底部面板，在更宽的屏幕上是 More 按钮下方的弹出层：这是一个要去的地方（[Drawer](../../packages/ui/src/components/drawer/drawer.md#when-to-use)）。底部面板打开时占半个屏幕，上方仍能看到消息列，可以向上拖到全高，和 iOS 上的底部面板一样。比手机宽时，弹出层在请求它的地方打开，屏幕其余部分仍留在视野里，和 iPadOS 从按钮打开列表时一样；在宽窗口里，iPadOS 把面板显示在中间，而不是从底部升起，只有分屏的窄侧才用底部面板（Artea，2026-11-08，#proj-raft-ui:10ed1ba5）。
- 在列表里，每项先给出它的文字，最多两行，然后是发送者和时间：触屏没有工具提示来显示其余的文字（Artea，2026-11-08）。列表打开时，当前项靠近顶部，这样在半开的底部面板里也能看到它。
- 卡片和列表里的项都按弹出层的项来标示：指针或键盘所在的项用 `brand-soft` 填充，和菜单项一样；当前项像菜单的当前值那样标出，文字用 600 字重，它的刻度变长、用墨色，没有自己的填充（[状态](../foundations/states.md#usage)）。
- 在卡片或列表里选中一项，会跳到那条消息，并按[去往某处](./navigation.md#going-somewhere)里的方式标出它，然后关闭列表。每一项都是链接，所以可以在新标签页里打开。
- 手机布局用于 768px 以下，所以横着拿的手机（844px 宽）得到的是弹出层，而 iOS 这时仍会升起底部面板。很少有人为了看消息列把手机横过来；这仍是一个已知的差异。

### 跟随最新内容 {#following-the-newest}

人们读对话时，对话在底部不断增长；其他最新内容在最下面的时间线也一样，比如 Agent 的动态日志（[Agent 资料](../products/raft-chat/agent-profile.md)）。新来的内容绝不能夺走这个人正在读的东西：曾有一个日志每来一个新步骤就跳回顶部，读者得再滚下去才能看到最新的，网页和应用里都有人报告过（artin，2026-11-09，#triage:44ed2937）。

- 打开时间线时停在最新的条目，除非这个人是来看某个特定条目的，那时打开到这个条目在视野中（[导航](./navigation.md#going-somewhere)）。
- 末尾在视野中时，条目到来也让它留在视野中：时间线跟随最新内容。
- 这个人往上滚动之后，让他正在读的内容留在原处：新条目加在下面，不移动视野里的任何东西。在 Back to bottom 胶囊里用这条时间线自己的词说到了多少条："3 new messages"、"3 new steps"（[MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)）；末尾重新进入视野后，再次跟随。
- 每个条目在更新前后保持是同一个元素，用条目本身作为 key，绝不用它在列表里的位置，这样为了不超过上限而丢掉最旧条目的时间线，不会动到其余的条目，也不会动到读者的位置。根据最新条目的变化来跟随，而不是根据条目数：到达上限后，条目不断到来，数量却保持不变。

### 浮动控件 {#floating-controls}

有三种控件浮在对话上方：列表上的跳转胶囊（Back to bottom、"3 new messages"、"Next unread thread (3)"，[MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)），消息上的悬停工具栏，以及选中文字上方的工具栏（[MessageItem](../../packages/ui/src/components/message-item/message-item.md#behavior)）。它们是一家，共用一套尺寸：标签用 `text-control`、字重 700（手机上 13/18，桌面端 14/22），图标 16px，控件是控件尺寸。胶囊从一边到另一边在触屏上是 32px，用鼠标时是 34px，和普通按钮（比如设置行里的 Save）一样大（[Button](../../packages/ui/src/components/button/button.md#sizes)）；工具栏的按钮在触屏上是 28px，放在 36px 的工具栏里，用鼠标时是 34px，放在 42px 的工具栏里。

- 单个操作用 `outline`、`md` 的 Button：也就是跳转胶囊。它单独存在，所以靠自己的墨色边表明是控件；它按 Button 的配方搭建，所以不会和 Raft 其他地方的按钮走样。
- 针对一条消息或一处选区的一组操作用工具栏：按钮距外框 4px，彼此间隔 4px，触屏上 28px，用鼠标时是控件高度（34px），所以工具栏高 36px 或 42px（stdrc，2026-11-05），用 `layer-popover`，带一圈接缝线和柔和阴影。它是浮在所作用内容上方的弹出层，悬停或选中时出现（[层级](../foundations/elevation.md#tokens)）；外框就是边，所以里面的按钮没有自己的边，而且它保持紧凑，尽量少盖住发送者那一行。
- 不要给胶囊加工具栏的外框或阴影，也不要把工具栏的按钮做成 Button：胶囊是在列表滚动时留在原处的控件；工具栏随下面的内容出现和消失。

### 搜索 {#search}

- 结果按类型分组：地方和人在前，然后是消息。同一个消息列里的命中归到那个消息列下。
- 匹配的词显示在黄色填充上，用文字本身的字重，不带边框（[Search](../../packages/ui/src/components/search/search.md)）。
- 结果跳转到的那条消息，按[导航](./navigation.md#going-somewhere)里的方式高亮。

## 相关 {#related}

- [交接与审批](../people-and-agents/handoffs-and-approvals.md)：事件行、状态和操作卡片。
- [导航](./navigation.md)：引用标签片和链接。
- [评论](./comments.md)：文档上的评论，放在它所说的那段文字旁边；它们不是消息。
- [用现有部件搭建](../components/overview.md#built-from-existing-parts)：链接卡片、转发的消息、翻译和多选。
