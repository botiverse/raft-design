---
title: Kbd
summary: 以提示的形式显示一个按键或快捷键，用 Space Mono 字体放在细线方框里，用于菜单、工具提示、搜索入口和输入框。
sourceHash: 4b2f90f4
---

# Kbd

Kbd 以提示的形式显示一个按键或快捷键：⌘K、Esc、⌫。它是附在别的东西旁边的安静的元信息，本身从不是控件。它用 `text-mono-meta` 和 `foreground-hint`，放在一个 `line-hairline` 方框里。

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 菜单项的快捷键 | `DropdownMenuShortcut` 或 `ContextMenuShortcut`，它们就是 Kbd（[DropdownMenu](../dropdown-menu/dropdown-menu.md)） |
| 图标按钮的快捷键，放在它的工具提示里 | `TooltipContent` 里的 Kbd，放在文字后面（[Tooltip](../tooltip/tooltip.md)） |
| 打开搜索的快捷键 | `SearchTriggerShortcut`（[Search](../search/search.md)） |
| 让输入框获得焦点的快捷键 | 放在 [InputGroup](../input-group/input-group.md) 末尾的 `InputGroupAddon` 里的 Kbd |
| 正文里提到的按键或快捷键 | Kbd |
| 代码、命令或文件名 | [InlineCode](../inline-code/inline-code.md) |

## 结构 {#anatomy}

- `Kbd`：一个按键，或者写成一个字符串的整个快捷键（⌘C）。渲染为 `kbd`。
- `KbdGroup`：装几个 `Kbd`，间隔 4px，用于逐键写出的快捷键。可选。

## 行为 {#behavior}

- Kbd 不响应鼠标指针，也不能被选中：点击会落到它所在的行或按钮上。
- 在工具提示里，Kbd 换用工具提示的 `foreground-on-hud` 颜色。

## 内容 {#content}

- 修饰键和编辑键写成符号，有名字的键写名字：⌘K、⌫、Esc。搜索和工具提示里的 ⌘K 也这样写。
- 快捷键做什么，由旁边的标签来说。Kbd 是提示，不是标签。

## 无障碍 {#accessibility}

- Kbd 渲染原生的 `kbd` 元素，不添加角色。
- 读屏软件读符号的方式不统一。`KbdGroup` 用符号拼出快捷键时，给它一个用文字说出快捷键的 `aria-label`：Command K。

## 规则 {#rules}

- 不要让 Kbd 可以点击，也不要把它用作按钮的标签。
- 把 Kbd 放在它所属内容的末尾：菜单项标签之后、工具提示文字之后。
