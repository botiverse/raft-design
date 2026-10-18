# Timeline

时间线：按顺序列出发生了什么。任务历史用任务状态的颜色和人话；agent 的活动日志用状态灯的颜色和机器字。

## 结构
```html
<ol class="rf-tl">
  <li class="rf-tl__item"><span class="rf-pixel rf-pixel--progress"></span><span><span class="rf-tl__title"><b>Bugen</b> claimed it</span></span><span class="rf-tl__time">10:24</span></li>
  <li class="rf-tl__item"><span class="rf-pixel rf-pixel--review"></span><span><span class="rf-tl__title"><b>Bugen</b> moved it to In Review</span><span class="rf-tl__detail">commit c41e09 · 4 files changed</span></span><span class="rf-tl__time">11:02</span></li>
</ol>
<ol class="rf-tl rf-tl--log">…</ol>   <!-- agent 的活动日志 -->
```

## 规则
- 每条一个像素，像素之间用发丝线串起来；时间在右边，用 Space Mono。任务详情里它折叠在属性下面（History）。
- 任务历史：像素是这一步之后的任务状态；标题写“谁做了什么”，人名加粗。
- 活动日志（`rf-tl--log`）：像素用状态灯颜色（忙是黄、出错是橙、做完是绿），标题和细节都用 Space Mono；子 agent 做的那一步加一个 `rf-tag`（subagent）。日志只写做了什么，不写提示词和输出。
- 时间线本身不能点；要跳到某一步，就给标题里的对象加链接。
