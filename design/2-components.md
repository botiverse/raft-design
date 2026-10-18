# 组件

40 个组件，加 8 张参考屏（都是 Raft Chat 的页面）。每个组件在 `components/<组件>/` 下有说明（README）和参考画法（preview.html）；这一页回答两个问题：有什么，选哪个。同一件东西画了几个版本的（NavBar、Rail、Tabs、频道的视图），默认的写在前面，其他的等挑选，见《取舍》的“还没定的”。

## 有什么
| 组 | 组件 | 用来 | 产品里对应 |
| --- | --- | --- | --- |
| Actions | Button | 文字按钮：粉色主操作、墨线、无框、橙、红；忙的状态 | Button |
| | IconButton | 只有图标的按钮 | Button（icon 尺寸） |
| Inputs | TextField | 单行、带前后缀、多行带字数、搜索框；标签、帮助、报错 | Field、Input、InputGroup、Textarea |
| | Select | 单选、带搜索的单选、多选、带搜索的多选、筛选条件 | Select、Combobox、筛选条 |
| | Checkbox | 随表单提交的是 / 否 | Checkbox、CheckMarker |
| | Radio | 几个答案选一个 | RadioGroup |
| | Switch | 拨了就生效的设置 | Switch |
| | Composer | 发消息：工具、As Task、发送、@ 联想、附件 | Composer |
| Navigation | NavBar | 手机顶栏：一级页两个版本（带大标题写页名 / 和线上一样，首页只有工作区胶囊）；二级页白底、黄底两版；切换工作区的底部列表 | 手机端顶栏、PanelHeader、ServerSwitcherMenu |
| | TabBar | 手机底部的一级入口，只在一级页（Raft Chat 是 Home / Tasks / Members / Settings） | MobileNav |
| | Rail | 桌面最左边的黄色竖栏：工作区和一级入口；两个版本：只放图标（56）/ 图标加字（68） | AppRail、LeftRail |
| | Sidebar | 桌面侧栏：Rail 入口的内容；头上写谁在干活；一行在任何分组里都一样 | Sidebar、SidebarItem 的部件 |
| | Panel | 桌面的面板头、频道的分页、线程面板、右边一栏 | PanelHeader、ConversationPanel、ThreadPanel |
| | SegmentedControl | 同一份内容换个看法（Board / List） | SegmentedControl |
| | Tabs | 一页里的几个分区（Chat / Tasks / Files）；贴纸和下划线两版 | Tabs、ConversationPanelTabs |
| | Steps | 短流程走到哪一步 | Steps |
| Identity | Avatar | 人和 agent 的方头像、工作区、状态灯、叠放 | Avatar、AvatarGroup、PixelAvatar、StatusDot |
| | ChannelIcon | 频道的中性方块和黄色位置块 | 频道图标 |
| Status | Badge | 未读数、@ 标记 | Badge、侧栏计数、AttentionDot |
| | StatusChip | 任务状态、任务标记、状态灯写成字、`agent` 标签、运行时签 | TaskStatusBadge、TaskChip、Status |
| Content | Message | 消息、正文里的标记、事件行、任务标记、表情回应、线程回复、悬停工具条 | MessageItem 一族、SystemMessage、reactions |
| | ListRow | 手机列表的一行、入口行、分组标题、设置行；详情页里的 agent 和人 | ListRow（产品里现在是 SurfaceListItem、AvatarListRow） |
| | TaskCard | 任务卡、看板、按状态分组的列表 | TaskCard、TaskBoard、TaskSection |
| | Attachment | 文件卡、图片、composer 里的缩略图、上传进度和失败 | FilePreview、MessageAttachment、ComposerAttachment |
| | Code | 行内代码、可复制的命令、代码块 | InlineCode、CopyableCode、CodeBlock |
| | PropertyList | 一件东西的属性，能就地改 | DescriptionList、TaskProperties |
| | Timeline | 任务历史、agent 的活动日志 | Timeline、AgentActivityLog |
| | Search | 搜索框、分组结果、命中 | SearchShell 和结果 |
| | Inbox | 动态和通知中心的一行 | ActivityInbox、NotificationCenter、InboxItem |
| Agents | AgentActivity | 正在干活：一叠头像的摘要、行里的第二行、Working now 列表、状态行 | LiveAgentActivityBar |
| | ActionCard | agent 填好、人来确认的一件事 | MessageActionCard |
| Overlays | Menu | 一列动作；手机长按和桌面右键是同一个 | DropdownMenu、ContextMenu、MenuItem |
| | Dialog | 确认、两三项的小表单；宽版放一次填完的大表单（左边分段列表、右边分段、底栏提交） | Dialog（`size="wide"`）、AlertDialog、ConfirmDialog、DialogSurface、FormSection |
| | Sheet | 右侧抽屉（420；滑入，下面铺遮罩；手机上是一整页）、手机底部的列表和一小段说明 | Drawer、OverflowSheet、BottomSheet |
| | Popover | 悬停资料卡、点开的小浮层 | Popover、PreviewCard |
| | Tooltip | 一句话的提示 | Tooltip |
| Feedback | Banner | 对话框、表单里要先读的说明；面板头下面的通栏 | Banner、PanelNotice |
| | Toast | 刚做完的事的回执 | toast |
| | Loading | 骨架、像素转圈、进度条 | Skeleton、Spinner、Progress |
| | EmptyState | 空着的时候：只有一种样子 | EmptyState |
| Screens | ScreenHome、ScreenChannel、ScreenChannelViews、ScreenTasks、ScreenAgent、ScreenOnboarding、ScreenSettings、ScreenDesktop | 用上面的组件拼出来的 Raft Chat 参考屏；ScreenChannelViews 是频道里对话、任务、文件的四种放法 | — |

## 选哪个

### 让人选一样东西
| 你要的是 | 用 |
| --- | --- |
| 对一样东西做一件事 | Menu（手机上长按，也是它） |
| 是 / 否，拨了就生效 | Switch |
| 是 / 否，点保存才生效 | Checkbox |
| 2–5 个答案选一个，跟表单一起提交 | Radio |
| 同一份内容换个看法 | SegmentedControl |
| 一页里的几个分区，各有各的内容 | Tabs |
| 10 个以内的值，选一个 | Select |
| 很多个值，选一个 | Select，列表顶上一行搜索 |
| 几个值，选几个 | Select 的多选：每项前面一个方框，框里写选中的值 |
| 很多个值，选几个（人、agent、标签） | Select 的多选，带搜索：选中的值变成框里的小块，后面接着打字 |
| 过滤一个列表 | Select 的筛选条件 `rf-filter` |
| 一件东西的某个属性，就地改 | PropertyList 里的 `rf-pick` |

### 告诉人一件事
| 情况 | 用 | 停留多久 |
| --- | --- | --- |
| 你刚做的事有了结果 | Toast | 几秒 |
| 动手之前要知道的事 | Banner，放在对话框、表单里 | 一直在 |
| 一个面板里的东西出了问题：agent 起不来、设置没存上 | Banner 的通栏，贴在面板头下面 | 问题解决之前 |
| 整个工作区的情况：电脑离线、额度快满、有更新 | 通知中心（Inbox），铃铛挂提醒点 | 情况变了之前 |
| 别处发生了，要你看到 | 动态（Inbox）；它的入口挂提醒点或带数字（Raft Chat：Rail 的 Activity、首页的 Activity 行） | 读了为止 |
| agent 要你授权 | ActionCard（在对话里），同时进动态 | 处理为止 |
| 要你马上决定 | Dialog | 决定为止 |
| 输入框填错了 | TextField 的 `is-error` | 改对为止 |
| 一个图标是什么意思 | Tooltip | 悬停的时候 |

错过了会让人困惑的事，不能用 toast。

### 浮在上面的东西
| 情况 | 用 |
| --- | --- |
| 悬停时一句话 | Tooltip |
| 悬停时看一个人或 agent | Popover 的资料卡 |
| 点开或长按，一列动作 | Menu |
| 点开选一个值 | Select（值多就带搜索） |
| 点开选几个值 | Select 的多选（值多就带搜索）；点选不关列表 |
| 点开填一点东西 | Popover |
| 要看一会儿的详情和设置 | Sheet 的抽屉（420，桌面从右边滑出、铺遮罩，手机上是一整页） |
| 一次填完的大表单（注册 / 编辑一个应用、一个 agent 的配置） | Dialog 的宽版（896，居中，铺遮罩，不跳去设置页）；手机上几乎铺满，没有分段列表 |
| 手机上选一个去处（切换工作区、Working now） | Sheet 的底部列表；选一个值仍然是 Select 的列表，做一件事是 Menu |
| 手机上一小段说明 | Sheet 的底部弹层 |
| 要你确认 | Dialog |
| 任务详情 | 居中的弹窗（最宽 760），手机上铺满 |

居中的弹窗（对话框、确认、搜索、任务详情、大表单）一律铺遮罩，出现和消失都没有动画；只有抽屉滑入。

### 等的时候
| 情况 | 用 |
| --- | --- |
| 布局已知 | 骨架 |
| 不知道要多久，也没有布局可占 | 像素转圈 |
| 知道百分比 | 进度条 |
| 按钮触发的等待 | 按钮的 `is-loading` |

### 一行用哪个
| 放在哪 | 用 |
| --- | --- |
| 手机列表：频道、私信、设置、成员 | ListRow |
| 详情页、资料页里的 agent 和人 | ListRow，放在分组卡片里 |
| 桌面侧栏 | Sidebar 的 `rf-srow` |
| 动态、通知 | Inbox 的 `rf-note` |
| 搜到的消息 | Search 的 `rf-hit` |
| 任务 | TaskCard（看板和列表一样） |

### 按钮用哪个颜色
主操作粉（每屏最多一个，可以没有）；其他操作墨线；取消和次要操作无框；会打断但能恢复的橙；收不回的红，而且只出现在确认对话框里，菜单里不上色。没有黄色按钮。

## 没有单独做的
产品里还有这些，用现有的部件拼就够了：

| 产品里有 | 用什么拼 |
| --- | --- |
| 任务详情 | 宽一些的 Dialog：标题、一行 PropertyList（Status / Assignee / Created by）、折叠的 Timeline（History）、任务的线程和 Composer |
| 大图浏览 | 铺满屏幕的 `rf-scrim`，放图片、左右切换和一个关闭的 IconButton |
| 链接卡片、转发的一组消息、引用预览 | Attachment 的文件卡结构，加 Message 的头部 |
| Mermaid 图、Markdown 表格 | 和代码块一样的容器：`code` 底、发丝线、`radius-lg` |
| 翻译状态、已读、收藏标记 | 消息底部一行里再加一枚小签，或一段 Space Mono 小字，不另造颜色 |
| 多选消息时的工具条 | `rf-msgbar` 放在底部 |
| 可以拖宽的分栏 | 分栏之间就是一条 `line-seam`，拖动区落在这条线上 |
| 表格（用量、账单） | 优先用 PropertyList 或 ListRow；真要表格：表头 13/18 `ink-3`，行间 `line`，数字用 Space Mono 右对齐 |
| 日期选择 | Select 的弹出部分放一列日期；日期用 Space Mono |
| 多选的一排开关按钮 | 一排 `rf-filter` |
| 授权确认（OAuth） | Dialog 的结构，用 PropertyList 列出要的权限 |
| 切换工作区 | 手机：工作区胶囊点开，从底部升起 Sheet 的底部列表（见 NavBar）；桌面：Rail 顶上的方块点开同一份列表，用 Menu 贴着方块弹出。每行是工作区方块、名字、未读数，当前的打勾 |
