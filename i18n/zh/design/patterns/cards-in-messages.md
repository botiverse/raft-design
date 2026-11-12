---
title: 消息里的卡片
summary: 消息里的每张卡片和每个条目浮层都从同一组 recipe 画出来：一个框、12px 内边距、两档宽度、一行来源、最多两行的标题、一行状态和详情、底部靠右一行最多两个按钮，所以改一张卡，所有卡都跟着改。
sourceHash: 3e335904
---

# 消息里的卡片

一条消息可以带很多种卡片：App 链接的块卡、Artifact、等待审批的操作卡、转发合集、它的回复。在对话里一张接一张地读，它们是一家人：同样的框、同样的内边距、同样的标题，状态和按钮放在同样的地方。读过一张，读下一张时就不用找东西在哪；App 的卡片也没法靠外形和 Raft 自己的卡片区别开。

它们能一直是一家人，是因为从同一个地方画出来。框和它的两档宽度是 [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md) 的 recipe；框里的部分，来源行、标题、详情、按钮和内边距，是旁边的 `messageCard` recipe（`packages/ui/src/components/message-embed/message-embed.recipe.ts`）。卡片组件从这两处取样式，自己不写；哪张卡自己写了，有一个测试会失败（[样式只在一个地方](#one-place-for-the-styles)）。在那里改一个值，每张卡和每个条目浮层都跟着变。

## 适用范围 {#when-it-applies}

画在消息里、正文下面的每张卡片：[AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md)、[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)、[MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md)、基于 [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md) 的链接卡和 Artifact 卡，以及新的卡片。还有关于一个条目的浮层（[浮层](#popovers)）：链接悬停时打开的条目卡（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`），和 App 的链接显示预览之前提的那个问题（[Popover](../../packages/ui/src/components/popover/popover.md) `size="item"`），它们在自己的浮层框里画同样的部分。

[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md) 取内容卡的宽度，但不取它的框：它是一块有底色、无边框的区域，离两侧 10px、离上下 8px，不是留 12px 的带框卡片。它是消息下面这个话题的摘要，读起来是消息的一部分，不是一个独立的条目：加上细线和卡片的内边距，每条有回复的消息都会像多带了一张卡；底色本身已经把它区分开，也说明它能打开（stdrc，2026-11-10）。

不适用于文件和图片（[MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)）：文件是带名字的小块，不是带标题的卡片，媒体保持相册的尺寸。引用的消息是正文旁边的一条竖线，不是卡片（[MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md)）。个人资料卡讲的是一个人，不是一个条目，保持自己的布局。页面上的 [Card](../../packages/ui/src/components/card/card.md) 不是消息里的卡片：不要把它放进消息。

## 结构 {#structure}

从上到下，除了框和标题，每一部分都可以没有：

1. **框**：`MessageEmbed`，`line-hairline` 边框、`radius-container` 圆角、`layer-card` 底色，没有阴影。延伸到框的顶部或底部的封面或摘录，采用框的内圆角（[外框之内](../foundations/shape.md#inside-a-frame)）。
2. **来源行**：卡片从哪里来，App 的图标和名字，然后是「·」和域名，下面一条细线（`AppLinkCardHeader`）。
3. **正文**，离框 12px：一行 Space Mono 的编号，然后是标题，然后是一行状态和详情。
4. **按钮**，在卡片底部靠右，排成一行。

```example
app-link-card/compositions/in-message
```

## 规则 {#rules}

### 一个框，一种内边距 {#one-frame-one-inset}

- 每张卡片都用 `MessageEmbed` 做底：它的框是消息里的卡片唯一的框。不用 [Card](../../packages/ui/src/components/card/card.md)，也不画卡片自己的框：第二种框总会在圆角上差一个像素、在线条上差一点颜色，这一家人就散了。
- 框的两侧和里面所有东西之间留 12px，正文和按钮的上下也留 12px（`messageCard` 的 `body`、`actions` 和 `inset`）。来源行和卡片的头部、底部行两侧留 12px、上下留 8px：它们是一行说明文字，不是一块内容。同样的框里留 16px 的卡片，会无缘无故显得比上面那张空；12px 是操作卡和转发合集原本就用的值，也是两行标题还能透气的最紧的距离。
- 不要卡里套卡。需要在浮层里问一个问题的卡片，把问题用同样的部分画在浮层里。

### 两档宽度 {#two-widths}

卡片只有两档宽度之一，用 `MessageEmbed` 的 `size` 设置，从不用自己的宽度：

| 卡片 | `size` | 宽度 |
| --- | --- | --- |
| 打开一个东西：App 链接、Artifact、操作或审批、网页 | `item` | 最宽 400px；手机上和消息一样宽 |
| 展示别的消息：转发合集、回复 | `content` | 和消息正文一样宽，最宽 560px |

- 条目卡和条目浮层一样宽，所以同一个条目在消息里和悬停时读起来一样。它不随窗口变宽：两行的标题在宽消息里拉成一长行，按钮也离它越来越远。
- 在手机上，条目卡占满消息的宽度，按钮有手指需要的空间。它在页面外壳的 768px 处切换，而不是用容器查询：768px 以下外壳排的是手机的对话，消息栏就是窗口减去两边的留白，所以那里窗口的宽度就是消息栏的宽度（[按区域的宽度切换](./responsive.md#switch-on-the-regions-width)）。它不按触屏切换：768px 以上的平板是触屏，但消息栏是桌面的宽度，400px 的卡片已经给按钮留出每个按钮都有的 44px 点击区域。
- 内容卡里装的是文字，所以跟着它下面的正文走，到 560px 停下：14px 的文字在这里一行约 70 个字符，再长一行就难读了，眼睛会找不到下一行的开头。

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
- [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) 把状态放在头部末尾，它的状态像素点加一个词：卡片处理完后会折叠成只剩头部，那时状态还要看得见。

### 按钮 {#buttons}

- 按钮在卡片底部靠右排成一行（`messageCard` 的 `actions`），最多两个：无边框的在前，有边框的在最后。第三个及以后的操作放进这两个按钮左边的「更多」菜单（⋯）；这个菜单由卡片的作者提供（图标按钮上的 [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)），按钮行自己不画。三个按钮并排，在大多数语言里放不进 400px 的卡片，而第二行按钮读起来像第二张卡。
- 操作卡的说明（`MessageActionCardActionsNote`）总是单独占一行，在按钮上面，而不是在按钮旁边：在 400px 的卡片里，说明放在两个按钮旁边只有约 150px，还会把确认按钮挤到下一行。
- 这一行放不下时，按这个顺序让位：按钮旁边的状态行，比如 App 的 “Working…”，先单独占一行；只要卡片放得下，按钮就留在同一行；只有在比两个按钮还窄的栏里，有边框的那个才整个移到无边框的那个下面。按钮从不截断：最窄的时候，按钮整个换行，和对话框的底部一样（[一行放不下时](./responsive.md#when-a-row-runs-out-of-room)），因为截断的标签读不出来。按钮旁边的状态行，要和用 `messageCard` 的 `actionGroup` 包起来的按钮放在一起，这样换行的是它那一行。
- 卡片上不用品牌主按钮：卡片在人们说的话中间，粉色按钮会盖过它们。确认的那个用有边框的按钮。

### 网页预览 {#web-preview}

Agent 可以发一个页面给人看，人们边看边继续聊，比如它搭建的网站的预览。页面在对话旁边打开，占用侧边区域里 Artifact 打开的位置，在那里的用法也一样。

**它从哪里来**

- **只来自 Agent 发出的卡片。** 卡片消息里带 `open: "beside"` 的按钮在网页预览里打开它的页面；其他所有按钮，以及消息正文里的每个链接，都和以前一样在新标签页里打开。人们没有要求给每个链接都提供预览，而在一条满是链接的 Agent 消息里，每个链接后面都跟一个控件，会把文字变成一排图标。作为卡片发出的页面，是 Agent 选定要展示的（stdrc，2026-11-10）。
- **按钮说明它在哪里打开。** 它以面板图标（`panel-right`）结尾，而不是 ↗，它的无障碍名称写明「opens beside the conversation」。它仍然是指向这个页面的链接：带修饰键点击或用中键点击会打开新标签页，和任何链接一样。
- **一个地址只显示一次域名。** 卡片按钮在标签后面显示链接的域名。一张卡片里有几个按钮打开同一个地址时（同一个页面的 New tab 和 Open preview），只有其中最后一个显示域名；其他的只显示标签（Jasper）。同一个主机在一行里出现两次，读起来像两个地方，第二份还会占掉标签需要的空间。每个按钮的无障碍名称里都保留域名。
- **不能在旁边打开时，** 它在新标签页里打开，绝不会什么都不做：网页预览关闭时，页面是 Raft 不放进框架的（Raft 自己的地址），旁边没有可以挨着打开的对话，或者地址里带有用户名或密码。移动应用还没有网页预览：在那里，按钮像任何链接一样打开它的页面。

**面板**

- 它占用 Artifact 在侧边区域里的位置：两者中后打开的那个显示，关掉它就把另一个还回来。它沿用那个位置记住的宽度、调整大小的手柄和这一行里的 Expand；在手机上，它作为一个独立的页面盖住对话（Back 会关闭它，系统的返回也一样）。
- **头部：** 地址，主机作标题（粗体），其余部分作描述（灰色）；两者各自截断，都可以选中和复制。然后是它自己的操作：Open in new tab（`arrow-up-right`）、宽度切换和 Refresh（`refresh-cw`），再是窗口控件：Expand 和 Close。显示的地址是打开时的那个：页面属于另一个网站，人在里面跳转到了哪里是读不到的。
- **宽度是头部的一个按钮，** 而不是头部下面的分段控件，这样头部保持一行（Jasper，2026-11-10）。它的图标和名称就是它要切换到的宽度：Phone width（`smartphone`），一个 390px 宽、在 `fill-subtle` 上居中的框；或者 Desktop width（`monitor`）。手机上没有宽度按钮：页面本来就占满整个屏幕。
- **出路总在屏幕上。** 很多网站拒绝显示在别的网站里（X-Frame-Options、CSP frame-ancestors）；这时框里一片空白，应用也无从得知。每个页面的底部都有一行安静的字：「Page not showing? Open in new tab」，用 `caption`、灰色，带一个灰色的文字链接。
- **http:// 页面永远不放进框里**（浏览器会把它当作混合内容拦下）：空状态说明页面无法在这里显示，以及原因，只带一个按钮：Open in new tab。（卡片按钮目前只打开 https 页面；这条规则适用于任何会打开这个面板的东西。）
- **焦点** 在面板打开时移进面板；Close 和 Esc 会关闭它，并把焦点放回打开它的那个按钮上。
- **头部空间不够时：** Refresh 先让出，然后是宽度按钮，再是 Open in new tab（底部那行字仍然能打开新标签页）；Expand 和 Close 始终保留。

**为什么可以放心显示**

页面运行在一个沙箱框架里，只有普通页面需要的能力（脚本、它自己源的存储、表单、作为普通标签页打开的弹出窗口、下载），从不允许顶层导航、模态框或任何设备权限（`allow=""`），不发送 referrer，在 Chromium 里也不带这个人的 cookie（`credentialless`）。它和 Raft 不同源，所以永远读不到也改不了 Raft。

### 浮层 {#popovers}

浮层归属于它讲的东西那一家，而不是浮层那一家。关于一个 App 条目的浮层就是浮起来的同一张卡：用浮层自己的框和阴影、条目卡的 400px，里面是 `messageCard` 的同样部分，正文、标题、详情和按钮，同样留 12px。读者悬停一个链接，又在后面的消息里看到它的块卡，读到的是同一个东西。关于一个条目的浮层有两个：

- 链接悬停时打开的条目卡（[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`）；
- 读者允许这个 App 之前，同一个链接问要不要显示预览的那个问题（[Popover](../../packages/ui/src/components/popover/popover.md) `size="item"`）。它代替的是允许之后标签片会打开的条目卡，所以看起来像它，而不像其他浮层（stdrc，2026-11-10）。

代价是这两个比其他浮层紧 4px，其他浮层保持 16px（[Popover](../../packages/ui/src/components/popover/popover.md#rules)）：带输入框或选项的浮层是一个独立的小步骤，个人资料卡讲的是一个人而不是条目，所以都保持浮层的内边距。和消息里的卡片有一处不同：浮层把来源，App 和域名，放在底部细线下的一行说明里（`messageCard` 的 `sourceFooter`，PreviewCardFooter），而不是顶部的一行，这样指针下面第一眼看到的是标题。

## 样式只在一个地方 {#one-place-for-the-styles}

上面的规则是两个 recipe 里的值，组件只是用它们：

- `messageEmbed`：框和它的 `size`（`item`、`content`）。
- `messageCard`：`source` 及其图标、名字和域名；`sourceFooter`，作为浮层底注的来源；`body`；`eyebrow`；`title` 和 `heading`（只有标题的字体，给和别的东西同一行的标题用）；`meta`；`actions` 和 `actionRow`；`actionGroup`，和状态行同一行时的按钮；`inset`；`popover`，条目浮层的宽度。

两者都和 MessageEmbed 一起从 `@botiverse/raft-ui` 导出，所以 App 自己的卡片（Artifact 卡、音频卡）也取同样的部分：`messageCard().title()`、`messageCard().meta()`，宽度用 `MessageEmbed size`。

`packages/ui/src/card-styles.test.ts` 读每个基于 MessageEmbed、PreviewCard 或这两个 recipe 的组件目录，按代码用了什么找出来，而不是按一份列表，所以新卡片写出来的那天就会被读到。那里任何手写卡片圆角、宽度（`max-w-md`、`w-[440px]`）、8px 及以上的内边距（`p-2.5`、`px-4`、`px-[14px]`）或标题字号（`text-headline`、`text-[17px]`）的类都会让它失败，报出文件、行号和类名，报错信息指向这两个 recipe。它的例外按文件和类列出，每一项都有理由：个人资料卡、普通浮层、MessageReplies 的摘要，以及卡片里不属于卡片本身的部分（权限小块、属性的标签）。要改卡片的样子，改 recipe；要加一张卡，基于 recipe 来做，测试会让它一直留在上面。

## 宽屏和窄屏 {#wide-and-narrow}

- 768px 以下，条目卡占满消息的宽度。内容卡本来就和正文一样宽。
- 条目浮层在手机上不会打开：点一下就打开链接（[App 链接](./navigation.md#app-links)）。

## 相关 {#related}

- [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md)、[AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md)、[PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)、[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)、[MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md)、[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)
- [导航：App 链接和块卡](./navigation.md#app-links)
- [由现有部件组成](../components/overview.md#built-from-existing-parts)
