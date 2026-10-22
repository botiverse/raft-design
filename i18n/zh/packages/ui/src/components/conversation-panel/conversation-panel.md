---
title: ConversationPanel
summary: 主区域里显示一个会话的面板：面板头部、可选的一排标签页、消息列表和消息输入框。
sourceHash: 50288462
---

# ConversationPanel

ConversationPanel 在桌面端主区域里排布一个会话：一个频道或一条私信。它是一个 [Panel](../panel/panel.md)，包含 `PanelHeader`、头部下方可选的一排标签页、消息列表和消息输入框。

```example
conversation-panel/compositions/conversation-panel
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 主区域里的频道或私信 | ConversationPanel |
| 会话旁边，某条消息的回复 | [ThreadPanel](../thread-panel/thread-panel.md) |
| 会话旁边的任务、文件或个人资料 | 带 `edge="attached"` 的 [Panel](../panel/panel.md) |
| 主区域里的其他列 | [Panel](../panel/panel.md) |

## 结构 {#anatomy}

- `ConversationPanelRoot`：面板。它是一个 `Panel`，默认 `edge="inset"`。
- 一个 `PanelHeader`：会话的位置图块或头像、名称、描述和操作。它的部件和规则见 [Panel](../panel/panel.md)。
- `ConversationPanelContent`：头部下方的所有内容。
  - `ConversationPanelTabs`：可选的一排 [Tabs](../tabs/tabs.md)，下方有一条 `line-seam`。
  - `ConversationPanelBody`：消息列表的滚动边界。
  - `ConversationPanelFooter`：消息输入框（[Composer](../composer/composer.md)）。
- `ConversationPanelEmptyState`，以及 `ConversationPanelEmptyStateBrand` 和 `ConversationPanelEmptyStateBrandMark`：没有打开会话时面板的内容。

## 变体 {#variants}

一个地方可以有几种内容，比如频道的聊天、任务和文件。它们是头部下方 `ConversationPanelTabs` 里的一排贴纸标签页（[导航](../../../../../design/patterns/navigation.md#several-views-of-one-place)）。地方只有一个视图时（比如消息列），省略这一排。

## 行为 {#behavior}

- 头部、标签页和消息输入框固定不动；只有消息列表会滚动。
- 标签页放不下时，这一排自己横向滚动（[Tabs](../tabs/tabs.md#behavior)）。
- 在手机上，会话是一个推入页面：它的头部就是顶栏，带返回（Back）（[响应式布局](../../../../../design/patterns/responsive.md)）。

## 无障碍 {#accessibility}

- `ConversationPanelRoot` 渲染为 `section`。用 `aria-label` 或 `aria-labelledby` 按会话给它命名。
- 这一排标签页也按会话命名（在 `TabsList` 上设 `aria-label="launch-week"`）。
- 头部的按钮和消息输入框的输入框需要各自的名称；见 [Panel](../panel/panel.md#accessibility) 和 [Composer](../composer/composer.md)。

## 规则 {#rules}

- 把这一排标签页直接放在头部下方，放在滚动的消息列表之外。
- 第一个标签页从头部的边缘开始：桌面端 20px，手机 16px，和头部第一个元素以及消息头像列的边距一样（[页面结构](../../../../../design/patterns/page-structure.md#one-edge-per-column)）。`ConversationPanelTabs` 会设置这个边距。
