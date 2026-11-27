---
title: PreviewCard
summary: 人悬停或聚焦到提及、名字或应用链接上时出现的只读卡片，说明某人是谁或应用的某个条目是什么，最多带两个小按钮。
sourceHash: 34866348
---

# PreviewCard

预览卡是人悬停或聚焦到正文里的某样东西上时出现的只读卡片，让人不离开对话就能知道它是什么。它有两种用途：人或 Agent 的资料卡，出现在提及或名字上（比如 @Bugen），带头像、名字和一行状态；以及应用链接的条目卡片，比如消息链接到的一个 pull request，带它的标题和应用提供的详情。两种都最多带两个小按钮。Raft Chat 的资料卡没有按钮（[Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)）。

```example
preview-card/preview-card-mention
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 悬停时显示一个人或一个 Agent | PreviewCard，作为资料卡 |
| 悬停在标签片上时，显示应用链接到的条目 | PreviewCard，作为条目卡片（[条目卡片](#item-card)） |
| 悬停时显示关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 点击时显示一个选择或一个输入框 | [Popover](../popover/popover.md) |
| 保持打开的完整资料 | 资料页面或侧面板 |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `PreviewCard`：根节点。必需。
- `PreviewCardTrigger`：打开卡片的提及、名字或标签片，通常是指向它所指之处的链接。必需。
- `PreviewCardContent`：卡片本身，通过 portal 渲染，定位在触发元素下方：个人资料卡片 300px 宽；条目卡片要放下标题、状态和按钮，用 `size="item"`，400px 宽。按卡片显示什么来选，而不是按它用了哪些部件：显示一个条目（它的标题，加上状态或详情）的卡片用 `size="item"`；只请人做一步的卡片，比如连接一个账户，保持默认的 300px，即使它用 `PreviewCardBody` 来放那句话；这时它取正文的 12px 内边距，标题取卡片标题的字号，和它通向的条目卡片一样。必需。
- `PreviewCardHeader`：大号 [Avatar](../avatar/avatar.md)，旁边是名字和名字下面那一行。
- `PreviewCardTitle`：名字，一行；在 `PreviewCardBody` 里是条目的标题，即消息里卡片的标题，会换行。
- `PreviewCardSeparator`：头部下方的细线。
- `PreviewCardSubtitle`：状态行，即关于这个对象的数据，一行，超出截断。以前叫 `PreviewCardDescription`。
- `PreviewCardArrow`：可选的、指向触发元素的箭头，卡片从哪一侧打开，它就在哪一侧，和 `PopoverArrow` 一样。卡片会裁掉超出它的部分，所以带箭头的卡片要允许内容超出（`overflow-visible`）。
- `PreviewCardPortal` 和 `PreviewCardPopup`：底层部件。`PreviewCardPopup` 是不带定位的卡片表面。

条目卡片另外用到下面这些部件，它们是实验性的，在设计获批前从 `@botiverse/raft-ui/wip` 导出：

- `PreviewCardBody`：放编号行、标题和详情行的区块，距卡片边缘 12px。卡片由它的各部分竖着排成一列，最高到可用的空间（`--available-height`）；超过这个高度，正文滚动，被截断的边缘渐隐，而头部、按钮行和底注保持自己的高度，和 [PopoverBody](../popover/popover.md#a-long-popover) 一样。它的部件、按钮行和底注都是消息里卡片的部件（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md#popovers)），所以悬停卡片和块卡片（[AppLinkCard](../app-link-card/app-link-card.md)）保持一致。
- `PreviewCardEyebrow`：标题上方的编号行，`foreground-muted` 的 Space Mono，一行，超出截断。
- `PreviewCardMeta`：标题下方的一行：状态放在中性的 Badge 里，应用发来颜色时用应用的颜色，后面是一行弱化的详情。空间不够时换行。
- `PreviewCardActions`：最多两个按钮的一行，靠卡片末端，和消息里的卡片一样离边缘 12px：确认按钮放在最后。第三个操作放进应用的卡片自己提供的更多菜单（⋯）；按钮旁边的状态行在按钮换行之前先单独占一行（[按钮](../../../../../design/patterns/cards-in-messages.md#buttons)）。
- `PreviewCardFooter`：底部细线下的一行说明：应用和主机名。

## 条目卡片 {#item-card}

应用链接在悬停时打开的卡片（[应用链接](../../../../../design/patterns/navigation.md#app-links)）。应用提供文字以及有哪些详情；Raft 决定它们的顺序和颜色。各部件按读者依次会问的问题排列：

1. **是哪个条目？** `PreviewCardEyebrow`：应用给它的编号，比如 `botiverse/slock#10449`。可选。
2. **讲的是什么？** `PreviewCardTitle`：应用给的标题，用墨色，最多 2 行，超出部分用省略号截断；只有被截断时，应用才把它包在一个 [Tooltip](../tooltip/tooltip.md) 里，悬停时显示完整标题（不用原生的 `title`）；`PreviewCardTitle` 自己不加。始终用墨色，不用 `foreground-link`。在桌面和手机网页上，卡片本身不是链接，它的按钮和标签片才是；在 iOS 和安卓 App 里，标题会打开条目，因为卡片在那里盖住了标签片（[应用链接](../../../../../design/patterns/navigation.md#app-links)）。
3. **进展到哪了？** `PreviewCardMeta`：一个用应用的话写的状态标签，比如 Merged，应用发来颜色时用应用的颜色，然后是一行弱化的详情，比如 "Martin · +803 −498"。同一行的详情之间用 "·" 分隔，但状态标签旁边不加：状态标签靠自己的填充就已经和别的内容分开了。
4. **我能做什么？** `PreviewCardActions`：应用提供的最多两个按钮，在卡片末端排成一行：
   - 应用的操作按钮（Approve），按应用的顺序取前两个。没有操作按钮时，由第一个链接（Open in Stamp ↗）占这一行。在 iOS 和安卓 App 里，标题会打开条目，指向条目的链接放进 ⋯，不占这一行（[应用链接](../../../../../design/patterns/navigation.md#app-links)）。
   - 无边框的按钮在前，带边框的那个放在最后，在最右端。
   - 其他的一切，比如 Refresh、更多的链接和其余的操作，按应用的顺序放进它们左边的 More 菜单（⋯），绝不换到第二行，也绝不丢掉。菜单里的链接是带离开标记（↗）的链接项。菜单与它的按钮末端对齐打开（`align="end"`），所以它留在卡片上方。
   - 应用的某个操作执行时，这一行的按钮和菜单里的项都禁用；More 按钮保持可用，人仍然能看到里面有什么。一行带 [Spinner](../spinner/spinner.md) 的状态文字说明这一点，和[消息里的卡片](../../../../../design/patterns/cards-in-messages.md#buttons)一样放在按钮旁边。它由 Raft 来写，不由应用写，用的词也不是任务状态：写 "Working…"，绝不写 In progress，因为条目卡片上没有任何东西带有任务的含义（[规则](#rules)）。应用禁用的菜单项把应用给出的原因显示为第二行，因为菜单项没有工具提示（[DropdownMenu](../dropdown-menu/dropdown-menu.md#states)）。
   - 要求确认的操作会在卡片外打开一个 `size="sm"` 的 [Dialog](../dialog/dialog.md#variants)：悬停卡片在鼠标指针离开时就会关闭，所以确认不能放在卡片里面。确认写什么、按钮怎么上色，见[反馈](../../../../../design/patterns/feedback.md#confirming)；对 Raft 没有审核过的应用，Raft 额外加了什么，见 [AppLinkCard](../app-link-card/app-link-card.md#the-confirmation-for-an-app-raft-hasnt-reviewed)。
   - 这是网页版现在的做法，这里还没有示例：slock 的 `packages/web/src/components/message/LinkCardActions.tsx` 画出状态文字（`LinkCardActions`）、禁用项的原因（`LinkCardMenuItem`）和确认（`LinkCardConfirmDialog`）。其中两处和本页还不一致：确认仍然是 AlertDialog，操作执行时状态文字写的是 "In progress"。
5. **是谁说的？** `PreviewCardFooter`：应用的名称和链接的主机名，"Stamp · stamp.build"。在 iOS 和安卓 App 里，名称前带上应用的 16px 图标，和标签片上的一样，与名称相隔 4px：卡片在那里盖住了桌面上显示图标的标签片。

```example
preview-card/preview-card-app-item
```

读者允许这个应用之前，标签片保持灰色并显示地址，不带卡片：卡片是只读的，上面的按钮用键盘和触屏都够不到。在标签片上点击、点按或按 Enter，会打开一个 [Popover](../popover/popover.md) 来提问，所有设备都一样：标题是一个问题，一句话说明允许后会怎样，"Open link" 不带预览直接打开，"Show previews" 允许预览。它是关于这个条目的弹出层（`size="item"`，[Popover](../popover/popover.md#about-an-item)）：400px，带条目卡片的 12px 内边距和标题，所以这个问题看起来像它通向的那张卡片（stdrc，2026-11-10）。个人资料卡片讲的是一个人，不是条目，保持 16px。

```example
preview-card/preview-card-app-prompt
```

## 行为 {#behavior}

- 鼠标指针停在触发元素上，卡片几乎立刻打开；离开后很快关闭。延迟比 Base UI 默认的短，这样满是提及的密集消息不会显得迟钝。
- 触发元素获得键盘焦点时也会打开。
- 卡片在触发元素下方打开，与其起始边对齐，到了窗口边缘会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 它避开窗口安全区：外壳给自己留了一部分窗口（`--raft-frame-inset-top`、`--raft-frame-inset-start`、`--raft-frame-inset-end`）时，它停在离那部分 8px 的地方，而不是离窗口边缘 8px。start 和 end 两个安全区是顶部那条带的两个角，所以只有触发元素在这条带里时才算；在带下面，它保持自己到窗口边缘的内边距（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。网页一个都不设。

## 内容 {#content}

- 对 Agent，先说它现在在做什么，再说它是谁："Reviewing #25" 加上它的在线状态灯，然后是它的角色和运行位置。
- 对人，显示其角色和当地时间。
- 在条目卡片上，按应用发来的原样显示它的文字；应用没发的部分就不显示，不要用 Raft 自己的内容去填。
- 按钮用 sentence case：Message、View profile、Open in Stamp。

## 无障碍 {#accessibility}

- PreviewCard 封装了 Base UI 的 PreviewCard。悬停或聚焦触发元素时打开，按 Esc 关闭。
- 在桌面和手机网页上，卡片是补充信息，触屏上不会打开，键盘也够不到上面的按钮：焦点会从触发元素移走，卡片随之关闭。把触发元素做成真实链接，指向资料页或应用的条目，这样卡片上的一切都能通过别的途径获取：条目卡片上的按钮只是一个捷径，指向链接打开的那一页上已有的东西，比如 pull request 的 View changes。iOS 和安卓 App 则是点一下就打开 App 链接的卡片（[应用链接](../../../../../design/patterns/navigation.md#app-links)）。

## 规则 {#rules}

- 卡片保持只读：没有输入框，没有选择。需要人填写的东西用 [Popover](../popover/popover.md)。
- 卡片上最多放两个小按钮，排成一行：绝不用粉色，确认按钮用墨色描边（`variant="outline"`），另一个无边框，和消息里的卡片一样（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md#buttons)）。
- 条目的状态只显示一次，用应用自己的话，放在中性的 Badge（`appearance="soft"`）里：不用 Raft 的任何状态颜色，也不用状态灯。条目有哪些状态、各自是什么意思，是应用的概念，不是 Raft 的；Raft 的状态颜色和状态灯表示任务和在线状态（[Status](../status/status.md#rules)），把应用的 "Merged" 对应到任务的 "done"，就是把 Raft 的理解加在应用的用词上。
- 应用为状态发来颜色时，徽标就用这个颜色：带 `fill` 和 `surface="popover"` 的 `AppLinkCardBadge`，和应用在消息里的卡片上用的是同一个徽标、同样的规则（[AppLinkCard](../app-link-card/app-link-card.md#the-apps-color)）。这个颜色是应用自己对它的状态的表达，卡片在底部说明了它是谁的。只发悬停卡片的应用（比如 Stamp 对 pull request 就是这样），否则就根本没有地方显示这个颜色：2026-11-14 之前只有消息里的卡片用它，没有哪个 Stamp 链接显示过颜色（#proj-apps:#51）。
- 应用标为警告的一行（`tone: "warning"`，比如「2 checks failing」）用 `warning-strong`，和 raft-ui 自己的警告行一样。这是 Raft 表示警告的颜色，不是应用表示状态的颜色：状态的 Badge 只用应用自己的颜色，卡片上别的东西都不上色。
- 条目卡片上不使用应用的其他颜色：没有品牌色，没有彩色头部。应用的图标（在标签片上，以及 App 里卡片的底栏）和状态徽标的填充色是它仅有的自有标记。
