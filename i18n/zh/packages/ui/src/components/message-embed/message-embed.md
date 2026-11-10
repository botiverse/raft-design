---
title: MessageEmbed
summary: 消息里嵌入内容所用的卡片：细线卡片里的头部、内容和底部；用于链接卡片，也是转发消息组、操作卡片和回复摘要的基础。
sourceHash: 2372591a
---

# MessageEmbed

消息里嵌入的东西所用的卡片：链接卡片，或者其他嵌入卡片的基础。它是消息里每张卡片共用的框（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md)），放在消息正文下方的 `MessageItemEmbedded` 里。[MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md)、[MessageActionCard](../message-action-card/message-action-card.md) 和 [AppLinkCard](../app-link-card/app-link-card.md) 渲染在它上面，[MessageReplies](../message-replies/message-replies.md) 用它的容器。

```example
message-embed/compositions/link-cards
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 应用预览的链接（一个 pull request、一份文档） | 正文里的引用标签片，不是卡片（[MessageItem](../message-item/message-item.md#app-links)） |
| 指向某个页面的链接，在消息下方预览 | MessageEmbed，作为链接卡片 |
| 从另一个对话转过来的消息 | [MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md) |
| 指向一条消息的链接，显示为摘录 | [MessageQuotedPreview](../message-quoted-preview/message-quoted-preview.md) |
| Agent 需要某个人审批 | [MessageActionCard](../message-action-card/message-action-card.md) |
| 文件、图片或视频 | [MessageAttachment](../message-attachment/message-attachment.md) |
| 一条消息的回复 | [MessageReplies](../message-replies/message-replies.md) |
| 代码、图表或 Markdown 表格 | [CodeBlock](../code-block/code-block.md) |
| 一种新的嵌入卡片 | 以 MessageEmbed 为基础，不新建容器（[用现有部件搭建](../../../../../design/components/overview.md#link-cards-forwarded-messages-quoted-previews)） |

## 结构 {#anatomy}

- `MessageEmbed`：卡片，在 `layer-card` 上，带 `line-hairline` 边框和 `radius-container`。`size` 给它条目卡片或内容卡片的宽度（[两档宽度](../../../../../design/patterns/cards-in-messages.md#two-widths)）。必需。
- `MessageEmbedHeader`：顶行，有自己的内边距。说明这张卡片是什么、来自哪里。
- `MessageEmbedContent`：正文。它自己没有内边距：由里面的内容来设置，这样图片或一列项目可以铺到卡片边缘。
- `MessageEmbedFooter`：底行，内边距和头部一样。放卡片的操作。

只有 `MessageEmbed` 是必需的；按内容需要选用其他部件。

## 行为 {#behavior}

- 卡片和它的部件可以缩到比内容更窄，这样长内容会在卡片里换行或截断，而不是把消息撑宽。
- 整张卡片用来打开某个东西时，比如标题链接覆盖整张卡片的 Artifact 卡片，给它加上 `interactive`：悬停用浅档，按下用中档，和文件卡片一样（[MessageAttachment](../message-attachment/message-attachment.md#behavior)，[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。悬停效果让人分得清能打开东西的卡片和不能打开的卡片。只用来展示内容的卡片，比如操作卡片或转发消息组，不开 `interactive`：它整体上不打开任何东西，所以没有悬停效果。这一档叠加层铺在内容下面，所以封面图会把它挡住，只有卡片里的各行显示它。
- 渲染为链接的卡片在获得键盘焦点时显示焦点环（[状态](../../../../../design/foundations/states.md#focus)）。

## 无障碍 {#accessibility}

- `MessageEmbed` 和它的部件都是用 Base UI `useRender` 构建的普通 `div` 元素；用 `render` 更换元素。
- 整张卡片用来打开某个东西时，把 `MessageEmbed` 渲染为 `<a>`，并给它一个说明打开什么的无障碍名称。
- 不要在渲染为链接的卡片里放按钮：每个控件都必须是独立的元素，和 [MessageAttachment](../message-attachment/message-attachment.md#accessibility) 一样。

## 规则 {#rules}

- 每种嵌入卡片都基于 MessageEmbed 搭建，不加新的颜色、形状或线（[用现有部件搭建](../../../../../design/components/overview.md#built-from-existing-parts)）。
- 用 `size` 给卡片两档宽度之一：`item` 用于打开一个东西的卡片（最宽 400px，在手机上和消息一样宽），`content` 用于展示其他消息的卡片（最宽 560px）。不要给它自己的宽度（`max-w-[440px]`、`max-w-md`）。
- 内边距、来源行、标题、详情和按钮从 `messageCard` 取，它和 MessageEmbed 一起从 `@botiverse/raft-ui` 导出（`messageCard().title()`、`messageCard().meta()`、`messageCard().actions()`），不要用卡片自己的类：消息里的每张卡片和每个条目浮层都从这两处画出来，所以它们一起变（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md)）。应用的链接卡片也可以用 [AppLinkCard](../app-link-card/app-link-card.md) 的部件，它们就是从这里画出来的。
- 把卡片放在 `MessageItemEmbedded` 里，在正文和附件之后。
