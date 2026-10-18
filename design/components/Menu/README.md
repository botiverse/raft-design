# Menu

菜单：一列动作。手机长按和桌面右键、点 ⋯ 打开的是同一个菜单；悬停和键盘高亮是浅黄，当前值打勾、加粗。

## 什么时候用
- 对一样东西做事：消息、频道、任务、agent 的更多操作。也可以放“设置式”的选项（排序、状态），用勾表示当前值。
- 选一个要随表单提交的值 → Select。

## 结构
```html
<div class="rf-menu" role="menu" aria-label="Message from Wug">
  <div class="rf-menu__reacts" role="group" aria-label="Quick reactions"><button class="rf-menu__react" type="button" role="menuitem" aria-label="React with thumbs up"><span class="rf-emoji rf-emoji--thumbs_up" aria-hidden="true"></span></button>…</div>
  <div class="rf-menu__sep" role="separator"></div>
  <button class="rf-menu__item" type="button" role="menuitem"><i class="rf-i rf-i-messages-square"></i>Reply in Thread</button>
  <button class="rf-menu__item is-checked" type="button" role="menuitemradio" aria-checked="true"><span class="rf-pixel rf-pixel--progress"></span>In Progress<i class="rf-i rf-i-check rf-menu__end"></i></button>
  <button class="rf-menu__item" type="button" role="menuitem"><i class="rf-i rf-i-trash"></i>Delete Message</button>
</div>
```

## 规则
- 宽 240、`radius-lg`、`popover` 底、`line-seam` 边加 `shadow-float`；每项 36 高，图标 16 `ink-2`，字 14/20 500；快捷键 Space Mono 12 `ink-3`。
- 消息的菜单先放一排快捷回应（Raft 自己的表情图，22px，最后一个是 `smile-plus` 打开全部表情），它和第一个动作之间一条 `rf-menu__sep`；再分段放动作，段和段之间的线都一样。
- 高亮表示指针在哪，用浅黄；当前值表示选了哪个，打勾、加粗。两者不混。
- 删除、停止这类动作在菜单里不另上色：点了会弹出 Dialog，由它的红色、橙色按钮把关。禁用项是 `ink-disabled`。
- 菜单项的字用 Title Case（Copy Link）。每一行都是菜单项，方向键能走到。
