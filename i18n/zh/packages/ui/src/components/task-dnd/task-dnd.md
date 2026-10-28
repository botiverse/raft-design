---
title: TaskDnd
summary: 让人在各列之间、在其他卡片之间拖动任务卡片的一组拖放部件；允许放到哪里、移动后做什么由调用方决定。
sourceHash: 30b59a36
---

# TaskDnd

TaskDnd 是 [TaskBoard](../task-board/task-board.md) 背后的拖放连接层：一个 provider、人拖动的卡片、放下卡片的位置、卡片落入的空隙，以及跟着鼠标指针移动的卡片副本。它遵循统一的拖动模型（[拖放](../../../../../design/patterns/drag-and-drop.md)），用这个模型的部件搭建（[Drag](../drag/drag.md)）。它不对任务做任何决定。哪些放置是允许的、一次移动要做什么（比如把 #25 从 Todo 改成 In Review），由调用方说了算。

```example
task-dnd/compositions/task-dnd
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 把卡片移到看板的另一列来改变状态 | TaskDnd，放在 [TaskBoard](../task-board/task-board.md) 里 |
| 在一列的卡片之间调整某张卡片的顺序 | TaskDnd，每张卡片上都有一个放置目标 |
| 不拖动就改变状态 | 卡片上的状态标签，或任务详情里的属性（[任务](../../../../../design/patterns/tasks.md#rules)） |
| 调整消息输入框里附件的顺序 | 消息输入框自带的可排序附件（[Composer](../composer/composer.md)） |
| 调整一列的宽度 | [Resizable](../resizable/resizable.md) |

## 结构 {#anatomy}

- `TaskDndProvider`：包住看板和它的浮层。它持有调用方的策略 `isDropAllowed`，卡片放到允许的目标上时调用 `onMove`，并根据 `describe` 播报拖动过程。必需。
- `TaskDropZone`：可以放下卡片的地方，通常是通过 `render` 渲染的 `TaskBoardColumn`。它报告 `dropState`：`idle`、`allowed` 或 `blocked`。
- `TaskDraggable`：包住一张 [TaskCard](../task-card/task-card.md)，让它可以拖动。带 `dropId` 时它也是一个放置目标，卡片可以落在它前面或后面。
- `TaskDropPlaceholder`：卡片将要落下的空隙，在某张卡片前面或后面，或在空列里，用统一的虚线样式（`DropPlaceholder`）。只有允许放在那里时才显示，而且从不出现在被拖动的卡片自己旁边。
- `TaskDragOverlay`：跟着鼠标指针移动的卡片副本，是一个带卡片圆角的 [`DragLift`](../drag/drag.md#anatomy)。把被拖动的卡片渲染在里面，没有卡片被拖动时什么都不渲染。

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 拖动中 | `TaskDragOverlay` 里的副本是拿起的样子：`layer-popover`、`shadow-float` 和一圈 `line-seam`。卡片本身以 40% 留在它的列里（`data-drag-origin`） |
| 在允许的目标上方 | `TaskDropPlaceholder` 显示 `fill-subtle` 上 `line-strong` 虚线标出的落点，高度与被拖动的卡片相同 |
| 在它自己的卡片上方 | 没有占位框：放在那里什么都不会移动 |
| 在禁止的目标上方 | 没有占位框；目标的 `dropState` 是 `blocked`，空列会说明原因（[TaskBoard](../task-board/task-board.md#states)）。像看板的组合示例那样，渲染一个带原因的 `DragRefusalHint` |
| 关闭拖动 | provider 上的 `disabled` 去掉所有拖动方式；`TaskDraggable` 上的 `disabled` 只对那张卡片去掉拖动 |

## 行为 {#behavior}

- 用鼠标时，指针移动 6px 后才开始拖动，所以点击卡片不算拖动（`useDragSensors`）。
- 在触屏上，按住卡片不动 500ms，然后移动：拖动在这次移动时开始。按住时间不够就移动，会滚动看板（[触屏上的拖动](../../../../../design/foundations/states.md#dragging-on-a-touch-screen)）。
- 卡片落在哪里，以被拖动卡片的中点为准：在下方卡片中线以上是 `before`，以下是 `after`。
- 渲染了 `TaskDragOverlay` 时，被拖动的卡片以 40% 留在原位，不跟着指针移动；拖动期间让它留在它的列里。拖动时仍然把卡片从列里拿走的看板，和以前一样能用。
- 放下时，副本滑进卡片的新位置；取消时，滑回卡片那里，用时 160ms（`motion-drag-settle-*`；减弱动态效果时没有动画）。移动由调用方负责：在 `onMove` 里把卡片渲染到它的新位置，这样副本才有地方可滑。`onMove` 可以返回一个 promise，它被拒绝时 `onMoveError` 会收到错误，调用方可以撤销改动并说明出了什么问题。
- 放在被拖动卡片自己的目标上，或者没放在任何东西上，都不会调用 `onMove`。
- 指针离任何可滚动区域的边缘不到 48px 时，看板会滚动（`DragLift`）。

## 无障碍 {#accessibility}

- 这些部件包装的是 dnd-kit，不是 Base UI。`TaskDraggable` 带有 dnd-kit 的属性：它可以获得焦点，并为读屏软件提供角色描述和操作说明。
- 键盘：按 Tab 移到一张卡片上，然后按 Space 拿起它；Enter 从不拿起卡片，所以 Enter 可以打开卡片。ArrowDown 和 ArrowUp 让它在本列中向下或向上移动一格，落到每张卡片的前面或后面；ArrowLeft 和 ArrowRight 让它移到相邻列中最近的放置目标，比如一个空列或与它平齐的卡片。Space 放下，Escape 取消。按键在放置目标之间逐个移动，所以不管拖动时卡片是否离开本列，移动方式都一样。
- 用键盘放下之后，焦点停在 dnd-kit 留下的位置。被移动的卡片在 DOM 中有了新位置，把焦点移到它上面是调用方的事：在看板渲染出这次移动后，在 `onMove` 或 `onDragEnd` 中聚焦它。
- 每张卡片都会读出的操作说明说的是 Space，不是 Enter（`dragInstructions`）。每一步都根据 `describe` 用名称播报：卡片的标题（`name`）、它将要落入的状态或列（`place`），以及某个位置为什么不接受它（`refusal`），用 `createDragAnnouncements` 拼成；把你的翻译作为 `messages` 传入。没有 `describe` 就什么都不播报：dnd-kit 自带的播报会读出 ID，从不发布。`accessibility` 会原样传给 dnd-kit 的 `DndContext`，覆盖这两者。[TaskBoard](../task-board/task-board.md#accessibility) 的组合示例演示了做法。
- `TaskDropPlaceholder` 对辅助技术隐藏。

## 规则 {#rules}

- 在 `isDropAllowed` 里决定哪些放置是允许的，这样卡片悬在目标上方时，目标就能说明卡片不能移到这里（[TaskBoard](../task-board/task-board.md#content)）。
- 提供另一种改变状态的方式：拖动只是三种方式之一（[任务](../../../../../design/patterns/tasks.md#rules)）。
- 在 `TaskDragOverlay` 里放被拖动卡片自己的 `TaskCard`，这样指针下的卡片和列里的那张读起来一样。
