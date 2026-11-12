---
title: Lightbox
summary: 盖在遮罩上的全屏查看器，用于图片和附件预览，带上一个和下一个、缩略图，以及一个关闭按钮。
sourceHash: b87895ac
---

# Lightbox

图片查看器在整个窗口上以完整尺寸显示一张图片或一个文件预览：图片放在全屏的 `layer-backdrop` 上，配上一个、下一个，以及一个用来关闭的图标按钮（[用现有部件搭建](../../../../../design/components/overview.md#file-viewer)）。有人从消息里打开图片或附件时用它。它只用于媒体和预览。

```example
lightbox/compositions/image-lightbox-shell
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 以完整尺寸查看图片、截图或视频 | Lightbox，图片外壳 |
| 以完整尺寸预览附件（HTML 页面、文档） | Lightbox，附件外壳 |
| 从头读到尾的文件（PDF、Markdown、很长的示意图） | Lightbox，[文档模式](#document-mode)下的附件外壳 |
| 决定、表单或任何不是媒体的东西 | [Dialog](../dialog/dialog.md) |
| 人在页面旁边阅读的详情 | [Drawer](../drawer/drawer.md) |
| 消息里的附件本身 | [MessageAttachment](../message-attachment/message-attachment.md) |

## 结构 {#anatomy}

- `Lightbox`：根元素。它保存图片查看器是否打开。必需。
- `LightboxTrigger`：打开图片查看器的东西，通常是消息里的图片或文件卡片。
- `LightboxContent`：全屏的那一层，后面是遮罩。必需。在它里面打开的弹出层画在它上面（[里面的弹出层](#popups-inside)）。
- `LightboxTitle`：文件名。
- `LightboxClose`：关闭按钮。必需。
- `LightboxStage`：让媒体居中的区域。必需。
  - `LightboxMedia`：图片或视频，最高为窗口高度的 80%，最宽为窗口宽度的 86%。
  - `LightboxNavigationButton`：上一个（`direction="previous"`）和下一个（`direction="next"`），44px 的按钮，距左右边缘 32px。
  - `LightboxInfoDock` 加 `LightboxInfoBar`：靠近底部的一条浮动小栏，用 `layer-popover` 和 `shadow-float`，里面放 `LightboxInfoTitle`（文件名）和 `LightboxInfoActions`（比如 Download）。它是一条浮动工具栏，在任何输入方式下都高 36px，即消息悬停工具栏在触屏上的尺寸：按钮 28px，距栏内边缘 4px，按钮之间间隔 4px，用 `radius-chip`；在触屏上点击区域高 44px，向相邻按钮方向只延伸到间隔的一半（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
  - `LightboxThumbnailStrip` 加若干 `LightboxThumbnail`：沿底部排列的 48px 缩略图；`active` 标出当前显示的那一张。
- `LightboxToolbar`：附件外壳的顶栏，取代浮动的关闭按钮，用 `layer-canvas`，下方有一条 `line-seam`。里面放 `LightboxHeaderMeta`（先是标明预览类型的 `LightboxHeaderLabel` 或 [Badge](../badge/badge.md)，再是 `LightboxTitle`）和 `LightboxActions`，`LightboxClose` 放在最后。
- `LightboxBody`：[文档模式](#document-mode)下 `LightboxToolbar` 下面那个可滚动的正文，是一个占满内容其余部分的 [ScrollArea](../scroll-area/scroll-area.md)，用 `layer-canvas`，即工具栏的表面。用它的 `className` 设别的表面（`bg-layer-sidebar`），ScrollArea 的每个 prop，包括 `render`，都作用于这个滚动区域。它的内容避开手机的安全区域，`contentClassName` 和 `contentStyle` 给安全区域里面调用方自己的一个盒子设样式，所以这个盒子自己的内边距是加在安全区域上，而不是取代它。实验性，从 `@botiverse/raft-ui/wip` 导入。
- `LightboxHeader`：放标题和操作的普通顶部行，用于既不需要工具栏、也不需要浮动关闭按钮的外壳。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 图片外壳：`LightboxClose` 直接放在 `LightboxContent` 里 | 图片和视频。关闭按钮浮在右上角；图片占用整个窗口 |
| 附件外壳：`LightboxToolbar` 放在 `LightboxStage` 上方 | 占满舞台区域的文件预览，比如 `iframe` 里的 HTML 页面。工具栏写出文件名，放文件的操作和关闭按钮 |

```example
lightbox/compositions/attachment-preview-shell
```

### 文档模式 {#document-mode}

从头读到尾的文件，比如 PDF、Markdown 或文本文件、很长的示意图，在附件外壳里打开，`Lightbox` 上设 `modal="trap-focus"`，文件自己的正文在工具栏下面的 `LightboxBody` 里独立滚动，`LightboxBody` 是一个占满其余空间的 [ScrollArea](../scroll-area/scroll-area.md)（`min-h-0 flex-1`）。它和工具栏一样用 `layer-canvas`；App 用 `className` 选别的表面。`LightboxContent` 让指针穿过它落到遮罩上，所以正文和工具栏一样，用 `pointer-events-auto` 把指针拿回来。页面的滚动没有锁定，所以正文不能把滚动传给遮罩下面的页面：它要设 `overscroll-contain`，因为 ScrollArea 只在自己还有东西可滚时才拦住滚动，否则一个短文件的正文会让后面的页面滚动。用自己的正文代替 `LightboxBody` 时，自己加上 `pointer-events-auto`、`min-h-0 flex-1` 和 `overscroll-contain`。文档模式是 Base UI 自己的 `modal` prop 的一个值，而不是一个单独的 prop：它改变的是图片查看器怎样对待页面，而不是它有哪些部件；在 `modal` 旁边再加一个开关，会允许一些没有意义的组合，比如不是模态的文档模式。

```example
lightbox/compositions/document-preview-shell
```

## 状态 {#states}

- **第一项和最后一项：**上一个或下一个禁用。它仍可获得焦点（`aria-disabled`），但忽略点击。
- **缩略图：**当前显示的那项边缘为实色；其他项用 `layer-backdrop-nested`（40%）调暗，悬停时 28%。缩略图条放在 `layer-backdrop` 上，两种模式下都是深色，所以嵌套遮罩在浅色和深色模式下调暗缩略图的效果一样（[表面](../../../../../design/foundations/color.md#surfaces)）。

## 行为 {#behavior}

- 图片查看器出现和消失都没有动画，和其他居中浮层一样（[动效](../../../../../design/foundations/motion.md#usage)）。
- Esc、关闭按钮、点击遮罩和 Cmd+W（Ctrl+W）都会关闭它。Cmd+W 关闭的是图片查看器，不是浏览器标签页；传 `closeOnModW={false}` 可以把这个快捷键留给浏览器。
- 图片查看器里打开着弹出层或对话框时，Esc 只关闭它，下一次 Esc 才关闭图片查看器。Cmd+W 关闭整个图片查看器，不管里面打开着什么。
- 关闭按钮和各条栏都避开手机的安全区域。`LightboxBody` 里的内容也一样，在底部和两侧避开（`env(safe-area-inset-*)` 加在它的内容上，而不是正文上），而正文和它的滚动条延伸到窗口边缘：手机横过来拿时，宽的文件不会跑到刘海下面，文件的末尾也不会落在主屏幕指示条下面。
- 当前显示哪一项由调用方保存。上一个、下一个、缩略图和方向键都会改变这个索引。
- 在文档模式（`modal="trap-focus"`）下，焦点锁定在图片查看器里，但页面的滚动没有锁定：文档在自己的正文里滚动，而 Base UI 的锁定只会改写遮罩下面页面的 `<html>` 和 `<body>` 的样式，而且每次窗口大小变化都要再改写一次。遮罩仍然盖住页面，所以在文件旁边按下会落在遮罩上，关闭图片查看器，和默认模式一样。
- 在文档模式下，`LightboxBody` 里的滚动留在它里面，滚到两端时、文件短到不用滚时都一样：遮罩下面的页面从不移动。Mac 触控板或 iOS 仍会让正文在两端回弹；在它的 `className` 里加 `overscroll-none` 也能去掉回弹。
- 按键也留在里面。图片查看器打开时焦点落在 `LightboxBody` 上（[无障碍](#accessibility)），所以方向键、Page Up、Page Down、空格、Home 和 End 立即就能滚动文件。在图片查看器里别的地方按下时，比如在工具栏的按钮上，或者点按之后在图片查看器本身上，会滚动遮罩下面页面的按键改为滚动正文，按浏览器自己的步长；焦点留在原处。控件要用的按键归控件：文本框的方向键和空格、按钮的空格、菜单的方向键。用自己的正文代替 `LightboxBody` 时，这样的按键什么也不做，而不是滚动页面。
- 浏览器的页内查找在任何模式下都能找到图片查看器里的内容：它打开时，内容从不是 `inert` 或隐藏的。焦点落到首屏以下的东西上时，正文滚动到它那里，和在页面上一样。
- 图片查看器画在对话框和 Sheet 之上（[层叠顺序](../../../../../design/foundations/elevation.md#layer-order)）。在任何模式下，它都是[叠加的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)中的一个模态表面：从对话框里打开的图片查看器在对话框上面画较浅的 `layer-backdrop-nested`，是允许的两个模态表面中的第二个；在图片查看器里打开的 Dialog、AlertDialog 或 Drawer 在图片查看器上面画嵌套遮罩。对话框打开图片查看器、图片查看器再打开对话框，就是三个，层级不允许这样：替换最上面的那个，或者把这个流程移到一个页面上。
- 轻提示画在图片查看器上面，所以从它里面触发的轻提示（Link copied、下载失败）能被看到。图片查看器打开时，只显示它引起的轻提示，不带操作，和对话框一样（[Toast](../toast/toast.md#where-it-appears)）。

### 里面的弹出层 {#popups-inside}

在 `LightboxContent` 里打开的 Tooltip、Popover、菜单及其子菜单、Select、Combobox、PreviewCard、Dialog、AlertDialog 或 Drawer 画在图片查看器上面，用起来和在别处一样：在它里面按下算作在图片查看器里面按下，Esc 先关闭它，焦点仍然锁定，它既不是 `inert`，也不对辅助技术隐藏。Base UI 本来就把在图片查看器里打开的弹出层放进图片查看器的 portal，而不是放到 body 上；图片查看器的 portal 自成一个层叠上下文，处在图片查看器在[层叠顺序](../../../../../design/foundations/elevation.md#layer-order)里的位置，所以弹出层自己的顺序在它里面起作用，画在内容上面。没有这个上下文，已经在图片查看器 portal 里的弹出层，会按它自己较低的顺序和图片查看器的遮罩比较层叠：画在遮罩下面，在它上面按下会落到遮罩上，关闭图片查看器。

你自己的一层（不是 raft-ui 的弹出层，或者你自己渲染的 portal），只有作为在 `LightboxContent` 里渲染的 Base UI 弹出层，才能得到同样的效果。用 `createPortal` 或某个库自己的 portal 挂到 body 上的一层，会画在图片查看器下面。改为在 `LightboxContent` 里就地渲染它，加上 `pointer-events-auto`（内容让指针穿过它落到遮罩上）：它按文档顺序画在图片查看器里，在它前面的部件之上，不需要 z-index。

## 内容 {#content}

- 图片查看器的标题用文件名。名字太长时在末尾截断。
- 在工具栏的标签里写出预览类型，用 sentence case：HTML preview。

## 无障碍 {#accessibility}

- Lightbox 封装了 Base UI 的 Dialog。它提供 `dialog` 角色、焦点锁定和 Esc；raft-ui 加上了 Cmd+W 快捷键。
- `LightboxTitle` 只是普通文字，不是对话框的名称。对话框的名称要自己提供：在 `LightboxContent` 上加 `aria-label`，或者用一个带名称的 `render` 元素。
- 在文档模式下，图片查看器打开时焦点移进去，关闭时回到 `LightboxTrigger`。焦点落在 `LightboxBody` 上，这样键盘用户可以立即阅读和滚动文件，Tab 从那里往后走；没有正文时，落在第一个控件上；用点按打开时，落在图片查看器本身上，和 Base UI 的做法一样，这样手机上不显示焦点环，也不弹出键盘。你自己传的 `initialFocus` 优先于这三种。即使文件短到不用滚，正文也是一个 Tab 停靠点，它在自己的边缘内侧画内嵌的焦点环，因为它的边缘就是窗口的边缘，画在外侧的焦点环看不到（[焦点环](../../../../../design/foundations/elevation.md#focus-ring)）。在默认模式下，`LightboxContent` 打开时不移动焦点，关闭时也不归还焦点（`initialFocus` 和 `finalFocus` 为 `false`）；键盘用户会打开图片查看器时，传入这两项，让焦点进入图片查看器，关闭后回到触发元素。在两种模式下，从状态打开、没有 `LightboxTrigger` 的图片查看器（点击消息里的图片、一个键盘快捷键）都没有可以回去的触发元素：传 `finalFocus={openerRef}`，即指向打开它的东西的 ref，让它关闭时焦点回到那里。
- 在 `modal` 和文档模式下，焦点都锁定在图片查看器里；它下面的页面对辅助技术隐藏（`aria-hidden`），而不是设成 `inert`。
- 给 `LightboxClose`、每个 `LightboxNavigationButton` 和每个只有图标的操作加 `aria-label`："Close"、"Previous image"、"Next image"、"Download"。
- 图片查看器打开时，把左、右方向键绑定到上一个和下一个。
- 给每个 `LightboxThumbnail` 加 `aria-label`（"Show product-shot.png"）。`active` 只改变外观：用 `aria-current="true"` 标出当前显示的那一项。
- 给图片一个描述它的 `alt`，给 `iframe` 一个 `title`。

## 规则 {#rules}

- 不要用 Dialog 搭建媒体查看器，也不要在 Lightbox 里放媒体或文件预览以外的东西。
- 图片查看器只有一个关闭按钮，放在右上角（[导航](../../../../../design/patterns/navigation.md#closing)）。
- 在工具栏里，有框的按钮让形状止于 16px 边距线；无框的图标按钮（作为最后一个操作或关闭按钮）让图标框止于边距线，点击区域伸出边距线之外（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- 在 Raft Chat 里，每个文件都在附件外壳里打开，图片也一样，这样每种文件类型都有同样的工具栏（[文件查看器](../../../../../design/components/overview.md#file-viewer)）。
- 不要给图片查看器或它的部件设你自己的 z-index：图片查看器、对话框、轻提示和图片查看器里的弹出层的顺序由 raft-ui 决定（[层叠顺序](../../../../../design/foundations/elevation.md#layer-order)），App 自己的数字会把图片查看器放到它不知道的弹出层上面或下面。
- 除了遮罩、信息栏和工具栏，不要再加颜色或线条（[用现有部件搭建](../../../../../design/components/overview.md#built-from-existing-parts)）。
