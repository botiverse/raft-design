# NavBar

手机顶栏。一级页有两个版本：带页名（默认），外框里写大标题；和线上一样，首页只有工作区胶囊、正在干活的那叠头像和铃铛。push 进去的二级页有白底、黄底两版，待定。点工作区胶囊，从底部升起工作区列表。

## 结构
```html
<!-- 一级页 · 带页名：首页。胶囊和铃铛一行，下面是大标题，再下面一行写谁在干活 -->
<header class="rf-frame">
  <div class="rf-phone__status">…</div>
  <div class="rf-nav">
    <button class="rf-ws rf-ws--pill" type="button" aria-haspopup="dialog"><span class="rf-ws__name">Raft HQ</span><i class="rf-i rf-i-chevron-down"></i></button>
    <div class="rf-nav__actions"><button class="rf-iconbtn" type="button" aria-label="Notifications, 2 new"><i class="rf-i rf-i-bell"></i><span class="rf-pixel rf-pixel--attention" aria-hidden="true"></span></button></div>
  </div>
  <div class="rf-largetitle">
    <h1 class="rf-largetitle__name">Home</h1>
    <button class="rf-working" type="button" aria-haspopup="dialog"><span class="rf-stack" aria-hidden="true">…头像…</span>2 agents working<i class="rf-i rf-i-chevron-right"></i></button>
  </div>
</header>

<!-- 一级页 · 带页名：其他一级页。没有导航行，大标题直接接在状态栏下面 -->
<header class="rf-frame">
  <div class="rf-phone__status">…</div>
  <div class="rf-largetitle"><h1 class="rf-largetitle__name">Tasks</h1><p class="rf-largetitle__sub">12 channel tasks</p></div>
</header>

<!-- 一级页 · 和线上一样：首页的导航行是胶囊、那叠头像加人数、铃铛；其他一级页把页名写在导航行里 -->
<div class="rf-nav"><div class="rf-nav__title"><div class="rf-nav__text"><h1 class="rf-nav__name">Tasks</h1><div class="rf-nav__sub">12 channel tasks</div></div></div></div>

<!-- 二级页：白底用 rf-header，黄底用 rf-frame，里面一样 -->
<header class="rf-header">
  <div class="rf-phone__status">…</div>
  <div class="rf-nav">
    <button class="rf-iconbtn" type="button" aria-label="Back"><i class="rf-i rf-i-arrow-left"></i></button>
    <div class="rf-nav__title"><span class="rf-chan rf-chan--sm rf-chan--here"><i class="rf-i rf-i-hash"></i></span><div class="rf-nav__text"><h1 class="rf-nav__name">launch-week</h1><div class="rf-nav__sub"><span class="rf-stack" aria-hidden="true">…</span>2 agents working · 5 members</div></div></div>
    <div class="rf-nav__actions"><button class="rf-iconbtn" type="button" aria-label="Channel details"><i class="rf-i rf-i-ellipsis"></i></button></div>
  </div>
</header>
```

## 一级页的两个版本
| 版本 | 首页 | 其他一级页 | 为什么选它 |
| --- | --- | --- | --- |
| 带页名（默认） | 一行胶囊和铃铛，下面是大标题 Home，再下面一行谁在干活 | 没有导航行，大标题直接接在状态栏下面，可以带一行副标题 | 每个一级页都说出自己是哪一页；没东西放的那一行不留空白 |
| 和线上一样 | 只有工作区胶囊、那叠头像加人数、铃铛，不写页名 | 页名写在导航行里（17/22），可以带一行副标题 | 和产品现在完全一致（产品的决定：“只显示一个 Server Name”） |

## 二级页的两个版本（待定）
| 版本 | 样子 |
| --- | --- |
| 白底 `rf-header` | push 进去的页面是内容，顶栏和内容一样白；位置块是黄贴纸 |
| 黄底 `rf-frame` | 和一级页一样铺外框的黄，一路进去都是黄色顶栏；位置块在黄底上换成白贴纸（`frame-active`，和 Rail 的选中一样），暗色里是黄贴纸 |

二级页标题旁放什么：一个地方（Raft Chat 的频道）放位置块 `rf-chan--here`；一个人（私信）放对方的头像（`--sm`）；其他页不放，副标题写它属于哪里（线程写在哪个频道）。右边最多两个图标按钮。

## 切换工作区
- 点胶囊，从底部升起一张列表（Sheet 的 `rf-sheet`，标题 Workspaces），不在胶囊下面弹一个框。每行是工作区方块、名字、未读数，当前的打勾；长按拖动排序。最下面是 Invite People 和 Create or Join a Workspace，和产品的切换菜单同样几项。
- 和产品的底部弹层一样，不铺遮罩。桌面上点 Rail 顶上的方块，是同一份列表，贴着方块弹出。

## 规则
- 大标题是 `text-display`（34/40 700），一屏只有一个，往左挪 0.05em，让首字母的竖笔落在 16 那条线上；列表往上滚时，它收进 56 高的顶栏，变成 17/22 的页名。
- 左右对齐照《基础》的“对齐”：胶囊、大标题、那叠头像、列表的图标在左边 16；两头的图标按钮——左边的返回，右边的铃铛、⋯——互为镜像，都离屏幕边 3px。返回用 `arrow-left`：它的墨和别的图标一样铺满图标框，不用单独挪。
- 工作区胶囊只在首页：墨底黄字、斜 2°。其他一级页不放工作区名，也不放页面图标。没有胶囊、也没有图标按钮的一级页，不画导航行。
- 铃铛是通知中心的入口，有新通知时挂粉色像素；放在哪一页由产品定（Raft Chat 只在首页右上）。一级页的顶栏不放新建、不放搜索。
- 谁在干活写在大标题下面（`rf-working`：一叠头像、几个人、箭头），点开是 Working now；没有人在干活时这一行收起来。见 AgentActivity。
- 外框里的字和图标用 `on-frame`，副标题用 `on-frame-2`，按下叠 `frame-pressed`；暗色外框是中性的 `#0d0d0b`。
- 导航行 56 高，外框下沿 `line-seam`。副标题先写“活着的”信息（2 agents working），再写成员数；标题太长就截断。
- 二级页的 ⋯ 打开频道详情，在手机上是一整页（Sheet 的抽屉）。
