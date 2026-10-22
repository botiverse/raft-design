---
title: SystemMessage
summary: 对话里的一条事件行（日期、认领、交接、状态变化），用 Space Mono 排在两条细线之间，可以单独出现，也可以折叠成一组。
sourceHash: 92e58959
---

# SystemMessage

事件行：时间线里居中的一行，记录发生过的事，例如一个日期、"Bugen claimed #25"，或者一个任务移到了完成。它不是消息：没有人写它，所以没有头像也没有名字。连续的几条事件行可以折叠成一行摘要。

```example
system-message/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况                                                                                    | 用                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 时间线里的日期                                                                       | SystemMessage                                  |
| 一个动作：有人认领、交接、完成或移动了任务；加入或归档了某个地方 | SystemMessage                                  |
| 连续的几条事件行                                                                 | `SystemMessageGroup`，折叠成一行摘要 |
| 人或 agent 说的话                                                          | [MessageItem](../message-item/message-item.md) |
| agent 的完整操作历史                                                           | [Timeline](../timeline/timeline.md)            |

agent 把自己的动作写成事件行，而不是消息；见[交接与审批](../../../../../design/people-and-agents/handoffs-and-approvals.md#event-lines)。

## 结构 {#anatomy}

- `SystemMessage`：这一行，两侧各有一条细线。
- `SystemMessageTime`：发生的时间。可选。
- `SystemMessageContent`：发生了什么。必需。

分组再加上：

- `SystemMessageGroup`：可折叠的分组。
- `SystemMessageGroupHeader`：摘要行，两侧各有一条细线。
- `SystemMessageGroupDisclosure`：展开和收起分组的按钮，里面是 `SystemMessageGroupSummary` 和 `SystemMessageGroupChevron`。
- `SystemMessageGroupPanel`：里面的事件行。

## 变体 {#variants}

| 变体            | 用于                                               |
| ------------------ | ----------------------------------------------------- |
| 单独一行      | 消息之间的一个事件                            |
| 一组更新 | 连续的任务和系统更新，按数量汇总 |

```example
system-message/compositions/grouped-updates
```

```example
system-message/compositions/grouped-generic
```

## 行为 {#behavior}

- 一条事件行只占一行：内容过长时截断，完整文字放在它的 `title` 里。
- 单独一行的上下各留 12px；展开的分组里，各行之间更紧凑。
- 分组展开时，V 形箭头随之转动。

## 内容 {#content}

- 写出谁做的、动词和对象："Bugen claimed #25"、"Wug → Martin · review #25"、"Martin moved #25 to Done"。
- 用队友式的动词和显示名称（[写作](../../../../../design/content/writing.md#voice)）。
- 不要用 emoji 开头：emoji 是内容，不是图标（[图标](../../../../../design/foundations/iconography.md)）。
- 分组的摘要按数量和类别写，用 sentence case："3 updates: 2 task updates, 1 system message"。

## 无障碍 {#accessibility}

- 单独一行是普通的 `div`；不可交互。
- 通过 `render` 把 `SystemMessageTime` 渲染为带 `dateTime` 的 `<time>` 元素，让机器能读懂时间。
- 分组封装了 Base UI 的 `Collapsible`：展开按钮是它的触发按钮，带 `aria-expanded`。摘要文字是它的无障碍名称；V 形箭头是隐藏的。

## 规则 {#rules}

- 事件行用 Space Mono，`text-mono-meta`，颜色 `foreground-hint`，居中排在两条 `line-hairline` 线之间。它们是机器写的（[字体排印](../../../../../design/foundations/typography.md)）。
