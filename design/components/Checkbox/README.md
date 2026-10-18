# Checkbox

复选框：随表单一起提交的是 / 否。勾上是一块墨色方块加反白的勾——它是一个值，不是“你在这里”。

## 什么时候用
- 表单里、点了保存才生效的选项——对话框、抽屉、宽版对话框里都是它（下面一行写不勾会怎样）；附在一个动作上的选项（composer 的 As Task，放在工具栏里的 `rf-check`）。
- 立即生效 → Switch；几个里选一个 → Radio。

## 结构
```html
<label class="rf-check"><input type="checkbox" checked><span class="rf-check__box"><i class="rf-i rf-i-check"></i></span>As Task</label>
```

## 规则
- 真正的控件是 `<label>` 里第一个原生 `<input type="checkbox">`（视觉上藏起来）：勾选、禁用、键盘焦点都由它驱动，焦点环亮在方框上。静态示意可以用 `is-on` / `is-disabled` / `is-focus`。
- 方框 20×20、`radius-xs`；没勾时是墨线空框。整个 label 都能点，32 高，点击区补到 44；字 14/20 600。
- 禁用：方框和字都是 `ink-disabled`，底是 `surface-sunken`。
