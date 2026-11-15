---
title: 待定问题
summary: 系统里画了不止一个版本、还没选定的地方，每处当前的默认做法，以及产品已经定下来的问题。
sourceHash: 2403866c
---

# 待定问题

下面这些地方，同一个东西画了不止一个版本，还没有选定。选定之前，用默认版本。选定一个版本后，其他版本从组件中删除，选择和理由写进负责这条规则的页面。只有重大、跨领域的选择才写成决策记录。

| 位置 | 版本 | 默认 | 产品实际采用 |
| --- | --- | --- | --- |
| 确认对话框的 ×（[Dialog](../../packages/ui/src/components/dialog/dialog.md#anatomy)、[AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#anatomy)） | 标题栏里有 ×，同时有 Cancel；只有 Cancel | 保留 ×，每个确认示例都画了它（`dialog/typed-delete`、`dialog/reset-agent`、`alert-dialog/confirm-action`） | 未调查 |
| 关掉的新版本横幅多久不再出现（[反馈](../patterns/feedback.md#errors-by-scope)） | 到下一个版本；一段时间；本次会话 | 产品采用的做法 | 顶栏 Update 按钮旁边那个显示 24 小时的横幅，关掉后在这台设备上对那个版本不再出现，按钮仍然保留（`components/errors/NewWebVersionBanner.tsx`） |
| 未保存修改提示里 Discard changes 的颜色（[Dialog](../../packages/ui/src/components/dialog/dialog.md#rules)） | 橙色（它打断操作）；红色（它不可撤销） | 红色，和 raft-ui 示例一样 | 频道详情里是橙色（`components/channel/ChannelOverflowMenu.tsx`）；其他四个提示里是红色（`AgentProfileEditDialog.tsx`、`ActionCardFormSheet.tsx`、`AssistantInstructionsDialog.tsx`、`WeChatConnectDialog.tsx`） |
| 未保存修改提示用哪个组件（[Raft Chat](../products/raft-chat/README.md#overlays)） | 把每一个都加进 Raft Chat 的 AlertDialog 列表；把它们做成 `size="sm"` 的 Dialog | 保持列表现状：只有放弃对 Agent 个人资料的编辑是 AlertDialog | 五个都是 AlertDialog |

## 已由产品定下 {#settled-by-the-product}

这些原先待定，现在网页应用（Raft 的产品代码）已经采用了其中一个版本。其他版本不再在模式里描述。

| 位置 | 产品实际采用 | 网页应用中的位置 |
| --- | --- | --- |
| 手机一级页面的顶栏 | 一行 56px 的导航行，名称（主页上是工作空间按钮）放在里面，没有大标题，没有图标图块（[页面结构](../patterns/page-structure.md#phone)） | `components/layout/Sidebar.tsx`、`components/task/TasksPanel.tsx`、`components/thread/ThreadsInbox.tsx` |
| 手机推入页面的顶栏 | 白色（纸面），下方一条接缝线；位置图块仍是黄色贴纸 | `components/ui/PanelHeader.tsx`，基于 raft-ui `PanelHeader` |
| 手机上的服务器列表 | 一个锚定在顶栏下方的弹出层，距两侧各 8px，从主页的服务器切换器打开（[导航](../patterns/navigation.md#servers)） | `components/layout/Sidebar.tsx`、`components/ui/ServerSwitcherMenu.tsx` |
| 桌面端导航条 | 只有图标，用鼠标时 48px 加接缝线，触屏上 56px 加接缝线；名称放在工具提示里（[间距](../foundations/spacing.md#heights)） | `components/layout/LeftRail.tsx` |
| 标签页 | 黄色贴纸。下划线样式保留为 [Tabs](../../packages/ui/src/components/tabs/tabs.md#variants) 的一个变体 | `components/message/ChatPanel.tsx`、`components/agent/AgentDetailPanel.tsx` |
| Raft Chat 频道里的任务和文件 | 对话面板右侧各列里的侧边分区，从频道标题栏里的 Tasks 和 Files 开关打开（[频道](../products/raft-chat/channel.md#tasks-and-files)、[频道的侧边列](../patterns/responsive.md#the-channels-side-columns)） | `components/message/ChatPanel.tsx`、`components/task/ChannelSideArea.tsx` |

## 相关 {#related}

- [Panel](../../packages/ui/src/components/panel/panel.md)：手机的顶栏。
- [页面结构](../patterns/page-structure.md#phone)：一级页面。
- [Raft Chat](../products/raft-chat/README.md)：主页和其他一级页面。
