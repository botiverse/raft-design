---
title: 主题
summary: 用户可以选的主题，主题能改什么、永远不改什么，以及外框上的装饰。
sourceHash: 7c7303da
---

# 主题

主题改的是外框和内容周围的底色，从不改颜色的含义。Raft 黄（也就是基础样式本身）是默认主题；用户可以给自己选别的主题，它跟着账户走，在每个服务器上都一样。

## 原则 {#principles}

- **主题是外框，不是一套新配色。** 它给外框（导航条、网页顶栏、手机顶栏）、侧栏，以及深色模式下的各层深色底换颜色。浅色模式下内容仍然在白色纸面上。
- **含义永远不变。** 粉色主按钮、未读数和 @ 数、状态灯、警告和错误在所有主题里都一样，换了主题的人不用重新学一遍产品。
- **主题让环境安静下来，从不让信息安静。** 发给你的东西（`you`）和选中或打开的东西（`selected`）在每套主题里都保持 Raft 黄，无聊灰也不例外（[信号](#signals)）。外框是例外：导航条以及外框上的任何东西（`variant="on-frame"` 的 SegmentedControl）属于环境，所以它的选中项用主题的外框颜色（`layer-frame-active`），而不是 `selected`。
- **每套主题都有浅色版和深色版。** 深色模式下，画布、侧栏、卡片和弹出层带上主题的色相，饱和度很低。中性黑色的面板放在彩色外框里，看起来像是贴上去的。
- **装饰可以关。** 头像系列的主题可以在外框上画这个系列的像素画；用户可以关掉它们，保留颜色。

## 有哪些主题 {#the-themes}

| 主题 | 外框 | 装饰 |
|---|---|---|
| Raft 黄（默认） | 基础样式：黄色外框、奶油色侧栏 | 无 |
| 无聊灰 | 接近白色的外框和侧栏，灰色的品牌图形和浅色变体；只有选中的东西或发给你的东西是黄色 | 无 |
| 机器人、小动物、太空、书桌、食物、冒险、天气、植物、诡异 | 每个对应 `design/assets/Agents` 里的一个头像系列，按它配色 | 这个系列的像素画 |

无聊灰是唯一一套也改品牌色的主题。除了灰色的外框和侧栏，`brand` 和它的浅色变体也变成中性灰：品牌图形（面板标题栏的图标贴纸、工作空间图块里的字母）、弹出层里的光标高亮（菜单、选项和建议行上的 `brand-soft`）、被评论的段落和选中文字下面的浅色底。选「无聊」的人不想要的，就是这些环境。剩下的黄色小而局部，只是一行、一个分段或一个标签片，而且只出现在有东西被选中或发给你的地方（[信号](#signals)）。

## 信号 {#signals}

黄色在 Raft 里有两种含义，两种都是信息，不是装饰（[颜色的含义](./color.md#meanings-of-color)）。它们有自己的 token，指向原始的黄色而不是 `brand`，所以没有哪套主题能改到它们：

| Token | 含义 | 用于 |
|---|---|---|
| `you` | 发给你的 | 提及你的地方（`MessageReferenceText variant="primary"`）、侧栏的 @ 标记（`SidebarItemIndicator`）、搜索命中、你打开的评论所对应的段落 |
| `selected` | 你所在的位置、打开的东西 | 侧栏里当前的行，选中的分段、标签页和标签栏项，按下的切换按钮或面板操作，打开的开关，当前步骤 |

- 只用在纸面上。在外框上（导航条的选中项、`on-frame` 的 SegmentedControl），选中项用主题的 `layer-frame-active` 和 `line-frame-active`：浅色主题里是白色，无聊灰里是灰色。外框是主题要换颜色的环境。
- 两者在每套主题里都保留贴纸的 1.5px 墨色边（`sticker-ink`）和墨色文字。
- 灰色代替不了它们。无聊灰用它的灰色 `brand` 画它们的时候，浅色模式下选中的分段和悬停的分段只差 ΔE 1.4（OKLab × 100），低于人能察觉的 2；选中的侧栏行和侧栏差 5.0，提及你的地方和页面差 7.5。黄色是 16.5 到 20。深到能和它相当的灰色是一大块中灰，比它替换掉的黄色还重。`themes.contrast.test.ts` 要求每套主题都达到 ΔE 10。
- 新的「你」信号或选中的贴纸用这两个 token 画，不要用 `brand`：`brand` 是环境，跟着主题变。

## 主题能改什么 {#what-a-theme-may-change}

- `layer-frame`、`layer-frame-active`、`foreground-on-frame` 以及它的 `-muted` 和 `-active` 两级、`fill-frame-medium`、`line-frame-active`：外框。
- `layer-sidebar`。
- 深色模式下的 `layer-canvas`、`layer-card` 和 `layer-popover`，带上主题的色相。
- 只有无聊灰：`brand`、`brand-soft`、`brand-strong`、`brand-glow`、`brand-edge` 和 `selection`。

其他所有东西都保持基础样式的值。没有哪套主题改 `you` 或 `selected`（[信号](#signals)）。外框浅到能放墨色文字时，上面用墨色文字，选中项用白色；外框是深色时，用浅色文字，选中项保留黄色，和深色模式的导航条一样（[0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)）。

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
