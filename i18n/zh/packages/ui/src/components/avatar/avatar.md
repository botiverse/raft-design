---
title: Avatar
summary: 代表一个 Agent 或一个人的方形贴纸：Agent 是像素头像，人是照片或姓名首字母，可以带一个在线状态灯。
sourceHash: 0ca537fe
---

# Avatar

无论 Agent 或人出现在哪里，头像都代表他们：消息、列表、任务负责人、侧边栏、提及建议和个人资料卡。Agent 和人用同样的方形贴纸，由上面的脸说明是谁。频道是一个地方，不是某个人，所以用 [IconTile](../icon-tile/icon-tile.md)。

```example
avatar/compositions/preview
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 一个 Agent 或一个人 | Avatar |
| 在很小的空间里放几个 Agent 或人：成员、关注者、多个负责人、谁在工作 | `AvatarGroup` |
| 频道或其他地方 | [IconTile](../icon-tile/icon-tile.md) |
| 没有脸的东西：系统提示、文件、应用、计算机 | [IconTile](../icon-tile/icon-tile.md) |
| 用文字写出 Agent 或人的状态 | 状态标签（[Status](../status/status.md)） |

## 结构 {#anatomy}

- `Avatar`：贴纸本身。必需。`type` 设定脸下面的填充色；`size` 选择一种头像尺寸。
- `AvatarImage`：Agent 的像素头像或人的照片。可选。
- `AvatarFallback`：图片没加载出来时显示的内容：人的姓名首字母。没有子元素时显示一个占位图标。
- `AvatarBadge`：角上的东西：在线状态灯，或通过 `render` 画在那个位置的其他东西。可选。
- `AvatarGroup`：互相重叠的一叠头像。
- `AvatarGroupCount`：一叠头像末尾的 +N 标签片，`size` 与旁边的头像相同。

## 变体 {#variants}

### 脸 {#faces}

| `type` | 脸 | 填充 |
| --- | --- | --- |
| `type="agent"` | Agent 的像素头像，是 [`design/assets/Agents`](../../../../../design/assets/Agents/) 里 72 个之一；没选时用 `robot` | 像素头像自带的填充色；图片加载完之前是 `inactive` |
| `type="human"` | 照片，或 1 到 2 个姓名首字母 | `palette-lavender-*` |
| `type="server"` | 服务器的 logo，或黄色（`brand`）的首字母；即工作空间图块 | `sticker-ink` |

```example
avatar/compositions/panel-header
```

同样的方块还有两种用法，raft-ui 里暂时没有对应的变体：

- **工作空间图块**：服务器自己的图片，或墨色底上 `brand` 色的首字母，位于桌面端导航条顶部。
- **未认领**：一张带 `plus` 图标的空贴纸，用于没人认领的任务。

### 尺寸 {#sizes}

头像尺寸是 8 的倍数加上两条 1.5px 的边，这样脸上的像素保持均匀（[间距](../../../../../design/foundations/spacing.md#avatar-sizes)）。

| `size` | 用于 |
| --- | --- |
| `xs`、`2xs`（19px） | 侧边栏、标签片、头像叠 |
| `sm`（27px） | 搜索结果、顶栏 |
| `md`（35px） | 消息和列表 |
| `lg`（51px） | 设置里你自己那一行、个人资料卡 |
| `xl`（99px） | Agent 或人的个人资料页，以及服务器设置的最后一步。它带 `shadow-sticker`，作为品牌插画（[品牌](../../../../../design/foundations/brand.md#how-much-brand)） |

### 在线状态灯 {#presence-lights}

`AvatarBadge` 接受一个 `presence`：`online`、`busy`（工作中）、`error`、`offline` 或 `external`（不在这个服务器任何一台计算机上的 Agent）。颜色见[颜色](../../../../../design/foundations/color.md#statuses)。

- 灯的大小保持在头像的三分之一左右或更小，这样它标出角落而不遮住脸：`md`（35px）上 11px，`sm`（27px）上 9px，`xs` 和 `2xs`（19px）上 7px，小尺寸的灯带 1px 的边。唯一的例外是人的头像上的助理的脸（[角落](#the-corner)）。

```example
avatar/compositions/badge-presence
```

### 角落 {#the-corner}

右下角一次只放一样东西：

| 头像 | 角上放的是 |
| --- | --- |
| Agent | 它的在线状态灯 |
| 人，在助理替他发的消息上 | 助理的脸，`2xs`，外面围一圈表面色（[`MessageItemDelegatedAvatar`](../message-item/message-item.md#sent-by-an-assistant)） |
| Agent 或人，作为动态里消息列行的前置图像 | 消息列徽标，不放在线状态灯（[`InboxItemLeadingBadge`](../inbox-item/inbox-item.md#the-leading-image)） |
| 人，在其他任何地方 | 什么都不放 |

- 助理的脸占用在线状态灯的位置，伸出去的距离也一样：在 `md` 上同样露出头像边缘 2.5px，这样两者看起来是同一类标记。
- 这张脸是「头像的三分之一或更小」的例外：它是 `2xs`（19px），其中 15px 压在 35px 的头像上，算上外圈约占头像宽度的 47%，但面积只占五分之一。脸要能认出来，而 19px 是像素脸能被分辨的最小尺寸；灯只需要被看到。人的姓名首字母或照片在它的左上方，仍然看得清。由 stdrc 于 2026-10-21 决定（RFC 077）。
- 在动态里的消息列行上，消息列徽标占用在线状态灯的角落，和频道图块上的是同一个徽标：这一行讲的是消息列，而不是 Agent 现在的状况（[InboxItem](../inbox-item/inbox-item.md#the-leading-image)）。
- 不要在 Agent 的头像上放脸：它的角落是在线状态灯，放一张脸会挡住 Agent 是否在工作（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)）。

## 状态 {#states}

- **可编辑**（你自己的头像、你的服务器的头像、你管理的 Agent 的头像）：悬停、键盘聚焦和上传过程中，用 `layer-backdrop` 盖住整张贴纸，再放上操作的图标（上传或编辑）。所有操作都用这一个叠加层，并且聚焦时和悬停时一样显示，让键盘用户也能知道头像可以编辑。raft-ui 还没有这个部件；在 `Avatar` 外面自己组合。

## 行为 {#behavior}

- `AvatarImage` 在加载中或加载失败时保持隐藏，由 `AvatarFallback` 显示在原位。
- 在 `AvatarGroup` 里，每个头像与前一个重叠 5px。「谁在工作」的头像叠显示几张脸，见[工作中的 Agent](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now)。
- 有人加入或离开头像叠时，脸会滑动并淡入淡出（[动效](../../../../../design/foundations/motion.md#usage)）。
- 在深色模式下，头像保持原来的颜色，并加上模切边（[深色模式](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)）。

## 内容 {#content}

- 没有照片的人，用淡紫色底上的姓名首字母表示，不用人形图标：图标只能说明「这是一个人」，首字母能让人在没有照片时也能区分彼此。
- 写 1 或 2 个首字母；在 `xs`、`2xs` 和 `sm` 上只写 1 个，因为放不下 2 个。
- 不要自己设定首字母的字号：`AvatarFallback` 根据头像的 `size` 决定（[字体排印](../../../../../design/foundations/typography.md#usage)）。
- 示例里，Wug 的像素头像是 `crown`，Bugen 的是 `mushroom`。

## 无障碍 {#accessibility}

`Avatar` 封装了 Base UI 的 Avatar，由它跟踪图片是否已加载。raft-ui 在此基础上加了尺寸、填充色和在线状态灯。

- 给 `AvatarImage` 一个 `alt`：头像单独出现时写名字；名字就在旁边时留空，避免读两遍。
- 给在线状态灯加 `role="img"` 和说明状态的 `aria-label`（Online、Working、Error、Offline、External agent），除非旁边已经有这个词。
- 给头像叠一个带完整人数的无障碍名称（"5 agents working"），因为 `AvatarGroupCount` 只显示 "+3"。
- 可编辑的头像做成 `<button>`，`aria-label` 写明操作（"Change avatar"），键盘聚焦时也显示叠加层：否则只有鼠标用户能发现它可以更改。

## 规则 {#rules}

- 不要靠形状区分 Agent 和人。必须明确区分时，在名字后面加 `agent` 标记（[Status](../status/status.md#agent-tag)）。
- 每个 Agent 只用一个像素头像，在整个产品里都一样。
- 像素头像和它的填充色要一起用：新的像素头像带着自己的填充色。不要给 Agent 单独指定颜色。
- 只用这五种头像尺寸。不要做 32px 或 40px 的头像：脸上的像素会不再均匀。`3xs`（14px）不在这套尺寸里。
- 在线状态灯不要闪烁，也不要做呼吸效果（[动效](../../../../../design/foundations/motion.md)）。
- 角上只放一样东西：在线状态灯、人的头像上助理的脸，或消息列行上的消息列徽标，不要同时放其中两样（[角落](#the-corner)）。
- 在线状态灯周围的空隙，用头像所在表面的颜色填充（卡片、侧边栏、外框、弹出层），让灯看起来是从表面上切出来的。
