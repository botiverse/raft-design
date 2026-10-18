# Radio

单选：几个答案里选一个，跟着表单一起提交；选中是墨色圆点。它和开关是系统里仅有的两个圆形控件。

## 什么时候用
- 2–5 个互斥的答案，而且每个答案值得写一句说明：通知范围、谁能 @everyone。
- 原地换一种看法 → SegmentedControl；选项多或要搜 → Select；立即生效的是 / 否 → Switch。

## 结构
```html
<div class="rf-radios" role="radiogroup" aria-label="Notify me about">
  <label class="rf-radio"><input type="radio" name="notify" checked><span class="rf-radio__dot"></span>
    <span class="rf-radio__body"><span class="rf-radio__label">Mentions, DMs and approvals</span><span class="rf-radio__sub">Agents still post their work in the channel.</span></span></label>
  <label class="rf-radio"><input type="radio" name="notify"><span class="rf-radio__dot"></span><span class="rf-radio__body"><span class="rf-radio__label">Nothing</span></span></label>
</div>
```

## 规则
- 真正的控件是每个 label 里第一个原生 `<input type="radio">`（视觉上藏起来），同一组用同一个 `name`；选中、禁用、键盘焦点都由它驱动，焦点环亮在圆圈上。
- 圆 20、1.5px 墨线；选中是 8px 的墨色圆点。它和勾上的复选框一样是一个值，所以不用黄（产品用黄，见《取舍》）。
- 每行至少 44 高，整行可点；标签 15/20 600，说明 13/18 `ink-2`。
- 一组里总有一个被选中，默认选最常用、最安全的那个。
