---
title: PersonList
summary: 弹出层里的人，每人一行紧凑的行（头像、名字和在做什么，一行或两行文字），点一行打开这个人。
sourceHash: 6a2db3a5
---

# PersonList

PersonList 在弹出层里列出人和 Agent，每人一行紧凑的行：头像、名字和此刻在做什么，或者是一个词，和名字在同一行（"viewing"、"read this version"），或者是一句话，放在第二行（"Editing Flow.tsx · #25"）。点一行打开这个人；无法打开的人，那一行什么也不打开。它是在弹出层里列出人的唯一方式：头像叠打开的那张列表（[Avatar](../avatar/avatar.md#a-stack-that-opens-a-list)），比如谁在看一份文档，以及 Working now（[正在工作的 Agent](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now)）。

```example
person-list/compositions/preview
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 头像叠代表的那些人，在它打开的弹出层里，每个人都能打开 | PersonList |
| 页面或面板上的人和 Agent，带一行预览（频道成员、一台计算机的 Agent） | [ListRow](../list-row/list-row.md)（64px；触屏上 56px） |
| 正在工作的 Agent，以及每个在做什么（[正在工作的 Agent](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now)） | PersonList，两行文字的行（[一行还是两行](#one-line-or-two)） |
| 对一个人的操作（Message、Remove from channel） | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 选择要添加的人 | [Combobox](../combobox/combobox.md) 或 [ChoiceList](../choice-list/choice-list.md) |

## 结构 {#anatomy}

- `PersonList`：列表，一个 `ul`。直接放进 `PopoverContent`；弹出层有标题时放在 `PopoverHeader` 下面，外面不套 `PopoverBody`。必需。
- `PersonListItem`：一个人，一个装着行的 `li`。行是 `button`；`render` 把它变成链接；`interactive={false}` 把它变成什么也不打开的 `div`。所有属性、`className` 和 `ref` 都给行。必需。
- 一个 `Avatar`，在行的最前面，带 `aria-hidden`：单行的行用 `size="xs"`，两行的行用 `size="sm"` 并带上它的 `AvatarBadge`（[一行还是两行](#one-line-or-two)）。头像由应用传入，所以它的尺寸跟着行的内容走。必需。
- `PersonListItemName`：名字。必需。
- `PersonListItemStatus`：这个人在做什么或做过什么，用一个词，放在名字后面。最多 2 个：最后一个在行尾，它前面的那个紧跟名字。可选；只用于单行的行。
- `PersonListItemContent`：两行的行的文字列，装着 `PersonListItemName` 和 `PersonListItemDescription`。名字在里面是粗体。
- `PersonListItemDescription`：这个人在做什么，用一句话，放在名字下面：`text-footnote`，`foreground-muted`，最多 2 行，超出用省略号截断。

## 变体 {#variants}

| 行 | 用于 |
| --- | --- |
| `PersonListItem` | 应用能打开的人：个人资料、Agent 的页面 |
| `PersonListItem render={<a />}` | 页面有地址的人，可以在新标签页打开 |
| `PersonListItem interactive={false}` | 无法打开的人：已删除的人或 Agent、系统行（Raft 本身） |

```example
person-list/compositions/not-openable
```

什么也不打开的行是 `div`：没有悬停、按下和焦点，Tab 会跳过它（[状态](../../../../../design/foundations/states.md#usage)，仅展示）。它的文字保持墨色，因为没有东西被禁用；已删除的人或 Agent 用头像表示，灰色并变淡（`grayscale` 加 `opacity-dimmed`，[状态](../../../../../design/foundations/states.md#dimmed)），再加一个说明这一点的状态。

### 一行还是两行 {#one-line-or-two}

| 行 | 用于 | 头像 |
| --- | --- | --- |
| 一行：名字和一个状态 | 谁在这里、做了什么，用一个词或一个时间：谁在看、谁读过 | `xs`（19px），不带灯 |
| 两行：粗体的名字，下面一句描述 | 每个人在做什么，每行一句不同的话：Working now | `sm`（27px），带它的在线状态灯 |

```example
person-list/compositions/working-now
```

- **状态是一个词或一个时间时用一行**，整张列表都是同样的几个词：行保持菜单项的高度，弹出层里能显示最多的人。
- **每行都有自己要说的话时用两行**，比如一个 Agent 当前这一步。一句话放不进 300px 弹出层里名字的旁边；当作状态，会把两者都截断。放在名字下面，它就有整行的宽度，2 行足够写下一步连同它的文件和任务编号（[正在工作的 Agent](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now)）。
- **两行的行里，头像用 `sm` 并带灯，名字用粗体。** 这一行讲的是每个 Agent 自己的工作，所以它的状态和名字在前，和 Agent 在其他地方的行一样；单行的行的头像和打开它的 19px 头像叠一样大。
- **一张列表里不要混用两种行。** 一张列表是同一类行（[同一类，同样大小](../../../../../design/foundations/spacing.md#the-same-kind-the-same-size)）。
- **两行的行不放状态**：状态要说的话写进描述。

## 尺寸和间距 {#size-and-spacing}

- **一行只有一行文字，和菜单项一样高：** `option-height`，桌面上用鼠标时 34px，触屏上 36px。它是弹出列表的行，是 44px 触控目标的那个例外：行横跨弹出层的宽度，彼此相隔 2px，点偏一点也落在某一行上；点错了只是打开一个看得见、能关掉的人（[间距](../../../../../design/foundations/spacing.md#hit-targets)）。ListRow 的 64px 是给页面上供人阅读的列表用的；放在 300px 的弹出层里，只能显示一半的人。
- **两行的行和它的内容一样高**，上下的内边距和单行的行相同（用鼠标时 6px，触屏上 8px）：一行描述时，用鼠标是 52px，触屏上 54px；两行描述时是 70px 和 72px。头像在行里垂直居中，和所有带描述的列表行一样（[对齐](../../../../../design/foundations/alignment.md#usage)）。
- **行是列表单元格**（[列表](../../../../../design/patterns/lists.md)）：悬停、按下和键盘焦点画在行内的同一个形状上，离弹出层两侧 8px，用 `radius-control`；行与行相隔 2px，第一个和最后一个形状离列表两端 8px。
- **内容在每种输入方式下都在形状里面 8px**，所以头像离弹出层边缘 16px，和它的标题、`PopoverBody` 里的文字在同一条线上。页面上的列表在触屏上把内容放在形状里面 12px，离边缘 20px，因为那一栏的头部从那里开始（[同一条边](../../../../../design/patterns/lists.md#one-edge)）；弹出层的头部和文字在所有屏幕上都从 16px 开始（[Popover](../popover/popover.md#rules)），所以它的行也是。
- **头像、名字和紧跟名字的状态之间 8px；行尾的状态前至少 16px。**

## 状态 {#states}

悬停在形状上铺 `fill-cell-hover`，按下铺 `fill-cell-press`，键盘焦点在形状上画 2px、`foreground` 色的内侧焦点环，和所有列表单元格一样（[列表](../../../../../design/patterns/lists.md#rules)）。焦点环只在键盘输入之后出现（[状态](../../../../../design/foundations/states.md#focus)）。

- 悬停是灰色，不是菜单的黄色高亮。黄色是方向键在列表里移动的那个光标（[状态](../../../../../design/foundations/states.md#hover-and-press)）；这张列表没有这样的光标，每一行各是一个 Tab 停靠点（[无障碍](#accessibility)）。

## 行为 {#behavior}

- 打开一个人时关掉弹出层：受控管理它的 `open`，在行的处理函数里设为 `false`，然后打开个人资料。这个人的页面取代了列表，列表还开着就会盖住它。
- 列表比弹出层的空间长时滚动：用带 `max-height` 的 [ScrollArea](../scroll-area/scroll-area.md) 包住 `PersonList`。不要按数量截断列表：头像叠的计数承诺了所有人。

## 内容 {#content}

- 名字写成应用在其他地方显示的样子；本人自己那一行写「You」（中文界面写「你」）。
- 状态要么写成跟在名字后面的小写短语（"viewing"、"read this version"），要么写成 sentence case 的标签（"Viewing"、"Updated since"）；一张列表里只用一种。时间写得短而相对，按列表行的写法（[列表](../../../../../design/patterns/lists.md#times-in-list-rows)）。
- 变化最多的状态（时间、"viewing"）放在最后，在行尾，眼睛顺着这一列往下看；只标出少数几行的状态（"Updated since"）放在名字旁边。
- 描述直接写这一步本身，用 sentence case，带上它针对的东西："Editing Flow.tsx · #25"。
- PersonList 没有自己的文字：名字、状态和描述都由应用作为 children 传入。

## 无障碍 {#accessibility}

- `PersonList` 是 `ul`，每个 `PersonListItem` 是 `li`，所以读屏软件会说出列表里有几个人。里面的行是原生 `button`（或用 `render` 传入的链接），用 Tab 到达，用 Enter 或 Space 打开。给弹出层起名字（`PopoverContent` 上的 `aria-label`，或一个 `PopoverTitle`），因为列表就是它的内容（[Popover](../popover/popover.md#accessibility)）。
- 行与行之间用 Tab 移动，不用方向键。方向键在复合控件里移动：菜单、单选组、标签页（[无障碍](../../../../../design/foundations/accessibility.md#focus-and-keyboard)）；一张可以打开的人的列表，是对话框里的一组按钮，用 `menu` 角色就会承诺菜单的按键和输入查找，而这些行并不是操作。
- 一行的名字就是它的文字，每个状态或描述前加一个逗号：「Martin, viewing」「Wug, updated since, 2 hours ago」「Bugen, Editing Flow.tsx · #25」。逗号由行画出，看不见，也不占位置，读屏软件会在名字和后面的内容之间停顿。
- 给头像加 `aria-hidden`：名字就在旁边，头像的首字母会在名字之前被读出来（「M Martin」）。它的在线状态灯也一起隐藏：在 Working now 里，弹出层的标题已经说明里面每个 Agent 都在工作。
- 一个是短时间的状态，只把完整日期放在提示里作为方便：在状态本身里，或在它视觉上隐藏的一部分里，用文字说出时间，因为行按钮里的提示只有指针能到达（[无障碍](../../../../../design/foundations/accessibility.md#focus-and-keyboard)）。

## 规则 {#rules}

- 弹出层里所有列出人的列表都用 PersonList，别处不用：页面或面板上的人是 [ListRow](../list-row/list-row.md)，它 64px 的行带一行预览。侧栏行代表的是一个地方，不是一个人（[行](../../../../../design/components/overview.md#rows)）。
- 单行的行用 `xs`（19px）头像：和打开这张列表的头像叠里的脸一样大，同一个人在两处是同一张图。两行的行用带灯的 `sm`（27px）头像。
- 无法打开的行用 `interactive={false}`，不要用禁用的按钮：它不是暂时不可用，而是背后没有人。
- 不要在行里加按钮：整行是唯一的目标。对一个人的操作放在他的个人资料或菜单里。
- 不要在列表外面加 `PopoverBody` 或内边距，也不要移动行里的内容：行自带 8px 的内缩和它里面的 8px。
