---
title: MobileNav
summary: 手机的标签栏：一级页面底部最多 5 个目的地，选中那一项的图标放在一张黄色贴纸里。
sourceHash: 5db8b2d2
---

# MobileNav

MobileNav 是手机网页的标签栏：每个一级页面底部的一排产品目的地。选中的目的地的图标放在一张黄色贴纸里。推入页面会盖住它。它的最后一个标签可以是当前服务器，打开的是菜单而不是页面。iOS 和 Android 应用用各自系统的标签栏画同样的目的地（[导航](../../../../../design/patterns/navigation.md#what-each-platform-draws)）。

```example
mobile-nav/compositions/mobile-nav
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

## 搜索和服务器标签 {#search-and-the-server-tab}

产品可以把标签栏的一个位置给搜索，并把最后一个标签设为当前服务器。Raft Chat 在移动应用和手机网页上都这样做。

- 把搜索做成和其他一样的标签：它的页面是一级页面，没有返回，标签栏保持显示，搜索处于 `selected`。搜索从不显示提醒圆点。它的页面和搜索结果怎么表现，见[导航](../../../../../design/patterns/navigation.md#search-on-a-phone)。
- 产品有服务器、目的地又多到放不下时，把最后一个标签设为当前服务器：服务器自己的页面放进它的菜单（[服务器标签](#the-server-tab)）。它取代了「更多」标签，那是一个列出其余目的地的页面，Raft Chat 一直用到 2026-10-22。

raft-ui 用 `MobileNavItem` 画搜索，用 `MobileNavServerItem` 画服务器标签。不再计划为悬浮胶囊和搜索按钮提供单独的部件（`MobileNavPill`、`MobileNavSearch`）。

## 服务器标签 {#the-server-tab}

最后一个标签是当前服务器：别的标签放图标的地方放它的头像，标签是它的名称。它是唯一一个打开菜单而不是页面的标签（[导航](../../../../../design/patterns/navigation.md#the-server-tab-on-a-phone)）。实验性：这三个部件从 `@botiverse/raft-ui/wip` 导出，API 可能在任何版本里改变。

```example
mobile-nav/compositions/server-tab
```

- `MobileNavServerMenu`：根，一个 Base UI Popover 的根。它管理打开状态（`open`、`defaultOpen`、`onOpenChange`）。把它放在 `MobileNavRoot` 里，作为最后一项；它自己不渲染任何东西。
- `MobileNavServerItem`：标签，一个打开菜单的 `MobileNavItem`。子元素是服务器的 [Avatar](../avatar/avatar.md)（`type="server"`，画成 22px，和其他标签的图标一样大）和放在 `MobileNavLabel` 里的名称，过长时截断。它不接受 `selected`：它没有页面，所以从不处于选中状态。菜单打开时，它的头像下面显示按下时的底色。
- `MobileNavServerMenuContent`：菜单，一个从标签栏上方升起的 [Popover](../popover/popover.md) 面板，距标签栏两侧各 8px、上方 8px，高度随内容，最高到离窗口顶部 8px。它是一个纵向排列的列：给很长的服务器列表加上 `min-h-0 flex-1` 和它自己的滚动，后面的行就始终可见。

菜单里的行由产品决定：先是和切换器一样的服务器列表（[切换服务器](../../../../../design/components/overview.md#switching-servers)），然后是服务器自己的页面，最后是切换器底部的操作。Raft Chat 的写在[导航](../../../../../design/patterns/navigation.md#the-server-tab-on-a-phone)里。

- 点按打开菜单，再点按一次关闭。
- 长按（静止按住 500ms）也打开它，和 raft-ui 其他长按菜单打开的时刻相同（[状态](../../../../../design/foundations/states.md)）。松开手指后菜单保持打开。手指移动超过 10px 是滚动，不是按住。这个标签会阻止系统自己的长按菜单和文字选择。
- Esc、点按菜单外面和选择一行都会关闭它；焦点回到这个标签。

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
| 提醒             | 图标右上角一个粉色像素点（[状态](../../../../../design/foundations/states.md)），从不显示数字；在服务器标签上，放在头像的右上角（`AvatarBadge` 加 `offset={["100%", 0]}` 和一个 `accent` 的 [Status](../status/status.md)）。选中的项上从不显示，没有例外 |

贴纸只包住图标，不包住整个项：一个黄色的项会在屏幕底部再加一条外框，而只包住图标能让颜色减半，同时选中状态仍然一眼就能看出（[导航](../../../../../design/patterns/navigation.md#where-you-are)）。

## 内容 {#content}

- 每一项都要有标签，用 Title Case（[字体排印](../../../../../design/foundations/typography.md#casing)）。标签最多 8 个拉丁字母或 4 个汉字，这样 5 项能放进 320px；更长的会被截断。服务器标签的标签是服务器的名称，由人自己起：它会被截断，旁边的头像仍然能区分各个服务器。
- 哪些项可以显示提醒圆点，由产品决定。其他新消息改在页面里说。
- 标签栏上显示圆点，从不显示数量：数量放在页面里，挨着它所计数的东西。
- 其他服务器有未读内容时，或者菜单里有别处都不显示的东西时，给服务器标签加圆点，并且在引起它的那一行上显示同样的圆点，让人能找到新的东西。

## 无障碍 {#accessibility}

- `MobileNavRoot` 渲染一个 `nav`。用 `aria-label="Primary"` 给它命名。
- `MobileNavItem` 渲染 Base UI 的 Button；`selected` 设置 `aria-pressed`。对于用来跳转的项，渲染一个链接（`render={<a href="…" />}` 加 `nativeButton={false}`），并在选中的那个上设置 `aria-current="page"`：raft-ui 在链接上两者都不设置。
- 可见的标签就是这一项的名称。一项显示提醒圆点时，给它一个同时说出两者的 `aria-label`："Raft HQ, another server has unread items"。圆点本身是 `aria-hidden`。
- 给服务器标签一个写着服务器名称的 `aria-label`，这样头像里的首字母不会被一起读出来。它会说明自己有菜单（`aria-haspopup="dialog"`、`aria-expanded`）；在 `MobileNavServerMenuContent` 上用 `aria-label` 给菜单命名，比如 "Servers"。菜单打开时焦点移进菜单，关闭时回到标签。点按就能打开它，所以没有人需要长按。
