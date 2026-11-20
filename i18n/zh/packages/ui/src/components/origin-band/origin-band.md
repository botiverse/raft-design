---
title: OriginBand
summary: 资料卡顶部那条浅蓝色的条，说明这个人来自另一个服务器，带服务器的图块、名字和 External 这样的关系词。
sourceHash: 169de796
---

# OriginBand

OriginBand 说明资料卡上的人或 Agent 来自另一个服务器：横贯卡片顶部的一条浅蓝色的条，带服务器的图块和名字，末尾是关系词。它和头像左上角的服务器图块一起用（[Avatar](../avatar/avatar.md#another-server)）；两者都是蓝色，在 Raft 里蓝色表示「来自别的服务器」。

```example
origin-band/compositions/profile-card
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 来自另一个服务器的人的悬停卡片或资料卡 | OriginBand，末尾写 External |
| 他们的头像，出现在哪里都一样 | 头像左上角的 `AvatarOrigin`（[Avatar](../avatar/avatar.md#another-server)） |
| 这个人在本服务器上的身份：Owner、Admin、Guest | [CornerTag](../corner-tag/corner-tag.md) |
| 详情面板里说明来源的一节、列表行、同时也在别处的本服务器成员 | 用文字，不用条（[内容](#content)） |

## 结构 {#anatomy}

- `OriginBand`：28px 高的条，卡片的第一个子元素，在头部上方。
- `OriginBandSource`：服务器：每个服务器的图块（`3xs` 的服务器 [Avatar](../avatar/avatar.md)），然后是 `OriginBandName`。关系词之外剩下的空间都给它。
- `OriginBandName`：服务器的名字，用 " · " 隔开，一行，超出截断。
- `OriginBandRelation`：条末尾的关系词，用 `foreground-muted`，从不截断。

```example
origin-band/compositions/several-servers
```

## 内容 {#content}

「来自另一个服务器」只用一套词，按位置选用。raft-ui 不含其中任何一个词；产品用自己的语言来写。

| 位置 | 文字 |
| --- | --- |
| 悬停卡片或资料卡上的条 | 服务器的名字，然后是 External |
| 详情面板里说明来源的一节 | From，作为这一节的标题 |
| 列表行（频道成员、@ 列表） | 只写服务器名，灰色，跟在名字后面 |
| 本服务器成员同时也在频道里另一个服务器 | Also in，加上服务器的名字 |

- 每个服务器都用它的名字称呼，不用 slug。
- 名字旁边配图的地方，都用服务器自己的图块（它的标志，或墨色底上的首字母），不用通用的服务器图标。

## 无障碍 {#accessibility}

- 图块、名字和关系词是给眼睛看的排版。把它们作为一句话读出：给 `OriginBandSource` 和 `OriginBandRelation` 加 `aria-hidden`，在条里放一段视觉上隐藏的整句文字（"External: Acme Corp, Lumen Labs"）。

## 规则 {#rules}

- 只用于来自另一个服务器的人。本服务器成员同时也在别处时，他们是我们自己人：没有条，没有图块（[成员标签](../../../../../design/people-and-agents/identity-and-presence.md#member-labels)）。
- 条保持 `info-soft`：它和头像左上角的图块是同一个意思，也是卡片上唯一的蓝色。
- 横贯卡片顶部，占满整个宽度，不要往里缩，也不要放到别的边上（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。
- 带这条的卡片上不放身份标签：来自别的服务器的人，在这里不显示身份。
