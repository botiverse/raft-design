---
title: MessageList
summary: 对话或消息列中滚动的时间线，包括日期线、开头的说明、历史受限的标记，以及浮在上面的跳转控件。
sourceHash: 7cd43768
---

# MessageList

MessageList 是对话的滚动容器：它把消息、事件行和日期放在一列里，最新的在最下面（[对话](../../../../../design/patterns/conversation.md#structure)）。它放在 [ConversationPanel](../conversation-panel/conversation-panel.md) 或 [ThreadPanel](../thread-panel/thread-panel.md) 的主体里，是面板中唯一滚动的部分。

```example
conversation-panel/compositions/conversation-panel
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 一个对话或一个消息列里的消息 | MessageList |
| 一条消息 | [MessageItem](../message-item/message-item.md) |
| 发生过的操作：认领、交接 | [SystemMessage](../system-message/system-message.md)，放在列表里 |
| 对话之外，agent 的操作历史 | [Timeline](../timeline/timeline.md) |
| 其他任何滚动的区域 | [ScrollArea](../scroll-area/scroll-area.md)，或面板自己的 `PanelScrollViewport` |

## 结构 {#anatomy}

- `MessageList`：滚动容器。它的 props 和 `ref` 传给真正滚动的元素，调用方可以读取和设置滚动位置；`rootClassName` 用来设置外层元素的样式。
- `MessageListNotice`：历史开头一行居中的 Space Mono 文字，例如 "Beginning of messages"。`tone="faint"`（默认）用 `foreground-hint`，`tone="muted"` 用 `foreground-muted`。
- `MessageListHistoryLimited`：带 `line-hairline` 轮廓的 Space Mono 小标签片，用于没有回溯到开头的历史。
- `MessageListDateDivider`：两条 `line-hairline` 线之间的日期，用 `text-mono-meta` 和 `foreground-hint`，画法和事件行一样（[SystemMessage](../system-message/system-message.md#rules)）。它是一条分界：它的线离上方和下方的文字都是一个分段档，24px（[时间线节奏](../../../../../design/foundations/spacing.md#timeline-rhythm)）。
- `MessageListEndFade`：列表下沿的渐变，从面板颜色向上渐变到透明，高度是一个分段档，24px。把它放在 `MessageList` 旁边、同一个定位父元素里（`ConversationPanelBody` 就是一个），和跳转控件一样；它在跳转控件下面，不接收指针事件。
- 跳转控件（[跳转控件](#jump-controls)），实验性，从 `@botiverse/raft-ui/wip` 导出：
  - `MessageListJumpControls`：胶囊按钮浮动的位置，在列表底边居中，用 `side="top"` 时在顶边。把它放在 `MessageList` 旁边，同一个定位父元素里（`ConversationPanelBody` 就是一个）。
  - `MessageListJumpPill`：一个胶囊按钮，是用 Button 样式配方搭成的 `outline`、`md` 尺寸的 Button：先是图标，然后是标签。
  - `MessageListJumpPillGroup` 加 `MessageListJumpPillDismiss`：一个胶囊按钮，末端接一个关闭按钮，两者共用一条边，类似拆分按钮。关闭按钮有一个 `foreground-muted` 的 16px 图标，靠胶囊按钮的那一侧没有自己的边。

## 行为 {#behavior}

- 列表只上下滚动。宽的内容，例如一长行代码或一排标签页，在自己的容器里滚动，永远不会把消息撑宽。
- 桌面端的列表是一个 [ScrollArea](../scroll-area/scroll-area.md)：细滚动条只在列表滚动时显示。
- 768px 以下，它用面板的原生滚动，不画滚动条（[响应式布局](../../../../../design/patterns/responsive.md)）。
- 滚动到列表尽头就停下，不会带着后面的页面一起滚动。
- MessageList 渲染传给它的每一条消息，不加载更早的消息。历史太长、无法全部放在 DOM 里时，用 [VirtualList](../virtual-list/virtual-list.md)：它只渲染可见的行，并在上方加载更早的行时让它们保持不动；加载由产品负责。

## 跳转控件 {#jump-controls}

这个人从尽头滚开了，或者有某个看不见的地方可以去时，一个胶囊按钮会浮在列表上，带他过去。

```example
message-list/compositions/back-to-bottom
```

```example
message-list/compositions/new-messages
```

```example
message-list/compositions/next-unread-thread
```

手机上一行很少放得下两个胶囊按钮。它们上下叠放，间隔 12px，这样点击区域不会重叠，第一个离边缘最近：

```example
message-list/compositions/phone
```

- 对话尽头不在视野内时，显示 Back to Bottom；这个人滚开后有新消息到达时，同一个胶囊按钮显示有几条："3 New Messages"。尽头重新进入视野后，把它去掉。
- 通往更下方某处的胶囊按钮放在底部，排在 Back to Bottom 之后："Next Unread Thread (3)"。通往上方的胶囊按钮 "Earliest Unread Thread (3)" 单独放在顶部。
- 底部最多显示两个胶囊按钮，顶部最多一个。第三个目的地要等其中一个消失：超过两个胶囊按钮，就会挡住它们要带人去看的消息。
- 只有当这个人可能不想去它指向的地方时（未读的消息列），才给胶囊按钮加关闭按钮；Back to Bottom 永远不加。关闭的胶囊按钮在计数变化之前不会再出现。
- 标签用 Title Case，和其他按钮一样，并把计数写进去："3 New Messages"、"Next Unread Thread (3)"。

### 外观 {#how-they-look}

胶囊按钮是一个操作，所以它是一个 Button，尺寸和 Raft 里普通的按钮一样（设置行里的 Save）：`outline`、`md`，标签用 700 字重的 `text-control`，16px 的图标，32px 高（[Button](../button/button.md#sizes)）。它用 Button 的样式配方搭成，所以不会和 Button 走样。它和对话里其他浮动控件怎么摆在一起，见[对话](../../../../../design/patterns/conversation.md#floating-controls)。

- 控件浮在离列表边缘 12px 的地方，居中，胶囊按钮之间间隔 8px。在底部，它们会上移 `--message-list-bottom-inset`，产品把这个值设为同一边上其他浮动内容的高度（显示谁即将发消息的那一行，[正在工作的 agent](../../../../../design/people-and-agents/working-agents.md#who-is-about-to-post)），所以胶囊按钮永远不会挡住它。
- 不画阴影。胶囊按钮是控件，靠 `layer-card` 上的墨色边来标示；不透明的卡片让它在下面经过的消息之上保持可读（[层级](../../../../../design/foundations/elevation.md#floating-controls)）。
- 胶囊按钮出现和消失时不加动画，替换计数时也不滚动数字（[动效](../../../../../design/foundations/motion.md)）：它不是从哪里来的，而且会滑动的胶囊按钮每次有人滚动时都会把视线从消息上拉走。
- 让 `MessageListJumpControls` 一直挂载，只改变里面的内容，或用 `hidden` 隐藏它。在有人滚动时增删列表的兄弟元素，会让 WebKit 重新计算整个列表的样式。
- 每个胶囊按钮和关闭按钮都保持 44px 的点击区域，只比 12px 的边距多伸出 6px。

## 内容 {#content}

- 说明用句首大写，并说清楚是什么的开头："Beginning of messages"、"Beginning of replies"。

## 无障碍 {#accessibility}

- MessageList 渲染普通元素，不添加角色或实时区域。用对话的名称给外面的面板命名（[ConversationPanel](../conversation-panel/conversation-panel.md#accessibility)）。
- 说明、日期线和历史标记是文字，不是控件。
- 把 `MessageListDateDivider` 里的日期放在带 `dateTime` 的 `<time>` 元素里，和事件行的时间一样（[SystemMessage](../system-message/system-message.md#accessibility)）。
- 跳转胶囊按钮是原生按钮；标签就是它们的名称。有不止一个时，给 `MessageListJumpPillDismiss` 一个用 Title Case 写、说明关闭什么的 `aria-label`："Dismiss Unread Threads"。
- 胶囊按钮在 DOM 里排在列表之后，所以按 Tab 会在消息之后到达它们；它们出现时不会被读出：它们重复的是滚动就能看到的东西。

## 规则 {#rules}

- 在第一条消息上方留出它的悬停工具栏的位置（[MessageItem](../message-item/message-item.md#behavior)）。以日期线开头的列表已经留出了。
- 列表从第一行上方一个分段档（24px）处开始（第一行上方用 `pt-timeline-start`；历史开头的提示和消息一样带着一行的起始距离，所以无论最先出现的是哪个，这一档都成立），并在末尾让消息输入框的外框离最后一行一个分段档（消息输入框自身不加空白时，在最后一行下方用 `pb-timeline-end`）。MessageList 把这两处都留给产品，因为产品知道列表上方和下方是什么（[时间线节奏](../../../../../design/foundations/spacing.md#timeline-rhythm)）。
- 只要列表下方有消息输入框或别的东西，就用 `MessageListEndFade` 让列表下沿渐隐：滚到下沿下面的消息被柔化而不是被切断；滚到列表末尾时，渐变盖在末尾的空白上（[时间线节奏](../../../../../design/foundations/spacing.md#timeline-rhythm)）。不要给浮在上面的那一行再单独加一层渐变。
- 列表里任何其他标记分界的线，比如新消息线，也和日期线一样，两侧各留一个分段档。
- 最早加载的消息上方只显示一样东西：加载更早消息时显示说明，历史被截断时显示历史标记，到达开头后显示 "Beginning of messages"。
