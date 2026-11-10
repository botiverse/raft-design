---
title: 任务
summary: 五种任务状态，任务页面（Mine 和 All，它的列表和看板，选择任务，在页面这一行里打开的任务），任务详情，完成、添加和编辑任务，从消息创建、列在对话旁边的任务，状态怎么改，以及任务怎么筛选。
sourceHash: 60d5b96d
---

# 任务

任务有五种状态之一：Backlog、Todo、In progress、Done 和 Closed。其中四种的颜色固定；Backlog 没有颜色。任务像待办清单一样用：在一个地方自己的视图里，每个任务行最前面是一个圆形的完成控件，点一下就把它标为 Done；输入标题就能添加任务；任何状态都能改成任何其他状态。在此之上，任务保留了 Raft 给待办事项加上的东西：负责人可以是人，也可以是 Agent；还有它自己的讨论。In review 已停用（[决策 0043](../decisions/0043-in-review-retired.md)）：任务对话出现之前的老任务可能还处于这个状态，在它被移走之前，保留它的标签和它的分组或列。任务用两种视图显示。一个地方自己的视图（对话旁边的 Tasks 分区、消息下面的列表）显示紧凑行，任务详情在居中的对话框里打开。产品里汇集多个地方任务的页面，在一个工具栏下面显示列表或看板，先列出这个人自己的工作，让人一次处理很多任务，并在列表旁边的一列里打开任务（[任务页面](#a-page-of-tasks)；[决策 0045](../decisions/0045-the-tasks-page.md)）。人和 Agent 处理的是同一个任务，所以任务的行、标签片和详情在每个显示它的屏幕上都看起来一样、用起来一样。

## 适用范围 {#when-it-applies}

产品的任务页面，以及一个地方的任务视图。在 Raft Chat 里，就是 Tasks 这个目的地和频道的 Tasks 分区（[Raft Chat — 任务](../products/raft-chat/tasks.md)）；一个产品提供哪些筛选和哪些创建操作，写在它自己的页面上。两种视图不同的地方，下面每条规则都写明它适用于哪一种。

## 结构 {#structure}

```example
tasks/compositions/tasks-panel
```

raft-ui 尚未实现：这个示例显示的是 [0042](../decisions/0042-tasks-as-a-to-do-list.md) 之前的任务，只有五种状态，没有完成控件，也没有快速添加。这一页的规则描述的是重新设计后的样子。

- **任务页面**（产品里汇集多个地方任务的页面）：头部有标题、计数和搜索，下面是工具栏（Mine / All、筛选、排序、List / Board 和 New task），然后是列表或看板（[任务页面](#a-page-of-tasks)）。在手机上，List / Board 只显示图标（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)）。
  - 列表在 Mine 里按这个人和任务的关系分组，在 All 里是一个平铺的列表，从不按状态分组。它的行是可以选择的行（[列表](#the-list)）。
  - 看板每种状态一栏，每栏 232px 宽，顺序是 Backlog、Todo、In progress、Done、Closed，也就是工作从左往右流动的方向，每栏都有可折叠的标题和计数（[TaskBoard](../../packages/ui/src/components/task-board/task-board.md)）。它的卡片是 [TaskCard](../../packages/ui/src/components/task-card/task-card.md)。
- **一个地方的 Tasks 分区**：按状态分组的紧凑行，放在这个地方的对话旁边（[对话旁边的任务](#tasks-beside-a-conversation)）。
- **任务详情**：从一个地方的视图打开时，是居中的对话框，960px 宽（或窗口宽度减 32px），最高 900px（窗口的 86%），在手机上全屏。从任务页面打开时，同样的部分改为放在页面这一行的一列里，在列表旁边（[打开的任务](#the-open-task)）。从上到下：
  1. 一条栏：任务的引用（`#design:#25`：先是地方，然后是编号；见[引用任务](#referring-to-a-task)），在有对话的产品里还有关注这个任务的 Agent 和 More 菜单（Follow task 或 Unfollow task，然后是一条分隔线和 Delete task），和消息列的标题栏一样（[消息列](./conversation.md#threads)），以及 ×。在页面这一行的一列里，Expand 放在 More 菜单和 × 之间，和消息列的头部一样（[Panel](../../packages/ui/src/components/panel/panel.md#rules)）。在手机上，这条栏用 Back 代替 ×。这条栏没有在单独的窗口里打开任务的按钮，消息列也没有：任务窗口从它的 URL 打开，和消息列窗口一样。
  2. 标题和描述，描述超过 3 行后折叠。两者都就地编辑（[编辑任务](#editing-a-task)）。
  3. 属性放在行内的 [DescriptionList](../../packages/ui/src/components/description-list/description-list.md#inline)（`direction="inline"`）里：Status、Assignee、Source、Created by 和 Created at。负责人的显示和任务行上一样：头像和名字。只有从消息创建的任务才有 Source：发送者的头像和名字、消息的第一行和它的时间。在一行属性上，文字共用一条基线：标签、状态标签的名称和负责人的名字、Source 的发送者和摘录，以及时间（[一行中不同大小的文字](../foundations/alignment.md#text-of-different-sizes-on-one-line)）。没有文字的标记，也就是头像、V 形箭头和 Source 后面的 ↗，在这一行的行框里居中（[引领文字的标记](../foundations/alignment.md#a-mark-that-leads-text)）。不裁剪文字，也不做微调。任务行遵循同一条规则（[紧凑列表的行](#rows-in-a-compact-list)）。在任务有自己的讨论之前创建的任务，还有 Earlier discussion，写出它的消息有多少条回复。
     每个属性都遵循行内 DescriptionList 的同一种排布：各项像一行文字那样接着排，相隔 24px，只有这一行放不下时，一项才移到下一行，往下 8px。没有哪一项单独占一行、有自己的宽度或自己的间隔。每一项都是同样 28px 高的一行，所以各行间距均匀，中心相距 36px：有状态标签和负责人头像的那一行不比一行纯文字高，头像的在线状态灯完整显示，不会被它的触发按钮裁掉。每一项最宽 24rem（对话框更窄时，就是对话框的宽度），所以过长的 Source 以省略号结尾，和其他项共用一行：在桌面端的对话框里，Status、Assignee、Source 和 Created by 在同一行；在手机上，每一项占这一行更多的宽度，它们按同样的顺序、同样的间隔换行。用这种排布，而不用标签/值的网格，是因为属性只是几条简短的信息：网格让每一项各占一行，把讨论往下推。
  4. 历史，默认收起（[Timeline](../../packages/ui/src/components/timeline/timeline.md)）。
  5. 在有对话的产品里，任务的讨论和它的消息输入框（"Message this task"）。

## 规则 {#rules}

- 只用这五种状态。"Needs you" 不是状态：它是一个操作（操作卡片上的按钮）和一个提醒圆点。也不要加一个 "needs you" 分组或颜色：第六个分组里的任务同时也在五种状态之一里，而等着人处理的东西在对话里已经有它的位置。
- 有人创建了、或者先放到一边、现在不打算做的工作，放进 Backlog（「现在不做」）；不会做的工作放进 Closed。Backlog 留住一个以后可能回来的任务，又不把它算作当前要做的工作；Closed 则结束它。Backlog 没有色相（[颜色](../foundations/color.md#statuses)）。
- 在任务页面上，默认用列表，手机和桌面端都一样，并记住这个人上次的选择。列表回答的是人们打开这个页面要问的事：什么在等这个人，这个人交出去的工作进展如何。看板回答的是每个任务处于哪种状态，而有了任务对话以后，状态说明的东西，不如谁负责这个任务、它有没有推进说明得多（这是 Noel 对这个页面用途的理解，stdrc 随高保真设计采纳，2026-11-10，#wg-task-v2:8a7ae237）。看板以前是桌面端的默认视图，因为桌面端放得下五栏；现在按一下就能切过去。
- 在任务页面的看板上，默认只收起 Closed：Closed 是不会做的工作。Backlog、Todo、In progress 和 Done 保持展开，因为在这个页面上，人们既看什么在推进，也看什么已经完成；而且每栏按页面的排序一次读取一页任务，所以很长的 Done 栏在滚动到之前不花任何代价（规则：2026-11-10 批准的高保真设计；理由：Jasper 的理解，Noel 在 #wg-task-v2:8a7ae237 里确认）。在一个地方的 Tasks 分区里，Backlog、Done 和 Closed 默认收起：Backlog 是现在不打算做的工作，Done 和 Closed 只会越来越多，而在对话旁边窄窄的分区里，人们来看的是进行中的工作（[对话旁边的任务](#tasks-beside-a-conversation)）。页面的列表没有状态分组：Mine 改为不列出已经结束的任务（[列表](#the-list)）。
- 一个地方的视图里（Tasks 分区、消息下面的列表），每个任务行都以完成控件开头（[完成任务](#completing-a-task)）。在任务页面上，行和卡片没有完成控件：行以它的选择复选框开头，状态在看板上、选中多项时的工具栏里或任务里修改（stdrc，2026-11-09，#wg-task-v2:8a7ae237：「为什么任务前面还有一个复选框」）。圆形控件放在方形的选择复选框旁边，会让一行开头有两个看起来很像、作用却不同的框；[0042](../decisions/0042-tasks-as-a-to-do-list.md) 选择圆形，正是因为那里的方框读作「选中这一行」，而在这个页面上它就是这个作用。在卡片上，状态标签是唯一能就地修改的东西；选中卡片的其他部分会打开任务。
- 人们可以从卡片上的状态标签、详情里的 Status 属性改状态，可以把卡片拖到看板的另一栏，可以在一个地方的视图里用完成控件，在任务页面上还可以用选中多项时的工具栏里的 Status，一次改所有选中的任务。不能修改某个任务的人，看到它的状态标签没有菜单，完成控件是禁用的，也不能拖动它的卡片；一次改多个任务时，跳过这个人不能修改的任务，并说明跳过了多少个。
- 从任何状态都能改到任何状态，对人和 Agent 都一样：状态标签的菜单和 Status 属性列出全部五种，当前状态带一个对勾；卡片可以拖进看板的任何一栏。状态变更没有限制：状态说明工作在哪一步，知道的人一步就能设好，而事件行和历史会记下是谁、在什么时候移动的。没有哪种状态要求先满足别的条件：没有负责人的任务也可以是 In progress。
- 从一个地方的视图打开任务详情时，用居中的对话框，从不放在侧面板或侧边分区里：任务有自己的讨论，所以不是放在对话旁边读的（[页面结构](./page-structure.md#sidebar-and-side-panel)）。用 ×、Esc 或点击对话框外部关闭。在任务页面上，任务改为在页面这一行的一列里打开，列表就是这一行的对话（[打开的任务](#the-open-task)）：页面没有自己的对话，所以任务的讨论是屏幕上唯一的讨论，而列表留在视野里，方便打开下一个任务（stdrc，2026-11-09 和 2026-11-10，#wg-task-v2:8a7ae237）。
- 只在列出多个地方的任务时，才在卡片或行上写出任务所在的地方。在一个地方的视图里，页面本身就是那个地方。
- 任务加载时，显示和即将出现的内容形状一样的骨架屏：看板上每栏一张骨架屏卡片，列表里分区标题下面是骨架屏行（[反馈](./feedback.md#empty-loading-and-failed)；[第一帧就是稳定下来的样子](./responsive.md#the-first-frame-is-the-settled-one)）。

### 把任务移到 Backlog {#moving-a-task-to-backlog}

- 任务从别的状态移进 Backlog 时，不管用哪种方式，都请人写一个原因：什么情况下它会回来。在一个小的 [Popover](../../packages/ui/src/components/popover/popover.md) 里问，它锚定在这个人用的东西上，也就是状态标签、Status 属性或卡片被拖进的那一栏；里面是一个单行的 [Input](../../packages/ui/src/components/input/input.md)，然后是 Cancel 和 Move to Backlog。原因是可选的：输入框留空时点 Move to Backlog，任务就不带原因地移过去。
- 点 Cancel、按 Esc 或点击弹出层外部，任务都留在原处；拖过去的卡片回到它原来那一栏。
- 原因记在任务的历史里，也写进这次移动在任务讨论里留下的事件行："Martin moved #25 to Backlog: waits for the server-side record"。没有原因时，这一行是 "Martin moved #25 to Backlog"。
- 任务创建时就放在 Backlog 里的，不要问原因：新任务还没离开过哪里，谈不上回来。

### 任务列表里的键盘操作 {#keyboard-in-a-list-of-tasks}

任务列表（对话旁边和消息下面的行、任务页面的行、[TaskList](../../packages/ui/src/components/task-list/task-list.md) 里的卡片）是一个网格，所以再长的列表也只占一次 Tab，其余的交给方向键。

- 列表用 `role="grid"`，每个任务是一个 `role="row"`。它的单元格是完成控件（在任务页面上是选择复选框）和标题单元格，标题单元格打开任务；在卡片上，状态标签是第三个单元格。
- 列表只有一个 Tab 停靠点，用游走的 `tabindex`（roving tabindex）：Tab 进入列表时落在上次获得焦点的单元格上（最开始是第一行的标题单元格），再按一次 Tab 就离开列表。
- ↑ 和 ↓ 移到上一行和下一行的同一个单元格，← 和 → 在一行的单元格之间移动。
- 在完成控件上，Space 完成任务或重新打开它。在选择复选框上，Space 选中这一行或取消选中。在标题单元格上，Enter 或 Space 打开任务。
- 焦点环显示在获得焦点的单元格上（[焦点](../foundations/states.md#focus)）。完成的任务移进收起的 Done 分组时，把焦点移到下一行的同一个单元格，让键盘操作留在列表里。
- 在看板上，在卡片上按 Space 仍然是拿起它来移动（[TaskBoard](../../packages/ui/src/components/task-board/task-board.md#accessibility)）。

### 完成任务 {#completing-a-task}

完成控件是逐项处理待办清单的方式：点一下，任务就完成了。它在每个任务行和任务卡片的最前面：对话旁边、消息下面、看板上和列表里都是。

- 用 [TaskCompletionControl](../../packages/ui/src/components/task-completion-control/task-completion-control.md)：一个圆形的 `CheckboxIndicator`（`shape="circle"`），放在一个带 `role="checkbox"` 的 `button` 里，只有已完成的任务 `aria-checked` 为 true。它是圆的，不是 [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) 的方形，原因见[形状](../foundations/shape.md#principles)。
- 用任务给它命名，状态变了名字也不变："#25 Fix onboarding copy"。勾选状态已经说明了它是否完成，所以如果名字说的是点一下会做什么（"Reopen #25"），就会被读成 "Reopen #25, checkbox, checked"。它的工具提示可以写出操作：Complete；在已完成的任务上是 Reopen。
- 只在已完成的任务上显示为勾选。在其他所有状态上，包括 Backlog 和 Closed，它都是未勾选的，点一下就把任务标为 Done，和任何一次状态变更一样。
- 未勾选时，只在鼠标指针停在控件本身上时预览对勾（`previewOnHover`），指针停在行的其他地方时从不预览：悬停在行的其他地方是悬停在行上，不是悬停在控件上（[悬停与按下](../foundations/states.md#hover-and-press)）。即使外面的行或看板栏是 Tailwind 的 `group`，TaskCompletionControl 也这样做。
- 从任何状态点一下都把任务标为 Done。
- 先就地显示结果，再移动任务：标题加上删除线，变成 `foreground-hint`；一个 Toast 显示 "Completed #25"，带 Undo（[Toast](../../packages/ui/src/components/toast/toast.md)）；任务带着删除线在原来的分组里停 650ms，然后移进收起的 Done 分组；开启减弱动态效果时，它立即移过去（[动效](../foundations/motion.md#usage)）。Undo 把它放回原来的状态。点一下就跳走的任务看起来像丢了；这段停顿和 Toast 说明了它去了哪里。
- 在已完成任务的控件上点一下，把它重新打开为 Todo。
- 控件是叠在行或卡片上面的独立按钮。它的点击区域在 20px 的圆外，用鼠标时延伸 8px（36px），在触屏上延伸 12px（44px）（[点击区域](../foundations/accessibility.md#hit-targets)）。用鼠标时只延伸 8px 而不是 12px，这样它永远不会盖住旁边的任务编号。选中行或卡片的其他部分仍然打开任务。
- 对不能修改这个任务的人，控件只用 `aria-disabled` 显示为禁用，永远不用原生的 `disabled`：这样按钮仍能获得键盘焦点，在网格里移动时仍会停在它上面，读屏软件会说它不可用，它的工具提示也能说明原因。按它或按 Space 都没有效果。样式根据 `data-disabled` 来写。TaskCompletionControl 的 `disabled` 会做到这些。

### 在哪里创建任务 {#where-tasks-are-created}

- 每个任务都属于一个地方，所以每种创建方式都要说明是哪个地方。在一个地方里，就是这个人所在的地方。产品里汇集多个地方任务的页面，在工具栏末端有一个 New task 按钮，它打开的 Create task 会问是哪个地方（见下文）；这个页面没有快速添加，因为按一个键说明不了是哪个地方。页面保留 New task，是因为人们到这里来管理任务，而且以前的任务页面就有它：这次重新设计不能丢掉那个页面能做的任何事（stdrc，2026-11-10，#wg-task-v2:8a7ae237）。
- 在有对话的地方，创建按钮放在它的 Tasks 分区的头部里（[对话旁边的任务](#tasks-beside-a-conversation)），快速添加放在分区的 All / For me 下面，消息菜单里放 Create task from message。
- 快速添加是一个输入行，占位文字是 "Add a task"。按 Enter 用这个标题创建一个 Todo 任务；在 For me 里，任务指派给这个人，在 All 里则没有负责人。焦点留在输入框里，输入框清空，等着下一个任务。Esc 清空输入框；输入框已经是空的时，Esc 把焦点移出去。它和待办清单一样，按一个键就创建一个任务；更多的内容（描述、别的状态、负责人）在 Create task 里设置，或者之后在任务详情里设置。
- Create task 做成一个小的表单对话框（[表单](./forms.md#forms-in-a-dialog)），从上到下：
  1. 只在任务页面上有：Channel（所属的地方）。一个带搜索的选择器，列出这个人能在其中创建任务的地方，按 A 到 Z 排列；页面的地方筛选恰好有一个值时预先填好，否则留空。它是必填的，提交表单时如果为空，就在这个字段上报出来（"Pick a channel"）。任务创建后在列表旁边打开。
  2. 标题：每个任务一个输入框，用 Add another 一次创建多个。标题不止一个时，对话框叫 Create tasks，它的按钮写出数量（"Create 3 tasks"）。
  3. 描述，可选，只在恰好有一个标题时出现：描述属于一个任务。
  4. Status 和 Assignee 并排。Status 提供 Backlog、Todo 和 In progress，默认是 Todo，每项带它的像素点。Assignee 先列出 Unassigned，然后是能接这个任务的人和 Agent，默认是 Unassigned；任何状态都可以和任何负责人搭配，包括 Unassigned。Done 和 Closed 不能选：任务是通过它的工作到达这些状态的，不是在创建时。状态和负责人适用于每一个标题。
  5. 标题不止一个时，在它们下面加一行："Status and assignee apply to all 3 tasks."
- 和所有表单一样，在提交时检查表单（[校验](./forms.md#validation)）：填写表单的过程中，没有什么会让创建按钮变成禁用。
- raft-ui 尚未实现：Create task 的示例（`tasks/compositions/create-task-dialog`）显示的是这次重新设计之前的对话框，只有标题。

### 编辑任务 {#editing-a-task}

- 标题和描述在任务详情里就地编辑：选中文字，或者选中它的 Edit 按钮（一个幽灵 `pencil` 图标按钮，悬停和获得焦点时显示），把它变成输入框。按 Enter 或离开输入框就保存；Esc 取消，恢复原来的文字。在描述里，Shift+Enter 换行。没有描述的任务在描述的位置显示 "Add a description"。
- 保存的修改写成任务讨论里的一条事件行（"Martin changed the title"、"Martin changed the description"）。措辞的修改不通知其他任何人：关注者下次读这个任务时会看到这一行。
- Delete task 放在详情 More 菜单的最后，在一条分隔线后面。它先确认，和每一次删除一样（[确认](./feedback.md#confirming)）。

### 对话中的任务 {#tasks-in-a-conversation}

在任务来自对话的产品里，任务是从消息创建的；消息不是任务。任务有自己的标题、描述和讨论，并链接回它来源的那条消息。一条消息可以是多个任务的来源，一个任务也可以只属于这个地方，不关联任何消息。

- 从一条消息创建的任务，以列表显示在消息内容下面、回复上面：每个任务一行，有完成控件、编号（`#25`）、标题，标题后面是它讨论里的消息数，然后是负责人（头像和名字；对本人显示 "You"）和状态标签，一起放在右端。一个列表可以有任意数量的任务；回复仍然是这条消息本身的讨论。这些行就是[紧凑列表的行](#rows-in-a-compact-list)里的紧凑行。
- 装着列表的框，宽度由内容决定：至少 320px 宽（所在栏更窄时，就是整栏的宽度），最多是消息栏的宽度。标题保持一行，这一行放不下时以省略号结尾：在任务有自己的讨论之前创建的任务，标题是整条消息，它的详情里显示全文。
- 消息数紧跟在标题后面，在同一行内：紧跟标题的最后一个词，标题被截断时紧跟省略号，两种情况的空隙一样小。被截断的标题和数字之间永远不要留空：标题只让出这一行缺的那点空间。这个数统计的是标题所指的那段讨论，所以它属于标题，不属于负责人。
- 负责人和状态标签作为一组放在每行右端，负责人紧挨状态标签。不要跨行把它们对齐成列。一行窄得放不下一个可读的标题和这一组时，这一组整体换到第二行，仍然靠右，而不是挤压标题。
- 在消息列顶部的那条消息下面，显示同样的列表。
- 从行打开任务详情。完成控件是行上唯一会修改任务的东西：选中行的其他部分会打开任务，其他所有状态变更都在详情里做。
- 人们用消息菜单里的 Create task from message 从消息创建任务。它打开 Create task，引用这条消息，并把消息的文字作为初始标题，人们可以修改。
- 不要在消息输入框里提供 As task：人们发送的是消息，任务之后再由人或 Agent 从消息创建。
- 任务发生的事写成任务讨论里的事件行：创建、认领、指派、移动、完成（"Martin completed #25"）、重新打开、带原因移到 Backlog，以及标题或描述的修改。不写在对话里，也不写在它来源消息的消息列里（[交接与审批](../people-and-agents/handoffs-and-approvals.md#claiming-work)）。
- 任务的讨论显示在任务详情里，让讨论和状态放在一起读。关注任务和关注消息列的方式一样（[交接与审批](../people-and-agents/handoffs-and-approvals.md#following-a-task)）。
- 在从消息创建的任务的详情里，选中 Source 会关闭对话框，跳到那条消息在它所在地方的位置，那条消息显示被定位的高亮，和每一次跳转一样（[被定位](../foundations/states.md#located)）。选中 Earlier discussion 会打开这个任务原来那条消息的回复。
- 任务的讨论一有消息，就用 Space Mono 显示消息数。只对关注这个任务的人，在数字前加提醒圆点。
- 在任务有自己的讨论之前、消息就是任务时创建的任务，只有第一次有内容写进去时才有讨论。在讨论的位置显示空状态（"No discussion in this task yet"，说明之前的讨论在它的消息的回复里），消息输入框随时可用，而不是显示消息的回复；第一条消息开始任务的讨论。

### 把任务头部拉下来 {#pulling-the-task-head-down}

在手机上，以及在网页上任务详情全屏显示的地方，任务的头部（标题、描述、属性和历史）是对话的第一行，会随对话一起滚走。为了看状态再滚回上面，读者会丢掉自己在讨论里读到的位置，所以改由栏把头部拉下来，盖在对话上。

- 头部滚出视野后，栏收起来：在引用那一行下面，是 `Task #N`、状态标签和只显示头像的负责人，然后是一个小的 V 形箭头。头像带有给读屏软件读的名字；只有栏里放得下完整的名字时，名字才显示在头像旁边。引用那一行（`#design:#25`）在两种状态下都保留。头部滚走之前，它下面那一行只有 `Task #N`，没有状态标签、头像和 V 形箭头。
- 点一下栏，头部就作为一个面板被拉下来，从栏下面垂下，横跨栏的整个宽度，盖在对话上。它和对话第一行的头部是同一个头部，编辑方式也一样（Status、Assignee、Show more、Source、History）。没有遮罩，它下面的东西也都不动。
- 面板画在 `layer-canvas` 上，沿边缘带 `shadow-float`，没有 1px 的分隔线：阴影已经把它和对话分开了，阴影上再加一条细线，就是第二条边在说同一件事（[层级](../foundations/elevation.md#tokens)）。它最高占屏幕的 70%；超出时，它自己的内容滚动。
- 它用 `ease-slide` 在 220ms 内从栏往下滑出、再往上收回，这是最短的滑动（[动效](../foundations/motion.md#usage)），V 形箭头随之转动。开启减弱动态效果时，它直接出现、直接消失。
- 以下情况会关闭它：
  - 再点一下栏；
  - 点它外面，包括消息输入框和它的按钮。这一下仍然落在点的地方。头部打开的菜单（Status、Assignee）算在面板里面；
  - 焦点移到它外面，比如移进消息输入框；
  - Back、手机的系统返回和 Esc。Back 先关闭面板，再离开页面；
  - 面板的内容滚到底以后，在面板上上滑至少 40px。在那之前，上滑滚动的是面板的内容；
  - 读者开始滚动对话。新到的消息不会关闭它；
  - 头部滚回视野。
- 面板不跟手：上滑超过 40px 时，它用同样的滑动关闭，更短的上滑让它留在原处。跟手的面板看起来像一个可以拖到任意高度的 Sheet，而这个面板不能。网页和手机都是这样（2026-10-28 决定）。
- 面板打开时焦点移进面板，关闭时回到栏上，但点外面关闭时除外：那一下把焦点放到读者想放的地方。栏是一个带 `aria-expanded`、控制面板的按钮，名字就是它显示的内容（"Task #7, In progress, Kirby"）；面板是一个以任务命名的区域（"Task #7"）。
- 对话保持底部锚定，最新的消息贴着消息输入框；头部折起多少，以对话能填满它让出的空间为限。短任务的头部一直在视野里，"Beginning of conversation" 上方不留空隙；它的栏从不收起，所以没有东西可以拉下来。
- 在平板或宽窗口上，头部固定在对话上方，所以没有收起的栏，也没有面板。

网页上的实现是 `TaskHeadPullDown`（slock `packages/web/src/components/task/TaskHeadPullDown.tsx`，slock #11722）；手机上是 `RaftPullDownPanel`（mobile #3884），让短任务不留空隙的折叠限制在 mobile #3899。它不是 [Popover](../../packages/ui/src/components/popover/popover.md)，也不是 [Drawer](../../packages/ui/src/components/drawer/drawer.md)：它既不是模态的，也不锚定在某一点上。

### 对话旁边的任务 {#tasks-beside-a-conversation}

一个地方的任务以 Tasks 分区的形式打开在它的对话旁边（[页面结构](./page-structure.md#sidebar-and-side-panel)），让人们在聊天时看到工作的进展。人们不需要在那里读完每个任务：这个分区回答的是什么在推进、什么在等他们。

- 分区的头部里放标题 Tasks，然后是创建按钮、⋯（分区能移动时，里面有 Move left 和 Move right）、Expand 和 ×（[Panel](../../packages/ui/src/components/panel/panel.md#rules)）；头部放不下时，创建按钮作为 New task 收进 ⋯ 里。头部里没有计数：紧接在它下面的 All 和 For me 筛选已经带着数字。在手机上，分区盖住这个地方标题栏下面的对话，用标题栏的 Back 关闭：分区自己不画 Back 或 ×，所以屏幕上只有一个 Back。
- 头部下面放 All / For me（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)），每项带它当前要做的任务的数量：Todo 和 In progress。Backlog、Done 和 Closed 不计入，因为它们都不是现在正在进行的工作。For me 列出指派给这个人的任务。
- 紧接在 All / For me 下面放快速添加，一个占位文字为 "Add a task" 的输入行，对齐分区的边距，触屏上 20px，用鼠标时 16px（[在哪里创建任务](#where-tasks-are-created)）。头部的创建按钮仍然打开 Create task，用来写描述、选别的状态或一次创建多个任务。
- 任务按状态分组，顺序是 In progress、Todo、Backlog、Done、Closed：在窄的分区里，正在推进的工作排在前面，然后是等着的，最后是已经结束的。每组有一个可折叠的灰色标题，带状态像素点和计数，Backlog、Done 和 Closed 默认收起。每个标题文字上方 16px、下方 6px，放在一个 40px 的框里（这是 [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md) 分区标题以前的间距，后来它下面的 8px 归给了它的列表），各组之间不另加间隔，所以标题贴着它自己的行，离上一组（大约 25px）明显比离它的第一行（16px）更远（[间距节奏](../foundations/comfort.md#spacing-rhythm)）。触屏时它的目标区域向上延伸 4px，到 44px。
- 每个任务一个紧凑行：完成控件，编号，一行标题（截断时以省略号结尾），标题后面紧跟它讨论里的消息数，然后右端是负责人（头像和名字；Agent 的头像带在线状态灯，对本人显示 "You"）和一个 V 形箭头。行里不放状态标签：分组已经写明了状态。分区太窄时，负责人换到第二行，仍然靠右，和消息下面的列表一样。这些行和消息下面、Files 分区里的紧凑行相同（[紧凑列表的行](#rows-in-a-compact-list)）。
- 从行打开任务详情，用居中的对话框（[规则](#rules)）。这个分区就在这个地方的对话旁边，所以它的任务不会像任务页面上的任务那样，在旁边再打开一列（[打开的任务](#the-open-task)）。

### 任务页面 {#a-page-of-tasks}

产品的任务页面汇集这个人能看到的每个地方的任务。人们打开它，先要回答两个问题：什么在等自己，自己交出去的工作进展如何；然后是找到任意一个任务、一次处理很多任务、读一个任务。这里的规则是给这个页面的；一个地方的 Tasks 分区和它不同的地方，分区保留自己的规则（[对话旁边的任务](#tasks-beside-a-conversation)）。Raft Chat 怎么称呼它的各个部分，见 [Raft Chat — 任务](../products/raft-chat/tasks.md)。

- 页面占满导航条右边的整个宽度，没有侧栏，中间也没有固定宽度的一栏：列表是页面的主要内容，就像对话是频道的主要内容；把列表限制在中间的一条里，会浪费长标题需要的空间（stdrc，2026-11-10，#wg-task-v2:8a7ae237）。
- 标题和计数放在头部，计数用 Space Mono，放在标题旁边；搜索框放在头部末端。在手机上，标题和计数就是这个一级页面的顶栏，搜索框放到工具栏下面。计数是当前标签页里的任务数；有筛选或搜索缩小列表时，它是显示出来的数量、一条斜线、再加上那个总数（"3 / 12"），这样缩小后的列表永远不会读成完整的列表。
- 工具栏放在头部下面：最前面是带数量的 Mine / All，然后是筛选，有筛选生效时后面跟 Clear all，末端是排序、List / Board 和 New task，New task 是唯一的主按钮。整个工具栏是一个 Tab 停靠点（[FitToolbar](../../packages/ui/src/components/fit-toolbar/fit-toolbar.md)），在手机上，筛选在一行里横向滚动（[筛选](#filters)）。

#### Mine 和 All {#mine-and-all}

- 提供两个标签页，Mine 和 All，放在一个 [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md) 里，每个都带它的任务数。Mine 放这个人自己的任务：指派给自己的、自己创建的，或者从自己的消息创建的。All 放这个人能看到的所有任务。用两个标签页，是因为这个页面有两项工作：Mine 是每个打开它的人首先想看的，All 用来找到和照看其余的任务（stdrc，2026-11-10，#wg-task-v2:8a7ae237）。
- 第一次打开时显示 Mine，之后显示这个人上次选的标签页，在每个服务器里为每个人分别记住。
- 每个筛选和排序在两个标签页里都能用。All 加上 Assignee 设为 Unassigned，就是没有人负责的任务列表；All 按最久未更新排序，就是没有人推进的任务列表：早先的设计给它们各自一个分区，而筛选不用多加分区就能给出它们（stdrc，2026-11-10）。

#### 列表 {#the-list}

- 在 Mine 里显示两个分区，顺序是：先是指派给这个人的任务，然后是这个人发起的（这个人创建的，或者从这个人的消息创建的）、由别人负责或没有人负责的任务。一个任务只在一个分区里，就是它符合的第一个。没有状态筛选时，不列出已经结束的任务：第一个分区列出 Backlog、Todo 和 In progress，第二个分区再加上最近一天内完成的任务，让这个人看到自己交出去的工作完成了。有状态筛选时，每个分区列出选中的状态。
- 在 All 里显示一个平铺的列表。
- 不要按状态给列表分组：每一行上都有状态，而且谁负责一个任务、它有没有推进，比它处于哪种状态更能说明它的情况（这是 Noel 对这个页面用途的理解，stdrc 随高保真设计采纳，2026-11-10）。
- 每个分区有一个标题，带它的计数，计数用 Space Mono；标题下面不加说明文字：标题下面的一句话，每次来都要多读一样东西（stdrc，2026-11-10，#wg-task-v2:8a7ae237：说明文字太多）。没有任务的分区保留它的标题，用一行字说明没有任务，不再重复分区的名字：标题已经写了（Noel，2026-11-10，#wg-task-v2:8a7ae237）。
- 行按页面的排序排列，默认最近更新的在前：Recently updated、Least recently updated 或 Recently created。更新指任务最近的一次活动，包括它讨论里的一条消息。
- 一次读取 20 行，列表滚动时再读取下 20 行。头部、标签页和分区标题里的计数都是总数，从不是已经加载的数量。
- 永远不要让列表横向滚动（stdrc，2026-11-10，#wg-task-v2:8a7ae237：标题太长就换行；横向滚动没有意义）。列表只上下滚动。长标题换成多行，比一行还长的单词可以在任意位置断开，和表格里的文字一样（[Table](../../packages/ui/src/components/table/table.md#behavior)）。行变窄时，它的各部分按列表自己的宽度让位，从不按窗口的宽度（[按所在区域的宽度切换](./responsive.md#switch-on-the-regions-width)）：引用只保留编号，它的地方移到行的末端；状态只显示像素点（[列表](./lists.md#wide-and-narrow)）；末端的各部分作为一组换到第二行，靠右。只有看板横向滚动。
- 每个分区的行（或 All 的行）放在一个框里，`layer-card`，`line-hairline` 边框，`radius-container`，行之间用细线，和消息下面的列表一样（[紧凑列表的行](#rows-in-a-compact-list)）。一行从头到尾是：选择复选框；引用（`#design:#25`，用 Space Mono 和 `foreground-hint`；手机上是 `#25`，地方放在行的末端）；`text-callout` 的标题；然后末端是负责人（头像和名字，对本人显示 "You"）、状态标签和任务上次推进以来的时间，时间用 Space Mono。指派给这个人的任务那个分区不显示负责人：每一行都会是这个人自己。
- Todo 或 In progress 的任务 3 天没有任何推进时，时间用 `warning-strong` 显示，并用文字写进这一行的无障碍名称（"no update for 3 days"）。颜色标出可能卡住的任务，又不给行多加文字；无障碍名称让这层意思不只靠颜色表达（[无障碍](../foundations/accessibility.md#principles)）。
- 悬停和按下时铺满整行，分别是 `overlay-subtle` 和 `overlay-medium`，选择复选框也包括在内：复选框在填充里面，占一个 20px 的槽位，触屏上离行的起始端 12px，用鼠标时 8px，引用在它后面 8px 开始。填充停在复选框那里，就会把一行切成两半（stdrc，2026-11-10，#wg-task-v2:8a7ae237：整行变灰，复选框落在灰色上），而且在每种列表里，开头的复选框都在行的形状里面（[列表](./lists.md#one-edge)）。
- 点击行上复选框以外的任何地方都打开任务；复选框只负责选中。打开着的任务那一行显示 `fill-cell-selected`，并带 `aria-current`。

#### 选择任务 {#selecting-tasks}

- 用鼠标时，悬停和键盘焦点会让一行显示它的选择复选框；有任务被选中后，每一行都显示复选框，直到选择结束。触屏上没有悬停：长按（500ms，移动不超过 10px）选中这一行并开始选择，因为行没有长按菜单（[选中多项时的工具栏](../components/overview.md#toolbar-for-selected-items)）。
- 选择期间，点击或轻点一行会选中它或取消选中，而不是打开它。按住 Shift 点击，选中从上次点选的那一行到这一行之间的所有行；按住 ⌘ 或 Ctrl 点击，像点它的复选框一样选中一行；在列表里或焦点不在任何地方时，⌘A 或 Ctrl+A 选中当前标签页和筛选下的所有任务，包括还没加载的行，但从不包括收起的栏里的卡片；Esc 结束选择。
- 在看板上，按住 ⌘ 或 Ctrl 点击选中卡片，拖动一张选中的卡片会移动所有选中的卡片。
- 用浮在页面底部的 [SelectionToolbar](../../packages/ui/src/components/selection-toolbar/selection-toolbar.md) 处理选中的任务，也就是消息用的那一个（stdrc，2026-11-10，#wg-task-v2:8a7ae237）：数量；有任务会被跳过时的提示（"2 will be skipped"）；然后是 Status、Assignee、Nudge；然后是作为 `secondary` 操作的 Follow 和 Delete、More 和 ×。Status 和 Assignee 的菜单向上打开，Delete 先确认（[确认](./feedback.md#confirming)）。这个人不能修改的任务会被跳过，而不是因此拒绝其余的任务；结果会说明跳过了多少个。
- 尚未实现：Nudge 给每个负责人发一条提醒，列出这个人被选中的任务，就像 Agent 的空闲提醒列出它未完成的工作；并在每个任务的讨论里写一行。这样一个 Agent 只被唤醒一次，而不是每个任务一次（Noel 按 stdrc 的要求做的设计，2026-11-10）。

#### 打开的任务 {#the-open-task}

- 从列表或看板打开的任务，放在页面这一行的一列里，在列表右边，就像消息列在对话旁边打开那样：列表就是这一行的对话，任务是这一行的一列，宽度、裁切和 Expand 的规则都一样（[频道的侧边列](./responsive.md#the-channels-side-columns)；stdrc，2026-11-10，#wg-task-v2:8a7ae237：页面的主体部分和聊天的一样，任务就像消息列那样用）。
- 任务这一列打开时是 400px，和消息列、个人资料一样（stdrc，2026-11-10：它的默认宽度应该和消息列差不多）。拖动它的接缝可以把它缩到 160px，内容保持 320px，比这窄时被裁切；也可以把它拉宽，直到列表缩到 160px。列表的内容保持 360px，和对话一样，比这窄时被裁切，所以列表总留在视野里，至少是一窄条（[间距](../foundations/spacing.md#layout-widths)）。任务这一列和个人资料面板共用一个宽度。
- 有任务打开时，两个头部都有 Expand（只有列表时，这一行只有一列，所以两者都不显示它）：任务的 Expand 在它的 More 菜单后面、× 前面，列表的 Expand 在搜索后面，在它头部的末端。展开后，一列占满这一行，另一列保持 160px 的窄条；再按一次 Expand 或按 Esc，两列都回到原样，一个像素不差（[Panel](../../packages/ui/src/components/panel/panel.md#rules)）。
- 用 × 或 Esc 关闭任务；这一行展开着时，第一次按 Esc 先恢复原样，再按一次才关闭任务。焦点原来在任务里或不在任何地方时，回到这个任务的那一行（[移动焦点](../foundations/accessibility.md#moving-focus)）。
- 从列表打开的任务替换当前打开的那个。
- 在手机上，任务作为推入页面盖在列表上，带 Back，标签栏藏在它下面（[导航](./navigation.md#going-back)）。

#### 看板 {#the-board}

- 每种状态一栏，Closed 收起（[规则](#rules)）。每栏一次读取 20 张卡片，滚动时再读取下一批。
- 一栏里的卡片按页面的排序排列，所以一栏是一个放置目标：拖到上面的卡片标出整栏，两张卡片之间不会让出位置，因为排序反正会移动这张卡片（[拖放](./drag-and-drop.md#where-it-will-land)；stdrc，2026-11-10，#wg-task-v2:8a7ae237）。用键盘时，← 和 → 把拿起的卡片移到别的栏。
- 卡片上有它的引用、标题、状态标签（一个列出五种状态的菜单）、负责人和上次推进以来的时间，没有完成控件（[TaskCard](../../packages/ui/src/components/task-card/task-card.md)）。

### 紧凑列表的行 {#rows-in-a-compact-list}

消息下面的任务、Tasks 分区和 Files 分区是同一种列表，用同一种行。它是内容：行与行之间用细线，整行都是点击目标，每行没有单独的卡片。这些紧凑行暂时保留它们的线；其他由行组成的列表（动态、搜索、侧栏、手机上由 ListRow 单元格组成的列表）没有线，把状态画在一个内缩的形状上（[列表](./lists.md)）。一行读起来就是一行：左边是它是什么，右边是谁负责、进展到哪。任务页面的行就是这种行，有三点不同：完成控件的位置是选择复选框，标题换行而不是以省略号结尾，末端有时间（[列表](#the-list)）。

| 部分 | 规格 |
| --- | --- |
| 行 | 一行，用鼠标时至少 34px 高（桌面端的行高），在手机或触屏上至少 44px（[间距](../foundations/spacing.md#hit-targets)），用鼠标时内容上下各 5.5px，触屏上各 6px。行内方向的内边距就是它所在那一栏的边距：在侧边分区里触屏上是 20px，用鼠标时和手机上是 16px，所以行和分区头部从同一条线开始；在消息下面的框里是 12px |
| 对齐 | 这一行上的文字共用一条基线：任务的编号、标题、消息数、负责人的名字、状态标签的文字、文件的大小和时间（[一行中不同大小的文字](../foundations/alignment.md#text-of-different-sizes-on-one-line)）。没有文字的标记，即完成控件、头像、状态像素点、V 形箭头和图标（文件的类型图标、消息数的图标、各个操作），在标题那一行的行框里居中（[引领文字的标记](../foundations/alignment.md#a-mark-that-leads-text)）。不裁剪文字，也不做微调，和一行属性一样 |
| 完成控件 | 只在任务行上，是行上的第一个东西，在编号前 10px（[完成任务](#completing-a-task)）。文件行没有 |
| 开头 | 可选，在标题那一行：任务的编号（`#25`），用 Space Mono 和 `foreground-hint`，在标题前 8px；或者文件 20px 的类型图标或缩略图 |
| 标题 | `text-callout`，`foreground`，一行，截断时以省略号结尾。已完成任务的标题加删除线，用 `foreground-hint` |
| 行内信息 | 紧跟标题，相距 6px，或紧跟省略号：任务的消息数（一个图标和用 Space Mono 写的数字），或者用 Space Mono 写的文件大小。它属于标题，所以标题只让出这一行缺的空间 |
| 尾部一组 | 在右端，各部分相距 8px。任务：负责人（19px 头像和 `text-caption` 的名字），然后是状态标签，在 Tasks 分区里则是一个 V 形箭头。文件：分享的时间，紧凑写法，用 Space Mono（今天写时刻，按这个人选的 12 小时制或 24 小时制；今年更早写月和日，Oct 21；更早的年份写日期，2025-10-21；完整的日期和时间放在工具提示里），然后是它的操作（Jump to message 和 Download，560px 以下是一个 ⋮ 菜单），最后一个图标框落在行的边距上，点击区域向外伸出，左右伸出，上下各 4px，所以文件行和任务行一样高（[对齐](../foundations/alignment.md#the-ends-of-a-header)）。只有标题会少于 160px 时，这一组才整体换到第二行，仍然靠右：在侧边列默认的 360px 时，任务行和文件行都保持一行 |
| 分隔线 | 行之间用 `line-hairline`，一直延伸到列表的容器看得见的边界（[分隔线](../foundations/comfort.md#separators)）。在消息下面，框里只有这些行，所以线从一边贯穿到另一边，碰到框的边框。在侧边分区里（无论浮动还是在消息旁边）以及在手机上，列表只是一个分区的一部分，这个分区还有头部、筛选和分组标题；或者是一个完全没有边的页面的一部分，所以线在两侧都缩进行的内边距：从行内容开始的地方开始，到行内容结束的地方结束，离两边各 20px（手机上 16px）。悬停仍然填满整行。列表或状态分组的第一行上方没有线 |
| 容器 | 在消息下面，行放在一个由内容决定大小的框里（见[对话中的任务](#tasks-in-a-conversation)）：`line-hairline` 边框，`radius-container`（它是一个容器，见[形状](../foundations/shape.md)），`layer-card`。在侧边分区里，行从一边贯穿到另一边，行间没有间隔，分区的头部、筛选和分组标题与它们共用同一条边距，触屏上 20px（用鼠标时和手机上 16px） |
| 分组标题 | Tasks 分区里的状态标题用来折叠它的分组。它是行上方的标签，不是一行，所以它采用可折叠分组标题的状态：悬停和按下时，它的文字和 V 形箭头从 `foreground-hint` 变成 `foreground`，不铺填充，也不加下划线；键盘焦点显示内嵌的环（[可折叠的分组标题](../foundations/states.md#collapsible-group-headings)）。填充会让它看起来像又一行，而且框住文字时上下不均，因为标题把文字放在框的底部，贴着它所指的行 |
| 状态 | 悬停在整行上铺浅档叠加层（`overlay-subtle`），按下铺中档（`overlay-medium`），键盘焦点是一个内嵌的环（[悬停与按下](../foundations/states.md#hover-and-press)）。完成控件显示它自己的焦点环。文件的操作仍然是各自的按钮，叠在行的上面；Jump to message 跳到那条消息，消息显示被定位的高亮（[被定位](../foundations/states.md#located)） |

- 不要给这些列表的行各加一张卡片，也不要在行之间留间隔。每行一张卡片会把窄窄的侧边列变成一摞控件，三种列表也就不再像同一种。
- 不要在标题下面放第二行详情（大小、时间、角色）：详情放在行内信息或尾部一组里。只有尾部一组换行时，一行才有第二行。
- 不要跨行把尾部一组对齐成列。

### 引用任务 {#referring-to-a-task}

任务编号只在它所在的地方唯一，所以引用先写地方：`#design:#25`，私信里是 `dm:@ada:#25`。它读作「#design 的 #25」，在任何地方都能打开这个任务。

- 任务引用写成地方、`:`，然后是带 `#` 的编号。Agent 写的、读的都是同一种引用。
- 引用渲染成打开任务详情的链接，在任何地方都是，对能看到那个地方的人有效。对其他人，它保持为纯文本。
- 链接渲染成带任务状态颜色的任务标签片（它的状态像素点和浅色底），和消息下面的任务列表用的是同一种标签片，这样引用读起来就是「哪个任务，进展到哪」。不要把引用拆成颜色不同的几部分：它是一个名字，而状态已经有像素点和浅色底。产品还没有加载这个任务时（别的地方的任务），按地方和编号去读取它；在那之前，引用是一个只有描边的标签片，`line-hairline` 边框围着 `foreground-muted` 的文字，没有浅色底，也没有像素点。永远不要把它显示成灰色标签片，那会读成 Closed。Backlog 任务的标签片也只有描边；两者有什么不同，见[颜色](../foundations/color.md#statuses)。
- 单独写 `#25` 仍然指正在读的这个地方的任务 25。

### 筛选 {#filters}

一个产品提供哪些筛选，写在它自己的页面上。每个筛选都遵守同样的规则：

- 每个筛选是一个 [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md)，打开一个列表；可能有很多值的（地方、人）带搜索，五种状态的列表不带。可以选多个值。
- 生效的筛选显示为 `info-soft`，并用 Space Mono 写出选中值的数量，这样筛选过的视图看起来永远不会像完整的列表。
- 按人筛选时，人和 Agent 列在一起。快捷项放在最前（"Created by me"、"Assigned to me"，然后是 "Unassigned"），作为列表里的行而不是单独的按钮，不带头像；然后是按 A 到 Z 排列的人和 Agent。
- 有任何筛选生效时，在筛选后面显示 Clear all，一个幽灵按钮。
- 在任务页面上，排序放在工具栏末端，在 List / Board 前面：一个只选一个值的 [Select](../../packages/ui/src/components/select/select.md)，和生效的筛选一样，值和默认值不同时用 `info-soft` 填充。
- 在手机上，筛选放在一行里横向滚动（FitToolbar 的 `overflow="scroll"`），生效的筛选排在最前，始终在视野里。会换行的一排筛选把列表往下推，而横向滚动的一行让每个筛选都只差一次滑动（stdrc，2026-11-10；[FitToolbar](../../packages/ui/src/components/fit-toolbar/fit-toolbar.md#behavior)）。桌面端很窄的工具栏是否也横向滚动，还没有定。
- 筛选保存在地址里，这样筛选过的视图可以分享和重新加载。在任务页面上，标签页、排序、视图和搜索也保存在地址里。

## 相关 {#related}

- [交接与审批](../people-and-agents/handoffs-and-approvals.md#handing-off)：认领和交接。
- [颜色](../foundations/color.md#statuses)：状态颜色。
- [任务组件](../../packages/ui/src/components/tasks/tasks.md)：`TaskChip` 和 `TaskStatusBadge`。
- [TaskCompletionControl](../../packages/ui/src/components/task-completion-control/task-completion-control.md)：完成控件。
- [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md)：`CheckboxIndicator`，在完成控件里画成圆形。
- [0042](../decisions/0042-tasks-as-a-to-do-list.md)：为什么任务像待办清单一样用，有 Backlog，状态变更不设限制。
- [0045](../decisions/0045-the-tasks-page.md)：为什么任务页面先列出这个人自己的工作，在列表旁边打开任务，创建的任务都有所属的地方。
- [SelectionToolbar](../../packages/ui/src/components/selection-toolbar/selection-toolbar.md)：选中任务时的工具栏。
