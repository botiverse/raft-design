---
title: 字体排印
summary: 两种字体，字号阶梯以及每种字号和字重的用途，文字颜色的三个层级，字体度量 token，以及大小写规则。
sourceHash: 08672e9a
---

# 字体排印

Raft 用两种字体，各管一件事：Space Grotesk 写人说的话，Space Mono 写机器输出的内容。层次靠字号、字重和颜色区分，从不靠大写字母。

## 原则 {#principles}

- **Space Grotesk 代表人，Space Mono 代表机器。** Space Grotesk（可变字体，字重 300 到 700）用于消息、标签和标题。Space Mono（400 和 700）用于 ID、时间、计数、运行时长、事件行、快捷键和代码。
- **中日韩文字回退到系统字体**：中文依次用 PingFang SC、思源黑体（Source Han Sans）。繁体中文、日文或韩文页面（`<html lang="zh-TW">` / `"ja"` / `"ko"`）先回退到各自的字体，因为简体中文字体按大陆字形绘制汉字，也没有韩文字母。中英文混排时，数字、ID 和时间仍用 Space Mono。
- **不用全大写。** 可点击的内容用 Title Case，其余一律用 sentence case；见[大小写](#casing)。

## 字号阶梯 {#type-scale}

每种样式设定字号和行高；粗体样式还设定字重。常用样式有两套字号：手机一套，桌面端一套。桌面端字号从 768px 起生效（桌面布局从这里开始，见[响应式布局](../patterns/responsive.md)），且要求主要指针是鼠标或触控板。触屏在任何宽度下都保持手机字号（原因见[间距](./spacing.md#hit-targets)）。两端用同一个工具类，所以组件从不为字号单独写断点。

| Token | 手机 | 桌面端 | 用途 |
| --- | --- | --- | --- |
| `text-hero` | 40/44 | 40/44 | 「Login with Raft」页面上的服务名称，640px 起 |
| `text-display` | 34/40 | 34/40 | 创建服务器页面的标题，640px 起 |
| `text-title` | 22/28 | 22/28 | 登录页和设置步骤的标题 |
| `text-headline` | 17/22 | 16/24 | 顶栏标题（一级页面的名称、推入页面的标题）、面板头部、侧栏头部、对话框和底部面板的标题、个人资料上的名字 |
| `text-body` | 16/24 | 14/22 | 消息正文；列表和任务标题用字重 600 |
| `text-subhead` | 15/20 | 14/22 | `lg` 尺寸的按钮、名字、单选项标签、对话框正文 |
| `text-callout` | 14/20 | 14/22 | 预览、菜单项、横幅、摘录 |
| `text-control` | 13/18 | 14/22 | 32px 或 28px 控件的标签：`md` 尺寸的 Button、对话上方的跳转胶囊、面板操作、筛选触发器、文本选择工具栏 |
| `text-footnote` | 13/18 | 12/18 | 分组标题、字段标签、工具提示 |
| `text-caption` | 12/16 | 12/18 | 副标题、状态标签、帮助文字 |
| `text-label` | 11/13 | 11/13 | 标签栏的标签和带文字导航条的标签 |
| `text-mono-meta` | 12/16 | 12/18 | ID、时间、计数、运行时长、事件行、快捷键（用 Space Mono） |
| `text-mono-code` | 13/20 | 13/20 | 代码和命令（用 Space Mono） |

字段文字和卡片标题有自己的 token，同样分两套字号（[度量 token](#metric-tokens)）。

### 桌面端与手机 {#desktop-and-phone}

桌面端字号阶梯沿用飞书（Lark）PC 端：标题 16/24，所有供人阅读的文字 14/22，备注 12px。手机字号阶梯沿用飞书移动端，消息正文同样是 16/24。人们会拿 Raft 和自己每天用的聊天工具比较，而这些工具在桌面端的消息正文都是 14px。

- **桌面端是带鼠标或触控板的宽屏。** 字号在 `(width >= 48rem) and (pointer: fine)` 时切换，与控件高度用同一个查询条件，所以字段的文字和高度一起变化。用触屏操作的平板保持手机字号：16px 的字段文字可以防止 iOS 和 iPadOS 在聚焦字段时放大页面。
- **桌面端观看距离更远，屏幕上内容更多。** 对话旁边有侧栏，常常还有消息列，所以用 14px 时一行能放更多字，一屏能放更多消息。手机离眼睛更近，一栏占满屏幕；16px 看起来是同样大小。
- **判断字号要看中文，不能只看拉丁字母。** 中文回退到系统字体，字形撑满 em 框：同为 16px，一行中文看起来比同一行 Space Grotesk 更大，后者的小写字母只有字号的一半左右。改动时，中文对话和英文对话都打开检查一遍。
- **桌面端 body、subhead 和 callout 都是 14/22。** 飞书没有 13px 或 15px 这一级，这套阶梯也不需要：名字、消息和预览在桌面端靠字重和颜色区分，再加一级字号差异，就成了[颜色层级](#notes-on-deeper-surfaces)所禁止的三重差异。在手机上它们仍相差一级。
- **桌面端备注用 18px 行高，和手机上的 footnote 一样。** 飞书给 12px 备注 20px 行高，但这里的备注常常是设置项或卡片下方的两三行文字，行高 20px 时，这几行之间的距离比上方 14/22 的文字还大，备注就显得比它所解释的内容更松散。footnote、caption 和 mono meta 都是 12/18，所以同一行上 Space Mono 的时间和 Space Grotesk 的状态占同样的框。两种字体的大写字母高度也相同（0.700em），所以在同一条基线上字母一样高（[同一行上不同字号的文字](./alignment.md#text-of-different-sizes-on-one-line)）。
- **Mono code 保持 13/20。** Space Mono 比 Space Grotesk 宽，13px 的代码已经和 14px 的文字齐平，20px 的行高也能放进 22px 的文字行里。
- **控件标签在桌面端是 14px，手机上是 13px。** 飞书的按钮文字是 14px；而 footnote 在桌面端降到 12px，所以 32px 控件的标签有自己的样式 `text-control`。
- **Hero、display、title 和 label 两端不变。** 它们用于登录和设置页面，两端相同，以及手机的标签栏。
- **密度由用户选择，不靠默认值。** 想在屏幕上看到更多内容的人，可以在消息字号设置里选 Small。不要为了多放内容把默认字号调小。

## 字体族 {#font-families}

`fonts.css` 定义了三个字体族。通过 Tailwind 工具类使用它们。

| 工具类 | 字体 | 用于 |
| --- | --- | --- |
| `font-sans` | Space Grotesk | 人说的一切：标题、消息、列表、设置、按钮、状态词、个人资料的内容 |
| `font-heading` | Space Grotesk | 字段文字（Input、Textarea、InputGroup）和 `Text.Heading`、个人资料上的名字。配方里的标题用 `font-sans`，字体相同 |
| `font-mono` | Space Mono | 机器写的内容：ID、主机名、版本号、操作系统字符串、命令、环境变量、URL、代码和凭据块、时间和日期、计数、文件元数据、`@handle` |

- 按内容由谁写来决定：逐字复制的文字、时间、计数或身份标识用 mono；人说的话用 sans。
- 消息列标题末尾的 `#channel-name` 用 sans，样式为 `text-headline`、字重 400、`foreground-hint`：它属于标题的一部分。
- sans 字体族的中文回退依次为 PingFang SC、Hiragino Sans GB、Microsoft YaHei 和 Noto Sans SC，然后是系统字体。在 `lang="zh-TW"`（以及 `zh-HK`、`zh-MO` 和 `zh-Hant`）下回退到 PingFang TC、Microsoft JhengHei 和 Noto Sans TC；在 `lang="ja"` 下回退到 Hiragino Sans、Yu Gothic UI、Meiryo 和 Noto Sans JP；在 `lang="ko"` 下回退到 Apple SD Gothic Neo、Malgun Gothic 和 Noto Sans KR。

## 用法 {#usage}

- 按用途从 400、500、600 和 700 中选字重；常规样式在字号阶梯里只设定字号和行高。
- 头像里的首字母按头像尺寸用 11px、13px、15px、22px 或 40px；见 [Avatar](../../packages/ui/src/components/avatar/avatar.md)。
- 机器生成的内容一律用 Space Mono，即使在句子里也是如此：`#25`、`10:24`、`Claude Code`、计数、事件行。
- 给人看的统计数字用 Space Grotesk。

### 按用途选字号 {#sizes-by-use}

| 样式 | 用于 |
| --- | --- |
| `text-headline` | 标题，全部用 700：面板、消息列、对话框、弹出层、抽屉、侧栏顶部。任务详情里的任务标题是对话框页面级的标题，用 600，放在说明这是哪个对话框、字重 700 的那条栏下面（[视觉舒适度](./comfort.md#hierarchy-contrast)） |
| `text-body` | 消息正文；卡片标题用 600（`card-title-*`）；任务卡片和搜索结果中的名称 |
| `field-*` | 字段中的文字：Input、Textarea、InputGroup、`chrome="field"` 的 Select |
| `text-subhead` | 发送者用 700；侧栏行用 500，选中的行用 700；动态里的标题；对话框正文和说明；`lg` 尺寸的 Button |
| `text-callout` | 描述列表中的值、菜单项、卡片说明、文件名、引用消息的文字 |
| `text-control` | 32px 控件的标签：`md` 尺寸的 Button、面板操作、筛选触发器 |
| `text-footnote` | 字段标签用 600；描述列表的术语用 500，放在 `minmax(88px, max-content)` 的标签列里；分组标题用 700 |
| `text-caption`、`text-mono-meta` | 消息的备注（时间用 mono、模型和行内状态）、回复预览的时间、用 mono 的计数、列表元数据、徽标 |

### 按用途选字重 {#weights-by-use}

| 字重 | 用于 |
| --- | --- |
| 400 | 阅读文字：消息正文、值、字段文字、mono 备注（时间、计数） |
| 500 | 菜单项、侧栏行、描述列表的术语；`text-caption` 给模型和行内状态设 500 |
| 600 | 列表行中的名字、卡片标题、字段标签、标签页、徽标 |
| 700 | 标题、发送者、按钮、分组标题、实心徽标和未读数、选中的标签页、行或菜单项；文字无效或超出限制时 textarea 的计数器 |

## 颜色层级 {#color-tiers}

文字分三个层级。token 及其对比度见[颜色](./color.md#text-and-icons)。

| 层级 | Token | 用于 |
| --- | --- | --- |
| 基础 | `foreground` | 标题（面板、侧栏、消息列、对话框）、发送者和消息正文、值、列表行中的名字、菜单项、选中的下划线标签页、幽灵按钮 |
| 弱化 | `foreground-muted` | 说明（对话框、卡片、弹出层）、字段标签、未选中的标签页、引用消息的文字、侧栏副标题、图标 |
| 提示 | `foreground-hint` | 备注：时间、模型、行内状态、描述列表的术语、分组标题、计数、列表元数据、占位文字、空值 |

- 标题、侧栏顶部、发送者和列表行中的名字都用基础层级。它们之间靠字重区分：标题和发送者用 700，列表行用 600。
- 一条消息分两层：内容（发送者和正文，用基础层级）和备注（时间、模型、行内状态，用提示层级）。
- 文字用层级 token，不要用 `text-foreground-muted/70` 这类透明度变体：对比度保证只对这几个层级成立。透明度只用于装饰性字符，比如消息底部的分隔符。

### 较深表面上的备注 {#notes-on-deeper-surfaces}

- 备注看起来有多重，不只取决于对比度。在紧凑的行里，备注的字号越接近它所注释的文字，两者的颜色就要拉得越开。
- 备注放在比画布更深的卡片或弹出层上时，用眼睛检查一次。如果显得太重，就把它调浅半个层级。
- 区分两级文字时，字号、字重和颜色最多用两项。
- 单个情况就地用 class 修正。出现两三个类似情况后，再把它变成共享 token。拿不准时，在深色模式下用 APCA（Lc）检查比用 WCAG 对比度更好，因为它考虑了明暗极性和字号。

## 度量 token {#metric-tokens}

字段和卡片标题各有一组字体度量 token，让依据它们排版的各个部分用同样的数值。和字号阶梯一样，每个 token 都有手机值和桌面端值，用同一个查询条件切换。

```tokens
field
```

- `field-*` 设定 Input、Textarea、SelectTrigger 的字段变体以及 Select 列表选项的文字（工具类 `text-field`、`font-field`）。选项与字段使用相同的字体样式，所以列表展开时值的字号不变；选项的高度和内边距仍是自己的，因为列表行不是控件。
- 手机上的字段文字不要小于 16px：字段文字更小时，iOS 会把页面放大到该字段。桌面端没有这种缩放，所以字段文字在桌面端跟随桌面正文字号。

```tokens
card-title
```

- `card-title-*` 设定 CardTitle（工具类 `text-card-title`、`font-card-title`）。放在卡片标题旁边的单选框或复选框用它的行高与标题对齐。

## 大小写 {#casing}

| 文字 | 大小写 | 示例 |
| --- | --- | --- |
| 一切可点击的内容：按钮、文字链接、菜单项、标签页、标签栏项、状态名称 | Title Case | Create Task, Mark All Read, Sign Out |
| 标题、分组标题、说明、空状态 | Sentence case | No tasks match these filters |
| 重复其按钮标签的对话框或底部面板标题 | Title Case | Create Channel |

- 不要把文字设成全大写，无论是用 CSS 还是直接写在字符串里。[0002](../decisions/0002-no-all-caps.md) 允许一个例外：引导页上的步骤标签；产品的设置流程用 sentence case 写步骤标签，所以产品中没有任何全大写文字（[品牌](./brand.md)）。
- Title Case 的写法规则见[写作](../content/writing.md#casing)。

## 相关 {#related}

- [写作](../content/writing.md)：文字本身。
- [Token](./tokens.md)：所有 token 组及其命名方式。
- [无障碍](./accessibility.md#language-and-casing)：为什么不用全大写。
- [对齐](./alignment.md)：文字如何与形状和边缘对齐。
