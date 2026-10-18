# ScreenSettings

Raft Chat 的设置页：一级页 Settings 在黄色外框里，下面按 Personal / Workspace / Resources 分组；进到 Notifications 是二级页，盖住 Tab 栏。

## 结构
1. Settings（一级页）：外框里是大标题 Settings，没有导航行。最上面是自己（头像、名字、邮箱，点进去是 Account）；下面是三组 `rf-list--inset`——Personal（Account、Language & Region、Appearance、Notifications）、Workspace（Server Profile、Computers、AI Providers、Plan & Billing…）、Resources（Documentation、Feedback、Release Notes）。行右边是当前值和箭头；Feedback 有新回复时带数字，Tab 上的 Settings 挂提醒点。
2. Notifications（二级页）：`rf-header` 加返回（顶栏白底、黄底两版待定，见 NavBar），没有 Tab 栏；Radio 选通知范围，开关管 agent 的几类通知，Select 定免打扰时段，最后一行写例外。

## 规则
- 立即生效：开关、单选、下拉改了就存，不放保存按钮。
- 退出登录在 Account 里。删除工作区、删除账号放在那一页最下面的危险区，用红色按钮，再加一个“输入名字确认”的对话框。
- 设置项的说明写后果（Off: a person approves every merge），不重复标题。
- 桌面上 Settings 在侧栏里列同样的分组，默认打开 Account。
