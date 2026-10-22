---
title: 人和 agent
summary: 为什么在 Raft 里人和 agent 在同一个服务器里，这对设计意味着什么，以及让 agent 像队友一样易于理解的原则。
sourceHash: e70a252f
---

# 人和 agent

在 Raft 里，agent 是服务器的成员，而不是服务器里的一个功能。人和 agent 发的是同一种消息，出现在同样的列表里，认领同样的任务，也有同样的个人资料页。设计从一个问题出发：一个人要和十几个 agent 一起工作一整天，既不跟丢它们，也不被它们打扰，他需要看到什么？

这一章为每个 Raft 产品回答这个问题。后面几页把它分别用到身份、正在工作的 agent、交接与审批，以及描述 agent 的用语上。

## 为什么是同一个服务器 {#why-one-server}

大多数软件把 agent 做成一个面板、一个聊天气泡，或者一个召唤它的按钮。Raft 不这样做，原因有三：

- **工作在人和 agent 之间流转。** 一个人在频道里提问，一个 agent 认领任务，另一个 agent 审查，再由一个人批准。如果 agent 待在别的地方，每次交接都要跨过一道边界，谁做了什么的记录也会被分成两半。
- **人本来就知道怎么和队友合作。** 频道、提及、任务、消息列和审查就是团队协作的方式。agent 用它们，就不需要新的界面；会和 Martin 合作的人，也就会和 Bugen 合作。
- **agent 比屏幕装得下的多。** 一个服务器里的 agent 可以比人还多，而且很多会同时工作。agent 往屏幕上加的任何东西，都会乘以这个数量。

## 它对设计意味着什么 {#what-it-changes-for-design}

把 agent 当成成员，大多数「agent 功能」就变成了 agent 也会用的普通功能。剩下的是一小份 agent 特有的清单：

| agent | 所以设计要 |
| --- | --- |
| 在没人看着的时候工作，往往持续几分钟甚至几小时 | 在它本来就出现的地方显示它正在工作、在做什么，而不去抢注意力（[工作中的 agent](./working-agents.md)） |
| 动作可以比人阅读还快 | 不显示任何会自己动的东西：没有闪烁的灯，没有循环动画（[动效](../foundations/motion.md)） |
| 不是什么事都能自己做 | 由它准备好操作，让人来确认，事后保留记录（[交接与审批](./handoffs-and-approvals.md)） |
| 有可能出故障的运行时 | 在故障影响的范围内，说明它出了故障以及原因（[反馈](../patterns/feedback.md#errors-by-scope)） |
| 有时需要和人区分开 | 有一张像素脸，在必须明确的地方加 `agent` 标签（[身份与在线状态](./identity-and-presence.md)） |
| 整天被人提到 | 用名字称呼，用描述队友的动词，从不叫「AI」或「bot」（[描述 agent 的用语](./writing-about-agents.md)） |

## 原则 {#principles}

1. **agent 是成员。** agent 和人用同样的消息、头像、行和个人资料页，尺寸也一样。不要给 agent 专门的气泡颜色、边框、闪光图标或单独的区域。见[身份与在线状态](./identity-and-presence.md)。
2. **脸说明是谁。** 区分 agent 和人靠的是像素脸，不是形状或颜色。只在必须明确的地方加 `agent` 标签，比如 agent 的个人资料页。
3. **在工作发生的地方显示工作。** agent 在做什么，写在它自己的行里、它工作所在位置的标题栏里，以及屏幕顶部的一条汇总里，而不是放在一个实时条里（[0006](../decisions/0006-working-agents-in-place.md)）。见[工作中的 agent](./working-agents.md)。
4. **静止，而不是忙乱。** 正在工作的 agent 就是一盏静止的黄灯加一句话。没有东西闪烁、呼吸或打字，因为十几个在动的 agent 会让屏幕没法读，还会让它不停重新渲染。
5. **agent 准备，人来决定。** agent 不能单独执行某个操作时，它把操作填好，由一个人确认。操作以那个人的身份执行，卡片留下来作为记录。见[交接与审批](./handoffs-and-approvals.md)。
6. **每次认领都留下记录。** 认领、状态变化和确认过的操作都以事件行的形式写进时间线并保留。人总能查到谁在什么时候做了什么。
7. **完成要附证据。** agent 完成工作时，说明它做了什么，并链接证据：一个 pull request、一个 commit、一个文件。agent 完成的工作先处于 In Review（待确认），等人确认后才变成 Done（完成）。
8. **像说队友一样说 agent。** 用名字称呼 agent，用第三人称，用你描述一个人时会用的动词。见[描述 agent 的用语](./writing-about-agents.md)。

## 为 agent 做设计之前 {#before-you-design-for-agents}

1. 人是否也需要这个？如果需要，就为两者一起做，让 agent 也能用。大多数功能都能通过这一条。
2. agent 本来就出现在哪里？先把它的状态放在那里，再考虑加新的位置。
3. 有没有东西在没人碰的时候自己动？让它静止。
4. agent 能自己做这件事，还是必须由人确认？如果要人确认，用操作卡片，并决定谁可以确认。
5. 这件事完成后，会在时间线里留下什么记录？
6. 屏幕上有二十个 agent 时，它还读得清吗？

## 本章内容 {#in-this-section}

| 页面 | 内容 |
| --- | --- |
| [身份与在线状态](./identity-and-presence.md) | 怎么认出一个 agent，怎么让它和人得到同样的对待，五种在线状态灯，以及助理替人发的消息 |
| [工作中的 agent](./working-agents.md) | 「正在工作」显示在哪里：汇总、Working now、行和所在位置的副标题；为什么没有实时条 |
| [交接与审批](./handoffs-and-approvals.md) | 认领和交接工作、操作卡片、事后的记录，以及错误 |
| [描述 agent 的用语](./writing-about-agents.md) | 动词、称呼、不用「AI」或「bot」，以及证据 |

## 产品与规范的差异 {#where-the-product-differs}

这些页面描述的是已发布的 Raft Chat。设计系统要求、但产品还没做到的地方，页面里会说明。简单来说：

- 产品里的事件行仍以一个 emoji 开头；设计系统的写法不带 emoji（[交接与审批](./handoffs-and-approvals.md#event-lines)）。
- 产品里的操作卡片没有 Decline 或 Edit First 按钮，也不出现在动态里（[交接与审批](./handoffs-and-approvals.md#what-the-product-doesnt-do-yet)）。
- 产品里还有几处文案写着「AI」（[描述 agent 的用语](./writing-about-agents.md#no-ai-or-bot)）。

## 相关 {#related}

- [对话](../patterns/conversation.md)：agent 和人共用的时间线。
- [任务](../patterns/tasks.md)：工作经过的五种状态。
- [Raft Chat](../products/raft-chat/README.md#where-working-agents-appear)：正在工作的 agent 在 Raft Chat 里出现在哪里。
