# Rail

桌面最左边的一级导航：顶上是工作区，中间是一级入口，底下是通知、帮助和设置。两个版本：只放图标（56 宽，默认）和图标加字（68 宽）。Raft Chat 的入口和顺序见《Raft Chat》。

## 结构
```html
<nav class="rf-rail" aria-label="Primary">   <!-- 图标加字：class="rf-rail rf-rail--labels" -->
  <div class="rf-rail__head"><button class="rf-rail__ws" type="button" aria-haspopup="menu" aria-label="Raft HQ, switch workspace"><span class="rf-avatar rf-avatar--ws">R</span></button></div>
  <a class="rf-rail__item" href="…"><span class="rf-rail__icon"><i class="rf-i rf-i-search"></i></span><span class="rf-rail__label">Search</span></a>
  <a class="rf-rail__item is-on" href="…" aria-current="page"><span class="rf-rail__icon"><i class="rf-i rf-i-message-square"></i></span><span class="rf-rail__label">Chat</span></a>
  <a class="rf-rail__item" href="…" aria-label="Activity, new"><span class="rf-rail__icon"><i class="rf-i rf-i-activity"></i><span class="rf-pixel rf-pixel--attention" aria-hidden="true"></span></span><span class="rf-rail__label">Activity</span></a>
  <!-- 其他入口同样写法 -->
  <span class="rf-rail__spacer"></span>
  <button class="rf-rail__item rf-rail__item--tool" type="button"><span class="rf-rail__icon"><i class="rf-i rf-i-bell"></i></span><span class="rf-rail__label">Notifications</span></button>
  <!-- Help（circle-help，aria-haspopup="menu"）、Settings（settings），同样带 rf-rail__item--tool -->
</nav>
```
两个版本用同一段结构，每一项都写名字。只放图标的版本把名字藏起来（读屏照样念，悬停时写进 tooltip）；图标加字的版本把它写在图标下面。挂了提醒点的项写 `aria-label`，把点也说出来。

## 两个版本
| 版本 | class | 宽 | 每一项 | 选中 |
| --- | --- | --- | --- | --- |
| 只放图标（默认） | `rf-rail` | 56，另加 1px 分区线 | 40×40，图标 20，两边各留 8；名字在右边的 tooltip（`rf-tooltip--right`）里 | 40×40 的框 |
| 图标加字 | `rf-rail rf-rail--labels` | 68，另加 1px 分区线 | 60×52（两边各留 4）：图标 20，下面是名字（`text-label` 10/12，选中 700） | 整个 60×52 的框，把图标和字一起包住 |

两个版本收窄的地方不一样：只放图标的收的是图标两边的黄（64 → 56）；图标加字的收的是字（11 → 10px）和框（64×56 → 60×52），Rail 从 76 收到 68。图标加字的版本里，底部的三个工具（通知、帮助、设置）仍然只放图标：Notifications 在图标下面写不下。

## 规则
- 顶上的头 56 高，和侧栏头、面板头的下沿对齐。只放图标的版本里，头是 56×56 的正方形（产品用测试钉住的规则：不管别的组件怎么改，这一格都是正方形）；图标加字的版本放不下正方形：它 68 宽，头还是 56 高——选这一版，就要一起改产品里钉住正方形的那条测试（leftrail-square-slot），这得产品负责人定。
- 工作区是一块墨底黄字的方块（`rf-avatar--ws`），点开切换工作区：列表贴着方块弹出，和手机的工作区列表是同一份。Rail 右沿是 `line-seam`。
- 选中是外框里的贴纸（`frame-active`，1.5px 墨边，图标和字是贴纸墨）：亮色的黄外框上是白贴纸，暗色的中性外框上是黄贴纸。
- 提醒点是图标右上的粉色像素，选中的那一项不挂点。
- 整条 Rail 只有一个节奏：项 40，项与项之间 6，离 Rail 的两端 8；有头时第一项离头的分区线 10。底部的通知、帮助、设置也是这个节奏，不另外包固定高度的格子。
- 网页版顶上有外框顶栏（见 ScreenDesktop）：这时 Rail 没有头，工作区在顶栏左边，第一个入口离顶栏的分区线 8。
- 桌面窗口矮于 600 时（最外层加 `rf-short`）：头收到 48，Rail 跟着收到 48 宽（两个版本都是正方形），每项 36，离两端 6；图标加字的版本这时把字藏起来。
