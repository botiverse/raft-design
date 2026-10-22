---
title: Toast
summary: 深色的浮动提示，确认人刚做的事情的结果，几秒后消失，可以提供 View 或 Undo。
sourceHash: aae44d8a
---

# Toast

轻提示是人刚做的事情的回执：消息已发送、设置已保存、Agent 完成了刚交给它的工作。它浮在页面上方的深色 HUD 上，说一句话，几秒后消失。它可以带一个文字操作，比如 View 或 Undo。

```example
toast/compositions/toast
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 人刚做的事情有了结果 | Toast |
| 可以就地撤销的操作 | 直接执行；轻提示何时提供 Undo，见[反馈](../../../../../design/patterns/feedback.md#confirming) |
| 整个服务器的状态 | [NotificationCenter](../notification-center/notification-center.md) |
| 别处发生的事情 | [ActivityInbox](../activity-inbox/activity-inbox.md) |
| 需要确认或决定的事情 | [Dialog](../dialog/dialog.md) |
| 操作前需要读的内容 | [Banner](../banner/banner.md) |

不要在轻提示里放人错过了就会困惑的内容（[选择组件](../../../../../design/components/overview.md#telling-people-something)）。

## 结构 {#anatomy}

- `ToastProvider`：持有轻提示管理器，默认渲染视口。在根部附近挂载一次。
- `toast`：默认管理器的命令式 API（`toast.success`、`toast.error`…）。
- `ToastViewport`：轻提示在屏幕上出现的位置。`ToastPositioner` 和 `ToastArrow` 则把轻提示锚定到某个元素上。
- `ToastRoot` 和 `ToastContent`：一条轻提示及其布局。
- `ToastIcon`：可选。谁做的（头像），没有「谁」时是意图对应的图标。不要用状态灯表示轻提示的意图：状态灯从不说明这是哪一类提示（成功、信息、警告、错误）。状态灯保留它自己的含义：Agent、人或计算机是否在工作或在线，任务的状态，以及标出有事等待或未读的方形提醒圆点；讲的是其中某件事的提示，仍然可以在里面显示那件事的状态灯（[Status](../status/status.md#sizes)）。
- `ToastBody`，包含 `ToastTitle`（必需）和可选的 `ToastDescription`，两者都用 `text-callout`（[字体排印](../../../../../design/foundations/typography.md#type-scale)）：手机上 14/20，桌面端 14/22，和横幅一样。`ToastIcon` 高一行这种文字，所以图标留在标题那一行：一个 16px 的图标，居中在一个 20px 的列里，距标题 12px，头像也一样（[文字前的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。
- `ToastActions`：可选，包含一个 `ToastAction` 和 `ToastClose`。
- `ToastProgress`：可选的一条线，显示关闭前剩余的时间。

不需要的部件直接不放，不要渲染成空的。

## 变体 {#variants}

意图决定 `ToastIcon` 里的图标，和同一意图的横幅开头用的图标相同（[Banner](../banner/banner.md#variants)）。轻提示是关于某个人的时候，改为在那里显示他们的头像。

| 意图 | 用于 | `ToastIcon` 里放 |
| --- | --- | --- |
| 某个人或 Agent 做的 | "Bugen finished reviewing #25." | 他们的头像 |
| `success` | 某件事完成或已保存 | `CircleCheck` |
| `warning`、`error` | 出了问题。`error` 以更高的优先级播报 | `TriangleAlert` |
| `info` | 中性的结果，比如 "3 links copied." | `Info` |
| 作为任务发送的消息 | "Sent to #design as a task." | 任务自己的状态：待办（`TaskStatusIcon`） |

使用 `toast` 命令式 API 时，把头像作为 `leading` 传入。它替代 `ToastIcon` 里的图标，并对辅助技术隐藏。

```example
toast/compositions/person
```

## 行为 {#behavior}

- 轻提示在 provider 的 `timeout` 之后自动关闭；悬停或聚焦时计时暂停。
- 人可以滑走轻提示，或用 `ToastClose` 关闭它。
- 叠放的轻提示默认出现在底部居中。锚定的轻提示在触发它的控件旁边打开。

## 内容 {#content}

- 写一句话：谁、做了什么、结果如何。更多内容放在 `ToastDescription` 里，用 `foreground-on-hud-muted`。
- 操作的标签写 View 或 Undo，或其他 Title Case 的动词。
- ID、数量和时间用 Space Mono（[字体排印](../../../../../design/foundations/typography.md)）。

## 无障碍 {#accessibility}

Toast 封装了 Base UI 的 Toast，它在实时区域（live region）里播报每条轻提示，并在获得焦点时保持打开。

- 让 `ToastTitle` 承载完整的意思。`ToastIcon` 里的图标对辅助技术隐藏，`ToastProgress` 也是。
- 用 `aria-hidden` 隐藏 `ToastIcon` 里的头像；名字已经在文字里了。命令式 API 的 `leading` 会自动这样做。
- 给显示加载状态的 `ToastAction` 传入 `loadingLabel`，让它的加载指示器说明在等什么。

## 规则 {#rules}

- 同一时间最多显示一条轻提示。
- 每条轻提示都用 `layer-hud`，文字用 `foreground-on-hud`。不要用意图颜色给轻提示着色，也绝不用黄色：提示是中性的（[颜色](../../../../../design/foundations/color.md#principles)）。
- 操作做成悬停时带下划线的粗体文字操作（`ToastAction`），绝不做成按钮。轻提示里绝不放彩色按钮。
- 除关闭外，一条轻提示最多一个操作。
