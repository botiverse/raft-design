---
title: AnnouncementDialog
summary: 告诉人们产品里有了新东西的对话框：一个小标签、一个标题、一张可选的图片、几行文字，以及一个去试试的操作。
sourceHash: 786959a4
---

# AnnouncementDialog

公告对话框只向人们介绍一次产品里的新东西：一个小标签、一个标题、一张可选的图片、几行文字，以及一个把人带过去的操作。它是布局固定的 [Dialog](../dialog/dialog.md)，所以有对话框的遮罩、Esc 和焦点处理。它从 `@botiverse/raft-ui/wip` 导出，API 在任何版本中都可能变化。

```example
dialog/compositions/announcement
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 人们应该知道一次的新功能，附带一个去试试的操作 | AnnouncementDialog |
| 整个服务器的状态：计算机离线、配额、更新 | 通知中心（[NotificationCenter](../notification-center/notification-center.md)） |
| 这个人刚刚做的事情的结果 | [Toast](../toast/toast.md) |
| 人们继续之前必须做的决定 | [Dialog](../dialog/dialog.md) 或 [AlertDialog](../alert-dialog/alert-dialog.md) |
| 在对话框或表单里，人们操作前必须读的内容 | [Banner](../banner/banner.md) |

怎样告诉人们一件事，完整的选择见[选择组件](../../../../../design/components/overview.md#telling-people-something)。

## 结构 {#anatomy}

- `AnnouncementDialog`：根部件，与 `Dialog` 相同。掌管打开状态。必需。
- `AnnouncementDialogTrigger`：人们自己打开它时用的按钮。
- `AnnouncementDialogContent`：居中的表面，背后是遮罩。必需。
- `AnnouncementDialogBody`：页脚以上的全部内容。内容高于窗口的 70% 时可以滚动。必需。
  - `AnnouncementDialogHeader`：放标签和关闭按钮的一行。
  - `AnnouncementDialogLabel`：一个简短的标签，用 `text-caption` 和 `foreground-muted`，前面有一个自动画出的提醒圆点。
  - `AnnouncementDialogClose`：× 图标按钮。它就是 `DialogClose`。
  - `AnnouncementDialogTitle`：标题，用 `text-headline`。必需。
  - `AnnouncementDialogPicture`：功能的图片，放在 `fill-muted` 上，带细线和 `radius-container`。里面的图片完整显示，不裁切。可选。
  - `AnnouncementDialogText`：正文，用 `text-subhead` 和 `foreground-muted`。可以放段落、列表和标题。
- `AnnouncementDialogFooter`：操作区，上方没有线。
  - `AnnouncementDialogSecondaryAction`：关闭这条公告的无边框按钮，因为对话框自己画出了边（[Button](../button/button.md#which-color)）。可选。
  - `AnnouncementDialogAction`：粉色的操作，放在页脚末尾。必需。

## 行为 {#behavior}

- 打开时，焦点落在 `AnnouncementDialogAction` 上，而不是关闭按钮，这样按 Enter 就能去到这个功能。传入 `initialFocus` 可以改变它。
- 对话框窄于 448px 时，页脚的按钮上下堆叠，每个占满整个宽度。
- 长标题、标签和按钮文字会换行，不会被截断。
- Esc 和 × 关闭对话框。两个操作本身不会关闭它：每个操作调用自己的处理函数，由调用方在其中关闭对话框。

## 内容 {#content}

- 标签写公告的类型，用 sentence case：What's new。
- 标题写人们现在能做什么，用 sentence case：Work together across servers。
- 操作要说明它通向哪里，用 Title Case：Create Joint Channel（[写作](../../../../../design/content/writing.md#casing)）。
- 次要操作写成一句确认，比如 Got It。主操作和 × 已经够用时，就不要它。

## 无障碍 {#accessibility}

- AnnouncementDialog 就是 Base UI 的 Dialog，经由 [Dialog](../dialog/dialog.md#accessibility) 提供。它提供 `dialog` 角色、焦点陷阱、Esc 和焦点返回。
- `AnnouncementDialogTitle` 为对话框命名。每条公告都需要标题。
- 给 `AnnouncementDialogClose` 一个说明它关闭什么的 `aria-label`：Close Update。
- 标签里的提醒圆点对辅助技术隐藏。
- 给图片提供替代文字；如果文字已经说了同样的内容，就把图片隐藏。

## 规则 {#rules}

- 只用一个 `AnnouncementDialogAction`。它是这个屏幕上唯一的粉色按钮（[Button](../button/button.md#which-color)）。
- 不要在里面放表单。功能需要输入时，从操作打开它的表单。
