---
title: ContextMenu
summary: 针对某一个东西的操作菜单，在桌面端右键时于指针处打开，在触屏上长按时打开。
sourceHash: 5fe6437a
---

# ContextMenu

上下文菜单是针对某一个东西的操作菜单：在桌面端，它在人们右键的位置打开；在触屏上，它在人们长按的位置打开。它和这个东西的 ⋯ 按钮打开的 [DropdownMenu](../dropdown-menu/dropdown-menu.md) 是同一个菜单：同样的菜单项，同样的顺序。

```example
context-menu/context-menu
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 在消息、频道、任务或 Agent 上右键或长按 | ContextMenu |
| 同样的操作，从一个可见的按钮打开 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 在手机上对某个东西执行操作 | 长按打开的 ContextMenu，永远不用底部面板 |
| 随表单提交的值 | [Select](../select/select.md) |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

ContextMenu 的各部分与 DropdownMenu 相同，只是前缀换成 `ContextMenu`：`ContextMenuItem`、`ContextMenuItemLabel`、`ContextMenuShortcut`、`ContextMenuRadioGroup`、`ContextMenuRadioItem`、`ContextMenuCheckboxItem`、`ContextMenuLabel`、`ContextMenuSeparator`、`ContextMenuSubmenu`、`ContextMenuSubmenuTrigger`、`ContextMenuFooter`、`ContextMenuPortal` 和 `ContextMenuPopup`。它们的外观和行为见 [DropdownMenu](../dropdown-menu/dropdown-menu.md#anatomy)。它没有菜单项计数这一部分。

- `ContextMenu`：根元素。必需。
- `ContextMenuTrigger`：打开菜单的区域：消息、行、卡片。必需。
- `ContextMenuContent`：菜单本身，通过 portal 渲染，在指针处打开。必需。

## 状态 {#states}

高亮、当前值和禁用的菜单项与 [DropdownMenu](../dropdown-menu/dropdown-menu.md#states) 相同。

## 行为 {#behavior}

- 菜单在指针处打开，或在长按后的手指处打开，左上角对准那个位置。
- 如果菜单会超出窗口边缘，就平移到距窗口边缘至少 8px 以内，而不是翻转方向。
- 外壳给自己留了一部分窗口的地方（`--raft-frame-inset-top`、`--raft-frame-inset-start`、`--raft-frame-inset-end`）时，菜单与那部分保持 8px 的距离，而不是与窗口边缘保持 8px（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。网页一个都不设。
- 背后的页面滚动时，菜单停在打开的位置不动。
- 选择一个操作或单选项会关闭菜单，选择复选项时菜单保持打开，与 [DropdownMenu](../dropdown-menu/dropdown-menu.md#behavior) 相同。按 Esc 或点击菜单外部也会关闭。
- 菜单项的高度由内容决定，内边距固定，与 [DropdownMenu](../dropdown-menu/dropdown-menu.md#behavior) 相同（[表单](../../../../../design/patterns/forms.md#option-height)）。

## 内容 {#content}

菜单项的标签遵循 [DropdownMenu](../dropdown-menu/dropdown-menu.md#content)：用 Title Case，并且与菜单项打开的对话框用同样的词。

## 无障碍 {#accessibility}

- ContextMenu 封装了 Base UI 的 ContextMenu。它提供 `menu` 角色、菜单项的角色、方向键、输入首字母跳转和 Esc。
- 用 `ContextMenuContent` 上的 `aria-label`，按它所操作的东西给菜单命名（"Message from Wug"）。
- 键盘无法右键或长按。上下文菜单里的每个操作，也要能从一个可见的控件执行，通常是 ⋯ [DropdownMenu](../dropdown-menu/dropdown-menu.md)。

## 规则 {#rules}

- 上下文菜单和 ⋯ 菜单用同一份菜单项列表生成，这样两者永远不会出现差异。
- 桌面端和手机上用同一个菜单。不要为同样的操作另做一个手机端的底部面板。
- 遵循 [DropdownMenu](../dropdown-menu/dropdown-menu.md#rules) 的规则：破坏性的菜单项不加颜色，消息菜单里快捷回应放在最前面。
