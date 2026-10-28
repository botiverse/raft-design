---
title: VirtualList
summary: 用于长列表的滚动容器，各行高度不同、挂载后才知道；它只渲染视野内的行，在尺寸和行变化时让人正在读的内容保持不动。
sourceHash: 646e7f3c
---

# VirtualList

VirtualList 只渲染长列表中视野内或靠近视野的行，在每行挂载时以及每次尺寸变化时测量它，并在尺寸变化、上方加载新行或列表跳转时让视野内的行保持不动。用它来显示由成千上万条高度不同的行组成的历史或信息流：频道、日志、动态信息流。

```example
virtual-list/compositions/basic
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 一个滚动栏里成千上万条高度不同的行 | VirtualList |
| DOM 放得下的一段对话的消息 | [MessageList](../message-list/message-list.md) |
| 看板上一长列任务卡片 | VirtualList，或在该列的 [ScrollArea](../scroll-area/scroll-area.md) 里用你自己的虚拟化器（[TaskBoard](../task-board/task-board.md)） |
| 其他任何会滚动的区域 | [ScrollArea](../scroll-area/scroll-area.md) |

## 结构 {#anatomy}

- `VirtualList`：滚动容器。它本身就是原生滚动容器（`overflow-y: auto`），不是 ScrollArea；除非设置 `showScrollbar`，否则隐藏原生滚动条。`data-slot="virtual-list"`。
  - `header`：可选，在各行上方，位于滚动容器内。
  - 撑高元素，`data-slot="virtual-list-items"`：高度等于所有行加起来，第一行上方有 `paddingTop`。
  - 各行，位于 `data-slot="virtual-list-visible-items"` 中：`children`（一个函数）或 `ItemComponent` 为视野内每个条目渲染的内容。把 `domRef` 放在行的根元素上，并把 `style` 展开到它上面；只有保持挂载但在视野外的行才会设置 `style`。
  - `footer`，然后是 `paddingBottom`：可选，在各行下方。
  - `empty`：没有条目时代替撑高元素渲染，位于顶部；设置 `emptyAlign="center"` 时位于中间。
- `componentRef`：`VirtualListApi`，提供 `scrollTo`、`getOffsetTopOfKey` 和滚动容器元素。

`getKey` 给每个条目一个稳定的 key；所有测量结果都按 key 保存，所以重新排序和新增条目后仍然有效。每个测量过的行带有 `data-virtual-list-item-key`。列表在滚动容器上写入 `--virtual-list-width`，供行内的吸顶内容读取。它不在各行的容器元素上写入任何 CSS 变量（每次滚动都在那里写一次，会让每一行重新计算样式）；必须跟随各行偏移的内容用 `onTransformChange`。

它的样式是普通 CSS，即 `styles/virtual-list.css`，已包含在 `styles.css` 里：滚动容器是 `.r-virtual-list`，空状态节点是 `.r-virtual-list__empty`。这些样式在 `components` 层，所以 `className` 里的工具类可以覆盖它们。

## 行为 {#behavior}

### 高度 {#heights}

- 行高不固定时设置 `itemResizable`。尚未挂载的行按 `itemEstimatedSize` 计算；行在浏览器绘制前测量一次，此后每次尺寸变化再测量。
- 把 `itemMinSize` 设为最矮那一行的高度或更小：为了填满视野，列表按这个尺寸计算尚未测量的行，值过大会让视野末端留空。
- 人滚动时，视野前方的行会提前挂载（向上滚动时一次挂载上方一屏，下方一两行），视野经过的行会再保持挂载一段时间，所以大多数滚动帧既不挂载也不卸载任何东西。跳转后只挂载视野内的行，直到人开始滚动。
- 各行按普通的块级流排布，所以外边距按 CSS 的规则折叠：相邻行之间，以及子元素的外边距穿过自身没有边框或内边距的行。列表测量的是每行实际占据的空间，所以行不需要 `display: flow-root` 或 `gap`。

```example
virtual-list/compositions/margins
```

### 视野上方变化的行 {#rows-that-change-above-the-view}

- 人向上滚动时在视野上方挂载的行，以及视野上方尺寸变化的行（图片加载完成、加了一个回应），它们的尺寸变化会被滚动抵消：视野内的行不会移动。被视野顶边切过的那一行不做补偿，因为它有一部分在视野内。
- 设置 `keepAnchorOnItemsChange` 后，`items` 变化时视野顶部的那一行保持原位，所以在它上方加载的较早的行不会把正在读的行往下推。在人接近顶部时加载下一页。`canAnchorItem` 用来排除新行会排在其下方的行，比如开头的标题行。

```example
virtual-list/compositions/load-older
```

### 跳转 {#jumps}

- `scrollTo({ key, align })`（或 `index`）把行的顶部对齐视野顶部（`"start"`），中部对齐视野中部（`"center"`），或底部对齐视野底部（`"end"`），都在 `scrollMarginTop` 和 `scrollMarginBottom` 之内。即使这一行和它相邻的行从没测量过，也会准确落到位，并且不会先绘制别的位置。
- 新的跳转会中止旧的跳转。到两端时位置会被限制住。设置 `behavior: "smooth"` 时，列表只滚动一次，滚到跳转开始时已知的位置。
- 跳转按 key 锁定目标行。在它还没稳定时上方加载进来的行，不会让它落到别的行上；设置了 `keepAnchorOnItemsChange` 时，也不会让它的目标行移动。
- 不设置 `align` 时，列表从该行的估计偏移出发，只滚动到刚好能显示这一行的程度（`debounce`，默认值）。
- `scrollTo({ position: "top" | "bottom" })` 跳到任一端。

```example
virtual-list/compositions/jump
```

### 跟随末尾 {#following-the-end}

列表不会自己跟随新行：是否跟随由产品决定。要让聊天停在最新消息处，在 `onScroll` 里记录人是否在底部；只要在底部，就在新增行时以及在 `onContentResize` 里调用 `scrollTo({ position: "bottom" })`。`onContentResize` 在某一行变高时运行，比如流式输出的回复。人向上滚动时，视图上方的行会被测量，这时它不运行：列表把这些行的变化滚掉，所以视图里什么都不动，离末尾的距离也不变；跟随这些变化，就会把一次从底部附近开始的滚动拉回去。

```example
virtual-list/compositions/chat
```

### 其他行为 {#other-behavior}

- 有文字被选中时，滚出视野的行保持挂载，所以滚动后选区和复制仍然有效。
- 持有焦点的行滚出视野时保持挂载，留在原位：无论是按 End 或 Page Down（浏览器通过滚动列表来处理），还是用滚轮或滚动条。卸载它会让焦点掉回页面，下一次 Tab 会从顶部开始。焦点离开这一行后，它在视野外时就会卸载。切换到别的窗口或标签页不算：这一行保留焦点，人回来时它还在。这需要 `itemResizable`，它会给每一行标上 key。
- `virtual={false}` 按正常流渲染所有行。设置了 `itemResizable` 时，关闭虚拟化后视野顶部的那一行保持原位；重新打开时保留测量结果，但不保留位置。
- `columns` 配合 `renderCol` 或 `renderItemWithCols` 时也可以横向滚动，并且只渲染视野内的列。
- 在 iOS 上，惯性滑动期间视野上方的尺寸变化先以 transform 的形式应用，滑动结束后再写入滚动位置，因为写入滚动位置会让惯性滑动停下。
- 新的 `sessionId` 会重置列表：滚动位置、测量结果和行。

## 无障碍 {#accessibility}

- VirtualList 渲染普通元素，不添加角色。按它所装内容的语义来处理列表，比如在外面套一个有名称的区域。DOM 里只有视野内或靠近视野的行，读屏软件数不到其他行：行数重要时，在区域名称里或旁边写明有多少行。
- 滚动容器在 Tab 顺序中（`focusable`，默认开启）。Page Up、Page Down 和 Space（Shift+Space 向上）每次滚动视野高度减去 32px 和 `keyboardPageBottomOcclusion`；Home、End、Cmd+Up 和 Cmd+Down 跳到任一端。只有在滚动容器本身上按下的键才会滚动它：在行内控件上按下的键，比如按钮上的 Space 或分段控件里的 End，交给那个控件处理。
- 页内查找只能找到 DOM 里的行。长历史要有自己的搜索。

## 规则 {#rules}

- 把 `domRef` 放在行的根元素上，也就是渲染函数返回的那个元素：列表在自己的子元素中查找行，所以 `domRef` 放在嵌套元素上的行永远不会被测量，读取时滚动位置会跳动。
- 同一个条目的 `getKey` 在多次渲染之间保持稳定：新的 key 就是新的行，会从估计值重新测量。
- 把条目当作不可变对象，要改变某一行就替换该条目的对象：对已挂载的行，只有当它的条目（按引用比较）或索引变化，或者 `children`、`ItemComponent`、`getKey`、`renderCol`、`renderItemWithCols`、`itemResizable`、`ignoreItemResize`、`sessionId`、`virtual` 中某一项变化时，列表才会重新渲染它；所以就地修改的条目，或读取其他可变状态的渲染函数，会显示过期的内容。
- 上方加载行期间，`header` 的高度保持不变：它的高度变化会移动视野内的行。

## 来源 {#provenance}

实现借鉴了 DeepSeek 网页版的虚拟列表实现。源码中以 "Unlike the reference implementation (DeepSeek web)" 开头的注释标出了行为不同的地方：行按块级流排布、外边距会折叠、按布局测量，以及第一行的上外边距单独处理。
