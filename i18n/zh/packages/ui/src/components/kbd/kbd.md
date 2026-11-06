---
title: Kbd
summary: 用 Space Mono 字体把键盘按键放在键帽里，一键一帽：sm 作为菜单、工具提示、搜索入口和输入框里的提示，md 用于按键本身就是内容的地方，比如快捷键列表。
sourceHash: 4dbdb323
---

# Kbd

Kbd 把一个键盘按键放在键帽里显示，一键一帽。默认的 `sm` 是附在别的东西旁边的安静的元信息：菜单项、工具提示、搜索入口。在 `md` 下，按键本身就是内容，比如快捷键列表。`KbdShortcut` 根据键名画出整个快捷键，并按页面所在的平台来画。Kbd 本身从不是控件。

```example
kbd/compositions/sizes
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 快捷键列表，按键就是内容：快捷键面板、帮助、新手引导 | `size="md"` 的 `KbdShortcut` |
| 快捷键面板里可以修改的快捷键 | `md` 的 `KbdShortcut`，放在 [KbdButton](../kbd-button/kbd-button.md) 里 |
| 图标按钮的快捷键，放在它的工具提示里 | `sm` 的 `KbdShortcut`，放在 `TooltipContent` 里文字的后面（[Tooltip](../tooltip/tooltip.md)） |
| 打开搜索的快捷键 | `SearchTriggerShortcut`（[Search](../search/search.md)） |
| 让输入框获得焦点的快捷键 | 放在 [InputGroup](../input-group/input-group.md) 末尾的 `InputGroupAddon` 里的 `sm` Kbd |
| 正文里提到的按键或快捷键 | `sm` 的 `KbdShortcut` |
| 菜单项的快捷键 | `DropdownMenuShortcut` 或 `ContextMenuShortcut`，不画键帽（[DropdownMenu](../dropdown-menu/dropdown-menu.md)） |
| 代码、命令或文件名 | [InlineCode](../inline-code/inline-code.md) |

## 结构 {#anatomy}

- `Kbd`：键帽里的一个按键。渲染为 `kbd`。
- `KbdGroup`：装几个 `Kbd`，间隔 4px，用于逐键写出的快捷键，比如只在一个平台上有的快捷键。把它隐藏（`aria-hidden`），并在旁边用一个视觉隐藏的 span 用文字说出快捷键。
- `KbdShortcut`：根据键名画出的整个快捷键，`keys={["mod", "shift", "enter"]}`。它渲染一个 `KbdGroup`，每个键一个键帽，并给读屏软件提供用文字说出的快捷键。在 API 稳定之前，它从 `@botiverse/raft-ui/wip` 导出。

```example
kbd/compositions/group
```

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| `size="sm"`（默认） | 附在别的东西旁边的快捷键：工具提示、搜索入口、输入框插槽、正文。`text-mono-meta` 和 `foreground-hint`，3px 圆角的 `line-hairline` 细线框，没有底色。单独的 Kbd 和文字的行一样高，手机上 16px，桌面端 18px；在 `KbdShortcut` 和工具提示里，每个键帽都是 16px。 |
| `size="md"` | 快捷键列表，按键就是人要读的内容。24px 键帽，Space Mono 用 `text-mono-code` 的字号，`fill-muted` 底色上的 `foreground-muted`，`line-hairline` 细线框：13px 等宽字和旁边 14px 的标签看起来一样大。 |

`md` 用 `radius-sticker`，即行内标记的圆角（[Shape](../../../../../design/foundations/shape.md)）。`sm` 保留它一直以来的 3px 圆角，所以菜单、工具提示和搜索里已有的提示不变。线是 1px，不是墨线边框：Kbd 不是控件。

## 根据键名画快捷键 {#shortcuts-from-key-names}

按名字写按键，由 `KbdShortcut` 来画。它在客户端读一次平台（`useKeyboardPlatform`），在服务端和水合时按 `other` 画，所以服务端渲染的页面在 Mac 上水合之前显示 Ctrl。已知平台时，以及在文档和测试里，传 `platform="mac"` 或 `platform="other"`。

```example
kbd/compositions/platforms
```

| 键名 | macOS | Windows 和 Linux | 读作（macOS / 其他） |
| --- | --- | --- | --- |
| `mod` | Command 图标 | Ctrl | Command / Control |
| `meta`、`cmd`、`command` | Command 图标 | Win | Command / Windows |
| `ctrl`、`control` | Control 图标（`chevron-up`） | Ctrl | Control |
| `alt`、`opt`、`option` | Option 图标 | Alt | Option / Alt |
| `shift` | Shift 图标（`arrow-big-up`） | Shift | Shift |
| `enter`、`return` | Return 图标（`corner-down-left`） | Enter | Return / Enter |
| `backspace` | Delete 图标（`delete`） | Backspace | Delete / Backspace |
| `delete`、`del` | Del | Del | Forward Delete / Delete |
| `escape`、`esc` | Esc | Esc | Escape |
| `tab`、`space` | Tab、Space | Tab、Space | Tab、Space |
| `up`、`down`、`left`、`right` | 箭头图标 | 箭头图标 | Up Arrow… |
| 单个字符：`k`、`1`、`/` | K、1、/ | K、1、/ | K、1、Slash |
| `f1` … `f24` | F1 … F24 | F1 … F24 | F1 … F24 |

- 平台的命令键写 `mod`：在 Mac 上是 ⌘，在其他平台是 Ctrl。只有真正的 Control 键才写 `ctrl`，只有真正的 Command 键才写 `meta`，它在 Windows 和 Linux 上是 Windows 键。
- 键名不区分大小写，`KeyboardEvent.key` 的值也可以当键名用：`ArrowUp`、`Control`、`Meta`、`Escape`，空格写作 `" "`。别名按它所指的修饰键排序。
- 在一个平台上指同一个键的两个键名只画一个键帽，并在开发环境里输出警告：`["mod", "ctrl", "k"]` 在 Windows 和 Linux 上是 Ctrl K。空键名会被跳过，同样有警告。
- 不管怎么写，修饰键都按平台的顺序画：macOS 上是 ⌃ ⌥ ⇧ ⌘（Apple 的顺序），所以 `["mod", "shift", "enter"]` 画成 ⇧ ⌘ ↩；Windows 和 Linux 上是 Ctrl、Alt、Shift。其他按键按写的顺序跟在后面。
- 在 macOS 上，修饰键、Return、Delete 和箭头都是 Lucide 图标，`md` 下 14px，`sm` 下 12px，在键帽里居中。用来画 ⌘ ⇧ ↩ 的回退字体会让它们大小和基线各不相同。
- Esc 在所有平台都写作 Esc：Lucide 没有 Escape 图标，⎋ 也不常见。
- ASCII 字母大写；其他字符按原样写（ß 保持 ß，它的大写是两个字母）。字母和单词用同一个字号，裁切到大写字高（`text-box: trim-both cap alphabetic`），所以和图标居中在同一条线上。Firefox 还不支持 `text-box`：在那里文字按行框居中，和图标差 1px 左右。

## 间距与形状 {#spacing-and-shape}

- 一键一帽，键帽里从不放“+”。一组里的键帽间隔 4px。
- 在 `KbdShortcut` 里，同一尺寸的键帽高度相同，`md` 为 24px，`sm` 为 16px，宽度至少等于高度，所以单个按键是正方形。因此图标键帽没有左右内边距。单独的 `sm` Kbd 保持它所在行的高度和左右内边距。
- 在列表行里，快捷键放在行尾，在行内垂直居中，和文字至少隔 16px。

可选的快捷键写成两个 `KbdShortcut`，中间用 `foreground-hint` 的“/”连接，`md` 下两边各 6px，`sm` 下各 4px，并给读屏软件加一个视觉隐藏的“or”。`KbdShortcut` 只接受一个快捷键，所以分隔符由你来写：

```example
kbd/compositions/shortcuts-panel
```

## 行为 {#behavior}

- Kbd 不响应鼠标指针，也不能被选中：点击会落到它所在的行或按钮上。
- 在工具提示里，`sm` 键帽换用工具提示的 `foreground-on-hud` 颜色。工具提示在 Kbd 或 `KbdGroup` 前面留 6px，而不是在组里每个键帽前面留。不要把 `md` 放进工具提示：工具提示会强制使用 `sm` 的尺寸，但保留 `md` 的底色。

## 菜单 {#menus}

菜单里的快捷键不画键帽，和原生菜单一样：`DropdownMenuShortcut` 和 `ContextMenuShortcut` 是没有方框的 `sm` Kbd。它们以字符串接收快捷键；按平台的写法来写（Mac 上 ⌘⇧C，其他平台 Ctrl+Shift+C），这里没有键帽，所以“+”可以保留。

## 内容 {#content}

- 快捷键做什么，由旁边的标签来说。Kbd 是提示，不是标签。

## 无障碍 {#accessibility}

- Kbd 渲染原生的 `kbd` 元素，不添加角色。
- `KbdShortcut` 隐藏它的键帽（`aria-hidden`），在一个视觉隐藏的 span 里用文字说出快捷键，顺序和键帽画出的顺序一致：Mac 上是“Shift Command Return”，其他平台是“Control Shift Enter”。这些文字是英文；其他语言请用 `label` 传入产品自己的说法。
- 不要依赖 `kbd` 或 `span` 上的 `aria-label`：它们没有角色，读屏软件会忽略这个名称。自己用符号写的 Kbd 或 `KbdGroup` 要隐藏（`aria-hidden`），后面跟一个视觉隐藏的 span（`sr-only`），用文字说出快捷键：Command K。读屏软件读符号的方式不统一。
- 在可选的快捷键之间，隐藏“/”，并加一个视觉隐藏的“or”。

## 规则 {#rules}

- 不要让 Kbd 可以点击，也不要把它用作按钮的标签。可以修改的快捷键放在 [KbdButton](../kbd-button/kbd-button.md) 里，KbdButton 才是控件；它里面的键帽仍然是 Kbd。
- 把 Kbd 放在它所属内容的末尾：菜单项标签之后、工具提示文字之后。
- 用 `KbdShortcut` 时写键名，不写符号或“+”：由平台决定怎么画。
- 只在按键就是内容的地方用 `md`。在工具提示、菜单或输入框里的标签旁边，`md` 会比它服务的标签还显眼。
