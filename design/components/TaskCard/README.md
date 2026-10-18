# TaskCard

任务卡：频道、编号、标题和一枚可以改的状态签。看板和列表用同一张卡；列表按状态分组，看板按状态分列。

## 结构
```html
<div class="rf-task">
  <div class="rf-task__top"><span class="rf-task__chan">#launch-week</span><span class="rf-task__id">#25</span></div>
  <div class="rf-task__title">Polish the onboarding flow</div>
  <div class="rf-task__foot"><button class="rf-chip rf-chip--progress" type="button" aria-haspopup="menu" aria-label="Status: In Progress"><span class="rf-pixel"></span>In Progress<i class="rf-i rf-i-chevron-down"></i></button></div>
</div>

<div class="rf-board">                                  <!-- 看板：一列一种状态 -->
  <section class="rf-col" aria-label="Todo"><div class="rf-col__head"><span class="rf-pixel rf-pixel--todo"></span>Todo<span class="rf-col__count">1</span></div>…卡片…</section>
</div>

<div class="rf-section"><button class="rf-section__title" type="button" aria-expanded="true">…In Progress <span class="rf-section__count">2</span></button></div>
<div class="rf-tasklist">…卡片…</div>                 <!-- 列表：按状态分组 -->
```

## 规则
- 卡片是 `surface` 底、发丝线、`radius-lg`，没有阴影。频道（只在全局任务页上出现）和编号用 Space Mono；标题 16/24 600，用句首大写的动宾短语。
- 状态签点开就能改（一列状态，当前的打勾），这是卡上唯一能直接改的东西；负责人、创建人在任务详情里改。
- 状态的顺序是 Todo → In Progress → In Review → Done → Closed。列表里 Done 和 Closed 默认收起来；空的组和空的列写“No In Review tasks.”。
- 看板和列表两端都有，切换用筛选条最右边的 Board / List（SegmentedControl）；手机默认列表，选过的会记住。拖一张卡到别的列就是改状态。
- 在对话里，任务不是卡片：发出来的那条消息就是任务，底部挂一枚任务标记（见 Message）。
- 任务详情是居中的弹窗（手机上铺满）：上面一行属性 Status / Assignee / Created by（PropertyList），History 折叠在属性下面，再下面是这个任务的线程。
