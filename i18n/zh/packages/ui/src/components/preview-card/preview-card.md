---
title: PreviewCard
summary: 人悬停或聚焦到提及或名字上时出现的只读资料卡，显示人或 agent 的头像、名字、状态行和最多两个小按钮。
sourceHash: 33519a38
---

# PreviewCard

预览卡是人悬停或聚焦到提及或名字上（比如消息里的 @Bugen）时出现的只读资料卡。它显示头像、名字、一行状态和最多两个小按钮，让人不离开对话就能知道对方是谁。Raft Chat 的卡片没有按钮（[Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)）。

```example
preview-card/preview-card-mention
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 悬停时显示一个人或一个 agent | PreviewCard |
| 悬停时显示关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 点击时显示一个选择或一个输入框 | [Popover](../popover/popover.md) |
| 保持打开的完整资料 | 资料页面或侧面板 |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `PreviewCard`：根节点。必需。
- `PreviewCardTrigger`：打开卡片的提及或名字，通常是指向资料页的链接。必需。
- `PreviewCardContent`：卡片本身，300px 宽，通过 portal 渲染，定位在触发元素下方。必需。
- `PreviewCardHeader`：大号 [Avatar](../avatar/avatar.md)，旁边是名字和名字下面那一行。
- `PreviewCardTitle`：名字。
- `PreviewCardSeparator`：头部下方的细线。
- `PreviewCardDescription`：状态行，一行，超出截断。
- `PreviewCardArrow`：可选的指向触发元素的箭头。
- `PreviewCardPortal` 和 `PreviewCardPopup`：底层部件。`PreviewCardPopup` 是不带定位的卡片表面。

## 行为 {#behavior}

- 鼠标指针停在触发元素上，卡片几乎立刻打开；离开后很快关闭。延迟比 Base UI 默认的短，这样满是提及的密集消息不会显得迟钝。
- 触发元素获得键盘焦点时也会打开。
- 卡片在触发元素下方打开，与其起始边对齐，到了窗口边缘会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。

## 内容 {#content}

- 对 agent，先说它现在在做什么，再说它是谁："Reviewing #25" 加上它的在线状态灯，然后是它的角色和运行位置。
- 对人，显示其角色和当地时间。
- 按钮用 Title Case：Message、View Profile。

## 无障碍 {#accessibility}

- PreviewCard 封装了 Base UI 的 PreviewCard。悬停或聚焦触发元素时打开，按 Esc 关闭。
- 卡片是补充信息，触屏上不会打开。把触发元素做成指向资料页的真实链接，这样卡片上的一切都能通过别的途径获取。

## 规则 {#rules}

- 卡片保持只读：没有输入框，没有选择。需要人填写的东西用 [Popover](../popover/popover.md)。
- 卡片上最多放两个小按钮，颜色按 [Popover](../popover/popover.md#rules) 的规则：绝不用粉色。
