---
title: 人能点击的一切都用 sentence case
summary: 按钮、菜单项、标签页、链接、工具提示、无障碍名称和任务状态都用 sentence case，不再用 Title Case，这样 Raft 的所有文字只有一种大小写；名称保留它们的大写。
sourceHash: 116771fa
---

# 0044. 人能点击的一切都用 sentence case

本记录取代[决策 0002](./0002-no-all-caps.md) 里关于 Title Case 的部分。它不用全大写的规则仍然有效。

## 背景 {#context}

[决策 0002](./0002-no-all-caps.md) 让所有文字都用 sentence case，只有可点击的文字保留产品里的 Title Case：Create Task、Mark All Read、Sign Out。Title Case 带着一份保持小写的短词清单（a、the、to、in、from…），清单又有例外（Sign In、Turn On），所以写一个标签要用一条规则，检查它又要用另一条。菜单项越来越长，比如 Create Task from Message，用 Title Case 写长标签读起来别扭。中文没有大小写，译者还得多处理一件事。设计负责人（stdrc）在 2026-11-05 于 #proj-raft-ui:10ce032d 决定修改这套系统。

## 决定 {#decision}

- 人能点击或说出一个操作的一切都用 sentence case：按钮、菜单项、标签页和标签栏项、分段控件、文字链接、图标按钮的工具提示和无障碍名称（`aria-label`），以及重复打开它的按钮标签的对话框或底部面板标题。Create Task 改为 Create task，Mark All Read 改为 Mark all read，Create Task from Message 改为 Create task from message，View in Channel 改为 View in channel，Sign Out 改为 Sign out，Add Reaction 改为 Add reaction。
- 一个词在句子中间首字母大写，它在标签里才首字母大写。名称保留它们的大写，具体见[写作](../content/writing.md#casing)：Raft 和作为专有名称的产品、套餐与功能（Agent Lounge、Stamp、Porthole、Raft Computer、Artifact、Pro）、人、Agent、服务器、频道、第三方名称（GitHub、Slack、Google）和缩写。
- 产品自己的地方里，只有[术语](../content/terminology.md#places)列出的目的地和视图，以及任务状态，才算名称：产品和文档在句子中间也把它们首字母大写（"open Settings"、"moved #25 to Done"），所以它们在标签里也保留大写：Back to Home、Remove from Saved、Restore to Active、Move to Backlog、Mark as Done。状态是 Backlog、Todo、In progress、Done 和 Closed；不止一个词的状态本身用 sentence case（In progress、In review）。
- 其他所有分组标题、分区和设置页都用 sentence case：Direct messages、Joint channels、Plan & billing、IM bridges、MCP servers、AI providers、Release notes、Language & region、Server profile、Server settings。
- 角色、状态、权限名称和其他名词在标签里和在句子中间一样写成小写（"only an owner or admin can…"）：Invite members、Visible to guests、Mark as unread、Create agents。只有一个词的标签首字母大写：Settings、Members、Owner、Admin。
- 不重复标签的标题、描述、空状态、事件行和其他句子不在这项决定之内，保持不变；只有不止一个词的状态改用它自己的写法（moved #25 to In progress）。

## 影响 {#consequences}

- 规则写在[写作](../content/writing.md#casing)和[字体排印](../foundations/typography.md#casing)里，例子在[术语](../content/terminology.md)、[无障碍](../foundations/accessibility.md#language-and-casing)、组件文档和文档的示例里。
- Title Case 那份保持小写的短词清单不再需要。一条测试，「在句子中间是否首字母大写」，决定标签里的每个词；哪些地方算名称由术语决定：术语新增了 Active（以及 Activity 的另外两个视图）和 Artifact。
- raft-ui 唯一一个不止一个词的内置英文标签，`AppShellSidebarTrigger` 的标签，改为 Collapse sidebar 和 Expand sidebar。
- 现在用 Title Case 的产品文案才是不一致的那些（[术语](../content/terminology.md#where-the-product-isnt-consistent-yet)）：改到它们时顺手修正。
- 要撤销：在写作和字体排印里恢复 Title Case 和它的短词规则，并恢复示例和 `AppShellSidebarTrigger` 里的标签。没有别的东西依赖这套大小写。

## 考虑过的其他方案 {#alternatives-considered}

- **可点击的文字保留 Title Case。** 大小写能告诉人哪些是控件，但代价是长标签读起来别扭，还有一条带例外的规则，每个写作者和译者都得学。
- **目的地和状态当作普通的词**（Remove from saved、Move to backlog）。产品在句子中间把它们当名称写（"moved #25 to Done"），这样标签和旁边的句子会写成两样。
- **不止一个词的分区和设置页当作名称，用 Title Case**（Direct Messages、Plan & Billing）。文档这样写只是因为旧的标签规则，所以「句子中间」的测试只会把它重复回来，而这样的名称清单永远列不全；除了术语列出的少数几个地方，其余一律用一条规则更简单。
- **只有按钮用 Title Case，菜单项用 sentence case。** 控件常常用同样的词，比如同一个操作的按钮和菜单项，这样会有两种大小写。

## 相关 {#related}

- [写作](../content/writing.md#casing)
- [字体排印](../foundations/typography.md#casing)
- [决策 0002](./0002-no-all-caps.md)
