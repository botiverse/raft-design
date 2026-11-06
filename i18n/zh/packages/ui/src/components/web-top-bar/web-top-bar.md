---
title: WebTopBar
summary: 横跨桌面端布局顶部的那一行外框，也是桌面应用的标题栏：起始段和导航条对齐，中间段在窗口的中线上，末尾段止于栏边距。
sourceHash: f79aa89b
---

# WebTopBar

WebTopBar 是横跨桌面端布局顶部、在导航条上方的那一行黄色栏：网页上从 768px 起显示，在桌面应用里是任何宽度下的标题栏。它负责这条栏的高度、表面、接缝线和对齐；产品把自己的控件放进它的三段里（[页面结构](../../../../../design/patterns/page-structure.md#the-web-top-bar)）。

```example
web-top-bar/web-top-bar
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 网页上桌面端布局的顶部，从 768px 起 | WebTopBar |
| 桌面应用的标题栏，任何宽度 | WebTopBar |
| 一个面板的顶部：对话、侧面板、抽屉 | [Panel](../panel/panel.md) 的 `PanelHeader` |
| 手机上一级页面的顶部 | `PanelSectionHeader`（[Panel](../panel/panel.md)） |
| 没有顶栏的桌面端布局（App 的桌面模式、服务器的公开页面） | 导航条头部（[AppRail](../app-rail/app-rail.md)） |

## 结构 {#anatomy}

- `WebTopBarRoot`：这条栏，由外框项和上下各一份头部留白组成（用鼠标时 44px，触屏上 48px），用 `layer-frame`，底边有一条 `line-seam`，带主题的装饰（`frame-decor-top`）。窗口很矮时也保持这个高度。按顺序放下面三段，三段都必需。
- `WebTopBarStart`：工作空间按钮，然后是工作空间横条；在桌面应用里，后面还有后退、前进和历史记录。它离左边缘的距离和导航条的项一样（用鼠标时 6px，触屏上 8px），所以工作空间按钮和下方导航条的按钮对齐。
- `WebTopBarCenter`：搜索框（`SearchTrigger`，[Search](../search/search.md)），在窗口中居中。
- `WebTopBarEnd`：正在工作的成员，然后是铃铛；在桌面应用里，正在工作的成员前面还有更新标签片。它最后一个图标按钮的图标框止于栏边距（用鼠标时 16px，触屏上 20px），按钮超出这条线的距离是它的图标内缩（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。

## 行为 {#behavior}

- **宽度。** WebTopBar 在任何宽度下都会渲染。网页应用只从 768px 起渲染它，桌面端布局从这个宽度开始（[响应式布局](../../../../../design/patterns/responsive.md)）；桌面应用在任何宽度下都渲染它。
- **居中。** 起始段和末尾段是两个等宽的列，所以不管两侧各放了什么、两端的内缩差多少，中间段都在窗口的中线上。
- **窄窗口。** 一侧永远不会缩到比它的内容还窄，所以两侧和中间段永远不会互相遮盖。一侧的内容比中间段留下宽度的一半还宽时，中间段往另一侧移；两侧留下的宽度不足中间段的宽度时，中间段变窄，最窄 160px；再窄，整条栏就会溢出它的容器。在 768px 时，`SearchTrigger` 处于最小宽度（360px），每一侧有 204px，含它的内缩。
- **窗口安全区。** 每一端还要再加上它的窗口安全区作为内边距（`--raft-frame-inset-start`、`--raft-frame-inset-end`）：在桌面应用里是窗口自己的控件，比如 macOS 的红绿灯按钮；网页上是 0。中间段仍在窗口的中线上，而不是在窗口控件剩下的空间里居中（[窗口安全区](../../../../../design/patterns/page-structure.md#frame-insets)）。
- **装饰。** 有装饰的主题从 1024px 起在栏的右边画出它的装饰条。在根元素上把 `--frame-decor-top-end` 设为末尾段的宽度加 16px；中间段和末尾段之间放不下装饰条时，设 `--frame-decor-top: none`。

## 无障碍 {#accessibility}

- 这条栏本身没有 role。在应用里，用 `render={<header />}` 把它渲染成页面的 banner 地标；在文档的示例画布或其他页面的某个区域里，让它保持为 `div`。
- 每个控件自带名称：工作空间按钮的名称是服务器名，铃铛的名称是 "Notifications"（[WorkspaceButton](../workspace-button/workspace-button.md)）。

## 规则 {#rules}

- 产品控件只放进这三段；不要直接放进根元素，因为根元素的三列就是起始段、中间段和末尾段。
- 不要从外面设置各段的尺寸，也不要从外面给这条栏加内边距：正是这些内缩让起始段和导航条对齐、末尾段和下方的头部对齐。
