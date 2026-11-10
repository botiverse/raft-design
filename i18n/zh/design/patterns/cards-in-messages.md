---
title: 消息里的卡片
summary: 消息里的每张卡片和每个条目浮层都从同一组 recipe 画出来：一个框、12px 内边距、两档宽度、一行来源、最多两行的标题、一行状态和详情、底部靠右最多两个按钮，所以改一张卡，所有卡都跟着改。
sourceHash: 69881500
---

# 消息里的卡片

一条消息可以带很多种卡片：App 链接的块卡、Artifact、等待审批的操作卡、转发合集、它的回复。在对话里一张接一张地读，它们是一家人：同样的框、同样的内边距、同样的标题，状态和按钮放在同样的地方。读过一张，读下一张时就不用找东西在哪；App 的卡片也没法靠外形和 Raft 自己的卡片区别开。

它们能一直是一家人，是因为从同一个地方画出来。框和它的两档宽度是 [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md) 的 recipe；框里的部分，来源行、标题、详情、按钮和内边距，是旁边的 `messageCard` recipe（`packages/ui/src/components/message-embed/message-embed.recipe.ts`）。卡片组件从这两处取样式，自己不写；哪张卡自己写了，有一个测试会失败（[样式只在一个地方](#one-place-for-the-styles)）。在那里改一个值，每张卡和每个条目浮层都跟着变。

## 适用范围 {#when-it-applies}

画在消息里、正文下面的每张卡片：[AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md)、[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)、[MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md)、[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)、基于 [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md) 的链接卡和 Artifact 卡，以及新的卡片。还有链接悬停时打开的条目卡（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`），它在自己的浮层框里画同样的部分。

不适用于文件和图片（[MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)）：文件是带名字的小块，不是带标题的卡片，媒体保持相册的尺寸。引用的消息是正文旁边的一条竖线，不是卡片（[MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md)）。个人资料卡讲的是一个人，不是一个条目，保持自己的布局。页面上的 [Card](../../packages/ui/src/components/card/card.md) 不是消息里的卡片：不要把它放进消息。

## 结构 {#structure}

从上到下，除了框和标题，每一部分都可以没有：

1. **框**：`MessageEmbed`，`line-hairline` 边框、`radius-container` 圆角、`layer-card` 底色，没有阴影。
2. **来源行**：卡片从哪里来，App 的图标和名字，然后是「·」和域名，下面一条细线（`AppLinkCardHeader`）。
3. **正文**，离框 12px：一行 Space Mono 的编号，然后是标题，然后是一行状态和详情。
4. **按钮**，在卡片底部靠右。

```example
app-link-card/compositions/in-message
```

## 规则 {#rules}

### 一个框，一种内边距 {#one-frame-one-inset}

- 每张卡片都用 `MessageEmbed` 做底：它的框是消息里的卡片唯一的框。不用 [Card](../../packages/ui/src/components/card/card.md)，也不画卡片自己的框：第二种框总会在圆角上差一个像素、在线条上差一点颜色，这一家人就散了。
- 框和里面所有东西之间留 12px：来源行、正文和按钮（`messageCard` 的 `body`、`actions` 和 `inset`）。同样的框里留 16px 的卡片，会无缘无故显得比上面那张空；12px 是操作卡和转发合集原本就用的值，也是两行标题还能透气的最紧的距离。
- 不要卡里套卡。需要在浮层里问一个问题的卡片，把问题用同样的部分画在浮层里。

### 两档宽度 {#two-widths}

卡片只有两档宽度之一，用 `MessageEmbed` 的 `size` 设置，从不用自己的宽度：

| 卡片 | `size` | 宽度 |
| --- | --- | --- |
| 打开一个东西：App 链接、Artifact、操作或审批、网页 | `item` | 最宽 400px；手机上和消息一样宽 |
| 展示别的消息：转发合集、回复 | `content` | 和消息正文一样宽，最宽 560px |

- 条目卡和条目浮层一样宽，所以同一个条目在消息里和悬停时读起来一样。它不随窗口变宽：两行的标题在宽消息里拉成一长行，按钮也离它越来越远。
- 在手机上，条目卡占满消息的宽度，按钮有手指需要的空间。
- 内容卡里装的是文字，所以跟着它下面的正文走，到一行长得难读的地方停下。

### 来源 {#source}

- 展示别人家内容的卡片要有来源行：App 注册的图标和名字，然后是域名。Raft 用自己为 App 存的信息画它，从不取自卡片内容，这样 App 的卡片没法冒充某个人说的话，也没法冒充 Raft 自己（[块卡](./navigation.md#block-cards)）。
- 域名放不下时丢掉开头，不丢结尾：结尾说明链接去哪里。
- Raft 自己画的卡片，比如操作卡，没有来源行。

### 标题 {#title}

- 标题用 `text-subhead`、粗体、墨色，最多两行，然后是省略号（`messageCard` 的 `title`）。每张卡的标题一样大，所以没有一张比它所在的消息更抢眼，并排的两张卡也对得齐。
- 标题打开条目：把链接放在标题里。标题的链接保持标题的墨色，悬停时加下划线，和发送者的名字一样。
- 没有按钮的卡片整张可点（`MessageEmbed interactive`）：它像文件卡一样有悬停和按下的效果，标题的链接覆盖整张卡。

### 状态和详情 {#state-and-details}

- 状态放在标题下面，用中性的 soft [Badge](../../packages/ui/src/components/badge/badge.md)，然后是 `foreground-muted` 的详情，放不下时换行（`messageCard` 的 `meta`）。状态是 App 自己说条目进展到哪一步的词，不是 Raft 的状态颜色。
- [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) 把状态放在头部末尾，一个像素点加一个词：卡片处理完后会折叠成只剩头部，那时状态还要看得见。

### 按钮 {#buttons}

- 按钮放在卡片底部靠右（`messageCard` 的 `actions`），最多两个：无边框的在前，有边框的在最后。其余的放进左边的「更多」菜单（⋯），从不换到第二行。
- 卡片上不用品牌主按钮：卡片在人们说的话中间，粉色按钮会盖过它们。确认的那个用有边框的按钮。

### 浮层 {#popovers}

条目浮层（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`）就是浮起来的同一张卡：用浮层自己的框和阴影、条目卡的 400px，里面是 `messageCard` 的同样部分，正文、标题、详情和按钮，同样留 12px。读者悬停一个链接，又在后面的消息里看到它的块卡，读到的是同一个东西。

## 样式只在一个地方 {#one-place-for-the-styles}

上面的规则是两个 recipe 里的值，组件只是用它们：

- `messageEmbed`：框和它的 `size`（`item`、`content`）。
- `messageCard`：`source` 及其图标、名字和域名；`body`；`eyebrow`；`title` 和 `heading`（只有标题的字体，给和别的东西同一行的标题用）；`meta`；`actions` 和 `actionRow`；`inset`；`popover`，条目浮层的宽度。

`packages/ui/src/card-styles.test.ts` 读每个卡片组件的代码，发现组件自己写了卡片的圆角、宽度、12px 或 16px 的内边距或标题字号时就失败，报错信息指向这两个 recipe。它的例外列表写明还没用上 recipe 的卡片，以及不属于卡片的值（文件小块、媒体、个人资料卡），每一项都有理由。要改卡片的样子，改 recipe；要加一张卡，基于 recipe 来做，测试会让它一直留在上面。

## 宽屏和窄屏 {#wide-and-narrow}

- 768px 以下，条目卡占满消息的宽度。内容卡本来就和正文一样宽。
- 条目浮层在手机上不会打开：点一下就打开链接（[App 链接](./navigation.md#app-links)）。

## 相关 {#related}

- [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md)、[AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md)、[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)、[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)、[MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md)、[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)
- [导航：App 链接和块卡](./navigation.md#app-links)
- [由现有部件组成](../components/overview.md#built-from-existing-parts)
