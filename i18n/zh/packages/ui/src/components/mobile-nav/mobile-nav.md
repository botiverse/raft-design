---
title: MobileNav
summary: 手机的标签栏：一级页面底部最多 5 个目的地，选中那一项的图标放在一张黄色贴纸里。
sourceHash: eb45aa4f
---

# MobileNav

MobileNav 是手机网页的标签栏：每个一级页面底部的一排产品目的地。选中的目的地的图标放在一张黄色贴纸里。推入页面会盖住它。iOS 和 Android 应用用各自系统的标签栏画同样的目的地（[导航](../../../../../design/patterns/navigation.md#what-each-platform-draws)）。

```example
mobile-nav/mobile-nav
```

## 何时使用 {#when-to-use}

| 情况                           | 用                                                           |
| ----------------------------------- | ------------------------------------------------------------- |
| 手机上一个产品的各个目的地 | MobileNav                                                     |
| 桌面端上同样的目的地    | [AppRail](../app-rail/app-rail.md)                            |
| 一个页面里的几个部分                | [Tabs](../tabs/tabs.md)                                       |
| 同一内容的另一种视图    | [SegmentedControl](../segmented-control/segmented-control.md) |

标签栏怎么和返回、推入页面配合，能放几个目的地，见[导航](../../../../../design/patterns/navigation.md)。标签栏上方不附加任何东西；正在工作的 agent 改在哪里显示，见[正在工作的 agent](../../../../../design/people-and-agents/working-agents.md#where-working-shows)。一个产品有哪些目的地，写在它自己的页面上（[Raft Chat](../../../../../design/products/raft-chat/README.md)）。

## 结构 {#anatomy}

- `MobileNavRoot`：贴边的栏，放在 `layer-card` 上（深色模式下放在 `layer-frame` 上，和标签页顶栏是同一个深色层），顶边有一条 `line-seam`，并为底部安全区留出内边距。它在底边横跨整个宽度；从不做成悬浮的胶囊。
- `MobileNavItem`：一个目的地：22px 的图标，下面是它的标签。
- `MobileNavLabel`：标签，用 `text-label`。过长时截断。

## 搜索和更多 {#search-and-more}

产品可以把标签栏的一个位置给搜索，并把最后一个标签设为更多。Raft Chat 在移动应用和手机网页上都这样做。

- 把搜索做成和其他一样的标签：它的页面是一级页面，没有返回，标签栏保持显示，搜索处于 `selected`。搜索从不显示提醒圆点。它的页面和搜索结果怎么表现，见[导航](../../../../../design/patterns/navigation.md#search-on-a-phone)。
- 产品的目的地多到放不下时，把最后一个标签设为更多。更多的一级页面是一个单独的页面，在顶部列出其余的目的地；每一行打开更多下面的一个推入页面，带返回。指向这些页面之一的链接会在更多下面打开它，并选中更多。

raft-ui 用 `MobileNavItem` 画这两项。不再计划为悬浮胶囊和搜索按钮提供单独的部件（`MobileNavPill`、`MobileNavSearch`）。

## 行为 {#behavior}

- 屏幕键盘打开时隐藏标签栏。如果把它钉在键盘上方，它会挡住正在输入的输入框和消息输入框。键盘收起时，用平台默认的过渡把标签栏带回来，不要瞬间跳出，这样人能看到导航回来了，而不会疑惑它去了哪里。
- 只在一级页面上显示标签栏：带返回的页面从不显示它（[导航](../../../../../design/patterns/navigation.md#going-back)）。推入页面会盖住它；菜单、对话框和底部面板不动它。
- 页面滚动时标签栏保持不动。不要在滚动时隐藏它：人靠它知道自己在哪里。
- 点按已选中的项会把它的页面滚到顶部；在搜索上则聚焦输入框。打开另一个标签时，每个标签都保留它页面的滚动位置和筛选条件（[导航](../../../../../design/patterns/navigation.md#going-back)）。

## 状态 {#states}

| 状态                 | 外观                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 未选中          | 图标和标签用 `foreground-hint`                                                                                                                                |
| 选中（`selected`） | 图标放在一张 56×30px 的黄色贴纸里；标签用 `foreground`，粗体                                                                                              |
| 提醒             | 图标右上角一个粉色像素点（[状态](../../../../../design/foundations/states.md)），从不显示数字。选中的项上从不显示，没有例外 |

贴纸只包住图标，不包住整个项：一个黄色的项会在屏幕底部再加一条外框，而只包住图标能让颜色减半，同时选中状态仍然一眼就能看出（[导航](../../../../../design/patterns/navigation.md#where-you-are)）。

## 内容 {#content}

- 每一项都要有标签，用 Title Case（[字体排印](../../../../../design/foundations/typography.md#casing)）。标签最多 8 个拉丁字母或 4 个汉字，这样 5 项能放进 320px；更长的会被截断。
- 哪些项可以显示提醒圆点，由产品决定。其他新消息改在页面里说。
- 标签栏上显示圆点，从不显示数量：数量放在页面里，挨着它所计数的东西。
- 只有更多里面有别处都不显示的东西时，才给更多加圆点，并且在引起它的那一行上显示同样的圆点，让人能找到新的东西。

## 无障碍 {#accessibility}

- `MobileNavRoot` 渲染一个 `nav`。用 `aria-label="Primary"` 给它命名。
- `MobileNavItem` 渲染 Base UI 的 Button；`selected` 设置 `aria-pressed`。对于用来跳转的项，渲染一个链接（`render={<a href="…" />}` 加 `nativeButton={false}`），并在选中的那个上设置 `aria-current="page"`：raft-ui 在链接上两者都不设置。
- 可见的标签就是这一项的名称。一项显示提醒圆点时，给它一个同时说出两者的 `aria-label`："More, new reply to your feedback"。圆点本身是 `aria-hidden`。
