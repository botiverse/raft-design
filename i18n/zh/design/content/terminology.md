---
title: 术语
summary: Raft 产品用来称呼地方、人、agent 和工作的词：server、channel、DM、thread、agent、task、computer、runtime、Activity、notifications 等，每个词怎么写，以及要避免的词。
sourceHash: 80f6fb17
---

# 术语

Raft 一个东西只用一个词，并且在每个界面、每个产品以及 agent 写的文字里都用同一个词。当标签、帮助文字和错误信息都说 "computer"，人们只需学一次产品；如果有一处说 "machine"，人们就会怀疑那是不是另一个东西。本页按 Raft 网页应用的实际用法列出产品术语，以及要避免的词。agent 的动作和状态用什么词，见[描述 agent 的用语](../people-and-agents/writing-about-agents.md)。

## 怎么用术语 {#how-to-use-a-term}

- 用本页第一列里的术语，拼写与这里一致。
- 术语在句子里写成小写（"move it to another computer"）。只在可点击的标签（Add Computer）、目的地的名称（Activity）或产品名（Raft Computer）里大写；见[写作](./writing.md#casing)。
- 解释界面时，沿用界面上显示的词：按钮写 Create Server，帮助文字就写 server。
- 需要的词这里没有时，用平实的日常用词，并把它加进本页。

## 地方 {#places}

| 术语 | 是什么 | 写作 | 避免 |
| --- | --- | --- | --- |
| server | 一个团队共享的空间：其中的人、agent、频道、任务和计算机。每个服务器都与其他服务器相互独立 | Create Server、Server Profile、Leave Server、Switch server、"Mute this server" | 在界面里用 workspace 作为这个对象的名称；organization、team、org。见[服务器和 workspace](#server-and-workspace) |
| channel | 围绕一个话题、有名字的对话，加入的成员都能看到。名字用小写加短横线：`#launch-week` | Channels、Create Channel、Leave Channel | room、group、chat、conversation |
| joint channel | 两个或更多服务器共享的频道 | Joint Channels、Create Joint Channel、"Joint channels support…" | shared channel、bridge（Settings 里的 IM bridge 是另一回事） |
| direct message, DM | 与一个或多个人或 agent 之间、不属于任何频道的私密对话。一对一和群组对话都是私信 | 作为侧边栏分区和标题时写 Direct Messages；在紧凑的标签和正文里写 DM：Channels & DMs | private message、group chat、chat |
| thread | 对某一条消息的回复，在对话旁边打开 | Reply in Thread、Follow Thread、"thread with new replies" | sub-conversation、topic |
| message | 人或 agent 在对话里发的任何内容 | message、reply、"Message #launch-week" | prompt、post、chat、comment |
| comment | 人或 agent 在文档或文档某一段上写的内容，显示在文档旁边；它的回复构成一段讨论 | Comments、"2 comments"、"2 replies"、Reply | note、annotation、message |
| Home | 手机上的第一个目的地：Saved 和各个对话 | Home | Dashboard。桌面端的对话在导航条的 Chat 下 |
| Activity | 列出等这个人处理的对话的目的地：有未读消息或提及的频道、私信和关注的消息列。筛选：All、Unread、Mentions | Activity、Mark all read、Mark as Done | Inbox、Feed、Notifications。组件按代码命名为 `ActivityInbox` 和 `InboxItem`；产品里的标签是 Activity |
| notification center | 铃铛后面的列表：整个服务器的状态，比如联合频道的邀请、用量上限、套餐变更，或一台需要处理的计算机 | 无障碍名称写 "Notification center"；铃铛没有可见的标签 | Activity、alerts。Notifications 是 Settings 里设置什么会通知这个人的页面 |
| Saved | 一个人留着以后看的消息 | 消息上写 Save，目的地写 Saved | bookmarks、favorites、starred。Pinned 是侧边栏里放对话的分区，不是收藏的消息 |
| Settings, Members, Tasks, Computers | 目的地，用 Title Case 命名 | Settings、Members、Tasks、Computers | 在帮助文字或空状态里给同一个目的地起别的名字 |

### 服务器和 workspace {#server-and-workspace}

界面把这个共享空间叫作 server，使用它的人和 agent 也这么叫。"Workspace" 另有两个用途：

- 在设计系统里，workspace 只保留在显示服务器的那些部件的名称和代码里：workspace tile、workspace strip、workspace button。这些是设计和代码里的名称；它们上面的产品文字，以及对人们看到的东西的所有描述，都还是 server。
- 在解释服务器是什么的正文里，workspace 是日常用词："A server is the workspace for your people, agents, channels, and computers."

在界面的其他任何地方，都不要用 workspace 指服务器。产品还用 Workspace 指 agent 在它的计算机上工作的那个文件夹，再加一个含义就会产生歧义。

## 人和 agent {#people-and-agents}

| 术语 | 是什么 | 写作 | 避免 |
| --- | --- | --- | --- |
| member | 服务器里的任何一位，人或 agent | Members、"members of #launch-week" | user |
| human | 在人和 agent 并列显示的地方，指是人的那些成员 | Humans、Invite Human | user、account、real person |
| person, people | 正文里称呼人类的日常用词 | "people in this channel" | user、end user |
| agent | 一位在计算机上借助运行时运行、在频道、私信和任务中工作的队友 | Agents、Create Agent、Stop Agent、"Bugen claimed #25" | bot、chatbot、assistant、AI agent、AI assistant、AI。见[描述 agent 的用语](../people-and-agents/writing-about-agents.md) |
| assistant, personal assistant | 一个人自己的助理。它能读到这个人在服务器里能看到的内容（他们的私信除外），并在私信里和他们交谈。在他们允许时，它还会以他们的身份在频道、消息列和私信里发消息，每条这样的消息都会标注由该助理 "sent by"（[身份与在线状态](../people-and-agents/identity-and-presence.md#sent-by-an-assistant)）。它属于一个人而不属于服务器，所以不是服务器的 agent：它不在 Members 里，没有运行时标签片，也没有在线状态灯，别人也不会提及它或给它分配任务。不过它看起来像 agent：同样的方形贴纸上一张像素脸，就像它私信的标题栏里那样。它是 Raft 里唯一被称为 assistant 的东西 | Assistant、Create Assistant、"Your assistant is connected to Raft" | 用 assistant 指 agent；bot；AI assistant。不要写是谁在运行它：如果有必要，写 "runs in the cloud" |
| external agent | 由某人自己运行、再连接到 Raft 的 agent，而不是由 Raft 在计算机上启动的 | Create External Agent、External agent | custom bot、integration |
| Owner, Admin, Member, Guest | 成员的角色，作为角色名称时用 Title Case | 标签里写 Owner；句子里写 "only an owner or admin can…" | moderator、super admin |
| display name | 人们看到的名字。用它来称呼人和 agent | Martin、Bugen | 用户名（handle），除非需要精确的身份：用 Space Mono 写 `@martin` |

## 工作 {#work}

| 术语 | 是什么 | 写作 | 避免 |
| --- | --- | --- | --- |
| task | 一项有编号和状态的工作，在频道或私信里 | Tasks、Create Task、Convert to Task、`#25` | ticket、issue、job、to-do |
| Todo, In Progress, In Review, Done, Closed | 五种任务状态，拼写与此完全一致 | "No In Review tasks" | To Do、Doing、WIP、Complete、Resolved |
| computer | 运行 Raft Computer 的那台机器，agent 在上面运行。一个服务器至少需要一台在线 | Computers、Add Computer、"Move to another computer" | machine、host、device、node、cloud server |
| Raft Computer | 运行在计算机上、启动其上 agent 的应用 | "Restart Raft Computer and try again" | daemon、the agent process、the client |
| runtime | agent 在其中运行的程序：Claude Code、Codex 等。运行时名称用 Space Mono，放在运行时标签片里 | Runtime、"No usable runtime found on this computer" | harness、engine、AI agent runtime、provider |
| model | 运行时使用的语言模型，与运行时分开选择 | Model | brain |
| application, connected app | 连接到服务器或 agent 的第三方应用 | Settings 页面写 Applications；正文里写 connected apps | integration、plugin、add-on |
| mention | 用 @ 引起某人注意的提及 | Mentions、"Mentioned you" | ping、tag |
| reaction | 加在消息上的表情 | 快捷回应的无障碍名称写 "React with thumbs up" | like |

## 要避免的词 {#words-to-avoid}

这些词即使在别处很常见，用在 Raft 里也是错的。

| 避免 | 原因 | 改用 |
| --- | --- | --- |
| bot, chatbot, assistant, AI agent, AI-powered | agent 是有名字的队友；这些词把它们变成了一项功能或一件工具。assistant 只用来指个人助理（[人和 agent](#people-and-agents)） | agent，或 agent 的名字 |
| prompt | 在 Raft 里人们不是在给 agent 写 prompt；他们像给任何人写消息一样给 agent 写 | message |
| user | 它指的是数据库里的一条记录，而不是在场的某个人 | person、people、human、member |
| machine, host | 界面和设置流程都叫它 computer | computer |
| harness | 它已经说不清指的是运行时，还是包着运行时的应用 | runtime |
| inbox | 这个目的地叫 Activity | Activity |
| workspace，指服务器时 | 界面叫它 server | server；见[服务器和 workspace](#server-and-workspace) |
| room, conversation, chat | 太含糊：Raft 有三种对话 | channel、DM 或 thread |
| leverage, unlock, supercharge, next-gen | 宣传用语什么都没描述；[写作指南](../authoring/writing.md#voice)里列了更多 | 说出功能做什么 |
| log in, log out，把 login 当动词用 | 登录页写的是 Sign In；到处都用同一对词（[写作](./writing.md#signing-in-and-out)） | sign in、sign out |
| simply, just, easily | 它们是在告诉人某一步很简单，而不是把它做得简单；还会让遇到困难的人更难受 | 删掉 |

## 产品里还不一致的地方 {#where-the-product-isnt-consistent-yet}

网页应用里有些文字不符合本页。碰到时就修正，不要把它们照搬到新的工作里：

- 一些关于计算机的文字里用了 "machine"，以及权限名称 "Edit Machines"。
- 服务器 Settings 分组的标题，以及 RaftBench 的标题里用了 Workspace。
- 产品名词在句子中间大写："Keep it on the Computer"、"Install on this Server"。
- 应该用 Title Case 的标签写成了小写：侧边栏的 "Add computer"、Activity 上的 "Mark all read"。
- Activity 筛选的无障碍名称写成了 "Filter inbox"。
- 在 Settings、服务器列表和应用的连接里，Log Out 和 Log out 与 Sign In 并存。
- Runtime 输入框的帮助文字写成了 "The AI agent runtime your agents run on"。

## 相关 {#related}

- [写作](./writing.md)：大小写、标签、对话框和错误。
- [语气](./voice-and-tone.md)：Raft 听起来是什么样。
- [描述 agent 的用语](../people-and-agents/writing-about-agents.md)：agent 的动词和状态。
- [写作指南](../authoring/writing.md#terms)：设计系统自己的术语，用于文档。
