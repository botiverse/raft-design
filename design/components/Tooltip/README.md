# Tooltip

文字提示：悬停或长按时冒出来的一句话，给没写字的东西补上名字、后果或快捷键。

## 什么时候用
- 图标按钮、截断了的名字、运行时签；桌面 Rail 的每一项（`rf-tooltip--right`，写入口的名字）。
- 要放链接或按钮 → Popover；按钮上已经写着的字，不要再用 tooltip 重复。

## 结构
```html
<span class="rf-tooltip" role="tooltip">Search <span class="rf-tooltip__kbd">⌘K</span></span>
<span class="rf-tooltip rf-tooltip--below" role="tooltip">Runs on Alex's MacBook</span>
<span class="rf-tooltip rf-tooltip--right" role="tooltip">Activity</span>        <!-- Rail：在图标右边 -->
```

## 规则
- `hud` 底、13/18 500、`radius-sm`、`shadow-float`，带一个指向触发物的小尖角；最宽 20rem。
- 快捷键放在 `rf-tooltip__kbd` 里（Space Mono 12）。tooltip 里的名字和按钮的 `aria-label` 写同一个词。
- 它补充名字，但不代替名字：图标按钮仍然要有 `aria-label`。触屏上长按出现，或者干脆把说明写在界面上。
