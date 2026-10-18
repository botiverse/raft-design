# Panel

桌面面板：主区的每一列都用同一种面板头（56 高、白底、下沿分区线），下面是内容。频道面板头下面是 Chat / Tasks / Files 分页；线程面板最上面是原消息；右边一栏（`rf-aside`）放任务、文件、资料，和对话同时看。

## 结构
```html
<header class="rf-chead">                                   <!-- 频道面板头 -->
  <span class="rf-chan rf-chan--sm rf-chan--here"><i class="rf-i rf-i-hash"></i></span>
  <span class="rf-chead__text"><span class="rf-chead__name">launch-week</span><span class="rf-chead__sub">Ship the launch week · 5 members</span></span>
  <span class="rf-chead__spacer"></span>
  <button class="rf-iconbtn" type="button" aria-label="Channel details"><i class="rf-i rf-i-ellipsis"></i></button>
</header>
<div class="rf-tabs" role="tablist" aria-label="launch-week">…Chat / Tasks / Files…</div>

<section class="rf-thread" aria-label="Thread">            <!-- 线程面板 -->
  <header class="rf-chead">
    <span class="rf-chead__text"><span class="rf-chead__name">Thread</span><span class="rf-chead__sub">#launch-week · 3 replies</span></span>
    <span class="rf-chead__spacer"></span>
    <button class="rf-iconbtn" type="button" aria-label="Close thread"><i class="rf-i rf-i-x"></i></button>
  </header>
  <div class="rf-msg rf-thread__origin">…原消息…</div>
  …回复，最后是 Composer（Reply…）
</section>

<aside class="rf-aside" aria-label="Tasks">                <!-- 右边一栏：任务、文件、资料 -->
  <header class="rf-chead">
    <span class="rf-chead__text"><span class="rf-chead__name">Tasks</span><span class="rf-chead__sub">5 open</span></span>
    <span class="rf-chead__spacer"></span>
    <button class="rf-btn rf-btn--sm" type="button"><i class="rf-i rf-i-plus"></i>Create Task</button>
    <button class="rf-iconbtn" type="button" aria-label="Close tasks"><i class="rf-i rf-i-x"></i></button>
  </header>
  <div class="rf-aside__body">…</div>
</aside>
```
频道面板头里打开右边一栏的开关，是放在面板头里的 `rf-tabs__item` 按钮加 `aria-pressed`：打开的那个是黄贴纸，再点一次关掉（见 ScreenChannelViews 的 D）。

## 规则
- 面板头：位置块（频道）或头像（私信、资料），名字 17/22 700，下面一行 12/16 `ink-3` 的说明（人写的字用 Grotesk，数字和 ID 用 `rf-mono`），先写谁在这里干活；右边是图标按钮。频道的 ⋯ 打开右侧抽屉（Sheet 的 `rf-drawer`）。
- 名字旁边的签（Experimental、Archived、Deleted）和名字在同一行，是这一行里单独的一格，按形状居中，不手动挪位置；名字的字母本来就落在这一行的中线上（见《基础》的“对齐”）。它不放进下面那行说明：说明会截断，截断会切掉签的边。
- 面板头的图标按钮在桌面是小号（`rf-iconbtn--sm` 的尺寸：32，字形 18，点击区补到 44），彼此相隔 4，最后一个的字形止于 20 的边；手机上的顶栏仍是 44、字形 22（拇指）。所有面板头——频道、线程、任务、资料、抽屉的头——都是同一种按钮，不各自定尺寸。
- 面板头下面可以接一行分页（Tabs），第一张贴纸对齐面板头的 20 边。Raft Chat 的频道在这里放 Chat / Tasks / Files，也可以放进面板头（分段）或换成右边一栏，见 ScreenChannelViews。
- 右边一栏 `rf-aside`：380 宽，白底，左边一条 `line-seam`，有自己的 56 高面板头和 ×。一次只停一栏：线程、任务、文件、资料互相替换。屏宽不到 1024、或者并排以后主区不到 320 时，它盖住主区；手机上是 push 进去的一页。
- 线程面板不是窄一点的频道面板：头上写 Thread、在哪、几条回复，右上角关闭；最上面是原消息，下面一条发丝线。原消息上方留 20：悬停工具条骑在消息的上沿（见 Message），它是滚动区里的第一条，留得不够，工具条就被滚动区切掉、像是压在头底下。
- 线程只有对话和 composer，没有分页。什么时候并排由产品定；Raft Chat 的规则（主区 ≥680 而且横屏或屏宽 ≥1280，线程 360–400）见《Raft Chat》。手机上线程是 push 进去的一页。
