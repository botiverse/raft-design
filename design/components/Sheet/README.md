# Sheet

抽屉和底部弹层。抽屉：详情和设置从右边滑出，下面的内容还在原地；大一点的设置用宽抽屉；手机上抽屉铺满，就是一整页。底部弹层：手机上从几项里选一个，或者一小段说明，从底部升起。

## 什么时候用
- 抽屉 `rf-drawer`（420）：要看一会儿、要滚动、能改的东西——频道详情、成员、线程的设置。
- 一次填完的大表单（一个 agent 的配置、注册一个应用）不再用宽抽屉，用 Dialog 的宽版（居中，896，带分段列表）。抽屉里的表单同样分段（`rf-drawer__section`，和 Dialog 宽版的 `rf-fsec` 是同一种段），底栏 Cancel / Save，一起保存；是 / 否用复选框（`rf-check rf-drawer__row`，下面一行写不勾会怎样），不用开关：开关是拨了就生效的。
- 底部列表 `rf-sheet` 加 `rf-sheet__item`：手机上选一个去处——切换工作区（见 NavBar）、Working now（见 AgentActivity）。当前的那项打勾、加粗。选一个值（排序、状态）不用它：那是 Select 的列表或 Menu 里打勾的一项。
- 底部弹层 `rf-sheet`：手机上一两句说明加一个按钮（加到主屏幕、本周用量）。
- 对一样东西做一件事 → Menu（手机长按和桌面右键是同一个菜单，不用底部弹层）；要你确认 → Dialog；悬停看一眼 → Popover。

## 结构
```html
<aside class="rf-drawer" role="dialog" aria-labelledby="t">
  <div class="rf-drawer__head"><span class="rf-drawer__title" id="t">Channel details</span><button class="rf-iconbtn" type="button" aria-label="Close"><i class="rf-i rf-i-x"></i></button></div>
  <div class="rf-drawer__body">…</div>
  <div class="rf-drawer__foot"><button class="rf-btn rf-btn--ghost" type="button">Cancel</button><button class="rf-btn rf-btn--primary" type="button">Save</button></div>
</aside>

<div class="rf-sheet" role="dialog" aria-labelledby="s">
  <span class="rf-sheet__grab" aria-hidden="true"></span>
  <div class="rf-sheet__head"><span class="rf-sheet__title" id="s">Add Raft to your Home Screen</span><button class="rf-iconbtn" type="button" aria-label="Close"><i class="rf-i rf-i-x"></i></button></div>
  <p class="rf-sheet__sub">…</p>
  <div class="rf-sheet__actions"><button class="rf-btn rf-btn--primary rf-btn--block" type="button">Got It</button></div>
</div>
```

## 规则
- `popover` 底、`line-seam` 边、`shadow-float`。模态的抽屉从右边滑入，页面其余部分铺和对话框一样的 `rf-scrim`（抽屉开着时后面点不了，遮罩把这件事说出来）；底部弹层同样铺遮罩。非模态、和主区并排停着的侧栏（线程、资料，见 Panel 的 `rf-aside`）不是抽屉，不铺。
- 抽屉最宽 420，头 56 高、下沿 `line-seam`，按钮放在底栏（44）。桌面上右上角是 ×（和面板头一样的小号图标按钮）；手机上铺满时没有 ×，左上角返回。
- 底部弹层顶角 `radius-xl`、带拖动条；标题 17/22 700，说明 14/20 `ink-2`。要列选项时用 `rf-sheet__item`（52 高、图标 20、字 16/24 500，当前值打勾、加粗）。
- 每个弹层都要有标题：看得见的标题，或者至少一个 `aria-label`。
