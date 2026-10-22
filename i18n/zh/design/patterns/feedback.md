---
title: 反馈
summary: 怎么告诉人们一件事：什么立即执行、什么需要确认，空、加载中和加载失败的区别，错误按范围放在哪里，以及怎么措辞。
sourceHash: 24a5fa10
---

# 反馈

消息涉及的范围越大，放得越靠外：输入框的错误在输入框下方，面板的问题在面板标题栏下方，服务器的问题在通知中心。消息放在它所说的东西旁边，就不用再解释问题出在哪里。每种消息由哪个组件承载，见[选择组件](../components/overview.md#telling-people-something)。

## 适用范围 {#when-it-applies}

人们需要知道的每一个结果、问题、空视图和等待。

## 规则 {#rules}

### 确认 {#confirming}

- 如果人能在同一个地方撤销操作，就立即执行，不弹对话框，也不弹轻提示：Mark as Done（Reopen Task）、Save Message（Remove from Saved）。一次点击就能撤销的操作，事先再问一句只会拖慢人。
- 会停止 agent 的工作、把某人移出某个地方、或者归档或删除某样东西的操作，都要用对话框确认，因为这些都无法在发生的地方恢复：Stop Agent、Restart 或 Reset、Archive Agent、Leave Channel、Remove Member、Delete Server（[Dialog](../../packages/ui/src/components/dialog/dialog.md)）。确认按钮写操作的动词；不可撤销时还要带上对象：Stop、Delete Server（[写作](../content/writing.md#actions-and-their-dialogs)）。
- 确认不可撤销操作的对话框里，把说明放在红色横幅中，确认按钮用红色。打开它的菜单项不要上色：警告应该出现在人做出决定的地方，而不是一串选项里。
- 操作在当下就有自然的退路时，直接执行并显示带 Undo 的轻提示，而不是弹对话框（[Toast](../../packages/ui/src/components/toast/toast.md)）。例如，在 Raft Chat 里把一个 agent 从消息列的关注者中移除时就是这样；轻提示停留 5 秒。

### 空、加载中和加载失败 {#empty-loading-and-failed}

把这三种情况分开：

| 情况 | 显示 |
| --- | --- |
| 这里什么都没有 | 空状态（[EmptyState](../../packages/ui/src/components/empty-state/empty-state.md)）：一个灰色图标、一个标题、一句说明怎样才会有内容的话，最多一个按钮 |
| 正在加载 | 与内容布局相同的骨架屏，比如任务卡片或会话行（[Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)）；其他加载指示方式见[选择组件](../components/overview.md#waiting) |
| 加载失败 | 在内容所在位置显示橙色横幅，说明发生了什么，并提供 Retry（[Banner](../../packages/ui/src/components/banner/banner.md)） |

```example
empty-state/compositions/default
```

- 加载失败时不要显示空状态。空状态是一个结论（「这里什么都没有」），失败不是。Raft Chat 目前还没有在所有地方做到这一点（[Raft Chat](../products/raft-chat/README.md#differences-from-the-shared-patterns)）。
- 筛选把所有内容都隐藏时，在空状态里说明这一点（"No tasks match this filter"），并说明怎样让结果回来，免得人们以为列表是空的。
- 骨架屏和它代表的内容一样大，这样内容出现时不会闪烁或跳动。不要先显示一种占位，再换成另一种。

### 错误，按范围 {#errors-by-scope}

| 范围 | 错误放在哪里 |
| --- | --- |
| 一个输入框 | 输入框下方；见[表单](./forms.md#validation) |
| 一个对话框或表单 | 其中的橙色横幅（[Banner](../../packages/ui/src/components/banner/banner.md)） |
| 一个面板：agent 无法启动，会话的某项设置没有保存成功 | 面板标题栏下方的全宽提示（`PanelNotice`，[Panel](../../packages/ui/src/components/panel/panel.md)），上下各一条 `line-seam`：它是面板的一个区域，而不是面板内容里的横幅。人可以关掉它时，给它一个 ×；有下一步时，给它一个操作，比如 View Logs |
| 一次性操作失败了，而且没有自己的位置：复制被浏览器拦截、消息列已不可用 | 带一个橙色像素的轻提示（[Toast](../../packages/ui/src/components/toast/toast.md)） |
| 整个服务器 | 通知中心（[NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)） |

- 每个范围都有自己的位置，这样错误出现在原因所在的地方：输入框、对话框、面板、整个服务器。
- 出问题时用橙色，不用红色：红色表示某件事不可撤销（[颜色](../foundations/color.md#meanings-of-color)）。
- 用平实的话说清楚发生了什么、为什么、下一步该做什么（[写作](../content/writing.md)）。

### 进度 {#progress}

- 进度放在它所属的东西里面，用它自己的一条细轨道。不要贴在圆角容器的边缘上；见[形状](../foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)。

## 相关 {#related}

- [状态](../foundations/states.md)：控件的错误和忙碌状态。
- [交接和审批](../people-and-agents/handoffs-and-approvals.md#when-something-fails)：agent 失败时。
