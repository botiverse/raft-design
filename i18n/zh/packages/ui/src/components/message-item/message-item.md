---
title: MessageItem
summary: 对话里的一条消息：头像、名字、时间和正文，加上附件、嵌入的卡片和页脚一行。人和 Agent 用法相同。
sourceHash: 3c19a0ef
---

# MessageItem

一条消息：发送者的头像、名字和时间，然后是正文，下面是附件、嵌入的卡片和页脚一行。人和 Agent 发的是同一种消息；像素脸和 `agent` 标签说明是谁发的。消息如何组成时间线（分组、提及、悬停工具栏和菜单、消息列）见[对话](../../../../../design/patterns/conversation.md)；本页讲消息本身。

```example
message-item/compositions/item-preview
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 一个人或一个 Agent 说的话 | MessageItem |
| 发生的一件事：日期、认领、交接、状态变化 | 一行事件（[SystemMessage](../system-message/system-message.md)），不是消息 |
| 一条消息的回复 | [MessageReplies](../message-replies/message-replies.md)，放在消息下方 |
| Agent 需要一个人的批准 | 消息里的一张 [MessageActionCard](../message-action-card/message-action-card.md) |
| 搜索找到的、对话之外的一条消息 | 搜索结果行（[Search](../search/search.md)） |

## 结构 {#anatomy}

- `MessageItem`：这一行。
- `MessageItemAvatarSlot`：35px 的 [Avatar](../avatar/avatar.md)，带在线状态灯。完整行上必需。
  - `MessageItemDelegatedAvatar`：放在一个人的头像里，是代他发送这条消息的助理的脸，一个 `2xs` Avatar，占在线状态灯所在的那个角。
- `MessageItemGutter` 加 `MessageItemContinuationTime`：在接续行上代替头像；悬停时时间显示在这里。
- `MessageItemContent`：头像右边的所有内容。必需。
- `MessageItemHeader`：一行，依次包含以下部分，每部分的文字都落在名字的基线上（[同一行里不同字号的文字](../../../../../design/foundations/alignment.md#text-of-different-sizes-on-one-line)）：
  - `MessageItemSenderGroup`：谁发的。这一行放不下时，它按固定顺序让出空间（[行为](#behavior)）。它包含：
    - `MessageItemSender`，名字能打开个人资料时用 `MessageItemSenderButton`：`text-subhead`，加粗。只有按钮在悬停时加下划线（[可点击的文字](../../../../../design/foundations/states.md#clickable-text)）；
    - `MessageItemSenderBadges`：`agent` 标签，以及 Left、Deleted 这类发送者状态；
    - `MessageItemMeta`：发送者的角色，比如 Product & Brand；
  - `MessageItemDelegatedBy`：助理代发送者发出消息时显示 "sent by Friday"（由 Friday 发送），助理的名字放在 `MessageItemDelegatedByName` 里；名字能打开助理的个人资料时用 `MessageItemDelegatedByButton`；
  - `MessageItemTime`：紧跟在发送者后面，`text-mono-meta`，`foreground-hint`。它是一个 `<time>`：把时刻传给 `dateTime`；
  - `MessageItemInlineStatus`：时间后面的一个简短状态，比如消息的翻译正在加载时显示 "Translating…"。正在工作的 Agent 由头像上的灯表示，不在这里显示（[工作中的 Agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)）。
- `MessageItemBody`：文字，用 `text-body`。必需。
- `MessageItemEdited`：已编辑标记，放在文字末尾，完整行和接续行都一样。
- `MessageItemAttachments`：文件和图片（[MessageAttachment](../message-attachment/message-attachment.md)）。
- `MessageItemEmbedded`：代码块、操作卡片和链接卡片。应用预览的链接不是卡片：它是正文里的标签片（[应用链接](#app-links)）。
- `MessageItemFooter`：一行：先是回应（`MessageReactionChip`，最后是 `MessageReactionAddButton`），再是收藏和已读标记（`MessageItemSavedIndicator`、`MessageItemReadReceipt`）。从这条消息创建的任务不在这一行里：它们是这一行上面的一个列表（[对话中的任务](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)）。
- `MessageItemToolbar` 加 `MessageItemToolbarButton`：悬停工具栏。它在显示时在自己所在的行上设置 `--mi-toolbar-width`，标题栏在它下面淡出时读这个值。以前的版本从 app 读 `--mi-toolbar-reserve` 来在标题栏里留位置；现在不再读它，设置它的地方可以删掉。
- `MessageMultiSelectCheckbox` 和 `MessageMultiSelectToolbar`，操作放在 `MessageMultiSelectToolbarActions` 里（28px 的按钮，间隔 4px；在触屏上每个按钮的点击区域是 44px，向相邻按钮只延伸到间隔的一半，所以点在两者之间会落到较近的那个上）：用于选择多条消息（[由现有部件组成](../../../../../design/components/overview.md#toolbar-for-selected-messages)）。
- `MessageTextSelectionToolbar` 加 `MessageTextSelectionToolbarButton` 和 `MessageTextSelectionToolbarSeparator`：对选中文字的操作（[选中文字的工具栏](#toolbar-for-selected-text)）；用 `createMessageTextSelectionAnchor` 定位。

### 正文里的元素 {#in-the-body}

| 元素 | 部件 | 样子 |
| --- | --- | --- |
| 提及别人 | `MessageReferenceText` | 墨色，加粗，悬停时加墨色下划线（[对话](../../../../../design/patterns/conversation.md#mentions)） |
| 提及正在阅读的人 | `MessageReferenceText variant="primary"` | 一张小小的黄色贴纸 |
| 搜索命中 | `MessageItemSearchMatch` | 黄色填充，没有边，保持文字本身的字重 |
| 引用标签片 | `MessageReferenceChip` | 频道或私信用 `variant="accent"`，消息列或消息用 `variant="info"`（[导航](../../../../../design/patterns/navigation.md#going-somewhere)） |
| 应用预览的链接 | `MessageReferenceChip variant="info" capped` | 青色标签片，带应用的图标和它的标题（[应用链接](#app-links)） |
| 正在加载或无法打开的引用 | `MessageReferencePending`、`MessageReferenceUnavailable` | `inactive-soft` 上的灰色标签片 |
| 引用标签片标签后面的注记 | `MessageReferenceSuffix` | 弱化的 Space Mono，比如指向消息的链接上的 `msg` |
| 提及一个已读过这条消息的 Agent | `MessageReferenceReadMark`，放在提及的最后 | 一个青柠色的对勾，在名字右上角（[提及上的已读回执](#read-receipts-on-a-mention)） |
| 网页链接 | Markdown 链接 | `foreground-link`，常态下带下划线（[Markdown](../markdown/markdown.md)） |
| 任务编号 | `TaskChip` 或 Space Mono 文字 | [Tasks](../tasks/tasks.md) |
| 行内代码 | [InlineCode](../inline-code/inline-code.md) | `fill-muted` 上的 Space Mono |
| 引用块 | Markdown 引用块 | 左侧一条 2px 的竖条，文字用 `foreground-muted` |
| 代码块 | [CodeBlock](../code-block/code-block.md) | `layer-code`，带一条细线 |

```example
message-reference/compositions/mixed-long-message
```

### 正文中的标签片 {#chips-in-running-text}

消息正文里的标记分两类：

- **标签片**带填充：引用标签片（任意变体的 `MessageReferenceChip`、`MessageReferencePending`、`MessageReferenceUnavailable`）、黄色贴纸（`MessageReferenceText variant="primary"`：对当前读者的提及，或以贴纸显示的消息和应用引用），以及正文里的任务（`TaskChip variant="inline"`）。它们共用一个盒子。
- **文字标记**没有填充：提及别人（`MessageReferenceText`，粗体墨色）和网页链接。它们是句子里的字，字号和句子一样。

| 部分 | 标签片盒子 | 桌面端（正文 14/22） | 手机（正文 16/24） |
| --- | --- | --- | --- |
| 字号 | 句子字号的 0.875，半粗 | 12.25px | 14px |
| 高度 | 正文行高减 2px：标签片文字的行框，上下没有内边距 | 20px | 22px |
| 对齐 | 文字在句子的基线上，前置标记在标签片里居中（[正文中的标记](../../../../../design/foundations/alignment.md#marks-in-running-text)） | 行高保持 22px | 行高保持 24px |
| 两端 | 两端各 6px；有前置标记时两端各 4.5px（[对齐](../../../../../design/foundations/alignment.md#chips)：两端的墨迹离边缘一样远），标记再隔 4px 到文字 | 6px 或 4.5px | 6px 或 4.5px |
| 前置标记 | 14px 的图标（svg，或放在 `MessageReferenceIcon` 里的应用图片）、加载中的旋转图标，或任务 10px 的状态像素点，各自用自己的盒子，在标签片里居中 | 14px、9.5px 或 10px | 14px、9.5px 或 10px |
| 注记 | 标签后的注记（`MessageReferenceSuffix`），离标签 4px | 4px | 4px |
| 圆角 | `radius-sticker` | 4px | 4px |

标签片的字号是句子字号的固定比例，高度比句子的行高低固定的一步，所以标签片总比它所在的行矮 2px。一行里放多少标签片，这一行都保持原来的高度，上下两行的标签片之间至少隔 2px；手机上正文变大，标签片也跟着变大。以前引用标签片是 20px 的行加上下各 1px，共 22px，在桌面端把一行撑到 23px；任务标签片和贴纸用句子本身的字号、1.2em 的行高：盒子比引用标签片矮 5px，字却大 2px。

- 黄色贴纸保留画在里面的 1.5px 墨色边，外面不加模切边（[深色模式](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)），所以它和旁边的标签片一样大。
- 高度跟随 `--text-body--line-height`。放在别的行高的文字里时，在容器上设置 `--chip-line-height`，取那一行减 2px。目前还没有地方设置它：消息正文以外的标签片（比如引用预览里的正文）会退回到正文行高减 2px，所以那里出现标签片时，要在容器上设置 `--chip-line-height`。
- 行内代码不是标签片：它是代码，不是引用，保留自己的盒子（[InlineCode](../inline-code/inline-code.md)），桌面端 20px，手机 23px，不会比行高。

在 raft-ui 里，这三个组件从同一个配方（`lib/inline-chip.ts`）取这个盒子。

### 应用链接 {#app-links}

应用预览的链接是句子里的一个引用标签片，带应用的图标和应用自己给的标题。为什么它是标签片而不是卡片，以及它的加载和悬停行为，见[导航](../../../../../design/patterns/navigation.md#app-links)。

- `MessageReferenceChip variant="info" capped`，渲染成在新标签页打开的链接：`render={<a href="…" target="_blank" rel="noopener noreferrer" />}`。
- `MessageReferenceIcon`：应用注册的图标，一个由 Raft 提供的 `<img alt="">`，放在标签片最前面。它 14px，在标签片里居中，带 2px 圆角。它是标签片盒子的前置标记（[正文中的标签片](#chips-in-running-text)）：两端各 4.5px，到标签 4px。图片画满到边缘，所以它和状态像素点一样取 4.5px（[对齐](../../../../../design/foundations/alignment.md#chips)）：它的墨迹离标签片起始边 4.5px，另一端最后一个字母之后约 4.8px。任何图片或其他非 svg 图标都用它：直接放进标签片的 `<img>` 没有自己的尺寸，会落在文字的基线上。实验性，从 `@botiverse/raft-ui/wip` 导出。
- `MessageReferenceLabel`：应用的 `title`，原样显示。放在标签里，不要直接放进标签片：只有标签会截断。
- `MessageReferenceSuffix`：链接的主机名，在触摸能打开链接的地方显示（`hidden any-pointer-coarse:inline`）。标题是应用自己的话，可能写任何东西（「GitHub PR」），所以人在点开链接之前必须能看到它通向哪里。在桌面端，条目卡片会写出来（「Stamp · stamp.build」，[PreviewCard](../preview-card/preview-card.md)）；在手指能点到链接的地方，标签片自己写出来，因为点一下就会打开，前面没有悬停（[触屏](../../../../../design/patterns/responsive.md#touch-screens)）。这也包括带触摸屏的笔记本电脑，它的主要指针是鼠标：查询用的是 `any-pointer-coarse`，即只要有任何触摸输入，而不是 `pointer-coarse`，即主要的那个输入。只有这一处按存在的所有输入方式、而不是主要的输入方式来决定是否显示主机名，因为一个人能在看不到去向时就打开的链接，是安全问题，不是布局上的选择。标签先截断。如果光是主机名在这一行里还放不下，它丢掉开头，绝不丢掉结尾：结尾（`…review.attacker.example`）才是说明链接去向的部分。把它放在一个从右到左的盒子里，用 `dir="ltr"` 和 `unicode-bidi: isolate` 保持它的字符顺序，这样省略号落在开头。
  - 写出链接完整的主机名，只去掉开头的 `www.`。绝不缩短成注册域名：子域名可能属于别人（`someone.github.io`）。
  - 国际化域名写成它的 ASCII 形式（`xn--…`），这样长得像的字母没法冒充另一个网站。
- `capped` 让标签片最宽到 `min(100%, 24em)`，标签在末尾截断。标签片文字的 24em 在桌面端是 294px，手机上是 336px。在 700px 宽的桌面端消息列里，两个满长的标签片加中间几个字能放在一行，标题短一些的能放三个；在 390px 的手机上，一行比 24em 窄，所以长标题自己占一行，绝不在标签片里换行。不加 `capped` 时，标签片和以前一样，最宽到整行。
- 没有状态：图标总是应用自己的、用它自己的颜色，标签片总是青色。

```example
message-reference/compositions/app-links
```

在 Raft 知道某个应用会预览一个链接之前，它就是一个普通链接：消息的预览第一次被读取之前，客户端分不出应用的链接和其他链接。有人允许了某个应用的预览、Raft 重新读取之后，这个应用的每个链接在预览到达之前都是 `MessageReferencePending capped`：一个 `link` 图标，地址缩短为主机名和路径。它的两端、图标尺寸和上限宽度都和替换它的标签片一样，所以变的只有图标和文字。

```example
message-reference/compositions/app-link-pending
```

### 提及上的已读回执 {#read-receipts-on-a-mention}

一条消息提及某个 Agent 时，发消息的人想知道 Agent 有没有读到。读到之后，提及的右上角出现一个青柠色的对勾。把 `MessageReferenceReadMark` 放在 `MessageReferenceText` 的最后、名字后面，子元素是读屏软件要读出的文字（`Read`）。对勾本身对读屏软件隐藏。

```example
message-reference/compositions/read-indicators
```

- Agent 读到之前什么都不显示。每条新提及都带一个"未读"标记，会在每条消息里制造噪音，而真正重要的是它变化的那一刻。
- 在提及的悬停卡片里也说出来："Read"或"Not read yet"，这样不管有没有标记，人都能查看任何一个提及。
- 触屏上没有悬停卡片，点一下提及会打开 Agent 的资料，它不属于任何一条消息。在那里只靠对勾来表达：没有对勾就是还没读。不要只为这一行加长按或弹窗：为一行文字设一个手势，要学的比它告诉人的还多。对勾自己的文字（"Read"）仍然能传到读屏软件。
- 已读标记是一个光秃秃的 Lucide `check`，10px，线宽 2.5，周围没有灯也没有框，颜色用 `read-mark`：浅色模式下是 `palette-lime-700`（在白色上 6.2:1），深色模式下是在线的青柠色（`presence-online`，在深色画布上 10.5:1）。在线的青柠色在白色上只有 1.64:1，对这么小的标记来说太淡，所以浅色模式用同一色相更深的一档。
- 它不是状态灯。灯，即带墨色边的方块，表示在线状态；对勾表示已读，所以两者从不相像（[Status](../status/status.md)）。
- 它放在提及右上角指示标记的位置：顶边和提及的顶边对齐，10px 的盒子从名字文字之后 2px 开始，所以从不盖住名字。提及在文字后面留出 10px，和指示标记一样，所以下一个词不会跑到它下面，这一行的高度也不变；对勾的盒子伸进词间空格 2px，那里只有字形自己的空白内边距。
- 由 stdrc 于 2026-10-24 决定：带墨色对勾的在线灯读起来像一个黑框，对一个只做确认的标记来说太暗；只要一个对勾。青柠色本身在白色上只有 1.64:1，所以浅色模式用 `palette-lime-700`，深色模式保留在线的青柠色。它取代了带墨色对勾的在线灯（artin 和 stdrc，2026-10-23，[提及已读标记看板](https://raft-artifacts.com/p/raft/mention-read-mark/v/6)上的 Ik2 方案），而那盏灯取代的是名字后面一个弱化的对勾，它读起来像文字的一部分。`MessageReferenceReadMark` 保留它的名字和 API，现在画的是这个光秃秃的对勾；它是稳定的，从 `@botiverse/raft-ui` 导出，仍然从 `@botiverse/raft-ui/wip` 再导出，供已有的导入使用。

```example
message-reference/compositions/primary-references
```

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 完整行 | 一组里的第一条消息：头像、标题栏和正文 |
| `compact` | 接续行：同一发送者同一天的下一条消息，没有头像和名字 |

```example
message-item/compositions/consecutive
```

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 被定位 | 用 `located` 属性时，整行立即变为 `info-soft`，2 秒内淡出，由 `useLocated` 驱动（[被定位](../../../../../design/foundations/states.md#located)）。搜索匹配、被勾选或菜单打开的行保留自己的底色 |
| 获得焦点 | 从键盘发起的跳转让这一行获得焦点后（`tabIndex={-1}`，由调用方设置），显示 2px、`foreground` 色的方角内嵌环，以及工具栏；点击之后什么都不显示。从不显示浏览器自带的 outline（[被定位](../../../../../design/foundations/states.md#located)） |
| 搜索命中 | 行里有 `MessageItemSearchMatch` 时，整行用 `info-soft` |
| 多选中被选中 | 当 `MessageMultiSelectCheckbox` 勾选时，整行用 `info-soft` |
| Agent 正在工作 | 头像上一盏静止的黄灯，加上行内状态（[工作中的 Agent](../../../../../design/people-and-agents/working-agents.md)） |
| 发送者已离开、被移除或已删除 | `MessageItemSenderBadges` 里一个弱化的徽标；已删除 Agent 的头像变灰 |
| 由助理发送 | 发送者头像上有助理的脸，名字后面有 "sent by Friday"；接续行上只有文字 |
| 回应失败 | 标签片用 `warning-soft`，由 `MessageReactionErrorIndicator` 播报原因 |

```example
message-item/compositions/row-chrome
```

```example
message-item/compositions/sender-state
```

```example
message-item/compositions/avatar-status
```

### 由助理发送 {#sent-by-an-assistant}

一个人的助理可以以这个人的身份发送消息：消息属于这个人，另有两个标记说明是助理发的（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)）。这些部件是实验性的，在设计获批之前从 `@botiverse/raft-ui/wip` 导出：`MessageItemDelegatedAvatar`、`MessageItemDelegatedBy`、`MessageItemDelegatedByName` 和 `MessageItemDelegatedByButton`。把 `MessageItemDelegatedAvatar` 放在发送者的 `md` Avatar 里，里面放助理的 `2xs` Avatar；把 `MessageItemDelegatedBy` 放在 `MessageItemSenderGroup` 后面；发送者留在分组里，分组保留它的 3rem。在接续行上，把 `MessageItemDelegatedBy` 放在文字末尾，和 `MessageItemEdited` 一样，不带脸。这样的消息自成一组（[对话](../../../../../design/patterns/conversation.md#dates-and-grouping)）。

```example
message-item/compositions/delegated-group
```

```example
message-item/compositions/delegated-thread
```

助理被删除后，两个标记都保留：`MessageItemDelegatedAvatar deleted` 里显示默认的脸，它会变灰，并在行的表面上淡化；`MessageItemDelegatedBy` 里用纯文字写 "sent by a deleted assistant"（由已删除的助理发送），不带名字部件，所以这些内容都不会截断，也不会打开任何东西：

```example
message-item/compositions/delegated-deleted
```

在动态的一行或搜索结果里没有脸；把这几个字写进发送者里："Alice (sent by Friday)"。

```example
message-item/compositions/delegated-preview
```

## 行为 {#behavior}

- 按[时间线节奏](../../../../../design/foundations/spacing.md#timeline-rhythm)用分组来安排消息的间距：同一组的行之间 8px（接续行位于它所接续的那一行下方），新的一组之前是消息步长 16px。每一行的文字上下各留行内边距 4px，组前多出来的 8px 是一条透明的上边框，高亮不会画到它。样式从时间线 token（`py-timeline-row`、`border-t-(length:--spacing-timeline-turn)`）读取这两个值，所以改动节奏会改动每一行。所以悬停、选中和搜索的高亮在每一行上都均匀地围着文字：以前接续行没有上内边距时，高亮紧贴第一行，最后一行下面却留了 8px。
- 悬停时，这一行在自身上铺一层 `fill-subtle`，即所有行都用的轻度一级：一条消息可能有很多行高，人读的时候鼠标指针常常停在上面，所以这一级变化很小，文字保持对比度（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。它以前比其他行更浅（3%）；现在消息和旁边的行、卡片用同样的级差。消息没有按下状态：这一行本身不是操作，点击是在选择文字，或落在其中的链接、名字或按钮上。搜索命中的或选中的消息，悬停时保持 `info-soft`；被定位的消息在高亮持续期间不响应悬停。
- 当它的某个弹出层打开时（右键、工具栏按钮或在手机上长按打开的上下文菜单），这一行在自身上铺一层 `fill-subtle`，与悬停同一级，所以两者不会叠加。手机没有悬停，所以这层填充表示菜单作用于哪条消息；它比 `info-soft` 浅，所以消息看起来不像被选中。
- 悬停工具栏在悬停时、焦点在行内时，以及它的某个弹出层打开时出现。它骑在高亮的上边缘，靠右。焦点在这一行本身上也算：从键盘发起的跳转让这一行获得焦点时，它的工具栏会显示，这样键盘用户能看到这条消息的操作，并用 Tab 经过消息里的链接和按钮到达它们。
- 悬停从不让消息移动。工具栏浮在这一行的右上角，不为它重新排版，所以正在读的那一行留在原处。
- 时间属于发送者：谁说的、什么时候说的，要作为一个整体来读，所以时间跟在名字、徽标和角色后面，从不被推到最右边。
- 标题栏不给工具栏留位置（stdrc，2026-10-22）。平时发送者这一行占满全宽，所以即使在 360px 的消息列里也能看到完整的名字；工具栏出现时，长到伸进右上角的那一行的末尾在它下面淡出：标题栏从工具栏左边缘再往左 4px 起，到自己的末端，经过 12px 的渐隐后全部遮住，所以卡片下方和旁边不会露出被切了一半的字（卡片只盖住这一行的一部分高度）。`MessageItemToolbar` 把自己的宽度量到这一行上（`--mi-toolbar-width`），所以按钮多或少的工具栏都正好遮住自己的宽度；这一行上什么都不会移动。没有工具栏的行（比如手机上）不遮任何东西。留位置会让窄栏里的名字一直被截成几个字母，只为了保护一个只在指针停在这条消息上时才被盖住的角落；只在悬停时留位置，又会让指针每划过一条消息，这一行就重新排版一次。Slack 和 Discord 也是这样做的。
- `MessageItemToolbar` 在工具栏显示时测量自己的宽度，而不是在这一行挂载时。指针进入这一行，或焦点移进这一行，会在那个事件里写入宽度，早于显示工具栏的那一帧，所以第一帧就按正确的宽度淡出；弹出层只会在这两者之一之后从工具栏打开，所以它打开时宽度已经写好了。工具栏显示期间，由整个页面共用的一个观察器看着它，所以显示期间新加的按钮会被重新测量；指针和焦点都离开这一行、也没有弹出层打开时，它就停止观察，没有工具栏显示时，不会留下任何观察器。每条消息都渲染一个工具栏，只有指针或焦点下的那一个需要它的宽度，所以在显示时测量能让长列表保持轻量：一行在一次提交里挂载完，也不保留自己的观察器。在挂载时测量每一行，需要第二次提交，每行还要一个 ResizeObserver，在一个长频道里就是几千个。在测量之前，工具栏挂载时会把五个按钮的宽度（164px）写到它的行上，这是一次什么都不读的普通写入，所以万一工具栏在测量自己之前就显示了，这一行会淡出得多一些，而不是少一些；没有工具栏的行不会得到宽度，什么都不遮。淡出和工具栏在完全相同的条件下出现，所以留在行上的宽度从不会在没有工具栏盖着时让标题栏淡出：没有悬停的触屏在点一下之后两者都不显示，而点一下让行内某个按钮获得焦点时，两者都显示。
- 发送者那一行放不下时，`MessageItemSenderGroup` 按固定顺序让出空间：先截断角色，再截断名字。徽标在名字旁边保持完整，时间从不截断（[一行放不下时](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)）。名字和角色可能被截断时，在工具提示里显示完整内容。
- `MessageItemDelegatedBy` 按自身宽度占位，最多占这一行的 45%；超出时只截断助理的名字。当它的文字本身就比这更宽时（手机上的 "sent by a deleted assistant"），它的宽度就是文字的宽度，改由发送者的名字让出空间：这些文字从不截断，也从不跑到时间下面。发送者的名字至少保留 3rem，名字更短时保留全部；连这也放不下时（360px 宽的消息列面板），纯文字按需要换成多行，第一行落在名字的基线上，时间留在第一行。名字周围的文字从不截断：产品在名字两边的空格按原样保留，名字两边都有文字的翻译（中文）两边都保持完整。

```example
message-item/compositions/delegated-long-names
```

- 工具栏高 36px：28px 的按钮，16px 的图标，距外框 4px，按钮之间间隔 4px，细线画在这个高度之内。它骑在高亮的上边缘，向上伸出 18px，即自身高度的一半；在一组的第一行上，透明的 8px 边框占去其中一部分，所以它只超出这一行 10px。它的按钮是 `MessageItemToolbarButton`，不是 [Button](../button/button.md)。它保持这么紧凑，是因为它出现在鼠标指针下的每条消息上：做成 38px 时，它会盖住发送者那一行，并在第一条消息上方被裁掉。
- 工具栏和所有弹出层一样用 `radius-container`。它的按钮是嵌在外框里的控件，所以用 `radius-chip`，就像输入框、消息输入框和卡片角落里的按钮一样（[外框之内](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 在滚动区域的第一条消息上方和消息列的根消息上方至少留 18px，这样工具栏永远不会被裁掉。以日期行开头的时间线已经有这个空间。
- 消息下面的任务行打开任务。状态在任务详情里修改，不在这一行上修改（[对话中的任务](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)）。

```example
message-item/compositions/toolbar
```

```example
message-item/compositions/long-header
```

```example
message-item/compositions/reactions
```

### 选中文字的工具栏 {#toolbar-for-selected-text}

`MessageTextSelectionToolbar` 浮在人在消息里选中的文字上方，提供 Quote、Copy 这类操作。它和悬停工具栏长得完全一样，所以两者看起来是同一类东西：

- 高 36px：`radius-container`，细线画在内部（`ring-inset`），围着 28px 的 `radius-chip` 按钮，距外框 4px，按钮之间间隔 4px。
- 按钮在 16px 的 `foreground-muted` 图标后面带文字标签。悬停时用中度一级 `fill-medium`，而不是菜单行的 `brand-soft`：工具栏里的操作是按钮，不是菜单行（[状态](../../../../../design/foundations/states.md)）。
- `MessageTextSelectionToolbarSeparator` 高 20px，两侧各留工具栏的 4px。
- 标签用 Title Case（每个单词首字母大写）。标签从不换行：中文可以在任意两个字之间断开，所以挤在窗口边缘的工具栏曾把两个字的标签断成了两行。
- 它锚定在选区焦点端所在的那一行，也就是人松手的地方，而不是整个选区：整行或跨多段的选区横跨整行，它的中间离鼠标指针很远。用 `createMessageTextSelectionAnchor(selection)` 生成锚点，传给 `PopoverContent` 的 `anchor`。
- 它始终留在视口内：默认在那一行上方，没有空间时翻到下方，靠近左右边缘时沿着那一行平移。

## 内容 {#content}

- 接续行的时间只写小时和分钟，按这个人的 12 小时制或 24 小时制，不带 AM 或 PM：6:35、18:35（[写作](../../../../../design/content/writing.md#times)）。时间栏就是头像那一列的 35px，两位数的小时（10:35、18:35，用 Space Mono 是 36.7px）会超出它约 2px，伸进这一行的内边距：时间是向文字右对齐的，所以它本来就该在那里。不要为此加宽时间栏，因为那会让每条消息的文字都偏离头像那一列。
- `MessageItemMeta` 里的角色用 sentence case（句首大写）；没有角色就不写。
- 把 `MessageItemEdited` 放在文字最后一段里面，让它跟在最后一个词后面（"(edited)"），并把编辑时间作为它的工具提示。它放在文字里而不是标题栏里，因为接续行没有标题栏，而编辑只属于那一条消息。
- 给每个回应标签片加标签：回应内容、数量，以及这个人是否也回应了。

## 无障碍 {#accessibility}

- `MessageItem` 和它的部件都是用 Base UI `useRender` 构建的普通元素；用 `render` 改变元素，比如把 `MessageItemSenderButton` 渲染成链接。
- `MessageItem` 是一个以发送者和时间命名的 `article`：它的 `aria-labelledby` 指向 `MessageItemSender`（或 `MessageItemSenderButton`）和 `MessageItemTime`（或 `MessageItemContinuationTime`），这一行渲染的是哪个就指向哪个，id 由 raft-ui 生成。读屏软件通过跳转或阅读按键落到一条消息上时，会在正文之前读出一个名为「Atlas 2:20 PM」的 article：这是谁的消息、什么时候发的，顺序和标题栏显示的一样。接续行不显示名字，所以用时间命名。两者都没有的行，比如文字栏里的回执卡片，是普通的 `div`，不是 article：没有名字的 article 只会被读成一句光秃秃的「article」，对读屏软件用户什么都没说；如果它应该是 article，给它 `aria-label`。要自己给一行命名，在 `MessageItem` 或它的 `render` 元素上传 `aria-labelledby` 或 `aria-label`；要改角色，传 `role`。`render` 函数的 props 读不到，所以用函数时，把它们传给 `MessageItem`。你给某个部件的 `id`，就是这一行指向的那个。发送者按钮的名字就是它显示的名字，所以不要给它单独的 `aria-label`：不然这一行会改读那个名字。
- 不要把消息放进 `list`，也不要把 `MessageItem` 渲染成 `li`：`role="article"` 会取代 `listitem`，而列表里只能放列表项。包住它们的时间线不用列表角色（[MessageList](../message-list/message-list.md#accessibility)）。也不要把它做成 `feed`：feed 承诺用 Page Down 和 Page Up 在 article 之间移动，而时间线没有实现这一点。
- 只有从键盘发起的跳转落到一行上时，这一行才获得焦点（[被定位](../../../../../design/foundations/states.md#located)）。raft-ui 不让这一行可聚焦：调用方在 `focus({ preventScroll: true })` 之前给 `MessageItem` 设 `tabIndex={-1}`，焦点离开时再去掉，这样之后点击这一行不会把焦点从消息输入框抢走。这时它显示内嵌的环，从不显示浏览器自带的 outline，并显示它的工具栏；Tab 接着经过消息里的链接和按钮，包括工具栏的按钮。工具栏显示时，它的卡片盖住环上边缘靠右的一部分，就像它盖住高亮那样：环在另外三边和上边的大部分仍然看得出来，而只为了焦点把工具栏从这一行的边缘挪开，会让它跳动。
- 给每个 `MessageItemToolbarButton` 一个 Title Case 的 `aria-label`：Reply in Thread、Add Reaction、Save。工具栏在键盘焦点进入时显示，所以按 Tab 能到达它。
- `MessageReactionChip` 封装了 Base UI `Toggle`：`aria-pressed` 表示这个人是否回应了。给它一个 `aria-label`；里面画出来的回应是隐藏的（[品牌](../../../../../design/foundations/brand.md#reactions)）。
- 回应失败的原因放在 `MessageReactionErrorIndicator` 里，它是一个视觉上隐藏的 `role="status"`。
- `MessageTextSelectionToolbar` 封装了 Base UI `Toolbar`；给它一个 `aria-label`。
- 给 `MessageMultiSelectCheckbox` 一个指明是哪条消息的标签，比如 "Select message from Bugen"。
- 能打开某个东西的引用标签片，通过 `render` 渲染成链接；标签片默认是 `span`。应用链接在新标签页打开，带 `rel="noopener noreferrer"`。
- 给 `MessageReferenceIcon` 里的应用图标一个空的 `alt`：旁边的标题已经说明了这个链接。
- 给头像图片一个空的 `alt`：旁边的名字已经说明了是谁。
- `MessageItemDelegatedAvatar` 是 `aria-hidden`："sent by Friday" 是标题栏里的纯文字，按它的顺序读出（名字、角色、"sent by Friday"、时间）。产品给整行命名（`aria-label`）时，用同样的文字。`MessageItemDelegatedByButton` 是一个 `<button>`；它跳到个人资料页时，通过 `render` 渲染成链接。
- 工具栏出现时，在它下面淡出的部分（时间、「sent by」）指针点不到：指针离开工具栏后，时间的工具提示和 `MessageItemDelegatedByButton` 就能用了；用键盘时它们一直在阅读顺序里。
- 给 `MessageItemTime` 和 `MessageItemContinuationTime` 的 `dateTime` 传入时刻（ISO 8601），并在工具提示里显示完整的日期和时间。读屏软件按显示的顺序读标题栏：名字、徽标、角色、时间。

## 规则 {#rules}

- `MessageItemDelegatedAvatar` 只放在人的头像上，永远不和在线状态灯一起用（[Avatar](../avatar/avatar.md#rules)）。
- 不要给消息加边框，也不要给 Agent 用气泡颜色。只有嵌入的内容（代码块、附件、操作卡片）看起来像卡片。
- 页脚里先放回应，添加按钮放最后。
- 从一条消息创建的任务放在页脚上面，是一个由紧凑行组成的列表，而不是页脚里的一个标记（[紧凑列表的行](../../../../../design/patterns/tasks.md#rows-in-a-compact-list)）。
- 每个表情只显示一个回应标签片。这个人自己添加的回应用 `attention-soft`。
- 让标签片的墨色离左边缘和离右边缘一样远（[对齐](../../../../../design/foundations/alignment.md#chips)）。带图标的引用标签片和回应把内边距平均分配，两端各 4.5px 和 7px，总量和宽度与以前相同：Lucide 图标在它的方框里留出的空白和旁边的字母差不多，而表情或应用图标画满到边缘。收藏标记在书签图标前留 5.5px（书签画在方框内 2.3px 处），在文字后留 6.5px。
- 引用标签片标签后面的注记放在 `MessageReferenceSuffix` 里，不要放在自己写的 span 里。它在布局中保持在标签的基线上，绘制时上移字号差的四分之一，让两者 x 高度的中线对齐；标签保持在句子的基线上。
- 回应标签片高 24px，点击区域 44px（[间距](../../../../../design/foundations/spacing.md#hit-targets)）。
