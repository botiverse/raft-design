---
title: Dialog
summary: 遮罩上居中的浮层，用于人们必须先完成才能继续的一个决定或几个输入框；宽尺寸用于一次填完的大表单。
sourceHash: 78390117
---

# Dialog

对话框（Dialog）是遮罩上居中的浮层，用于人们必须先完成才能继续的事：一个决定，或者只有几个输入框的小任务，比如创建频道。它有标题、正文和最多两个按钮。它的宽尺寸用来放一次填完的大表单。要确认一个操作，用 [AlertDialog](../alert-dialog/alert-dialog.md)。

```example
dialog/compositions/create-channel
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 1 到 5 个输入框的小任务（Create Channel） | Dialog |
| 一次填完的大表单：注册或编辑应用、配置 Agent | `size="wide"` 的 Dialog |
| 任务详情 | 基于 Dialog 的工作空间浮层，宽 960px，手机上全屏，不属于四种尺寸（[任务](../../../../../design/patterns/tasks.md)） |
| 确认一个不可撤销或会打断的操作 | [AlertDialog](../alert-dialog/alert-dialog.md) |
| 能在原处撤回的操作 | 不用对话框：直接执行；什么时候用带 Undo 的 [Toast](../toast/toast.md)，见[反馈](../../../../../design/patterns/feedback.md#confirming) |
| 人们要看一阵、改一阵的详情或设置 | [Drawer](../drawer/drawer.md) |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `Dialog`：根部件。管理打开状态。必需。
- `DialogTrigger`：打开它的按钮。
- `DialogContent`：居中的表面，通过 portal 渲染，背后是遮罩（`DialogOverlay`）。必需。
- `DialogHeader`：标题行，末尾可选一个 `DialogClose`。× 往外挪，让它的图标框（而不是按钮）落在对话框 20px 的边距上（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- `DialogTitle`：标题。必需。
- `DialogDescription`：标题下面或正文里的一句话。
- `DialogBody`：内容。对话框达到窗口高度时它会滚动。
- `DialogFooter`：靠末端排成一行的按钮，开头可以有一条说明或一个 `TextLink`。只有一行放不下时，它才把按钮叠起来（[底部](#the-footer)）。
- `DialogFooterNote`（`@botiverse/raft-ui/wip`）：底部开头的一行短说明，用弱化的脚注文字说明提交按钮会做什么。只用于 `size="lg"` 或 `size="wide"` 的对话框。空的说明什么也不画。
- `DialogClose`：关闭对话框。没有子元素时它是 × 图标按钮；用 `render` 时它把 Cancel 按钮变成关闭按钮。
- `DialogNav`：宽对话框的分区列表。
- `DialogSurface`：不带 Base UI 行为的对话框外框，用于由应用自己管理遮罩、Esc 和焦点的居中模态框，比如搜索。
- `DialogPortal` 和 `DialogOverlay`：更底层的部件。
- `DialogSheetContent`（`@botiverse/raft-ui/wip`）：在手机上会变成底部面板的对话框所用的 `DialogContent`（[手机上](#on-a-phone)）。在桌面端和平板上它就是 `DialogContent`，标记完全相同。
- `DialogCommit`（`@botiverse/raft-ui/wip`）：对话框唯一的提交按钮，是写在 `DialogFooter` 末尾的 `Button`。在手机上的底部面板里，它改为画在头部末尾。
- `DialogSheetBack`（`@botiverse/raft-ui/wip`）：分步流程后面几步里，底部面板头部开头的返回（Back）。在底部面板之外它什么也不画。在触屏上，它在手指抬起时返回（[手指抬起时切换](../../../../../design/patterns/navigation.md#switching-on-finger-lift)）。

## 变体 {#variants}

按对话框装的内容选尺寸，不要按看起来合不合适来选。四种尺寸相差足够大，每种只装一类内容（cindyz, 2026-10-21）：

| 变体 | 宽度 | 用于 |
| --- | --- | --- |
| `size="sm"` | 400px | 决定：所有确认和告知，包括有几个选项可选、或者有一小段受影响内容列表的确认（Reset Agent、Change Visibility、重启选项）。它和 [AlertDialog](../alert-dialog/alert-dialog.md) 一样宽 |
| `size="md"`（默认） | 448px | 小任务：1 到 5 个输入框、一个用来选的列表、一段只读的简短帮助文字（Create Channel、Add Members、角色说明） |
| `size="lg"` | 640px | 需要宽度的内容：多列的列表、命令或代码、键值行、要读的长文字、分步流程（Connect Computer、计算机的版本说明） |
| `size="wide"` | 896px | 大表单对话框，分成几个分区，固定高度为 760px 或窗口高度减 32px，取较小值 |

- 所有确认都是同一个宽度 400px，不管它基于 Dialog 还是 AlertDialog。内容放不进 400px 的确认就不再是确认了：它是小任务，用 `md`。
- `sm`、`md` 和 `lg` 是小对话框：高度随内容，最高为窗口高度减 32px，点击遮罩会关闭它。`wide` 是大表单对话框。
- 只用 `size` 设置宽度。产品代码从不给 `DialogContent` 传自己的 `max-w-*`。四种尺寸都放不下的内容不是对话框：做成页面或 [Drawer](../drawer/drawer.md)。
- 只有下面这些浮层的宽度不属于四种尺寸，每种都由自己的规则决定。其他任何东西都不能再加：
  - 任务详情，960px：工作空间浮层（[任务](../../../../../design/patterns/tasks.md)）。
  - 搜索，720px，基于 `DialogSurface`，上边缘盖在顶栏的输入框上（[Search](../search/search.md)）。
  - 展示框，宽 720px、高约 520px，由引导流程的第 3 到 5 步、Upgrade to Pro 对话框和 Pro 的 Add seats 对话框共用（cindyz，2026-10-26：增加席位是付费墙，和升级一样），不用于其他地方（[引导](../../../../../design/products/raft-chat/onboarding.md)）。
  - [AnnouncementDialog](../announcement-dialog/announcement-dialog.md)，576px：它的图片和一段文字在这个宽度下最好读；到 640px 时，每行文字会超过 80 个字符。
  - 附件预览，按文件需要的宽度，最宽 768px。
- 在窄屏上，每种尺寸取自身宽度或窗口宽度减 32px 中的较小值，所以在 390px 的屏幕上每种都是 358px 宽。它的高度和宽对话框的分区见[行为](#behavior)。

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
- 点击大表单对话框外面时不要关闭它：在 `Dialog` 上传 `disablePointerDismissal`，这样填了一半的表单不会因为一次误点而丢失。
- 窄屏上的居中对话框两边各保留 16px 边距，高度永远不超过窗口高度减 32px。
- 768px 以下，宽对话框隐藏 `DialogNav`，各分区依次排列。
- `DialogFooter` 在任何宽度下都把按钮排成一行。它按一行的排法测量，只有子元素超出底部时，才设置 `data-stacked`，把按钮叠成通栏，提交按钮在上（[底部](#the-footer)）。可以收缩的内容（比如会截断或换行的标签）先收缩，所以只有不能收缩的按钮才会让底部叠放。对话框尺寸变化、标签改变或字体加载完成时，它会重新测量；底部在底部面板里被隐藏时，它完全不测量。包在其他元素里的按钮（比如 tooltip 的触发元素）也会占满宽度。`AlertDialogFooter` 也一样。
- 用 `className` 自己排版的底部（比如按钮旁边有复选框，或者一对链接）也按同样的方式测量，不需要额外设置：内容在一行里放得下时保持自己的排版，放不下时才叠放。可以让位的文字加上 `min-w-0`（要截断的再加 `truncate`），它会先收缩，底部才叠放。
- 从对话框或面板里打开的对话框，会在下面那层遮罩上再画一层更浅的遮罩（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。把它渲染在第一个对话框里面，这就会自动发生。`layer={1}` 只用于渲染在第一个对话框的树之外的对话框：它把这个对话框和它的遮罩抬到第一个之上。
- 应用自己的模态框（自己的遮罩、Esc 和焦点，基于 `DialogSurface`）用 `@botiverse/raft-ui/wip` 里的 `OverlayLayerProvider` 和 `useParentOverlayKind` 加入同一个叠放顺序（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。

## 手机上 {#on-a-phone}

768px 以下，对话框保持居中，除非它有多个输入框、长列表或分步，这时它变成底部面板（stdrc and Artea, 2026-10-21）。在桌面端和平板上，所有对话框都保持居中。

保持居中的对话框，底部和桌面端一样排成一行。只有按钮放不下时它才叠放，提交按钮在上（[底部](#the-footer)）。

| 对话框装的内容 | 手机上 |
| --- | --- |
| 一个决定：一句说明和按钮，最多几个固定选项，不需要输入（所有确认；归档、停止、重置） | 居中对话框，和桌面端一样 |
| 一个输入框或一个文本框及其按钮：要求输入名称的确认、给分区命名、编辑显示名称或描述、填写拒绝理由 | 居中对话框，和桌面端一样。键盘打开时它应该上移，不被键盘挡住：Raft Chat 目前在应用里这样做（slock 里的 `narrow="top"`）；raft-ui 计划支持 |
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

- 对话框的标题用打开它的那个按钮的文字，或者用 Edit 加上项目名称。主按钮的标签写它执行的操作，不带对象：通常是标题里的动词（Create Channel → Create）；Edit 标题的按钮是 Save，另一个是 Cancel（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
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
- 底部开头最多放一个东西：一个弱化的 `TextLink` 或一个 `DialogFooterNote`，不能两个都放。不要在那里放会改变什么的操作，也不要放需要人们做决定的内容；那些属于正文。
- `DialogFooterNote` 只用于 `size="lg"` 或 `size="wide"` 的对话框，并且不超过 40 个字符：在桌面端它从不换行。
- 用 `DialogFooter` 搭底部，不要自己排一行：它负责间距、顺序，以及按钮放不下时的叠放。
- 确认按钮执行操作时用粉色（`variant="primary"`）。操作会打断或不可撤销时，按后果给它上色（[AlertDialog](../alert-dialog/alert-dialog.md#variants)）。
- 人们在操作前必须读到的内容，放在正文里的 [Banner](../banner/banner.md) 中（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。
- 每种尺寸的内边距都是 20px。宽度来自 `size`（[变体](#variants)），永远不要用自己的 class 设置，那里列出的例外除外。
- 产品代码里不要传 `overlay={false}`：每个居中对话框都有遮罩，没有例外。
