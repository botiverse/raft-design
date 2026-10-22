---
title: ActivityInbox
summary: 动态面板：一列收件项，带视图、筛选和多选工具栏；选中一项，它会在列表旁边打开。
sourceHash: 0eddc50b
---

# ActivityInbox

ActivityInbox 负责动态（Activity）的布局：这个面板把别处发生、等着这个人处理的事情列成一行行 [InboxItem](../inbox-item/inbox-item.md)。选中一项，它会在列表旁边打开。面板有视图（Active、Saved、Done）、筛选，还有一个同时处理多项的工具栏。

```example
activity/compositions/activity-inbox
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 这个人应该看到的提及、审批、交接和回复 | ActivityInbox |
| 整个服务器的状态 | [NotificationCenter](../notification-center/notification-center.md) |
| 这个人所做操作的结果 | [Toast](../toast/toast.md) |

产品从哪里进入动态，写在该产品自己的页面上。

## 结构 {#anatomy}

- `ActivityInboxPanel`：面板本身。里面有一个标题为 Activity 的 [Panel](../panel/panel.md) 头部。必需。
- `ActivityInboxSidebar`：左侧放视图和筛选的一列，用侧栏行（[Sidebar](../sidebar/sidebar.md)）。手机上隐藏。
- `ActivityInboxControls`：列表上方的一行：筛选（All、Unread 和 Mentions）和 Mark all read。这里没有搜索框：搜索是 [Search](../search/search.md) 的事，在这里放一个搜索框就多了一个入口。
- `ActivityInboxSelectionToolbar`：一个全选复选框，后面是排序菜单，或者是 `ActivityInboxSelectionCount` 加上针对选中项的操作。
- `ActivityInboxViewport`：可滚动的 [InboxItem](../inbox-item/inbox-item.md) 列表。
- `ActivityInboxLoadingMore`：加载更多项时，列表末尾的一行。

## 状态 {#states}

| 状态 | 用于 |
| --- | --- |
| 加载中 | 收件项形状的平铺 `InboxItemSkeleton` 行，放在 `InboxItemSkeletonList` 里（[InboxItem](../inbox-item/inbox-item.md#loading)） |
| 加载更多 | 最后一项下面的 `ActivityInboxLoadingMore` |
| 空 | 一个 [EmptyState](../empty-state/empty-state.md)，说明这里会出现什么 |

```example
activity/compositions/loading-activity
```

```example
activity/compositions/loading-more-activity
```

```example
activity/compositions/empty-activity
```

## 行为 {#behavior}

- 选中的项在列表旁边打开，并在它的行上标记 `active`。
- 手机上，用面板头部的一个按钮代替侧栏，点开后显示视图和筛选。
- 有项被选中时，用选中数量和针对它们的操作代替排序菜单。
- 面板提供 Mark All Read 时，把它作为一个小号幽灵按钮放在面板头部。

## 无障碍 {#accessibility}

- 这些部件都是普通的布局元素；raft-ui 没有加任何 Base UI 基础组件。视图和筛选是侧栏行，已读筛选是 [Tabs](../tabs/tabs.md)，排序是 [DropdownMenu](../dropdown-menu/dropdown-menu.md)。
- 给面板标题一个标题层级（`render={<h2 />}`）。
- 用 `aria-current="page"` 标记当前视图，用 `aria-pressed` 标记按下的筛选。
- 给全选复选框起名（`aria-label="Select all visible activity"`）。
- 加载时在 `ActivityInboxPanel` 上设置 `aria-busy`。
