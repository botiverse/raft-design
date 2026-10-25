---
title: AlertDialog
summary: 一个居中的小对话框，在执行不可撤销或会打断工作的操作前请人确认；确认按钮的颜色表示后果。
sourceHash: f1ff7cfa
---

# AlertDialog

警示对话框在操作执行前请人确认，用于不可撤销的操作（删除）或会打断工作的操作（停止、重置）。它是遮罩上一个 400px 宽的对话框，包含标题、一句说明会发生什么的话、Cancel 按钮和确认按钮；确认按钮的颜色表明后果。

```example
alert-dialog/compositions/confirm-action
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 不可撤销的操作：删除一条消息、一个 Agent、一个服务器 | AlertDialog，红色 |
| 会打断但可以恢复的操作：停止 Agent、重置会话、退出频道 | AlertDialog，橙色 |
| 可以就地撤回的操作 | 不用对话框：直接执行；何时由 [Toast](../toast/toast.md) 提供 Undo，见[反馈](../../../../../design/patterns/feedback.md#confirming) |
| 需要的不只是输入名称的决定 | [Dialog](../dialog/dialog.md) |

## 结构 {#anatomy}

- `AlertDialog`：根节点。必需。
- `AlertDialogTrigger`：打开它的按钮。通常对话框是从菜单项打开的。
- `AlertDialogContent`：居中的表面，最宽 400px，与 `size="sm"` 的 [Dialog](../dialog/dialog.md#variants) 同宽，所以所有确认框都是一个宽度；背后是遮罩（`AlertDialogOverlay`）。必需。
- `AlertDialogHeader`：标题行，可带一个 `AlertDialogClose`（×）。
- `AlertDialogTitle`：标题。必需。
- `AlertDialogBody` 和 `AlertDialogDescription`：会发生什么。
- `AlertDialogFooter`：靠末端排成一行的按钮，Cancel 在前、提交按钮在后，手机上和桌面端一样。只有一行放不下时，它们才叠成通栏，提交按钮在上，Cancel 加上边框，和 [Dialog](../dialog/dialog.md#the-footer) 一样。
- `AlertDialogCancel`：关闭对话框的幽灵按钮；按钮叠放时加上边框。必需。
- `AlertDialogAction`：确认按钮。它是一个 Button，自己不会关闭对话框：操作完成后再关闭。
- `AlertDialogPortal`：底层部件。

## 变体 {#variants}

确认按钮的颜色说明会发生什么：

| 后果 | 确认按钮 | 示例 |
| --- | --- | --- |
| 执行某件事 | `variant="primary"` | Make Public |
| 会打断，但可以恢复 | `variant="warning"` | Stop |
| 不可撤销 | `variant="danger"`，正文里放一个 `status="destructive"` 的 [Banner](../banner/banner.md) | Delete Agent |

删除大的东西，比如一个 Agent 或一个服务器，还要求输入它的名称（[表单](../../../../../design/patterns/forms.md#danger-zone)）：

```example
alert-dialog/compositions/typed-delete
```

## 行为 {#behavior}

- 它在遮罩上出现和消失，没有动画，和所有居中对话框一样（[Dialog](../dialog/dialog.md#behavior)）。
- Esc 和 Cancel 关闭它，不执行操作。

## 内容 {#content}

- 标题写操作和操作对象，用问句：Delete Box?
- 用一两句平实的话说明会发生什么："Box leaves every channel."
- 确认按钮的标签用标题里的动词：Stop Wug? 对应 Stop。不可撤销时，在红色按钮上保留对象：Delete Agent。另一个按钮写 Cancel（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- AlertDialog 封装了 Base UI 的 Dialog，并设置 `alertdialog` 角色，所以读屏软件会把它当作一次打断来播报。焦点锁定、Esc 和焦点归还由 Base UI 提供。
- `AlertDialogTitle` 是无障碍名称，`AlertDialogDescription` 是描述。把后果写在 `AlertDialogDescription` 里，这样它会和标题一起被读出。
- `AlertDialogClose` 的 × 标签为 "Close"。

## 规则 {#rules}

- Cancel 放左边，确认按钮放右边，不放其他按钮。
- 打开对话框的菜单项不要上色：颜色由确认按钮来承担（[反馈](../../../../../design/patterns/feedback.md#confirming)）。
