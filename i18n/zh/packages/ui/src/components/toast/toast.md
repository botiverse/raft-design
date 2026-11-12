---
title: Toast
summary: 深色的浮动提示，确认人刚做的事情的结果，几秒后消失，可以提供 View 或 Undo。
sourceHash: b0d02be7
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

- `ToastProvider`：持有轻提示管理器，默认渲染视口。在根部附近挂载一次：默认管理器（`toast.*`）的时长（`timeout`、`actionTimeout`）取自使用它的那一个 provider，两个 provider 共用默认管理器会互相覆盖。第二个 provider 请给它自己的 `toastManager`。
- `toast`：默认管理器的命令式 API（`toast.success`、`toast.error`…）。
- `ToastViewport`：轻提示在屏幕上出现的位置。`ToastPositioner` 和 `ToastArrow` 则把轻提示锚定到某个元素上。
- `ToastRoot` 和 `ToastContent`：一条轻提示及其布局。
- `ToastIcon`：可选。谁做的（头像），没有「谁」时是意图对应的图标。不要用状态灯表示轻提示的意图：状态灯从不说明这是哪一类提示（成功、信息、警告、错误）。状态灯保留它自己的含义：Agent、人或计算机是否在工作或在线，任务的状态，以及标出有事等待或未读的方形提醒圆点；讲的是其中某件事的提示，仍然可以在里面显示那件事的状态灯（[Status](../status/status.md#sizes)）。
- `ToastBody`，包含 `ToastTitle`（必需）和可选的 `ToastDescription`，两者都用 `text-callout`（[字体排印](../../../../../design/foundations/typography.md#type-scale)）：手机上 14/20，桌面端 14/22，和横幅一样。`ToastIcon` 高一行这种文字，所以图标留在标题那一行：一个 16px 的图标，居中在一个 20px 的列里，距标题 12px，头像也一样（[文字前的标记](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)）。
- `ToastActions`：可选，包含一个 `ToastAction`。`ToastClose`（Dismiss）只用于不会自己关闭的轻提示，Raft 不用；命令 API 只有在 `dismissible: true` 时才显示它。
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

使用 `toast` 命令式 API 时，把头像作为 `leading` 传入。它替代 `ToastIcon` 里的图标，并对辅助技术隐藏。

```example
toast/compositions/person
```

## 行为 {#behavior}

- 轻提示自己关闭：默认 5 秒后（provider 的 `timeout`）；带操作或是 `error` 时 8 秒后（`actionTimeout`），留出读完再操作的时间。`toast` 命令 API 会自动用 `actionTimeout`；自己的管理器要给这类轻提示传 `timeout: 8000`。悬停、聚焦或按住时计时暂停。
- 人可以滑走轻提示，或在它有焦点时按 Esc（F6 把焦点移到轻提示）。没有 Dismiss：每条都会自己关闭，Undo 旁边再放一个文字操作会读成第二个选择。
- 按下轻提示的操作会关闭轻提示，焦点不能跟着它一起消失：从键盘按下时（F6，然后 Enter），焦点会落在空处。把焦点移到操作带回来的东西上：删除后按 Undo，焦点移到重新出现的那一项上，在它画出来的位置。那一项还没画出来时，焦点在将要放它的区域上等着，它一出现就移到它上面；屏幕上没有任何地方画它时，焦点留在那个区域上。用鼠标指针按下操作时也同样移动焦点，因为轻提示的按钮拿走了焦点，又随轻提示一起消失；焦点环只在键盘输入之后显示，所以用指针按下时不显示。永远不要把焦点留在 body 上或轻提示原来的位置上；这个人自己移动过焦点之后，就让焦点留在他放的地方（Kirby，2026-11-06，#proj-workspace:#200）。键盘输入之后，区域显示焦点环，和列表项的一样画在边缘以内（[状态](../../../../../design/foundations/states.md#focus)）；子元素有背景的区域，把它画成向内偏移的 2px outline（`keyboard:focus-visible:outline-2 keyboard:focus-visible:outline-solid keyboard:focus-visible:-outline-offset-2`），因为子元素会盖住内阴影。要写明 `outline-solid`：静止时设了 `outline-none` 的区域，outline 样式是 none，只写 `outline-2` 仍然是 none，什么也画不出来（slock #13342）。
- 同一时间只显示一条（`limit`，默认 1）。新的一条立即替换屏幕上的那条，被替换的直接关闭，不排队：新的消失后旧的不会回来。
- 锚定的轻提示在触发它的控件旁边打开（`ToastPositioner`）。

### 出现在哪里 {#where-it-appears}

轻提示出现在底部居中（`viewportPlacement="bottom-center"`）。桌面上就是窗口底部（stdrc 2026-10-23 定）。手机上它停在占住页面底部的东西上方：会话页的输入框、一级页面的底栏，以及键盘弹起时的键盘。只有应用知道这些在哪，所以由应用把 `--toast-viewport-bottom` 设成从窗口底边到那个东西上沿的距离（写在 `:root` 上或用 `viewportClassName`），并在输入框变高、键盘弹起时更新。轻提示的下沿在它上方 16px，且不会低于系统 Home 指示条上方 16px（`env(safe-area-inset-bottom)`），所以变量没设时在手机上也不会压到它。

没有顶栏的地方（手机，768px 以下的网页），说明有新版本的横幅占据同一个位置，在消息输入框或标签栏上方，一直留着，直到这个人选择 Dismiss 或 Update；轻提示叠在它上方，所以它从不盖住轻提示，轻提示也从不盖住它（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。

轻提示显示期间不跟着页面往下移（artin 2026-11-07 提）。页面在它下面换了（另一页的底栏更矮，或页面还在加载、底部还没有东西）时，应用保留它出现以来见过的最高的页面底部边沿（输入框、底栏），直到最后一条轻提示消失；底部出现更高的东西时它往上让，所以不会盖住输入框。键盘不算在内。键盘弹起期间，轻提示跟着实时的边沿走（输入框是被键盘顶上去的），这段时间量到的值不计入保留值。键盘收起后，它回到保留的高度。Raft App 也是这样（`RaftToastHost`）。

```css
:root {
  --toast-viewport-bottom: 72px; /* 输入框的上沿 */
}
```

```example
toast/compositions/above-composer
```

底部被轻提示不能遮挡的东西占住的界面，可以改传 `viewportPlacement="top-center"`；这时应用把 `--toast-viewport-top` 设成标题栏结束的位置，轻提示在它下方 16px，且不会高于状态栏下方 16px（`env(safe-area-inset-top)`）。

轻提示从哪来就往哪滑走：在底部往下或往右滑，在顶部往上滑。`ToastRoot` 从它的 `ToastViewport` 取方向；要改就传 `swipeDirection`。

模态对话框、底部面板或图片查看器打开时，只显示它引起、且不会关掉它的轻提示，不带操作。轻提示画在对话框、图片查看器和它们的遮罩上方（[层叠顺序](../../../../../design/foundations/elevation.md#layer-order)）。

## 内容 {#content}

- 写一句话：谁、做了什么、结果如何。更多内容放在 `ToastDescription` 里，用 `foreground-on-hud-muted`。
- 操作的标签写 View 或 Undo，或其他用 sentence case 写的动词。
- ID、数量和时间用 Space Mono（[字体排印](../../../../../design/foundations/typography.md)）。

## 无障碍 {#accessibility}

Toast 封装了 Base UI 的 Toast，它在实时区域（live region）里播报每条轻提示，并在获得焦点时保持打开。

- 让 `ToastTitle` 承载完整的意思。`ToastIcon` 里的图标对辅助技术隐藏，`ToastProgress` 也是。
- 用 `aria-hidden` 隐藏 `ToastIcon` 里的头像；名字已经在文字里了。命令式 API 的 `leading` 会自动这样做。
- 给显示加载状态的 `ToastAction` 传入 `loadingLabel`，让它的加载指示器说明在等什么。

## 规则 {#rules}

- 同一时间最多显示一条轻提示；新的一条替换它。
- 每条轻提示都用 `layer-hud`，文字用 `foreground-on-hud`。不要用意图颜色给轻提示着色，也绝不用黄色：提示是中性的（[颜色](../../../../../design/foundations/color.md#principles)）。
- 操作做成悬停时带下划线的粗体文字操作（`ToastAction`），绝不做成按钮。轻提示里绝不放彩色按钮。
- 除关闭外，一条轻提示最多一个操作。
