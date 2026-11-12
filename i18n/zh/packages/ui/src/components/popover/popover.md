---
title: Popover
summary: 在人点击的元素旁边打开的小面板，用于少量输入，比如一个选项、一个输入框和一个按钮。
sourceHash: 516e05d2
---

# Popover

弹出层是在人点击的元素旁边打开的小面板，用来放少量输入：几个选项中选一个、一个输入框、一个按钮。暂缓一条通知或给某样东西改名，一个弹出层就装得下。点击外部或按 Esc 时关闭。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 悬停时关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 悬停时显示一个人或 Agent 的概要，带链接 | [PreviewCard](../preview-card/preview-card.md) |
| 悬停时显示应用链接到的条目的详情 | 条目卡片（[PreviewCard](../preview-card/preview-card.md#item-card)） |
| 点击后做一个小选择或少量输入（暂缓、改名） | Popover，配合 [RadioGroup](../radio-group/radio-group.md)、[Input](../input/input.md) 和按钮 |
| 一组操作 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 保持打开、可以滚动的内容 | [Drawer](../drawer/drawer.md) |

哪种浮层适合做什么，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `Popover`：根组件。管理打开状态。必需。
- `PopoverTrigger`：打开它的元素。必需。
- `PopoverContent`：面板本身，通过 portal 渲染，定位在触发元素旁边。`size="item"` 让它成为关于一个应用条目的弹出层（[关于一个条目](#about-an-item)）。必需。
- `PopoverHeader`：一行，放 `PopoverTitle` 和可选的 `PopoverClose`。
- `PopoverTitle` 和 `PopoverDescription`：标题和它下面的一句话。
- `PopoverBody`：面板的文字，一个 `PopoverTitle` 和一个 `PopoverDescription`，离面板边缘 16px（关于条目的弹出层里是 12px）。实验性，从 `@botiverse/raft-ui/wip` 引入。
- `PopoverActions`：面板末尾的按钮，在 `PopoverBody` 下面：先放离开的按钮，再放确认按钮。实验性，从 `@botiverse/raft-ui/wip` 引入。
- `PopoverSeparator`：面板各部分之间的细线。
- `PopoverClose`：关闭弹出层的按钮。
- `PopoverArrow`：可选的、指向触发元素的箭头。
- `PopoverBackdrop`：面板背后的透明层，用来接住面板外部的点击。
- `PopoverPortal`、`PopoverViewport` 和 `PopoverPopup`：更底层的部件。`PopoverPopup` 是不带定位的面板表面。
- `isInsideOverlay(node)`：一个节点是否在 raft-ui 的浮层里，这个弹出层或其他任何浮层；`closestOverlay(node)`：那个浮层的 portal 容器（[在浮层里](#inside-an-overlay)）。

## 行为 {#behavior}

- 弹出层在触发元素下方打开，与它的起始边对齐，碰到窗口边缘时会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 弹出层避开窗口安全区：外壳为自己保留了窗口的一部分时（`--raft-frame-inset-top`、`--raft-frame-inset-start`、`--raft-frame-inset-end`），它停在离那一部分 8px 的地方，而不是离窗口边缘 8px（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。网页一个都不设。
- 点击外部和按 Esc 都会关闭它。Cancel 按钮也会关闭它。
- 它没有遮罩；背后的页面保持原样。

### 在浮层里 {#inside-an-overlay}

面板被 portal 到打开它的那棵树之外，所以在面板里按下时，`region.contains(event.target)` 为 false，即使这个弹出层属于这个区域。页面自己的处理函数必须不理会浮层的事件时（页面上的快捷键、在区域外按下就关闭区域、从行里开始的拖动），用 `@botiverse/raft-ui` 的 `isInsideOverlay(event.target)` 判断：节点在任何 raft-ui 浮层（弹出层、菜单、选择列表、组合框、工具提示、预览卡片、通知中心、对话框、警告对话框、抽屉、图片查看器或轻提示）里时，它为 `true`；节点属于页面，或为 `null` 时，它为 `false`。文本节点按它的父元素算。

- 处理函数需要的是浮层本身，而不只是有没有浮层时，用 `closestOverlay(event.target)`：节点所在的最内层浮层的 portal 容器，或 `null`。比如，`closestOverlay(target)?.contains(region)` 能判断在浮层里的一次按下，是否和页面画在这个浮层里的某个区域在同一个浮层里。
- 每个 `…Portal` 部件都用 `data-raft-ui-overlay` 标记它的容器，从另一个浮层打开的浮层会被 portal 进那个浮层的容器，所以它同时在两者里面。通过 `isInsideOverlay` 读取它，不要读 Base UI 自己的 `[data-base-ui-portal]`，那是 Base UI 内部的东西。
- 给了页面自己的 `container` 的浮层，仍在它的 portal 容器里。应用自己的 portal（`createPortal`）和 `DragLift` 的副本不是浮层。

## 内容 {#content}

- 按钮标签用 sentence case，确认按钮重复动词：Snooze、Rename（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- Popover 包装 Base UI 的 Popover。它给面板加上 `dialog` 角色，打开时把焦点移进面板，按 Esc 时把焦点还给触发元素。
- 给面板命名：`PopoverTitle` 就是它的标签。没有可见标题时，在 `PopoverContent` 上加 `aria-label`。
- 只有图标的触发元素要有 `aria-label`。

## 规则 {#rules}

- 弹出层宽 300px，内边距 16px。关于一个应用条目的弹出层是例外（`size="item"`，[关于一个条目](#about-an-item)）。
- 不要在弹出层里放粉色按钮。确认用墨色描边按钮（`variant="outline"`），取消用 `variant="ghost"`：弹出层只是一个小步骤，不是屏幕上的主操作。

## 关于一个条目 {#about-an-item}

关于一个应用条目的弹出层，比如应用的链接在显示预览之前提的那个问题（[PreviewCard](../preview-card/preview-card.md#item-card)），用 `size="item"`：它宽 400px，`PopoverBody`、`PopoverTitle` 和 `PopoverActions` 取消息里卡片的部件，带 12px 内边距和 `text-subhead` 标题。读者允许这个应用之后，标签片打开的是条目卡片，这个弹出层代替的就是它，所以看起来像那张卡片，而不像其他弹出层（stdrc，2026-11-10）：弹出层归属于它讲的东西那一家（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md#popovers)）。其他弹出层，带输入框、选项或简短确认的，保持 300px 和 16px：它是一个独立的小步骤，不是条目。
