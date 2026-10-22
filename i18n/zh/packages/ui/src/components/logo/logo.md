---
title: RaftLogo
summary: 以内联 SVG 提供的 Raft 图形标志、文字标志和组合标志，用于登录、创建账户或服务器、加载屏幕这类品牌页面。
sourceHash: f01d872e
---

# RaftLogo

raft-ui 把 Raft 标志导出为三个内联 SVG：`RaftLogo`（图形标志）、`RaftWordmark`（RAFT 这个词）和 `RaftLogoLockup`（两者组合）。它们就是网站上的原图，一点没改。标志可以出现在哪里、哪种颜色配哪种背景，见[品牌](../../../../../design/foundations/brand.md#logo)；源文件和它们的颜色见 [Logos](../../../../../design/assets/Logos/README.md)。

```example
logo/logo
```

## 何时使用 {#when-to-use}

标志可以出现在哪里，见[品牌](../../../../../design/foundations/brand.md#logo)和 [Logos](../../../../../design/assets/Logos/README.md#rules)。确定可以出现之后，按要显示的内容选择导出项：

| 情况 | 用 |
| --- | --- |
| 只有图形标志 | `RaftLogo` |
| 只有文字 | `RaftWordmark` |
| 图形标志和文字一起 | `RaftLogoLockup` |
| 工作页面的外框 | 不用标志：用工作空间按钮或导航条上的工作空间图块（[品牌](../../../../../design/foundations/brand.md#principles)） |

## 结构 {#anatomy}

- `RaftLogo`：只有图形标志。
- `RaftWordmark`：只有字母。
- `RaftLogoLockup`：图形标志，后面跟着字母。

每个都是保持比例的 `svg`。用 class 设置高度，宽度保留 `auto`。这些导出项绘制的是 `raft-logo.svg` 的浅色背景配色：墨色轮廓，里面是奶油色。raft-ui 没有导出用于深色背景的黄色版本。

## 无障碍 {#accessibility}

- 这些 SVG 自己没有名称。标志单独出现时，给它加上 `role="img"` 和 `aria-label="Raft"`。
- 旁边的可见文字已经写了 Raft 时，用 `aria-hidden` 隐藏标志。
