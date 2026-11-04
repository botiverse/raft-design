---
title: 有自己对话的任务停用 In Review
summary: Agent 把完成的工作改到 Done，并告诉提出需求的人；任务在谁名下，就是在等谁。In Review 只留在老任务上。
sourceHash: 10f084a9
---

# 0043. 有自己对话的任务停用 In Review

## 背景 {#context}

[决策 0042](./0042-tasks-as-a-to-do-list.md) 把 In Review 留作六种状态之一。实际使用中，Agent 几乎把所有完成的工作都改到 In Review 并指派给人，人的时间花在清理一堆任务上，而不是看真正需要自己的那几个。有一步审查可选，它就成了放完成工作的默认位置。

## 决定 {#decision}

- 任务有五种状态：Backlog、Todo、In Progress、Done 和 Closed。
- 完成的工作改到 Done，结果发给提出需求的人。
- 任务指派给某个人，就表示在等这个人，状态保持 In Progress。Agent 只在对方要求先看一眼，或任务卡在对方的决定或输入上时这样做。
- 「在等某人」没有单独的标记：负责人就说明了这一点。
- 任务对话出现之前的老任务可能还处于 In Review，在它被移走之前，保留它的标签、颜色和它的分组或列。没有开启任务对话的地方，产品不变。
