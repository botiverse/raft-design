---
title: MessageActionCard
summary: Agent 附在消息上的卡片，操作已经填好，等人确认；确认之后，它记录是谁、在什么时候做的。
sourceHash: 82f50cd8
---

# MessageActionCard

操作卡片是 Agent 请求做它不能独自做的事情的方式：创建频道、添加成员、合并、发布、花钱。Agent 填好操作，把卡片附在自己的消息上；由人来确认。之后，卡片留在对话里，记录是谁、在什么时候做的。等着某人处理的请求也会列在动态里（[交接与审批](../../../../../design/people-and-agents/handoffs-and-approvals.md#approvals-the-agent-prepares-a-person-confirms)）。

```example
message-action-card/compositions/action-card-interactive
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| Agent 想做一件必须由人授权的事 | MessageActionCard |
| Agent 报告它已经完成 | 它的消息，附上证明的链接（[MessageItem](../message-item/message-item.md)） |
| Agent 认领或交接了工作 | 事件行（[SystemMessage](../system-message/system-message.md)） |
| 人必须马上做决定，而且不在对话里 | [AlertDialog](../alert-dialog/alert-dialog.md) |

## 结构 {#anatomy}

- `MessageActionCard`：卡片，放在 Agent 消息的正文里。必需。
- `MessageActionCardHeader`：顶部一行。必需。
  - `MessageActionCardHeaderIcon`：操作的类型，放在中性图块里，类似 `sm` 尺寸的 [IconTile](../icon-tile/icon-tile.md)。
  - `MessageActionCardHeaderTitle`：将要做什么。下面的 `MessageActionCardHeaderDescription` 说明发生了什么，或者这个人为什么不能操作。
  - `MessageActionCardStatus`：卡片在等谁或等什么，或者它以什么结果结束，用一个像素加一个词表示。
  - `MessageActionCardCollapseTrigger`：把卡片折叠到只剩头部，再展开。
- `MessageActionCardContent`：头部下面的所有内容；它会折叠。
  - `MessageActionCardNotice`：Raft 给出的一条固定说明，关于后果或权限。最多一条。
  - `MessageActionCardProperties`、`MessageActionCardProperty`、`MessageActionCardPropertyLabel`、`MessageActionCardPropertyValue`：这个人要核对的值，以描述列表的形式呈现（[DescriptionList](../description-list/description-list.md)）。
  - `MessageActionCardHintLabel`、`MessageActionCardHint`：Agent 自己的说明，例如它的理由或它填了什么。
  - `MessageActionCardScopeList`、`MessageActionCardScopeListLabel`、`MessageActionCardScopeListViewport`、`MessageActionCardScope`、`MessageActionCardScopeName`、`MessageActionCardScopeDescription`：应用申请的权限。
  - `MessageActionCardActions`：按钮，前面是 `MessageActionCardActionsNote`。
  - `MessageActionCardCompletion`：记录是谁、在什么时候做的。

```example
message-action-card/compositions/channel-agent-actions
```

```example
message-action-card/compositions/integration-actions
```

## 状态 {#states}

| 状态 | 卡片 |
| --- | --- |
| 等待中 | 展开，带按钮。状态说明在等谁，带一个粉色像素：Needs an admin |
| 已暂停 | 展开；按钮前的说明写明原因，按钮禁用 |
| 需再次确认 | 展开；Agent 准备好之后有东西变了，说明写明变了什么 |
| 完成 | 折叠到只剩头部；描述说明是谁、在什么时候做的 |
| 已拒绝 | 折叠；描述说明是谁拒绝的，并说明什么都没有改变 |
| 仅查看 | 折叠；描述说明这个人为什么不能操作。没有按钮 |

- 操作失败时，显示一条轻提示，卡片保持原样，让人可以再试一次（[Toast](../toast/toast.md)）。

```example
message-action-card/compositions/resolution-states
```

## 行为 {#behavior}

- 卡片默认展开。已处理或仅查看的卡片用 `defaultOpen={false}` 折叠；折叠按钮可以再把它展开。
- 很长的权限列表在自己的区域里滚动，卡片不会随之变长。

## 内容 {#content}

- 卡片标题写动词加宾语，用句首大写：Create channel #launch-week、Merge #26 into main。
- 确认按钮重复标题里的动词和宾语，用 Title Case：Create Channel。和对话框的按钮不同，它保留宾语，因为它不在对话框标题旁边，必须自己说清楚批准的是哪个操作（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。
- 只列出这个人需要核对的属性。
- Agent 自己填了值时，在说明里写出来："Bugen filled these in from the thread. You can change them before it's created."
- 记录结果时写上人和时间：Approved by Martin · 10:51。

## 无障碍 {#accessibility}

`MessageActionCard` 包装 Base UI 的 Collapsible：折叠按钮和可折叠的内容都遵循它。

- 给 `MessageActionCardCollapseTrigger` 加 `aria-label`（"Show or hide details"）；它只显示一个图标。
- 给 `MessageActionCardScopeListViewport` 加一个说明列表名称的 `aria-label`（"Permissions"）。只有内容溢出时它才是一个 Tab 停留点，这样键盘用户可以滚动它。
- 头部图标对辅助技术隐藏；含义由标题承载。

## 规则 {#rules}

- 确认按钮用小号的墨色边框按钮（默认 `size="md"` 的 `Button`），不用粉色：屏幕上唯一的粉色按钮是消息输入框的发送按钮。
- 在它旁边放一个幽灵按钮 Edit First，打开这个操作的普通对话框，并填好 Agent 给的值。不要在卡片上编辑字段：卡片只是摘要。
- 以确认它的那个人的身份执行操作。
- 处理之后卡片留在对话里，作为这个操作的记录。
- 对没有操作权限的人不显示按钮。改为说明卡片在等谁。
- 说明保持中性色，永远不用警告色。
