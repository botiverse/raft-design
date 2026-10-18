# Select

选值：单选、带搜索的单选、多选、带搜索的多选，加上列表上方的筛选条件。

## 什么时候用
| 情况 | 用 |
| --- | --- |
| 10 个以内的选项，选一个 | 单选：`rf-select`（一个按钮），点开是一列，当前值打勾 |
| 选项多，选一个 | 带搜索的单选：同一个按钮，列表顶上一行搜索 `rf-menu__search`，打字就过滤 |
| 几个选项，选几个 | 多选：每项前面一个方框（`rf-check__box`），勾上是墨；按钮上写选中的值，太长就写“3 selected”。点选不关列表 |
| 选项多，选几个（人、agent、标签） | 带搜索的多选：`rf-select--multi`，选中的值变成框里的小块，后面接着打字过滤；列表里同样是方框 |
| 过滤一个列表 | `rf-filter`（Raft Chat 的任务页是 Channel / Assignee / Creator），点开是同样的列表（单选或多选，值多就带搜索）；生效后浅青、带数量 |

选完是去做一件事、不是存一个值 → Menu。

## 结构
```html
<button class="rf-select" type="button" aria-haspopup="listbox" aria-expanded="false">Codex<i class="rf-i rf-i-chevron-down"></i></button>

<div class="rf-select rf-select--multi">
  <span class="rf-tokens">
    <span class="rf-token"><span class="rf-avatar rf-avatar--agent rf-avatar--xs rf-sprite-mushroom"></span>Bugen<button class="rf-token__x" type="button" aria-label="Remove Bugen"><i class="rf-i rf-i-x"></i></button></span>
    <input class="rf-select__input" role="combobox" aria-expanded="true" aria-controls="people">
  </span>
</div>
<div class="rf-menu" role="listbox" id="people" aria-label="People and agents">
  <div class="rf-menu__search"><i class="rf-i rf-i-search"></i><input placeholder="Search people and agents"></div>   <!-- 单选的列表也可以有搜索行 -->
  <div class="rf-menu__label">Agents</div>
  <div class="rf-menu__item is-checked" role="option" aria-selected="true">…Martin<span class="rf-menu__meta">Codex</span><i class="rf-i rf-i-check rf-menu__end"></i></div>   <!-- 单选：当前值打勾 -->
  <div class="rf-menu__item is-checked" role="option" aria-selected="true"><span class="rf-check__box" aria-hidden="true"><i class="rf-i rf-i-check"></i></span>Bugen</div>   <!-- 多选：前面一个方框，列表用 aria-multiselectable="true" -->
  <div class="rf-menu__empty">No one matches “zz”.</div>
</div>

<button class="rf-filter is-applied" type="button" aria-haspopup="listbox"><i class="rf-i rf-i-hash"></i>Channel<span class="rf-filter__count">2</span></button>
```

## 规则
- `rf-select` 是控件：44 高、墨线，和输入框一样；还没选时加 `is-placeholder`。多选的框不是按钮，里面的移除按钮和输入框各自能被键盘走到，整个框一起亮焦点环。
- 选项按种类分组（Agents / People），副信息（运行时、角色、在不在线）放 `rf-menu__meta`；“没人”（Unassigned）排第一、不带头像。搜不到时写 `rf-menu__empty`，不留一个空弹层。
- 选中的值是 `rf-token`：28 高、`surface-sunken` 底，右边一个移除按钮。
- 筛选条件 32 高（点击区补到 44）：没生效时一圈 `line-seam`，生效后 `cyan-soft` 底加数量；旁边放一个 ghost 的 Clear All。“我建的”“交给我的”这类常用条件是列表里的两行（Raft Chat：Created by me / Assigned to me），不另做按钮。
- 多选时列表加 `aria-multiselectable="true"`；方框是装饰，选中状态由 `aria-selected` 说。勾选不关列表，点外面或按 Esc 才关。
- 手机上弹出的是同一个列表，不换成底部弹层：底部列表只用来选一个去处（切换工作区、Working now），见 Sheet。
- 列表贴着点开它的东西（见《基础》的层级）：`rf-select` 的列表和框一样宽；筛选条件的列表和它的左边对齐，右边放不下就改和右边对齐。
