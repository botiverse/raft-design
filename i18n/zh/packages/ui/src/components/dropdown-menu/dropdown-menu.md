---
title: DropdownMenu
summary: 从按钮打开的一列操作，作用于同一个东西；也可以放一个设置式的选择，在当前值旁打勾。
sourceHash: b770841f
---

# DropdownMenu

下拉菜单是作用于同一个东西（一条消息、一个频道、一个任务、一个 agent）的一列操作，从 ⋯ 这样的按钮打开。它也可以放一个设置式的选择，比如排序方式或状态，在当前值旁打勾。在桌面端右键、在手机上长按，打开的是同一个菜单，即 [ContextMenu](../context-menu/context-menu.md)。

```example
dropdown-menu/compositions/sidebar-section-header-menu
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 从一个按钮对某个东西执行操作 | DropdownMenu |
| 同样的操作，通过右键或长按触发 | [ContextMenu](../context-menu/context-menu.md)，菜单项相同 |
| 立即生效的设置式选择（排序、状态） | 带单选项的 DropdownMenu |
| 随表单一起提交的值 | [Select](../select/select.md) |
| 点击后的一个小输入（稍后提醒、重命名） | [Popover](../popover/popover.md) |
| 在手机上要去的地方 | 底部面板（[Drawer](../drawer/drawer.md)） |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `DropdownMenu`：根组件。管理打开状态。必需。
- `DropdownMenuTrigger`：打开菜单的按钮。除非传入 `render`，否则渲染为描边 Button。必需。
- `DropdownMenuContent`：菜单本身，通过 portal 渲染，定位在触发按钮旁边，宽度至少 240px。必需。
- `DropdownMenuItem`：一个操作。先是 16px 的图标，然后是标签。把标签包在 `DropdownMenuItemLabel` 里可以截断它。
- `DropdownMenuShortcut`：菜单项末尾的键盘快捷键，用 `text-mono-meta` 和 `foreground-hint`。
- `DropdownMenuItemCount`：菜单项末尾的计数。
- `DropdownMenuRadioGroup` 和 `DropdownMenuRadioItem`：一组值，其中一个是当前值，用勾号标出。
- `DropdownMenuCheckboxItem`：一个独立开关的选项。
- `DropdownMenuLabel`：一组菜单项上方的标题。不可交互。
- `DropdownMenuSeparator`：分区之间的线。
- `DropdownMenuSubmenu` 和 `DropdownMenuSubmenuTrigger`：嵌套菜单，从带 V 形箭头的菜单项打开。
- `DropdownMenuFooter`：底部一行低调的文字，比如计数。
- `DropdownMenuPortal` 和 `DropdownMenuPopup`：底层部件。`DropdownMenuPopup` 是不带定位的菜单表面。

## 状态 {#states}

悬停、键盘高亮、当前值和禁用项遵循[状态](../../../../../design/foundations/states.md#usage)。在菜单里：

- 高亮和当前值要分开。`brand-soft` 高亮表示鼠标指针或键盘所在的位置；勾号和粗体文字表示选中了哪个值。不要用高亮来标出当前值。
- 禁用项只用 `foreground-disabled` 的文字和图标表示，别的什么都不加。

## 行为 {#behavior}

- 菜单在触发按钮下方打开，与触发按钮的起始边对齐，碰到窗口边缘时会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 选择一个操作会关闭菜单。选择单选项或复选项时菜单保持打开，让人能看到结果。
- 按 Esc 或点击菜单外部会关闭菜单。
- 菜单项的高度由内容决定：一行是 36px；第二行（比如标签下面的描述）只增加它自己的高度，文字上下的空间不变（[表单和设置](../../../../../design/patterns/forms.md#option-height)）。单选项和复选项也是如此。

## 内容 {#content}

- 菜单项标签用 Title Case：Copy Link、Reply in Thread（[写作](../../../../../design/content/writing.md#casing)）。
- 打开对话框的菜单项，标签就用对话框的标题（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- DropdownMenu 封装了 Base UI 的 Menu。它提供 `menu` 角色、菜单项角色、方向键移动、输入跳转、Esc，以及关闭后焦点回到触发按钮。
- 按菜单作用的对象给菜单命名：在 `DropdownMenuContent` 上加 `aria-label`（"Message from Wug"）。
- 只有图标的触发按钮（比如 ⋯）要加 `aria-label`（"More Actions"）。
- 菜单里的每一行都做成菜单项，让方向键能到达。快捷回应也一样：每个都加 `aria-label`（"React with thumbs up"），并对辅助技术隐藏图形。
- 菜单项的图标只作装饰；由标签说明操作是什么。

## 规则 {#rules}

- 不要给 Delete、Stop 这类破坏性的菜单项上色。它们会打开 [AlertDialog](../alert-dialog/alert-dialog.md)，由对话框里橙色或红色的按钮来表达后果（[反馈](../../../../../design/patterns/feedback.md#confirming)）。
- 菜单中每两个分区之间用同样的分隔线。
- 不要在菜单里放提交表单值的控件；用 [Select](../select/select.md)。

### 消息菜单 {#the-message-menu}

消息菜单以快捷回应开头（[对话](../../../../../design/patterns/conversation.md#actions)；尺寸见[品牌](../../../../../design/foundations/brand.md#reactions)）。

- 快捷回应这一行以一个 `smile-plus` 图标按钮结尾，点它打开全部 emoji。
- 回应和第一个操作之间放一条分隔线，然后把操作分成若干分区。
