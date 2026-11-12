---
title: ListRow
summary: 用于详情页上的人和 Agent、设置和快捷入口的行：前导块、标题和预览、时间和一个徽标。
sourceHash: 4808b26b
---

# ListRow

ListRow 是列表里的一行：一个人、一个 Agent、一项设置，或者通往另一个页面的快捷入口。整行都是点击目标。详情页或个人资料页上的 Agent 和人、以及设置，都用它。Raft Chat 在手机上列出地方的列表（主页、成员、设置列表）则用侧栏行（[选择组件](../../../../../design/components/overview.md#rows)）。

```example
list-row/compositions/conversations
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 手机列表里的频道、私信和成员 | 侧栏行（[Sidebar](../sidebar/sidebar.md)），和 Raft Chat 一样 |
| 搜索结果里的频道和人 | ListRow，通过搜索结果行使用（[Search](../search/search.md)） |
| 个人资料页或详情页（比如计算机详情）上的 Agent 和人 | 放在 `ListRowGroup` 里的 ListRow（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)） |
| 桌面端侧栏的一行 | 侧栏行（[Sidebar](../sidebar/sidebar.md)） |
| 动态和通知 | [InboxItem](../inbox-item/inbox-item.md) |
| 一个任务 | [TaskCard](../task-card/task-card.md) |

## 结构 {#anatomy}

- `ListRow`：行本身。默认是 `button`；要跳转到别处的行渲染成链接。
- 前导块：[Avatar](../avatar/avatar.md)、频道图块（[IconTile](../icon-tile/icon-tile.md)）或 20px 的 `ListRowIcon`。可选。
- `ListRowBody`：文字列。必需。
  - `ListRowTop`：`ListRowTitle`，然后是 `ListRowMeta` 里的时间。
  - `ListRowSubtitle`：关于这一行所指对象的数据，放在标题下面：Agent 的描述、人的角色、频道的话题、应用的署名。可选。
  - `ListRowBottom`：`ListRowDescription` 里的预览，然后最多一个徽标。
- 尾部：设置项的 `ListRowValue` 和 `ListRowChevron`，或一个 [Switch](../switch/switch.md)。可选。
- `ListRowGroup`：内嵌分组，把若干行包在一张卡片里。可选。一个分区里可以有不止一个（[一个分区里的多个分组](#more-than-one-group-in-a-section)）。
- `ListRowSkeleton`：列表加载时代替 `ListRow` 的行（[加载中](#loading)）。可选；实验性，来自 `@botiverse/raft-ui/wip`。

在 `plain` 行里，两端的元素都以整行居中，无论有没有描述：前导的图标、头像或方块，以及尾部的值、V 形箭头、开关、复选框、单选按钮或按钮。一个设置读起来是一个整体，它的控件属于整行，而不是属于标题。它们各自保持原尺寸，行高是内边距加上最高的那部分：手机上只有标题、带开关时是 54px（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。

立即生效的设置在 `ListRowBody` 末尾放一行 [SaveStatus](../save-status/save-status.md)，在改动失败之前它不占空间：行和没有它时一样高，两端以整行居中。改动失败时，错误出现在描述下方 4px 处，行高增加这一行，两端仍以整行居中，下移这一行高度的一半。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 一个对话、一个人或一个 Agent：前导块、标题、预览、时间和徽标。用鼠标时高度至少 64px，在手机和触屏上至少 56px。它在触屏上更紧凑，和控件正好相反：控件会变大以达到 44px 的点击区域，而这一行本来就超过 44px，而且整行都是目标，所以在触屏上它的内容上下各留 8px，而不是 12px，手机屏幕上大约能多放一行 |
| `variant="plain"` | 一项设置：可选的图标、标题（及其后果），然后是当前值和 V 形箭头，或一个开关。最高部分的上下各 12px（`settings-row-inset`）：用鼠标时一行文字加一个开关高 46px，触屏上 54px |
| `variant="entry"` | 列表顶部通往另一个页面的快捷入口（手机主页上的「收藏」）：20px 图标和名称，右侧是徽标或灰色计数。高 48px |

```example
list-row/compositions/settings
```

### 属于上面那个设置的行 {#a-row-that-belongs-to-the-setting-above}

一个设置打开的东西，比如安静时段的开始和结束时间，或者一个服务器里有自己通知级别的那些频道，是紧挨在这个设置下面、同一分组里的单独一行。给它传 `attached`：它上方不画分隔线，作为 `plain` 行也没有顶部内边距，所以两者之间唯一的间距是这个设置自己 12px 的底部内边距。分隔线的意思是「另一个设置」，所以放在一个设置和属于它的东西之间，会把一样东西切成两半（cindyz，2026-11-10，#proj-raft-ui:4ae1a74e）。设置那一行保持原来的高度，它的开关仍以它自己的标题和描述居中。附属行之后的那一行是下一个设置，照常画它的分隔线。一个设置可以打开好几个附属行，比如有自己级别的频道每个一行：它们都不画分隔线，所以读起来是设置下面的一个列表。

本身就是点击目标的附属行，即带 V 形箭头或会打开菜单的行，最低保持控件高度：在手机和触屏上是 44px（没有顶部内边距时它只有 36px），桌面上用鼠标时是 34px，它本来就是这个高度（[点击区域](../../../../../design/foundations/accessibility.md#hit-targets)）。这样在触屏上它的文字会低几个像素；去掉的只有分隔线。

没有了分隔线，只有视觉把附属行和它的设置连在一起，所以也要为辅助技术把它们连起来，用设置的标题作名称（[无障碍](#accessibility)）：

- 只用于展示的附属行（`interactive={false}`），点击目标是它里面的控件，比如开始和结束时间：给它 `role="group"`，并用 `aria-labelledby` 指向设置标题的 id。屏幕阅读器移进这一行时，先读出设置「安静时段，组」，再读「开始时间」，控件保留它们自己的简短标签。这就是 `fieldset` 和它的 `legend`，只是不画出来。
- 可交互的附属行是按钮或链接，所以不能是一个组：用 `aria-describedby` 指向设置标题的 id。

```example
list-row/compositions/attached
```

### 一个分区里的多个分组 {#more-than-one-group-in-a-section}

设置的一个分区里可以有不止一个 `ListRowGroup`，按主题分开：在「外观」里，消息字号和它的预览是一组，控制应用显示什么的开关是另一组。把这些分组放在分区唯一的标题下面，排成一列，相隔 12px（`stack-y-3`），和标题到第一个分组的距离相同，中间没有分隔线连接。`ListRowGroup` 自己周围不设间距，所以由这一列来设（cindyz，2026-11-10，#proj-raft-ui:4ae1a74e）。

```example
list-row/compositions/groups
```

```example
list-row/compositions/entries
```

## 状态 {#states}

`tone` 表示这个地方对这个人意味着什么，或者一个操作有什么风险（[操作的风险](#an-actions-risk)）。通用状态见[状态](../../../../../design/foundations/states.md)。

| 状态 | 用于 |
| --- | --- |
| `tone="unread"` | 这里有东西在等：标题加粗，预览用 `foreground`，`ListRowBottom` 里显示粉色计数。有人提及这个人时，黄色的 @ 标记取代计数（[Badge](../badge/badge.md)） |
| `tone="muted"` | 这个人把它设为免打扰：标题和副标题用 `foreground-muted`。在标题后加 `bell-off` 图标，未读用 `ListRowMeta` 里的灰色计数表示，而不是粉色徽标 |
| `tone="away"` | 这个人还没加入：标题、副标题和预览用 `foreground-hint` |
| `selected` | 在列表旁边打开的那一项：`info-soft` 底色，没有悬停效果 |
| `disabled` | 所有部分都用 `foreground-disabled`；没有 tone，没有未读或免打扰标记，没有悬停或按下效果，填充也不变 |

```example
list-row/compositions/tones
```

### 操作的风险 {#an-actions-risk}

一行可以是一个操作，而不是一个地方：详情页或面板末尾的操作，比如频道详情末尾的「归档频道」「离开频道」和「删除频道」。这些是页面的危险区（[表单](../../../../../design/patterns/forms.md#danger-zone)），`tone` 表示这个操作有什么风险，名称和含义与 Button 相同（[用哪种颜色](../button/button.md#which-color)）：

| Tone | 用于 | 例子 |
| --- | --- | --- |
| `tone="warning"` | 会打断但可以撤销的操作：标题和前导图标用 `warning-strong`，橙色 | 归档频道、离开频道、停止所有 Agent |
| `tone="danger"` | 无法撤销的操作：标题和前导图标用 `danger-strong`，红色 | 删除频道、删除服务器 |

- 只有标题和前导的 `ListRowIcon` 带颜色。描述、值、V 形箭头以及悬停和按下的填充都和普通行一样：颜色标出的是有风险的操作，红色的填充或红色的说明会被读成错误（[反馈](../../../../../design/patterns/feedback.md)）。
- 颜色用文字可以用的 strong 色，从不用贴纸色 `warning` 或 `danger`：它们是墨色文字下面的填充色，在纸面上只有 2:1 到 3:1。`warning-strong` 和 `danger-strong` 在画布、卡片、弹出层和侧栏上，静止、悬停和按下时，在两种模式和每种主题下，都保持至少 4.5:1（`list-row.risk-contrast.test.ts`）。
- 风险 tone 需要可交互的行（`button`，或你通过 `render` 传入的链接）。只用于展示的行（`interactive={false}`）会忽略它：只有操作才有风险，什么都不做的行上的橙色或红色，是没有后果的颜色（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。禁用的行也会忽略它，和忽略所有 tone 一样：所有部分都是 `foreground-disabled`。
- 一行要么是地方，要么是操作，所以两类 tone 不会在同一行上同时出现，`tone` 接受其中任意一类。
- 这一行仍然会打开它的确认（[确认](../../../../../design/patterns/feedback.md#confirming)）：颜色在点击之前提醒，而带橙色或红色按钮的对话框才是人做出决定的地方。
- 不要给菜单里的操作上色（[DropdownMenu](../dropdown-menu/dropdown-menu.md#rules)）。菜单是人们扫一眼就关掉的短暂选项列表；危险区是页面末尾的固定位置，和人们常改的设置隔开，颜色在人们伸手去点之前告诉他们每个操作的代价。

原因：slock 的频道详情面板把它的操作放在一张由行组成的卡片里，并自己给标题上色（行上用 `text-warning-strong` 和 `text-danger-strong`，标题和图标上用 `text-current`），所以颜色、对比度和禁用状态都要由每个产品自己做对（slock 频道详情，stdrc/Jasper，2026-11-10，#proj-raft-ui:dae8db07）。

```example
list-row/compositions/actions
```

### 加载中 {#loading}

列表加载时，在那些行将要出现的地方显示 `ListRowSkeleton` 行；那些行有 `ListRowGroup` 的话，就放在同一个 `ListRowGroup` 里，并给列表加上 `aria-busy`。每一行都是同一 `variant` 的只读 `ListRow`，标题、时间和描述里各有一根横条，所以它和加载后的行一样高，分隔线也在同一位置（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。`default` 行有 35px 的前导块和描述；用 `leading` 和 `description` 打开或关闭它们，和那些行保持一致。等待超过 1 秒后才显示它们（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）；`ListRowSkeleton` 自己不会延迟。

```example
list-row/compositions/loading
```

## 行为 {#behavior}

- 行与行之间用 `line-hairline` 分隔。默认变体里，线从文字开始的地方起；设置列表里，线从行的边缘（16px）起；入口行之间没有线，因为它们是一组按钮，不是内容列表。`attached` 行上方没有线：它属于上面那一行（[属于上面那个设置的行](#a-row-that-belongs-to-the-setting-above)）。
- 整行都是点击目标：悬停时整行盖上浅一级的 `fill-subtle`，按下时盖上中档（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。行打开的菜单还在时（`data-popup-open`：右键菜单，或手机上的长按），无论是否悬停，也盖上 `fill-subtle`；选中的行保持选中样式。
- 手机上的地点和人的列表（对话、成员、进入其他页面的入口）传 `cell`：每一行都是一个列表单元格（[列表](../../../../../design/patterns/lists.md)）。它不画线，悬停（`fill-cell-hover`）、按下（`fill-cell-press`）、选中（`fill-cell-selected`）、菜单打开和键盘焦点都画在同一个圆角形状上，和行一样高，两侧各内缩 8px。把这些行放在一个 `flex flex-col gap-0.5 py-2` 的列里，让它们相隔 2px，第一个和最后一个形状离列表两端 8px。单元格的内容从它的形状算内边距，而不是从列表算：开头和末尾都在形状内 12px（离列表边缘 20px；桌面上用鼠标时在形状内 8px，离边缘 16px），所以图标、头像、时间和徽标都不会碰到形状（[列表](../../../../../design/patterns/lists.md#rules)）。设置行（没有 `cell`）保持离卡片边缘 16px。你自己做的一列 `cell` 行，在根元素上设 `[--column-margin:20px]`，让它的头部和工具栏在手机上也从各行内容的那条线开始（[列表](../../../../../design/patterns/lists.md#one-edge)）。
- 设置卡片（`ListRowGroup`，`variant="plain"`）保持上面的样子：行之间有线，填充横跨整行。它的行是作为一张卡片来读的固定表单，线把每个设置和下一个连起来；在卡片自己的边框里再放一个内缩的形状，会多画出第三条边。
- 如果一行的点击目标只有它自己的控件（比如带开关的设置项），就设置 `interactive={false}`：它渲染为普通元素，没有悬停或按下效果。见[状态](../../../../../design/foundations/states.md)。

## 内容 {#content}

- 预览以说话的人开头："Wug: Release notes are drafted."
- 一行里最多一个徽标。
- 时间和计数用 Space Mono；`ListRowMeta` 会处理这一点。标题先让位时它保持完整，仍然放不下才截断，所以放在里面的长值，比如 320px 的行里按钮旁的邮箱，会被截断，而不是跑到按钮下面。
- 设置项的后果写在带 `wrap` 的 `ListRowDescription` 里，这样不会被截断。

### 数据和说明 {#data-and-explanation}

一行里的文字要么是数据（这一行要展示的东西），要么是你写的说明。两者各有自己的部件，所以灰色文字在每一行上意思都一样（[颜色层级](../../../../../design/foundations/typography.md#color-tiers)）。

- 关于这一行所指对象的数据放在 `ListRowSubtitle` 里：Agent 或频道的描述、频道的话题、人的角色、应用的署名（「开发者工具 · 由 Linear 提供」）。它是主要数据，所以用标题的墨色，字重 400，字号小一级（`text-footnote`）：字号和字重已经把它和标题区分开，再加上颜色这第三种差异就多了（[较深表面上的备注](../../../../../design/foundations/typography.md#notes-on-deeper-surfaces)）。它和标题一起跟随地方的 tone 和禁用状态，截断为一行。风险 tone 只给标题上色（[操作的风险](#an-actions-risk)）。
- 时间、日期或灰色计数放在 `ListRowMeta` 里：这是这一行的次要数据，用提示层级的颜色和 Space Mono。行里没有别的灰色部件来放数据，所以不属于这几种的事实放在 `ListRowSubtitle` 里，从不放进你自己写的灰色 class 里。
- 你写来解释设置的句子放在 `ListRowDescription` 里：打开它会怎样、谁能看到、会失去什么。不要把数据放在那里：描述是这一行的说明部件。
- 对话的预览仍放在 `ListRowDescription` 里，和它的徽标一起放在 `ListRowBottom` 里：`tone="unread"` 正是靠它的墨色来标记这一行。

```example
list-row/compositions/people
```

### 分组标题 {#group-headings}

一组行上方可以有一个标题，比如 Channels。

- 用 sentence case，字号 `text-footnote`，字重 700，颜色 `foreground-hint`（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 不要在它旁边或下面加只是重复它名称的提示：写「我的偏好」，而不是「我的偏好」再加一句「仅对你可见」。只有提示告诉人们名称没说的东西时才加，比如一个上限（「最多 30 个」）（[写作](../../../../../design/content/writing.md#principles)）。
- 分组可以折叠时，把标题做成带 `aria-expanded` 的按钮，折叠后显示行数。
- 分组的操作放在右侧，做成悬停时出现下划线的墨色文字按钮（[TextLink](../text-link/text-link.md)）：Browse。

raft-ui 还没有为这类列表导出标题部件。

## 无障碍 {#accessibility}

- `ListRow` 使用 Base UI 的 `useRender`，渲染原生 `button`（或你通过 `render` 传入的链接），所以可以用 Tab 到达这一行，用 Enter 或 Space 激活。设置 `interactive={false}` 时它是 `div`，只有里面的控件能获得焦点。
- 无障碍名称就是行里的文字。只有数字或图标的徽标要加无障碍名称：`aria-label="3 unread"`、`aria-label="Mentions you"`。
- `selected` 只改变外观。要自己在行上设置 `aria-current` 或 `aria-selected`。
- 设置行里的开关用行标题作标签（`aria-labelledby`）。
- 用 `attached` 行所属设置的标题 id 给它命名：只用于展示的用 `role="group"` 和 `aria-labelledby`，可交互的用 `aria-describedby`（[属于上面那个设置的行](#a-row-that-belongs-to-the-setting-above)）。`ListRow` 没法替你做：只有你知道它属于哪个标题。
- `ListRowIcon` 和 `ListRowChevron` 对辅助技术隐藏。

## 规则 {#rules}

- 不要给行或分组加墨色边框或阴影：列表是内容，墨色边框表示控件（[颜色](../../../../../design/foundations/color.md#lines)）。
- 不要用你自己的 class 给行的文字上色：操作的风险用 `tone="warning"` 或 `tone="danger"`，它给标题和前导图标上色，保持它们的对比度，并在行禁用时把它们变灰（[操作的风险](#an-actions-risk)）。
