---
title: 任务
summary: 五种任务状态，任务列表和看板，任务详情，从消息创建、列在对话旁边的任务，状态怎么改，以及任务怎么筛选。
sourceHash: 6004d753
---

# 任务

任务有五种状态之一，每种状态的颜色固定：Todo、In Progress、In Review、Done 和 Closed。任务出现在哪里都以同样的方式显示：同一个筛选栏下的看板或列表，或者对话旁边的紧凑行，详情在居中的对话框里。人和 Agent 处理的是同一个任务，所以它在每个显示它的屏幕上都必须看起来一样、用起来一样。

## 适用范围 {#when-it-applies}

产品的任务页面，以及一个地方的任务视图。在 Raft Chat 里，就是 Tasks 这个目的地和频道的 Tasks 卡片（[Raft Chat — 任务](../products/raft-chat/tasks.md)）；一个产品提供哪些筛选和哪些创建操作，写在它自己的页面上。

## 结构 {#structure}

```example
tasks/compositions/tasks-panel
```

- **任务列表或看板**：顶部是筛选栏，右端是 Board / List（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)）。在手机上，Board / List 只显示图标。
  - 看板每种状态一栏，每栏 232px 宽（[TaskBoard](../../packages/ui/src/components/task-board/task-board.md)）。
  - 列表按状态给任务分组（[TaskList](../../packages/ui/src/components/task-list/task-list.md)）。
  - 两者用同一种卡片（[TaskCard](../../packages/ui/src/components/task-card/task-card.md)），都按上面的顺序显示五种状态，每种都有可折叠的标题和计数。
- **任务详情**：居中的对话框，960px 宽（或窗口宽度减 32px），最高 900px（窗口的 86%），在手机上全屏。从上到下：
  1. 一条栏：任务的引用（`#design:#25`：先是地方，然后是编号；见[引用任务](#referring-to-a-task)），在有对话的产品里还有关注这个任务的 Agent 和 More 菜单（Follow Task 或 Unfollow Task），和消息列的标题栏一样（[消息列](./conversation.md#threads)），以及 ×。在手机上，这条栏用 Back 代替 ×。这条栏没有在单独的窗口里打开任务的按钮，消息列也没有：任务窗口从它的 URL 打开，和消息列窗口一样。
  2. 标题和描述，描述超过 3 行后折叠。
  3. 属性放在行内的 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline)（`direction="inline"`）里：Status、Assignee、Source、Created by 和 Created at。负责人的显示和任务行上一样：头像和名字。只有从消息创建的任务才有 Source：发送者的头像和名字、消息的第一行和它的时间。在一行属性上，文字共用一条基线：标签、状态标签的名称和负责人的名字、Source 的发送者和摘录，以及时间（[一行中不同大小的文字](../foundations/alignment.md#text-of-different-sizes-on-one-line)）。没有文字的标记，也就是头像、V 形箭头和 Source 后面的 ↗，在这一行的行框里居中（[引领文字的标记](../foundations/alignment.md#a-mark-that-leads-text)）。不裁剪文字，也不做微调。任务行遵循同一条规则（[紧凑列表的行](#rows-in-a-compact-list)）。在任务有自己的讨论之前创建的任务，还有 Earlier discussion，写出它的消息有多少条回复。
     每个属性都遵循行内 DescriptionList 的同一种排布：各项像一行文字那样接着排，相隔 24px，只有这一行放不下时，一项才移到下一行，往下 8px。没有哪一项单独占一行、有自己的宽度或自己的间隔。每一项都是同样 28px 高的一行，所以各行间距均匀，中心相距 36px：有状态标签和负责人头像的那一行不比一行纯文字高，头像的在线状态灯完整显示，不会被它的触发按钮裁掉。每一项最宽 24rem（对话框更窄时，就是对话框的宽度），所以过长的 Source 以省略号结尾，和其他项共用一行：在桌面端的对话框里，Status、Assignee、Source 和 Created by 在同一行；在手机上，每一项占这一行更多的宽度，它们按同样的顺序、同样的间隔换行。用这种排布，而不用标签/值的网格，是因为属性只是几条简短的信息：网格让每一项各占一行，把讨论往下推。
  4. 历史，默认收起（[Timeline](../../packages/ui/src/components/timeline/timeline.md)）。
  5. 在有对话的产品里，任务的讨论和它的消息输入框（"Message this task"）。

## 规则 {#rules}

- 只用这五种状态。"Needs you" 不是状态：它是一个操作（操作卡片上的按钮）和一个提醒圆点。也不要加一个 "needs you" 分组或颜色：第六个分组里的任务同时也在五种状态之一里，而等着人处理的东西在对话里已经有它的位置。
- 手机上默认用列表，桌面端默认用看板，因为手机放不下五栏。记住这个人上次的选择。
- 看板和列表里，Done 和 Closed 默认收起：它们只会越来越多，而人们来看的是进行中的工作。
- 状态标签是卡片上唯一能就地修改的东西。选中卡片的其他部分会打开任务详情。
- 人们可以从卡片上的状态标签、详情里的属性改状态，也可以把卡片拖到看板的另一栏。不能修改任务的人看到的状态标签没有菜单，也不能拖动。
- 状态标签的菜单里只提供从当前状态允许的变更，这样人们永远不会选到一个随后会失败的操作。
- 任务详情用居中的对话框打开，从不放在侧面板或侧边卡片里：任务有自己的讨论，所以不是放在对话旁边读的（[页面结构](./page-structure.md#sidebar-and-side-panel)）。用 ×、Esc 或点击对话框外部关闭。
- 只在列出多个地方的任务时，才在卡片上写出任务所在的地方。在一个地方的视图里，页面本身就是那个地方。
- 列表加载时，在它的位置显示骨架屏卡片（[反馈](./feedback.md#empty-loading-and-failed)）。

### 在哪里创建任务 {#where-tasks-are-created}

- 创建操作放在任务所属的地方，不放在汇集多个地方任务的页面上：在那里创建的任务没有所属的地方。
- 在有对话的地方，创建按钮放在它的 Tasks 卡片的标题栏里（[对话旁边的任务](#tasks-beside-a-conversation)），消息菜单里放 Create Task from Message。

### 对话中的任务 {#tasks-in-a-conversation}

在任务来自对话的产品里，任务是从消息创建的；消息不是任务。任务有自己的标题、描述和讨论，并链接回它来源的那条消息。一条消息可以是多个任务的来源，一个任务也可以只属于这个地方，不关联任何消息。

- 从一条消息创建的任务，以列表显示在消息内容下面、回复上面：每个任务一行，有编号（`#25`）、标题，标题后面是它讨论里的消息数，然后是负责人（头像和名字；对本人显示 "You"）和状态标签，一起放在右端。一个列表可以有任意数量的任务；回复仍然是这条消息本身的讨论。这些行就是[紧凑列表的行](#rows-in-a-compact-list)里的紧凑行。
- 装着列表的框，宽度由内容决定：至少 320px 宽（所在栏更窄时，就是整栏的宽度），最多是消息栏的宽度。标题保持一行，这一行放不下时以省略号结尾：在任务有自己的讨论之前创建的任务，标题是整条消息，它的详情里显示全文。
- 消息数紧跟在标题后面，在同一行内：紧跟标题的最后一个词，标题被截断时紧跟省略号，两种情况的空隙一样小。被截断的标题和数字之间永远不要留空：标题只让出这一行缺的那点空间。这个数统计的是标题所指的那段讨论，所以它属于标题，不属于负责人。
- 负责人和状态标签作为一组放在每行右端，负责人紧挨状态标签。不要跨行把它们对齐成列。一行窄得放不下一个可读的标题和这一组时，这一组整体换到第二行，仍然靠右，而不是挤压标题。
- 在消息列顶部的那条消息下面，显示同样的列表。
- 从行打开任务详情。不要从行改状态：它是指向任务的链接，状态在详情里修改。
- 人们用消息菜单里的 Create Task from Message 从消息创建任务。它打开 Create Task，引用这条消息，并把消息的文字作为初始标题，人们可以修改。
- 不要在消息输入框里提供 As Task：人们发送的是消息，任务之后再由人或 Agent 从消息创建。
- 任务发生的事（创建、认领、指派、移动）写成任务讨论里的事件行，不写在对话里，也不写在它来源消息的消息列里（[交接与审批](../people-and-agents/handoffs-and-approvals.md#claiming-work)）。
- 任务的讨论显示在任务详情里，让讨论和状态放在一起读。关注任务和关注消息列的方式一样（[交接与审批](../people-and-agents/handoffs-and-approvals.md#following-a-task)）。
- 在从消息创建的任务的详情里，选中 Source 会关闭对话框，跳到那条消息在它所在地方的位置，那条消息显示被定位的高亮，和每一次跳转一样（[被定位](../foundations/states.md#located)）。选中 Earlier discussion 会打开这个任务原来那条消息的回复。
- 任务的讨论一有消息，就用 Space Mono 显示消息数。只对关注这个任务的人，在数字前加提醒圆点。
- 在任务有自己的讨论之前、消息就是任务时创建的任务，只有第一次有内容写进去时才有讨论。在讨论的位置显示空状态（"No discussion in this task yet"，说明之前的讨论在它的消息的回复里），消息输入框随时可用，而不是显示消息的回复；第一条消息开始任务的讨论。

### 对话旁边的任务 {#tasks-beside-a-conversation}

一个地方的任务以 Tasks 卡片的形式打开在它的对话旁边（[页面结构](./page-structure.md#sidebar-and-side-panel)），让人们在聊天时看到工作的进展。人们不需要在那里读完每个任务：这张卡片回答的是什么在推进、什么在等他们。

- 卡片的标题栏里放标题 Tasks，然后是创建按钮和 ×。标题栏里没有计数：紧接在它下面的 All 和 For Me 筛选已经带着数字。在手机上，卡片盖住这个地方标题栏下面的对话，用标题栏的 Back 关闭：卡片自己不画 Back 或 ×，所以屏幕上只有一个 Back。
- 标题栏下面放 All / For Me（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)），每项带它未完成任务的数量。For Me 列出指派给这个人的任务。
- 任务按状态分组，顺序是 In Progress、In Review、Todo、Done、Closed：在窄卡片里，正在推进的工作排在前面。每组有一个可折叠的灰色标题，带状态像素点和计数，Done 和 Closed 默认收起。每个标题采用 [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md) 分区标题的间距，文字上方 16px、下方 6px，放在一个 40px 的框里，各组之间不另加间隔，所以标题贴着它自己的行，离上一组（大约 25px）明显比离它的第一行（16px）更远（[间距节奏](../foundations/comfort.md#spacing-rhythm)）。触屏时它的目标区域向上延伸 4px，到 44px。
- 每个任务一个紧凑行：编号，一行标题（截断时以省略号结尾），标题后面紧跟它讨论里的消息数，然后右端是负责人（头像和名字；Agent 的头像带在线状态灯，对本人显示 "You"）和一个 V 形箭头。行里不放状态标签：分组已经写明了状态。卡片太窄时，负责人换到第二行，仍然靠右，和消息下面的列表一样。这些行和消息下面、Files 卡片里的紧凑行相同（[紧凑列表的行](#rows-in-a-compact-list)）。
- 从行打开任务详情。

### 紧凑列表的行 {#rows-in-a-compact-list}

消息下面的任务、Tasks 卡片和 Files 卡片是同一种列表，用同一种行。和 [ListRow](../../packages/ui/src/components/list-row/list-row.md) 列表一样，它是内容：行与行之间用细线，整行都是点击目标，每行没有单独的卡片。一行读起来就是一行：左边是它是什么，右边是谁负责、进展到哪。

| 部分 | 规格 |
| --- | --- |
| 行 | 一行，用鼠标时至少 36px 高，在手机或触屏上至少 44px（[间距](../foundations/spacing.md#hit-targets)），内容上下各 6px。行内方向的内边距就是它所在那一栏的边距：在侧边卡片里是 16px，所以行和卡片标题栏从同一条线开始；在消息下面的框里是 12px |
| 对齐 | 这一行上的文字共用一条基线：任务的编号、标题、消息数、负责人的名字、状态标签的文字、文件的大小和时间（[一行中不同大小的文字](../foundations/alignment.md#text-of-different-sizes-on-one-line)）。没有文字的标记，即头像、状态像素点、V 形箭头和图标（文件的类型图标、消息数的图标、各个操作），在标题那一行的行框里居中（[引领文字的标记](../foundations/alignment.md#a-mark-that-leads-text)）。不裁剪文字，也不做微调，和一行属性一样 |
| 开头 | 可选，在标题那一行：任务的编号（`#25`），用 Space Mono 和 `foreground-hint`；或者文件 20px 的类型图标或缩略图 |
| 标题 | `text-callout`，`foreground`，一行，截断时以省略号结尾 |
| 行内信息 | 紧跟标题，相距 6px，或紧跟省略号：任务的消息数（一个图标和用 Space Mono 写的数字），或者用 Space Mono 写的文件大小。它属于标题，所以标题只让出这一行缺的空间 |
| 尾部一组 | 在右端，各部分相距 8px。任务：负责人（19px 头像和 `text-caption` 的名字），然后是状态标签，在 Tasks 卡片里则是一个 V 形箭头。文件：分享的时间，紧凑写法，用 Space Mono（今天写时刻，按这个人选的 12 小时制或 24 小时制；今年更早写月和日，Oct 21；更早的年份写日期，2025-10-21；完整的日期和时间放在工具提示里），然后是它的操作（Jump to Message 和 Download，560px 以下是一个 ⋮ 菜单），最后一个图标框落在行的边距上，点击区域向外伸出，左右伸出，上下各 4px，所以文件行和任务行一样高（[对齐](../foundations/alignment.md#the-ends-of-a-header)）。只有标题会少于 160px 时，这一组才整体换到第二行，仍然靠右：在侧边卡片默认的 360px 时，任务行和文件行都保持一行 |
| 分隔线 | 行之间用 `line-hairline`，一直延伸到列表的容器看得见的边界（[分隔线](../foundations/comfort.md#separators)）。在消息下面，框里只有这些行，所以线从一边贯穿到另一边，碰到框的边框。在侧边卡片里（无论浮动还是在消息旁边）以及在手机上，列表只是一张卡片的一部分，这张卡片还有标题栏、筛选和分组标题；或者是一个完全没有边的页面的一部分，所以线在两侧都缩进行的内边距：从行内容开始的地方开始，到行内容结束的地方结束，离两边各 16px。悬停仍然填满整行。列表或状态分组的第一行上方没有线 |
| 容器 | 在消息下面，行放在一个由内容决定大小的框里（见[对话中的任务](#tasks-in-a-conversation)）：`line-hairline` 边框，`radius-container`（它是一个容器，见[形状](../foundations/shape.md)），`layer-card`。在侧边卡片里，行从一边贯穿到另一边，行间没有间隔，卡片的标题栏、筛选和分组标题与它们共用 16px 边距 |
| 分组标题 | Tasks 卡片里的状态标题用来折叠它的分组。它是行上方的标签，不是一行，所以它采用可折叠分组标题的状态：悬停和按下时，它的文字和 V 形箭头从 `foreground-hint` 变成 `foreground`，不铺填充，也不加下划线；键盘焦点显示内嵌的环（[可折叠的分组标题](../foundations/states.md#collapsible-group-headings)）。填充会让它看起来像又一行，而且框住文字时上下不均，因为标题把文字放在框的底部，贴着它所指的行 |
| 状态 | 悬停在整行上铺浅档叠加层（`overlay-subtle`），按下铺中档（`overlay-medium`），键盘焦点是一个内嵌的环（[悬停与按下](../foundations/states.md#hover-and-press)）。文件的操作仍然是各自的按钮，叠在行的上面；Jump to Message 跳到那条消息，消息显示被定位的高亮（[被定位](../foundations/states.md#located)） |

- 不要给这些列表的行各加一张卡片，也不要在行之间留间隔。每行一张卡片会把一张窄窄的侧边卡片变成一摞控件，三种列表也就不再像同一种。
- 不要在标题下面放第二行详情（大小、时间、角色）：详情放在行内信息或尾部一组里。只有尾部一组换行时，一行才有第二行。
- 不要跨行把尾部一组对齐成列。

### 引用任务 {#referring-to-a-task}

任务编号只在它所在的地方唯一，所以引用先写地方：`#design:#25`，私信里是 `dm:@ada:#25`。它读作「#design 的 #25」，在任何地方都能打开这个任务。

- 任务引用写成地方、`:`，然后是带 `#` 的编号。Agent 写的、读的都是同一种引用。
- 引用渲染成打开任务详情的链接，在任何地方都是，对能看到那个地方的人有效。对其他人，它保持为纯文本。
- 链接渲染成带任务状态颜色的任务标签片（它的状态像素点和浅色底），和消息下面的任务列表用的是同一种标签片，这样引用读起来就是「哪个任务，进展到哪」。不要把引用拆成颜色不同的几部分：它是一个名字，而状态已经有像素点和浅色底。产品还没有加载这个任务时（别的地方的任务），按地方和编号去读取它；在那之前，引用是一个只有描边的标签片，`line-hairline` 边框围着 `foreground-muted` 的文字，没有浅色底，也没有像素点。永远不要把它显示成灰色标签片，那会读成 Closed。
- 单独写 `#25` 仍然指正在读的这个地方的任务 25。

### 筛选 {#filters}

一个产品提供哪些筛选，写在它自己的页面上。每个筛选都遵守同样的规则：

- 每个筛选是一个 [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md)，打开一个带搜索的列表。可以选多个值。
- 生效的筛选显示为 `info-soft`，并用 Space Mono 写出选中值的数量，这样筛选过的视图看起来永远不会像完整的列表。
- 按人筛选时，人和 Agent 列在一起。快捷项放在最前（"Created by me"、"Assigned to me"，然后是 "Unassigned"），作为列表里的行而不是单独的按钮，不带头像；然后是按 A 到 Z 排列的人和 Agent。
- 有任何筛选生效时，在筛选后面显示 Clear All，一个幽灵按钮。
- 筛选保存在地址里，这样筛选过的视图可以分享和重新加载。

## 相关 {#related}

- [交接和审批](../people-and-agents/handoffs-and-approvals.md#handing-off)：认领和交接。
- [颜色](../foundations/color.md#statuses)：状态颜色。
- [任务组件](../../packages/ui/src/components/tasks/tasks.md)：`TaskChip` 和 `TaskStatusBadge`。
