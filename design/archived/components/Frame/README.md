# Frame

外框：手机的顶栏和桌面端的 Rail 是 App 的品牌边，铺满官网顶栏那条粗野的黄（`frame`），下面压一条 2px 墨线（`border-frame` + `frame-rule`）。内容区保持安静。

## 为什么外框可以大声

人不会“读”外框：它在视野边缘，每屏都在，只负责告诉你“这是 Raft、你在哪儿”。把音量花在不需要阅读的地方，几乎不增加认知负担，却换来全时在线的品牌感。彩色顶栏在主流 App 里也很常见，用户不需要学习。

## 手机顶栏 `rf-frame`

```html
<header class="rf-frame">
  <div class="rf-phone__status">…</div>          <!-- 状态栏一起染黄 -->
  <div class="rf-nav">…</div>                     <!-- 导航按钮、标题 -->
  <div class="rf-largetitle">Home</div>           <!-- 一级页：大标题也在框里 -->
</header>
```

- 一级页（Home、Tasks、Agents）：状态栏 + 导航行 + 大标题都在框里。二级页（频道、agent 主页）：只放状态栏 + 导航行。
- 框里的文字和图标用 `on-frame`，副标题用 `on-frame-2`。手机顶栏里的工作区切换（`rf-mark-tile`）在亮色下是白色贴纸（`sticker-paper`），暗色下是黄色。
- 粉色主按钮（新建）可以放在框里：黄底上的粉色贴纸，靠墨线分开。

## 桌面 Rail `rf-rail`

```html
<nav class="rf-rail">
  <span class="rf-rail__mark" role="img" aria-label="Raft"></span>   <!-- mark 直接放在黄上，不加底块 -->
  <a class="rf-rail__item is-on"><span class="rf-rail__icon"><i class="rf-i rf-i-house"></i></span>Home</a>
  …
  <span class="rf-rail__spacer"></span>
  <a class="rf-rail__item"><span class="rf-rail__icon"><i class="rf-i rf-i-settings"></i></span>Settings</a>
</nav>
```

- 76px 宽，右侧 2px `frame-rule`。每项是图标 + 11px 标签，有事等你时挂一个 `rf-pixel--attention`。
- **选中项是一张贴纸**：亮色是白贴纸（`frame-active` = `sticker-paper`，加 1.5px `frame-active-edge` 墨线），暗色是黄贴纸。和纸面上的黄色选中（侧栏行、分段控件）是同一种“色块 + 墨线”，三种方案的对比见 Decisions › RailSelected。

## 暗色模式

外框变成官网页脚：墨底（`#0c0a0a`）、黄字、黄色分界线。整条黄色在暗色下会是全屏最亮的东西，和暗色模式降低亮度的初衷相反。如果团队坚持暗色也要整条黄，把 `frame` 的 dark 值改成 `{yellow}`、`on-frame` 改成 `{sticker-ink}` 即可。

## 规则

- 外框只有一个：手机是顶栏，桌面是 Rail。底部 Tab 栏不染黄（上下都黄就成了海报）。
- 引导页可以整屏黄（品牌时刻），工作页只有外框黄。
- 外框里不放内容：没有消息、没有卡片，只放导航和标题。
