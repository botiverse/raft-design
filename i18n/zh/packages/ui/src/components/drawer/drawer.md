---
title: Drawer
summary: 从右侧滑入的面板，放人要看一阵子的详情和设置；在手机上则是底部面板，用来选择去哪里，或读一段简短的说明。
sourceHash: 7e250177
---

# Drawer

抽屉从右侧滑入，放人要看一阵子、会滚动和编辑的详情和设置，比如 #launch-week 的详情和成员。后面的页面留在原处，盖在遮罩下。在手机上，同一个组件从底部升起，成为底部面板：用来选择去哪里，或读一段简短的说明，配一个按钮。

```example
drawer/compositions/responsive-placement
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 人要阅读、滚动和编辑的详情或设置 | Drawer，从右侧滑入 |
| 一次填完的大表单：注册或编辑一个应用 | 宽版 [Dialog](../dialog/dialog.md)，不用宽抽屉（[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)） |
| 在手机上切换服务器 | 不用抽屉：用顶栏下方的弹出层（[导航](../../../../../design/patterns/navigation.md#servers)）。Working now 也是弹出层，手机上同样如此 |
| 在手机上显示一两句话和一个按钮 | 底部面板 |
| 对一样东西执行操作 | 菜单（[DropdownMenu](../dropdown-menu/dropdown-menu.md)、[ContextMenu](../context-menu/context-menu.md)），不要用底部面板 |
| 选一个值，比如排序方式或状态 | [Select](../select/select.md) 的列表，或菜单里的单选项 |
| 确认 | [AlertDialog](../alert-dialog/alert-dialog.md) |
| 悬停时看一眼 | [PreviewCard](../preview-card/preview-card.md) |
| 在对话旁边一直开着的消息列或个人资料 | 侧面板（[ThreadPanel](../thread-panel/thread-panel.md)、[Panel](../panel/panel.md)），它不是抽屉，也没有遮罩 |

## 结构 {#anatomy}

- `Drawer`：根元素。它的 `swipeDirection` 决定从哪条边出现。必需。
- `DrawerTrigger`：打开抽屉的按钮。
- `DrawerContent`：表面，通过 portal 渲染；抽屉为模态时，后面有遮罩（`DrawerOverlay`）。必需。它和其他所有弹出层一样，是 `layer-popover`，带 `line-seam` 边和 `shadow-float`，不用墨色边框和硬阴影：所有浮起的表面都用同一种阴影（[层级](../../../../../design/foundations/elevation.md)）。
- `DrawerHeader`：标题行。在从右侧滑入的抽屉里高 56px，下方有一条 `line-seam`，末端是 `DrawerClose`。
- `DrawerTitle`：标题。必需，除非内容有 `aria-label`。
- `DrawerDescription`：标题下的一句话。
- `DrawerBody`：内容，可以滚动。
- `DrawerFooter`：底栏。在从右侧滑入的抽屉里，上方有一条 `line-seam`。
- `DrawerActions`：底栏里的按钮。在抽屉里排成一行靠末端，在底部面板里纵向堆叠、占满宽度。
- `DrawerClose`：关闭抽屉。没有子元素时是 × 图标按钮；用 `render` 时可以把另一个按钮变成关闭按钮。
- `DrawerPortal` 和 `DrawerOverlay`：更底层的部件。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `swipeDirection="right"` | 抽屉：桌面端的详情和设置，最宽 420px，占满窗口高度 |
| `swipeDirection="down"`（默认） | 底部面板，用在手机上 |
| `snapPoints` | 先展开到摘要、再展开到完整高度的底部面板。会显示拖动条 |

```example
drawer/compositions/snap-points
```

## 行为 {#behavior}

- 抽屉用 `ease-slide` 从它的边缘滑入。它是唯一会移动的浮层，因为滑动能说明它从哪里来（[动效](../../../../../design/foundations/motion.md#usage)）。
- 模态抽屉会在页面其余部分盖上和对话框一样的遮罩：抽屉打开时页面不能操作，遮罩正是在说明这一点。点击遮罩会关闭抽屉。底部面板也有遮罩。
- 朝抽屉所在的边缘滑动可以关闭它。
- 从抽屉里再打开的抽屉叠在它上面，下面那个往后退一层。
- 在手机上，从右侧滑入的抽屉占满屏幕，像一个页面一样使用：没有 ×，左上角是返回。
- 底部面板最高升到窗口高度的 82%，上方两个角用 `radius-dialog`，并避开主屏幕指示条。

```example
drawer/compositions/nested-close-callback
```

## 内容 {#content}

- 标题用打开它的那个按钮上的文字（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 在底部面板里，说明写一两句，用 `foreground-muted`；按钮只放一个操作，用 Title Case：Got It。

## 无障碍 {#accessibility}

- Drawer 封装了 Base UI 的 Drawer。它提供 `dialog` 语义、模态抽屉的焦点锁定、Esc、滑动关闭，以及关闭后焦点回到触发按钮。
- 每个抽屉和底部面板都要有标题：一个可见的 `DrawerTitle`，至少也要在 `DrawerContent` 上加 `aria-label`。
- `DrawerClose` 的 × 标签是 "Close"。在手机上，取代它的返回按钮要加 `aria-label`（"Back"）。
- 拖动条对辅助技术隐藏。不要让滑动成为唯一的关闭方式：保留 ×、返回或面板里的按钮。

## 规则 {#rules}

- 抽屉最宽 420px。需要更多空间的表单用宽版 [Dialog](../dialog/dialog.md)。
- × 用和面板标题栏里一样的图标按钮、一样的图标尺寸，放在 `DrawerHeader` 的最后：它的图标框止于边距线；在手机上取代它的返回按钮则从边距线开始（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- 按钮放在底栏，不要放在标题栏。按钮用 `size="lg"`（手机上 44px，桌面端 32px）：Cancel 在前，Save 在后（[表单](../../../../../design/patterns/forms.md#forms-in-a-dialog)）。
- 抽屉里的长表单拆成几个 [FormSection](../form-section/form-section.md)，分区和宽版对话框里的一样，用底栏的 Save 一起保存。
- 抽屉表单里每个「是或否」的复选框下面，加一行说明不勾选时会怎样。这里用复选框而不用开关，因为表单是要保存的（[表单](../../../../../design/patterns/forms.md#forms-in-a-dialog)）。
- 每个底部面板的上边缘都要有拖动条。
- 底部面板里的列表，每行高 52px，配 20px 的图标，标签用 `text-body`、中等字重。当前行用对勾和粗体标出。
