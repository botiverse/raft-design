---
title: 语气
summary: Raft 听起来是什么样：简短、直接、平实，只在新手引导和成功时带一点幽默；以及语气怎样从设置到错误、再到破坏性操作逐步变化。
sourceHash: 655f082c
---

# 语气

Raft 听起来像邻桌一位能干的队友：简短、直接、平实。这种声音在每个产品、每个界面上都一样。语气随事情的轻重而变：有人设置服务器或完成一件事时，带一点温度；出了问题时，用平实的话；操作不可撤销时，用精确的话。文字本身的规则见[写作](./writing.md)。

## 原则 {#principles}

- **说一次，说短。** 人们是在别的工作之间读 Raft 的，旁边还有写得很多的 Agent。每多一个字，都在和别人需要读的消息抢注意力。
- **平实胜过巧妙。** 用产品的名词（[术语](./terminology.md)）和日常动词。一个要人去破解的标签，听起来再好也是失败的。
- **像屏幕一样安静。** 界面保持静止，颜色只留给含义（[颜色](../foundations/color.md)、[动效](../foundations/motion.md)）。文字也一样：不喊叫、不夸大，除非真有风险，否则不发警报。
- **Agent 是队友，不是功能。** 写 Agent 就像写同事一样，叫它的名字，用写人时用的动词；见[描述 Agent 的用语](../people-and-agents/writing-about-agents.md)。
- **帮人行动。** 报告问题的消息要说下一步怎么做。只表达情绪的消息（"Oops!"）不给人任何可做的事。

## Raft 听起来是什么样 {#how-raft-sounds}

| Raft 是 | 所以它 | 而不是 |
| --- | --- | --- |
| 简短 | 能用一行说完事实或操作，就用一行 | 以 "Please note that…" 开头，或以 "Let us know if you need anything else" 结尾 |
| 直接 | 步骤用祈使句："Restart Raft Computer and try again" | "You may want to consider restarting…" |
| 平实 | 用产品名词和常用词：server、channel、Agent、computer | "Messaging surface"、"AI-powered workspace"、"compute node" |
| 具体 | 说出是哪个东西："Could not save changes" | "Something went wrong" |
| 在不费事的地方有温度 | 设置流程和成功时可以有一句轻松的话 | 在错误、警告或确认里开玩笑 |
| 诚实 | 说 Raft 现在做得到的事 | 承诺、含糊其辞（"It looks like…"）、用道歉代替解释 |

## 不同时刻的语气 {#tone-by-moment}

| 时刻 | 语气 | 例子 |
| --- | --- | --- |
| 新手引导和设置 | 温暖、鼓励，可以带一点幽默。说清接下来会发生什么，免得人们没把握地干等 | "Your computer shows up here on its own. No need to refresh." |
| 成功 | 简短，愿意的话可以轻松一点。说出完成了什么 | "Computer connected"、"Bugen shipped #25" |
| 进行中 | 只讲事实：谁在做什么，做了多久 | "Bugen is on it · 12m"、"Uploading · 64%" |
| 空状态 | 先说事实，有下一步就再说下一步 | "No tasks match these filters" |
| 错误 | 平实：发生了什么，然后怎么做。不开玩笑，不指责 | "Runtime detection failed. Restart Raft Computer and try again." |
| 警告 | 平实，具体说出后果 | "Apps using this token will lose access. Other tokens will stay active." |
| 破坏性操作的确认 | 精确。写标题里的动词，不可撤销时连对象一起写；旁边是 Cancel | Delete Agent / Cancel |
| 提示（轻提示、工具提示） | 一行，顺带一提；人们必须处理的事，不能只放在这里 | "Link copied." |

- 幽默只留给新手引导和成功消息。人们读到错误时，已经有东西挡在路上了。
- 不用感叹号，除非是在成功或设置流程里、温度本身就是重点的那一句。错误里永远不用。
- 不要用道歉代替解释。如果是 Raft 的问题，就平实地说什么失败了、该怎么做。

## 为什么是这样的语气 {#why-the-voice-is-like-this}

- Raft 一整天都开着，所以它的文字要经得起反复看。笑话只能读一次；人们每周都会看到的错误信息，得一直有用。
- 人和 Agent 在同一些频道里。平实、具体的声音让人很容易分清哪句是产品说的、哪句是队友说的，也让产品听起来不像聊天机器人。
- 视觉系统让每种颜色只有一个含义，并让提示保持中性（[颜色](../foundations/color.md#principles)）。语气遵守同一条规则：强调只留给重要的事，这样用到的时候才管用。
- 点了什么就打开什么（[写作](./writing.md#actions-and-their-dialogs)），任何文字都不用全大写（[0002](../decisions/0002-no-all-caps.md)）。两条规则出自同一个想法：界面永远不让人怀疑自己是不是看错了。

## 中文界面怎么写 {#writing-in-chinese}

- 遵守同样的原则：句子短、形容词少、步骤用祈使句。
- 数字、ID、时间和运行时名称仍然用 Space Mono（[字体排印](../foundations/typography.md)）。
- 同一个词在所有地方都按产品词表译成同一个说法；见[术语](./terminology.md)。
- 对话框按钮的写法跟英文一致：英文省掉对象，中文也省掉，Create Channel 的按钮写「创建」；英文保留对象，中文也保留，写「删除频道」。动词短语要完整：写「退出登录」，不要只写「退出」（[写作](./writing.md#actions-and-their-dialogs)）。
- 空状态用「还没有」或「没有」，形式与英文一一对应（[写作](./writing.md#errors-and-empty-states)）。不要写「暂无」，它读起来像官方通知；也不要写「为空」，它描述的是容器，而不是缺了什么。

## 相关 {#related}

- [写作](./writing.md)：大小写、标签、对话框、错误和空状态。
- [术语](./terminology.md)：产品用词和要避免的词。
- [描述 Agent 的用语](../people-and-agents/writing-about-agents.md)：Agent 的名字、动词和状态。
- [反馈](../patterns/feedback.md)：每种消息显示在哪里。
