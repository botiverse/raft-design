# TabBar

手机底部的一级入口，只出现在一级页上；选中项的图标坐在一张只包住图标的黄贴纸里。Raft Chat 放 Home / Tasks / Members / Settings（入口见《Raft Chat》）。

## 结构
```html
<nav class="rf-tabbar" aria-label="Primary">
  <a class="rf-tab is-on" href="…" aria-current="page"><span class="rf-tab__icon"><i class="rf-i rf-i-house"></i></span>Home</a>
  <a class="rf-tab" href="…"><span class="rf-tab__icon"><i class="rf-i rf-i-square-check-big"></i></span>Tasks</a>
  <a class="rf-tab" href="…"><span class="rf-tab__icon"><i class="rf-i rf-i-users"></i></span>Members</a>
  <a class="rf-tab" href="…" aria-label="Settings, new replies to your feedback"><span class="rf-tab__icon"><i class="rf-i rf-i-settings"></i><span class="rf-pixel rf-pixel--attention" aria-hidden="true"></span></span>Settings</a>
</nav>
```

## 规则
- 只在一级页。push 进去的页面盖住 Tab 栏，左上角是返回；要换 Tab，先回到一级页。点任何一个 Tab 都回到它的一级页，不记子页。最多 5 个入口。
- `surface` 底，上沿 `line-seam`，84 高（含安全区）。图标 22，标签 `text-label`（10/12 600）；没选中的 `ink-3`，选中的 `ink` 700，图标贴纸 56×30。
- 选中只把图标包进黄贴纸；产品是整格变黄，这是有意的不同（见《取舍》）。
- 提醒点是图标右上的粉色像素，选中的那一项不挂。哪些入口挂点由产品定；Raft Chat 只在 Settings 上挂（反馈有了新回复），其他新东西在页面里说。
- Tab 栏上面不贴别的东西。谁在干活写在页面里（见 AgentActivity）。
