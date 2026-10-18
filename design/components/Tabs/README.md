# Tabs

分页标签：同一页里的几个分区，每个分区有自己的内容。两版：贴纸（默认，选中是黄贴纸）和下划线（选中是墨色字加 2px 墨线，产品现在的样子），待定。放不下就横向滚动。

## 什么时候用
- 频道的 Chat / Tasks / Files（线程没有分页）；资料页的 Profile / Workspace / Apps / Activity / Reminders。
- 同一份内容换个看法 → SegmentedControl。
- 频道的几种内容还有别的放法：放进面板头的分段，或者把任务放进右边一栏，见 ScreenChannelViews。

## 结构
```html
<div class="rf-tabs" role="tablist" aria-label="launch-week">   <!-- 下划线版：class="rf-tabs rf-tabs--line" -->
  <button class="rf-tabs__item is-on" type="button" role="tab" aria-selected="true" aria-controls="chat">Chat</button>
  <button class="rf-tabs__item" type="button" role="tab" aria-selected="false">Tasks<span class="rf-tabs__count">5</span></button>
</div>
<div role="tabpanel" id="chat">…</div>
```

## 规则
- 贴纸版：每项 32 高（点击区补到 44），这一行上下各留 8，选中的贴纸离上下分区线一样远；宽度跟着字；14/20 600，没选中的 `ink-2`，选中的是黄贴纸、700。和侧栏、分段控件是同一种“你在这”。
- 下划线版：每项 44 高、项和项之间 20，只写字；选中的是 `ink` 字加一条 2px 墨线，坐在这一行的下沿上，颜色比贴纸少，适合分页多、或者上面已经有很多颜色的地方。
- 两版都是 `line-seam` 下沿；选中项的上下留白要一样，换字号、换高度时一起检查。
- 计数放 `rf-tabs__count`（Space Mono 12），不写进标签。
- 一屏只有一排 Tabs。放不下就横向滚动，不折行、不缩字号：这一排自己滚，不显示滚动条；鼠标的纵向滚轮也让它横着滚；有被藏住的标签的一侧渐隐 32（`is-overflow-start` / `is-overflow-end` / `is-overflow-both`）；选中的那张总是滚进视野。
- 贴纸版没有底轨道。第一张贴纸的边在内容边上（面板里是 20，和面板头的第一个元素、消息的头像列对齐）。暗色里选中的贴纸和所有贴纸一样带模切边，所以它和面板头的头像看上去是对齐的。
