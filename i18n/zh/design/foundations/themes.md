---
title: 主题
summary: 用户可以选的主题，主题能改什么、永远不改什么，以及外框上的装饰。
sourceHash: dbe8e49d
---

# 主题

主题改的是外框和内容周围的底色，从不改颜色的含义。Raft 黄（也就是基础样式本身）是默认主题；用户可以给自己选别的主题，它跟着账号走，在每个服务器上都一样。

## 原则 {#principles}

- **主题是外框，不是一套新配色。** 它给外框（导航条、网页顶栏、手机顶栏）、侧栏，以及深色模式下的各层深色底换颜色。浅色模式下内容仍然在白色纸面上。
- **含义永远不变。** 粉色主按钮、未读数和 @ 数、状态灯、警告和错误在所有主题里都一样，换了主题的人不用重新学一遍产品。
- **每套主题都有浅色版和深色版。** 深色模式下，画布、侧栏、卡片和弹出层带上主题的色相，饱和度很低。中性黑色的面板放在彩色外框里，看起来像是贴上去的。
- **装饰可以关。** 头像系列的主题可以在外框上画这个系列的像素画；用户可以关掉它们，保留颜色。

## 有哪些主题 {#the-themes}

| 主题 | 外框 | 装饰 |
|---|---|---|
| Raft 黄（默认） | 基础样式：黄色外框、奶油色侧栏 | 无 |
| 无聊灰 | 接近白色的外框和侧栏，灰色的选中项；没有黄色，选中项也没有墨色边 | 无 |
| 机器人、小动物、太空、书桌、食物、冒险、天气、植物、诡异 | 每个对应 `design/assets/Agents` 里的一个头像系列，按它配色 | 这个系列的像素画 |

无聊灰是唯一一套也改品牌色的主题，所以它是"你所在的位置是黄色"这条规则唯一的例外（[导航](../patterns/navigation.md)、[状态](./states.md)）：`brand` 和它的浅色变体变成中性灰，`brand-edge` 变成透明，所以选中的行是一块纯灰色填充。它的选中项在两种模式下都保留墨色文字，和所有贴纸一样（[颜色](./color.md)），所以在深色模式下是浅灰色。

## 主题能改什么 {#what-a-theme-may-change}

- `layer-frame`、`layer-frame-active`、`foreground-on-frame` 以及它的 `-muted` 和 `-active` 两级、`fill-frame-medium`、`line-frame-active`：外框。
- `layer-sidebar`。
- 深色模式下的 `layer-canvas`、`layer-card` 和 `layer-popover`，带上主题的色相。
- 只有无聊灰：`brand`、`brand-soft`、`brand-strong`、`brand-glow`、`brand-edge` 和 `selection`。

其他所有东西都保持基础样式的值。外框浅到能放墨色文字时，上面用墨色文字，选中项用白色；外框是深色时，用浅色文字，选中项保留黄色，和深色模式的导航条一样（[0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)）。

## 装饰 {#decorations}

有装饰的主题把这个系列的像素画按 2 倍和 3 倍像素大小画出来，只画在外框空着的地方：

- 网页顶栏上搜索框的右边（`frame-decor-top`），只在窗口宽度 ≥1024px 时显示，这时居中的搜索框给它留出了位置；
- 桌面端导航条上，所有按钮的下面（`frame-decor-rail`，由 AppRail 的 nav 作为最后一项画出）。它排在所有按钮后面，所以永远不会压在按钮下面；导航条空间不够时，显示得少一些。

不要把像素画放在可能被当成控件、头像或状态的地方，也不要放在文字后面。

## 怎么用 {#using-themes}

- 在 `foundation.css` 之后引入 `@botiverse/raft-ui/themes.css`。
- 把 `data-theme="<id>"` 放在带模式类名（`.light` / `.dark`）的那个元素上（应用把两者都放在 `<html>` 上）。没有 `data-theme` 时就是 Raft 黄。
- 在同一个元素上加 `data-theme-decor="off"` 关掉装饰。
- 应用自己画的顶栏加上 `frame-decor-top` 这个工具类；导航条自己会画。
- 主题是生成出来的：编辑 `packages/ui/src/themes.json`，然后运行 `vp run @botiverse/raft-ui#build:themes`（`themes.css` 过期时会有测试失败）。

## 相关 {#related}

- [颜色](./color.md)：主题覆盖的那些 token。
- [深色模式](./dark-mode.md)：深色模式下什么会变，每套主题都遵守。
