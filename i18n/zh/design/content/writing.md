---
title: 写作
summary: Raft 产品里文字的规则：大小写、语气、名称，以及按钮、它打开的对话框和确认按钮各写什么。
sourceHash: 1fbc93ea
---

# 写作

这些规则针对产品里的文字：标签、标题、消息、空状态和错误。Raft 听起来是什么样、为什么，见[语气](./voice-and-tone.md)；每个东西用哪个词，见[术语](./terminology.md)。写文档则遵守[写作指南](../authoring/writing.md)。

## 原则 {#principles}

- **简短、直接。** 说出事实或操作，用尽量少的字。保持网站的语气，在没有风险的地方带一点幽默。
- **Agent 是队友。** 叫它们的名字，用写人时用的动词；见[描述 Agent 的用语](../people-and-agents/writing-about-agents.md)。
- **一个操作只有一种说法。** 按钮和它打开的对话框用同样的字，确认按钮用同一个动词。

## 大小写 {#casing}

- 人能点击或说出一个操作的一切都用 sentence case：按钮、菜单项、标签页和标签栏项、分段控件、文字链接，以及图标按钮的工具提示和无障碍名称（`aria-label`）。只有第一个词和名称首字母大写：Create task、Mark all read、Create task from message、View in channel、Sign out、Add reaction。句子里的链接跟随句子的大小写。
- 标题、分组标题、描述和空状态也用 sentence case。对话框或底部面板的标题如果重复打开它的按钮的标签，就原样重复：Create channel 打开 Create channel；见[操作和它的对话框](#actions-and-their-dialogs)。
- 一个词在句子中间首字母大写，它在标签里才首字母大写。名称是这样：Raft 和作为专有名称的产品、套餐与功能（Agent Lounge、Stamp、Porthole、Raft Computer、Artifact、Pro）、人、Agent、服务器、频道、第三方名称（GitHub、Slack、Google）和缩写：Continue with Google、Open in Stamp、Edit Release Bot、Follow Artifact、Upgrade to Pro。
- 只有[术语](./terminology.md#places)列出的目的地和视图（Home、Activity、Saved、Settings、Members、Tasks、Computers，以及 Activity 的视图 Active、Saved 和 Done）和任务状态才算名称，前提是标签说的是那个地方或那个状态：Back to Home、Remove from Saved、Restore to Active、Mark as Done、Move to Backlog、Collapse Backlog。不止一个词的状态或 Agent 状态本身用 sentence case：In progress、In review。
- 其他所有分组标题、分区和设置页都用 sentence case，即使它说的是一个地方：Direct messages、Joint channels、Plan & billing、IM bridges、MCP servers、AI providers、Release notes、Language & region、Server profile、Server settings；频道的 Tasks 和 Files 分区出现在标签里时也一样（Close tasks、Open files）。
- 角色、状态和其他名词在标签里和在句子里一样写成小写（"only an owner or admin can…"）：Invite members、Visible to guests、Make admin、Add computer、Create tasks。已读和未读是状态，不是视图，所以 Mark as unread 和 Mark as Done 并排出现。权限的名称也是标签：Create agents。只有一个词的标签和任何第一个词一样首字母大写：Settings、Members、Owner、Admin。
- 引用另一个标签时照它的写法：Opens Create channel。
- 标签永远不以省略号结尾，任何语言都一样：写 Decline，不写 Decline…，每种译文也是如此。打开对话框的按钮说出它通向的操作，其余的由对话框来问。末尾的 "…" 读起来像被截断的文字，在中文里尤其如此，因为中文没有哪种标签惯例赋予它别的含义（Artea，2026-11-08，#proj-stamp:06e723e1）。进度文字可以保留它：Loading…、Saving…。字段的占位文字（Search members…）也可以；操作系统绘制的菜单（macOS 菜单栏、Dock 菜单和托盘菜单）里的项也可以，这些菜单遵循平台自己的惯例：在那里，每个应用都用 "…" 标出会打开窗口的项，Settings… 就是其中之一，所以它读起来是平台的写法，而不是被截断的文字（Artea，2026-11-08，#proj-raft-ui:9649adf4）。标签也从不截断：要么换行，要么由布局腾出空间（[字体排印](../foundations/typography.md)）。
- 任务状态写成 Backlog、Todo、In progress、Done 和 Closed，在标签、状态标签和句子里都一样。
- 长标签（比如菜单项）用 Title Case 读起来别扭；所有文字只用一种大小写，写、翻译和检查都更简单，也不用再记哪些短词保持小写（[0044](../decisions/0044-sentence-case-for-labels.md)）。
- 产品名词在句子和标签里都写成小写："Move to another computer"、"Leave this server"、Add computer。只有作为名称时才大写：Raft Computer。
- 永远不用全大写。字体和大小写规则见[字体排印](../foundations/typography.md#casing)。

## 语气 {#voice}

- 幽默只留给新手引导和成功消息。错误和空状态写得平实，让人能据此行动；见[语气](./voice-and-tone.md#tone-by-moment)。
- 用 "you" 称呼对方。用名字称呼 Agent，用第三人称："Bugen claimed #25"、"Martin needs your OK"。
- 写 Agent 用队友的动词（claim、hand off、review、ship、remember），永远不用 bot、process、execute 或 AI-powered。完整规则见[描述 Agent 的用语](../people-and-agents/writing-about-agents.md)。
- 用显示名称，不用用户名（handle）。
- 中文界面也这样写：句子短、形容词少，数字、ID 和时间仍然用 Space Mono。

## 操作和它的对话框 {#actions-and-their-dialogs}

- 按钮的标签就是它打开的对话框或底部面板的标题：Register app 打开 Register app，Create channel 打开 Create channel。点了什么就打开什么：标题换了说法的对话框，看起来像是打开错了。
- 编辑类的标题写 Edit 加上该项的名称：Edit Release Bot。
- 执行对话框用途的那个按钮，标签写它执行的操作，不带对象。通常就是标题里的动词：Create channel → Create，Register app → Register，Invite human → Invite，Stop Wug? → Stop。Edit 标题的按钮写 Save：Edit Release Bot → Save，因为这个按钮做的是保存修改。标题就在按钮正上方，已经说出了对象；按钮再说一遍就成了回声，而在手机的底部面板上，两者就并排在同一行里。
- 动词要完整，连同属于它的词：Sign out、Start over、Turn on、Make public、Reset session & restart。永远不要截成 Sign、Make 或 Reset：只写 Public 不是一个操作。
- 只有在光有动词会让人去猜时，才加上对象：
  - 标题没有说出对象，或者标题不是一个操作：Unsaved changes → Discard changes；See your whole chat history → Upgrade to Pro。
  - 按钮做的事与标题说的不同，或者要说明去哪里、做到什么程度：Create agent 里的 Add computer、Continue to Stripe、Move to the cloud、Disconnect for all agents。
  - 按钮要数出操作对象的数量：Add 3 members、Create 3 tasks。"Add 3" 读不通。
  - 按钮的动词是 Cancel：写 Cancel subscription，免得被当成关闭对话框。
  - 按钮出现在离标题较远的地方，必须自己说明是哪个操作：对话里操作卡片的确认按钮写 Create channel，因为屏幕上可能同时有好几张卡片，每张都是从按钮读起的（[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)）。
- 不可撤销的确认，也就是红色的那个按钮，要保留对象：Delete channel、Delete server。这是唯一必须精确的时刻，而人们按下去时读的是按钮，不是标题。
- 不执行操作、只关闭的按钮写 Cancel。只有当操作本身就是取消或停止时，Cancel 才会被读成那个操作；这时就说出保留的是什么：Cancel subscription 旁边写 Keep subscription，Cancel migration 旁边写 Keep migrating。
- Done、OK、Got it 和 Close 不是操作。只有对话框要做的事已经发生、按钮只负责关闭时才用它们：Add computer 的最后一步写 Done，因为计算机已经自己连上了。
- 把按钮接在标题后面读一遍来检查：Create channel, Create 读起来是对的；Create channel, Create channel 就是回声。如果光有动词已经说不清会发生什么，或者按钮是红色的，就把对象加回去。

## 登录和退出登录 {#signing-in-and-out}

- 写 Sign in 和 Sign out，也就是登录页上的说法，永远不用 Log in、Log out，也不把 Login 当动词用。在账户菜单、Settings、计算机上的运行时和应用的连接里，到处都用同一对词，让人只学一次。Apple、Google、Microsoft、GitHub 和 Slack 也都说 sign in 和 sign out。
- 在正文里写 signed in、signed out 和 sign back in；名词写 sign-in："The sign-in window was closed."
- 中文里，以上这些在简体中写「登录」和「退出登录」，在繁体中写「登入」和「登出」。
- Login 只在名称里保留原样：Login with Raft 和 Agent Login 这两个功能，以及 CLI 命令 `raft integration login`。它永远不是动词。

## 错误和空状态 {#errors-and-empty-states}

- 先说发生了什么，再说下一步怎么做："Runtime detection failed. Restart Raft Computer and try again."
- 说出失败的是哪个东西，而不是哪个系统失败了：写 "Could not save changes"，不写 "Request failed"。
- 空状态写成事实，用 sentence case："No tasks yet"、"No tasks match these filters"。有下一步时，加一行字或一个按钮。
- 按视图为什么是空的来选择标题的形式，因为每种形式告诉人的事情不同：

  | 为什么是空的 | 标题 |
  | --- | --- |
  | 还没有创建过或发生过任何东西 | No tasks yet |
  | 处理过的项会离开，所以一切都已处理完 | No unread conversations |
  | 筛选或搜索把所有东西都隐藏了 | No tasks match these filters |
  | 某个值从来没有填过 | No description |

- 用视图自身标签里的名词来说缺了什么：在标签为 Mentions 的筛选下写 "No mentions"；在标签为 Humans 的分区里写 "No humans yet"，不写 "No members yet"。
- 同级视图用同一种形式：同一个列表的几个筛选（All、Unread、Mentions）只有名词不同，这样人在它们之间切换时，读到的是同一句话在变化，而不是三种声音。
- 中文遵循同样的形式（[中文界面怎么写](./voice-and-tone.md#writing-in-chinese)）。
- 正忙的时候，说出正在发生什么："Uploading · 64%"、"Loading messages"。永远不写 "Processing…" 或光秃秃的 "Loading…"。
- 说出一个上限或容量用了多少，写出 "used" 这个词，并把重置时间放在旁边："62% used · resets in 3h"。永远不写光秃秃的 "62%"，它既可能是已用也可能是剩余；也永远不用剩下的量代替已用的量。空闲的量可以放在工具提示里："378 GB free of 994 GB"（[Meter](../../packages/ui/src/components/meter/meter.md#content)）。
- 每种问题显示在哪里（行内、横幅、轻提示或通知中心），见[反馈](../patterns/feedback.md)。

## 时间 {#times}

- 凡是人们作为对话或列表的一部分来读的时钟时间，都按这个人自己选的 12 小时制或 24 小时制显示：消息时间、合并消息旁的悬停时间、动态里更早的行的悬停时间、工具提示。标题栏写 6:30 PM，下面却显示 18:35，同一个界面就自相矛盾了。
- 在按天分组的列表里，比如动态，今天的行，以及不到 1 小时的行，时间改用简短的相对时间：刚刚、3 分钟、2 小时（英文为 now、3m、2h）。日期标题已经写着 Today，而那里人们读的是隔了多久（[列表行里的时间](../patterns/lists.md#times-in-list-rows)）。
- 只在用来比较和复制、而不是顺带一瞥的记录里用 24 小时制：日志、事件行、审计元数据、导出。在这些地方，固定的格式比个人习惯更重要。
- 只放得下时和分的地方（合并消息旁 35px 宽的时间），省掉 AM 和 PM：6:35、18:35。这个时间只是在组内给消息定位；组的标题栏时间和工具提示会给出完整时间。

## 该写和不该写 {#do-and-dont}

| 写 | 不写 |
| --- | --- |
| No tasks match these filters | No data available |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Use lowercase and dashes: launch-week | Invalid input |
| Bring an agent | Add AI assistant |
| Channels | CHANNELS |

## 相关 {#related}

- [语气](./voice-and-tone.md)：Raft 在每个时刻听起来是什么样。
- [术语](./terminology.md)：产品用词和要避免的词。
- [字体排印](../foundations/typography.md)：Space Grotesk 和 Space Mono。
- [表单](../patterns/forms.md)：标签、帮助文字和校验消息。
- [反馈](../patterns/feedback.md)：错误怎么措辞、放在哪里。
