---
title: KbdButton
summary: 包住可修改快捷键的按钮，以及它录制中和无效时的样子；不能修改的快捷键仍然用 KbdShortcut。
sourceHash: e2ca8b16
---

# KbdButton

KbdButton 是快捷键列表里包住可修改快捷键的控件。它包着一个 `md` 的 `KbdShortcut`；点击后，它变成一个输入框，录下接下来按的快捷键。Kbd 本身从不是控件，所以悬停、焦点环和点击都由按钮承担，键帽仍是只读列表里显示的那些键帽。

```example
kbd-button/compositions/states
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 快捷键面板里人可以修改的快捷键 | 包着 `size="md"` 的 `KbdShortcut` 的 KbdButton |
| 人不能修改的快捷键：只读的、由应用菜单设定的、手机上的列表 | `md` 的 `KbdShortcut`，不加按钮（[Kbd](../kbd/kbd.md)）；在暂时还不能修改的地方，在它前面放一个锁形图标说明原因 |
| 一个操作的快捷键，放在它的工具提示或菜单项里 | `sm` 的 `KbdShortcut`（[Tooltip](../tooltip/tooltip.md)、[Kbd](../kbd/kbd.md#menus)） |
| 在几个固定的按键之间选一个，比如用 Enter 还是 ⌘ Enter 发送 | [SegmentedControl](../segmented-control/segmented-control.md) 或 [Select](../select/select.md)：没有要录制的东西 |

只在绑定可以修改的地方用它。什么也改不了的按钮，是一个启用着却没有作用的控件；只读的绑定仍然用 Kbd，这样列表一眼就能看出哪些快捷键可以修改。

## 结构 {#anatomy}

- `KbdButton`：原生按钮。必需。在里面放一个 `md` 的 `KbdShortcut`：静止时是当前的按键，录制时是目前已经按住的按键。
- `KbdButtonPlaceholder`：录制中的 KbdButton 在按下任何键之前显示的提示，由使用方提供（"Press a shortcut"）；或者没有快捷键的命令所显示的文字（"No shortcut"）。可选。
- `KbdButtonCaret`：按住的按键后面的插入符，表示输入框还在等更多按键。可选：按键已经落定、被拒绝，或被暂留等待选择时，就去掉它。

表示快捷键被改过的标记（行标签前的黄色圆点，以及行的第二行上它的默认快捷键）和 Reset 按钮属于行，不属于 KbdButton：它们是产品的状态。

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 静止 | 只有键帽，没有边框：列表读起来和只读列表一样。 |
| 悬停 | 按钮的 `radius-chip` 方框里铺中档叠加层，加一圈 `line-hairline`，方框在键帽四周各留 4px（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。 |
| 键盘焦点 | 同一个方框外面一圈焦点环。 |
| `recording` | 一个输入框：控件高度（用鼠标时 34px，触屏上 44px），`layer-card`，1.5px 的 `line-field` 边框，控件圆角；从键盘进入时还有焦点环；键帽距输入框起始边 8px。它会设置 `data-recording`。 |
| `invalid` | 键帽用 `danger-soft`，文字和线用 `danger-strong`；录制中的输入框边框用 `danger-strong`。它会设置 `data-invalid`。 |

用点击开始录制时，输入框不显示焦点环，就像用鼠标点击的文本输入框也不显示一样：它的边框、插入符和行的高亮已经标出了它，而且这个人刚刚就指着那里（[焦点](../../../../../design/foundations/states.md#focus)）。用 Enter 或 Space 开始时，保留焦点环。

插入符不闪烁：它标出下一个按键落在哪里；在供人阅读的列表里，闪烁是不带任何新信息的动效（[动效](../../../../../design/foundations/motion.md)）。

## 尺寸 {#sizes}

- 静止时，按钮的方框在键帽四周各超出 4px，包着 24px 的键帽，高 32px；再用负外边距把这 4px 收回来，所以键帽正好在只读 `KbdShortcut` 所在的位置：在行尾，在行内垂直居中，行高也不变。它的点击区域达到 44px（[无障碍](../../../../../design/foundations/accessibility.md)）。
- 录制时，输入框是控件高度，和旁边的输入框、按钮一样高；它的外边距收回比键帽多出的部分：用鼠标时是 (34 − 24) / 2 = 5px，触屏上是 10px。键帽和行的边缘之间至少要留这么多：ListRow 的 12px 就够（[ListRow](../list-row/list-row.md)）。输入框向起始端扩展，所以它的末端保持在行尾。

## 行为 {#behavior}

KbdButton 负责画出各个状态；录下按键由产品来做。

- 点击或按 Enter 开始录制。录制时，每次按键都是快捷键：阻止它的默认行为，实时显示按住的修饰键，在第一个不是修饰键的按键上落定快捷键。
- 按 Esc、点击别处或离开面板都会取消；在有效的快捷键落定之前，什么都不保存。
- 让不带修饰键的 Tab 离开输入框并取消，这样录制永远不会困住键盘。
- 不能用的按键（浏览器或系统保留的按键、单个按键）以 `invalid` 状态留在输入框里，原因写在行的第二行，直到下一次按键；录制保持开启。
- 属于另一个命令的按键先暂留，不保存：保留输入框，去掉插入符，在行下面附一条提示，带 Cancel 和各个选项（[Banner](../banner/banner.md#attached-to-a-list-row)）。

```example
kbd-button/compositions/shortcuts-panel
```

## 无障碍 {#accessibility}

- KbdButton 是 Base UI 的 Button，即原生 `button`。它自己没有文字：用 `aria-label` 按它对应的命令给它命名（"Change the shortcut for Search"）。键帽的视觉隐藏文字会被这个名称取代。
- 用 `aria-keyshortcuts` 传入当前的快捷键（`Meta+K`），让读屏软件能读出来；没有快捷键的命令就不要加。
- `data-recording` 和 `data-invalid` 是样式钩子，不会播报。把 `aria-describedby` 指向行的第二行，产品在那里写操作说明（"Press the new shortcut, Esc to cancel"）或拒绝这些按键的原因。
- 附在行上的提示关闭时，把焦点移回 KbdButton，以免焦点落在文档本身上。
- 不要加 `aria-pressed`：录制不是按下后一直保持开启的切换，标成按下的按钮传达的意思是错的。

## 规则 {#rules}

- 只在绑定可以修改的地方用 KbdButton，并且永远不要禁用它：不能修改的快捷键是不带按钮的 `KbdShortcut`。
- 每个 KbdButton 里放一个 `md` 的 `KbdShortcut`。可选的快捷键（"⌘↑ / ⌘↓"）是两个 KbdButton，中间是 "/"，和只读列表一样（[Kbd](../kbd/kbd.md#spacing-and-shape)）：每个都是独立的绑定。
- 不要在按钮里放标签、图标或 "+"：行的标签说明快捷键做什么，键帽就是值。
- 用文字说明按键被拒绝的原因，写在行的第二行，不要只靠危险色（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
