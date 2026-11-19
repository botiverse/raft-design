---
title: Raft Chat — 新手引导
summary: 第一次运行：新手引导 v3 的那一个问题，以分栏页面呈现的注册和设置（页面上的预览逐渐长成第一个频道）、第一个 Agent 和导览；以及在 v3 上线之前使用的五步设置对话框。
sourceHash: 563fab26
---

# Raft Chat — 新手引导

这个人来的时候，带着一件想做成的事。新手引导 v3 先问这件事，然后让他注册，让一台计算机开始工作，并启动负责设置的 Agent Cindy，由她为这件事提议一个 Agent 和一个频道。到这一步为止的每个页面都是分栏页面：左边是要做的事，右边是第一个频道的预览，随着各部分变成真的而逐渐填满。创建 Agent 时，服务器第一次打开，里面只有两样东西，导览在 Agent 工作期间进行。新手引导结束时是三方：这个人、Cindy 和一个 Agent（stdrc，2026-11-14）。

v3 放在它的功能开关后面上线。在它上线之前，产品的第一次运行是五步的设置对话框（[已上线的设置对话框](#the-shipped-setup-dialog-shipped-flow-only)）。标了 v3 的部分描述新流程；其他部分两种流程都适用。

## 结构 {#structure}

### 流程（v3） {#the-flow-v3}

| 步骤 | 桌面应用 | 网页 | 手机 |
| --- | --- | --- | --- |
| 做什么 | [第一屏](#the-first-screen-v3) | 同上，地址是 `/signup` | 同上，单栏 |
| 注册 | 注册表单，作为分栏页面 | 同上 | 单栏；邮箱、密码、条款和 Continue 放在一起，然后是 "or"，再是社交账号按钮 |
| 确认身份 | 先是用户名（handle）（由这个人自己选；以后不能改），然后是显示名称、头像，以及可选的 How did you hear about Raft?。每个人都要经过这一步，用社交账号注册的人和受邀的人也一样 | 同上 | 单栏 |
| 让一台计算机开始工作 | "Your agent team will work on this Mac"（Windows 上是 "this PC"，Linux 上是 "this computer"）：这台计算机、Cindy 的模型、Keep Raft running in the background、Start。服务器在注册时就已经创建好，所以没有创建服务器这一步 | 先是 Get the Raft app（或者自己安装 Raft Computer），然后是 Open Raft，在应用里从这一步继续 | 在一台计算机上打开 raft.build/go，把它显示的码输进手机（Continue）；那台计算机登录，然后在那里按 Start。一个文字链接 Email me the link，发一封指向 raft.build/go 的纯文本邮件 |
| Cindy | 同一个页面：计算机添加好，Cindy 启动 | 在应用里 | 跟随计算机上的进度 |
| 和 Cindy 交谈 | 一个分栏页面：左边是和 Cindy 的私信（真实的消息）。她复述这个请求，以只读方式查看这台计算机，然后用一张创建 Agent 的卡片提议一个 Agent 和一个频道 | 在应用里 | Cindy 的私信，全屏，没有标签栏 |
| 创建 Agent | Create agent 对话框，多一个字段 New channel | 同上 | 同样的表单，放在底部面板里（[Drawer](../../../packages/ui/src/components/drawer/drawer.md)） |
| 服务器 | Cindy 的私信和新频道；[导览](#the-tour-v3)在工作中的 Agent 上方进行 | 同上 | 主页，带 3 站导览；按 Done 打开频道 |
| 第一个结果 | Cindy 在她的私信里说结果到了，以及怎么回复 | 同上 | 同上 |

受邀的人走一条短路线：注册、确认身份，然后落在邀请他们去的地方。他们不会遇到第一个问题，也没有计算机这一步和 Cindy 的设置：他们是来加入别人的工作的。

### 第一屏（v3） {#the-first-screen-v3}

- 问一个问题，作为标题："What should your agent team work on?"。回答放在最前面：文本框打开时就获得焦点，是空的，没有文字之前 Continue 不可用（stdrc，2026-11-14）。
- 示例放在文本框下面，用 `outline` 按钮；点一个会把它填进文本框，这个人可以再改。最后一个是 "Not sure yet, show me what you can do"，Cindy 会用这个角色常做的三件事来回答它。
- 角色放在示例自己那一行的开头："Examples for" 加一个小的 [Select](../../../packages/ui/src/components/select/select.md)，默认是 "Any kind of work"。改它会换掉示例。它是可选的，所以它是换示例的一种方式，不是单独的一个问题；它就是以前问卷里角色问题填写的那个字段，Cindy 会读它。
- Continue 是粉色按钮，占满宽度。它下面的那一行是 "Already have an account? Sign in"。

### 分栏页面 {#split-pages}

这个人进入服务器之前的每个页面都用同一种布局：在 v3 里是从第一屏到 Create agent，在已上线的流程里是注册、账户身份和创建服务器。它们遵循[品牌](../../foundations/brand.md#how-much-brand)：1024px 起，表单旁边是一块品牌面板；1024px 以下，表单上方是一条外框栏。各个页面之间保持同一个外框，所以读起来是一个连贯的流程（stdrc，2026-11-11，#wg-onboarding-v3:011ae21f）。

- 1024px 起，每个页面上左栏都占 5 份中的 2 份，面板占 3 份；表单最宽 448px。左边是这个人要做的事，所以在阅读顺序里排在前面；面板只展示结果。面板放在另一侧的页面，读起来像另一个流程。
- 在 v3 里，每个页面上左栏的标题都从窗口标题栏下方 96px 处开始，不管页面里放了什么，预览的上边缘也固定在同样的高度。垂直居中的一栏会让标题在页面之间移动，居中的卡片变大时会往上跳；固定住之后，卡片只向下长。
- 面板展示这个页面创建的东西：在 v3 里，每个页面上都是[预览卡片](#the-preview-card-v3)。在已上线的流程里，账户身份页上是一条消息和一张个人资料卡片，随着这个人输入，显示他的名字、用户名和头像；创建服务器页上是带名字和地址的服务器。预览倾斜 −1°，带硬贴纸阴影。
- 在已上线的流程里，还没有创建出任何可见东西的页面（注册）放一组拼贴：Agent 的像素脸和设计师为 Raft 画的可组合小部件，不表达什么特定内容（stdrc，2026-11-11，#wg-onboarding-v3:1628f68a）。在这些小部件进入 raft-ui 之前，那里的面板只有网点。v3 没有这样的页面：卡片从第一屏起就在。
- 注册之后的每个页面上，表单下方都有一行文字说明当前登录的是谁，并带有 Sign out（"Signed in as martin@acme.dev. Sign out"）。还没有账户时，那一行是 "Already have an account? Sign in"。
- 在 v3 里，和 Cindy 的对话也是分栏页面：她的私信在左栏（至少 360px），预览在面板里。
- 分栏页面上不放 Search，也不放会话的 Settings：服务器打开之前，没有什么可搜，也没有什么可设。它们头部唯一的控件是这个人的头像，点开是一个菜单，里面有 "Signed in as" 和邮箱，以及 Sign out，这样登错账户的人有办法出来（stdrc，2026-11-14）。

### 预览卡片（v3） {#the-preview-card-v3}

只有一样东西在长：卡片就是还没存在的第一个频道，流程每让一部分变成真的，它就填上一部分（stdrc，2026-11-14）。

- 只显示已经存在的东西，每一行在变成真的时才加上。永远不为还没到的东西画占位行：一行灰色的 "The first agent" 是在承诺一个步骤，而不是展示一个结果。
- 卡片的标题用这个人自己的那句话：在第一屏上它跟着这个人输入的内容变（文本框为空时，是一个 `foreground-hint` 的示例），之后的每个页面都显示他输入的话，从不换成预先写好的句子。到了 Cindy 的计划这一步，频道的名字放在它上方，那句话变成频道的主题。
- Members 按顺序填：You（账户存在之前是一个空头像，之后是这个人的头像和名字）；Cindy，在她启动时；Agent，在 Cindy 的计划这一步，带 "joins when you create it"。Cindy 从一开始就是频道的成员（[进入服务器](#entering-the-server-v3)）。
- 有了计算机之后，加上 Works on 和那台计算机：在 Start 页面上是 "this Mac"，添加好后显示在线。网页上获取应用的那个页面还没有计算机这一行。
- 不加 Tasks 这一行：Cindy 不创建任务，由 Agent 在频道里创建。
- 永远不删掉一行。已经出现的东西会留下来，出错时也一样：失败的页面保持卡片出错之前的样子。
- 在两种主题下都把卡片画在奶油色的纸面上：给它 `light` class 和 `bg-layer-sidebar`，这样不管页面是什么主题，它都用 `light` 主题的奶油色和墨色。产品不使用原始的 `palette-*` class，而 `sticker-paper` 是白色。卡片宽 440px，内边距 24px，行与行之间 20px；每一行的标签用 Space Mono `text-mono-meta`、`foreground-muted`。
- 给受邀的人看同样的卡片：服务器邀请显示服务器和里面有谁，频道邀请显示频道。未登录时打开的频道邀请，在确认这个邀请属于这个人之前只显示占位，因为链接可能是被转发过来的。

### 手机（v3） {#phone-v3}

进入服务器之前的每个手机页面都用同一个骨架，所以步骤之间什么都不移动（stdrc，2026-11-14）：

- 状态栏和一条 56px 的外框栏，带 logo（[品牌](../../foundations/brand.md#how-much-brand)）。
- 标题和它的一行提示放在顶部，从不居中，这样键盘不会让它们移动。页面的内容在它们下面滚动。
- 唯一的主按钮固定在底部，拇指够得着，每个页面上都在同样的高度。
- 按钮下面恰好一行，每个页面上都在同一个位置：注册之后是 "Signed in as … Sign out"，注册之前是 "Already have an account? Sign in"。其他链接属于页面的内容。
- 注册是唯一的例外：它的 Continue 放在表单里，在邮箱、密码和条款之后，这样它不会被看成社交账号按钮之一。它下面的那一行留在原位。
- 没有预览面板。文字链接的点击区域高 44px；文字本身不变。
- 用输入的码来配对计算机，而不是二维码。应用里没有扫码器，手机相机打开的浏览器没有登录，而放进链接里的码可能让人通过钓鱼链接登录。所以配对码只能手动输入；这条规则是在这里定的，不是从现有的设备登录文档里引用的（Ferry 和 Lagoon，2026-11-15）。
- 只显示 Raft 能观察到的状态：计算机已登录、计算机已添加、Cindy 正在启动。没有任何东西告诉手机那台计算机正在下载应用，所以页面不这么说；一个猜出来的步骤一旦不对，人就不再信任这个页面。
- Start 在计算机上按，计算机会把自己添加到服务器；手机上写 "Press Start on your computer."。Cindy 没能启动之后的 Try again，在两边都能用：它在服务器上重新启动她。Cindy 正在启动和 Cindy 没能启动，用桌面端的文字，排成一栏。
- 其余的都留在引导流程里：Cindy 说完第一句话后，手机全屏显示她的私信，Create agent 以这个对话框的底部面板打开。

### 在已登录的地方确认登录（v3） {#signing-in-from-somewhere-already-signed-in-v3}

有两个页面，让这个人已经登录的地方来批准在别处登录：手机批准在 raft.build/go 显示码的那台计算机，以及浏览器批准 Raft Desktop 的 "Continue with your browser"。它们是同一个页面，所以见过其中一个的人能认出另一个（Ferry 和 Jasper，2026-11-15，slock #15081、#15086）：

- 标题提出问题："Sign in to Raft in Chrome on macOS?"、"Sign in to Raft Desktop?"。这是一个纯粹的确认，没有要填的东西，所以按钮用标题里的动词来回答它：Sign in（[写作](../../content/writing.md#actions-and-their-dialogs)）。
- 下面一行说什么时候该登录、什么时候不该："Sign in only if this is your computer, in front of you."。它说的是情况，而不是另一个页面上的按钮，所以那个标签变了它依然成立。
- 让人可以核对的细节：要登录的账号、码、什么时候、从哪里请求的（"1 minute ago · Berlin, DE"）。
- 一个粉色的 Sign in，在手机上固定在底部。拒绝（"This isn't my computer"、Cancel）和切换（"Use another account"）是细节下面内容里的文字链接：三个叠起来的按钮让拒绝看起来和登录一样分量重。

在 Raft Desktop 的登录页上，"Continue with your browser" 是一个按钮，排在各个登录方式按钮的第一个，画法和它们一样：它和 Google 或 GitHub 一样是一种登录方式，对已经在网页上登录的人来说是最快的一种，做成小链接他们会错过。等待时，"Waiting for your browser… Cancel" 放在按钮下面。

### 进入服务器（v3） {#entering-the-server-v3}

- 只有当服务器里有了属于这个人的东西，也就是正在创建的第一个 Agent，才让他进入服务器（stdrc，2026-11-14）。在那之前，每一步都是分栏页面。
- 交给他两样东西：和 Cindy 的私信，也就是创建了这个 Agent 的那段对话，以及为这件工作建的一个频道。没有 #main。
- 新手引导是三方：这个人、Cindy 和一个 Agent。不要建议加一个审查者或其他角色；只有工作的种类或范围变大时，Cindy 才会再创建一个 Agent。
- 让 Cindy 成为频道的成员，除非有人提及她，否则不说话。从她启动的那一刻起，她就在频道和服务器的成员里。
- 让 Cindy 只做分诊：她说出她看到了什么，把请求连同她的发现交给 Agent。Agent 决定怎么做，自己创建任务。
- 在 Cindy 的卡片之后保留 Create agent 对话框，用卡片里的内容预先填好，用 New channel 代替 Channels：这个人应该感觉到 Agent 正在被创建，而不是在一张卡片上点一下它就出来了（stdrc，2026-11-14）。Create 同时创建 Agent 和频道，要么都创建，要么都不创建。
- Agent 一到就开始工作，所以导览覆盖它工作的那段时间。

### 导览（v3） {#the-tour-v3}

Agent 工作期间，服务器上方显示[引导提示](../../patterns/coach-marks.md)，只显示一次：

| 桌面端，6 站 | 手机，主页上 3 站 |
| --- | --- |
| Cindy 的私信；频道（"you, Ada, and Cindy, who stays quiet unless you mention her"）；工作中的 Agent（它在频道里的那一行）；频道的设置，成员就在那里；"You can leave"，在铃铛上，带 Turn on notifications；消息输入框 | Cindy 的私信；频道；"You can leave"，在铃铛上 |

- 成员这一站指向频道头部里频道的设置，而不是侧轨上的 Members：这个人此时的问题是谁在做这件事，而不是谁在服务器里，而频道的成员已经在它的设置里了（stdrc，2026-11-14，原型 v74）。它的文字说这个地方是做什么用的（"See who's in this channel, and add people or agents."），而不是再说一遍成员：频道那一站刚刚提到过他们。
- 导览之后，不再有预设的引导：第一个结果、任务、消息列和文件第一次出现时，由 Cindy 或 Agent 来解释。
- 第一次使用时不再问别的。Choose your display style，已上线的设置流程里是一个步骤，改为在这个人下一次打开 Raft 时（一次新的会话：应用重新启动，或者一个新标签页，而不是同一个标签页刷新）打开一次，在没有引导提示、也没有其他对话框打开的设备上。紧跟在 Done 后面，它会是连续的第二次打断，而且问的是一个有默认值的偏好，正好在这个人转过去看 Agent 干活的时候（Ferry/Jasper，2026-11-16，端到端演练）。

### 回来时（v3） {#coming-back-v3}

- 把进行到的步骤记在服务器上，这样这个人以后任何时候、在任何设备上，都能从停下的地方继续。
- 让每个分栏页面都能作为落地页：不需要前一个页面，它的标题和预览就能说明这个人在哪里。
- 不要在 Cindy 页面上放 Open Raft：回来时会从那里继续，所以没有一个空服务器可以出去（stdrc，2026-11-14）。

### 出错时（v3） {#when-something-fails-v3}

Cindy 上线之前，由页面来说；她上线之后，由她在私信里说。只有 Cindy 自己出故障时，才回到页面上来说。

- 在由页面来说的页面上，左边写发生了什么、这个人能做什么，以及一个恢复按钮。预览冻结在出错之前的样子。永远不清空这个人填过的东西。
- 原因消失后自己继续：不需要再按一次 Continue。
- 说明发生了什么、该怎么做，不写错误代码（[写作](../../content/writing.md#errors-and-empty-states)）。

| Cindy 上线之前：页面 | 显示什么 |
| --- | --- |
| 这台 Mac 没能添加 | 原因，Try again；下面那一行是 Use another computer |
| 还没有可用的运行时 | 推荐的运行时和它们的安装命令；页面会察觉到安装，并自己回到原来的步骤 |
| 装了运行时但没有登录，列表里其他的也都不能用 | 计算机那一行说明这一点，带 Sign in；在那之前 Start 不可用 |
| 网页：应用没有打开 | 主按钮变成 Download again；再打开一次，或者自己安装 Raft Computer |
| 网页：登录或设置链接过期了 | 说明它过期了、什么都没丢，以及一个从同一步继续的按钮 |
| 配对码过期了 | 页面自己换一个码；没有按钮 |
| 手机：邮件没发出去 | Try again；输入码的方式留在页面上 |
| 设置到一半时计算机离线了 | 页面说明这一点和怎么让它恢复，不给终端命令；计算机恢复后回到原来那一步 |
| Cindy 没能启动 | 只在每个可用的模型都失败之后（一次失败会自己换下一个，Start 页面会说明换了什么）：每个原因，Try again，或者换 Cindy 的模型 |
| Cindy 没有回应 | 她启动两分钟后，或者她在对话中途停下时：Restart Cindy；下面那一行是 Report issue |

| Cindy 上线之后 | 显示什么 |
| --- | --- |
| 她查看时计算机离线了 | 她的头部下方一个 `PanelNotice`（[反馈](../../patterns/feedback.md#errors-by-scope)）；对话和预览都保留；计算机恢复后它消失，她继续 |
| 服务器上 Create agent 失败 | 对话框里一个橙色 Banner，确认按钮变成 Try again，表单保留 |
| 计算机离线时按 Create agent | 一个带加载指示器的 info Banner（是在等待，不是失败）；计算机恢复之前 Create 不可用 |
| Agent 启动失败 | Cindy 在她的私信里用一两句话说明发生了什么、她做了什么，或者说明这个人必须做的那一件事 |

### 命名（v3） {#naming-v3}

- 用这件工作给频道命名：对象加工作的种类，2 到 3 个词，用这个人自己的话和语言，小写，用连字符连接，最多 20 个字符（"Fix the easy issues in acme-web" 对应 #acme-issues）。永远不用 main、general、team 或 Agent 的名字。由 Cindy 提议；这个人可以在 Create agent 里改。名字已被占用时（包括已归档的频道），换一个，不报错。
- 给 Agent 起一个和工作种类相符的人名（写代码叫 Ada，写作叫 Paige），不要用 Fixer 这样的工具名，也不要用服务器里已有的名字。

### 已上线的设置对话框（仅限已上线的流程） {#the-shipped-setup-dialog-shipped-flow-only}

这是已上线的流程，在 v3 通过功能开关上线之前一直使用。在新服务器有了一台计算机和第一个 Agent 之前，应用把设置显示为服务器页面上方的一个对话框，带遮罩。这个对话框无法关闭：按 Esc 不会关闭，也没有 ×。原生应用把同样的步骤显示为一个完整页面。

步骤依次是：

1. **连接一台计算机**（960px 宽）：说明计算机是什么，给出要运行的命令，以及一个跟踪连接过程的日志。如果服务器已经有计算机但都离线了，这一步变成 Start your computer，给出让其中一台重新上线的命令。
2. **创建第一个 Agent**（"Meet Cindy"），表单和 Create agent 一样。
3. **向 Agent 介绍你自己**：一份由选项网格组成的简短问卷。
4. **选择显示风格**。
5. **交接**：Agent 从这里接手。

第 3 到 5 步共用一个外框，720px 宽、约 520px 高，所以对话框在这几步之间不会改变大小。这是展示外框，只有这几步、Upgrade to Pro 对话框和 Pro 的 Add seats 对话框使用，不属于 Dialog 的四种尺寸（[Dialog](../../../packages/ui/src/components/dialog/dialog.md#variants)）。每一步都有：

- **标题区**：用 Space Mono 写的步骤标签 "Set up your server"，用 `text-title` 的标题，以及一行说明。
- **内容区**，在外框内滚动。
- **底部栏**：左侧是弱化的文字链接（[TextLink](../../../packages/ui/src/components/text-link/text-link.md)）（Switch server，前两步还有 Server settings），右侧是粉色按钮（Next、Continue、Let's Go）。窄屏上粉色按钮占满宽度。

```example
dialog/compositions/server-setup-step
```

## 规则 {#rules}

- 在已上线的设置对话框里，品牌元素只在交接这一步使用（[品牌](../../foundations/brand.md#how-much-brand)）：Agent 99px 的头像跳一下，旁边弹出两个方形标记然后淡出（[动效](../../foundations/motion.md#usage)）。其他步骤都是纸面上的普通对话框。
- 不要给设置加 Skip 按钮或步骤圆点，对话框里和分栏页面上都不要：每一步都是到达第一个 Agent 所必需的。退出已上线设置的方式是 Switch server；退出分栏页面的方式是账户菜单。导览不是设置：它的引导提示会显示站数，并带有 Skip（[引导提示](../../patterns/coach-marks.md)）。
- 步骤标签用 sentence case。[0002](../../decisions/0002-no-all-caps.md) 允许新手引导屏幕上有一个全大写的步骤标签；产品没有用。

## 相关 {#related}

- [引导提示](../../patterns/coach-marks.md)：导览的气泡。
- [品牌](../../foundations/brand.md#how-much-brand)：分栏页面用多少品牌元素。
- [反馈](../../patterns/feedback.md#errors-by-scope)：每种错误放在哪里。
