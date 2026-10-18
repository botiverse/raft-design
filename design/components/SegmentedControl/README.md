# SegmentedControl

分段控件：一条浅灰轨道里放 2–4 段，在原地换一种看法，内容还是同一份；选中的那一段是黄贴纸。

## 什么时候用
- 同一块内容换个看法：任务的 Board / List（放在筛选条的最右边）、外观的 Light / Dark / System。
- 每段是不同的内容（频道的 Chat / Tasks / Files、资料页的几个分区）→ Tabs；表单里要提交的答案 → Radio。

## 结构
```html
<div class="rf-seg" role="group" aria-label="View">
  <button class="rf-seg__item is-on" type="button" aria-pressed="true"><i class="rf-i rf-i-columns-3"></i>Board</button>
  <button class="rf-seg__item" type="button" aria-pressed="false"><i class="rf-i rf-i-layout-list"></i>List</button>
</div>
```

## 规则
- 每段 32 高（点击区补到 44），14/20 600；没选中的 `ink-2`，选中的是黄贴纸、700。轨道是 `surface-sunken`，圆角 8 加 3。
- 轨道贴着分段，不撑满容器（撑满时右边是一截没用的灰）。只有它是表单里唯一的一个选择时才撑满（`rf-seg--block`），宽度平分给各段。
- 选中的那一段 `aria-pressed="true"`。窄屏放不下字时可以只留图标，但每段都要有 `aria-label`。
- 计数放 `rf-seg__count`（Space Mono 12），不写进标签。
