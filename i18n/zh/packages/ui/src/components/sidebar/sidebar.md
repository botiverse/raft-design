---
title: Sidebar
summary: 桌面端导航条旁边的一列，列出选中的目的地里有什么，每一行标出你在哪里、什么未读、什么提及了你。
sourceHash: c3d714de
---

# Sidebar

侧栏是桌面端导航条和主区域之间的一列。它列出 [AppRail](../app-rail/app-rail.md) 上选中的目的地里有什么，比如频道、Agent 和人。它的头部写着目的地的名称，每一行显示你在哪里、什么未读、什么提及了你。

```example
sidebar/sidebar
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 桌面端一个目的地的内容 | Sidebar |
| 手机上同样的列表 | Sidebar 的行，直接放在页面上；低于 `md` 时行高 44px |
| 目的地本身 | [AppRail](../app-rail/app-rail.md) |
| 动态和通知 | [InboxItem](../inbox-item/inbox-item.md) |

哪些目的地有侧栏、每个侧栏列出什么，由产品决定（[Raft Chat](../../../../../design/products/raft-chat/README.md)）。没有侧栏的目的地，把内容直接放在导航条旁边（[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)）。

## 结构 {#anatomy}

- `SidebarRoot`：这一列，在 `layer-sidebar` 上，右边缘有一条 `line-seam`。
- `SidebarHeader`：56px 的头部，有一个 `SidebarHeaderTitle`；有人在工作时，右侧显示工作摘要。
- `SidebarBody` 和 `SidebarContent`：滚动的列表。
- `SidebarSection`：一组行。
  - `SidebarSectionHeader`：包含一个 `SidebarSectionDisclosure`（收起这一组的按钮，带 `SidebarSectionChevron`、`SidebarSectionTitle` 和 `SidebarSectionCount`），以及放在 `SidebarSectionTrailing` 或 `SidebarSectionControls` 里的 `SidebarSectionControl` 按钮，比如 New。`SidebarSectionAttention` 是这一组的粉色像素点。
  - `SidebarList`：这些行。这一组为空时，由 `SidebarSectionEmpty` 代替它们。
- `SidebarMenu`，带 `SidebarMenuIcon`、`SidebarMenuTitle`、`SidebarMenuAside` 和 `SidebarMenuCount`：分组标题里的单个目的地，比如 Saved（收藏）。
- `SidebarGroupLabel`：不能收起的普通分组标题。
- `SidebarItem`：一行。
  - 最前面是一个 `SidebarItemChannelIcon`、一个 `SidebarItemIcon` 或一个 19px 的 [Avatar](../avatar/avatar.md)。
  - `SidebarItemContent`：`SidebarItemTitle`（名称）和可选的 `SidebarItemSubtitle`（描述）。
  - `SidebarItemAside`：跟在后面的内容：`SidebarItemMeta`、`SidebarItemMetaIcon`、`SidebarItemStatus`、未读的 `SidebarItemCount`（带 `SidebarItemThreadCount` 和 `SidebarItemCountSeparator`），或提及标记 `SidebarItemIndicator`。

```example
sidebar-item/compositions/channel-item
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| `active` | 一张黄色贴纸（`selected`，带墨色边，每个主题都一样），画在行的内缩形状上：你在这里。悬停时不变；按下时叠加 `sticker-medium` |
| `tone="unread"` | 名称加粗，`SidebarItemCount` 为粉色。有人提及这个人时，由黄色的 `SidebarItemIndicator` 代替数字 |
| `tone="muted"` | 一个 `bell-off` 的 `SidebarItemMetaIcon`，名称用 `foreground-muted`，未读数作为不显眼的文字放在 `SidebarItemMeta` 里 |
| `tone="away"` | 离线或未加入：名称用 `foreground-hint` |
| 菜单打开 | `data-popup-open`（右键菜单，或在手机上长按）：内缩形状上的 `fill-cell-hover`，和悬停是同一种填充，让菜单作用的那一行保持标记；`active` 的行仍然是贴纸（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)） |
| `interactive={false}` | 只用于显示的行，比如这台计算机，它的操作是里面的一个按钮：一个不响应悬停和按下的 `div` |

```example
sidebar-item/compositions/tones-item
```

## 行为 {#behavior}

- 侧栏宽 240px，可以在 200px 到 400px 之间拖动；在每个有侧栏的页面上都保持同一个宽度（[间距](../../../../../design/foundations/spacing.md#layout-widths)）。
- 名称只占一行，超出部分以省略号结尾。跟在后面的描述先让出空间；描述没了之后名称才会截断。
- 内容有两行的行（计算机的名称和它是否在运行 Agent）用 `wrap` 加 `SidebarItemContent stacked`：它从 38px 开始变高，文字离行的上下边 9px（在形状里面 7px），图标和第一行对齐。名称仍然只占一行。
- 收起的分组在 `SidebarSectionCount` 里显示它有多少行。
- Agent 工作时，它正在做的事代替它的运行时（[工作中的 Agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)），用 `text-footnote` 和 `foreground-muted`，最多占这一行的 58%。

## 内容 {#content}

- 头部标题用目的地的名称。
- 频道用一个单独的 `#` 图标标记，私有频道用 `lock`，Agent 和人用他们 19px 的头像。
- Agent 的运行时写在名称后面，用 Space Mono。

## 无障碍 {#accessibility}

- `SidebarRoot` 渲染为 `div`。把它渲染成 `aside` 或 `nav`，并按目的地命名：`aria-label="Chat"`。
- `SidebarItem` 渲染为 Base UI 的 Button。用于跳转的行要渲染成链接（`render={<a href="…" />}`），并在 `active` 的行上设 `aria-current="page"`：`active` 只改变外观。
- 给未读数一个说明它数的是什么的名称（「2 unread」），给只有图标的 `SidebarItemMetaIcon` 一个名称（「Muted」）。
- `SidebarSectionDisclosure` 是 Base UI 的 Collapsible 触发器，会设置 `aria-expanded`。
- 在只用于显示的行上，焦点只落在里面的控件上。

## 规则 {#rules}

- 每个分组里的行都用同样的画法：原有分组、置顶分组还是自定义分组都一样。分组从不改变行的样子（不在某个分组里换行，也不在某个分组里隐藏描述），否则同一个会话看起来会像两个不同的东西。
- 不要用 `wrap` 让名称折成多行，置顶分组里也不行。只在内容有两行的行上使用它。
- 行与行之间不画线。一行是一个列表单元格（[列表](../../../../../design/patterns/lists.md)）：它横跨侧栏的整个宽度，它的悬停、按下、菜单打开时的填充、黄色贴纸和焦点环都画在同一个圆角形状上，这个形状和行一样高，离两边各内缩 8px。`SidebarList` 是一列，间隔 2px，上下各 8px，所以两行都有填充时中间露出 2px，第一个形状在分区标题下方 8px，而分区标题的文字下面没有内边距；把一个分区的行放进它里面。正因为这样，`SidebarContent` 没有侧边内边距；它的分组标签、分区标题和分区为空时的那一行从 20px 处开始，也就是行内容开始的地方。`SidebarRoot` 在任何宽度都把这一列的边距设为 20px，所以在手机上 `SidebarHeader` 也从那里开始（[列表](../../../../../design/patterns/lists.md#one-edge)）。
- 行的内容以形状为基准留内边距：起始端和末端都在形状里面 12px，离侧栏的边 20px（[列表](../../../../../design/patterns/lists.md#rules)）。图标或头像从形状的内侧起点开始；时间、计数、@ 贴纸和任何末尾的标记都止于形状的内侧末端，所以没有哪一个碰到形状或选中贴纸的墨色边（贴纸自己 1.5px 的外边会留下 10.5px）。这是设计评审定为参考的网页侧栏行：形状离侧栏两边 8px，末尾的计数在形状里面 12px（那里是 11.5px）。不要给滚动容器或行加侧边内边距：不管加在哪一个上，都会让形状或内容偏离这条规则。
- 键盘焦点是形状上 2px 的内缩焦点环。在 `active` 的行上，它在贴纸的墨色边里面。
- 桌面端每一行高 38px（形状一样高），用 `text-subhead`。低于 `md` 时，行会自动长到至少 44px，用 `text-body`、字重 600：这时它是手机上的地点列表（Home、Members、Settings 列表），需要手指能点中。不要在调用处另加手机尺寸。Settings 列表在手机上曾经是 36px，因为尺寸写在一个产品类里，而只有 Home 的行用了这个类。
- 不要把服务器切换器放在侧栏头部。它在网页顶栏里；没有顶栏时，在导航条顶部。
- 不要用 `SidebarLiveActivity` 在侧栏底部做实时条。工作中的 Agent 改为显示在头部的工作摘要和它们自己的行里（[工作中的 Agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)）。
