---
title: ScrollArea
summary: 使用原生滚动、画出细覆盖式滚动条的区域，滚动条在每个平台上看起来都一样，用于固定外框里的列表、横条和窗格。
sourceHash: eefd4d20
---

# ScrollArea

ScrollArea 用原生方式滚动内容，并画出 macOS 风格的细覆盖式滚动条：一个圆角滑块，用半透明的标签色（label color），看不到轨道；区域滚动或被鼠标指针指向时淡入，指向滑块时变粗，随后很快淡出。滚动条不占布局的空间，在每套主题、每个平台上看起来都一样：半透明的标签色在浅色页面上是深色，在深色页面上是浅色，所以滑块背后不用轨道，放在什么内容上都看得清。滚轮、触控板、触屏和键盘照常滚动；也可以拖动滑块，按在它旁边的空轨道上会翻页。每个滚动的区域都用它，在 raft-ui 里和基于 raft-ui 构建的应用里都是，这样滚动条在每一处看起来、用起来都一样；只有[原生滚动](#native-scrolling)里列出的例外才保留原生滚动。raft-ui 把它用在桌面端的消息列表和侧栏、面板的 `PanelScrollViewport`、动态、搜索、文件和任务列表、消息输入框的输入区、建议和附件行、宽 Markdown 表格、Select、Combobox 和 ComboboxSelect 的列表（用 absolute 滚动条槽，因为列表的子元素归 Base UI 管）上，以及应用把 VirtualList 渲染成它的容器的每一处，滚动条盖在 VirtualList 上。

ScrollArea 参照 [react-scroll-area-demo](https://github.com/07akioni/react-scroll-area-demo)：它测量一个容器，即真正滚动的元素，并把滚动条槽（gutters，即滚动条）画在容器里面，作为它的第一个子元素。区域就是一个元素，所以 `ref` 拿到的是原生的 `scrollTo` 和 `scrollBy`，`onScroll` 收到的是它的滚动事件。`<ScrollArea>` 是常见情形，用它自己的一个 `<div>` 作为容器（或 `render` 给出的元素）。对于你自己渲染的元素（一个列表、VirtualList 自己的滚动容器），由 `useScrollAreaContainer`（即 demo 里的 `useContainer` 做成的 hook）来绑定它，由 `<ScrollAreaGutters />` 画出它的滚动条（[自己渲染的容器](#your-own-container)）。`ScrollAreaTextarea` 是针对 `<textarea>` 的同一种做法。

```example
scroll-area/compositions/basic
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 在固定外框里滚动的列表、横条或窗格 | ScrollArea |
| 需要显示同样滚动条的 `<textarea>` | `ScrollAreaTextarea` |
| 自己滚动的元素（列表自己的滚动容器） | `useScrollAreaContainer`（[自己渲染的容器](#your-own-container)） |
| 面板头部下面的内容 | `PanelScrollViewport`（[Panel](../panel/panel.md#anatomy)） |
| 一个对话或一个消息列里的消息 | [MessageList](../message-list/message-list.md)，它基于 ScrollArea 构建 |
| 长到渲染每一行都太慢的列表 | [VirtualList](../virtual-list/virtual-list.md) |
| 放不下的一排标签页 | [Tabs](../tabs/tabs.md#behavior)，它自己会滚动 |
| 比正文还宽的 Markdown 表格 | `MarkdownTableScroll`（[Markdown](../markdown/markdown.md)） |

## 结构 {#anatomy}

ScrollArea（sticky 滚动条槽）：

```text
div.r-scroll-area.r-scroll-area--sticky-gutters   data-slot="scroll-area": the container and the root; it scrolls; ref, className, style, native props
  div.r-scroll-area__gutters                      data-slot="scroll-area-gutters": aria-hidden, sticky, zero high, the first child (in flow)
    div.r-scroll-area__gutter--vertical           data-slot="scroll-area-scrollbar": a gutter for each axis that scrolls right now
      div.r-scroll-area__thumb                    data-slot="scroll-area-thumb"
  div.r-scroll-area__content                      data-slot="scroll-area-content": with contentClassName, contentStyle or fade; else the children themselves
```

absolute 滚动条槽（`useScrollAreaContainer({ guttersPosition: "absolute" })`、`ScrollAreaTextarea`）：

```text
div.r-scroll-area.r-scroll-area--absolute-gutters   your frame (frameProps): position relative, a flex column; the root
  (your element).r-scroll-area__container            the container (containerProps): it scrolls and fills the frame
  div.r-scroll-area__gutters                        ScrollAreaGutters: aria-hidden, absolute, inset 0, after the container
    div.r-scroll-area__gutter--vertical > div.r-scroll-area__thumb
```

- `ScrollArea`：给它区域的尺寸（一个高度、一个 `max-height`，或作为 flex 子项分到的份额）。它就是容器，所以 `ref`、`className`、`style`、`onScroll` 和原生属性都在真正滚动的元素上；`render` 可以把它换成另一个元素（`<section>`、`<nav>`）。
- 内容：直接是子元素；或者传 `contentClassName`、`contentStyle` 时，外面包一层内容元素（`ScrollAreaContent`）。内边距和布局（grid、flex、`gap`、`stack-y-*`）放在这一层上，不要放在区域本身（[规则](#rules)）。
- 滚动条槽：即滚动条，盖在右边缘（纵向）和下边缘（横向）上，压在区域里的一切之上（[规则](#rules)），对辅助技术隐藏。它们是一层零高度的图层，但在文档流里：和其他子元素一样，是容器的一个子元素。
- `useScrollAreaContainer` 和 `ScrollAreaGutters`：给你自己渲染的容器用的同一种区域（[自己渲染的容器](#your-own-container)）。
- `ScrollAreaTextarea`：以原生 `<textarea>` 为容器，用 absolute 滚动条槽。

## 变体 {#variants}

| 属性 | 取值 | 用于 |
| --- | --- | --- |
| `orientation` | `vertical`（默认）、`horizontal`、`both` | 区域滚动的方向，每个方向有自己的滚动条。纵向区域里太宽的内容会被裁掉。两个方向都滚动时，每条滚动条都在角落前停下，角落保持透明 |
| `trigger` | `hover`（默认）、`scroll`、`none` | 滚动条什么时候显示：鼠标指针在区域上或区域滚动时；只在滚动时（消息列表、侧栏、附件行）；或者一直显示 |
| `size` | `medium`（默认）、`small` | 滑块的粗细：静止时 7px 或 5px，被指向或拖动时再粗 3px。短横条用 `small` |
| `fade` | `false`（默认）、`true` | 哪个边缘外还有内容，内容就朝那个边缘在最多 24px 内渐隐。用于较短的区域：渐隐会在滚动时重绘内容 |
| `overscroll` | `none`（默认）、`contain`、`auto` | 滚动到尽头时怎样：停下，不回弹；停下，但允许 Mac 触控板或 iOS 让区域回弹；或者带着后面的页面继续滚动 |

```example
scroll-area/compositions/orientation
```

```example
scroll-area/compositions/trigger
```

```example
scroll-area/compositions/size
```

```example
scroll-area/compositions/fade
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 没有可滚动的内容 | 没有滚动条，区域也不是 Tab 停靠点 |
| 静止 | `trigger="hover"` 或 `"scroll"` 时没有滚动条；`"none"` 时滑块是 `foreground` 的 42% |
| 悬停 | `trigger="hover"` 且鼠标指针能悬停时，滚动条在 120ms 内淡入（触屏上没有） |
| 滚动中 | 每种 trigger 下滚动条都会显示；距上一次滚动过了 `hideDelay`（默认 600ms，`trigger="scroll"` 时至少 100ms）后，在 400ms 内淡出 |
| 指向滑块 | 滑块变粗 3px，颜色加深到 `foreground` 的 58% |
| 拖动滑块 | 和被指向时一样，直到拖动结束；区域按比例滚动 |
| 键盘焦点 | 区域周围显示焦点环（`--focus-ring`） |

### 边缘状态 {#edge-state}

某个边缘外还有内容时，区域带着对应的修饰类：`r-scroll-area--overflow-y-start`（上方）、`--overflow-y-end`（下方）、`--overflow-x-start` 和 `--overflow-x-end`（行内方向的起始和末端，所以在从右到左的布局里是右边缘和左边缘）。用它们给分隔线或「还有更多」的提示加样式，比如行滚到吸顶头部下面后，在头部下方显示一条细线。其中任何一个变化时，都会调用 `onEdgeChange`，传入 `{ top, bottom, left, right }`（区域已经滚到那个边缘的尽头时为 `true`）；挂载后的第一帧里内容有溢出时，也会调用一次。

粘在区域里的头部或底栏（`position: sticky`）会盖住区域的两端，所以把它的高度传给 `railInset`：`railInset={{ top: 40, bottom: 40 }}` 让纵向滚动条从头部下方开始、到底栏上方结束。`left` 和 `right` 对横向滚动条做同样的事，比如在 sticky 的第一列旁边。同样的留空也可以来自 CSS，设在区域本身上：`--r-scroll-area-rail-inset-top`、`-bottom`、`-left` 和 `-right`。它们不继承，所以嵌套在里面的滚动区域不会用到它们。

```example
scroll-area/compositions/edge-state
```

## 行为 {#behavior}

- 滚动是浏览器自己的滚动：滚轮、触控板、触屏和键盘照常滚动区域。拖动滑块按比例滚动；按在滑块旁边的轨道上，会朝按下的方向翻页，每次滚动接近一个视口的距离（平滑滚动，除非读者要求减弱动态效果）。
- 默认情况下，滚动到尽头就停在那里：不会带着后面的页面继续滚动，在 Mac 触控板或 iOS 上也不会让区域（和它吸顶的头部或吸底的底栏）回弹。`none` 和 `contain` 只在内容此刻溢出的方向上生效，所以只横向溢出的区域永远不会阻止页面向下滚动。
- `trigger="scroll"` 时，隐藏的滚动条不会拦截本该落到它下面内容上的按压。鼠标指针已经在上面的滚动条，过了 `hideDelay` 仍然可见、可用，直到指针离开。
- 悬停只对能悬停的鼠标指针生效（`@media (hover: hover)`，[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。在触屏上，最后点按的东西会一直处于悬停状态，这会让滚动条一直显示、滑块一直是粗的，直到下一次点按别处。所以在触屏上，`trigger="hover"` 只在区域滚动或拖动滑块时显示滚动条，和 `"scroll"` 一样；两种 trigger 下，隐藏的滚动条都会让点按穿过去，落到下面的内容上：否则边缘上一条看不见的窄带会吞掉对内容的点按。因滚动而显示的滚动条会接住手指，所以可以拖动它的滑块，拖动期间它保持显示。
- 滑块的行为和原生滚动条一样：每一帧，滑块的长度和位置都跟随当前的滚动位置和内容尺寸，没有过渡，所以内容在滚动中途变长或变短时，滑块在同一帧里就换成新的长度和位置。浏览器支持滚动驱动动画时，由浏览器自己根据滚动、在合成线程上、按滚动容器自己的时间线移动滑块；脚本只在尺寸变化时设定它们的尺寸。其他情况下，一次滚动只请求一个动画帧，不管来了多少个滚动事件，在这一帧里用 `transform` 移动每个滑块。
- 滑块的长度跟随内容和视口的尺寸：ScrollArea 用 ResizeObserver 观察容器（视口）、内容（容器的每个元素子节点，或 `contentRef`）和每个滚动条槽，用 MutationObserver 观察子元素的增删。它在收到通知后的那个动画帧里测量，从不在通知里测量：测量会改变滚动条槽的尺寸，而滚动条槽也在被观察，在通知里这样做会触发 "ResizeObserver loop" 错误。容器是 VirtualList 时，ScrollArea 观察的是装着已渲染各行的盒子，而不是列表的撑高元素：列表根据自己的 ResizeObserver 自行改变那个元素的尺寸，所以也观察它的话，会触发同样的 "ResizeObserver loop" 错误。没有任何被观察的东西会报告的尺寸（被平移到列表撑高元素之外的行），在下一个滚动帧里重新读取，或者通过 `actionsRef.measure()` 读取。它自己监听容器的滚动，只监听一次，不管东西重新渲染多少次。
- 浏览器支持滚动驱动动画时，容器给自己的滚动时间线命名。sticky 滚动条槽在容器里面，直接跟随这些时间线；absolute 滚动条槽是容器的兄弟元素，所以由外框把这些名字提升上来（`timeline-scope`）。每个 ScrollArea 的名字都是唯一的，所以嵌套在另一个区域容器里的区域用自己的时间线，从不用父级的。其他任何排布方式下，由脚本移动滑块。
- 滚动不触发渲染。滚动时不往根元素上写任何东西（设置 `fade` 时，只有蒙版在动）。边缘类直接设在根元素上，另一个组件渲染的容器替换了它的 className 时会再设一次；滚动中和拖动中的类设在滚动条槽这一层上，所以每次滚动开始和结束时切换它们，只会重新计算滚动条的样式，从不重新计算根元素下面的内容（一个长列表）。`onEdgeChange` 在这一帧里调用。ScrollArea 只在滚动条出现或消失时重新渲染。滑块由浏览器驱动动画时，滚动的帧仍然读取滚动尺寸（让每个滑块的长度保持最新），但除非尺寸变了，什么也不写。
- 改变尺寸时也不往根元素上写任何东西。测量写入的尺寸（视口的高度，以及用 sticky 滚动条槽时容器的内边距）写在滚动条槽这一层上；设置 `fade` 时，视口的尺寸写在带蒙版的内容上。它们注册为不继承（`@property`），所以调整窗口大小时，虽然每一帧都改变视口，也只会重新计算滚动条的样式，从不重新计算根元素下面长列表的每一行。它们是内部的：用 ResizeObserver 读取区域的尺寸，不要从它们读取。
- 滚动时发现内容开始溢出或不再溢出，而被观察的东西都没有改变尺寸（不经过 input 事件写进 textarea 的文字），会重新测量，所以滚动条在那一帧里出现或消失。

```example
scroll-area/compositions/overscroll
```

### 用代码滚动 {#scrolling-from-code}

`ref` 就是容器，即真正滚动的元素，所以它拿到原生的 `scrollTo` 和 `scrollBy`，`onScroll` 收到它的事件。

```example
scroll-area/compositions/scroll-to
```

`actionsRef` 拿到 `scrollToElement(element, options)`，它滚动这个区域，而且只滚动这个区域（`scrollIntoView` 还会滚动页面），让区域里的一个元素进入视野。`block` 把元素对齐到 `start`（默认）、`center` 或 `end`，`nearest` 则只滚动必要的距离。`offset` 在元素和边缘之间留出这么多 px 的空白，比如吸顶头部的高度（把同样的高度传给 `railInset`，让滚动条也从它下面开始）；`behavior: "smooth"` 让滚动带动画。在 `horizontal` 区域里，`block` 和 `offset` 作用于横向；在 `both` 区域里，横向只滚动必要的距离。

```example
scroll-area/compositions/scroll-to-element
```

### 多行输入框 {#textarea}

`<textarea>` 自己滚动，又不能有子元素，所以 `ScrollAreaTextarea` 就是用 absolute 滚动条槽、以原生 textarea 为容器的 `useScrollAreaContainer`（即 demo 里的 textarea 示例）。给根元素加外框样式（`wrapperClassName`：边框、背景、焦点环），给 textarea 加内边距（`className`）；滚动条跟随输入、粘贴和受控的 `value`。拖动底部的角可以把 textarea 拉高：滚动条停在拖动手柄上方，让手柄仍然够得着。`ref`、`className`、`style`、`value`、`onScroll` 和其他所有原生属性都传给 textarea；它像 ScrollArea 一样接受 `trigger`、`hideDelay`、`size` 和 `overscroll`。

```example
scroll-area/compositions/textarea
```

### 自己渲染的容器 {#your-own-container}

`useScrollAreaContainer(options)` 是去掉了自己那个 `<div>` 的 ScrollArea（即 demo 里的 `useContainer`，做成 hook）：在渲染那个滚动元素的组件里调用它，这个元素可以是一个列表，或另一个组件自己的滚动容器，然后把它返回的东西展开到你的元素上。它接受 ScrollArea 的选项（`orientation`、`trigger`、`size`、`fade`、`overscroll`、`railInset`、`hideDelay`、`onEdgeChange`、`actionsRef`、`contentRef`）、滚动条槽放在哪里（`guttersPosition`），以及你自己指向该元素（`containerRef`）和外框（`frameRef`）的 ref，返回：

- `containerProps`，给真正滚动的元素：`ref`（一个转发给 `containerRef` 的回调，所以不需要合并）、排在你自己的类之前的 `className`、你的样式排在它之后的 `style`，以及 `tabIndex`（元素本来就能获得焦点时不给）。它的类按 `orientation` 给元素设好溢出方式，和 ScrollArea 自己的容器一样（纵向：`overflow-y: auto` 和 `overflow-x: hidden`；横向反过来；两个方向：`auto`），所以不要再加溢出类：原生的溢出类正是 `raft-ui/prefer-scroll-area` 会报告的。你自己的溢出类仍然会盖过这个 hook 的，因为 hook 的类没有优先级（specificity），所以还在传溢出类的代码照样能用。
- `guttersProps`，给 `<ScrollAreaGutters {...guttersProps} />`，它放在 `guttersPosition` 指定的位置：作为元素的第一个子元素（`sticky`），或紧跟在元素后面（`absolute`）。原样展开它：它是滚动条槽和元素之间的绑定，里面没有需要读取或自己构造的东西。
- `frameProps`，只在用 absolute 滚动条槽时有（sticky 时是 `undefined`；传入 `guttersPosition: "absolute"` 时，类型上它总是存在），给你在元素和滚动条槽外面渲染的那个定位外框：`ref`、排在你自己的类之前的 `className`（尺寸、边框和焦点环加在这个外框上）和 `style`。外框是一个 flex 纵列：给元素加 `flex-1 min-h-0`，让它填满外框并滚动。
- `measure()`，在出现没有任何被观察的东西会报告的变化（textarea 的输入）时重新测量；`scrollToElement`，和 `actionsRef` 上的一样；以及 `scrollable`。

这个 hook 自己监听元素的滚动；某次渲染把另一个元素放进 `ref` 时，它会重新绑定。它返回的一切都保持稳定，直到它依据的某样东西变了（数值相同的内联 `railInset` 对象不算变化），所以可以放进经过 memo 的子组件的 props 里。

没有 `contentRef` 时，容器的每个元素子节点都会被观察尺寸变化，子元素的增删也会被观察。直接子元素很多的列表（一个 `<ul>` 里有一千个 `<li>`），把它们包在一个元素里，把这个元素作为 `contentRef` 传入；或者保留一个尺寸等于内容尺寸的哨兵元素作为 `contentRef`：这样区域只观察一个元素，而不是每一行。

```example
scroll-area/compositions/sticky-gutters
```

```tsx
function Members({ members }: { members: string[] }) {
  const { containerProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>();
  return (
    <div
      {...containerProps}
      role="region"
      aria-label="Members"
      className={`${containerProps.className} h-48`}
    >
      <ScrollAreaGutters {...guttersProps} />
      <ul className="px-4">
        {members.map((member) => (
          <li key={member}>{member}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### 滚动条槽的位置 {#gutters-position}

`sticky`（默认值，也是 ScrollArea 用的）增加的东西最少：区域就是一个元素，滚动条槽是它里面一层零高度的图层，是它的第一个子元素。sticky 盒子始终在文档流里，所以在容器自己的布局里，这一层也是容器的子元素之一：

- 在块级布局里，或没有 `gap` 的 flex 纵列里，它是零高度的一行，什么都不会移动；
- 在 grid 里它占第一个格子，所以每一项都往后挪一格；
- 在有 `gap` 的 flex 纵列或 grid 里，第一项前面多出一个间隔；
- 在 flex 横排（横条）里它是零宽度的一项，滚动条槽也跟着塌成零宽；
- 作用于容器子元素的兄弟选择器和结构选择器会把它算进去：`stack-y-*` 和 `rule-y`（`* + *`）也会匹配第一个真正的子元素，子元素上的 `first:` 或 `only:` 不再匹配。

所以给 sticky 容器一个装着内容的子元素，把 grid、flex、`gap`、`stack-*` 或 `rule-*` 类放在这个包裹层上（用 ScrollArea 时就是 `contentClassName`）。开发环境下，sticky 容器是 grid、flex 横排或带间隔的 flex 纵列时，区域会在控制台里警告。容器上加内边距没问题，哪个方向都行：这一层会盖过内边距，所以滚动条槽仍在容器的边缘；不过把内边距加在包裹层上，能让布局集中在一处。

`absolute` 不往容器里放任何东西：一个外框装着容器，滚动条槽盖在外框上，所以容器的子元素和布局都完全归它自己。不能有子元素的容器（textarea），或由容器自己排布子元素的容器（它自己的 grid、flex 横排），用这种方式。用 absolute 滚动条槽时，`fade` 的蒙版在容器上；外框由你提供，它的焦点环（`has-focus-visible:`）也由你负责。

```example
scroll-area/compositions/absolute-gutters
```

[VirtualList](../virtual-list/virtual-list.md#with-scrollareas-scrollbar) 自己渲染滚动容器，所以按这种方式使用，通过它的 `header` 放 sticky 滚动条槽：

```tsx
const { containerProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>({
  overscroll: "auto",
});
<VirtualList
  domRef={containerProps.ref}
  className={containerProps.className}
  style={containerProps.style}
  header={<ScrollAreaGutters {...guttersProps} />}
  {...listProps}
/>;
```

用 sticky 滚动条槽时，`className` 和 `style` 带着根元素的类和变量，之后由这个元素持有它们。传 `overscroll="auto"` 时，容器保留自己的 `overscroll-behavior`。VirtualList 按块级排布各行，所以它的 sticky 滚动条槽不会移动任何东西。

## 样式 {#styling}

ScrollArea 是纯 CSS（`scroll-area.css`，在 `components` 层里，随 `styles.css` 一起发布），所以它 `className` 里的工具类可以覆盖它。它的类有：根元素上的 `r-scroll-area`，加上前面提到的修饰类、边缘类和 `--rtl`，以及 `--sticky-gutters` 或 `--absolute-gutters`；absolute 容器上的 `__container`，ScrollArea 自己的 `<div>` 上的 `__viewport`，`__content`、`__textarea`，以及 `__gutters`（带 `--scrolling` 和 `--dragging`）、`__gutter`（`--vertical`、`--horizontal`、`--shortened`、`--dragging`）和 `__thumb`。滚动条槽这一层、每个滚动条槽和每个滑块还带有 `data-slot`（`scroll-area-gutters`、带 `data-orientation` 的 `scroll-area-scrollbar`、`scroll-area-thumb`）。外观由区域上的变量设定：`--r-scroll-area-thumb-size-{small,medium}` 和 `-thumb-size-hover-{small,medium}`、`--r-scroll-area-thumb-color` 和 `-thumb-color-hover`、`--r-scroll-area-rail-gap`（3px，滑块和边缘之间的距离）以及 `--r-scroll-area-fade-size`。

## 无障碍 {#accessibility}

- ScrollArea 不基于任何 Base UI 原语：它是原生滚动容器，所以辅助技术和键盘用的是浏览器自己的滚动。画出来的滚动条是 `aria-hidden`。
- 区域自己没有角色：它是一个 `<div>`，而没有角色的 `<div>` 上的名字不会被读出（ARIA 禁止给 generic 角色命名）。有内容可滚时，它可以获得焦点（`tabIndex={0}`，`useScrollAreaContainer` 的 `containerProps` 里也有），这样键盘用户可以用方向键、Page Up 和 Page Down 滚动它。用下面两种方式之一给它装的东西命名：
  - 把它做成有名称的区域（region）：`role="region"` 加 `aria-label`（或者用 `render` 渲染一个自带角色的元素，比如 `<nav>`），这样聚焦它时会读出它是什么；
  - 或者给里面的内容命名，比如带 `aria-label` 的列表。
- 里面的每一项都自己获得焦点并滚进视野时，传 `tabIndex={-1}`，附件行就是这样。

## 规则 {#rules}

- 每个区域只有一个滚动容器：头部不动，只有内容滚动（[Panel](../panel/panel.md#behavior)）。
- 设置区域的尺寸，而不是内容的尺寸：没有高度的 ScrollArea 会随内容变高，永远不会滚动。
- 在 sticky 容器里，用一个包裹层（`contentClassName`）给内容排版：永远不要在容器本身上用 grid、flex、`gap`、`stack-*` 或 `rule-*`，它的第一个子元素是滚动条槽那一层（[滚动条槽的位置](#gutters-position)）。必须自己排布子元素的容器，用 absolute 滚动条槽。
- 给内容（`contentClassName`）加内边距，而不是给区域加：滚动条槽会盖过 sticky 容器的内边距，但加在内容上，内容的布局就集中在一处。
- 用 `useScrollAreaContainer` 时，把 `<ScrollAreaGutters {...guttersProps} />` 放在 `guttersPosition` 指定的位置：容器的第一个子元素，或紧跟在容器后面。
- 区域里有吸顶的头部或吸底的底栏时，把它的高度写进 `railInset`，让滚动条不压在它上面。
- 让滚动条留在最上层。它们像原生滚动条一样，压在区域里的一切之上：滚动条槽这一层在 `z-scrollbar`（49），也就是页面内最高的一层，高于区域里直到 `z-app` 的每个具名层级，处在根元素之内，而根元素自成一个层叠上下文（`isolation: isolate`）（[层叠顺序](../../../../../design/foundations/elevation.md#layer-order)）。区域里的东西要用层级名称，永远不用数字：放在浮层数值（50 及以上）的部件会画在滚动条上面。不要把区域里的东西抬高去盖住滚动条；吸顶的头部用 `railInset` 让开滚动条。因为根元素把内容隔离开了，区域里的东西也盖不住区域外的任何东西，不管它的 `z-index` 是多少：必须盖住区域外内容的图层（弹出层、拖动时跟手的副本）要通过 portal 渲染出去，raft-ui 的浮层和 `DragLift` 默认都是这样做的。行末（inline end）的控件要让开滚动条占的那条 16px 的槽（`size="small"` 时 14px），就像 ChoiceList 的行操作那样：在槽上面，滚动条压在它上面，也抢走指针。在一个动态列表里，每天的吸顶日期标题（不透明背景，z-15）在滑块滑过时盖住了它，把它切成了几段（Artea，2026-11-09，#proj-raft-ui:21bae128）。

### 原生滚动 {#native-scrolling}

- 每个滚动的区域都做成 ScrollArea：`ScrollArea`，你自己渲染的元素用 `useScrollAreaContainer`，`ScrollAreaTextarea`，或基于它们构建的部件（面板里的 `PanelScrollViewport`）。永远不要为了让一个元素滚动而给它加 `overflow-auto`、`overflow-y-auto`、`overflow-x-auto` 或 `overflow-scroll`。原生滚动条因平台和主题而异：经典滚动条出现时会占用布局的空间（8px 的列表内缩变得不均匀，行里的控件会移动），而且用平台的颜色画，不是在浅色和深色下都看得清的标签色。ScrollArea 的滚动条不占空间，在每一处看起来都一样；区域只在有内容可滚时才是 Tab 停靠点，并带焦点环；滚动到尽头就停下，不会带着后面的页面滚动；[边缘状态](#edge-state)和 `fade` 也随之而来。
- 只在 ScrollArea 放不进去、或者什么也画不出来的地方保留原生滚动，并在类旁边用注释写明是哪一种例外。包里其他任何 `overflow-auto` 或 `overflow-scroll` 都会让 `scroll-area-everywhere.test.ts` 失败。在应用里，raft-ui 的 lint 规则 `raft-ui/prefer-scroll-area` 会报告它们，注释是上一行的 `// raft-ui: native-scroll <reason>`（[Lint 规则](../../../../../design/about/use-raft-ui.md#lint-rules)）。例外有：

| 位置 | 为什么用原生滚动 |
| --- | --- |
| 768px 以下的 MessageList 和 Sidebar | 在手机上，它们用原生滚动，带平台自己的覆盖式滚动条，不占空间（[MessageList](../message-list/message-list.md#behavior)、[Sidebar](../sidebar/sidebar.md#anatomy)） |
| 一排 [Tabs](../tabs/tabs.md#behavior)、放不下的 [SegmentedControl](../segmented-control/segmented-control.md)、一行 `CopyableCode` | 按设计就没有滚动条的单行横条；Base UI 的标签页列表自己排布标签页，而一行 `<code>` 里只有文字 |
| CodeBlock 的 `<pre>`，以及公告文字里的 `<pre>` | `<pre>` 只能放短语内容（phrasing content），所以滚动条槽放不进去，而且它常常是代码高亮工具或 Markdown 自己的元素 |
| `DialogBody` 和 `DrawerBody` | 调用方直接给主体本身排版（`className="grid gap-4"`），sticky 滚动条槽会占掉 grid 的第一个格子（[滚动条槽的位置](#gutters-position)）；它们要先有一个内容部件，才能成为 ScrollArea |
| VirtualList 自己的滚动容器 | 除非设置了 `showScrollbar`，它会隐藏自己的滚动条；要用 ScrollArea 的滚动条，就用 `useScrollAreaContainer` 绑定它（[自己渲染的容器](#your-own-container)） |

- 原生滚动容器只朝一个方向滚动：把另一个轴设为 `hidden`（`overflow-x-hidden overflow-y-auto`）。只写 `overflow-y-auto` 会让横向的轴也成为 `auto`，于是任何伸出滚动容器内边距盒的东西，比如一直画到弹出层边缘的分隔线，都会让它横向滚动，而经典滚动条（Windows，或设置为始终显示滚动条的 macOS）会为此画出一条滚动条。要伸到弹出层边缘的线，需要那条边缘在滚动容器里面：Select 的列表外框伸进弹出层的内缩里，列表再用内边距把它补回来。Select 的运行时列表当时还是原生滚动，曾因为分隔线伸出的 4px 显示出一条横向滚动条（Artea，2026-11-08，#proj-raft-ui:20a421bd）。
