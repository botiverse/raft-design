---
title: Comment
summary: 文档旁的评论，类似 Google Docs：一栏评论卡片，每张都与它所讲的段落对齐；还有单个讨论的卡片、其中的评论，以及窄屏上代替评论栏的标记。
sourceHash: 9d52ed50
---

# Comment

用于文档评论的部件：`CommentMargin` 在文档旁边排出一栏 `CommentCard`，每张卡片都与它所讲的段落对齐；`CommentEntry` 是卡片里的一条评论；评论栏放不下时，用 `CommentMarker` 代替。产品何时、怎样显示评论，见[评论](../../../../../design/patterns/comments.md)；本页只讲部件。

```example
comment/compositions/margin
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 对文档或其中段落的评论，查看器有放评论栏的空间 | `CommentMargin`，每个讨论一个 `CommentCard` |
| 同样的评论，但评论栏放不下 | 每个段落旁放一个 `CommentMarker`，点开一个底部面板（[Drawer](../drawer/drawer.md)） |
| 对对话中某条消息的回复 | 消息列（[ThreadPanel](../thread-panel/thread-panel.md)），而不是评论 |
| 消息里文件卡片上显示的评论数 | `MessageAttachmentCommentSummary`（[MessageAttachment](../message-attachment/message-attachment.md)） |

## 结构 {#anatomy}

- `CommentMargin`：文档旁边的一栏，`position: relative`，高度到最下面那张卡片为止。使用评论栏时必需。
  - `CommentMarginItem`：一张卡片的位置。`top` 是它锚点的位置，单位 px，从评论栏顶部算起；`active` 把它固定在那里。每张卡片必需。
- `CommentCard`：一个讨论，放在 `layer-card` 上，带 `line-hairline` 边框和 `radius-container`。`active` 标记打开的那张。
  - `CommentCardMeta`：一行 `text-caption`、`foreground-hint` 的文字，内容由调用方提供："2 replies"、"On the whole document"、"Position not found"。可选。选中它会做某件事时，比如让这条讨论成为正在读的那条、让它的段落成为激活的高亮，把它渲染成按钮（`render={<button type="button" />}`）：它和可点击文字一样在悬停时显示下划线，并显示焦点环（[状态](../../../../../design/foundations/states.md#clickable-text)）。
  - `CommentEntry`：一条评论。至少一条。
    - `CommentEntryHeader`：作者的 [Avatar](../avatar/avatar.md)（`size="xs"`）、`CommentEntryAuthor`（`text-subhead`，粗体）和 `CommentEntryTime`（Space Mono，`text-mono-meta`，`foreground-hint`），后者是一个 `<time>`。
    - `CommentEntryBody`：正文，用 `text-callout`。`clamp` 把它截到 2 行。
  - `CommentCardQuote`：讨论所针对的段落，内容由调用方提供，视觉上隐藏（`sr-only`）。让触发按钮或标记的 `aria-describedby` 指向它。可选，但每个锚定在段落上的讨论都应该有。
  - `CommentCardTrigger`：盖住整张卡片、用来打开它的按钮。可选；只用在收起的卡片上。
  - 回复框是一个 [Composer](../composer/composer.md)（`ComposerRoot`、`Composer`、`ComposerInput`、`ComposerSubmit`），不是单独的部件。
- `CommentMarker`：窄屏上段落旁边的按钮，带一个最多 3 个 `size="2xs"` 头像的 `AvatarGroup` 和数量。
- `useCommentMarginFits(viewer, { minWidth })`：判断查看器是否有放评论栏的空间（[宽屏与窄屏](#wide-and-narrow)）。
- `setCommentHighlights`、`COMMENT_HIGHLIGHT`、`COMMENT_HIGHLIGHT_ACTIVE`：高亮段落（[高亮](#highlights)）。
- `resolveCommentMarginLayout`：`CommentMargin` 所用的布局计算，供自己摆放卡片的调用方使用。

正文用 `text-callout`，不用 `text-body`：评论是文档的旁注，而文档自己的正文是 `text-body`。桌面端两者都是 14/22，读起来一样；手机上卡片比文档（16/24）小一级（14/20），也就是消息和它的预览之间的那一级（[字体排印](../../../../../design/foundations/typography.md#type-scale)）。头部用消息的样式（[MessageItem](../message-item/message-item.md)）：粗体名字，后面是 Space Mono 的时间。

## 状态 {#states}

```example
comment/compositions/card-states
```

| 状态 | 外观 |
| --- | --- |
| 收起 | 第一条评论，文字截到 2 行（`clamp`），回复数放在 `CommentCardMeta` 里。由 `CommentCardTrigger` 打开 |
| 悬停 | `CommentCardTrigger` 在收起的卡片上盖一层 `fill-subtle`，即行的浅档：鼠标指针停在卡片上时人正在读它，所以悬停只变化一小步，文字保持原样（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。按下是 `fill-medium` |
| 激活 | `active`：1.5px 的 `line-strong` 边框和 `shadow-float`，从评论栏上浮起。显示每一条评论，这个人能回复时还显示回复框 |
| 针对整篇文档 | 先放 `CommentCardMeta`，说明这一点。它的 `CommentMarginItem` 设 `top={0}` |
| 找不到位置 | 先放 `CommentCardMeta`，说明已经找不到这个段落。它的 `CommentMarginItem` 设 `top={0}`，排在针对整篇文档的卡片之后 |

卡片里放哪些部件由调用方决定：raft-ui 没有 `collapsed` 或 `expanded` 属性。收起的卡片渲染 `clamp`、回复数和 `CommentCardTrigger`；打开的卡片渲染每一条评论和 Composer。

## 行为 {#behavior}

- 每张卡片放在自己的 `top`，与段落的第一行对齐。卡片会重叠时，它们保持文档中的顺序（按 `top`；`top` 相同的项保持首次渲染时的顺序），每张往下移到前一张卡片下方 8px（`gap`）处。
- 激活的卡片留在自己的 `top`，上面的卡片往上移让出空间，但不会超过评论栏顶部；下面的卡片往下移。上面的卡片放不下时，它们从顶部开始堆叠，激活的卡片跟在后面。这是 Google Docs 的做法：人们正在读的讨论始终在它的段落旁边。
- 评论栏用一个 `ResizeObserver` 测量所有卡片，所以一张卡片打开或有了新回复，下面的卡片会跟着移动。计算出的位置是该项的 `data-top`，以 `transform: translateY()` 应用，所以移动时评论栏不需要重新布局；第一次放置之后，移动用时 150ms，减弱动态效果时没有动画。transform 会让该项成为其内部所有 `position: fixed` 元素的包含块：卡片里的弹出层要用 portal 渲染到外面。
- `top` 由调用方测量：段落第一个行盒的顶部（`range.getClientRects()[0].top`）减去评论栏的顶部。文档或评论栏改变尺寸时要重新测量，因为文字会重新换行。
- 段落在文档里已经找不到的讨论，放在顶部，和针对整篇文档的评论放在一起，并在 `CommentCardMeta` 里说明；永远不要丢掉它（[评论](../../../../../design/patterns/comments.md#rules)）。
- 回复就是它所回复的那条评论后面的又一个 `CommentEntry`，放在卡片自己的这一栏里：卡片就是这条讨论，所以回复没有自己的缩进、竖线或框。每个 `CommentEntry` 自己设定与前一条的间距，所以把各条直接放进卡片，不要另外包一层。
- 卡片的 `CommentCardMeta` 写出它的段落、并且选中它会让这条讨论成为正在读的那条时，把它渲染成按钮。它在悬停时显示下划线，并显示焦点环；卡片显示 `active`。

```example
comment/compositions/passage-button
```

### 宽屏与窄屏 {#wide-and-narrow}

评论栏里的卡片和带底部面板的标记是两棵不同的树，所以两者之间的切换在 JavaScript 里完成，而不是用容器查询。`useCommentMarginFits(viewer)` 只在以下情况返回 true：在桌面端，即 768px 起且使用鼠标或触控板（`(width >= 48rem) and (pointer: fine)`，所有桌面端尺寸用的都是这个查询），并且查看器元素（装着文档和评论栏的那个元素）至少 784px 宽（`minWidth`）。它用一个 `ResizeObserver` 观察查看器，所以旁边打开侧栏或消息列时，布局会随之变化。

```example
comment/compositions/viewer
```

- 返回 false 时，改为在每个段落旁边放一个 `CommentMarker`，放在 72px 宽的 `CommentMargin` 里（容得下三个头像和数量），这样标记也不会重叠；讨论在底部面板（[Drawer](../drawer/drawer.md)）里打开。最上面的标记装着针对整篇文档的评论和丢失位置的评论。

```example
comment/compositions/marker-sheet
```

### 高亮 {#highlights}

段落用 CSS Custom Highlight API 高亮：`setCommentHighlights(name, ranges)` 把一组 `Range` 注册到一个高亮名下，由 styles.css 绘制。它从不把文档的文字包进元素，所以文档的 DOM、选区和页内查找都保持原样。

- 把每个有评论的段落注册到 `COMMENT_HIGHLIGHT`（`raft-comment`）下：在页面上叠一层 `brand`（`color-mix`），浅色模式 35%，深色模式 22%（即 `selection` token，深色的底色只在一处维护：[Color](../../../../../design/foundations/color.md#text-selection)），加一条 2px 的 `brand` 下划线。这两个比例是测出来的，不是凭眼睛挑的：段落要从页面上显出来，上面的文字又要能长时间轻松阅读（APCA Lc 75 或以上，即正文的标准）。浅色模式下，35% 让文字保持在 Lc 96（16.5:1）。深色模式下，`brand-soft` 是给菜单行用的 16% 淡色，段落几乎和页面一样（两者之间 1.18:1）；35% 能让段落显出来（2.6:1），但文字降到 Lc 68；22% 两者兼顾：与页面 1.8:1，文字 Lc 77（6.9:1）。
- 激活的那个改为注册到 `COMMENT_HIGHLIGHT_ACTIVE`（`raft-comment-active`）下：`you` 加墨色文字，两种模式都一样，就像搜索命中。每个段落下面的底色是 `brand`，在无聊灰里会变灰；打开的那个段落是发给你的，所以在每个主题里都保持黄色（[主题](../../../../../design/foundations/themes.md#signals)）。
- 调用它返回的函数来清除高亮。在没有 `CSS.highlights` 的浏览器里，它什么也不做，卡片仍然在段落旁边。
- 这些名字对整个页面是全局的：注册一个名字会替换之前注册在它下面的内容。同一时间只让一个查看器（屏幕上的那个）拥有它们，并在它关闭时清除。

## 内容 {#content}

- `CommentCardMeta` 用 sentence case，写成一个事实："2 replies"、"On the whole document"、"Position not found"。
- 时间和消息头部的写法一样，按这个人选择的 12 小时制或 24 小时制：今天的写 11:02，更早的写 Yesterday 17:20（[写作](../../../../../design/content/writing.md#times)）。

## 无障碍 {#accessibility}

这些部件是用 Base UI `useRender` 构建的普通元素；`CommentMarker` 包装了 Base UI `Button`。

- 把评论栏渲染为一个有名称的地标，在 DOM 中放在文档之后：`render={<aside aria-label="Comments" />}`。各项按阅读顺序渲染：先是针对整篇文档的，然后是丢失位置的，再按段落排列。段落本身不能获得焦点，所以按 Tab 会离开文档，从上到下经过各张卡片（或各个标记），读屏软件的地标列表也能直接到达它们。
- 高亮不带任何语义。用 `CommentCardQuote` 说明卡片针对哪个段落（"On “Re-run the guard suites on staging”"），由 `CommentCardTrigger` 或 `CommentMarker` 的 `aria-describedby` 指向它；针对整篇文档或位置丢失时，也让它指向说明这一点的 `CommentCardMeta`。
- 给 `CommentCardTrigger` 一个说明它打开谁的评论的 `aria-label`（"Comment from Martin"）；卡片里的文字在它周围依然可读。
- 打开卡片会移除它的触发按钮，所以要把焦点移进打开的卡片：从键盘打开时（`detail === 0` 的点击），移到回复框；用鼠标点击后，移到卡片本身（`tabIndex={-1}`，`focus({ preventScroll: true })`），这样 Esc 仍然能作用到它。Esc 关闭卡片，并把焦点还给它的触发按钮。
- `active` 会在卡片上设置 `aria-current="true"`。
- 给 `CommentMarker` 一个以它显示的数量开头的 `aria-label`（"2 comments"）。它打开的底部面板需要一个 `DrawerTitle`。
- 在 `CommentEntryTime` 的 `dateTime` 里写出具体时刻（ISO 8601）。

## 规则 {#rules}

- 没有评论的地方什么都不显示：没有空的评论栏，也没有标记。
- 每张卡片都与它的段落对齐；永远不要把锚定在段落上的评论按另一种顺序列成一栏。
- 同一时间只打开一个讨论；只有激活的卡片显示回复框，所以它的发送按钮就是那唯一的粉色按钮（[Button](../button/button.md#which-color)）。
- 回复框用 Composer（[Composer](../composer/composer.md)）；不要另做一个输入框。
