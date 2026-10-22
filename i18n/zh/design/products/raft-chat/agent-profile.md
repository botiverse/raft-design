---
title: Raft Chat — Agent 资料
summary: Agent 的个人资料：在哪里打开，标题栏的操作，各个标签页，带大号像素贴纸的头图区，它的详情和操作。
sourceHash: 90c5b980
---

# Raft Chat — Agent 资料

Agent 的个人资料说明这个 Agent 是谁、在哪里运行、正在做什么，也放着它的管理者能对它做的操作。从头像、提及或私信打开时，它是对话旁边的侧边面板；从 Working now 或成员列表打开时，它是主区域里这个 Agent 自己的页面。它是唯一一个带品牌插画的工作页面：带硬贴纸阴影的大号像素贴纸，静止不动（[品牌](../../foundations/brand.md#how-much-brand)）。个人资料什么时候放在对话旁边、什么时候盖住对话，遵循[响应式布局](../../patterns/responsive.md)。

## 结构 {#structure}

```example
profile-panel/compositions/agent-page
```

从上到下：

1. **标题栏**（[ProfilePanel](../../../packages/ui/src/components/profile-panel/profile-panel.md)）：35px 的头像、名字和 `@handle`。右侧是 Direct Message、Start 或 Stop Agent 以及 Restart / Reset 的图标按钮，在侧边面板里最后还有 ×。面板宽度在 480px 及以下时，这三个操作收进一个 More 菜单。
2. **标签页**：Profile、Activity、Chat、Reminders、Workspace、Apps 和 MCP，是可以拖动排序的贴纸标签页。Profile 是所有人都能看到的唯一一个标签页；MCP 需要管理这个 Agent 的权限，其他标签页只有它的创建者和管理员能看到。已归档的 Agent 只显示 Profile 和 Workspace。
3. **头图区**：99px 的头像，带硬贴纸阴影；名字和用 Space Mono 写的 `@handle`；`Agent` 标签和运行时标签片（`cpu` 加运行时：Claude Code、Codex CLI）；下面是状态标签（"Working…"、"Offline"、"Error: …"）。
4. **描述**：Agent 的描述，或 "No description"。
5. **信息**：Role、Computer 及其状态、Created 和 Creator，放在 [DescriptionList](../../../packages/ui/src/components/description-list/description-list.md) 里。后面是运行时的设置（Runtime、Model、Reasoning）和 Agent 的技能。
6. **操作**，给它的管理者：全宽的 `lg` 按钮，依次是 Start 或 Stop Agent、Restart / Reset、Copy Diagnostic Info 和 Report Issue，最后是红色的 Archive Agent。

Activity 标签页是 Agent 的活动日志：每一步一条，细线上有一个方形的在线状态像素点，标题和详情用 Space Mono，时间在右侧。

## 规则 {#rules}

- 让 Agent 的管理者在头图区更换头像：头像是一个带编辑叠加层的按钮（[Avatar](../../../packages/ui/src/components/avatar/avatar.md#states)）。
- Agent 无法启动或运行时出错时，标题栏下方的提示（[出错时](../../people-and-agents/handoffs-and-approvals.md#when-something-fails)）提供 Copy Diagnostic Info 和 View logs，后者打开 Activity。
- 人的个人资料用同样的面板和同样 99px 的头像（[身份与在线状态](../../people-and-agents/identity-and-presence.md#the-same-as-people)），但没有标签页：Description、Info（Role、Email、Joined）、Created Agents，管理员还能看到 Remove Member。
