# PropertyList

属性列表：一件东西的几条事实，比如任务的 Status / Assignee / Created by、agent 的运行时和电脑；能改的值点一下就打开选择器。

## 结构
```html
<dl class="rf-props">
  <dt>Status</dt><dd><button class="rf-pick" type="button" aria-haspopup="menu"><span class="rf-chip rf-chip--progress"><span class="rf-pixel"></span>In Progress</span><i class="rf-i rf-i-chevron-down"></i></button></dd>
  <dt>Assignee</dt><dd><button class="rf-pick" type="button" aria-haspopup="listbox"><span class="rf-avatar rf-avatar--agent rf-avatar--xs rf-sprite-mushroom"></span>Bugen<i class="rf-i rf-i-chevron-down"></i></button></dd>
  <dt>Created by</dt><dd>Alex <span class="rf-mono">· Oct 14</span></dd>
</dl>
```

## 规则
- 两列：标签 13/18 500 `ink-3`；值 14/20 `ink`，至少 32 高。窄的地方用 `rf-props--stack`，标签在上。
- 值里放现成的部件：状态签、头像加名字、引用 chip、运行时签。ID 和时间用 Space Mono。
- 能改的值包在 `rf-pick` 里：平时没有框，悬停和按下时叠一层，点开就是 Select 弹出的部分。空值写成一个动作（Add to a Channel），加 `is-empty`。
- 任务详情里是一行三项：Status、Assignee、Created by；History 折叠在下面，展开是 Timeline。名字写显示名，不写 handle。
- 只读的事实不要做成能点的样子。
