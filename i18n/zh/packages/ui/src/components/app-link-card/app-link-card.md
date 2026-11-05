---
title: AppLinkCard
summary: 应用要求时画在消息本身里的应用链接卡片：Raft 的标题栏写明是哪个应用，用应用的话写条目，按钮用键盘和触屏都能按。
sourceHash: 7fff67b0
---

# AppLinkCard

画在消息里的应用链接卡片，在链接所在段落的后面或替换掉它，用于应用在应答里要求这样画的时候（`placement: "block"`）。它显示的条目和悬停卡片一样（[PreviewCard](../preview-card/preview-card.md#item-card)），顶上是 Raft 写明应用的标题栏，按钮可以就地按，鼠标、键盘、触屏都行。卡片放在消息的什么位置、什么时候 Raft 改显示标签片，见[导航](../../../../../design/patterns/navigation.md#block-cards)。

```example
app-link-card/compositions/with-actions
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 应答要求块的应用链接，在消息本身里 | AppLinkCard |
| 同一个应答，Raft 正从缓存重新获取时 | `AppLinkCardPlaceholder` |
| 其他应用链接，或同一个链接出现在引用、搜索或动态里 | 标签片（[MessageItem](../message-item/message-item.md#app-links)） |
| 标签片的详情，悬停时 | 条目卡片（[PreviewCard](../preview-card/preview-card.md#item-card)） |
| 没有应用预览的网页链接 | 链接卡片（[MessageEmbed](../message-embed/message-embed.md)） |

## 结构 {#anatomy}

所有部件都是实验性的，从 `@botiverse/raft-ui/wip` 导出。

- `AppLinkCard`：卡片本身，用链接卡片的细线外框。必需。
- `AppLinkCardHeader`：顶上 Raft 的一行，下面一条细线。必需：它说明这是谁的卡片。
  - `AppLinkCardIcon`：应用注册的图标，16px。
  - `AppLinkCardName`：应用的名称。
  - `AppLinkCardHost`：链接的主机名，前面一个 "·"。
- `AppLinkCardBody`：条目，离卡片两侧 16px。
  - `AppLinkCardEyebrow`：应用给条目的编号，浅色 Space Mono，一行。
  - `AppLinkCardTitle`：应用给的标题，最多 2 行，然后是省略号。
  - `AppLinkCardMeta`：一个状态，放在中性 Badge 里，后面是一行浅色详情。放不下时换行。
- `AppLinkCardActions`：应用的按钮，在卡片底部的末端。
- `AppLinkCardPlaceholder`：应答加载时代替 `AppLinkCard`。里面放标题栏，条目的几行和一个按钮画成灰条。

正文和按钮就是悬停卡片的：同样的部件、同样的顺序、同样的字体和颜色。看过一张的人，读另一张也一样。

```example
app-link-card/compositions/default
```

## 状态 {#states}

Raft 正在获取一个它缓存里已有、而且要求块的应答时，立刻在原位画 `AppLinkCardPlaceholder`，里面带上应用的标题栏。灰条用的是它们所代表部件的行高，所以它和一张标题两行、带一排按钮的卡片一样大，替换它的卡片让消息尽量少动。没有缓存的应答时，Raft 要等应答回来才知道链接要求块：在那之前链接是加载中的标签片（[导航](../../../../../design/patterns/navigation.md#block-cards)）。

```example
app-link-card/compositions/loading-placeholder
```

应用标为不可用的按钮仍然显示，处于不可用状态，和悬停卡片一样。

## 行为 {#behavior}

- 卡片和悬停卡片一样宽，400px，并且不超过消息的宽度。在手机布局里（768px 以下）它占满消息的宽度，让按钮有手指需要的空间。
- 它和正文里的表格、图片留一样的间距，在消息的最上面和最下面不留。
- 标题最多换到 2 行，然后以省略号结尾；被截断时，应用给它包一个 [Tooltip](../tooltip/tooltip.md) 显示完整标题，和悬停卡片一样。
- 主机名放不下时，丢掉的是开头，绝不是结尾：结尾（`…review.attacker.example`）才说明链接去哪里。

```example
app-link-card/compositions/phone
```

## 内容 {#content}

- 标题栏用 Raft 为这个应用保存的信息来填：注册的图标和名称，然后是链接的主机名。绝不用应答里的内容。
- 正文里用应用发来的原话，应用没发的部分就不显示，不要用 Raft 自己的话补上。
- 按钮的放法和悬停卡片一样：应用的操作按它的顺序取前两个，无边框的在前，有边框的放最后，靠末端；没有操作时，第一个链接（Open in Stamp ↗）占这一行；其他的都放进它们左边的 More 菜单（⋯）（[PreviewCard](../preview-card/preview-card.md#item-card)）。

## 无障碍 {#accessibility}

- `AppLinkCard` 是一个 `group`。用 `aria-labelledby` 指向它的 `AppLinkCardTitle` 的 id 作为标签：用 Tab 走到 Approve 的人，就能听到它批准的是哪个条目，而不是消息文字中间一个孤零零的按钮。
- 和悬停卡片不同，这张卡片就在页面里：它的按钮是真正的按钮和链接，在消息的 Tab 顺序里，用键盘和触屏都能用。
- 标题栏在 DOM 里排在最前面，所以读屏软件先读出应用的名称，再读应用的话。
- `AppLinkCardPlaceholder` 带 `aria-busy`，灰条对辅助技术隐藏；里面的标题栏照常读出。

## 规则 {#rules}

- 一律显示标题栏，由 Raft 根据它为这个应用保存的信息来画，绝不从卡片内容里取。卡片在消息里，就在人们自己的话旁边，按钮在那里也能按：没有 Raft 写明应用的外框，应用的卡片可能被当成系统消息或某个人的话。
- 标题栏开头放应用注册的图标，绝不用应用发来的地址上的图片：每次查看都从应用那里取图，等于告诉应用谁在什么时候读了这条消息；应用也可能画一个冒充 Raft 自己图标的图标。
- 卡片上不用应用的颜色：没有品牌色，没有彩色标题栏。条目的状态只显示一次，用应用的话，放在中性 Badge 里（`appearance="soft"`），和悬停卡片一样（[PreviewCard](../preview-card/preview-card.md#rules)）。
- 在桌面上卡片保持悬停卡片的 400px 宽。和消息一样宽的卡片在宽窗口上会把两行的标题拉成长长的一行，也和消息里其他卡片都不一样。
