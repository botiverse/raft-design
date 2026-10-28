---
title: 拖放
summary: Raft 里所有东西共用的一种拖动方式：拖动怎么开始、什么跟着手走、这一项将落在哪里、拒绝放下的位置显示什么、放下和取消怎么动，以及键盘和读屏软件的路径。
sourceHash: 19351155
---

# 拖放

Raft 里人能拖动的所有东西（侧栏的行和分组、标签页、服务器、任务卡片、消息输入框里的附件、侧边分区、把 Agent 拖到一台计算机上）都用同一种方式拖动。拿起的方式相同；被拿起的副本跟着手走；原来的那一项以 40% 的不透明度留在原处；一个虚线位置标出它将落在哪里；不接受它的位置会说明原因；放下或取消都在 160ms 内落定。学会一种拖动，就学会了全部，而且没有一种需要鼠标。

这套模型由 raft-ui 承载：`useDragSensors`、`DragLift`、`DropPlaceholder`、`DragRefusalHint` 和播报的辅助函数（[Drag](../../packages/ui/src/components/drag/drag.md)），在它们的 API 稳定之前从 `@botiverse/raft-ui/wip` 导入。`TaskDnd`、`SortableTabsList` 和 `SortableComposerAttachments` 都基于它们构建。

## 适用范围 {#when-it-applies}

人用拖动来移动的任何项：调整列表的顺序，把一项移到另一个列表或另一列，把它放进一个容器，或移动布局里的一个分区。拖动接缝线调整一列的宽度，不是拖动一个项；它遵循 [Resizable](../../packages/ui/src/components/resizable/resizable.md)，只有一条规则来自本页：Escape 恢复开始时的宽度。从浏览器外面拖进来的文件，按 [Composer](../../packages/ui/src/components/composer/composer.md) 的拖入浮层处理。

拖动从不是做一件事的唯一方式。每种拖动都有键盘路径（见下文）；操作重要时，还有一个做同样事情的控件：任务的状态标签、Move 按钮（[无障碍](../foundations/accessibility.md#focus-and-keyboard)）。

## 结构 {#structure}

两个列表，就像侧栏的「已置顶」和「频道」分组。用鼠标指针、触屏或键盘（按 Tab 移到一行上，按 Space，再按方向键，然后按 Space），在一个分组里拖动频道，或把它拖进另一个分组：

```example
drag/compositions/lists
```

一个看板，其中一列可以拒绝卡片（这里的「已关闭」拒绝所有卡片）：

```example
task-dnd/compositions/task-dnd
```

## 开始拖动 {#starting-a-drag}

- 用鼠标或触控笔时，按住按键、指针移动 6px 后开始拖动。点击从不移动任何东西，而且 6px 在每个表面上都一样。
- 在触屏上，手指静止按住 500ms 之后，第一次移动 10px 时开始拖动。更早移动是滚动；一直按住不动，则打开这一项的菜单（[触屏上的拖动](../foundations/states.md#dragging-on-a-touch-screen)）。
- 用键盘时，Space 拿起获得焦点的项。Enter 从不开始拖动：在也能打开的项上（侧栏的一行、一张卡片），Enter 是打开它。
- 三种方式都用 `useDragSensors()`，这样没有哪个表面自己定数值。

## 拖动手柄 {#the-handle}

- 小的项把整个项作为拖动手柄：行、标签页、标签片、头像、卡片。行上的抓手是又一个要瞄准的东西，而这一行本身已经是目标了。
- 装着实时内容的面板（比如侧边分区）只把抓手作为拖动手柄。它的头部点击时本来就有作用（消息列的头部、跳转到频道），所以从头部任何地方都能开始的拖动会和这些点击打架。头部被悬停或抓手获得键盘焦点时，在头部显示拖动条（在不能悬停的设备上一直显示，因为那里没有悬停来让它出现）；抓手的点击区域要比拖动条大：至少 24px 高，两侧都比拖动条宽，这样不用仔细瞄准。头部的其余部分保留它的点击，不显示 `grab`。抓手也是键盘的入口（在抓手上按 Space）。
- 抓手的点击区域要避开相邻的调整大小接缝线的点击带（Resizable），并把拖动条画在抓手的点击区域里面：按在拖动条上总是拿起面板，从不调整它的大小。
- 在拖动手柄上显示 `grab`，有东西被拿起时处处显示 `grabbing`，在拒绝它的位置上显示 `not-allowed`。`DragLift` 和 `DragRefusalHint` 为整个页面设置后两者，不管指针下面是什么。

## 跟着手走的是什么 {#what-follows-the-hand}

- 移动被拿起的副本，从不移动这一项本身。副本从被抓住的那一点起 1:1 跟随指针，每一帧都是。不要把它限制在容器里，也不要把它锁在一个轴上：手可以去任何地方，副本跟着去。
- 小的项，副本就是这一项。大的项（面板、分区），副本是一个紧凑替身：头部的图标和标题，最宽 240px，并让手始终停在它上面。
- 给副本拿起时的样子：不透明的 `layer-popover` 表面、`shadow-float` 和一圈 `line-seam` 环，不缩放，不倾斜（[层级](../foundations/elevation.md)）。深色模式下阴影几乎看不出来，这圈环把副本和它下面的东西分开。拒绝放下的位置上的 HUD 标签片也有同样的环。
- 键盘拖动时，把副本放在它所在位置的右下方 6px，这样它下面的虚线轮廓仍然看得见。
- 让副本在所有东西之上，包括弹出层、对话框和轻提示，并把它渲染在任何祖先元素的 transform 都移动不了它的地方（在抽屉或对话框里时渲染到 `document.body`）：它是手下面唯一的东西，必须一直在那里。

## 它从哪里来 {#where-it-came-from}

- 把这一项以 40% 的不透明度留在原处（`data-drag-origin`），直到别的东西占了它的位置。处处用同一个值，这样留在原处的项读起来总是「它原来在这里」。

## 它将落在哪里 {#where-it-will-land}

每个位置都用同一种占位框：`fill-subtle` 底上一圈 1.5px 的 `line-strong` 虚线轮廓，圆角和大小都与这一项相同（`DropPlaceholder`）。

- **在列表和看板里**，在落点处让出位置：相邻项向两边滑开（160ms，`motion-drag-settle-*`），这一项移到别处后，它原来的位置合拢。这一项自己的槽位就是那个位置（`DraggedSlot`），所以位置总是和这一项正好一样大。
- **在布局里**（面板、列），目标列让出空间，不在实时内容上面画任何东西。被移动的分区以 40% 的不透明度留在原处（`data-drag-origin`），放下之前没有东西盖住它，所以人总能看到它从哪里来、取消后它会回到哪里。在它自己那一列里，只有它经过的分区让出高度；它自己和它另一侧的分区保持原来的大小。在另一列里，那里的分区按放下之后的样子排好，空隙占被移动分区的那一份，所以消息列会变矮，它的消息输入框仍在视野里。空隙里放一个 `DropPlaceholder`。在拖动开始时把各个位置测量一次，这样列让出空间时，目标不会在指针下面移动。新的一列是一条全高的虚线条，在这一列将要出现的那条边上；放下之前，现有的列不变（stdrc, 2026-10-26）。
- **独占一列的分区**，不提供紧挨它自己那一列的两条边：移到那里，布局还是原样。
- **可以放进去的容器**（另一个侧栏分组、一台计算机的那一行），在这一项进入它时显示 `fill-subtle`（`data-drag-into`），位置在插入点上。

## 拒绝放下的位置 {#refused-places}

- 在不接受这一项的位置上不显示占位框，设置 `not-allowed` 光标，并在指针旁边（键盘拖动时在副本旁边）的 HUD 标签片里说明原因：「无法移到已关闭」「窗口太窄，放不下新的一列」。`DragRefusalHint` 三件事都做。
- 让标签片留在窗口里，并避开副本。它在指针的右下方；窗口右边缘会切掉它时，它移到指针和副本的左边（在靠近末端处被抓住的紧凑替身会伸到指针左边）；窗口下边缘会切掉它时，移到指针上方。它从不在副本下面（副本画在它上面），并且始终离窗口边缘至少 8px。`DragRefusalHint` 就是这样放置它的。
- 在播报里也说出原因：标签片不会被读出来。
- 放在拒绝放下的位置上就是取消：副本滑回原处，什么都不移动。

## 放下和取消 {#drop-and-cancel}

- 放下时，副本用 `motion-drag-settle-easing`（ease-out）在 160ms 内滑进那个位置，然后在那里显示这一项。在布局里，重新排列的动画也是同样的 160ms，与滑行同步（[动效](../foundations/motion.md#usage)）。
- 遇到 Escape、`pointercancel`（系统接管了这次触摸）、窗口失去焦点、浏览器标签页被隐藏时，取消拖动：副本滑回这一项，移动过的一切都回到原处。dnd-kit 没有处理的那几种由 `DragLift` 处理，而且不用合成的 Escape：取消绝不能关掉拖动所在的对话框或面板。
- 拖动中的 Escape 属于拖动，不管拖动是怎么开始的（鼠标指针、触屏还是键盘）：它把这一项放回原处，不会传到别的地方。`useDragSensors` 在 window 的捕获阶段接住它并阻止它继续传播，所以应用里那些按 Escape 关闭面板、对话框或弹出层的处理函数都收不到它。拖动结束后，Escape 又能传到应用里。
- 开启减弱动态效果时，副本和相邻项立即落定。

## 键盘 {#keyboard}

- Space 拿起，方向键一次移动一个位置，Space 放下，Escape 把这一项放回原处。上下方向键在一个列表里移动，并继续进入下一个列表；左右方向键在列、标签页和附件之间移动。
- 每按一次方向键正好移动一个位置，这一项刚进入另一个列表时也一样，这样播报的和它落下的位置总是一致。`useDragAcrossLists`（以及基于它的 `useDragLists`）从这一项的实际位置测量每一步，并在列表之间移动后重新测量；没有它，dnd-kit 在进入一个列表后会跳过一个位置。
- 标签页或复合控件里的其他项被拿起时，它自己的方向键行为关闭，这样方向键移动的是这一项，而不是焦点。
- 布局里的位置按它们在屏幕上的顺序逐个经过，跳过没有空间的位置。

## 读屏软件 {#screen-readers}

- 在 polite 实时区域里播报每一步，用名称，从不用 ID：「已拿起 #launch-week。在『已置顶』上，第 2 个，共 5 个。」「#launch-week 已放到『频道』，第 1 个，共 4 个。」「已取消。#launch-week 回到『已置顶』，第 2 个，共 5 个。」
- 用你的翻译拼出这些文字：`createDragAnnouncements` 接收名称、位置和你的文案，`dragInstructions` 说的是按 Space，而不是 Enter。dnd-kit 自带的、用 ID 称呼的英文默认文案从不上线：这一项没有名称时，什么都不说。`SortableTabsList` 和 `SortableComposerAttachments` 用标签页和附件的名称播报，并接收你的 `messages`；`TaskDndProvider` 用你通过 `describe` 传入的卡片名称和状态名称播报，没有它们就什么都不说。

## 自动滚动 {#auto-scroll}

- 拖动时，指针离任何可滚动区域的边缘不到 48px，就滚动这个区域，离边缘越近滚得越快：侧栏的列表、看板的各列、一排标签页、页面。`DragLift` 对指针下面的区域做这件事；把 dnd-kit 自带的自动滚动关掉（`autoScroll={false}`），这样两者不会一起滚动。

## 触屏 {#touch}

- 让可拖动的项保持可以滚动（`touch-manipulation`，不是 `touch-none`），这样由它们组成的列表在手指下仍然能滚动。
- 这一项的拖动开始时，关闭它的菜单：长按打开了菜单，按住之后的移动又拿起了这一项（[触屏上的拖动](../foundations/states.md#dragging-on-a-touch-screen)）。

## 相关 {#related}

- [Drag](../../packages/ui/src/components/drag/drag.md)：各个部件。
- [TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)、[Tabs](../../packages/ui/src/components/tabs/tabs.md#accessibility)、[Composer](../../packages/ui/src/components/composer/composer.md)：基于这些部件构建的组件。
- [状态](../foundations/states.md#dragging-on-a-touch-screen)、[层级](../foundations/elevation.md)、[动效](../foundations/motion.md#usage)、[无障碍](../foundations/accessibility.md#focus-and-keyboard)。
