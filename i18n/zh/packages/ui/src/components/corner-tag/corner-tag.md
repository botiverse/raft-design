---
title: CornerTag
summary: 贴在卡片右上角的灰色标签，说明卡片上的人在这里是什么身份（Owner、Admin、Guest、You），并带一个占位，不让长名字钻到标签下面。
sourceHash: df88702b
---

# CornerTag

CornerTag 说明卡片上的人在这个服务器上是什么身份：Owner、Admin、Guest 或 You，是一个贴在卡片右上角的灰色标签。它压在卡片上，不单独占一行，所以头像和名字的位置和没有标签时一样。它用在人或 Agent 的资料卡上，以及 Members 页面的图块上。

```example
corner-tag/compositions/profile-card
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 卡片上的人在这里是什么身份：Owner、Admin、Guest、You | CornerTag |
| 卡片上的人来自哪个服务器 | [OriginBand](../origin-band/origin-band.md)，不用标签 |
| 列表行里的身份，行没有卡片的角 | 名字后面一个小的弱化文字（[Members](../../../../../design/products/raft-chat/members.md)） |
| 套餐卡片上的促销：Pro、省 20% | [Badge](../badge/badge.md)，保持套餐卡片现在的样子，不用角标 |
| 一个状态：工作中、失败、已合并 | 状态标签（[Status](../status/status.md)） |

## 结构 {#anatomy}

- `CornerTag`：标签本身，卡片的第一个子元素。它的两条外边就是卡片自己的边，只有朝里的那个角是圆的（10px）；外侧那个角由卡片的圆角裁掉。它是 `span`，所以可以放在本身是按钮的卡片里。
- `CornerTagSpacer`：在名字那一行末尾放一份看不见的、和标签相同的文字。它没有高度，对辅助技术隐藏，只负责占位，让长名字在标签之前截断。给它和标签一样的文字。

```example
corner-tag/compositions/member-tiles
```

## 行为 {#behavior}

- 标签相对卡片定位，所以卡片必须是离它最近的定位框，并且裁掉自己的角：设为 `relative`，再加上卡片自己的 `overflow-hidden` 和圆角（`Card` 和 `PreviewCardPopup` 本身已经会裁剪）。在按下形状往里缩进的列表单元格里，把标签放进一个和单元格缩进、圆角相同的框里。
- 长名字在标签之前截断，标签本身从不截断。图块上的名字至少保留 3 个字符（`min-w-[3ch]`）。

## 内容 {#content}

- 只写这个人在这里是什么身份：Owner、Admin、Guest。在本人自己的卡片上写 You，后面跟身份："You · Owner"。
- 普通成员没有标签。服务器里大多数人都是成员，每张卡片都带标签就什么也没说；其余的都安静，例外才显眼。
- Agent 的标签只有 Admin，而且只给这个服务器的 Agent。
- 来自别的服务器的人永远不带：不显示他们在自己服务器上的身份（[成员标签](../../../../../design/people-and-agents/identity-and-presence.md#member-labels)）。

## 无障碍 {#accessibility}

- 标签是文字，按它在卡片里的位置读出。卡片本身是按钮时，把按钮的 `aria-describedby` 指向标签，让身份跟在名字后面读出。
- `CornerTagSpacer` 带 `aria-hidden`，身份不会读两遍。

## 规则 {#rules}

- 标签保持灰色（`fill-medium`、`foreground`），不用颜色：蓝色已经表示「来自别的服务器」，红、绿、黄表示状态。
- 标签只放在右上角，和卡片的边齐平；不要往里缩，也不要浮在卡片外面。挂在卡片边外的是促销用的 Badge，是另一回事。
- 名字那一行旁边有标签时，每一行末尾都放一个 `CornerTagSpacer`，名字就不会钻到标签下面。
- 一张卡片只放一个标签。"You · Owner" 是一个标签。
