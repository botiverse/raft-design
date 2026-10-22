# 中文翻译指南与术语表

本文件约定 raft-design 文档中文版（`i18n/zh/`）怎么写。翻译的机制（文件放在哪、怎么标记译自哪个版本、过期怎么提示）见 [i18n/README.md](../README.md)。

## 原则

- **意思一条不改。** 规则、理由、数字、例外都要在；不增加原文没有的话，不删除原文有的话。
- **按中文习惯写，不逐字直译。** 可以调整语序、拆分长句。英文的祈使句规则（"Use …", "Don't …"）译成直接的中文祈使句（「用……」「不要……」）。
- **语气平实。** 不用「强大」「优雅」「无缝」这类营销词，原文也没有。
- **句子短。** 一句话说一件事。

## 格式

- 简体中文，全角标点（，。：；？！）。引用、界面上的词语用「」。
- 中文与英文单词、数字、行内代码之间加一个半角空格：「每个 token 有一个用途」「间距是 4px 的倍数」。
- 粗体、列表、表格的结构与原文一一对应；表格列数不变。
- 标题的数量、层级和顺序与原文完全一致，不增不减，也不要自己写 `{#id}`：脚本会给每个标题补上与英文一致的锚点。
- 链接的地址（括号里的部分）原样保留，只翻译链接文字。
- 代码块（包括 `example` 和 `tokens` 代码块）、行内代码、token 名、组件名、文件路径、URL 原样保留，不翻译。
- 文件开头的 front matter 只保留 `title` 和 `summary` 两项，两项都翻译。

## 保持英文的词

- **组件名**：Button、Dialog、Sheet、Toast、Tooltip、SegmentedControl 等，指组件本身时写英文原名。指一般概念时可以用中文（「对话框」「菜单」），第一次出现时可写成「对话框（Dialog）」。
- **token 名和 token 这个词**：`layer-frame`、`foreground-muted`；「token」不译。
- **产品名**：Raft、Raft Chat、Tasks、Calendar、Artifacts、Sites、Meeting、Canvas、raft-ui、Stamp。
- **英文界面文案的例子**：原文举例说明英文界面怎么写（如按钮写 "Sign In"、Title Case、不用全大写），例子保留英文，规则照译。需要时在后面加中文说明。

## 术语表

产品用语与 Raft 中文界面（slock 的 zh-cn 词表）保持一致。

| English | 中文 | 说明 |
| --- | --- | --- |
| agent | agent | 不译。句首、标题、标签开头写 Agent |
| people and agents | 人和 agent | |
| person, people | 人 | |
| human (与 agent 相对) | 人类 | 「人类成员」 |
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
| workspace | 工作空间 | |
| design system | 设计系统 | |
| foundations | 基础 | 章节名 |
| principles | 原则 | 章节名 |
| patterns | 模式 | 章节名 |
| guideline | 规范 | |
| frame | 外框 | 黄色的那一圈：桌面端左侧导航条、网页顶栏、手机一级页面顶栏 |
| paper | 纸面 | 白色的内容区 |
| canvas | 画布 | 作为 token 层级时 |
| rail | 导航条 | 桌面端最左侧那一条 |
| sidebar | 侧边栏 | |
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
| decision record | 决策记录 | |
