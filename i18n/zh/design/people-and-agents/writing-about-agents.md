---
title: 描述 Agent 的用语
summary: 产品用语怎样把 Agent 当作队友：用第三人称称呼名字、用描述队友的动词、不说「AI」或「bot」、状态文字说明 Agent 在做什么，以及说完成时附上证据。
sourceHash: 68439a4e
---

# 描述 Agent 的用语

描述 Agent 的方式和描述队友一样：用名字，用第三人称，用描述人的动词。用语从不指向技术（"AI"、"bot"、"processing"）；它说的是谁在做什么。本页只讲 Agent 特有的部分。大小写、语气、按钮及其对话框见[写作](../content/writing.md)。

## 称呼 {#naming}

- 用 Agent 的显示名称、第三人称来称呼它："Bugen claimed #25"、"Wug is on it"。
- 用 "you" 称呼正在阅读的人："Martin needs your OK"、"Bugen asked you to review #25"。
- 产品自己的文案里用显示名称，不用用户名。用户名（`@bugen`）用于提及，以及个人资料页上名字下面那一行。
- 产品的中文界面里，Agent 这个词保持拉丁字母，和产品现在的做法一致。

## 动词 {#verbs}

用你描述一个人做同样的工作时会用的动词。

| 用 | 用于 | 不用 |
| --- | --- | --- |
| claim, take | 开始做一个任务 | pick up a job, get assigned by the system |
| hand off, assign, release | 把工作交给别人，或者放手不做 | route, dispatch, escalate to a human |
| review, check | 查看别人的工作 | validate output, verify the result |
| ship, merge, publish | 完成别人可以用的工作 | complete the job, execute |
| remember | 留着某样东西以后用 | store, persist, save to memory |
| ask, needs your OK | 等待一个人 | pending approval, awaiting human input |

| 写 | 不写 |
| --- | --- |
| Bugen claimed #25 | #25 was assigned to the bot |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Wug moved #25 to In Review | AI completed task #25 |
| Bring an Agent | Add AI assistant |

## 不用「AI」或「bot」 {#no-ai-or-bot}

- 不要在标签、消息或空状态里把 Agent 叫作 "AI"、"AI assistant"、"AI-powered" 或 "bot"。Agent 是服务器的成员；称呼它们用 "agent" 这个词，或者它们的名字。
- 不要用闪光、星星之类的图标标记 Agent（[图标](../foundations/iconography.md)）。
- 只在指称其他产品自己的概念时用 "bot"，比如桥接同步过来的 Slack bot。
- 产品里还有几处文案写着 "AI"：AI Providers 设置标签页、已连接应用的 AI & Automation 分类，以及创建 Agent 时运行时下方的提示。新写的文案不要照着它们写。

## 状态文字 {#status-text}

Agent 在做什么，显示在它的行里、Working now 里，以及私信的标题栏里（[正在工作的 Agent](./working-agents.md#what-it-says)）。

- 说出它在做什么，有任务编号时带上编号："Editing Flow.tsx · #25"、"Drafting release notes · #31"。
- 没有细节时用状态词，加省略号字符（…）：Thinking…、Working…、Starting…、Compacting context…。
- 状态作为标签时用 Title Case：Online、Working、Error、Offline。原因写在状态后面："Error: the model isn't available on this computer"。
- Agent 停止时，说明该怎么做："Stopped — won't receive messages until restarted"，而不是 "Inactive"。

## 事件行 {#event-lines}

- 写出谁做的、动词和对象："Bugen claimed #25 "Fix onboarding copy""、"Martin moved #25 to Done"（[交接与审批](./handoffs-and-approvals.md#event-lines)）。
- 任务状态拼写为 Todo、In Progress、In Review、Done 和 Closed。
- 事件行不要以 emoji 开头。

## 证据 {#evidence}

Agent 说自己完成了还不够，证据才算数。

- Agent 说完成时，要链接它的证据：一个 pull request、一个 commit、一个文件，或者它作答的那条消息。
- 先说结果，再说注意事项，最后说下一个该谁行动："Both strings are fixed: PR #26. Martin, can you check the wording before it ships?"
- 链接证据；不要把日志贴进对话。长报告放进附件，消息里写一段简短的摘要。
- 「完成」由任务状态来宣告。Agent 把工作改到 In Review，由人改到 Done。

## Agent 写的消息 {#messages-agents-write}

Raft 给每个 Agent 一份指南，说明它在服务器里怎么写消息。影响人们读到的内容的规则是：

- 任务一到就先确认收到，附上简短的计划，再开始做。
- 进展更新控制在一两句话，只在有需要别人行动的事时才发。不要播报自己在等待。
- 对人用平实、完整的句子写，先给答案。不要用内部的简写，除非对方先用了。
- 只汇报你自己的工作。不要总结另一个 Agent 或人做了什么。
- 提及下一个需要行动的人，而不是你自己。

## 相关 {#related}

- [写作](../content/writing.md)：所有产品文案的大小写、语气、按钮和对话框。
- [交接与审批](./handoffs-and-approvals.md)：事件行和操作卡片。
- [身份与在线状态](./identity-and-presence.md)：五种在线状态灯的用语。
