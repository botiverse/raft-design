---
title: Dialog
summary: 遮罩上居中的浮层，用于人们必须先完成才能继续的一个决定或几个输入框；宽尺寸用于一次填完的大表单。
sourceHash: 7e7f4f61
---

# Dialog

对话框（Dialog）是遮罩上居中的浮层，用于人们必须先完成才能继续的事：一个决定，或者只有几个输入框的小任务，比如创建频道。它有标题、正文和最多两个按钮。它的宽尺寸用来放一次填完的大表单。确认也是 Dialog，用 `size="sm"`，不管操作能不能撤销；[AlertDialog](../alert-dialog/alert-dialog.md) 只用于产品列出的少数几种确认（[选择组件](../../../../../design/components/overview.md#overlays)，2026-11-03）。

```example
dialog/compositions/create-channel
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 1 到 5 个输入框的小任务（Create channel） | Dialog |
| 一次填完的大表单：注册或编辑应用、配置 Agent | `size="wide"` 的 Dialog |
| 任务详情 | 基于 Dialog 的工作空间浮层，宽 960px，手机上全屏，不属于四种尺寸（[任务](../../../../../design/patterns/tasks.md)） |
| 确认一个不可撤销或会打断的操作 | `size="sm"` 的 Dialog，确认按钮按后果上色（[规则](#rules)）。只在产品列出的地方用 [AlertDialog](../alert-dialog/alert-dialog.md)：在 Raft Chat 里，是放弃对 Agent 资料未保存的修改，和打开一个会转到另一个应用的链接（[Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)） |
| 能在原处撤回的操作 | 不用对话框：直接执行；什么时候用带 Undo 的 [Toast](../toast/toast.md)，见[反馈](../../../../../design/patterns/feedback.md#confirming) |
| 人们要看一阵、改一阵的详情或设置 | [Drawer](../drawer/drawer.md) |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `Dialog`：根部件。管理打开状态。必需。
- `DialogTrigger`：打开它的按钮。
- `DialogContent`：居中的表面，通过 portal 渲染，背后是遮罩（`DialogOverlay`）。必需。在桌面端和平板上，`placement="top"` 让它的上边缘靠近窗口顶部，而不是在正中（[靠顶部](#at-the-top)）。
- `DialogHeader`：标题行，末尾可选一个 `DialogClose`。× 往外挪，让它的图标框（而不是按钮）落在对话框的边距上（`--surface-inset`：20px，用鼠标时 16px）（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- `DialogTitle`：标题。必需。
- `DialogDescription`：标题下面或正文里的一句话。
- `DialogBody`：内容。对话框达到窗口高度时它会滚动，用原生滚动，或者加上 `unstable_scrollArea` 后用 raft-ui 的滚动条（[在 ScrollArea 里滚动](#scrolling-in-a-scrollarea)）。
- `DialogFooter`：靠末端排成一行的按钮，开头可以有一条说明或一个 `TextLink`。只有一行放不下时，它才把按钮叠起来（[底部](#the-footer)）。
- `DialogFooterNote`（`@botiverse/raft-ui/wip`）：底部开头的一行短说明，用弱化的脚注文字说明提交按钮会做什么。只用于 `size="lg"` 或 `size="wide"` 的对话框。空的说明什么也不画。
- `DialogClose`：关闭对话框。没有子元素时它是 × 图标按钮；用 `render` 时它把 Cancel 按钮变成关闭按钮。
- `DialogNav`：宽对话框的分区列表。
- `DialogSurface`：不带 Base UI 行为的对话框外框，用于由应用自己管理遮罩、Esc 和焦点的居中模态框，比如服务器设置中的一步。优先用 `DialogContent`：搜索已经从 `DialogSurface` 改到了它上面（slock #14142）。
- `DialogPortal` 和 `DialogOverlay`：更底层的部件。
- `DialogSheetContent`：在手机上会变成底部面板的对话框所用的 `DialogContent`（[手机上](#on-a-phone)）。在桌面端和平板上它就是 `DialogContent`，标记完全相同。
- `DialogCommit`：对话框唯一的提交按钮，是写在 `DialogFooter` 末尾的 `Button`。在手机上的底部面板里，它改为画在头部末尾。
- `DialogSheetBack`：分步流程后面几步里，底部面板头部开头的返回（Back）。在底部面板之外它什么也不画。在触屏上，它在手指抬起时返回（[手指抬起时切换](../../../../../design/patterns/navigation.md#switching-on-finger-lift)）。

## 变体 {#variants}

按对话框装的内容选尺寸，不要按看起来合不合适来选。四种尺寸相差足够大，每种只装一类内容（cindyz, 2026-10-21）：

| 变体 | 宽度 | 用于 |
| --- | --- | --- |
| `size="sm"` | 400px | 决定：所有确认和告知，包括有几个选项可选、或者有一小段受影响内容列表的确认（Reset agent、Change visibility、重启选项）。它和 [AlertDialog](../alert-dialog/alert-dialog.md) 一样宽 |
| `size="md"`（默认） | 448px | 小任务：1 到 5 个输入框、一个用来选的列表、一段只读的简短帮助文字（Create channel、Add members、角色说明） |
| `size="lg"` | 640px | 需要宽度的内容：多列的列表、命令或代码、键值行、要读的长文字、分步流程（Connect computer、计算机的版本说明） |
| `size="wide"` | 896px | 大表单对话框，分成几个分区，固定高度为 760px 或窗口高度减 32px，取较小值 |

- 所有确认都是同一个宽度 400px，不管它基于 Dialog 还是 AlertDialog。内容放不进 400px 的确认就不再是确认了：它是小任务，用 `md`。
- `sm`、`md` 和 `lg` 是小对话框：高度随内容，最高为窗口高度减 32px，点击遮罩会关闭它。`wide` 是大表单对话框。
- 只用 `size` 设置宽度。产品代码从不给 `DialogContent` 传自己的 `max-w-*`。四种尺寸都放不下的内容不是对话框：做成页面或 [Drawer](../drawer/drawer.md)。
- 只有下面这些浮层的宽度不属于四种尺寸，每种都由自己的规则决定。其他任何东西都不能再加：
  - 任务详情，960px：工作空间浮层（[任务](../../../../../design/patterns/tasks.md)）。
  - 搜索，720px，是 `placement="top"` 的 `DialogContent`，通过 `--dialog-top` 让上边缘盖在顶栏的输入框上（[靠顶部](#at-the-top)、[Search](../search/search.md)）。
  - 展示框，宽 720px、高约 520px，由引导流程的第 3 到 5 步、Upgrade to Pro 对话框和 Pro 的 Add seats 对话框共用（cindyz，2026-10-26：增加席位是付费墙，和升级一样），不用于其他地方（[引导](../../../../../design/products/raft-chat/onboarding.md)）。
  - [AnnouncementDialog](../announcement-dialog/announcement-dialog.md)，576px：它的图片和一段文字在这个宽度下最好读；到 640px 时，每行文字会超过 80 个字符。
  - 附件预览，按文件需要的宽度，最宽 768px。
- 在窄屏上，每种尺寸取自身宽度或窗口宽度减 32px 中的较小值，所以在 390px 的屏幕上每种都是 358px 宽。它的高度和宽对话框的分区见[行为](#behavior)。

删除大的东西，比如一个 Agent 或一个服务器，还要求输入它的名称（[表单](../../../../../design/patterns/forms.md#danger-zone)）。它仍然是确认，用 `sm`，确认按钮是红色（[AlertDialog](../alert-dialog/alert-dialog.md#variants)）：

```example
dialog/compositions/typed-delete
```

大表单对话框在 `DialogHeader`、`DialogBody` 和 `DialogFooter` 上用 `bar`：头部和底部固定，正文在两者之间滚动。正文左边是 `DialogNav`，后面一条 `line-seam`，右边每个分区一个 [FormSection](../form-section/form-section.md)。它的结构和规则见[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)。

## 底部 {#the-footer}

Cancel 在前，提交按钮在后，两个都在底部的末端，这样提交按钮就在视线停下的地方：右下角。底部开头最多放一个不显眼的东西，不能两个都放：一个通往别处的弱化 [TextLink](../text-link/text-link.md)，或者一个说明提交会做什么的 `DialogFooterNote`。错过它们也没关系，因为人们不会先看那里。

```example
dialog/compositions/footer-note
```

```example
dialog/compositions/footer-link
```

只用来读的对话框只有一个按钮，用来关闭它。它仍然是粉色的，这样对话框始终有一条明显的前进路径。

```example
dialog/compositions/footer-close-only
```

底部在手机上也保持一行，和桌面端一样（stdrc, 2026-10-22）。所有地方用同一种布局，Cancel 和提交按钮在每个屏幕上都在同一个位置；叠放只是标签太长、一行放不下时的退路。所以底部只在按钮一行放不下时叠放，不论宽度多少，从不因为窗口窄而叠放：

- 按钮叠成通栏，提交按钮在上，Cancel 在下。这时 Cancel 用 `default` 的墨色边框，悬停和按下也跟 `default` 一样：拉到通栏宽度的无框按钮读起来像一行文字，而不是按钮，所以按钮一旦叠放，每个都需要自己的框（stdrc, 2026-10-22）。Cancel 仍然写成 `ghost`；叠放会给它加上边框，这一行重新放得下时，它又变回无框。
- 说明或链接仍然在最前，靠左放在按钮上方。
- 按一行时的顺序写这些部件：先写说明或链接，再写 Cancel，最后写提交按钮。底部只在屏幕上调换叠放的顺序：Tab 仍然是先 Cancel 后提交按钮，所以叠放时焦点从 Cancel 向上移到提交按钮（[无障碍](#accessibility)）。

说明只用于 `size="lg"` 或 `size="wide"` 的对话框，并且不超过 40 个字符。把 `DialogFooterNote` 直接放在 `DialogFooter` 里、按钮前面：这样底部会把按钮放进一个组。在桌面端，说明只占一行，从不换行，也从不被截断。两者在一行放得下时，它在按钮旁边；放不下时，它移到按钮上方，按钮仍在末端排成一行，所以按钮从不超出底部的内边距。开头的链接也一样。更小的对话框没有地方在按钮旁边放说明：说明出现在 `sm` 或 `md`（包括默认尺寸）的对话框里时，开发构建会发出警告，除非是用 `className` 设置对话框宽度的情况（[变体](#variants)里列出的例外之一）。在手机上，说明在按钮上方占满底部的宽度，可以换成 2 行。更长的内容属于正文。

对话框在手机上是底部面板时（[手机上](#on-a-phone)），它没有底部，所以说明（或写在最前面的链接）移到正文末尾，用同样的弱化脚注文字，靠左对齐，最多 2 行。面板头部的提交按钮做的就是说明里写的事。

## 行为 {#behavior}

- 居中对话框出现和消失都没有动画，始终在遮罩上方（[动效](../../../../../design/foundations/motion.md#usage)）。在手机上，带输入框的对话框改为从底部滑上来的面板（[手机上](#on-a-phone)）。
- Esc、× 和 Cancel 会关闭对话框。点击遮罩会关闭小对话框，但在手机上画成底部面板的除外（[手机上](#on-a-phone)）。
- Esc 只关闭最上层打开的东西。从对话框里打开的 Menu 或 Select 按 Esc 会关闭，对话框保持打开；再按一次 Esc 才关闭对话框。在你自己写的、按 Esc 会关闭的部件里（比如文本框里的建议列表），在它的 `onKeyDown` 里调用 `event.stopPropagation()`，不要只调用 `preventDefault()`：传到对话框的每一次 Esc，不管有没有被 prevent，Base UI 都会关闭对话框。改不了这个部件时，在 `Dialog` 的 `onOpenChange` 里，当 `details.reason` 为 `"escape-key"` 且 `details.event.defaultPrevented` 为 true 时取消这次关闭。
- 点击大表单对话框外面时不要关闭它：在 `Dialog` 上传 `disablePointerDismissal`，这样填了一半的表单不会因为一次误点而丢失。
- 窄屏上的居中对话框两边各保留 16px 边距，高度永远不超过窗口高度减 32px。
- 在桌面端和平板上，`placement="top"` 的对话框靠近窗口顶部，而不是在正中（[靠顶部](#at-the-top)）。
- 在手机上，屏幕键盘打开时居中对话框会上移，键盘收起后回到正中（[手机上](#on-a-phone)）。
- 768px 以下，宽对话框隐藏 `DialogNav`，各分区依次排列。
- `DialogFooter` 在任何宽度下都把按钮排成一行。它按一行的排法测量，只有子元素超出底部时，才设置 `data-stacked`，把按钮叠成通栏，提交按钮在上（[底部](#the-footer)）。可以收缩的内容（比如会截断或换行的标签）先收缩，所以只有不能收缩的按钮才会让底部叠放。对话框尺寸变化、标签改变或字体加载完成时，它会重新测量；底部在底部面板里被隐藏时，它完全不测量。包在其他元素里的按钮（比如 tooltip 的触发元素）也会占满宽度。`AlertDialogFooter` 也一样。
- 用 `className` 自己排版的底部（比如按钮旁边有复选框，或者一对链接）也按同样的方式测量，不需要额外设置：内容在一行里放得下时保持自己的排版，放不下时才叠放。可以让位的文字加上 `min-w-0`（要截断的再加 `truncate`），它会先收缩，底部才叠放。
- 从对话框或面板里打开的对话框，会在下面那层遮罩上再画一层更浅的遮罩（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。把它渲染在第一个对话框里面，这就会自动发生。`layer={1}` 只用于渲染在第一个对话框的树之外的对话框：它把这个对话框和它的遮罩抬到第一个之上。被抬起的是对话框的 portal，抬到 `z-dialog-layer`，自成一个层叠上下文，所以从卡片里打开的 Select 列表或菜单（Base UI 把它们 portal 到同一个元素里）画在卡片上面；遮罩跟着卡片走，所以写在 `overlay` 里的 `layer` 在那里会被忽略。以前被抬起的是卡片和遮罩，列表留在 `z-popup`，在两者下面，应用只好把每个列表都 portal 到对话框的正文里。
- 从对话框里打开的 Select 列表、菜单或弹出层，会被 portal 到卡片旁边、对话框里面，所以画在卡片和它的头部上面，焦点和在它上面的按下都留在对话框里。不要为此给它传一个对话框滚动正文里的 `container`：ScrollArea 自成一个层叠上下文，portal 进去的列表一碰到头部就会画在头部下面（[ScrollArea](../scroll-area/scroll-area.md#rules)）。在手机的底部面板里，列表也留在头部下面（[底部面板里的弹出层](#popups-in-a-sheet)）。
- 应用自己的模态框（自己的遮罩、Esc 和焦点，基于 `DialogSurface`）用 `@botiverse/raft-ui/wip` 里的 `OverlayLayerProvider` 和 `useParentOverlayKind` 加入同一个叠放顺序（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。

### 靠顶部 {#at-the-top}

在桌面端和平板上，从窗口顶部附近某个东西展开的对话框用 `placement="top"`，这样它在人们正看着的地方打开。目前的用例是搜索：面板的上边缘盖住顶栏的输入框，看起来就像输入框展开成了面板（[Search](../search/search.md)）。如果居中，它会在别处打开，在很高的窗口里离输入框很远。

- 对话框在水平方向仍然居中。它的上边缘位于 `--dialog-top`，没有设置时是窗口高度往下 8% 处。
- 它永远不超过窗口底部减 16px，所以不管上边缘多低，它都在屏幕内结束；超出的部分由正文滚动。它的宽度仍然来自 `size`。
- 要让上边缘对齐某个东西，由应用在对话框打开时测量那个东西，并在 `DialogContent` 的 `style` 里设置 `--dialog-top`。raft-ui 不做任何测量，也不知道对话框对齐的是什么。
- 768px 以下它不起作用：对话框和其他对话框一样在正中，`--dialog-top` 被忽略。和那里的所有居中对话框一样，它只在屏幕键盘打开时上移（[手机上](#on-a-phone)）。
- `DialogSheetContent` 在桌面端和平板上也接受它。在手机上底部面板停靠在底部，会忽略它。

```example
dialog/compositions/top-placement
```

### 在 ScrollArea 里滚动 {#scrolling-in-a-scrollarea}

`DialogBody` 用原生方式滚动，所以在 Windows 上，以及设为始终显示滚动条的 Mac 上，长正文会画出平台自己的滚动条，它出现时会占掉正文的一部分宽度。加上 `unstable_scrollArea` 后，正文改为一个 [ScrollArea](../scroll-area/scroll-area.md)：滚动方式不变，画的是 raft-ui 的滚动条，它不占空间，在每个平台、两种主题下看起来都一样。

```example
dialog/compositions/create-agent
```

- 目前需要主动开启，会在之后的某个 minor 版本里成为默认。正文的其他方面都不变，所以等它成为默认时，删掉这个属性即可。
- 用于可能长过窗口的正文：有很多输入框的表单、长列表、长文本。从不滚动的正文，加不加都不会画滚动条。
- 正文里有比它宽的东西（宽表格、不换行的一行、`<pre>`、图片）时，正文也会横向滚动，和原生正文一样：对话框保持宽度，横向滚动条显示在正文底边，盖在底部上。正文里没有比它宽的东西时，只纵向滚动，不画横向滚动条。横向滚动时整个正文一起移动，输入框和宽的部分一起动，所以宽表格最好在外面包一个 `TableScroll`（[Table](../table/table.md#wide-tables)）：这样只有表格滚动。正文排成 grid 时（`className="grid gap-4"`），不管加不加这个属性，一个宽的子元素都会让每一行和它一样宽，因为 grid 唯一的一列取最宽一项的宽度；在宽的子元素外面包 `TableScroll`，或者在正文上加 `grid-cols-[minmax(0,1fr)]`，能让各行保持正文的宽度。
- 正文仍然是带 `data-slot="dialog-body"` 的那个元素。它和以前一样接受 `className`、`ref`、原生属性和子元素，所以写在它上面的布局（`className="grid gap-4"`）不变，它里面除了子元素也不会多出任何东西。它用 ScrollArea 的 [absolute 滚动条槽](../scroll-area/scroll-area.md#gutters-position)：正文外面会渲染一个外框 `data-slot="dialog-body-frame"`，滚动条在这个外框里。
- `DialogContent` 的子元素是外框，不是正文。在对话框里设定正文尺寸的 class（`max-h-*`、`h-*`、`flex-*`）写在 `wrapperClassName` 里，它属于外框；内边距和布局仍然写在 `className` 里。你自己写的、把正文当作内容的子元素去选的选择器（`[data-slot=dialog-content] > [data-slot=dialog-body]`）不再匹配：改为选外框，或者把正文当作后代去选。
- 只有在正文溢出、且里面没有能获得焦点的东西时，正文才是一个 Tab 停靠点，和原生的滚动容器一样。表单不会多出停靠点：Tab 从头部直接到第一个输入框，键盘从正文里有焦点的任何东西滚动正文。只供阅读的长文本可以用 Tab 到达，用方向键滚动。你自己设的 `tabIndex` 优先。
- 滚动到正文尽头就停在那里，Mac 触控板或 iOS 上正文仍会回弹（`overscroll="contain"`，和 [Panel](../panel/panel.md#anatomy) 一样）。
- 正文里粘住的头部或底栏（`position: sticky`），从外框上让滚动条避开它：`wrapperClassName="[--r-scroll-area-rail-inset-bottom:56px]"`（[边缘状态](../scroll-area/scroll-area.md#edge-state)）。
- 外框和所有 ScrollArea 一样，自成一个层叠上下文：给了正文里的 `container` 的弹出层会画在对话框的头部下面。弹出层就留在 raft-ui portal 它们的地方，也就是卡片旁边。
- 在手机的底部面板里（[手机上](#on-a-phone)），它是同一个正文：在头部下方滚动，保持 16px 边距，留出主屏幕指示条的内边距，末尾放底部的说明。
- `bar` 正文会忽略它。在桌面端，`bar` 正文本身不滚动：滚动的是它里面的各分区，它的 `DialogNav` 已经是一个 ScrollArea。在手机的底部面板里，`bar` 正文仍然用原生滚动。

## 手机上 {#on-a-phone}

768px 以下，对话框保持居中，除非它有多个输入框、长列表或分步，这时它变成底部面板（stdrc and Artea, 2026-10-21）。在桌面端和平板上，所有对话框都保持居中。

保持居中的对话框，底部和桌面端一样排成一行。只有按钮放不下时它才叠放，提交按钮在上（[底部](#the-footer)）。

| 对话框装的内容 | 手机上 |
| --- | --- |
| 一个决定：一句说明和按钮，最多几个固定选项，不需要输入（所有确认；归档、停止、重置） | 居中对话框，和桌面端一样 |
| 一个输入框或一个文本框及其按钮：要求输入名称的确认、给分区命名、编辑显示名称或描述、填写拒绝理由 | 居中对话框，和桌面端一样。键盘打开时它会上移，这样键盘不会挡住输入框或按钮（[键盘](#the-keyboard)） |
| 多个输入框、可供选择的长列表或可搜索列表，或者分步：表单、选择器、向导 | 占屏幕 90% 高度的底部面板 |
| 只读的内容：角色说明、版本说明、应用详情。这些是简短的信息，所以保持为对话框 | 居中对话框，和桌面端一样 |

底部面板：

- 从底部升起，盖在遮罩上，顶部两角用 `radius-dialog`。它上方留出的一条页面说明它是页面上的一层，而不是新页面。
- 它的头部就是推入页面的头部（[导航](../../../../../design/patterns/navigation.md)）：开头是 ×，然后是标题，末尾是对话框唯一的提交按钮，尺寸为 `md`，颜色和文字与桌面端相同。它没有底部：× 就是 Cancel。在分步流程里，末尾的按钮属于当前这一步（Next，最后一步是那一步的操作）。
- 从分步流程的第二步起，头部开头的 × 换成返回（Back），旁边不再有 ×（stdrc, 2026-10-22）：底部面板是一叠步骤，返回撤回一步，和推入页面一样。在任何一步按 Esc 都能关闭底部面板；在触屏上，人们先返回到第一步，再用 × 关闭。
- 底部的说明，或写在底部最前面的链接，移到正文末尾，用弱化的脚注文字，靠左对齐（[底部](#the-footer)）。
- 正文在头部下方滚动，保持手机的 16px 边距，底部留出主屏幕指示条的内边距。
- × 和 Esc 会关闭它。轻点遮罩不会，这样填了一半的表单不会因为一次误触而丢失，和桌面端的大表单对话框一样。已经输入了内容时，关闭前先询问（[关闭前先询问](#asking-before-closing)）。
- 计划支持向下拖动面板来关闭它，等面板改为基于 Drawer 的拖动时实现。
- 它打开时向上滑入，和所有底部面板一样，遮罩随之淡入（[动效](../../../../../design/foundations/motion.md#usage)）。减弱动态效果时它直接出现。
- 屏幕键盘弹起时，底部面板缩到键盘上方的空间里，所以头部和它的提交按钮始终可见。
- 打开后正文里新出现的提醒（alert），或者 warning、destructive 的 Banner，比如提交失败后加上的错误，会被滚动到可见位置：引起它的按钮在顶部。

### 键盘 {#the-keyboard}

手机上的每个居中对话框在屏幕键盘打开时都会上移，不管它的 `placement` 是什么，也不需要应用选择开启。被键盘挡住的居中对话框总是不对的：人们正在输入的输入框，或者它下面的按钮，都看不见了。所以这是平台的行为，而不是每个对话框各自的选择（stdrc，2026-10-21：居中，除非键盘打开）。

- 它的上边缘移到手机顶栏结束的地方：可见区域顶部往下 `--header-height`，在状态栏下方。
- 它的底部至少在键盘上方 16px。比这更高时，它的正文滚动。
- 键盘收起时，它回到正中。
- 只有在文本输入框有焦点、且可见区域比窗口矮 100px 以上时，才算键盘打开，所以一个没有可输入内容的矮窗口不会让它移动。
- 底部面板不移动：它改为缩到键盘上方的空间里。

### 底部面板里的弹出层 {#popups-in-a-sheet}

从底部面板里的输入框打开的 Select 或 Combobox 列表、菜单或弹出层，留在底部面板里、头部下面：它翻到输入框的另一侧，缩到头部和底部面板可见部分的底边之间的空间里，各行滚动。这不需要传任何东西：每个没有自己的 `collisionBoundary` 的 raft-ui 弹出层都取底部面板的边界，每次摆放这个弹出层时都单独判断。

- 原因：否则弹出层以窗口为界。键盘弹起时，屏幕上只剩下底部面板，向上翻的列表会盖住头部、标题和提交按钮，还会超出底部面板的上边缘。
- 空间的下端是底部面板的底边，如果屏幕键盘的顶部更高，就是键盘顶部（可视视口的底边）：算的是能看到的部分。
- 锚定在头部的弹出层不受影响：头部按钮上的工具提示、菜单或弹出层在它要求的位置打开，工具提示在按钮上方、盖在遮罩上，和在底部面板外一样。如果把它限制在头部下面，它会被推到底部面板的内容上。
- 锚定在底部面板正文里的弹出层总是受限，不管它的输入框旁边空间多小：列表取输入框上方或下方较大的一侧，高度是那一侧减 12px（离输入框 4px，离区域边缘 8px），各行滚动。原因：在小手机上键盘弹起时，底部面板中间的输入框每侧大约只有 130px，这是最常见的情况，不是少见的情况。在那里让列表盖过头部，会挡住标题和提交按钮；或者 portal 进底部面板的滚动正文，就会画在头部下面，前几行既看不见也按不到。一个能滚动的短列表还能用；藏在头部下面的不能。没有弹出层设最小高度，所以较大一侧只有 60px 时，列表高 48px，大约一行。
- 它画在底部面板的内容上面，和从任何对话框打开时一样（[行为](#behavior)）。
- 从底部面板里打开的对话框、警示对话框、抽屉或图片查看器重新开始：它们的弹出层以窗口为界，或者以它们自己的底部面板为界。`OverlayLayerProvider` 里应用自己的表面也是这样。
- 居中对话框不限制任何东西：从小卡片里打开的列表可以超出卡片边缘，盖在遮罩上，一直都是这样。
- 要让某个弹出层不受限，给它传 `collisionBoundary="clipping-ancestors"`（Base UI 的默认值），它就以窗口为界。你传的任何 `collisionBoundary` 都优先；不传，或者传 `undefined`，就取底部面板的边界。
- 你自己画的底部面板（有自己的表面、固定的头部和滚动的正文）用 `SheetPopupBoundary`（`@botiverse/raft-ui/wip`）得到同样的效果：用它包住正文，或者包住头部和正文，把头部的 ref 作为 `head` 传给它。底部面板的底边取头部父元素的底边；头部嵌套得更深时，取 `surface` 的底边。它不渲染任何元素。底部面板同时也是 `OverlayLayerProvider` 时，把 `SheetPopupBoundary` 放在它里面。
- 弹出层锚定在哪个元素上，是从页面上读出来的：打开着的、`aria-controls` 指向弹出层的列表或面板的那个触发按钮；工具提示和预览卡片没有东西指向它们，就取同类里唯一打开着的那个触发按钮。分辨不出锚点的弹出层，比如在鼠标指针处打开的右键菜单，保持受限。
- 在你自己画的底部面板里，同时打开的两个工具提示或两张预览卡片分辨不出来；`SheetPopupBoundary` 包住头部时，头部按钮的工具提示也在它下面：没有东西指向它们，所以两个都保持受限，锚定在头部的那个可能向下翻，盖到底部面板的内容上。在 `DialogSheetContent` 和 `Drawer` 里，头部从底部面板外开始，所以它的工具提示从不受限。只包住正文，或者把 `anchor` 传给工具提示。
- 传了 `anchor` 的弹出层由 `anchor` 决定，不在页面上查找：元素、ref 或返回元素的函数，和触发按钮一样，要么在头部里，要么不在。虚拟元素（带 `getBoundingClientRect` 的对象，比如一段选中的文字）在头部里找不到对应的元素，所以它的矩形中点在头部里时，就算在头部里。摆放弹出层时为空的 `anchor`（还没设置的 ref）退回到触发按钮。
- iOS 的 Safari 里，页面会在键盘下面平移，边界按可视视口的偏移移动，所以它保持在头部上：固定在窗口上的弹出层移动两次，`positionMethod="absolute"` 的弹出层或 portal 进有 transform 的元素（比如抽屉）的弹出层移动一次（`@floating-ui/dom` 1.8 从边界矩形取这个偏移，只对固定在窗口上的弹出层把它加到输入框上）。你自己作为 `collisionBoundary` 传入的矩形不会被修正。

### 把对话框做成底部面板 {#making-a-dialog-a-sheet}

按桌面端的样子写对话框，把 `DialogContent` 换成 `DialogSheetContent`，把提交用的 `Button` 换成 `DialogCommit`。别的都不用改，在桌面端也完全没有变化。768px 以下：

- `DialogHeader` 变成推入页面的头部：它的 `DialogClose` 排在最前，作为头部的 ×，后面是 `DialogTitle`。给头部放一个作为直接子元素的 `DialogClose`：它是离开底部面板的唯一出口。包在 Tooltip、Fragment 或你自己的组件里的 × 找不到，会留在标题后面；开发环境下头部会在控制台里给出警告。
- 头部只放得下一行，就是标题。底部面板对话框的 `DialogDescription` 放在 `DialogBody` 顶部，不放在 `DialogHeader` 里。
- `DialogCommit` 移到头部末尾，尺寸为 `size="md"`，变体、文字、禁用和加载状态都不变。`type="submit"` 的按钮仍是它所在表单的默认按钮：它通过表单的 `id` 和写它的那个表单关联，所以点击它、在输入框里按 Enter 都会提交，禁用时两者都不会。给那个 `form` 一个 `id`（或者给 `DialogCommit` 传 `form`）；没有 `id` 时点击仍会提交，但在输入框里按 Enter 不会，而且只在手机上才这样，所以开发环境下 `DialogCommit` 会在控制台里给出警告；提交类型的 `DialogCommit` 没有可提交的表单时也一样。
- `DialogFooter` 被隐藏，里面的 Cancel 和其他按钮（比如某一步的 Back）也一起隐藏。`DialogFooterNote`，或写在底部最前面的 `TextLink`，改为移到 `DialogBody` 末尾，靠左，用弱化的脚注文字；说明不超过 40 个字符，所以在那里最多 2 行。
- `DialogBody` 在头部下方滚动，保持手机的 16px 边距，底部留出主屏幕指示条的内边距。宽对话框的 `bar` 正文也一样：隐藏 `DialogNav`，各分区依次排列。

```example
dialog/compositions/sheet-form
```

在分步流程里，每一步的按钮都写成 `DialogCommit`：先是 Next，最后一步是那一步的操作。从第二步起，在 `DialogHeader` 里放一个 `DialogSheetBack`：在手机上头部把它放在开头，并去掉 `DialogClose`，所以后面几步有返回、没有 ×；在桌面端它什么也不画，Back 留在底部。

```example
dialog/compositions/sheet-steps
```

从底部面板里打开的对话框或警示对话框居中显示在它上面，带着自己更浅的遮罩（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。它保留自己的头部、底部和提交按钮：只有底部面板自己的部件会变。

#### 关闭前先询问 {#asking-before-closing}

已经输入了内容时，× 和 Esc 先询问。在 `Dialog` 的 `onOpenChange` 里取消这次关闭，再从底部面板里面打开确认框：

```tsx
<Dialog
  open={open}
  onOpenChange={(next, details) => {
    if (!next && dirty) {
      details.cancel();
      setConfirmOpen(true);
      return;
    }
    setOpen(next);
  }}
>
```

下面的示例就是这样接的；它的画布显示有修改时按 × 之后的确认框。

```example
dialog/compositions/sheet-stacked
```

在手机上保持居中的对话框继续用 `DialogContent` 和 `Button`。

## 内容 {#content}

- 对话框的标题用打开它的那个按钮的文字，或者用 Edit 加上项目名称。只问要不要继续、没有要填写或选择的内容的确认框，加上问号（Delete box?）；有要填写或选择的内容的对话框不加（Delete server）（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。主按钮的标签写它执行的操作，不带对象：通常是标题里的动词（Create channel → Create）；Edit 标题的按钮是 Save，另一个是 Cancel（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 正文文字用 `foreground-muted`，放在 `foreground` 的标题下面。它们的文字样式见[字体排印](../../../../../design/foundations/typography.md)。

## 无障碍 {#accessibility}

- Dialog 封装了 Base UI Dialog。它提供 `dialog` 角色、焦点陷阱、Esc，以及关闭后焦点回到触发按钮。
- 给每个对话框一个 `DialogTitle`。它会成为对话框的无障碍名称，也是打开时读屏软件播报的内容。
- `DialogDescription` 会成为对话框的描述。
- 焦点顺序和阅读顺序就是标记的顺序：说明或链接、Cancel、提交按钮。排成一行时这就是看到的顺序。按钮叠放时，提交按钮画在上面，但在标记里仍在 Cancel 之后，所以焦点从 Cancel 向上移到它，在任何浏览器里都一样。底部不用 `reading-flow` 去跟随叠放的顺序：对话框的焦点陷阱按标记顺序循环，视觉顺序会和它冲突，让 Tab 卡在 Cancel 上，提交按钮无法到达（Jasper, 2026-10-22）。
- 要让说明和提交按钮一起被读出，给说明一个 `id`，给按钮加 `aria-describedby`。
- `DialogClose` 的 × 标签是「Close」。传 `aria-label` 可以修改。
- 在底部面板里，头部把 ×（或返回）放在 DOM 最前面，所以 Tab 和读屏软件遇到头部各部分的顺序和看到的一致：×、标题、提交按钮。标题仍然是对话框的无障碍名称。
- `DialogSurface` 本身没有任何行为。使用它的应用必须自己加上 `dialog` 角色、`aria-modal`、名称、焦点陷阱、Esc 和遮罩。

## 规则 {#rules}

- 底部最多放两个按钮：Cancel 在前（`variant="ghost"`），确认按钮在后。在手机上它们也排成一行；只有放不下时才叠放，确认按钮在上，Cancel 加上边框。
- 唯一的例外是关闭或离开时、有未保存的修改且能直接从提示里保存的那个提示。它可以有三个按钮：Keep editing（`variant="ghost"`，在最前）、Discard changes，然后是 Save（`variant="primary"`，在最后）。只有两个按钮时，想保存的人得先继续编辑，找到 Save，再关闭一次，而保存并离开正是大多数人在那里想做的；频道详情就是这样做的（Jasper, 2026-11-14）。不能直接保存的提示仍然是两个按钮。这不是通用规则：三个按钮在手机上会叠成三行，一个例外不应该让每个对话框都加一个次按钮。Discard changes 用什么颜色还没定（[待定问题](../../../../../design/decisions/open-questions.md)）。
- 底部开头最多放一个东西：一个弱化的 `TextLink` 或一个 `DialogFooterNote`，不能两个都放。不要在那里放会改变什么的操作，也不要放需要人们做决定的内容；那些属于正文。
- `DialogFooterNote` 只用于 `size="lg"` 或 `size="wide"` 的对话框，并且不超过 40 个字符：在桌面端它从不换行。
- 用 `DialogFooter` 搭底部，不要自己排一行：它负责间距、顺序，以及按钮放不下时的叠放。
- 确认按钮执行操作时用粉色（`variant="primary"`）。操作会打断或不可撤销时，按后果给它上色（[AlertDialog](../alert-dialog/alert-dialog.md#variants)）。
- 人们在操作前必须读到的内容，放在正文里的 [Banner](../banner/banner.md) 中（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。
- 每种尺寸的内边距都是 20px。宽度来自 `size`（[变体](#variants)），永远不要用自己的 class 设置，那里列出的例外除外。
- 产品代码里不要传 `overlay={false}`：每个居中对话框都有遮罩，没有例外。
