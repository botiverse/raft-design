---
title: Panel
summary: 桌面端主区域里的一栏，带 56px 的面板标题栏和自己滚动的内容；它的标题栏也是手机推入页面的顶栏。
sourceHash: fb07ec35
---

# Panel

面板是桌面端主区域里的一栏：上面是面板标题栏，下面是在这一栏内部滚动的内容。不管这一栏放的是对话、消息列、侧面板还是抽屉的内容，用的都是同一个标题栏。在手机上，`PanelHeader` 是推入页面的顶栏。

```example
panel/panel
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 桌面端主区域的一栏，或者它旁边的侧面板（任务、文件、个人资料） | Panel |
| 一段对话：标题栏、标签页、消息和消息输入框 | [ConversationPanel](../conversation-panel/conversation-panel.md)，基于 Panel 构建 |
| 对话旁边的消息列 | [ThreadPanel](../thread-panel/thread-panel.md) |
| 手机推入页面的顶栏 | `PanelHeader` |
| 导航条旁边，列出一个目的地里有什么的列表 | [Sidebar](../sidebar/sidebar.md) |
| 滑入并盖在页面上的详情或设置 | [Drawer](../drawer/drawer.md) |

屏幕上各个区域怎么排列，以及侧面板什么时候放在主区域旁边、什么时候盖住主区域，见[页面结构](../../../../../design/patterns/page-structure.md)和[响应式布局](../../../../../design/patterns/responsive.md)。

## 结构 {#anatomy}

- `Panel`：这一栏。`edge="attached"` 在左边缘画一条 `line-seam`，用于对话旁边的侧面板；`edge="inset"` 不画线。
- `PanelHeader`：56px 的标题栏，下方有一条 `line-seam`。必需。
  - `PanelHeaderIcon`：地点的位置图块，或人的头像。可选。
  - `PanelHeaderContent`：容纳 `PanelHeading` 和 `PanelMeta`。
  - `PanelHeading`：`PanelTitle`，后面可以跟 `PanelStatus`（Archived 这类标签）或 `PanelActivity`（实时状态，包着一个 [Status](../status/status.md)）。
  - `PanelMeta`：标题下面的一行描述。
  - `PanelActions`：末尾的 `PanelAction` 和 `PanelToggleAction` 按钮。
- `PanelSectionHeader`：用于分区级视图的同一种条。在手机上它放在外框上。
- `PanelHeaderRoot`：两种标题栏共同基于的那条 56px 的空白条，用于自己排版的标题栏。
- `PanelNotice`，以及 `PanelNoticeContent` 和 `PanelNoticeActions`：标题栏下方通栏的一条，用于这个面板里出现的问题。什么时候用它而不用横幅，见 [Banner](../banner/banner.md)。放在 `PanelNoticeContent` 前面的状态像素点或图标，跟它的第一行对齐（[文字前的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。
- `PanelBody`、`PanelScrollViewport` 和 `PanelScrollContent`：内容及它唯一的滚动容器。
- `PanelSection`：上方有一条细线的一块内容。
- `PanelFooter`：底部的操作区，为安全区域留出内边距。

```example
conversation-panel/compositions/conversation-panel-header
```

## 变体 {#variants}

| 标题栏 | 用于 |
| --- | --- |
| `PanelHeader` | 桌面端的每个面板标题栏；手机推入页面的白色顶栏 |
| `PanelSectionHeader` | 分区级视图。在手机上它放在 `layer-frame` 上，文字用 `foreground-on-frame`，并隐藏 `PanelHeaderIcon` |

手机推入页面的顶栏是白色的，上面的位置图块仍是黄色贴纸（[待定问题](../../../../../design/decisions/open-questions.md#settled-by-the-product)）。

## 状态 {#states}

- 按下的 `PanelToggleAction`，或带 `aria-pressed` 的 `PanelAction`，是一张黄色贴纸：它标出当前打开的侧面板。
- 其他状态遵循[状态](../../../../../design/foundations/states.md)。

## 行为 {#behavior}

- 标题栏固定不动；只有 `PanelScrollViewport` 滚动。
- 标题和描述各占一行，超出时用省略号截断。
- 在手机上，标题栏固定在页面顶部。
- 窗口高度小于 600px 时，标题栏和其他所有标题栏一起变矮（[间距](../../../../../design/foundations/spacing.md#heights)）。

### 手机顶栏 {#phone-top-bars}

手机顶栏的结构（一级页面的导航行；推入页面的返回按钮和最多 2 个图标按钮）见[页面结构](../../../../../design/patterns/page-structure.md#phone)。顶栏还遵循这些规则：

- 在一级页面上，把页面名称放在 56px 的那一行里，用 `text-headline`，不用大标题，前面也不放图标图块（[页面结构](../../../../../design/patterns/page-structure.md#phone)）。
- 不要在一级页面的顶栏里放 New 或 Search 按钮：搜索就是 Search 标签（[导航](../../../../../design/patterns/navigation.md#search-on-a-phone)）。
- 铃铛是通知中心的入口，有新内容时带一个粉色像素。在手机上，它只出现在第一个一级页面的顶栏里（[页面结构](../../../../../design/patterns/page-structure.md#phone)）。
- 返回用 `arrow-left` 图标，不用 V 形箭头：它的墨色和其他图标一样填满图标框，所以不用挪位置就能和另一端的按钮对称（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。

## 内容 {#content}

- 在 `PanelTitle` 里写地点、人或视图的名称。
- 地点在 `PanelHeaderIcon` 里放位置图块（[IconTile](../icon-tile/icon-tile.md)），人放这个人的头像。其他页面没有图标：由它们的 `PanelMeta` 说明它们属于哪里，比如消息列所在的频道。
- `PanelMeta` 先写实时的内容，再写数量："2 agents working · 5 members"（[正在工作的 agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)）。数字和 ID 用 Space Mono（[字体排印](../../../../../design/foundations/typography.md#usage)）。
- 名称上的标签（Experimental、Archived、Deleted）作为 `PanelStatus` 放在 `PanelHeading` 里，不要放在 `PanelMeta` 里：描述会被截断，截断会切掉标签的边。

## 无障碍 {#accessibility}

- `Panel` 渲染为 `section`。多个面板并排时，用 `aria-label` 或 `aria-labelledby` 给它命名。
- `PanelTitle` 渲染为 `div`。把它渲染成页面的标题（`render={<h1 />}`，如果页面已有 `h1` 就用 `h2`）。
- `PanelAction` 包装 Base UI 的 Button，总是渲染 `type="button"`。`PanelToggleAction` 包装 Base UI 的 Toggle，由它设置 `aria-pressed`。
- 每个只有图标的 `PanelAction` 和 `PanelToggleAction` 都要有 `aria-label`："Back"、"Channel Details"、"Close Tasks"。
- 只有图标的 `PanelStatus`（静音的铃铛）要有无障碍名称。

## 规则 {#rules}

- 每个面板都用这个标题栏：对话、消息列、侧面板和抽屉。不要给某个面板单独的标题栏或按钮尺寸。
- 标题栏里的图标按钮用 `PanelAction`：桌面端（768px 起、使用鼠标或触控板）是 32px，图标 18px，点击区域 44px，间隔 4px；手机上以及任何宽度的触屏上是 44px，图标 22px，间隔 2px。它们跟随默认控件高度（[间距](../../../../../design/foundations/spacing.md#heights)）。在桌面端，44px 的按钮放在 17px 的标题旁边显得太重；手指则需要 44px。
- 返回按钮放在标题栏最前面，操作放在最后，放进 `PanelActions`：标题栏会把首尾两个按钮往外拉，让它们的图标框（而不是按钮本身）落在内容边距上。这个边距在桌面端和桌面布局下的触屏上是 20px，在手机上是 16px，按钮尺寸不论大小都一样（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。不要自己加外边距去挪动边上的按钮。`PanelActions` 里只放 `PanelAction`：这个组声明了它们的内缩量，所以某个宽度下隐藏的操作（消息列的 Close 在 1024px 以下隐藏）会让下一个操作落到边上。作为标题栏第一个或最后一个子元素、尺寸为 `icon-md` 或 `icon-lg` 的无边框 `Button` 也会这样被拉出；有填充的按钮则让它的形状止于边距。
- 给 `PanelStatus` 在标题那一行单独一格，并按它的形状居中。不要微调它：标题的字母已经落在这一行的中线上，挪 1px 就会显得偏高。
- 用标题栏里的 `PanelToggleAction` 打开侧面板：再按一次就关闭。
- 对话旁边的侧面板设 `edge="attached"`，由它画出两者之间唯一的那条线（[页面结构](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)）。
