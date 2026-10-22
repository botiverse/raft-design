---
title: PreviewCard
summary: 人悬停或聚焦到提及、名字或应用链接上时出现的只读卡片，说明某人是谁或应用的某个条目是什么，最多带两个小按钮。
sourceHash: 8340566f
---

# PreviewCard

预览卡是人悬停或聚焦到正文里的某样东西上时出现的只读卡片，让人不离开对话就能知道它是什么。它有两种用途：人或 agent 的资料卡，出现在提及或名字上（比如 @Bugen），带头像、名字和一行状态；以及应用链接的条目卡片，比如消息链接到的一个 pull request，带它的标题和应用提供的详情。两种都最多带两个小按钮。Raft Chat 的资料卡没有按钮（[Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)）。

```example
preview-card/preview-card-mention
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 悬停时显示一个人或一个 agent | PreviewCard，作为资料卡 |
| 悬停在标签片上时，显示应用链接到的条目 | PreviewCard，作为条目卡片（[条目卡片](#item-card)） |
| 悬停时显示关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 点击时显示一个选择或一个输入框 | [Popover](../popover/popover.md) |
| 保持打开的完整资料 | 资料页面或侧面板 |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `PreviewCard`：根节点。必需。
- `PreviewCardTrigger`：打开卡片的提及、名字或标签片，通常是指向它所指之处的链接。必需。
- `PreviewCardContent`：卡片本身，300px 宽，通过 portal 渲染，定位在触发元素下方。必需。
- `PreviewCardHeader`：大号 [Avatar](../avatar/avatar.md)，旁边是名字和名字下面那一行。
- `PreviewCardTitle`：名字，一行；在 `PreviewCardBody` 里是条目的标题，会换行。
- `PreviewCardSeparator`：头部下方的细线。
- `PreviewCardDescription`：状态行，一行，超出截断。
- `PreviewCardArrow`：可选的指向触发元素的箭头。
- `PreviewCardPortal` 和 `PreviewCardPopup`：底层部件。`PreviewCardPopup` 是不带定位的卡片表面。

条目卡片另外用到下面这些部件，它们是实验性的，在设计获批前从 `@botiverse/raft-ui/wip` 导出：

- `PreviewCardBody`：放编号行、标题和详情行的区块，距卡片边缘 16px。
- `PreviewCardEyebrow`：标题上方的编号行，`foreground-muted` 的 Space Mono，一行，超出截断。
- `PreviewCardMeta`：标题下方的一行：状态放在中性的 Badge 里，后面是一行弱化的详情。空间不够时换行。
- `PreviewCardActions`：最多两个按钮的一行。
- `PreviewCardFooter`：底部细线下的一行说明：应用和主机名。

## 条目卡片 {#item-card}

应用链接在悬停时打开的卡片（[应用链接](../../../../../design/patterns/navigation.md#app-links)）。应用提供文字以及有哪些详情；Raft 决定它们的顺序和颜色。各部件按读者依次会问的问题排列：

1. **是哪个条目？** `PreviewCardEyebrow`：应用给它的编号，比如 `botiverse/slock#10449`。可选。
2. **讲的是什么？** `PreviewCardTitle`：应用给的标题，用墨色，最多 3 行。不用 `foreground-link`：卡片本身不是链接，它的按钮和标签片才是。
3. **进展到哪了？** `PreviewCardMeta`：一个用应用的话写的状态标签，比如 Merged，然后是一行弱化的详情，比如 "Martin · +803 −498"。
4. **我能做什么？** `PreviewCardActions`：应用提供的最多两个按钮，比如 Open in Stamp。
5. **是谁说的？** `PreviewCardFooter`：应用的名称和链接的主机名，"Stamp · stamp.build"。

```example
preview-card/preview-card-app-item
```

读者允许这个应用之前，标签片保持灰色并显示地址，不带卡片：卡片是只读的，上面的按钮用键盘和触屏都够不到。在标签片上点击、点按或按 Enter，会打开一个 [Popover](../popover/popover.md) 来提问，所有设备都一样：标题是一个问题，一句话说明允许后会怎样，「Open Link」不带预览直接打开，「Show Previews」允许预览。

```example
preview-card/preview-card-app-prompt
```

## 行为 {#behavior}

- 鼠标指针停在触发元素上，卡片几乎立刻打开；离开后很快关闭。延迟比 Base UI 默认的短，这样满是提及的密集消息不会显得迟钝。
- 触发元素获得键盘焦点时也会打开。
- 卡片在触发元素下方打开，与其起始边对齐，到了窗口边缘会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。

## 内容 {#content}

- 对 agent，先说它现在在做什么，再说它是谁："Reviewing #25" 加上它的在线状态灯，然后是它的角色和运行位置。
- 对人，显示其角色和当地时间。
- 在条目卡片上，按应用发来的原样显示它的文字；应用没发的部分就不显示，不要用 Raft 自己的内容去填。
- 按钮用 Title Case：Message、View Profile、Open in Stamp。

## 无障碍 {#accessibility}

- PreviewCard 封装了 Base UI 的 PreviewCard。悬停或聚焦触发元素时打开，按 Esc 关闭。
- 卡片是补充信息，触屏上不会打开，键盘也够不到上面的按钮：焦点会从触发元素移走，卡片随之关闭。把触发元素做成真实链接，指向资料页或应用的条目，这样卡片上的一切都能通过别的途径获取：条目卡片上的按钮只是一个捷径，指向链接打开的那一页上已有的东西，比如拉取请求的 View Changes。

## 规则 {#rules}

- 卡片保持只读：没有输入框，没有选择。需要人填写的东西用 [Popover](../popover/popover.md)。
- 卡片上最多放两个小按钮，颜色按 [Popover](../popover/popover.md#rules) 的规则：绝不用粉色。
- 条目的状态只显示一次，用应用自己的话，放在中性的 Badge（`appearance="soft"`）里：不用状态颜色，也不用状态灯。条目有哪些状态、各自是什么意思，是应用的概念，不是 Raft 的；Raft 的状态颜色和状态灯表示任务和在线状态（[Status](../status/status.md#rules)），把应用的 "Merged" 对应到任务的 "done"，就是把 Raft 的理解加在应用的用词上。
- 条目卡片上不使用应用的颜色：没有品牌色，没有彩色头部。标签片上的应用图标是它唯一的自有标记。
