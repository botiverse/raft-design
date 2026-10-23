---
title: Toast
summary: 深色的浮动提示，确认人刚做的事情的结果，几秒后消失，可以提供 View 或 Undo。
sourceHash: 17990d20
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
- 同一时间只显示一条（`limit`，默认 1）。新的一条立即替换屏幕上的那条，被替换的直接关闭，不排队：新的消失后旧的不会回来。
- 锚定的轻提示在触发它的控件旁边打开（`ToastPositioner`）。

### 出现在哪里 {#where-it-appears}

轻提示出现在底部居中（`viewportPlacement="bottom-center"`）。桌面上就是窗口底部（stdrc 2026-10-23 定）。手机上它停在占住页面底部的东西上方：会话页的输入框、一级页面的底栏，以及键盘弹起时的键盘。只有应用知道这些在哪，所以由应用把 `--toast-viewport-bottom` 设成从窗口底边到那个东西上沿的距离（写在 `:root` 上或用 `viewportClassName`），并在输入框变高、键盘弹起时更新。轻提示的下沿在它上方 16px，且不会低于系统 Home 指示条上方 16px（`env(safe-area-inset-bottom)`），所以变量没设时在手机上也不会压到它。

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

模态对话框或底部面板打开时，只显示它引起、且不会关掉它的轻提示，不带操作。轻提示本来就画在对话框和遮罩上方。

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

- 同一时间最多显示一条轻提示；新的一条替换它。
- 每条轻提示都用 `layer-hud`，文字用 `foreground-on-hud`。不要用意图颜色给轻提示着色，也绝不用黄色：提示是中性的（[颜色](../../../../../design/foundations/color.md#principles)）。
- 操作做成悬停时带下划线的粗体文字操作（`ToastAction`），绝不做成按钮。轻提示里绝不放彩色按钮。
- 除关闭外，一条轻提示最多一个操作。
