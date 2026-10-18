# ScreenAgent

Raft Chat 的 agent 主页：push 进去的一页，盖住 Tab 栏。大号像素贴纸带着硬阴影慢慢漂浮——工作页里只有这一页用插画；再往下是它是谁、在哪儿运行、在做什么、记得什么。

## 结构
1. 英雄区：`--xl` 头像（倾斜 −4°，漂浮）、名字（34/40）、角色、`agent` 标签、运行时签、状态签，再加一句它的口头禅。
2. 两个按钮：Message（粉色）和 Assign a Task（墨线）。
3. 三格数字：Tasks done / Handoffs / Memories（数字 22/28，标签 12/16 `ink-3`）。
4. Working on：它手上的任务卡。
5. Remembers：`rf-list--inset` 里的 `rf-row--plain`，每行一件它记住的事。

桌面上，资料在主区旁边打开（≥1024 宽 380），同样的内容分到 Tabs 里（Profile / Workspace / Apps / Activity / Reminders），Activity 用 Timeline 的活动日志。

## 规则
- 硬阴影只在大头像上：它是插画，不是按钮。
- 口头禅只有一句话，不加 emoji。
