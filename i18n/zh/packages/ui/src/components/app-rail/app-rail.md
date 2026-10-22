---
title: AppRail
summary: 桌面端最左侧的一列，在外框上、网页顶栏下方：产品的目的地在上，帮助和设置在下。
sourceHash: 7269a834
---

# AppRail

AppRail 是桌面端最左侧那一列目的地，在黄色外框上、网页顶栏下方。产品的目的地在上面，帮助和设置在底部；服务器和铃铛在顶栏里（[页面结构](../../../../../design/patterns/page-structure.md#the-web-top-bar)）。选中一个目的地，旁边的 [Sidebar](../sidebar/sidebar.md) 就显示它的内容。

```example
app-rail/compositions/with-top-bar
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 桌面端上产品的目的地 | AppRail |
| 手机上同样的目的地 | [MobileNav](../mobile-nav/mobile-nav.md) |
| 选中的目的地里有什么 | [Sidebar](../sidebar/sidebar.md) |

一个产品有哪些目的地、按什么顺序排列，写在它自己的页面上（[Raft Chat](../../../../../design/products/raft-chat/README.md)）。

## 结构 {#anatomy}

- `AppRailRoot`：这一列，在 `layer-frame` 上，右边缘有一条 `line-seam`。
- `AppRailHeader`：顶部 56px 的正方形，放工作空间图块。它的接缝线和侧栏、面板的接缝线对齐（[页面结构](../../../../../design/patterns/page-structure.md#headers)）。显示网页顶栏时省略。
- `AppRailNav`：目的地。
- `AppRailItem`：一个目的地：一个装着 20px 图标的 `AppRailItemIcon`，和一个写着名称的 `AppRailItemLabel`。
- `AppRailItemAttention`：一项上的粉色像素点，带有给辅助技术读的文字。基于 `AppRailItemIndicator` 构建。
- `AppRailItemBadge`：同一个角上的数字。不推荐使用，之后会移除：导航条图标只显示圆点，从不显示数字（[Badge](../badge/badge.md#rules)）。
- `AppRailFooter`：通知、帮助和设置。只有没有网页顶栏时通知才放在这里；有网页顶栏时，铃铛在顶栏里（[导航](../../../../../design/patterns/navigation.md#structure)）。

没有网页顶栏时（较旧的桌面端版本、嵌入在其他宿主里的应用、服务器的公开页面），导航条有带工作空间图块的头部，搜索是一个目的地，铃铛放在底部：

```example
app-rail/compositions/without-top-bar
```

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 只有图标（默认） | 目前所有产品。宽 56px 加接缝线；每一项是 40px 的正方形，名称显示在右侧的工具提示里 |
| 图标加标签 | 名称在图标下方，用 `text-label`（选中时加粗）。宽 68px 加接缝线；每一项是 60×52px，选中的贴纸包住图标和标签。底部的工具仍然只有图标，因为 "Notifications" 放不进图标下方 |

产品发布的是只有图标的导航条，raft-ui 也只实现了这一种（[待定问题](../../../../../design/decisions/open-questions.md#settled-by-the-product)）。带标签的导航条无法保持左上角是正方形（它是 68×56px），而产品用一个 UI 测试（`leftrail-square-slot`）固定了这个正方形。

## 状态 {#states}

- 选中：外框上的一张贴纸，浅色模式下是白色，深色模式下是黄色（[状态](../../../../../design/foundations/states.md)）。
- 提醒：图标右上角一个粉色像素点，从不显示数字。选中的项从不显示它，没有例外。
- 悬停和按下时，在该项上叠加 `fill-frame-medium`，即外框上的中档（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。选中的项悬停时不变。

## 行为 {#behavior}

- 导航区和底部的每一项都用同样的间距：项高 40px，间隔 6px，距导航条两端各 8px。不要把底部工具包进固定高度的格子里。
- 在头部下方，第一项从头部接缝线往下 8px 开始，和网页顶栏下方、导航条底部的 8px 一样，让导航条只有一种内缩距离。
- 有网页顶栏时，导航条没有头部，服务器移到顶栏里，作为工作空间按钮（[页面结构](../../../../../design/patterns/page-structure.md#the-web-top-bar)）。
- 窗口高度低于 600px 时，导航条随标题栏一起缩小（[响应式布局](../../../../../design/patterns/responsive.md)），各项与两端仍保持 6px。

## 内容 {#content}

- 每一项都要有名称，只有图标的导航条也一样。名称用 Title Case（[字体排印](../../../../../design/foundations/typography.md#casing)）。

## 无障碍 {#accessibility}

- `AppRailNav` 渲染为 `nav`。用 `aria-label="Primary"` 给它命名。
- `AppRailItem` 渲染为 Base UI 的 Button；`selected` 设置 `aria-pressed`。用于跳转的项要渲染成链接（`render={<a href="…" />}` 加 `nativeButton={false}`），并在选中的那一项上设 `aria-current="page"`：raft-ui 在链接上这两者都不设置。
- `AppRailItemLabel` 在视觉上隐藏，用来给该项命名。为鼠标指针用户，在右侧的 [Tooltip](../tooltip/tooltip.md) 里重复这个名称。
- 用 `AppRailItemAttention` 的 `title` 把提醒圆点写进该项的名称：「Activity, new」。像素点本身是 `aria-hidden`。
- 工作空间图块按服务器和它的作用命名：「Raft HQ, switch server」。

## 规则 {#rules}

- 工作空间图块用墨色，上面是黄色的服务器首字母。点击后在图块旁打开服务器列表（[用现有部件搭建](../../../../../design/components/overview.md#switching-servers)）。
