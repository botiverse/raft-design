---
title: Raft 设计系统
summary: 所有 Raft 产品共用的设计语言：Raft 为什么长这样，怎样设计一个新功能，以及搭建它的组件。
sourceHash: 75e1a7c6
---

# Raft 设计系统

Raft 设计系统是所有 Raft 产品共用的设计语言：现在是 Raft Chat，接下来是 Tasks、Calendar、Artifacts、Sites、Meeting 和 Canvas。Raft 是一个共享的工作空间，人和 Agent 在同一个地方聊天、交接工作、写作、开会、交付，人们一整天都开着它。这套文档写给所有参与构建 Raft 的人和 Agent。它解释 Raft 为什么这样设计、新东西该怎么设计，让每个产品保持同一种气质。这套系统包括两部分：本站的规范，以及实现这些规范的 React 组件 [raft-ui](./about/use-raft-ui.md)。

## 从哪里开始 {#where-to-start}

| 如果 | 读 |
| --- | --- |
| 我要设计一个新东西 | [设计新功能](./principles/designing-a-new-feature.md)：要问的问题、流程和自查清单 |
| 我需要一个组件 | 先看[组件总览](./components/overview.md)，再按[使用 raft-ui](./about/use-raft-ui.md) 完成配置 |
| 为什么是这样？ | [原则](./principles/principles.md)和[为什么 Raft 长这样](./principles/why-raft-looks-this-way.md) |

如果你不在 Raft 团队里，它背后的想法写在[原则](./principles/principles.md)和[人和 Agent](./people-and-agents/README.md) 里：为人和 Agent 协作而设计，做一个安静到可以整天使用的工作空间。
