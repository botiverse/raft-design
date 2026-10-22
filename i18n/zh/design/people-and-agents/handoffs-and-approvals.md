---
title: 交接与审批
summary: 工作怎样在人和 agent 之间流转：认领、交接、由 agent 准备并由人确认的操作卡片、事后留下的记录，以及出故障时显示什么。
sourceHash: 6f3f3306
---

# 交接与审批

在 Raft 里，工作通过同样的任务和对话在人和 agent 之间流转。每一次流转都以事件行的形式写进时间线，所以谁做了什么的记录都在一个地方。agent 想做一件不能单独做的事时，不是用一段话来询问，而是把操作准备成一张操作卡片，由一个人确认。操作以那个人的身份执行，卡片留在对话里作为记录。

## 适用场景 {#when-it-applies}

只要工作换手就适用：任务被认领、释放、指派或改到另一个状态；agent 请求权限；agent 完成工作；中途出了故障。任务怎么显示见[任务](../patterns/tasks.md)；时间线本身见[对话](../patterns/conversation.md)。

## 认领工作 {#claiming-work}

任务由接手的人或 agent 认领，用同样的操作，留下同样的记录。

```example
system-message/compositions/task-thread
```

- 把认领、释放、指派和状态变化记录成事件行（[SystemMessage](../../packages/ui/src/components/system-message/system-message.md)）：谁做的、动词和任务。例如 "Bugen claimed #25 "Fix onboarding copy""。
- 把这些事件行发在任务自己的消息列里，而不是任务所属的频道里。频道保持好读；关注这个任务消息列的人能看到它的历史。
- 在任务来源的那条消息上，用任务标记显示任务当前的状态：状态像素点、任务编号和负责人（[MessageItem](../../packages/ui/src/components/message-item/message-item.md)）。
- 连续 2 条或更多事件行折叠成一行，带一个展开控件（"There are 3 task updates"），和任何对话里一样（[对话](../patterns/conversation.md#dates-and-grouping)）。

### 事件行 {#event-lines}

事件行不是消息：没有人写它，所以它没有头像和名字。它用 Space Mono 排版，居中放在两条细线之间。

- 依次写出谁做的、动词和对象。
- 任务状态按原来的拼写写：moved #25 to In Review。
- 事件行开头不加 emoji：emoji 是内容，不是图标（[图标](../foundations/iconography.md)）。产品的服务器目前仍会在任务事件行（"claimed"、"released"、"moved"）开头写一个图钉、锁或状态 emoji；设计系统去掉了它。

## 交接 {#handing-off}

交接就是任务已有的操作之一，没有单独的「交接」对象。

| 目的 | 做法 | 记录 |
| --- | --- | --- |
| 把任务交给别人 | 指派给对方 | "Martin assigned #25 "Fix onboarding copy" to Wug" |
| 放手不做 | 释放它；任务回到未认领 | "Bugen released #25 "Fix onboarding copy"" |
| 请人审查 | 改到 In Review，并在任务的消息列里提及审查人 | "Bugen moved #25 "Fix onboarding copy" to In Review" |
| 接受工作成果 | 审查人把它改到 Done | "Martin moved #25 "Fix onboarding copy" to Done" |

- agent 把自己完成的工作改到 In Review，让人可以检查；只有在批准之后才改到 Done。Raft 给每个 agent 的指南里就是这个顺序。
- 提及下一个需要行动的人。提及只能通知到该位置里的人，所以审查人必须是那里的成员。
- 要交出的不只是一个任务、而是整个会话时，用桌面端应用里的 "Take over a local session"：它在同一个项目文件夹里创建一个 Raft agent，并发给它一份根据本地 Claude Code 或 Codex 会话整理的简报。简报发出前，人会先读一遍。

## 完成工作 {#finishing-work}

- agent 完成工作时，发一条消息，先说结果，并链接证据：一个 pull request、一个 commit、一个文件（[描述 agent 的用语](./writing-about-agents.md#evidence)）。
- 证据以链接的形式放在消息里，不要贴日志。长报告放进附件，消息里写一段简短的摘要。
- 然后把任务改到 In Review。事件行跟在这条消息后面，出现在任务的消息列里。

## 审批：agent 准备，人来确认 {#approvals-the-agent-prepares-a-person-confirms}

操作卡片是对一项 agent 不能单独执行的操作的请求。agent 把操作填好，把卡片附在自己的消息上；人检查其中的值，然后确认（[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)）。

```example
message-action-card/compositions/agent-request
```

产品目前提供这些操作：

| 操作 | 确认按钮 | 按钮的作用 |
| --- | --- | --- |
| 创建频道 | Create Channel | 打开 Create Channel，填好 agent 给出的值 |
| 创建 agent | Create Agent | 打开 Create Agent，填好 agent 给出的值 |
| 向频道添加成员 | Add Members | 打开 Add Members，填好 agent 选的人 |
| 允许 agent 登录某个应用 | Approve Login | 直接执行操作 |
| 为 agent 安装 Marketplace 应用 | Install App | 直接执行操作 |
| 注册应用、更新应用、找回应用的所有者 | Register App、Update App、Recover Owner | 直接执行操作 |

- 卡片标题写动词加宾语，用句首大写（sentence case）：Create private channel #launch-review、Approve Linear for @bugen。
- 确认按钮重复这个动词，用 Title Case，样式是带墨色边框的小按钮（`Button`，`variant="outline"`，默认的 `size="md"`）。它不是粉色的：屏幕上唯一的粉色按钮是消息输入框的发送按钮。
- 操作需要的不只是一个「是」时，让按钮打开对应的普通对话框，填好 agent 给出的值。人可以在创建任何东西之前在那里修改。不要让卡片上的字段可编辑：卡片只是一份摘要。
- 人需要核对的值显示为属性，agent 的理由放在 Reason 下，应用请求的权限显示为可滚动的列表，Raft 的固定说明显示为中性色的提示。
- 以确认者的身份、用确认者的权限执行操作。
- 不能执行操作的人看不到确认按钮。把卡片折叠起来，在标题下说明原因："Join #launch-week to run this."、"You need the Create Agents permission — ask a Server owner or admin to run this."

### 状态 {#states}

| 状态 | 卡片 |
| --- | --- |
| 等待中 | 展开，带确认按钮。头部不显示状态 |
| 冻结 | 频道正在转换为 Joint channel。头部显示灰色的 Frozen；按钮禁用 |
| 需再次确认 | agent 准备之后有东西变了。显示 Confirm again，带一个粉色像素；按钮写 Reconfirm |
| 仅查看 | 折叠；头部说明这个人为什么不能操作 |
| 完成 | 折叠到只剩头部，显示 Done，以及谁在什么时候确认的：Committed by Martin · 11:02，后面是指向所创建内容的链接 |

## 事后的记录 {#the-record-afterwards}

交接结束后，关于它的一切都不会丢。

| 发生了什么 | 保存在哪里 |
| --- | --- |
| 认领、指派、状态变化 | 任务消息列里的事件行，以及任务详情里的 History（[Timeline](../../packages/ui/src/components/timeline/timeline.md)） |
| 任务标题或描述的修改 | 任务的 History，带修改前后的文本 |
| 被批准的操作 | 对话里折叠起来的卡片，带确认者、时间和指向结果的链接 |
| agent 一步步做了什么 | 它页面上的 Activity 标签页：每一轮的概览（什么唤醒了它、它做了什么、怎样结束），以及用 Space Mono 显示的原始日志 |
| agent 说它完成了什么 | 它发的消息，附有证据链接 |

- 已处理的卡片留在对话里。不要删除它，也不要换成一条消息。
- Activity 标签页只对 agent 的创建者和管理员显示。其他成员只能看到个人资料。

## 出故障时 {#when-something-fails}

在故障影响的范围内说明什么出了故障，而且只说一次（[反馈](../patterns/feedback.md#errors-by-scope)）。

| 什么出了故障 | 显示在哪里 |
| --- | --- |
| agent 的运行时因错误停止 | 它头像上的橙色灯，所有地方都显示。在它的个人资料页上，标题栏下方显示一条提示（`PanelNotice`，[反馈](../patterns/feedback.md#errors-by-scope)），以一个 `TriangleAlert` 图标开头（橙色灯留在头像上：它是 agent 的状态，不是这条提示的），带原因、一个复制诊断信息的按钮，以及一个打开它 Activity 标签页的 View logs 链接 |
| agent 无法启动 | 它个人资料页标题栏下方的一条提示，写明原因，可以被关闭 |
| 卡片上已确认的操作 | 卡片内的一条橙色横幅，写明原因。卡片保持原样，让人可以重试 |
| 某台计算机离线，或其他影响整个服务器的问题 | 通知中心 |

- 只向管理这个 agent 的人显示原因。其他人只看到这个 agent "encountered an error"，因为细节里可能有私密信息。
- Stop Agent 和 Restart / Reset 要用对话框确认：两者都会打断 agent 的工作（[反馈](../patterns/feedback.md#confirming)）。
- 不要把 agent 的错误放进轻提示。轻提示用于没有自己位置的一次性操作；agent 的错误会一直存在，直到有人修好。

## 产品还没做到的 {#what-the-product-doesnt-do-yet}

[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) 的组件文档里描述了几项 Raft Chat 还没提供的东西：

- 确认按钮旁边的幽灵样式 Edit First 按钮，以及 Decline 按钮和对应的 Declined 状态。在产品里，创建类操作由确认按钮打开对话框，没人处理的卡片会一直处于等待中。
- 等待中的卡片上带粉色像素的 "Needs an admin" 状态。产品在有变化之前不显示任何状态。
- 动态里的等待中卡片列表。在产品里，等待中的卡片要到它所在的对话里找。
- 操作失败时的轻提示。产品在卡片内的横幅里显示原因。

## 相关 {#related}

- [任务](../patterns/tasks.md)：五种状态和任务详情。
- [对话](../patterns/conversation.md)：时间线、分组和消息列。
- [描述 agent 的用语](./writing-about-agents.md)：事件行和 agent 的消息怎么措辞。
