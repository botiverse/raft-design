# 中文翻译指南与术语表

本文件约定 raft-design 文档中文版（`i18n/zh/`）怎么写。翻译的机制（文件放在哪、怎么标记译自哪个版本、过期怎么提示）见 [i18n/README.md](../README.md)。

**用词以 Raft App 的中文界面为准**（slock 仓库 `packages/web/src/i18n/messages/zh-cn.ts`），其次是官网 raft.build 的中文版；两者不一致时跟 App。docs.raft.build 的中文版（raft-docs 仓库的 `i18n/zh-cn/GLOSSARY.md`）用同一套用词。

## 原则

- **意思一条不改。** 规则、理由、数字、例外都要在；不增加原文没有的话，不删除原文有的话。
- **按中文习惯写，不逐字直译。** 可以调整语序、拆分长句。英文的祈使句规则（"Use …", "Don't …"）译成直接的中文祈使句（「用…」「不要…」）。
- **语气平实。** 不用「强大」「优雅」「无缝」这类营销词，原文也没有。
- **句子短。** 一句话说一件事。

## 格式

- 简体中文，全角标点（，。：；？！）。引用、界面上的词语用「」。
- 中文与英文单词、数字、行内代码之间加一个半角空格：「每个 token 有一个用途」「间距是 4px 的倍数」。`node scripts/i18n.mjs check` 会检查汉字和英文字母、数字之间有没有空格，和 Raft 中文界面的检查（slock 的 `zhCatalogSpacingContract`）一致。
- 省略号只用一个「…」，不用「……」或「...」（同 slock 的 `zhEllipsisForm`）。
- 粗体、列表、表格的结构与原文一一对应；表格列数不变。
- 标题的数量、层级和顺序与原文完全一致，不增不减，也不要自己写 `{#id}`：脚本会给每个标题补上与英文一致的锚点。
- 链接的地址（括号里的部分）原样保留，只翻译链接文字。
- 代码块（包括 `example` 和 `tokens` 代码块）、行内代码、token 名、组件名、文件路径、URL 原样保留，不翻译。
- 文件开头的 front matter 只保留 `title` 和 `summary` 两项，两项都翻译；组件文档的 `title` 和一级标题保持英文组件名。

## 保持英文的词

- **组件名**：Button、Dialog、Sheet、Toast、Tooltip、SegmentedControl 等，指组件本身时写英文原名。指一般概念时可以用中文（「对话框」「菜单」），第一次出现时可写成「对话框（Dialog）」。
- **token 名和 token 这个词**：`layer-frame`、`foreground-muted`；「token」不译。
- **产品名**：Raft、Raft Chat、Tasks、Calendar、Artifacts、Sites、Meeting、Canvas、raft-ui、Stamp。
- **界面上的英文文字**：按钮、菜单项、标签页名、空状态文案等界面上原样显示的英文保留英文（Sign Out、Working now、Mark as Done），需要时在后面加中文说明。标签栏五项按术语表译成中文。
- **英文界面文案的例子**：原文举例说明英文界面怎么写（如按钮写 "Sign In"、Title Case、不用全大写），例子保留英文，规则照译。需要时在后面加中文说明。

## 术语表

产品用语与 Raft 中文界面（slock 的 zh-cn 词表）保持一致。

| English | 中文 | 说明 |
| --- | --- | --- |
| agent | Agent | 不译，首字母大写，不加复数（同 App 和官网）。讲英文界面用词时，英文的 agent 照原样写 |
| people and agents | 人和 Agent | |
| person, people | 人 | |
| human (与 Agent 相对) | 人类 | 「人类成员」 |
| member | 成员 | |
| owner / admin / guest | 所有者 / 管理员 / 访客 | |
| server | 服务器 | |
| channel | 频道 | |
| thread | 消息列 | Raft 界面的叫法 |
| direct message, DM | 私信 | |
| mention | 提及 | |
| reaction | 回应 | |
| unread | 未读 | |
| saved | 收藏 | |
| task | 任务 | |
| task status: To Do / In Progress / In Review / Done / Closed | 待办 / 进行中 / 待确认 / 完成 / 已关闭 | |
| claim | 认领 | |
| Home / Activity / Tasks / Search / More | 主页 / 动态 / 任务 / 搜索 / 更多 | 底部标签栏的五项 |
| computer | 计算机 | |
| workspace | 工作空间 | 指服务器这个共享空间。Agent 在计算机上的工作目录是「工作区」（App 里 Agent 详情的标签页） |
| design system | 设计系统 | |
| foundations | 基础 | 章节名 |
| principles | 原则 | 章节名 |
| patterns | 模式 | 章节名 |
| guideline | 规范 | |
| frame | 外框 | 黄色的那一圈：桌面端左侧导航条、网页顶栏、手机一级页面顶栏 |
| paper | 纸面 | 白色的内容区 |
| canvas | 画布 | 作为 token 层级时 |
| rail | 导航条 | 桌面端最左侧那一条 |
| sidebar | 侧栏 | App 的叫法，不用「侧边栏」 |
| account | 账户 | App 的叫法，不用「账号」 |
| top bar | 顶栏 | |
| tab bar | 标签栏 | 手机底部 |
| header | 标题栏 / 头部 | 视上下文 |
| seam | 接缝线 | 两块面之间的线 |
| hairline | 细线 | |
| ink | 墨色 | 深色描边和文字的颜色 |
| sticker | 贴纸 | 带墨色描边的一块品牌色 |
| surface | 表面 | |
| layer | 层 | |
| elevation | 层级 / 高度 | 视上下文 |
| scrim / backdrop | 遮罩 | |
| overlay（弹出的那一层） | 浮层 | |
| overlay（悬停、按下时盖在上面的半透明层） | 叠加层 | |
| popover / popup | 弹出层 | |
| dialog | 对话框 | |
| bottom sheet | 底部面板 | |
| drawer | 抽屉 | |
| menu | 菜单 | |
| toast | 轻提示（Toast） | |
| tooltip | 工具提示（Tooltip） | |
| notice | 提示 | |
| control | 控件 | |
| primary / secondary button | 主按钮 / 次按钮 | |
| destructive | 破坏性的 | |
| irreversible | 不可撤销的 | |
| label | 标签 | 界面上的文字标签 |
| placeholder | 占位文字 | |
| focus ring | 焦点环 | |
| hover / pressed / selected / disabled | 悬停 / 按下 / 选中 / 禁用 | |
| hit area | 点击区域 | |
| light mode / dark mode | 浅色模式 / 深色模式 | |
| contrast | 对比度 | |
| type scale | 字号阶梯 | |
| line height | 行高 | |
| weight | 字重 | |
| spacing | 间距 | |
| padding / gap / margin | 内边距 / 间隔 / 外边距 | |
| radius | 圆角 | |
| baseline | 基线 | |
| optical alignment | 视觉对齐 | |
| density | 密度 | |
| desktop / web / phone / tablet | 桌面端 / 网页 / 手机 / 平板 | |
| pointer / touch | 鼠标指针 / 触屏 | |
| breakpoint | 断点 | |
| accessibility | 无障碍 | |
| screen reader | 读屏软件 | |
| motion | 动效 | |
| status | 状态 | |
| empty state | 空状态 | |
| skeleton | 骨架屏 | |
| composer | 消息输入框 | 发消息的那个输入区；和一般的输入框（field）区分 |
| field / input | 输入框 | |
| chip | 标签片 | |
| status chip | 状态标签 | |
| badge | 徽标 | |
| spinner | 加载指示器 | |
| die-cut edge | 模切边 | |
| soft tint | 浅色底 | |
| typography | 字体排印 | 章节名 |
| runtime | 运行时 | Agent 运行所用的那个程序；「运行了多久」是运行时长 |
| live bar | 实时条 | |
| attention dot | 提醒圆点 | |
| presence light | 在线状态灯 | |
| destination | 目的地 | 标签栏、导航条上的一项 |
| top-level page / pushed page | 一级页面 / 推入页面 | |
| handle | 用户名（handle） | `@bugen` 这种 |
| ghost button | 幽灵按钮 | |
| chevron | V 形箭头 | |
| side panel | 侧面板 | |
| joint channel | 联合频道 | |
| Identity and presence | 身份与在线状态 | 页面名 |
| Writing about agents | 描述 Agent 的用语 | 页面名 |
| Hand-offs and approvals | 交接与审批 | 页面名 |
| tile（location / channel / icon / workspace tile） | 图块（位置图块、频道图块、图标图块、工作空间图块） | |
| subtle / medium tier（悬停、按下的两档） | 浅档 / 中档 | |
| status pixel | 状态像素点 | |
| lightbox | 图片查看器 | 指组件时写 Lightbox |
| trigger | 触发按钮 | |
| Anatomy / When to use / Variants / States / Behavior / Content / Accessibility | 结构 / 何时使用 / 变体 / 状态 / 行为 / 内容 / 无障碍 | 组件文档的章节名 |
| decision record | 决策记录 | |
