---
title: Drawer
summary: 从右侧滑入的面板，放人要看一阵子的详情和设置；在手机上则是底部面板，用来选择去哪里，或读一段简短的说明。
sourceHash: 4dcf0920
---

# Drawer

抽屉从右侧滑入，放人要看一阵子、会脱离后面的内容单独滚动和编辑的详情和设置，比如一个 Agent 用 Linear 的哪些连接（Linear for this agent）。后面的页面留在原处，盖在遮罩下。和对话一起读的详情，比如频道的详情、消息列或个人资料，不是抽屉：它们是对话旁边的一列，没有遮罩，所以打开它们时对话仍然看得见、够得着（stdrc，2026-11-10，#proj-raft-ui:dae8db07；[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)）。在手机上，同一个组件从底部升起，成为底部面板：用来选择去哪里，或读一段简短的说明，配一个按钮。

```example
drawer/compositions/responsive-placement
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 人单独阅读、滚动和编辑的详情或设置 | Drawer，从右侧滑入 |
| 一边聊天一边读的详情：频道的详情、消息列、个人资料 | 对话旁边的一列，不用抽屉：遮罩会挡住人们对照着读的对话（[ThreadPanel](../thread-panel/thread-panel.md)、[Panel](../panel/panel.md)） |
| 一次填完的大表单：注册或编辑一个应用 | 宽版 [Dialog](../dialog/dialog.md)，不用宽抽屉（[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)） |
| 在手机上切换服务器 | 不用抽屉：用顶栏下方的弹出层（[导航](../../../../../design/patterns/navigation.md#servers)）。Working now 也是弹出层，手机上同样如此 |
| 在手机上显示一两句话和一个按钮 | 底部面板 |
| 对一样东西执行操作 | 菜单（[DropdownMenu](../dropdown-menu/dropdown-menu.md)、[ContextMenu](../context-menu/context-menu.md)），不要用底部面板 |
| 选一个值，比如排序方式或状态 | [Select](../select/select.md) 的列表，或菜单里的单选项 |
| 确认 | `size="sm"` 的 [Dialog](../dialog/dialog.md#variants)；只有产品列出的那几个确认才用 [AlertDialog](../alert-dialog/alert-dialog.md)（[选择组件](../../../../../design/components/overview.md#overlays)） |
| 悬停时看一眼 | [PreviewCard](../preview-card/preview-card.md) |

## 结构 {#anatomy}

- `Drawer`：根元素。它的 `swipeDirection` 决定从哪条边出现。必需。
- `DrawerTrigger`：打开抽屉的按钮。
- `DrawerContent`：表面，通过 portal 渲染；抽屉为模态时，后面有遮罩（`DrawerOverlay`）。必需。它和其他所有弹出层一样，是 `layer-popover`，带 `line-seam` 边和 `shadow-float`，不用墨色边框和硬阴影：所有浮起的表面都用同一种阴影（[层级](../../../../../design/foundations/elevation.md)）。它从拖动把手往下是一整块表面：占满宽度的区域（标题栏、列表、底部）不画自己的表面，里面的卡片和输入框照旧。放在里面的 [Panel](../panel/panel.md#rules)，连同它的 `PanelHeader` 和 `PanelFooter`，自己就会用抽屉的 `layer-popover`，`PanelHeader` 的 `line-seam` 留着（artin，2026-11-25，#proj-workspace:f6de4a2b）。
- `DrawerHeader`：标题行。在从右侧滑入的抽屉里是头部高度（桌面端 44px，手机上 56px），下方有一条 `line-seam`，末端是 `DrawerClose`。
- `DrawerTitle`：标题。必需，除非内容有 `aria-label`。
- `DrawerDescription`：标题下的一句话。
- `DrawerBody`：内容。它在头部和底栏之间滚动，头部和底栏留在原处：在底部或顶部面板里用原生滚动；在从右侧滑入的抽屉里用原生滚动，或者加上 `unstable_scrollArea`，在 raft-ui 的滚动条下滚动（[在 ScrollArea 里滚动](#scrolling-in-a-scrollarea)）。
- `DrawerFooter`：底栏。在从右侧滑入的抽屉里，上方有一条 `line-seam`。
- `DrawerActions`：底栏里的按钮。在抽屉里排成一行靠末端，在底部面板里纵向堆叠、占满宽度，这时幽灵按钮 Cancel 会加上边框（[Button](../button/button.md#which-color)）。
- `DrawerClose`：关闭抽屉。没有子元素时是 × 图标按钮；用 `render` 时可以把另一个按钮变成关闭按钮。
- `DrawerPortal` 和 `DrawerOverlay`：更底层的部件。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `swipeDirection="right"` | 抽屉：桌面端的详情和设置，最宽 420px，占满窗口高度 |
| `swipeDirection="down"`（默认） | 底部面板，用在手机上 |
| `snapPoints` | 先展开到摘要、再展开到完整高度的底部面板 |

```example
drawer/compositions/bottom-sheet
```

```example
drawer/compositions/snap-points
```

### 在 ScrollArea 里滚动 {#scrolling-in-a-scrollarea}

在从右侧滑入的抽屉里，`DrawerBody` 用原生方式滚动，所以在 Windows 上，以及设为始终显示滚动条的 Mac 上，长正文会画出平台自己的滚动条，它出现时会占掉正文的一部分宽度。加上 `unstable_scrollArea` 后，正文改为一个 [ScrollArea](../scroll-area/scroll-area.md)：滚动方式不变，画的是 raft-ui 的滚动条，它不占空间，在每个平台、两种主题下看起来都一样。本页顶部的抽屉就用了它。

- 目前需要主动开启，会在之后的某个 minor 版本里成为默认，和 [DialogBody](../dialog/dialog.md#scrolling-in-a-scrollarea) 的同名属性一起。正文的其他方面都不变，所以等它成为默认时，删掉这个属性即可。
- 它只用于从侧边滑入的抽屉（`swipeDirection="right"` 或 `"left"`）。底部或顶部面板会忽略这个属性，连同 `wrapperClassName`：它的正文和不加这个属性时是同一个元素、同样的 class。底部面板是手机上的表面，那里平台的滚动条盖在内容上、不占空间、只在滚动时出现，所以 raft-ui 的滚动条在那里没有用处；而且在底部面板内容的顶端向下拖，必须开始关闭底部面板，ScrollArea 在两端对滚动的控制可能会改变这一点。所以响应式抽屉可以一直传这个属性：它只在从侧边滑入时生效。
- 底部或顶部面板的正文靠它自己的 class 用原生方式滚动，所以内容高过窗口 82% 的底部面板不需要为此加 class（[行为](#behavior)）。自己已经带 `min-h-0 overflow-y-auto` 的正文，或者通过 `render` 给成 ScrollArea 的正文，照原样滚动，这些 class 可以删掉。
- 正文仍然是带 `data-slot="drawer-body"` 的那个元素。它和以前一样接受 `className`、`ref`、原生属性、`render` 和子元素，而且仍然是排列子元素的那个 flex 列，所以写在它上面的布局（`className="gap-4"`）不变，它里面除了子元素也不会多出任何东西。它的内边距仍然是它自己的，随内容一起滚动。它用 ScrollArea 的 [absolute 滚动条槽](../scroll-area/scroll-area.md#gutters-position)：正文外面会渲染一个外框 `data-slot="drawer-body-frame"`，滚动条在这个外框里。
- `DrawerContent` 的子元素是外框，不是正文，位于 `DrawerHeader` 和 `DrawerFooter` 之间。在抽屉里设定正文尺寸的 class（`max-h-*`、`h-*`、`flex-*`）写在 `wrapperClassName` 里，它属于外框；内边距和布局仍然写在 `className` 里。`render` 替换的是正文，不是外框，外框总是一个 `<div>`。你自己写的、把正文当作内容的子元素去选的选择器（`[data-slot=drawer-content] > [data-slot=drawer-body]`）不再匹配：改为选外框，或者把正文当作后代去选。
- 只有在正文溢出、且里面没有能获得焦点的东西时，正文才是一个 Tab 停靠点，和原生的滚动容器一样。表单不会多出停靠点：Tab 从头部直接到第一个输入框，键盘从正文里有焦点的任何东西滚动正文。只供阅读的长文本可以用 Tab 到达，用方向键和 Page Down 滚动。你自己设的 `tabIndex` 优先。
- 滚动到正文尽头就停在那里，Mac 触控板或 iOS 上正文仍会回弹（`overscroll="contain"`，和 [Panel](../panel/panel.md#anatomy) 一样）。
- 正文里有比它宽的东西（宽表格、不换行的一行、`<pre>`、图片）时，正文也会横向滚动，和原生正文一样：抽屉、它的头部和底栏保持宽度，横向滚动条显示在正文底边，盖在底栏上。正文里没有比它宽的东西时，只纵向滚动，不画横向滚动条。横向滚动时整个正文一起移动，输入框和宽的部分一起动，所以宽表格最好在外面包一个 `TableScroll`（[Table](../table/table.md#wide-tables)）：这样只有表格滚动。
- 朝抽屉所在的边缘滑动，在正文的任何地方仍然可以关闭它；在正文上纵向拖动会滚动正文，不会移动抽屉。正文里有比它宽的东西时，横向拖动先归正文，加不加这个属性都一样：背离边缘拖动会滚动正文；朝边缘拖动，只有正文在起始位置时才关闭抽屉，否则把正文滚回去。
- 外框和所有 ScrollArea 一样，自成一个层叠上下文：给了正文里的 `container` 的弹出层会画在抽屉的头部下面。弹出层就留在 raft-ui portal 它们的地方；它们仍然留在头部下面、抽屉底边上面（[行为](#behavior)）。

## 行为 {#behavior}

- 抽屉用 `ease-slide` 从它的边缘滑入。它是唯一会移动的浮层，因为滑动能说明它从哪里来（[动效](../../../../../design/foundations/motion.md#usage)）。
- 模态抽屉会在页面其余部分盖上和对话框一样的遮罩：抽屉打开时页面不能操作，遮罩正是在说明这一点。点击遮罩会关闭抽屉。底部面板也有遮罩。
- 朝抽屉所在的边缘滑动可以关闭它。
- 从抽屉里再打开的抽屉叠在它上面，下面那个往后退一层。
- 在手机上，从右侧滑入的抽屉占满屏幕，像一个页面一样使用：没有 ×，左上角是返回。
- 底部面板最高升到窗口高度的 82%，上方两个角用 `radius-dialog`，并避开主屏幕指示条。
- 内容比这更高时，底部面板的正文会滚动：头部留在底部面板顶部，底栏留在底部，正文在两者之间滚动，用平台的滚动条。内容少的底部面板和内容一样高，不画滚动条。在正文上向上拖会滚动正文。向下拖时，正文在顶端就关闭底部面板，不在顶端就把正文滚回去；在头部或拖动条上向下拖，总是关闭底部面板。正文滚动时，你写在正文里的东西保持自己的高度，在底部面板和从侧边滑入的抽屉里都一样：正文是一个 flex 列，它的子元素不收缩，所以固定高度的一行保持那么高。本来就要在正文里收缩并自己滚动的子元素，比如固定开头下面的一个列表，要加 `flex-1`（或 `shrink`）和 `min-h-0`；只加 `min-h-0` 不再能让它收缩。
- 带 `snapPoints` 的底部面板只在完整高度（吸附点 `1`）时滚动正文。低于这个高度时，底部面板的下半部分在窗口边缘以下，在正文上向上拖会把底部面板升到下一个吸附点，所以这时正文在底部面板的底边被截断，不滚动。吸附点里没有 `1` 的底部面板从不滚动正文：让它的内容不超过最高的吸附点。
- 从抽屉里的输入框打开的 Select 或 Combobox 列表、菜单或弹出层，留在 `DrawerHeader` 下面、抽屉底边上面，如果屏幕键盘的顶部更高，就留在键盘顶部上面：它在那里翻转、缩小，而不是盖住头部，和对话框的手机底部面板里一样（[Dialog](../dialog/dialog.md#popups-in-a-sheet)）。横向上它仍以窗口为界，所以 420px 宽的抽屉里的菜单仍可能伸到遮罩上。锚定在头部的弹出层，比如头部按钮上的工具提示或菜单，不受影响，和在抽屉外一样以窗口为界：它在它要求的位置打开，因为把它限制在头部下面，它会盖住抽屉的内容。锚定在正文里的弹出层总是受限，不管抽屉多矮：列表取输入框较大的一侧，各行滚动。让列表盖过头部，会挡住头部；或者 portal 进抽屉的滚动正文，就会画在头部下面，前几行按不到。传给弹出层的 `collisionBoundary` 优先；`"clipping-ancestors"` 可以让它不受限。

```example
drawer/compositions/nested-close-callback
```

## 内容 {#content}

- 标题用打开它的那个按钮上的文字（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 在底部面板里，说明写一两句，用 `foreground-muted`；按钮只放一个操作，用 sentence case：Got it。

## 无障碍 {#accessibility}

- Drawer 封装了 Base UI 的 Drawer。它提供 `dialog` 语义、模态抽屉的焦点锁定、Esc、滑动关闭，以及关闭后焦点回到触发按钮。
- 每个抽屉和底部面板都要有标题：一个可见的 `DrawerTitle`，至少也要在 `DrawerContent` 上加 `aria-label`。
- `DrawerClose` 的 × 标签是 "Close"。在手机上，取代它的返回按钮要加 `aria-label`（"Back"）。
- 拖动条对辅助技术隐藏。不要让滑动成为唯一的关闭方式：保留 ×、返回或面板里的按钮。

## 规则 {#rules}

- 抽屉最宽 420px。需要更多空间的表单用宽版 [Dialog](../dialog/dialog.md)。
- × 用和面板标题栏里一样的图标按钮、一样的图标尺寸，放在 `DrawerHeader` 的最后：它的图标框止于边距线；在手机上取代它的返回按钮则从边距线开始（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- 抽屉的标题栏只有一行：标题，加上同一行里最多一个附属项，比如一个标签（Default），或者它所属的东西（Agent 的用户名（handle），用弱化的 Space Mono，比标题先截断）。不要在标题下面再放一行：本来要放在那里的内容在正文里，人们在那里阅读或编辑，所以抽屉的标题栏保持一行（stdrc，2026-11-03）。
- 按钮放在底栏，不要放在标题栏。按钮用 `size="lg"`（手机上 44px，桌面端 34px）：Cancel 在前，Save 在后（[表单](../../../../../design/patterns/forms.md#forms-in-a-dialog)）。
- 抽屉里的长表单拆成几个 [FormSection](../form-section/form-section.md)，分区和宽版对话框里的一样，用底栏的 Save 一起保存。
- 抽屉表单里每个「是或否」的复选框下面，加一行说明不勾选时会怎样。这里用复选框而不用开关，因为表单是要保存的（[表单](../../../../../design/patterns/forms.md#forms-in-a-dialog)）。
- 每个底部面板的上边缘都要有拖动条：一根 36 × 4px、两端圆头的 `line-seam` 色条，每个平台都这样画。`DrawerContent` 会在每个 `swipeDirection="down"` 的底部面板上画出它，无论面板高度随内容而定还是带吸附点，所以不要自己再画一个；2026-11-02 之前，它只在带吸附点时画，高度随内容而定的底部面板没有拖动条（Ferry，onboarding v3）（[形状](../../../../../design/foundations/shape.md#principles)）。
- 底部面板里的列表，每行高 52px，配 20px 的图标，标签用 `text-body`、中等字重。当前行用对勾和粗体标出。
