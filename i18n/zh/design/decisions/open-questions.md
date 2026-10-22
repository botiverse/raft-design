---
title: 待定问题
summary: 系统里画了不止一个版本、还没选定的地方，每处当前的默认做法，以及产品已经定下来的问题。
sourceHash: ea15a4a5
---

# 待定问题

下面这些地方，同一个东西画了不止一个版本，还没有选定。选定之前，用默认版本。选定一个版本后，其他版本从组件中删除，选择和理由写进负责这条规则的页面。只有重大、跨领域的选择才写成决策记录。

| 位置 | 版本 | 默认 | 产品实际采用 |
| --- | --- | --- | --- |

## 已由产品定下 {#settled-by-the-product}

这些原先待定，现在网页应用（Raft 的产品代码）已经采用了其中一个版本。其他版本不再在模式里描述。

| 位置 | 产品实际采用 | 网页应用中的位置 |
| --- | --- | --- |
| 手机一级页面的顶栏 | 一行 56px 的导航行，名称（主页上是工作空间按钮）放在里面，没有大标题，没有图标图块（[页面结构](../patterns/page-structure.md#phone)） | `components/layout/Sidebar.tsx`、`components/task/TasksPanel.tsx`、`components/thread/ThreadsInbox.tsx` |
| 手机推入页面的顶栏 | 白色（纸面），下方一条接缝线；位置图块仍是黄色贴纸 | `components/ui/PanelHeader.tsx`，基于 raft-ui `PanelHeader` |
| 手机上的服务器列表 | 一个锚定在顶栏下方的弹出层，距两侧各 8px，从主页的服务器切换器打开（[导航](../patterns/navigation.md#servers)） | `components/layout/Sidebar.tsx`、`components/ui/ServerSwitcherMenu.tsx` |
| 桌面端导航条 | 只有图标，56px 加接缝线；名称放在工具提示里。左上角保持直角（[间距](../foundations/spacing.md#heights)） | `components/layout/LeftRail.tsx` |
| 标签页 | 黄色贴纸。下划线样式保留为 [Tabs](../../packages/ui/src/components/tabs/tabs.md#variants) 的一个变体 | `components/message/ChatPanel.tsx`、`components/agent/AgentDetailPanel.tsx` |
| Raft Chat 频道里的聊天、任务和文件 | 面板标题栏下方一行贴纸标签页，人可以调整顺序（[频道](../products/raft-chat/channel.md)） | `components/message/ChatPanel.tsx` |

## 相关 {#related}

- [Panel](../../packages/ui/src/components/panel/panel.md)：手机的顶栏。
- [页面结构](../patterns/page-structure.md#phone)：一级页面。
- [Raft Chat](../products/raft-chat/README.md)：主页和其他一级页面。
