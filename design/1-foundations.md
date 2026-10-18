# 基础

所有取值都在 tokens 里，这一页说每个值用在哪。表里“亮 / 暗”是两种主题的值；只有一个值的，两种主题相同。

## 颜色

### 底：从外往里颜色一层比一层少
| token | 亮 | 暗 | 用在 |
| --- | --- | --- | --- |
| `frame` | `#ffd440`（黄） | `#0d0d0b` | 外框：手机一级页的顶栏、桌面 Rail；二级页顶栏的黄底版（待定）也用它 |
| `sidebar` | `#fffaef`（奶油） | `#0d0d0b` | 桌面侧栏 |
| `paper` | `#ffffff` | `#1b1b19` | 内容的底：桌面主区、手机的每一屏 |
| `surface` | `#ffffff` | `#242422` | 浮起来的容器：卡片、分组列表、输入框、composer、Tab 栏 |
| `popover` | `#ffffff` | `#292927` | 弹出来的面：菜单、抽屉、底部弹层、对话框、资料卡 |
| `surface-sunken` | `#f3f3f3` | `#32322f` | 凹进去的填充：轨道、行内代码、骨架、中性方块、回应、线程预览 |
| `code` | `#ffffff` | `#0a0c10` | 代码块、命令行 |
| `hud` | `#252429` | `#292927` | toast、tooltip；上面的字用 `on-hud` / `on-hud-2` |
| `scrim` | 65% 黑 | 60% 黑 | 对话框和大图后面的遮罩；抽屉和底部弹层不加 |

亮色里 `paper`、`surface`、`popover` 都是白，靠线分层；暗色里靠明度分层，一层比一层亮。

### 墨和线
| token | 亮 | 暗 | 用在 |
| --- | --- | --- | --- |
| `ink` | `#141111` | `#e5e5e2` | 正文、标题、控件的边 |
| `ink-2` | 68% 墨 | `#c4c4c1` | 次要文字：预览、说明、标签 |
| `ink-3` | 62% 墨 | `#9e9e9b` | 第三级文字：时间、ID、分组标题、占位 |
| `ink-disabled` | 30% 墨 | `#636360` | 禁用 |
| `line` | 15% 墨 | 10% 白 | 内容里的发丝线：列表分隔、卡片描边 |
| `line-seam` | 45% 墨 | 26% 白 | 区域之间的分区线；菜单、抽屉、对话框的边 |
| `line-strong` | = `ink` | = `ink` | 控件的 1.5px 墨线 |

### 信号和后果
| token | 值 | 意思 | 用在 |
| --- | --- | --- | --- |
| `yellow` | `#ffd440` | 你 | 外框、导航里的选中、打开的开关、你所在频道的位置块、@你、搜索命中；你的工作区（墨底黄字） |
| `pink` / `attention` | `#ff99c3` | 去做 | 每屏最多一个主按钮；未读数和提醒点 |
| `cyan` | `#27ccf3` | 信息、这一项 | 进行中、运行时、外部 agent、进度条；`cyan-soft` 是内容里选中的一项、生效的筛选、信息提示条 |
| `orange` | `#f8a16f` | 会打断 | 停止、离开、重置的按钮；警告；待办；出错的灯 |
| `red` | `#f97264` | 收不回 | 删除按钮 |
| `danger` | `#b5321a` / `#f8a49d` | 出错的字 | 输入框填错时的描边和帮助文字、上传失败 |
| `link` | `#1447e6` / `#8ec5ff` | 去那里 | 正文里的链接 |

另外三个贴纸色只表示状态：`lime #a9d877`（完成、在线）、`lavender #bbafe6`（待审核、没有照片的人）、`stone #c0b9b1`（已关闭、离线）。贴纸色在两种主题里同值，上面一律用 `sticker-ink`。

### 状态的两套颜色
| 任务状态 | 亮 | 暗 | 状态灯 | 颜色 |
| --- | --- | --- | --- | --- |
| `status-todo` Todo | 橙 | `#ff6900` | `presence-online` | 绿 |
| `status-progress` In Progress | 青 | 青 | `presence-busy` | 黄 `#ffd440`（单独的值，换皮肤时不跟着品牌黄变） |
| `status-review` In Review | 紫 | `#9d8ada` | `presence-error` | 橙 |
| `status-done` Done | 绿 | `#20c16b` | `presence-offline` | 石灰 |
| `status-closed` Closed | 石灰 | `#8f8f8d` | `presence-external` | 青 |

签底是对应的 `status-*-soft`。

### 浅底（高亮，不加边）
`yellow-soft` 菜单高亮、忙碌签、文字选区 · `cyan-soft` 选中的一项、筛选、信息条、运行时签、线程引用、通知里的消息 · `pink-soft` 频道引用、你点过的回应 · `lime-soft` 成功条、完成签 · `orange-soft` 警告条、待办签、通知里的出错和警告 · `red-soft` 危险条 · `lavender-soft` 待审核签 · `stone-soft` 已关闭签。

### 按下时叠的一层
`surface-pressed`（纸色控件和内容，悬停也用它）· `sticker-pressed`（彩色贴纸）· `frame-pressed`（外框里）。

### 对比度
- `ink`、`ink-2`、`ink-3` 放在任何底、任何浅底、浮层上都 ≥4.5:1，不用记例外。
- 贴纸色和白纸只有 1.4–2.8:1，所以当色块用时必须带墨边；彩色块上的墨字 ≥6.8:1。
- 分区线在白上 3.0:1，在黄上 2.8:1。

## 字
- Space Grotesk（可变字重 300–700）是人说的话；Space Mono（400 / 700）是机器写的东西。中文自动回落到苹方 / 思源黑体。

| token | 字号 / 行高 | 用在 |
| --- | --- | --- |
| `text-hero` | 40/44 700 | 引导页大标题 |
| `text-display` | 34/40 700 | 一级页的大标题、agent 主页的名字 |
| `text-title` | 22/28 700 | 主页上的统计数字 |
| `text-headline` | 17/22 700 | 导航栏标题（一级页的页名、二级页的标题）、面板头、侧栏头、对话框和弹层标题、工作区胶囊 |
| `text-body` | 16/24 | 消息正文、输入框；列表和任务标题用 600 |
| `text-subhead` | 15/20 | 按钮、名字、单选标签、对话框正文 |
| `text-callout` | 14/20 | 预览、菜单项、提示条、摘录 |
| `text-footnote` | 13/18 | 分组标题、字段标签、tooltip |
| `text-caption` | 12/16 | 副标题、状态签、帮助文字 |
| `text-label` | 10/12 600 | Tab 栏、图标加字的 Rail 的标签 |
| `mono-meta` | 12/16 | ID、时间、计数、运行时、事件行、快捷键 |
| `mono-code` | 13/20 | 代码、命令 |

- 字阶定字号和行高，字重按用途在 400 / 500 / 600 / 700 里选。头像里的首字母取 11 / 13 / 15 / 22 / 40。
- 大小写：能点的字（按钮、菜单项、分页标签、Tab、状态名）用 Title Case；标题、分组标题、说明、空状态用句首大写；不用 CSS 全大写，唯一的例外是引导页的步骤签。

## 间距和尺寸
- 4px 网格：`space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 20 · `space-6` 24 · `space-8` 32 · `space-10` 40。小件内部（签、像素和字之间、chip）允许 2px 的半步：6、10。
- 点击区 ≥ `size-tap` 44。看起来比 44 小的控件和文字按钮，用一个透明的伪元素补到 44；正文里的行内链接和引用 chip 跟着文字走，不补。只给鼠标用的桌面控件可以小一些：侧栏行和菜单项 36、Rail 项 40、悬停工具条 32。
- 控件高：默认 44 · 小号 32 · 整宽 CTA 52。手机列表行 ≥64（`size-row`），设置行和单选行 ≥44。
- 头像：19 · 27 · 35 · 51 · 99（8 的倍数加两条 1.5px 边）。
- 头：手机的导航行，桌面的面板头、侧栏头、Rail 头、抽屉头，都是 56 高（产品 Elegant 主题的头高）；Rail 头是 56×56 的正方形。桌面窗口矮于 600 时一起收到 48：在 App 最外层加 `rf-short`（或在产品里用同样数值的 `@media (max-height: 600px)`）。
- 布局：手机内容的左右边是 16，桌面的主区、面板头、侧栏头、抽屉是 20；什么东西怎么落在这条线上，见下面的“对齐”。桌面 Rail 56（另加 1px 分区线；图标加字的版本 68，同样另加 1px）、侧栏 240（可拖 180–320）、右边一栏 380（线程 400，360 到屏宽的 60%）。断点见《模式》的“宽和窄”。

## 对齐
对齐的是眼睛看到的东西，不是盒子。一样东西横着、竖着都按同一个办法对齐：

| 东西 | 落在线上的是 | 例子 |
| --- | --- | --- |
| 有形状的：方块、头像、卡片、输入框、composer、工作区胶囊、填色的按钮 | 形状的边；上下按形状居中 | 胶囊的左边在 16；顶栏里粉色的 Done，右边在 16 |
| 字 | 字母：左边是首字母的竖笔，上下按大写字母的高度居中 | 大标题往左挪 0.05em；56 高的头里，17/22 的页名和胶囊里的字在同一条中线上；composer 里第一个工具的图标和输入的字对齐 |
| 没有框的图标按钮 | 图标框：按钮自己看不见，空着的点击区伸到线外 | 桌面面板头最后一个图标框止于 20 |

手机顶栏两头的图标按钮（左边的返回，右边的铃铛、⋯）互为镜像：都离屏幕边 3px，图标框离边 14，图标的中心离边 25。常见的图标在框里自带 2px 左右的空白，墨正好落在 16 附近，和下面的内容在一条线上；窄的图标（⋮）也照样左右对称。不按每个图标的墨去挪按钮：每个图标自带的空白不一样，按钮会跟着图标乱跳，两头也不再对称。

## 形状
| token | 值 | 用在 |
| --- | --- | --- |
| `radius-xs` | 4 | 像素家族：头像、工作区、频道块、复选框、徽标、步骤、骨架；正文里的行内标记（行内代码、@你、搜索命中、引用 chip） |
| `radius-sm` | 6 | 22px 高的签、任务标记、@ 委派 chip、值的小块、回应、tooltip |
| `radius-md` | 8 | 控件和选中贴纸：按钮、输入框、下拉、筛选、分段控件、分页标签、侧栏行、Rail 项、Tab 栏的图标贴纸、菜单项、工作区胶囊 |
| `radius-lg` | 10 | 容器：卡片、分组列表、composer、提示条、菜单、toast、资料卡、文件卡 |
| `radius-xl` | 16 | 对话框、底部弹层的顶角 |
| `radius-full` | 胶囊 | 只给开关和单选 |

9–11px 的状态像素和头像里的图太小，圆角取 2px。

线宽只有两种：1px（`border-hairline`，配 `line` 和 `line-seam`）和 1.5px（`border-control`，控件的墨线和贴纸的边；99px 大头像上的状态灯放大到 2px）。引用前的 2px 竖条是记号，不算线；3–4px 的细进度条是一道线，不加边。

圆角容器（卡片、文件卡、输入框、composer、缩略图）的某一条边上，不贴进度条、彩色条带或加粗的强调边：靠近圆角的地方会被切出奇怪的形状。进度放进容器里面，是一条独立的 4px 轨道（2px 圆角，`surface-sunken` 底，压在图片上时用 `surface`；青色进度）：文件卡里在文件名下面，和文字左对齐；缩略图里离四边 6px；要强调整个容器，换底色或描边，不加一条边。

## 层级和阴影
- 控件和卡片没有阴影。浮起来的东西用 `shadow-float`：菜单、下拉、抽屉、底部弹层、对话框、资料卡、tooltip、toast。
- 硬阴影只有 `shadow-sticker-lg`，只给品牌插画：agent 主页和引导页的大头像。
- 弹出来的东西（菜单、下拉和筛选的列表、资料卡）贴着点开它的那样东西出现，浮在整个页面之上，不在页面里占位置：碰到窗口边就挪开或者翻到另一侧，大小不超过剩下的空间。打开它、在里面打字，页面都不会滚动或移位。
- 焦点环 `focus-ring`：2px 底色间隙加 2px 墨，所有能用键盘到达的东西都要有。贴着容器边的东西（菜单里的搜索行）改成内描的 2px 墨。贴纸（叫到你的标记、选中的侧栏行、筛选）获得焦点时保留自己的墨边，焦点环加在外面，不替换它。

## 动效
- **按下和悬停**：叠一层，不换底色、不位移、不缩放，90–120ms。悬停只在有鼠标的设备上（`@media (hover: hover)`）。
- **滑动和弹层**：bundle.css 里的 `--rf-ease-slide`，cubic-bezier(.32,.72,0,1)，220–380ms。
- **状态不做循环动画**：agent 在干活是一盏静止的黄灯；工作界面里唯一循环的是加载时的像素转圈，等完立刻收起。
- **进出**：一叠头像里有人加入或离开时，脸滑开、淡入淡出（`--rf-ease-slide`，180–220ms）；文字直接换，不做数字滚动。
- **漂浮**：只在 agent 主页和引导页的大头像上，4s / 6s ease-in-out。
- `prefers-reduced-motion` 打开时，以上全部停止。

## 交互状态
| 状态 | 样子 |
| --- | --- |
| 悬停、键盘高亮 | 菜单、下拉、菜单里的快捷回应铺 `yellow-soft`；搜索结果的键盘高亮也是它。行和按钮的悬停叠按下时的那一层 |
| 按下 | 叠一层：`surface-pressed` / `sticker-pressed` / `frame-pressed`；文字按钮按下时，它的点击区亮一块 |
| 焦点 | `focus-ring`；composer、带前后缀的输入框、多选框整组亮；复选框和单选亮那个框（由藏起来的原生 input 驱动） |
| 选中：导航 | 黄贴纸（侧栏行、分段控件、分页标签、Tab 栏的图标）；亮色的黄外框里是白贴纸（Rail），暗色里 Rail 也是黄贴纸 |
| 选中：内容 | `cyan-soft`（打开的那一项、跳转到的消息、生效的筛选） |
| 选中：值 | 勾上的复选框和单选是墨；菜单里的当前值打勾、加粗 |
| 未读 | 加粗加粉色数字；被 @ 时换成黄色 @ 标记；图标上是一个粉色像素（选中的那一项不挂） |
| 禁用 | `surface-sunken` 底、`line` 或 `ink-disabled` 边、`ink-disabled` 字：按钮、图标按钮、输入框、下拉、复选框、单选、开关、分段、分页都一样；列表行不换底，只把字和图标变成 `ink-disabled`。悬停和按下都没有反应 |
| 只展示 | 一行里只有开关、按钮这些控件能点（设置里的开关行、侧栏里的这台电脑）：这一行不是按钮，用 `<div>`，整行不响应悬停和按下，焦点只落在控件上 |
| 出错 | 输入框 `danger` 描边加一行怎么改；对话框里是一条提示条；整个工作区的问题进通知中心 |
| 忙 | 按钮里放像素转圈，字写正在做什么 |

## 图标
- Lucide，描边 2，颜色继承 `currentColor`。尺寸：36（空状态）· 22（导航栏、Tab 栏、44 图标按钮）· 20（Rail、列表行、提示条、弹层行）· 18（按钮里、32 图标按钮、频道标）· 16（小按钮、分段控件、菜单、分页标签）· 14（签、证据条、引用 chip、筛选、值的小块）· 11–12（小号频道标、事件行、徽标、状态签里的箭头）。
- `components/bundle.css` 里以 `rf-i rf-i-<name>` 提供 67 个：
  - 一级入口：house、square-check-big、users、settings、search、message-square、activity、monitor、circle-help、bell
  - 动作：plus、send、paperclip、image-plus、square-pen、pencil、trash、at-sign、corner-down-left、reply、x、check、check-check、copy、download、link、external-link、smile-plus、bookmark、log-out
  - 方向：chevron-left / right / down / up、arrow-left（返回）、arrow-right、arrow-right-left
  - 内容：hash、lock、messages-square、user、bot、folder、file-text、file-code、image、book-open、cpu、terminal、git-commit、git-pull-request、list-filter、list-todo、columns-3、layout-list、mic、clock、moon、bell-off、ellipsis
  - 提示：info、triangle-alert、octagon-alert、circle-check
  - 状态栏（只在参考屏里）：signal、wifi、battery
- 需要新图标时，从 Lucide 取同名图标（产品用的就是 lucide-react）。像素形象（Assets › Agents）不是图标，只代表 agent。不用 emoji 当图标；表情回应里的 emoji 是内容。

## 表情回应
- 快捷回应是 Raft 自己画的 7 个图（Assets › Reactions）：thumbs_up 👍、heart ❤️、party_popper 🎉、eyes 👀、fire 🔥、joy 😂、check_mark ✅。写法是 `<span class="rf-emoji rf-emoji--thumbs_up" aria-hidden="true"></span>`，按钮上写 `aria-label`。
- 和产品的那一套同样 7 个、同样的造型：24 网格、2px 墨线，色块都取自色板（黄、青、橙、红、紫、绿、粉），高光是白色方像素。暗色模式外面加一圈 `sticker-edge` 模切边，和贴纸一样。
- 尺寸：回应里 16，菜单的快捷回应 22，单独放 18。其他回应用系统 emoji，不另画。

## Logo
- Assets › Logos：`raft-logo.svg`（亮底）、`raft-logo-yellow.svg`（暗底，官网页脚配色）、`raft-mark.svg` / `raft-mark-yellow.svg`（只有符号）。`.rf-logo`、`.rf-mark` 随主题自动换：亮色是墨色轮廓，暗色是黄色轮廓。
- logo 只出现在品牌页面：引导页、登录、加载屏。工作界面的外框里放的是你的工作区（手机首页的胶囊、桌面 Rail 顶上的方块），不放 mark。

## 文案
- 能点的字用 Title Case：“Create Task”“Mark All Read”“Convert to Task”；a、an、the、to、in、on、of、for、as、and、or 这些短词小写。标题、分组标题、说明、空状态用句首大写。任何地方都不用全大写。
- 任务状态写 Todo、In Progress、In Review、Done、Closed。名字写显示名，不写 handle。
- 短、直接、带一点幽默，口吻沿用官网。幽默只放在引导页和成功提示里；错误信息和空状态必须直白，能照着做。
- 对用户说 you；agent 用名字、第三人称：“Bugen claimed #25”“Martin needs your OK”。
- agent 是队友：用 claim、hand off、review、ship、remember 这些动词，不用 bot、process、execute、AI-powered。agent 说做完了时附上证据。
- 机器产生的东西用 Space Mono：`#25`（在句子里也一样）、`10:24`、`Claude Code`、计数、事件行、代码。人说的话、给人看的统计数字用 Space Grotesk。
- 一个动作从按钮到对话框说同一句话：按钮上的字就是它打开的那一层的标题（Register App 打开 Register App，Create Channel 打开 Create Channel）；改一样东西，标题写 Edit 加它的名字（Edit Release Bot）；确认按钮重复这个动词、写后果（Make Public，不写 Public；Delete Agent）。取消按钮写留下什么：Keep Box、Keep Working。
- 中文界面同样短句、少形容词；数字、ID、时间仍用 Space Mono。

| 用 | 不用 |
| --- | --- |
| No tasks match these filters | No data available |
| Bugen is on it · 12m | Processing… |
| Martin needs your OK | Pending approval |
| Use lowercase and dashes: launch-week | Invalid input |
| Bring an Agent | Add AI assistant |
| Channels | CHANNELS |
