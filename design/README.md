Raft Design System 是 Raft 全产品线的设计语言：现在的 Raft Chat，以及接下来的 Tasks、Calendar、Artifacts、Sites、Meeting、Canvas 等。Raft 是一个多人、多 agent、多界面的协作空间：人和 agent 在同一个工作区里聊天、派活、写东西、开会、交付。

这套系统沿用官网 brutal 风格的几样东西：那条黄、墨色的线、方形的像素、Space Grotesk 和 Space Mono。区别在用法：官网要让人一眼记住，App 要让人每天用几个小时也不累，所以品牌色只用在少数固定的位置上。一句话：**黄只铺在外框上，内容都在白纸上。**

结构和行为跟着产品代码走（raft-source 网页端、raft-ui 0.5.52、产品视觉测试里的 116 个场景，以及代码里写明的产品决定）；颜色、线、形状，以及品牌元素用在哪里，是这里定的，和产品不同的地方都列在《取舍》里。

## 这几页
| 页 | 查什么 |
| --- | --- |
| 基础 | 颜色、字、间距、形状、线、层级、动效、交互状态、图标、文案的取值 |
| 组件 | 有哪些组件，每种情况选哪个，产品里对应的是谁 |
| 模式 | 所有产品通用的页面搭法：骨架、导航、agent、任务、对话、表单、反馈、暗色、品牌元素用多少、宽和窄 |
| Raft Chat | 只属于 Raft Chat 的结构：一级入口、首页、频道的几种视图、线程、正在干活的 agent 放在哪 |
| 取舍 | 哪些地方和产品代码有意不同、为什么；还没定、等你挑的几处 |

通用的和某个产品自己的分开写：颜色、组件、页面骨架、导航的规则是每个产品都用的；“手机 Tab 栏放哪四个入口”“首页头三行是什么”这类是某个产品的信息结构，写在它自己那一页。新产品做起来以后，各加一页。

## 三种材料，一圈外框
- **纸**：内容的底。内容是白的，桌面侧栏是官网的奶油色。
- **墨**：文字和控件的边。
- **贴纸**：一切彩色块——头像、选中、位置、主操作，都带一圈墨边。
- **外框**：手机一级页的顶栏，桌面的 Rail，以及网页版桌面顶上那条带搜索的顶栏，铺官网那条黄。从外往里颜色一层比一层少：黄 → 奶油 → 白。

## 七条规则
1. **黄只铺在外框上。**外框（手机一级页的顶栏、桌面的 Rail 和网页版的顶栏）每屏都在，但没人去读它，把颜色放在这里几乎不增加负担；要读的地方（消息、列表、卡片、push 进去的页面的内容）都是白纸。push 进去的页面的顶栏有白底、黄底两版待定：选了黄底，外框就一直延伸到二级页的顶栏。暗色模式的外框和产品一样，是中性深色。
2. **三种线，各有各的意思。**内容里是发丝线 `line`（15% 墨），区域之间是分区线 `line-seam`（45% 墨），控件的边是墨线 `line-strong`（1.5px）。墨线的意思就是“这是控件”。
3. **彩色块是贴纸。**每一块品牌色都带 1.5px 墨边，上面的字永远是墨，暗色模式不反色。浅底（`*-soft`）是高亮，不加边。控件不带阴影，硬阴影只给品牌插画。
4. **黄 = 你，粉 = 去做，提示不用色。**黄是你在哪、你选的、叫到你、你找的；粉是每屏最多一个的主按钮，加上等你处理的未读。内容里被挑出来的一项是青；toast 和 tooltip 是中性深色。
5. **状态的颜色是固定的意思。**任务五种：Todo 橙、In Progress 青、In Review 紫、Done 绿、Closed 石灰。状态灯五种：在线绿、忙黄、出错橙、离线石灰、外部 agent 青，都不闪。出了问题是橙，红只给收不回的后果。
6. **方 = Raft。**所有身份都是方贴纸，脸说明是谁；所有的“点”都是方像素。圆只留给开关和单选，那是平台约定。
7. **不用全大写。**能点的字用 Title Case，其他句首大写。层级靠字号、字重和颜色。Space Grotesk 是人说的话，Space Mono 是机器写的东西。

## 怎么用
- 这套系统是两样东西：这个文件夹里的规则（这几页和每个组件的说明），和 raft-ui（`packages/ui`）里照着它实现的 React 组件。产品代码用 raft-ui，不用这里的 `rf-` class。
- `components/<组件>/preview.html` 是每个组件的参考画法，直接在浏览器里打开。它们加载 `tokens.css`（token 的值；同一份数据的 JSON 是 `tokens.json`）和 `components/bundle.css`（全部 `rf-` 组件，没有 JS）。最外层容器加 `rf`；在任意容器上设 `data-theme="light"` 或 `"dark"`，里面的 token 全部跟着变。
- 用真的元素：能点的是 `<button>` 或带 `href` 的 `<a>`，复选框和单选里放原生 input，开关是 `role="switch"` 的按钮；只有图标的按钮都要有 `aria-label`。
- 每个组件的说明只写四件事：什么时候用、结构、变体、只属于它的规则。全局规则只写在这一页和《基础》里，组件说明里不再重复。
- 这里就是源头。改了画法的代码（raft-ui 或产品）和它依据的规则在同一个 PR 里改；推翻了产品代码里已有的决定，在《取舍》里记一行理由。

## 做新东西前，问六个问题
1. 这是每个产品都会遇到的，还是只属于这一个产品？前一种照《模式》做，后一种写进那个产品的页面；两种都先看产品里已经怎么做了。
2. 这是内容、区域还是控件？决定用哪种线。
3. 这一屏的主操作是哪个？只有它是粉的；也可以没有。
4. 这个颜色是身份、状态、信号还是后果？都不是，就去掉。
5. 暗色下成立吗？窄到 320 还成立吗？只用键盘走得通吗？
6. 一天看几个小时，会不会累？会的话，先减颜色，再减线，再减动效。

## 文件
| 文件 | 是什么 |
| --- | --- |
| `1-foundations.md` … `4-decisions.md` | 上面那几页 |
| `components/<组件>/README.md` | 每个组件的说明；`preview.html` 是它的参考画法 |
| `components/bundle.css` | 全部 `rf-` 组件的样式，图标、logo、像素形象和表情回应都内嵌在里面 |
| `tokens.css`、`tokens.json` | token 的值，CSS 和 JSON 两种写法，内容相同 |
| `fonts/` | Space Grotesk、Space Mono |
| `assets/` | logo、agent 像素形象的 SVG 源文件和它们的说明 |
| `archived/` | 试过、没采用的组件，和这套系统一轮轮改过来的记录（`rationale-history.md`） |

## 组件

**Actions**

- [Button](components/Button/README.md) · [预览](components/Button/preview.html) — 按钮：粉色主按钮每屏一个，其他操作用墨线按钮或无框按钮；会打断的用橙，收不回的用红。按钮都不带影子。
- [IconButton](components/IconButton/README.md) · [预览](components/IconButton/preview.html) — 只有图标的按钮：在外框、标题栏、composer 和工具条里不加框；单独放在内容里时加墨线；发送是粉色。

**Inputs**

- [Checkbox](components/Checkbox/README.md) · [预览](components/Checkbox/preview.html) — 复选框：随表单一起提交的是 / 否。勾上是一块墨色方块加反白的勾——它是一个值，不是“你在这里”。
- [Composer](components/Composer/README.md) · [预览](components/Composer/preview.html) — 消息输入框：聊天页底部的墨线框，里面有输入、工具、As Task 和粉色发送键；@ 联想浮在它上面，附件排在输入框里。
- [Radio](components/Radio/README.md) · [预览](components/Radio/preview.html) — 单选：几个答案里选一个，跟着表单一起提交；选中是墨色圆点。它和开关是系统里仅有的两个圆形控件。
- [Select](components/Select/README.md) · [预览](components/Select/preview.html) — 选值：单选、带搜索的单选、多选、带搜索的多选，加上列表上方的筛选条件。
- [Switch](components/Switch/README.md) · [预览](components/Switch/preview.html) — 开关：拨了就生效的设置。打开是黄贴纸，圆钮滑到右边；它和 Radio 是系统里仅有的两个圆形控件。
- [TextField](components/TextField/README.md) · [预览](components/TextField/preview.html) — 输入框：标签在上，44 高，1.5px 墨线框。多行、带前后缀、搜索框都是同一种框；出错时框变深红，下面一行写怎么改。

**Navigation**

- [NavBar](components/NavBar/README.md) · [预览](components/NavBar/preview.html) — 手机顶栏。一级页有两个版本：带页名（默认），外框里写大标题；和线上一样，首页只有工作区胶囊、正在干活的那叠头像和铃铛。push 进去的二级页有白底、黄底两版，待定。点工作区胶囊，从底部升起工作区列表。
- [Panel](components/Panel/README.md) · [预览](components/Panel/preview.html) — 桌面面板：主区的每一列都用同一种面板头（56 高、白底、下沿分区线），下面是内容。频道面板头下面是 Chat / Tasks / Files 分页；线程面板最上面是原消息；右边一栏（`rf-aside`）放任务、文件、资料，和对话同时看。
- [Rail](components/Rail/README.md) · [预览](components/Rail/preview.html) — 桌面最左边的一级导航：顶上是工作区，中间是一级入口，底下是通知、帮助和设置。两个版本：只放图标（56 宽，默认）和图标加字（68 宽）。Raft Chat 的入口和顺序见《Raft Chat》。
- [SegmentedControl](components/SegmentedControl/README.md) · [预览](components/SegmentedControl/preview.html) — 分段控件：一条浅灰轨道里放 2–4 段，在原地换一种看法，内容还是同一份；选中的那一段是黄贴纸。
- [Sidebar](components/Sidebar/README.md) · [预览](components/Sidebar/preview.html) — 桌面侧栏：Rail 选中哪个入口，侧栏就列它的内容（Raft Chat 的 Chat 列频道、agent 和私信，Members 列成员）。头上写入口的名字，右边可以放谁在干活的那叠头像；选中行是黄贴纸，未读是粉色数字，@你 是黄色 @ 标记。
- [Steps](components/Steps/README.md) · [预览](components/Steps/preview.html) — 步骤条：一段 3–5 步的短流程走到哪了。做完的是墨，当前这一步是黄贴纸，还没到的是线框。
- [TabBar](components/TabBar/README.md) · [预览](components/TabBar/preview.html) — 手机底部的一级入口，只出现在一级页上；选中项的图标坐在一张只包住图标的黄贴纸里。Raft Chat 放 Home / Tasks / Members / Settings（入口见《Raft Chat》）。
- [Tabs](components/Tabs/README.md) · [预览](components/Tabs/preview.html) — 分页标签：同一页里的几个分区，每个分区有自己的内容。两版：贴纸（默认，选中是黄贴纸）和下划线（选中是墨色字加 2px 墨线，产品现在的样子），待定。放不下就横向滚动。

**Identity**

- [Avatar](components/Avatar/README.md) · [预览](components/Avatar/preview.html) — 头像：agent 和人都是同一种方贴纸，脸说明是谁。agent 是产品的 8×8 像素形象，底色是形象自带的；人是照片或首字母，没有照片时是 `lavender`。
- [ChannelIcon](components/ChannelIcon/README.md) · [预览](components/ChannelIcon/preview.html) — 频道标：频道是一个地方，不是一个“谁”。列表里是一块中性的 `#` 方块；只在你所在频道的标题栏里变成黄色位置块。

**Status**

- [Badge](components/Badge/README.md) · [预览](components/Badge/preview.html) — 计数徽标：未读数是一张粉色小贴纸（等你去读）；有人 @ 你时，换成一个黄色的 @ 方块（叫到你）。
- [StatusChip](components/StatusChip/README.md) · [预览](components/StatusChip/preview.html) — 状态签：浅底、一个方形像素、一个词，写一件事走到哪了、一个 agent 现在怎么样。另有两个配套的小签：`agent` 标签和运行时签。

**Content**

- [Attachment](components/Attachment/README.md) · [预览](components/Attachment/preview.html) — 附件：文件是一张卡（类型、名字、大小、一个动作），图片直接显示，在 composer 里是一排小方块。上传中是一条青色的细进度，放在卡里面、不贴边；失败要写清楚为什么、怎么办。
- [Code](components/Code/README.md) · [预览](components/Code/preview.html) — 代码：句子里的一个名字用行内代码；要用户复制去运行的一行用命令行；成段的代码用代码块。
- [Inbox](components/Inbox/README.md) · [预览](components/Inbox/preview.html) — 别处发生、要你看到的事。两个地方用同一种行：**动态**（Activity：有人提到你、在等你批、交给了你）和**通知中心**（铃铛：电脑离线、额度快满、有更新）。没读的标题加粗、挂粉色提醒点；要你动手的，按钮直接放在行里。
- [ListRow](components/ListRow/README.md) · [预览](components/ListRow/preview.html) — 列表行：频道、私信、设置项共用的一行——前导方块、标题和预览、时间和徽标；行与行之间的发丝线从文字起点开始。列表顶上的几行入口（Search、Activity、Saved 这类）之间不画线。
- [Message](components/Message/README.md) · [预览](components/Message/preview.html) — 消息：头像、名字、身份、时间，加正文。人和 agent 用同一种消息，脸和 `agent` 小标说明是谁；agent 的动作写成事件行，不写成消息。
- [PropertyList](components/PropertyList/README.md) · [预览](components/PropertyList/preview.html) — 属性列表：一件东西的几条事实，比如任务的 Status / Assignee / Created by、agent 的运行时和电脑；能改的值点一下就打开选择器。
- [Search](components/Search/README.md) · [预览](components/Search/preview.html) — 搜索：一个搜索框、几个筛选条件、按种类分组的结果。命中的词是小黄贴纸，键盘高亮是浅黄；搜不到时用空状态。
- [TaskCard](components/TaskCard/README.md) · [预览](components/TaskCard/preview.html) — 任务卡：频道、编号、标题和一枚可以改的状态签。看板和列表用同一张卡；列表按状态分组，看板按状态分列。
- [Timeline](components/Timeline/README.md) · [预览](components/Timeline/preview.html) — 时间线：按顺序列出发生了什么。任务历史用任务状态的颜色和人话；agent 的活动日志用状态灯的颜色和机器字。

**Agents**

- [ActionCard](components/ActionCard/README.md) · [预览](components/ActionCard/preview.html) — 行动卡：agent 把要做的事填好，挂在它的消息下面，由人点确认；确认之后，卡上写着是谁、在什么时候做的。
- [AgentActivity](components/AgentActivity/README.md) · [预览](components/AgentActivity/preview.html) — agent 在干活时怎么显示：写在它出现的地方，不另开一条实时条。页面顶上一行摘要（一叠头像、几个人），它那一行写它正在做的事，它所在的地方写谁在这里干活，点开摘要是 Working now 列表。

**Overlays**

- [Dialog](components/Dialog/README.md) · [预览](components/Dialog/preview.html) — 对话框：要你马上决定、或者填一两项才能继续时，盖在遮罩上的一张浮层。最多两个按钮，确认按钮的颜色说明后果。
- [Menu](components/Menu/README.md) · [预览](components/Menu/preview.html) — 菜单：一列动作。手机长按和桌面右键、点 ⋯ 打开的是同一个菜单；悬停和键盘高亮是浅黄，当前值打勾、加粗。
- [Popover](components/Popover/README.md) · [预览](components/Popover/preview.html) — 浮在触发物旁边的一小块：悬停 @某人 时是只读的资料卡；点开的 popover 里可以放控件。
- [Sheet](components/Sheet/README.md) · [预览](components/Sheet/preview.html) — 抽屉和底部弹层。抽屉：详情和设置从右边滑出，下面的内容还在原地；大一点的设置用宽抽屉；手机上抽屉铺满，就是一整页。底部弹层：手机上从几项里选一个，或者一小段说明，从底部升起。
- [Tooltip](components/Tooltip/README.md) · [预览](components/Tooltip/preview.html) — 文字提示：悬停或长按时冒出来的一句话，给没写字的东西补上名字、后果或快捷键。

**Feedback**

- [Banner](components/Banner/README.md) · [预览](components/Banner/preview.html) — 提示条：要先读它再动手的一段说明。按意图分四种浅底——信息青、警告橙、危险红、成功绿；字和图标一律是墨。放在对话框、表单的内容里；一个面板里的东西出了问题时，是面板头下面的一条通栏。
- [EmptyState](components/EmptyState/README.md) · [预览](components/EmptyState/preview.html) — 空状态：没有内容时，说清楚为什么空、下一步做什么。只有一种样子：灰色的 36 图标，不加框；灰色的标题；一句话；最多一个按钮。
- [Loading](components/Loading/README.md) · [预览](components/Loading/preview.html) — 加载：知道布局用骨架，不知道要多久用像素转圈，知道百分比用进度条。它们都是被动的指示，不用粉。
- [Toast](components/Toast/README.md) · [预览](components/Toast/preview.html) — 轻提示：刚做完的一件事的回执，一块深色浮层，几秒后消失；可以带一个 View 或 Undo。

**Screens**

- [ScreenAgent](components/ScreenAgent/README.md) · [预览](components/ScreenAgent/preview.html) — Raft Chat 的 agent 主页：push 进去的一页，盖住 Tab 栏。大号像素贴纸带着硬阴影慢慢漂浮——工作页里只有这一页用插画；再往下是它是谁、在哪儿运行、在做什么、记得什么。
- [ScreenChannel](components/ScreenChannel/README.md) · [预览](components/ScreenChannel/preview.html) — Raft Chat 的频道页：push 进去的一页，顶栏白底、黄底两版待定；人和 agent 在同一条时间线里，底部是 composer。
- [ScreenChannelViews](components/ScreenChannelViews/README.md) · [预览](components/ScreenChannelViews/preview.html) — Raft Chat 的频道里，对话、任务、文件三种内容怎么切换：四个版本，等挑选。前三个是一次看一种，D 让任务和对话同时在屏幕上。最后两台手机是 D 在手机上的样子。
- [ScreenDesktop](components/ScreenDesktop/README.md) · [预览](components/ScreenDesktop/preview.html) — Raft Chat 的桌面频道页：黄色 Rail → 奶油色侧栏 → 白色主区。界面用中文，演示苹方回落和中英混排。
- [ScreenHome](components/ScreenHome/README.md) · [预览](components/ScreenHome/preview.html) — Raft Chat 的首页（一级页）：黄色外框里是工作区胶囊和铃铛，下面是大标题 Home 和一行“谁在干活”；列表的头三行是 Search、Activity、Saved 三个入口，下面是频道和 agent，agent 那几行写着它们正在做的事。
- [ScreenOnboarding](components/ScreenOnboarding/README.md) · [预览](components/ScreenOnboarding/preview.html) — 引导页：第一次打开 App 时，可以把官网整个搬进来——整屏黄色、倾斜漂浮的像素贴纸、半调网点、大标题。这是《模式》里“品牌元素用多少”的最后一行：用得最多的地方。
- [ScreenSettings](components/ScreenSettings/README.md) · [预览](components/ScreenSettings/preview.html) — Raft Chat 的设置页：一级页 Settings 在黄色外框里，下面按 Personal / Workspace / Resources 分组；进到 Notifications 是二级页，盖住 Tab 栏。
- [ScreenTasks](components/ScreenTasks/README.md) · [预览](components/ScreenTasks/preview.html) — Raft Chat 的任务页（一级页）：外框里是大标题 Tasks 和任务数；下面一条筛选；列表按状态分组。

**Cover**

- Cover · [预览](components/Cover/preview.html) — 这套系统的封面
