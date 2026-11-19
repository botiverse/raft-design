---
title: Raft Chat — Agent 资料
summary: Agent 的个人资料：在哪里打开，标题栏的操作，各个标签页，带大号像素贴纸的头图区，它的详情、它的操作，以及它的计算机离线时显示的卡片。
sourceHash: b5206940
---

# Raft Chat — Agent 资料

Agent 的个人资料说明这个 Agent 是谁、在哪里运行、正在做什么，也放着它的管理者能对它做的操作。从头像、提及或私信打开时，它是对话旁边的侧边面板；从成员页打开时，它是成员目录旁边的侧边面板；从 Working now 打开时，它是主区域里这个 Agent 自己的页面。它是唯一一个带品牌插画的工作页面：带硬贴纸阴影的大号像素贴纸，静止不动（[品牌](../../foundations/brand.md#how-much-brand)）。个人资料什么时候放在对话旁边、什么时候盖住对话，遵循[响应式布局](../../patterns/responsive.md)。

## 结构 {#structure}

```example
profile-panel/compositions/agent-page
```

从上到下：

1. **标题栏**（[ProfilePanel](../../../packages/ui/src/components/profile-panel/profile-panel.md)）：35px 的头像、名字和 `@handle`。右侧是 Direct message、Start 或 Stop agent 以及 Restart / Reset 的图标按钮，在侧边面板里最后还有 ×。面板宽度在 480px 及以下时，这三个操作收进一个 More 菜单。
2. **标签页**：Profile、Activity、Chat、Reminders、Workspace、Apps 和 MCP，是可以拖动排序的贴纸标签页。Profile 是所有人都能看到的唯一一个标签页；MCP 需要管理这个 Agent 的权限，其他标签页只有它的创建者和管理员能看到。已归档的 Agent 只显示 Profile 和 Workspace。
3. **头图区**：99px 的头像，带硬贴纸阴影；名字和用 Space Mono 写的 `@handle`；`Agent` 标签和运行时标签片（`cpu` 加运行时：Claude Code、Codex CLI）；下面是状态标签（"Working…"、"Offline"、"Computer offline"、"Error: …"）。
4. **离线卡片**，只在 Agent 的计算机离线时显示（[见下文](#its-computer-is-offline)）。
5. **描述**：Agent 的描述，或 "No description"。
6. **信息**：Role、Computer 及其状态、Created 和 Creator，放在 [DescriptionList](../../../packages/ui/src/components/description-list/description-list.md) 里。后面是运行时的设置（Runtime、Model、Reasoning）和 Agent 的技能。Runtime 只放运行时标签片；它下面的 Usage 行列出这个运行时的账户在 Agent 所在计算机上的每一个用量窗口，每个窗口占两行：先是 OAR 给出的名字，弱化显示（"Current week (all models)"），然后是 120px 的用量条和数值（"60% used"、"Back in 6d"），用列表里值的字体样式，第一个名字和标签对齐在同一条基线上。在 400px 的栏里，完整的名字放不进用量条旁边，所以单独占一行。它全部列出，而不是挑出和 Agent 的模型有关的那些（xxchan，2026-11-12，#triage:45a94e57）。退出登录时，这一行写 Signed out 和一个 Sign in 链接；没有用量可显示时（运行时不报告用量，或者 Agent 用它自己的账户登录），就没有 Usage 行。放在标签片旁边的用量条看起来像是硬加上去的，它的小说明文字也飘离了这一行（xxchan）。状态和颜色与计算机的用量单元格相同（[Computers](./computers.md#a-runtimes-usage-cell)）。
7. **操作**，给它的管理者：一张没有标题的操作行卡片，和频道详情末尾一样（[频道](./channel.md)、[ListRow › 操作的风险](../../../packages/ui/src/components/list-row/list-row.md#an-actions-risk)）：Start agent 或 Stop agent、Restart / Reset、Copy diagnostic info 和 Report issue，最后是 Archive agent。Stop agent 和 Restart / Reset 是橙色（`tone="warning"`：会打断它的工作，但可以恢复）；Start agent、Copy diagnostic info 和 Report issue 不加颜色，因为它们不打断任何事；Archive agent 是红色（`tone="danger"`：归档的 Agent 不能恢复）。每一项保留原来的确认。全宽按钮加上最后一个整块红色的按钮，比资料页上任何东西都重，也和其他详情页的末尾都不一样（cindyz，2026-11-19，#triage:f2e107f7）。

Activity 标签页是 Agent 的活动日志：每一步一条，细线上有一个方形的在线状态像素点，标题和详情用 Space Mono，时间在右侧。

日志最新的一步在最下面，并像对话一样跟随它：日志末尾在视野里时，新的步骤会让它保持在那里；这个人向上滚动后，他正在读的内容不会移动（[跟随最新内容](../../patterns/conversation.md#following-the-newest)）。它的 Back to bottom 按钮按步数计，不按消息数："3 new steps"。

## 规则 {#rules}

- 让 Agent 的管理者在头图区更换头像：头像是一个带编辑叠加层的按钮（[Avatar](../../../packages/ui/src/components/avatar/avatar.md#states)）。
- Agent 无法启动或运行时出错时，标题栏下方的提示（[出错时](../../people-and-agents/handoffs-and-approvals.md#when-something-fails)）提供 Copy diagnostic info 和 View logs，后者打开 Activity。
- Agent 的计算机离线时，个人资料不提供 Start 或 Restart / Reset：下面的离线卡片占据它们的位置，因为计算机恢复后 Agent 会自己启动（[计算机离线的 Agent](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)）。
- 人的个人资料用同样的面板和同样 99px 的头像（[身份与在线状态](../../people-and-agents/identity-and-presence.md#the-same-as-people)），但没有标签页：Description、Info（Role、Email、Joined）、Created agents，管理员还能看到 Remove member。

## 它的计算机离线 {#its-computer-is-offline}

Agent 的计算机离线时，头图区下方有一张小卡片说明这件事："Martin's Mac has been offline since 10:42"，点计算机的名字会打开它的页面。其他每个地方都链接到这里（[计算机离线的 Agent](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)）。

卡片下面是同样的两步，所有看的人都一样（cindyz，2026-11-05，#triage:fb51e3a0）：

1. Turn on Martin's computer, Martin's Mac, and keep it awake.（打开 Martin 的计算机 Martin's Mac，并让它保持唤醒。）
2. On it, open Raft Desktop, or run `raft-computer restart`.（在这台计算机上打开 Raft Desktop，或者运行 `raft-computer restart`。）

- 第一步里所有者的名字写成普通文字，不做成链接：这一步讲的是计算机，放一个链接会把人从解决办法引开。只有计算机的名字是链接，指向它的页面（cindyz，2026-11-05）。
- 对所有人显示同样的步骤，不管他们是什么角色、计算机是不是他们的。第一步写明了是谁的计算机，所以碰不到这台计算机的人知道该去问谁；不另加一行 "Ask Martin"。
- 只保留这两步。`raft-computer restart` 在 Raft Computer 没有运行时启动它，卡住时重启它，所以两种情况都管到了；`raft-computer doctor` 和其他诊断命令留在计算机的页面上。
- 不要把任何人引到另一个帮助页面：这张卡片是 Agent 的状态链接到的唯一地方。
- 「计算机的所有者」指这台计算机所属的成员，不是服务器的所有者（Owner）角色（[术语](../../content/terminology.md#people-and-agents)）。
