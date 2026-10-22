---
title: Popover
summary: 在人点击的元素旁边打开的小面板，用于少量输入，比如一个选项、一个输入框和一个按钮。
sourceHash: c4d7b260
---

# Popover

弹出层是在人点击的元素旁边打开的小面板，用来放少量输入：几个选项中选一个、一个输入框、一个按钮。暂缓一条通知或给某样东西改名，一个弹出层就装得下。点击外部或按 Esc 时关闭。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 悬停时关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 悬停时显示一个人或 agent 的概要，带链接 | [PreviewCard](../preview-card/preview-card.md) |
| 悬停时显示应用链接到的条目的详情 | 条目卡片（[PreviewCard](../preview-card/preview-card.md#item-card)） |
| 点击后做一个小选择或少量输入（暂缓、改名） | Popover，配合 [RadioGroup](../radio-group/radio-group.md)、[Input](../input/input.md) 和按钮 |
| 一组操作 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 保持打开、可以滚动的内容 | [Drawer](../drawer/drawer.md) |

哪种浮层适合做什么，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `Popover`：根组件。管理打开状态。必需。
- `PopoverTrigger`：打开它的元素。必需。
- `PopoverContent`：面板本身，通过 portal 渲染，定位在触发元素旁边。必需。
- `PopoverHeader`：一行，放 `PopoverTitle` 和可选的 `PopoverClose`。
- `PopoverTitle` 和 `PopoverDescription`：标题和它下面的一句话。
- `PopoverSeparator`：面板各部分之间的细线。
- `PopoverClose`：关闭弹出层的按钮。
- `PopoverArrow`：可选的、指向触发元素的箭头。
- `PopoverBackdrop`：面板背后的透明层，用来接住面板外部的点击。
- `PopoverPortal`、`PopoverViewport` 和 `PopoverPopup`：更底层的部件。`PopoverPopup` 是不带定位的面板表面。

## 行为 {#behavior}

- 弹出层在触发元素下方打开，与它的起始边对齐，碰到窗口边缘时会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 点击外部和按 Esc 都会关闭它。Cancel 按钮也会关闭它。
- 它没有遮罩；背后的页面保持原样。

## 内容 {#content}

- 按钮标签用 Title Case，确认按钮重复动词：Snooze、Rename（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- Popover 包装 Base UI 的 Popover。它给面板加上 `dialog` 角色，打开时把焦点移进面板，按 Esc 时把焦点还给触发元素。
- 给面板命名：`PopoverTitle` 就是它的标签。没有可见标题时，在 `PopoverContent` 上加 `aria-label`。
- 只有图标的触发元素要有 `aria-label`。

## 规则 {#rules}

- 弹出层宽 300px，内边距 16px。
- 不要在弹出层里放粉色按钮。确认用墨色描边按钮（`variant="outline"`），取消用 `variant="ghost"`：弹出层只是一个小步骤，不是屏幕上的主操作。
