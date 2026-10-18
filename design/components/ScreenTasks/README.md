# ScreenTasks

Raft Chat 的任务页（一级页）：外框里是大标题 Tasks 和任务数；下面一条筛选；列表按状态分组。

## 结构
1. NavBar 一级页（带页名的版本）：没有工作区胶囊，所以没有导航行，大标题 Tasks 直接接在状态栏下面，下面一行 `12 channel tasks`。不放新建：全局任务页没有频道可以挂，任务从频道里建（频道的任务视图右上有一个墨线的 Create Task）。
2. 筛选条：Channel、Assignee、Creator（Select 的 `rf-filter`，生效的浅青带数量），最右边是 Board / List（SegmentedControl，手机上只留图标）。手机默认 List，选过的会记住。
3. 分组：Todo → In Progress → In Review → Done → Closed，每组标题能折叠、带数量，Done 和 Closed 默认收起；组里是 TaskCard。

## 规则
- “需要你”不是一个分组，也没有自己的颜色：等你批的事在动态里，对话里有一张 ActionCard。
- 卡上只有状态签能直接改；点卡片打开任务详情（手机上铺满，盖住 Tab 栏）。
- 桌面上任务页没有侧栏，看板直接接在 Rail 右边。
