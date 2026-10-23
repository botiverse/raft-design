---
title: 写作
summary: Raft 产品里文字的规则：大小写、语气、名称，以及按钮、它打开的对话框和确认按钮各写什么。
sourceHash: 6bcf9bbd
---

# 写作

这些规则针对产品里的文字：标签、标题、消息、空状态和错误。Raft 听起来是什么样、为什么，见[语气](./voice-and-tone.md)；每个东西用哪个词，见[术语](./terminology.md)。写文档则遵守[写作指南](../authoring/writing.md)。

## 原则 {#principles}

- **简短、直接。** 说出事实或操作，用尽量少的字。保持网站的语气，在没有风险的地方带一点幽默。
- **Agent 是队友。** 叫它们的名字，用写人时用的动词；见[描述 Agent 的用语](../people-and-agents/writing-about-agents.md)。
- **一个操作只有一种说法。** 按钮和它打开的对话框用同样的字，确认按钮用同一个动词。

## 大小写 {#casing}

- 所有可点击的东西都用 Title Case，文字链接也一样：Create Task、Mark All Read、Create Task from Message、Sign Out。句子里的链接跟随句子的大小写。
- 在 Title Case 里，这些短词保持小写：a、an、the、to、in、on、of、for、as、and、or、with、from、by、at。起连接作用的短词读起来像承载意思的词之间的关节：Continue with Google、Remove from Saved、Sort by Newest。它们在开头或结尾、或者属于动词的一部分时，首字母大写：Sign In、Sign Out、Turn On、Back to Sign In，这样 Sign In 和 Sign Out 这样成对的词才保持一致。
- 标题、分组标题、描述和空状态用 sentence case。对话框或底部面板的标题如果重复打开它的按钮的标签，就保留那个标签的 Title Case：Create Channel；见[操作和它的对话框](#actions-and-their-dialogs)。
- 产品名词在句子里写成小写："Move to another computer"、"Leave this server"。只有作为可点击标签或名称的一部分时才大写：Add Computer、Raft Computer。
- 永远不用全大写。字体和大小写规则见[字体排印](../foundations/typography.md#casing)。

## 语气 {#voice}

- 幽默只留给新手引导和成功消息。错误和空状态写得平实，让人能据此行动；见[语气](./voice-and-tone.md#tone-by-moment)。
- 用 "you" 称呼对方。用名字称呼 Agent，用第三人称："Bugen claimed #25"、"Martin needs your OK"。
- 写 Agent 用队友的动词（claim、hand off、review、ship、remember），永远不用 bot、process、execute 或 AI-powered。完整规则见[描述 Agent 的用语](../people-and-agents/writing-about-agents.md)。
- 任务状态写作 Todo、In Progress、In Review、Done 和 Closed。
- 用显示名称，不用用户名（handle）。
- 中文界面也这样写：句子短、形容词少，数字、ID 和时间仍然用 Space Mono。

## 操作和它的对话框 {#actions-and-their-dialogs}

- 按钮的标签就是它打开的对话框或底部面板的标题：Register App 打开 Register App，Create Channel 打开 Create Channel。点了什么就打开什么：标题换了说法的对话框，看起来像是打开错了。
- 编辑类的标题写 Edit 加上该项的名称：Edit Release Bot。
- 执行对话框用途的那个按钮，标签写它执行的操作，不带对象。通常就是标题里的动词：Create Channel → Create，Register App → Register，Invite Human → Invite，Stop Wug? → Stop。Edit 标题的按钮写 Save：Edit Release Bot → Save，因为这个按钮做的是保存修改。标题就在按钮正上方，已经说出了对象；按钮再说一遍就成了回声，而在手机的底部面板上，两者就并排在同一行里。
- 动词要完整，连同属于它的词：Sign Out、Start Over、Turn On、Make Public、Reset Session & Restart。永远不要截成 Sign、Make 或 Reset：只写 Public 不是一个操作。
- 只有在光有动词会让人去猜时，才加上对象：
  - 标题没有说出对象，或者标题不是一个操作：Unsaved changes → Discard Changes；See your whole chat history → Upgrade to Pro。
  - 按钮做的事与标题说的不同，或者要说明去哪里、做到什么程度：Create Agent 里的 Add Computer、Continue to Stripe、Move to the Cloud、Disconnect for All Agents。
  - 按钮要数出操作对象的数量：Add 3 Members、Create 3 Tasks。"Add 3" 读不通。
  - 按钮的动词是 Cancel：写 Cancel Subscription，免得被当成关闭对话框。
  - 按钮出现在离标题较远的地方，必须自己说明是哪个操作：对话里操作卡片的确认按钮写 Create Channel，因为屏幕上可能同时有好几张卡片，每张都是从按钮读起的（[MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)）。
- 不可撤销的确认，也就是红色的那个按钮，要保留对象：Delete Channel、Delete Server。这是唯一必须精确的时刻，而人们按下去时读的是按钮，不是标题。
- 不执行操作、只关闭的按钮写 Cancel。只有当操作本身就是取消或停止时，Cancel 才会被读成那个操作；这时就说出保留的是什么：Cancel Subscription 旁边写 Keep Subscription，Cancel Migration 旁边写 Keep Migrating。
- Done、OK、Got It 和 Close 不是操作。只有对话框要做的事已经发生、按钮只负责关闭时才用它们：Add Computer 的最后一步写 Done，因为计算机已经自己连上了。
- 把按钮接在标题后面读一遍来检查：Create Channel, Create 读起来是对的；Create Channel, Create Channel 就是回声。如果光有动词已经说不清会发生什么，或者按钮是红色的，就把对象加回去。

## 登录和退出登录 {#signing-in-and-out}

- 写 Sign In 和 Sign Out，也就是登录页上的说法，永远不用 Log In、Log Out，也不把 Login 当动词用。在账户菜单、Settings、计算机上的运行时和应用的连接里，到处都用同一对词，让人只学一次。Apple、Google、Microsoft、GitHub 和 Slack 也都说 sign in 和 sign out。
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
- 每种问题显示在哪里（行内、横幅、轻提示或通知中心），见[反馈](../patterns/feedback.md)。

## 时间 {#times}

- 凡是人们作为对话或列表的一部分来读的时钟时间，都按这个人自己选的 12 小时制或 24 小时制显示：消息时间、合并消息旁的悬停时间、Activity、工具提示。标题栏写 6:30 PM，下面却显示 18:35，同一个界面就自相矛盾了。
- 只在用来比较和复制、而不是顺带一瞥的记录里用 24 小时制：日志、事件行、审计元数据、导出。在这些地方，固定的格式比个人习惯更重要。
- 只放得下时和分的地方（合并消息旁 35px 宽的时间），省掉 AM 和 PM：6:35、18:35。这个时间只是在组内给消息定位；组的标题栏时间、工具提示和消息菜单的第一行会给出完整时间。

## 该写和不该写 {#do-and-dont}

| 写 | 不写 |
| --- | --- |
| No tasks match these filters | No data available |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Use lowercase and dashes: launch-week | Invalid input |
| Bring an Agent | Add AI assistant |
| Channels | CHANNELS |

## 相关 {#related}

- [语气](./voice-and-tone.md)：Raft 在每个时刻听起来是什么样。
- [术语](./terminology.md)：产品用词和要避免的词。
- [字体排印](../foundations/typography.md)：Space Grotesk 和 Space Mono。
- [表单](../patterns/forms.md)：标签、帮助文字和校验消息。
- [反馈](../patterns/feedback.md)：错误怎么措辞、放在哪里。
