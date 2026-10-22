---
title: 内容
summary: 为什么 Raft 产品里的文字和外观同样重要，以及语气、界面文案和术语的规则写在哪里。
sourceHash: 60757052
---

# 内容

产品给人的感觉，一半来自文字。两个 Raft 产品即使共用每一种颜色、每一个组件，只要一个写 "Create Server"、另一个写 "New workspace"，或者一个用 "Oops!" 道歉、另一个直接说该怎么做，看起来就像两家公司做的。基础章节让外观保持一致，这一章让每个 Raft 产品的文字保持一致。

## 为什么文字也需要一套系统 {#why-words-need-a-system}

- **产品只学一次。** 同一个东西在所有地方用同一个词，在 Raft Chat 里学会的词，到了 Tasks 或 Calendar 里还是同一个意思。同一个东西换个词，人们就会怀疑它是不是另一个东西。
- **agent 写的字和人一样多。** agent 在同一些频道里发消息，产品里的一部分文字也由它们来写：任务进展、帮助、摘要。共用一套词汇和语气，agent 写的和界面说的才是同一种语言。
- **文字承载性格。** Raft 把 agent 当作队友，让屏幕保持安静。如果文字把 agent 叫作 bot，或者用全大写喊叫，视觉系统做出的选择就被文案抵消了。
- **清楚的文字就是无障碍的文字。** 直白的标签、一致的大小写、告诉人该怎么做的错误信息，对每个人都有用，包括使用读屏软件或非母语阅读的人（[无障碍](../foundations/accessibility.md#language-and-casing)）。

## 页面 {#pages}

| 页面 | 内容 |
| --- | --- |
| [语气](./voice-and-tone.md) | Raft 听起来是什么样，语气怎样从设置流程到错误信息逐步变化 |
| [写作](./writing.md) | 界面文案的规则：大小写、标签、对话框、错误和空状态 |
| [术语](./terminology.md) | 产品用词、每个词的写法，以及要避免的词 |

agent 的名字、动词和状态见[描述 agent 的用语](../people-and-agents/writing-about-agents.md)。怎么写这套文档见[写作指南](../authoring/writing.md)。

## 怎么用这一章 {#using-this-section}

- 按[写作](./writing.md)和[术语](./terminology.md)写新的界面文案；评审时可以对照这两页检查。
- 写一种新的消息之前先读[语气](./voice-and-tone.md)：比如新手引导流程、一类错误、一个空状态。
- 产品需要一个这一章里没有的词时，在同一个 pull request 里把它和功能一起加进[术语](./terminology.md)。
- 产品文案和它的翻译放在各个产品自己的仓库里，不放在 raft-ui 里（[packages/ui/AGENTS.md](../../packages/ui/AGENTS.md)）。这几页是这些文案要遵守的规则。
