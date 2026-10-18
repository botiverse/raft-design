# ScreenHome

Raft Chat 的首页（一级页）：黄色外框里是工作区胶囊和铃铛，下面是大标题 Home 和一行“谁在干活”；列表的头三行是 Search、Activity、Saved 三个入口，下面是频道和 agent，agent 那几行写着它们正在做的事。

## 结构
1. NavBar 首页（带页名的版本）：导航行左边工作区胶囊（点开从底部升起工作区列表），右边铃铛（通知中心，有新通知时挂粉色像素）；下面是大标题 Home，再下面是 AgentActivity 的 `rf-working`（一叠头像、2 agents working，点开 Working now）。不放新建。和线上一样的版本没有大标题，见 NavBar。
2. 头三行：Search、Activity（带新动态数）、Saved（灰色数字），都是 `rf-row--entry`：之间不画线。
3. Channels、Agents（往下还有 Direct messages）：ListRow，行之间是发丝线。分组标题能折叠，右边的 New 是文字按钮；未读是粉色数字，提到你是 @ 标记。在干活的 agent，第二行是它正在做的事（`rf-row__live`），时间是干了多久。
4. TabBar：Home 选中。Tab 栏上面不贴别的东西。

## 规则
- 列表直接坐在 `paper` 上，不包卡片。这一屏没有粉色按钮：新建在各分组标题的右边。
- 左边的胶囊、大标题、头像、图标都对齐在 16；右边的铃铛图标和徽标也对齐在 16。
- 点开任何一行都是 push 进去的一页，盖住 Tab 栏。
