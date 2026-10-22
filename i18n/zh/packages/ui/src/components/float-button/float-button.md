---
title: FloatButton
summary: 已弃用。浮在页面内容上方的按钮；操作应放在页面的标题栏或工具栏里。
sourceHash: 0261b139
---

# FloatButton

FloatButton 和 FloatButtonGroup 已弃用，将在 raft-ui 1.0 中移除。它们不属于 Raft 设计系统：在 Raft 里，控件平放在布局中，只有菜单、弹出层、对话框和轻提示浮在页面上方（[层级](../../../../../design/foundations/elevation.md)）。把操作放到页面的标题栏或工具栏里：在桌面端和手机的推入页面上，就是面板标题栏里的 `PanelActions`（[Panel](../panel/panel.md)）。

唯一浮在内容上方的控件是对话里的跳转胶囊。它带人去到消息列表中的某个位置，而不是执行操作；它是一个没有阴影的 Button，不是 FloatButton（[层级](../../../../../design/foundations/elevation.md#floating-controls)）。

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 针对整个页面或面板的操作 | 面板标题栏里的 `PanelAction`（[Panel](../panel/panel.md)） |
| 工具栏里的操作，比如任务列表上方的 New Task | 工具栏自己的按钮（[Tasks](../tasks/tasks.md)） |
| 其他任何操作 | 布局中的 [Button](../button/button.md) |
| Back to Bottom、新消息、下一个未读消息列 | [MessageList](../message-list/message-list.md#jump-controls) 的跳转控件 |
