---
title: MessageItem
summary: 对话里的一条消息：头像、名字、时间和正文，加上附件、嵌入的卡片和页脚一行。人和 agent 用法相同。
sourceHash: 22f43307
---

# MessageItem

一条消息：发送者的头像、名字和时间，然后是正文，下面是附件、嵌入的卡片和页脚一行。人和 agent 发的是同一种消息；像素脸和 `agent` 标签说明是谁发的。消息如何组成时间线（分组、提及、悬停工具栏和菜单、消息列）见[对话](../../../../../design/patterns/conversation.md)；本页讲消息本身。

```example
message-item/compositions/item-preview
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 一个人或一个 agent 说的话 | MessageItem |
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
  - `MessageItemInlineStatus`：时间后面的一个简短状态，比如消息正在转为任务时显示 "Converting…"。正在工作的 agent 由头像上的灯表示，不在这里显示（[工作中的 agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)）。
- `MessageItemBody`：文字，用 `text-body`。必需。
- `MessageItemEdited`：已编辑标记，放在文字末尾，完整行和接续行都一样。
- `MessageItemAttachments`：文件和图片（[MessageAttachment](../message-attachment/message-attachment.md)）。
- `MessageItemEmbedded`：代码块、操作卡片和链接卡片。应用预览的链接不是卡片：它是正文里的标签片（[应用链接](#app-links)）。
- `MessageItemFooter`：一行：先是任务标记，然后是回应（`MessageReactionChip`，最后是 `MessageReactionAddButton`），再是收藏和已读标记（`MessageItemSavedIndicator`、`MessageItemReadReceipt`）。
- `MessageItemToolbar` 加 `MessageItemToolbarButton`：悬停工具栏。
- `MessageMultiSelectCheckbox` 和 `MessageMultiSelectToolbar`，操作放在 `MessageMultiSelectToolbarActions` 里（28px 的按钮，间隔 4px；在触屏上每个按钮的点击区域是 44px，向相邻按钮只延伸到间隔的一半，所以点在两者之间会落到较近的那个上）：用于选择多条消息（[由现有部件组成](../../../../../design/components/overview.md#toolbar-for-selected-messages)）。
- `MessageTextSelectionToolbar` 加 `MessageTextSelectionToolbarButton` 和 `MessageTextSelectionToolbarSeparator`：对选中文字的操作（[选中文字的工具栏](#toolbar-for-selected-text)）；用 `createMessageTextSelectionAnchor` 定位。

### 正文里的元素 {#in-the-body}

| 元素 | 部件 | 样子 |
| --- | --- | --- |
| 提及别人 | `MessageReferenceText` | 墨色，加粗，悬停时加墨色下划线（[对话](../../../../../design/patterns/conversation.md#mentions)） |
| 提及正在阅读的人；搜索命中 | `MessageReferenceText variant="primary"`；`MessageItemSearchMatch` | 一张小小的黄色贴纸 |
| 引用标签片 | `MessageReferenceChip` | 频道或私信用 `variant="accent"`，消息列或消息用 `variant="info"`（[导航](../../../../../design/patterns/navigation.md#going-somewhere)） |
| 应用预览的链接 | `MessageReferenceChip variant="info" capped` | 青色标签片，带应用的图标和它的标题（[应用链接](#app-links)） |
| 正在加载或无法打开的引用 | `MessageReferencePending`、`MessageReferenceUnavailable` | `inactive-soft` 上的灰色标签片 |
| 引用标签片标签后面的注记 | `MessageReferenceSuffix` | 弱化的 Space Mono，比如指向消息的链接上的 `msg` |
| 提及一个已读过这条消息的 agent | `MessageReferenceReadMark`，放在提及的最后 | 名字后面一个弱化的对勾（[提及上的已读回执](#read-receipts-on-a-mention)） |
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
- `capped` 让标签片最宽到 `min(100%, 24em)`，标签在末尾截断。标签片文字的 24em 在桌面端是 294px，手机上是 336px。在 700px 宽的桌面端消息列里，两个满长的标签片加中间几个字能放在一行，标题短一些的能放三个；在 390px 的手机上，一行比 24em 窄，所以长标题自己占一行，绝不在标签片里换行。不加 `capped` 时，标签片和以前一样，最宽到整行。
- 没有状态：图标总是应用自己的、用它自己的颜色，标签片总是青色。

```example
message-reference/compositions/app-links
```

预览加载时，链接是 `MessageReferencePending capped`，带一个 `link` 图标，地址缩短为主机名和路径。它的两端、图标尺寸和上限宽度都和替换它的标签片一样，所以变的只有图标和文字。

```example
message-reference/compositions/app-link-pending
```

### 提及上的已读回执 {#read-receipts-on-a-mention}

一条消息提及某个 agent 时，发消息的人想知道 agent 有没有读到。读到之后，提及后面跟一个对勾：把 `MessageReferenceReadMark` 放在 `MessageReferenceText` 的最后、名字后面，子元素是读屏软件要读出的文字（`Read`）。对勾本身对读屏软件隐藏。这个部件是实验性的，在设计获批之前从 `@botiverse/raft-ui/wip` 导出。

```example
message-reference/compositions/read-indicators
```

- agent 读到之前什么都不显示。每条新提及都带一个"未读"标记，会在每条消息里制造噪音，而真正重要的是它变化的那一刻。
- 在提及的悬停卡片里也说出来："Read"或"Not read yet"，这样不管有没有标记，人都能查看任何一个提及。
- 对勾用 Lucide `check`，和引用里的图标一样大（14px 文字旁 12px），颜色用 `foreground-hint`，不加彩色。它紧跟在名字后面，自己不再留间距，所以两者的墨迹之间只有对勾自身的内缩和字母的侧边距，约 2px：对勾读作提及的一部分，词间空格在它后面。原先再多 2px 时，对勾的墨迹离名字 4px，几乎是一个词间空格，看上去像漂在两个词中间。它以字母的大写字母高度居中，这也是引用里每个图标居中的那条线（[对齐](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）；不像上标那样抬高，也不降到 x 字高。它的盒子在行内放得下，所以提及和这一行的高度都不变。
- 对勾的墨迹离提及边缘的距离，和 `@` 开始的距离相同（[对齐](../../../../../design/foundations/alignment.md#chips)）。Lucide 把对勾画在盒子内 3/24 处，其他图标只留 1/24，大约是一个字母的侧边距，所以标记在它那一端把多出的 2/24 收回来。
- 不要用状态灯来标记。方形的灯表示在线状态和任务状态：表示已读的青柠色也是在线的灯，所以一个已读的提及看起来像一个在线的 agent（[Status](../status/status.md#presence-lights)）。`MessageReferenceIndicator` 是原来放它的、在提及右上角的插槽，仍然能渲染；不要用它做已读回执。

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
| 搜索命中 | 行里有 `MessageItemSearchMatch` 时，整行用 `info-soft` |
| 多选中被选中 | 当 `MessageMultiSelectCheckbox` 勾选时，整行用 `info-soft` |
| Agent 正在工作 | 头像上一盏静止的黄灯，加上行内状态（[工作中的 agent](../../../../../design/people-and-agents/working-agents.md)） |
| 发送者已离开、被移除或已删除 | `MessageItemSenderBadges` 里一个弱化的徽标；已删除 agent 的头像变灰 |
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
- 悬停工具栏在悬停时、焦点在行内时，以及它的某个弹出层打开时出现。它骑在高亮的上边缘，靠右。
- 悬停只增加信息，从不拿走信息。悬停在一条消息上，正是人想了解它的时候，所以工具栏出现在空白处，而不是盖住原来的内容。
- 时间属于发送者：谁说的、什么时候说的，要作为一个整体来读，所以时间跟在名字、徽标和角色后面，悬停时也留在那里。右上角只属于工具栏。
- 用鼠标时，标题栏在工具栏开始的地方结束，所以不管发送者那一行多长，工具栏都不会盖住它。这段空间由 `--mi-toolbar-reserve` 设定，按三个按钮的宽度计算；工具栏按钮更多的产品，在消息列表上设置它。在触屏上没有悬停工具栏，标题栏保持全宽。
- 发送者那一行放不下时，`MessageItemSenderGroup` 按固定顺序让出空间：先截断角色，再截断名字。徽标在名字旁边保持完整，时间从不截断（[一行放不下时](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)）。名字和角色可能被截断时，在工具提示里显示完整内容。
- `MessageItemDelegatedBy` 按自身宽度占位，最多占这一行的 45%；超出时只截断助理的名字。当它的文字本身就比这更宽时（手机上的 "sent by a deleted assistant"），它的宽度就是文字的宽度，改由发送者的名字让出空间：这些文字从不截断，也从不跑到时间下面。发送者的名字至少保留 3rem，名字更短时保留全部；连这也放不下时（360px 宽的消息列面板，还要给工具栏留位置），纯文字按需要换成多行，第一行落在名字的基线上，时间留在第一行，不碰到工具栏。名字周围的文字从不截断：产品在名字两边的空格按原样保留，名字两边都有文字的翻译（中文）两边都保持完整。

```example
message-item/compositions/delegated-long-names
```

- 工具栏高 36px：28px 的按钮，16px 的图标，距外框 4px，按钮之间间隔 4px，细线画在这个高度之内。它骑在高亮的上边缘，向上伸出 18px，即自身高度的一半；在一组的第一行上，透明的 8px 边框占去其中一部分，所以它只超出这一行 10px。它的按钮是 `MessageItemToolbarButton`，不是 [Button](../button/button.md)。它保持这么紧凑，是因为它出现在鼠标指针下的每条消息上：做成 38px 时，它会盖住发送者那一行，并在第一条消息上方被裁掉。
- 工具栏和所有弹出层一样用 `radius-container`。它的按钮是嵌在外框里的控件，所以用 `radius-chip`，就像输入框、消息输入框和卡片角落里的按钮一样（[外框之内](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 在滚动区域的第一条消息上方和消息列的根消息上方至少留 18px，这样工具栏永远不会被裁掉。以日期行开头的时间线已经有这个空间。
- 任务标记打开任务。状态在任务里修改，不在标记上修改。

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
- 给每个 `MessageItemToolbarButton` 一个 Title Case 的 `aria-label`：Reply in Thread、Add Reaction、Save。工具栏在键盘焦点进入时显示，所以按 Tab 能到达它。
- `MessageReactionChip` 封装了 Base UI `Toggle`：`aria-pressed` 表示这个人是否回应了。给它一个 `aria-label`；里面画出来的回应是隐藏的（[品牌](../../../../../design/foundations/brand.md#reactions)）。
- 回应失败的原因放在 `MessageReactionErrorIndicator` 里，它是一个视觉上隐藏的 `role="status"`。
- `MessageTextSelectionToolbar` 封装了 Base UI `Toolbar`；给它一个 `aria-label`。
- 给 `MessageMultiSelectCheckbox` 一个指明是哪条消息的标签，比如 "Select message from Bugen"。
- 能打开某个东西的引用标签片，通过 `render` 渲染成链接；标签片默认是 `span`。应用链接在新标签页打开，带 `rel="noopener noreferrer"`。
- 给 `MessageReferenceIcon` 里的应用图标一个空的 `alt`：旁边的标题已经说明了这个链接。
- 给头像图片一个空的 `alt`：旁边的名字已经说明了是谁。
- `MessageItemDelegatedAvatar` 是 `aria-hidden`："sent by Friday" 是标题栏里的纯文字，按它的顺序读出（名字、角色、"sent by Friday"、时间）。产品给整行命名（`aria-label`）时，用同样的文字。`MessageItemDelegatedByButton` 是一个 `<button>`；它跳到个人资料页时，通过 `render` 渲染成链接。
- 给 `MessageItemTime` 和 `MessageItemContinuationTime` 的 `dateTime` 传入时刻（ISO 8601），并在工具提示里显示完整的日期和时间。读屏软件按显示的顺序读标题栏：名字、徽标、角色、时间。

## 规则 {#rules}

- `MessageItemDelegatedAvatar` 只放在人的头像上，永远不和在线状态灯一起用（[Avatar](../avatar/avatar.md#rules)）。
- 不要给消息加边框，也不要给 agent 用气泡颜色。只有嵌入的内容（代码块、附件、操作卡片）看起来像卡片。
- 页脚里先放任务标记，然后是回应，添加按钮放最后。
- 任务标记做成状态标签：状态像素点、任务编号和负责人（[Tasks](../tasks/tasks.md)）。
- 每个表情只显示一个回应标签片。这个人自己添加的回应用 `attention-soft`。
- 让标签片的墨色离左边缘和离右边缘一样远（[对齐](../../../../../design/foundations/alignment.md#chips)）。带图标的引用标签片和回应把内边距平均分配，两端各 4.5px 和 7px，总量和宽度与以前相同：Lucide 图标在它的方框里留出的空白和旁边的字母差不多，而表情或应用图标画满到边缘。收藏标记在书签图标前留 5.5px（书签画在方框内 2.3px 处），在文字后留 6.5px。
- 引用标签片标签后面的注记放在 `MessageReferenceSuffix` 里，不要放在自己写的 span 里。它在布局中保持在标签的基线上，绘制时上移字号差的四分之一，让两者 x 高度的中线对齐；标签保持在句子的基线上。
- 回应标签片高 24px，点击区域 44px（[间距](../../../../../design/foundations/spacing.md#hit-targets)）。
