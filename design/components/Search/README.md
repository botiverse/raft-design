# Search

搜索：一个搜索框、几个筛选条件、按种类分组的结果。命中的词是小黄贴纸，键盘高亮是浅黄；搜不到时用空状态。

## 结构
```html
<div class="rf-search" role="search"><i class="rf-i rf-i-search"></i><input class="rf-search__input" value="launch" aria-label="Search"><button class="rf-iconbtn rf-iconbtn--sm" type="button" aria-label="Clear"><i class="rf-i rf-i-x"></i></button></div>
<div class="rf-section"><span class="rf-section__title">Messages <span class="rf-section__count">13</span></span></div>
<a class="rf-hit is-active" href="…">
  <span class="rf-avatar rf-avatar--agent rf-avatar--sm rf-sprite-crown"></span>
  <span>
    <span class="rf-hit__head"><span class="rf-hit__who">Wug</span><span class="rf-hit__where">#launch-week</span><span class="rf-hit__time">10:42</span></span>
    <span class="rf-hit__text">… before the <span class="rf-hl">launch</span> post goes out?</span>
  </span>
</a>
```

## 规则
- 结果按种类分组：频道和人用 ListRow，消息用 `rf-hit`（谁、在哪、时间、两行摘录）。
- 命中的词用 `rf-hl`。键盘高亮 `is-active` 是浅黄，和菜单一样；指针悬停和别的行一样叠 `surface-pressed`。
- 范围和条件用 Select 里的筛选条件；搜不到时用 EmptyState，告诉人怎么放宽。
- 网页版从顶栏的搜索框打开：一个居中的弹窗（720 宽，上沿压住顶栏的搜索框，像是搜索框展开），和所有居中弹窗一样铺遮罩、没有动画；结果页本身占掉侧栏的位置。选中一条结果，它在右边一栏打开（线程结果直接打开线程），跳到的那条消息铺 `cyan-soft`。
- 搜索结果是去某个地方；在弹出框里搜一个要填的值 → Select。
