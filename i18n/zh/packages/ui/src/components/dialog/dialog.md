---
title: Dialog
summary: 遮罩上居中的浮层，用于人们必须先完成才能继续的一个决定或几个输入框；宽尺寸用于一次填完的大表单。
sourceHash: 483c97e1
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
| 一次填完的大表单：注册或编辑应用、配置 agent | `size="wide"` 的 Dialog |
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
- `DialogFooter`：按钮，靠末端对齐。
- `DialogClose`：关闭对话框。没有子元素时它是 × 图标按钮；用 `render` 时它把 Cancel 按钮变成关闭按钮。
- `DialogNav`：宽对话框的分区列表。
- `DialogSurface`：不带 Base UI 行为的对话框外框，用于由应用自己管理遮罩、Esc 和焦点的居中模态框，比如搜索。
- `DialogPortal` 和 `DialogOverlay`：更底层的部件。

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
  - 展示框，宽 720px、高约 520px，由引导流程的第 3 到 5 步和 Upgrade to Pro 对话框共用，不用于其他地方（[引导](../../../../../design/products/raft-chat/onboarding.md)）。
  - [AnnouncementDialog](../announcement-dialog/announcement-dialog.md)，576px：它的图片和一段文字在这个宽度下最好读；到 640px 时，每行文字会超过 80 个字符。
  - 附件预览，按文件需要的宽度，最宽 768px。
- 在窄屏上，每种尺寸取自身宽度或窗口宽度减 32px 中的较小值，所以在 390px 的屏幕上每种都是 358px 宽。它的高度和宽对话框的分区见[行为](#behavior)。

大表单对话框在 `DialogHeader`、`DialogBody` 和 `DialogFooter` 上用 `bar`：头部和底部固定，正文在两者之间滚动。正文左边是 `DialogNav`，后面一条 `line-seam`，右边每个分区一个 [FormSection](../form-section/form-section.md)。它的结构和规则见[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)。

## 行为 {#behavior}

- 居中对话框出现和消失都没有动画，始终在遮罩上方（[动效](../../../../../design/foundations/motion.md#usage)）。在手机上，带输入框的对话框改为从底部滑上来的面板（[手机上](#on-a-phone)）。
- Esc、× 和 Cancel 会关闭对话框。点击遮罩会关闭小对话框。
- 点击大表单对话框外面时不要关闭它：在 `Dialog` 上传 `disablePointerDismissal`，这样填了一半的表单不会因为一次误点而丢失。
- 窄屏上的居中对话框两边各保留 16px 边距，高度永远不超过窗口高度减 32px。
- 768px 以下，宽对话框隐藏 `DialogNav`，各分区依次排列。
- 从对话框或面板里打开的对话框，会在下面那层遮罩上再画一层更浅的遮罩（[叠放的浮层](../../../../../design/foundations/elevation.md#stacked-overlays)）。把它渲染在第一个对话框里面，这就会自动发生。`layer={1}` 只用于渲染在第一个对话框的树之外的对话框：它把这个对话框和它的遮罩抬到第一个之上。

## 手机上 {#on-a-phone}

768px 以下，对话框保持居中，除非它有多个输入框、长列表或分步，这时它变成底部面板（stdrc and Artea, 2026-10-21）。在桌面端和平板上，所有对话框都保持居中。

| 对话框装的内容 | 手机上 |
| --- | --- |
| 一个决定：一句说明和按钮，最多几个固定选项，不需要输入（所有确认；归档、停止、重置） | 居中对话框，和桌面端一样 |
| 一个输入框或一个文本框及其按钮：要求输入名称的确认、给分区命名、编辑显示名称或描述、填写拒绝理由 | 居中对话框，和桌面端一样。键盘打开时它会上移，不被键盘挡住 |
| 多个输入框、可供选择的长列表或可搜索列表，或者分步：表单、选择器、向导 | 占屏幕 90% 高度的底部面板 |
| 只读的内容：角色说明、版本说明、应用详情。这些是简短的信息，所以保持为对话框 | 居中对话框，和桌面端一样 |

底部面板：

- 从底部升起，盖在遮罩上，顶部两角用 `radius-dialog`。它上方留出的一条页面说明它是页面上的一层，而不是新页面。
- 它的头部就是推入页面的头部（[导航](../../../../../design/patterns/navigation.md)）：开头是 ×，然后是标题，末尾是对话框唯一的提交按钮，尺寸为 `md`，颜色和文字与桌面端相同。它没有底部：× 就是 Cancel。在分步流程里，末尾的按钮属于当前这一步（Next，最后一步是那一步的操作），× 仍然是关闭。
- 正文在头部下方滚动，保持手机的 16px 边距，底部留出主屏幕指示条的内边距。
- × 和 Esc 会关闭它。轻点遮罩不会，这样填了一半的表单不会因为一次误触而丢失，和桌面端的大表单对话框一样。已经输入了内容时，关闭前先询问。
- 计划支持向下拖动面板来关闭它，等面板移进 raft-ui、基于 Drawer 的拖动来实现。
- 它打开时向上滑入，和所有底部面板一样（[动效](../../../../../design/foundations/motion.md#usage)）。

目前 Raft Chat 在应用里自己实现这些表单（slock 里的 `NarrowDialog`）；它们会作为 Dialog 在手机上的呈现方式移进 raft-ui。

## 内容 {#content}

- 对话框的标题用打开它的那个按钮的文字，或者用 Edit 加上项目名称。主按钮的标签写它执行的操作，不带对象：通常是标题里的动词（Create Channel → Create）；Edit 标题的按钮是 Save，另一个是 Cancel（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 正文文字用 `foreground-muted`，放在 `foreground` 的标题下面。它们的文字样式见[字体排印](../../../../../design/foundations/typography.md)。

## 无障碍 {#accessibility}

- Dialog 封装了 Base UI Dialog。它提供 `dialog` 角色、焦点陷阱、Esc，以及关闭后焦点回到触发按钮。
- 给每个对话框一个 `DialogTitle`。它会成为对话框的无障碍名称，也是打开时读屏软件播报的内容。
- `DialogDescription` 会成为对话框的描述。
- `DialogClose` 的 × 标签是「Close」。传 `aria-label` 可以修改。
- `DialogSurface` 本身没有任何行为。使用它的应用必须自己加上 `dialog` 角色、`aria-modal`、名称、焦点陷阱、Esc 和遮罩。

## 规则 {#rules}

- 底部最多放两个按钮：左边是 Cancel（`variant="ghost"`），右边是确认按钮。
- 确认按钮执行操作时用粉色（`variant="primary"`）。操作会打断或不可撤销时，按后果给它上色（[AlertDialog](../alert-dialog/alert-dialog.md#variants)）。
- 人们在操作前必须读到的内容，放在正文里的 [Banner](../banner/banner.md) 中（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。
- 每种尺寸的内边距都是 20px。宽度来自 `size`（[变体](#variants)），永远不要用自己的 class 设置。
- 产品代码里不要传 `overlay={false}`：每个居中对话框都有遮罩，没有例外。
