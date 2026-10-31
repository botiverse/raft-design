---
title: Icons
summary: raft-ui 自己绘制的图标：五个表示对话类型，一个表示 Artifact，十三个用于关注、加入、添加、创建（已弃用）和重新打开；其他图标都来自 Lucide。
sourceHash: 3fd3e1a5
---

# Icons

raft-ui 自己导出几个图标，用于 Lucide 没有图标的含义。五个表示对话类型：`MessageIcon`、`DirectMessageIcon`、`ThreadIcon`、`CommentIcon` 和 `FeedbackIcon`。`ChatIcon` 是 `MessageIcon` 的另一个名字：消息和聊天共用一个图标。`ArtifactIcon` 表示 Artifact。十三个用来标示操作：关注消息列或 Artifact、加入或离开频道、添加评论、创建任务（已弃用：现在由 Lucide 的 `plus` 来做）和重新打开任务（[操作图标](#action-icons)）。Raft 里的其他图标都来自 Lucide。所有图标的规则（图标集、描边、颜色和不同场景下的尺寸）见[图标](../../../../../design/foundations/iconography.md)。

```example
icons/icons
```

```example
icons/action-icons
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 用图标表示消息或聊天 | `MessageIcon`（`ChatIcon` 是同一个图标） |
| 用图标表示私信或消息列 | `DirectMessageIcon`、`ThreadIcon` |
| 评论：评论开关、评论数、还没有评论 | `CommentIcon` |
| 给 Raft 团队的反馈：Feedback 菜单项、对反馈的回复 | `FeedbackIcon` |
| Artifact：Save as Artifact、Artifacts 页面、侧面板里的 Artifact 卡片 | `ArtifactIcon` |
| 关注消息列或 Artifact、加入或离开频道、添加评论、重新打开任务 | 对应的操作图标（[操作图标](#action-icons)） |
| 从消息创建任务 | Lucide 的 `plus`：创建就是加号（[操作图标](#action-icons)） |
| 任务的状态 | `TaskStatusIcon`（[Tasks](../tasks/tasks.md)） |
| 其他任何图标 | 同名的 Lucide 图标（[图标](../../../../../design/foundations/iconography.md#principles)） |
| Agent | 它的像素头像（[Avatar](../avatar/avatar.md)），不用图标 |
| 名称旁边的频道或其他地方 | 频道图块（[IconTile](../icon-tile/icon-tile.md)） |

## 结构 {#anatomy}

- `MessageIcon`：一个对话气泡。
- `ChatIcon`：和 `MessageIcon` 是同一个图标，以另一个名字导出。
- `DirectMessageIcon`：带一个人像的对话气泡。
- `CommentIcon`：带引号的对话气泡。评论是针对一段文字说的，所以它带着那段文字的引号。
- `FeedbackIcon`：带感叹号的对话气泡，大多数应用用这个标记表示反馈：一个想法或一个问题，告诉 Raft 团队。
- `ThreadIcon`：两个重叠的对话气泡，都只有描边。Raft 里的每个图标都是同一粗细的线描；实心的气泡在菜单或工具栏里比旁边的每个 Lucide 图标都显得重（stdrc, 2026-10-23）。后面的气泡在两侧都停在离前面气泡一个描边宽度的地方，所以重叠处看起来是一道空隙，而不是连在一起，两个气泡连同描边都在 18px 的框内。

`MessageIcon`、`DirectMessageIcon`、`CommentIcon` 和 `FeedbackIcon` 的气泡是同一个；变的只是气泡里的标记。消息和聊天共用不带标记的普通气泡：Raft 不区分它们，所以 `ChatIcon` 就是 `MessageIcon`（stdrc 和 Artea，2026-10-30）。私信、评论、反馈和消息列各自保留自己的图标，所以这几种从不共用一个图标。

每个都是 18px 的 `svg`，用 `currentColor` 绘制，所以会继承周围文字的颜色。按所在的场景用 class 设置尺寸（[图标](../../../../../design/foundations/iconography.md#sizes)）。

它们的线条在 18px 网格上是 1.5，和 Lucide 在 24px 网格上的 2 一样粗，所以在任何尺寸下都和旁边的 Lucide 图标一致：16px 时是 1.33px，和 Lucide 的一样。线条为 1 时，16px 下只有 0.89px，比菜单或工具栏里周围的每个图标都细。

`ArtifactIcon` 是一个人做出来的页面：一张没有折角的页面，像网页那样排布，一个标题块压在两行文字上面。它没有折角，这样就不会被读成 Lucide 的某个 `file` 图标，那些图标说明的是 Artifact 卡片里装的是哪种内容（`file-text`、`file-code`）。它是 Lucide 网格上的 24px `svg`，线条为 2，和操作图标一样。

## 操作图标 {#action-icons}

每个图标标示一个操作，放在菜单项里或按钮上，在操作名称旁边：

| 图标 | 标示 |
| --- | --- |
| `FollowThreadIcon` | Follow Thread：在消息菜单、消息列的 More 菜单和收件箱里一行的菜单里 |
| `UnfollowThreadIcon` | Unfollow Thread，位置相同 |
| `JoinChannelIcon` | 加入频道：在这个人还没加入的频道里的 Join 按钮（"Join #design"、"Join channel to reply"）。在公开页面上可读的频道也用它 |
| `LeaveChannelIcon` | 普通频道的 Leave Channel |
| `JoinPrivateChannelIcon` | 加入私有频道。私有频道只能通过邀请加入，所以它放在接受邀请的操作上 |
| `LeavePrivateChannelIcon` | 私有频道的 Leave Channel |
| `JoinJointChannelIcon` | 加入联合频道：管理员接受把本服务器拉进来的邀请 |
| `LeaveJointChannelIcon` | 联合频道的 Leave Channel |
| `FollowArtifactIcon` | Follow Artifact：在 Artifact 的菜单里和 Artifacts 页面上 |
| `UnfollowArtifactIcon` | Unfollow Artifact，位置相同 |
| `AddCommentIcon` | Add Comment：对 Artifact 或文件里的一段文字写评论 |
| `CreateTaskIcon` | 已弃用：没有地方在用。从消息 Create Task 用的是 Lucide 的 `plus`（stdrc 和 Artea，2026-10-30）。仍然导出；新的工作里不要用它 |
| `ReopenTaskIcon` | Reopen Task：把完成的任务改回未完成 |

按操作所在频道的类型选频道图标，也就是频道自己的图标显示的那种类型（`hash`、`lock`、`git-branch`；[Raft Chat 频道](../../../../../design/products/raft-chat/channel.md)）。

它们画在 Lucide 的网格上：24px 的 `svg`，线条为 2，圆头、圆角连接，用 `currentColor`。一对图标共用一个图形，只换其中的标记，关注或加入用加号，取消关注或离开用减号，这样两者读起来是一条命令和它的反面：

- 消息列这一对是 24px 的 `ThreadIcon`，标记在前面的气泡里，和 Lucide 的 `message-circle-plus` 的放法一样。
- Artifact 这一对是 `ArtifactIcon`，标记放在页面里原来两行文字的位置，和消息列那一对把标记放在气泡里一样。关注的标记放在东西里面；角落留给加入、离开、添加和创建。在 16px 及以下，`UnfollowArtifactIcon` 的减号画得更重：线条是 3 而不是 2，长度是 6 而不是 5，落在整像素上：普通的减号是页面里的一条线，读起来像它的文字又多了一行，在菜单里很容易看漏（Artea，2026-10-28）。从 18px 起，它就是普通的减号，和 `FollowArtifactIcon` 的加号一样粗（[小尺寸下的标记](../../../../../design/foundations/iconography.md#a-mark-at-small-sizes)）。

```example
icons/unfollow-artifact-sizes
```

- 频道这几对是 Lucide 的 `hash`、`lock` 和 `git-branch`，保持原来的大小和位置，标记在右下角（16 到 22）。字形伸到那个角落的地方，它的笔画停在离标记大约一个线宽的地方，和 Lucide 的 `calendar-plus` 切掉角落的做法一样。每一对都保持同样的间隙，所以这六个读起来是一套（Artea，2026-10-28）。`git-branch` 的那个角落本来就空着，不需要切。

`AddCommentIcon` 和 `CreateTaskIcon` 把加号放在同一个角落，间隙也一样：`AddCommentIcon` 是 24px 的 `CommentIcon`，气泡在加号前截断；`CreateTaskIcon` 是 Lucide 的 `list-todo`，用加号代替它的最后一行。它们没有对应的减号图标。

`ReopenTaskIcon` 没有角标。它是一个打了勾的方框，顶部被一个逆时针箭头断开（Lucide 的 `rotate-ccw-square` 加一个勾）：一个完成的任务，又被打开了。Lucide 的 `rotate-ccw` 已经表示重新开始，`refresh-cw` 表示重试，所以把重新打开画成单纯的圆形箭头，会被读成它们中的一个。

带地球的频道图标（在公开页面上可读）没有自己的一对：它的角落已经放了地球，加入它就是加入一个频道。

## 无障碍 {#accessibility}

- 这些图标对辅助技术隐藏（`aria-hidden`），也不能获得焦点。由周围控件的文字或 `aria-label` 说明它们代表什么。
- 如果按钮里只有一个这样的图标，给按钮加 `aria-label`：Open Thread。

## 规则 {#rules}

- 不要添加自己绘制的图标。新图标都来自 Lucide（[图标](../../../../../design/foundations/iconography.md#principles)）；只有这十九个是自己绘制的（`ChatIcon` 是 `MessageIcon` 的另一个名字，不是单独的一个图形），每个都用于一个 Lucide 没有图标的含义。
- 操作图标只用于它的操作。`JoinChannelIcon` 不是频道的图标，`AddCommentIcon` 也不是评论的图标。
- 加号表示添加、创建、关注或加入这一类东西，减号表示移除、取消关注或离开它：关注时标记在东西里面，其余的在右下角。永远不要把它们用于别的含义，比如「新」或「更多」。
