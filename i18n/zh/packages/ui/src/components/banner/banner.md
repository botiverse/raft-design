---
title: Banner
summary: 对话框或表单里一条浅色底的提示，让人在操作前先读到；作为 PanelNotice 时，是某个面板里出错时铺在面板标题栏下方的一整条。
sourceHash: 71053e95
---

# Banner

横幅是一条人在操作前需要读到的简短提示：共享频道谁能看到、删除会移除什么、快要达到的上限，或者某样东西已经保存。它放在对话框或表单的内容里，浅色底表明它的意图。某个面板里出了问题时，同样的提示改成面板标题栏下方的一整条；见[面板里的提示](#inside-a-panel)。

```example
banner/compositions/preview
```

## 何时使用 {#when-to-use}

消息涉及的范围越大，放的位置就越靠外；完整的表格见[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)。

| 情况                                                                  | 用                                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 某一个输入无效                                                       | 输入框自己的错误提示（[Field](../field/field.md)），不用横幅                                             |
| 在对话框或表单里操作前需要知道的事                      | Banner，放在内容里                                                                                   |
| 某个面板里出了错：Agent 启动不了、设置没保存上 | `PanelNotice`，放在面板标题栏下方（[Panel](../panel/panel.md)）                                       |
| 整个服务器的状态：计算机离线、配额快满了     | [NotificationCenter](../notification-center/notification-center.md)，不要在页面顶部放横幅 |
| 刚刚做完的操作的结果                                | [Toast](../toast/toast.md)                                                                               |
| 必须马上做决定                                 | [Dialog](../dialog/dialog.md) 或 [AlertDialog](../alert-dialog/alert-dialog.md)                          |

## 结构 {#anatomy}

- `Banner`：浅色底的容器。必需。它填满给它的宽度，并按这个宽度排布各部分，所以要给它一个宽度（或让它填满父元素）；不要用 `w-fit`，那会让它缩成一团。
- 图标：意图对应的 Lucide 图标（[变体](#variants)），作为直接子元素放在文字前面。Banner 把它设为 20px，与文字间隔 10px（`sm` 横幅里是 16px 和 8px），并对齐第一行的中线（[引导文字的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。某件事还在等待时，比如计算机还没有连上，用 `status="info"` 的横幅，并用一个 `Spinner` 代替图标：等待不是问题，所以既不用警告的底色，也不用警告图标。Banner 把加载指示器放在图标那一列，对齐第一行的中线，所以文字的起点和有图标时一样。不要用 `Status` 灯代替图标：状态灯从不说明这是哪一类提示（成功、信息、警告、错误）。状态灯保留它自己的含义：Agent、人或计算机是否在工作或在线，任务的状态，以及标出有事等待或未读的方形提醒圆点；讲的是其中某件事的提示，仍然可以在里面显示那件事的状态灯（[Status](../status/status.md#sizes)）。
- `BannerTitle`：可选的粗体第一行。
- `BannerDescription`：消息内容。必需。行内的文字操作用 `TextLink variant="strong"` 放在里面，因为它处在一句话中（[TextLink](../text-link/text-link.md#variants)）。
- `BannerAction`：横幅的按钮；横幅可以关闭时，Dismiss 放在按钮前面。它位于右下角：文字和它能并排放在一行时，它在最后一行文字的末尾，对齐这一行的中线。有标题和描述时，这一行是描述的最后一行。文字在它旁边会换行时，或者横幅窄于 480px 时，它在文字下方单独占一行，靠末端对齐。这由 `BannerAction` 自己决定，不要手动摆放。宽度判断是对横幅内容区的容器查询：452px，也就是 `md` 下 480px 宽的横幅（`sm` 下 476px，`lg` 下 484px）。
- `BannerClose`：没有按钮的横幅上的 ×。一个无边框图标按钮，放在第一行末尾，对齐这一行的中线，图标框止于横幅的内边距，就像标题栏末端的无边框图标按钮（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。它的标签默认是 "Dismiss"。不要和 `BannerAction` 一起用：有按钮的横幅用 Dismiss 关闭。如果两者都有，raft-ui 会在开发环境中给出警告，并把操作放到单独一行，让它们永远不会占用 × 的位置。

## 变体 {#variants}

`status` 属性决定底色。每种意图对应一个图标。

| 变体                | 用于                                                               | 图标            |
| ---------------------- | --------------------------------------------------------------------- | --------------- |
| `status="info"`        | 信息和上限                                                | `Info`          |
| `status="warning"`     | 需要留意但可以恢复的情况，包括错误       | `TriangleAlert` |
| `status="destructive"` | 无法撤销的后果，通常出现在删除确认里 | `OctagonAlert`  |
| `status="success"`     | 某件事完成了或保存了                                          | `CircleCheck`   |

```example
banner/compositions/info
```

```example
banner/compositions/action-variants
```

窄于 480px 时（所有手机都是），按钮放到文字下方，靠末端：

```example
banner/compositions/narrow
```

没有按钮的横幅用 `BannerClose` 关闭：

```example
banner/compositions/close
```

- 出了问题时用 `status="warning"`；`destructive` 只用于无法撤销的后果（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
- raft-ui 还有一个用 `fill-muted` 的中性 `status="default"`。系统里的横幅总会表明一种意图，所以优先用上面四种之一。

### 尺寸 {#sizes}

`size` 只决定内边距和图标，从不决定字号：横幅的标题和描述在每个尺寸下都是 `text-callout`，手机上 14/20，桌面端 14/22（[字体排印](../../../../../design/foundations/typography.md#type-scale)）。

| 尺寸                  | 内边距（上下 × 左右） | 图标                    |
| --------------------- | --------------------- | ----------------------- |
| `size="sm"`           | 8px × 12px            | 16px，距文字 8px        |
| `size="md"`（默认）   | 12px × 14px           | 20px，距文字 10px       |
| `size="lg"`           | 14px × 16px           | 20px，距文字 10px       |

- 横幅的文字从不小于它按钮的文字。文字和按钮并排放着，而横幅的按钮只有一个尺寸，即 32px 的按钮，它的文字是 `text-control`（桌面端 14px，手机上 13px）。文字比按钮的文字小，按钮就显得比横幅大了一号，所以 `sm` 横幅只收紧内边距和图标，从不缩小文字。
- 有按钮的 `sm` 横幅让按钮离上下边缘各 4px，对齐最后一行文字的中线，所以文字上下各留 (32px − 一行) / 2 + 4px。

## 内容 {#content}

- 说明现在发生了什么，下一步该做什么（[写作](../../../../../design/content/writing.md)、[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。
- 把主题放在 `BannerTitle`，把后果放在 `BannerDescription`："This channel is shared with Acme" / "People and agents from Acme will see what you post here."
- 按钮标签写它做什么，用 Title Case：See Who、Retry、View Logs。

## 无障碍 {#accessibility}

- `status="destructive"` 时，`Banner` 渲染一个带 `role="alert"` 的 `div`，其他意图用 `role="status"`，这样不紧急的提示不会打断读屏软件。
- 图标重复表达意图，只起装饰作用。标题和描述必须用文字说出意图。
- `BannerClose` 的标签是 "Dismiss"；页面上有不止一样可关闭的东西时，传一个说明是哪条提示的 `aria-label`。
- `BannerClose` 不会移动焦点。横幅消失时，应用把焦点移到横幅原来位置之后的下一个元素；没有的话，移到页面的标题；不要让焦点落回文档本身。
- 各部分按阅读顺序排列：图标、标题、带链接的描述，然后是 `BannerAction`（先 Dismiss，再按钮）或 `BannerClose`。Tab 键按这个顺序经过它们。

## 规则 {#rules}

- 同一个位置最多显示一条横幅。
- 最多一个按钮，横幅可以关闭时再在前面加一个 Dismiss；而且只在确实有解决办法时才放按钮：32px 的墨色边框按钮（`variant="default" size="md"`）。不要用粉色按钮：横幅不是这个屏幕的主要操作。
- 把按钮放进 `BannerAction`，位于右下角，这样它排在它所作用的内容之后，并停在视线停下的地方，就像对话框的提交按钮。可以关闭又有按钮的横幅，把 Dismiss（`variant="ghost" size="md"`）放在按钮紧前面，同在一个 `BannerAction` 里。
- 只在没有按钮的横幅上用 `BannerClose`；不要把 × 放进 `BannerAction`，在那里它会被当成其中一个操作。
- 不要加墨色边框。横幅是浅色底，不是贴纸（[颜色](../../../../../design/foundations/color.md#soft-tints)）；它的边缘是容器圆角加一条细线。

## 面板里的提示 {#inside-a-panel}

某个面板里出了问题时（Agent 启动不了、频道设置没保存上），用 [Panel](../panel/panel.md) 里的 `PanelNotice`，不用 `Banner`。它是面板的一个区域，不是面板内容里的一张卡片：

- 把它直接放在面板标题栏下方，横跨面板的整个宽度。
- 不加圆角，不加细线。它上下各由一条接缝线（`line-seam`）封住；上面那条属于面板标题栏。
- 左右两边与面板的边距对齐（[间距](../../../../../design/foundations/spacing.md#layout-widths)）。
- 文字前面用意图对应的图标，和横幅一样（[变体](#variants)），不要用说明提示类别的状态灯。`PanelNotice` 保持图标的尺寸，并让它对齐第一行的中线（[引导文字的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。
- 在 `PanelNoticeContent` 里只写一条消息，最多 2 行（半粗体 `text-callout`）。
- 把操作放在 `PanelNoticeActions` 里，位于右侧，对齐第一行文字的中线：一个小图标按钮（Copy Details）或一个文字按钮（View Logs）。32px 的按钮不会让这一条变高。
- 需要修复的情况保留默认的 `status="warning"`；`destructive` 只用于无法撤销的情况。
