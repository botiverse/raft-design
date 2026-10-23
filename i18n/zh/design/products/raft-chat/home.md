---
title: Raft Chat — 主页
summary: 手机上的主页：服务器切换器，外框上的工作状态和铃铛，收藏行，以及频道和私信的分组。
sourceHash: ebee8424
---

# Raft Chat — 主页

主页是手机上的第一个一级页面。它回答你在哪个服务器、谁在工作、什么在等你，并列出每个频道和私信。它和桌面端的聊天侧栏是同一个列表（[Raft Chat](./README.md#the-desktop-sidebar)），只是画在纸面上。

## 结构 {#structure}

从上到下：

1. **外框上的顶栏**：一个 56px 的行（`PanelSectionHeader`），和每个标签的根页面一样下面有接缝线，左侧是服务器切换器，右侧是工作摘要和铃铛。它没有副标题，也没有 Search 按钮：搜索全部内容用搜索标签（[导航](../../patterns/navigation.md#search-on-a-phone)）。
   - 服务器切换器是工作空间按钮（[WorkspaceButton](../../../packages/ui/src/components/workspace-button/workspace-button.md)）：服务器的头像、名字和一个 V 形箭头，手机网页和移动应用上一样。它以弹出层的形式打开服务器列表（[用现有部件搭建](../../components/overview.md#switching-servers)）。
   - 工作摘要是一个头像堆和一个计数；它打开 Working now（[正在工作的 Agent](../../people-and-agents/working-agents.md#where-working-shows)），没人工作时隐藏。
   - 铃铛是 20px 的图标，点击区域 44px，打开通知中心（[Raft Chat](./README.md#the-bell-and-activity)），有新内容时显示一个粉色像素点。主页是唯一带铃铛和工作摘要的一级页面。
2. **收藏行**，带一个用 Space Mono 写的灰色计数：这是手机上收藏的唯一入口。搜索和动态在标签栏上，所以主页上没有它们的行。
3. **分组**：聊天侧栏的各个分组，不含收藏，按这个人自己的顺序排列。
4. **标签栏**，主页处于选中状态。标签栏上方不附加任何东西。

```example
sidebar/compositions/phone-home
```

这些行是侧栏行，在 `md` 以下它们自己就是 44px 高（[Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md#rules)）。

## 规则 {#rules}

- 服务器切换器只在主页上显示。用工作空间按钮来画：服务器的头像、名字（最宽 200px，超出显示省略号）和一个 V 形箭头。服务器的公开页面开启时，加上地球图标。它在任何窗口高度下看起来都一样。
- 列表直接放在纸面上，不放在卡片里。
- 行用侧栏行（[Sidebar](../../../packages/ui/src/components/sidebar/sidebar.md)）来画，高 44px，用 `text-body`。收藏行永远不显示为选中。
- 主页上不要放粉色按钮。创建用分组标题里的 + 按钮（[Raft Chat](./README.md#the-desktop-sidebar)）。
- 每一行都以推入页面的形式打开。
