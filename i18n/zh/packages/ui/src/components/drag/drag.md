---
title: Drag
summary: Raft 里每一种拖动都由这些部件搭成：一套传感器、跟着手走的被拿起的副本、标出一项将落在哪里的虚线位置、某个位置拒绝它的原因，以及按名称的播报。
sourceHash: 235559b8
---

# Drag

Raft 里每一种拖动都由 Drag 这组部件搭成，底层是 dnd-kit：`useDragSensors` 让拖动在各处以同样的方式开始，`DragLift` 是跟着手走、在放下或取消时落定的副本，`DropPlaceholder` 是一项将要落下的位置唯一的样子，`DragRefusalHint` 说明某个位置为什么不接受它。它们实现的模型及其理由，见[拖放](../../../../../design/patterns/drag-and-drop.md)。从 `@botiverse/raft-ui/wip` 导入它们：Raft Chat 把自己的拖动迁移到这些部件上的期间，API 还可能变化。

```example
drag/compositions/lists
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 在一个列表里调整项的顺序，或在列表之间移动它们（侧栏的分组） | `useDragLists`，配合 `DraggedSlot`、`DragLift` 和 `useDragSensors` |
| 在看板上移动任务卡片 | [TaskDnd](../task-dnd/task-dnd.md)，基于这些部件构建 |
| 调整标签页的顺序 | [`SortableTabsList`](../tabs/tabs.md) |
| 调整消息输入框里附件的顺序 | [`SortableComposerAttachments`](../composer/composer.md) |
| 移动布局里的一个分区（侧边分区） | `useDragSensors`、带紧凑替身的 `DragLift`、`DropPlaceholder` |
| 调整一列的宽度 | [Resizable](../resizable/resizable.md) |

## 结构 {#anatomy}

- `useDragSensors()`：`DndContext` 唯一的一套传感器。鼠标或触控笔移动 6px 后开始（`MOUSE_DRAG_DISTANCE_PX`）；手指按住 500ms、再移动 10px 后开始（`useHoldThenMoveTouchSensor`）；键盘按 Space 开始（`DRAG_KEYBOARD_CODES`），从不是 Enter。传入 `coordinateGetter`（或者只传这个 getter：`useDragSensors(getter)`），决定方向键怎么移动。不管拖动来自哪一种传感器，拖动中的 Escape 都只把这一项放回原处：它在 window 的捕获阶段被接住并阻止传播，所以拖动结束之前，应用里任何 Escape 处理函数（面板、对话框、弹出层的）都收不到它。
- `DragLift`：被拿起的副本，放在 `DndContext` 里面。它的子元素就是副本：这一项本身，或一个紧凑替身。它默认用控件的圆角；在 `className` 里传入这一项自己的圆角。它还会设置 grabbing 光标，在窗口失去焦点和浏览器标签页被隐藏时取消拖动，滚动指针靠近其边缘的区域，并让键盘拖动时的副本偏离它的位置 6px。把 dnd-kit 自带的自动滚动关掉（`autoScroll={false}`）。副本在所有其他层之上（`DRAG_LIFT_Z_INDEX`，999：高于弹出层、叠加的对话框和轻提示）。祖先元素带 transform 时（比如抽屉或对话框），传入 `container`（`document.body`）：副本保留它渲染时所在的主题作用域。
- `keepGrabInside(proxyWidth)`：给紧凑替身用的修饰器（modifier），这样在离这一项开头很远的地方抓住它时，手仍然停在替身上。`LIFT_CLASS` 是不用 `DragLift` 绘制的副本所用的拿起样式。
- `DropPlaceholder`：这一项将落下的位置，大小与这一项相同。在实时内容上方时用 `opaque`。
- `DragRefusalHint`：某个位置拒绝这一项的原因，显示在指针旁边的 HUD 标签片里，并配上 not-allowed 光标。只在手下面的位置拒绝时渲染它。标签片在指针的右下方；靠近窗口右边缘时移到指针和副本的左边，靠近下边缘时移到指针上方。它从不在副本下面，并且始终留在窗口边缘以内 8px。它的尺寸在内容变化时测量，而不是每一帧都测。
- `DraggedSlot`：包住列表里每一项的内容；传入 `dragging={isDragging}`（默认是 `false`）。被拖动的项自己的槽位，在这一项还在原处时是 40% 的不透明度（`ORIGIN_OPACITY`），这一项移到别处后就成为那个位置，带这一项的 `radius`。
- `useDragLists`：一个或多个列表里的项，可以重新排序、在列表之间移动，带拒绝和按名称的播报。它返回 `DndContext` 的处理函数、碰撞检测和 `accessibility`，以及给 `useDragSensors` 的 `coordinateGetter`。在这个 context 里渲染 `DragRemeasure version={items}`。
- `useDragAcrossLists`、`listKeyboardCoordinates` 和 `DragRemeasure`：`useDragLists` 所基于的键盘修正，给有自己列表的表面用。
- `createDragAnnouncements`、`dragInstructions`、`DEFAULT_DRAG_MESSAGES`：给 dnd-kit 的 `accessibility` 用的播报和操作说明，按名称，用你的语言。`name` 为空的拖动源什么都不说。`useDragAnnouncer` 和 `DragLiveRegion` 给自己播报的表面用。
- `useDragSiblingTransition()`（或 `DRAG_SIBLING_TRANSITION`）：给 `useSortable({ transition })` 用的 160ms 滑动，开启减弱动态效果时没有。`DROP_GLIDE` 是 `DragLift` 用的滑行，`DRAG_SETTLE` 是它的时长和缓动。
- `cancelDrag()`：取消正在进行的拖动，不管它在哪个传感器手里。它给 window 发一个 `resize`（每个 dnd-kit 传感器收到它都会取消），从不发合成的 Escape，所以按 Escape 关闭的对话框、面板或弹出层都收不到。
- 样式表读取的 data 属性：拖动来源的那一项上的 `data-drag-origin`（40%），这一项进入的容器上的 `data-drag-into`（`fill-subtle`）。

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 已拿起 | 副本：`layer-popover`、`shadow-float`、一圈 `line-seam` 环；不缩放，不倾斜。光标处处是 `grabbing` |
| 在原处 | 这一项以 40% 的不透明度留在原处 |
| 在某个位置上方 | `DropPlaceholder`：`fill-subtle` 底上 1.5px 的 `line-strong` 虚线，圆角和大小与这一项相同；在实时内容上方时不透明，底是 `layer-canvas` |
| 在拒绝放下的位置上方 | 没有占位框；指针旁边是 `DragRefusalHint` 标签片；光标是 `not-allowed` |
| 已放下或已取消 | 副本在 160ms 内滑进那个位置，或滑回原处；然后这一项显示在那里 |

## 行为 {#behavior}

- 副本从抓住的那一点起 1:1 跟随指针；不要用修饰器限制它的范围，或把它锁在一个轴上。紧凑替身可以用一个让它保持在手下面的修饰器。
- dnd-kit 测量的是浮层的第一个元素，所以键盘拖动的偏移画在它里面，不会移动任何放置目标。
- 开启 `prefers-reduced-motion` 时，副本和相邻项都没有动画。
- 鼠标指针或键盘拖动时按 Escape 会取消拖动：副本滑回原处，这次 keydown 不再往下传（`preventDefault`、`stopImmediatePropagation`）。拖动结束后，Escape 和在其他地方一样。
- 拒绝标签片留在窗口里，并避开副本：在右边缘翻到指针和副本的左边，在下边缘翻到指针上方，四边都离窗口边缘 8px。

## 无障碍 {#accessibility}

- 这些部件封装的是 dnd-kit。可拖动的项带有 dnd-kit 的属性：它可以获得焦点，带有角色描述和操作说明。
- 键盘：Space 拿起，方向键移动一个位置，Space 放下，Escape 取消（而且只是取消：应用里的 Escape 处理函数都收不到它）。Enter 从不开始拖动。用 `useDragLists`，或者 `useDragAcrossLists` 加 `DragRemeasure` 时，每按一次方向键正好移动一个位置，刚移进另一个列表之后也一样。
- 传入名称，从不传 ID：`createDragAnnouncements({ name, place, refusal }, messages)`。英文默认文案在 `DEFAULT_DRAG_MESSAGES` 里；把你的翻译作为 `messages` 传入，每一条都用同样的信息拼成。这一项没有名称时，什么都不说，而不是说出它的 ID：`SortableTabsList` 用标签页的 `aria-label` 或文字称呼它，`SortableComposerAttachments` 用附件的 `label`，`TaskDndProvider` 用卡片的 `describe`，没有它就不出声。
- `DropPlaceholder` 和 `DragRefusalHint` 对辅助技术隐藏：原因也要播报出来。

## 规则 {#rules}

- 每一种拖动都用 `useDragSensors`，这样表面从不自己挑选距离、按住时长或按键。
- 在 `DragLift` 里渲染副本，从不靠移动这一项本身。
- 拖动时把这一项留在原处，让 `data-drag-origin` 把它调淡。
