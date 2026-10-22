---
title: ListRow
summary: 用于详情页上的人和 agent、设置和快捷入口的行：前导块、标题和预览、时间和一个徽标。
sourceHash: 4abe55b7
---

# ListRow

ListRow 是列表里的一行：一个人、一个 agent、一项设置，或者通往另一个页面的快捷入口。整行都是点击目标。详情页或个人资料页上的 agent 和人、以及设置，都用它。Raft Chat 在手机上列出地方的列表（主页、成员、设置列表）则用侧边栏行（[选择组件](../../../../../design/components/overview.md#rows)）。

```example
list-row/compositions/conversations
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 手机列表里的频道、私信和成员 | 侧边栏行（[Sidebar](../sidebar/sidebar.md)），和 Raft Chat 一样 |
| 搜索结果里的频道和人 | ListRow，通过搜索结果行使用（[Search](../search/search.md)） |
| 个人资料页或详情页（比如计算机详情）上的 agent 和人 | 放在 `ListRowGroup` 里的 ListRow（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)） |
| 桌面端侧边栏的一行 | 侧边栏行（[Sidebar](../sidebar/sidebar.md)） |
| 动态和通知 | [InboxItem](../inbox-item/inbox-item.md) |
| 一个任务 | [TaskCard](../task-card/task-card.md) |

## 结构 {#anatomy}

- `ListRow`：行本身。默认是 `button`；要跳转到别处的行渲染成链接。
- 前导块：[Avatar](../avatar/avatar.md)、频道图块（[IconTile](../icon-tile/icon-tile.md)）或 20px 的 `ListRowIcon`。可选。
- `ListRowBody`：文字列。必需。
  - `ListRowTop`：`ListRowTitle`，然后是 `ListRowMeta` 里的时间。
  - `ListRowBottom`：`ListRowDescription` 里的预览，然后最多一个徽标。
- 尾部：设置项的 `ListRowValue` 和 `ListRowChevron`，或一个 [Switch](../switch/switch.md)。可选。
- `ListRowGroup`：内嵌分组，把若干行包在一张卡片里。可选。

在 `plain` 行里，两端的元素都以整行居中，无论有没有描述：前导的图标、头像或方块，以及尾部的值、V 形箭头、开关、复选框或单选按钮。一个设置读起来是一个整体，它的控件属于整行，而不是属于标题。它们各自保持原尺寸，行高是内边距加上最高的那部分：手机上只有标题、带开关时是 54px（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 一个对话、一个人或一个 agent：前导块、标题、预览、时间和徽标。高度至少 64px |
| `variant="plain"` | 一项设置：可选的图标、标题（及其后果），然后是当前值和 V 形箭头，或一个开关。一行文字时高 48px |
| `variant="entry"` | 列表顶部通往另一个页面的快捷入口（手机主页上的「收藏」）：20px 图标和名称，右侧是徽标或灰色计数。高 48px |

```example
list-row/compositions/settings
```

```example
list-row/compositions/entries
```

## 状态 {#states}

`tone` 表示这个地方对这个人意味着什么。通用状态见[状态](../../../../../design/foundations/states.md)。

| 状态 | 用于 |
| --- | --- |
| `tone="unread"` | 这里有东西在等：标题加粗，预览用 `foreground`，`ListRowBottom` 里显示粉色计数。有人提及这个人时，黄色的 @ 标记取代计数（[Badge](../badge/badge.md)） |
| `tone="muted"` | 这个人把它设为免打扰：标题用 `foreground-muted`。在标题后加 `bell-off` 图标，未读用 `ListRowMeta` 里的灰色计数表示，而不是粉色徽标 |
| `tone="away"` | 这个人还没加入：标题和预览用 `foreground-hint` |
| `selected` | 在列表旁边打开的那一项：`info-soft` 底色，没有悬停效果 |
| `disabled` | 所有部分都用 `foreground-disabled`；没有 tone，没有未读或免打扰标记，没有悬停或按下效果，填充也不变 |

```example
list-row/compositions/tones
```

## 行为 {#behavior}

- 行与行之间用 `line-hairline` 分隔。默认变体里，线从文字开始的地方起；设置列表里，线从行的边缘（16px）起；入口行之间没有线，因为它们是一组按钮，不是内容列表。
- 整行都是点击目标：悬停时整行盖上浅一级的 `fill-subtle`，按下时盖上中档（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。行打开的菜单还在时（`data-popup-open`：右键菜单，或手机上的长按），无论是否悬停，也盖上 `fill-subtle`；选中的行保持选中样式。
- 如果一行的点击目标只有它自己的控件（比如带开关的设置项），就设置 `interactive={false}`：它渲染为普通元素，没有悬停或按下效果。见[状态](../../../../../design/foundations/states.md)。

## 内容 {#content}

- 预览以说话的人开头："Wug: Release notes are drafted."
- 一行里最多一个徽标。
- 时间和计数用 Space Mono；`ListRowMeta` 会处理这一点。
- 设置项的后果写在带 `wrap` 的 `ListRowDescription` 里，这样不会被截断。

### 分组标题 {#group-headings}

一组行上方可以有一个标题，比如 Channels。

- 用 sentence case，字号 `text-footnote`，字重 700，颜色 `foreground-hint`（[字体排印](../../../../../design/foundations/typography.md#casing)）。
- 分组可以折叠时，把标题做成带 `aria-expanded` 的按钮，折叠后显示行数。
- 分组的操作放在右侧，做成悬停时出现下划线的墨色文字按钮（[TextLink](../text-link/text-link.md)）：Browse。

raft-ui 还没有为这类列表导出标题部件。

## 无障碍 {#accessibility}

- `ListRow` 使用 Base UI 的 `useRender`，渲染原生 `button`（或你通过 `render` 传入的链接），所以可以用 Tab 到达这一行，用 Enter 或 Space 激活。设置 `interactive={false}` 时它是 `div`，只有里面的控件能获得焦点。
- 无障碍名称就是行里的文字。只有数字或图标的徽标要加无障碍名称：`aria-label="3 unread"`、`aria-label="Mentions you"`。
- `selected` 只改变外观。要自己在行上设置 `aria-current` 或 `aria-selected`。
- 设置行里的开关用行标题作标签（`aria-labelledby`）。
- `ListRowIcon` 和 `ListRowChevron` 对辅助技术隐藏。

## 规则 {#rules}

- 不要给行或分组加墨色边框或阴影：列表是内容，墨色边框表示控件（[颜色](../../../../../design/foundations/color.md#lines)）。
