---
title: 图标
summary: 图标集、描边和颜色、各场景的图标尺寸，以及哪些东西不是图标。
sourceHash: b0de1434
---

# 图标

Raft 的图标是 Lucide 图标，来自 `lucide-react`，描边宽度为 2。图标从周围的文字继承颜色（`currentColor`）。

## 原则 {#principles}

- **只用 Lucide。** 需要新图标时，取 Lucide 里对应名字的图标。raft-ui 自己画了几个 Lucide 没有的图标，用于几种对话、Artifact，以及关注、加入、添加和重新打开；它们遵循 Lucide 的网格和线条粗细（[Icons](../../packages/ui/src/components/icons/icons.md)）。
- **像素头像不是图标。** 它们只代表 Agent，见 [Avatar](../../packages/ui/src/components/avatar/avatar.md)。
- **Emoji 是内容，不是图标。** 不要把 emoji 当图标用。回应里的 emoji 是内容，见 [品牌](./brand.md#reactions)。
- **不用闪光图标。** 不要用闪光、星星或类似的图标来标记 Agent 或 AI，见 [身份与在线状态](../people-and-agents/identity-and-presence.md#rules)。

## 含义 {#meanings}

- **同一屏上，一个图标只有一个含义。** 一屏上两样不同的东西或两个不同的操作，从不共用一个图标。新加的东西要用的图标已经在这一屏上时，给其中一个换一个图标。
- **一个概念一个图标。** 一个概念取 Lucide 的一个图形，在所有地方都用它，不用它的变体：用 `clock`，不用 `clock-3`；用 `settings`，不用 `settings-2`；用 `lock`，不用 `lock-keyhole`。
- **More 在一排操作里是 `ellipsis`，作为一个对象的菜单是 `ellipsis-vertical`。** 横向的 ⋯ 放在横向工具栏或操作行的末尾，它的点接着旁边那排操作排下去：消息的悬停工具栏、选择工具栏。竖向的 ⋮ 打开一个对象的菜单，放在面板标题栏、卡片或列表行的尾端。
- **Back 是 `arrow-left`，不是 V 形箭头**，Forward 是 `arrow-right`（[对齐](./alignment.md#the-ends-of-a-header)）。V 形箭头用来在一组东西里翻页，比如上一张和下一张图片，或者展开和收起一个分区。
- **成功是 `circle-check`；错误或警告是 `triangle-alert`**，和 [Banner](../../packages/ui/src/components/banner/banner.md) 与 [Toast](../../packages/ui/src/components/toast/toast.md) 画的一样。不用 `circle-check-big` 或 `circle-alert`。
- **重新打开（Reopen）不是重新开始（restart）。** `rotate-ccw` 表示重新开始或重置，所以 Reopen Task 有自己的图标 `ReopenTaskIcon`（[Icons](../../packages/ui/src/components/icons/icons.md#action-icons)）。
- **只用描边图标。** 不要把图标填实来表示一种状态，比如已收藏：开关显示的是它提供的操作（从 Saved 里移除用 `bookmark-minus`）。媒体播放器的 Play 和 Pause 是例外。

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| 36px | 空状态 |
| 22px | 顶栏、标签栏、手机上 `icon-lg` 的图标按钮（44px） |
| 20px | 导航条、列表行、横幅、底部面板里的行 |
| 18px | 按钮内部、32px 的图标按钮（`icon-md`，以及桌面端的 `icon-lg`）、频道图块 |
| 16px | 小按钮、消息的悬停工具栏、分段控件、菜单、标签页 |
| 14px | 标签片、引用标签片、筛选、值标签片 |
| 11px 到 12px | 小频道图块、事件行、徽标、状态标签片里的箭头 |

### 小尺寸下的标记 {#a-mark-at-small-sizes}

一个图形用于所有尺寸：Lucide 没有哪个图标画了两遍。自己画的图标，如果它的标记在 16px 及以下看不清，可以多带一个用于小尺寸的标记，画在同一个网格上，由图标上的容器查询（`data-icon-sizes`，在 raft-ui 的样式表里）在 18px 以下换上。图形的其余部分不变，从 18px 起，图标就只是那一个图形。只有 `UnfollowArtifactIcon` 有这样的标记：在 16px 时它的减号更粗、更长，这样它读起来是一个标记，而不像页面上又多了一行文字（[Icons](../../packages/ui/src/components/icons/icons.md#action-icons)）。只有图标在它实际使用的尺寸下标记看不清时才加，不要用它来微调一个本来就看得清的图标。

## 相关 {#related}

- [Button](../../packages/ui/src/components/button/button.md)：图标按钮及其尺寸。
- [品牌](./brand.md)：logo 和回应。
