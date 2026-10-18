# Dialog

对话框：要你马上决定、或者填一两项才能继续时，盖在遮罩上的一张浮层。最多两个按钮，确认按钮的颜色说明后果。

## 什么时候用
- 收不回或会打断的操作的确认（菜单里的删除、停止都先到这里）；两三个字段就能做完的小事（新建频道）。
- 要看一会儿、能改的详情 → 抽屉（Sheet）；能撤销的操作 → 直接做，再给一个带 Undo 的 Toast。
- 任务详情也是居中的弹窗，但更宽（最宽 760），手机上铺满。
- 一次填完的大表单（注册 / 编辑一个应用、一个 agent 的配置）→ 宽版 `rf-dialog--wide`，见下面。

## 结构
```html
<div class="rf-scrim">                                  <!-- 铺满窗口、把对话框放在正中 -->
  <div class="rf-dialog" role="alertdialog" aria-labelledby="dlg-title">
    <div class="rf-dialog__title" id="dlg-title">Delete Box?</div>
    <div class="rf-dialog__body">Box leaves every channel.<div class="rf-banner rf-banner--danger">…</div></div>
    <div class="rf-dialog__actions"><button class="rf-btn rf-btn--ghost" type="button">Keep Box</button><button class="rf-btn rf-btn--danger" type="button">Delete Agent</button></div>
  </div>
</div>
```

## 确认按钮
| 后果 | 按钮 | 例子 |
| --- | --- | --- |
| 去做一件事 | `rf-btn--primary` | Create Channel |
| 会打断，但能恢复 | `rf-btn--warn` | Stop Wug |
| 收不回 | `rf-btn--danger`，正文里放一条 `rf-banner--danger`；删 agent、删工作区这类大东西，再加一个“输入名字确认” | Delete Agent |

## 宽版：一次填完的大表单
```html
<div class="rf-scrim">
  <form class="rf-dialog rf-dialog--wide" role="dialog" aria-labelledby="app-t">
    <div class="rf-dialog__head"><span class="rf-avatar rf-avatar--sm">AP</span><span class="rf-dialog__title" id="app-t">Edit Release Bot</span><button class="rf-iconbtn rf-iconbtn--sm" type="button" aria-label="Close"><i class="rf-i rf-i-x"></i></button></div>
    <div class="rf-dialog__frame">
      <nav class="rf-dialog__nav" aria-label="Sections"><a class="rf-srow is-on" href="#profile" aria-current="true"><span class="rf-srow__name">Profile</span></a>…</nav>
      <div class="rf-dialog__scroll">
        <section class="rf-fsec" id="profile"><div class="rf-fsec__head"><span class="rf-fsec__title">Profile</span><span class="rf-fsec__status">Complete</span></div><p class="rf-fsec__desc">Public identity and Marketplace-facing metadata.</p>…字段…</section>
        <section class="rf-fsec">…</section>
      </div>
    </div>
    <div class="rf-dialog__foot"><button class="rf-btn rf-btn--ghost" type="button">Cancel</button><button class="rf-btn rf-btn--primary" type="submit">Save</button></div>
  </form>
</div>
```
- 896 宽，固定高 min(760, 窗口高 − 32)，头和底栏不动、中间滚动。头 56：它的贴纸、标题（打开它的那句话：Register App；改的时候写 Edit 加它的名字）、×；头里不放提交。
- 左边分段列表 208 宽（侧栏行，正在读的那段是黄贴纸，跟着滚动走，点一下跳过去），和右边之间一条 `line-seam`；手机上没有分段列表。
- 每一段是 FormSection（`rf-fsec`）：小标题 13/18 700 `ink-2`，右边一个安静的状态签（Complete、Off、Private…），下面一句这一段做什么；字段间距 12，段与段之间 16 加一条发丝线。段里的动作（分享链接、申请发布、轮换密钥、删除）是普通的一行：左边说明，右边按钮。
- 底栏 Cancel（ghost）在前、粉色在后，都是 44。点外面不关闭（半填的表单不能被误点丢掉），× / Esc / Cancel 关闭。
- 新建时只出现保存前就能填的段。

## 规则
- 最宽 400、内边距 20、`radius-xl`；标题 17/22 700，句首大写；正文 15/20 `ink-2`。
- 所有居中的弹窗（对话框、确认、搜索、任务详情、宽版）都铺 `rf-scrim`，没有不暗的例外；出现和消失都没有动画。外框都是同一种对话框表面：`popover` 底、对话框圆角、分区线描边、`shadow-float`。
- 取消在左（ghost，写清楚留下什么：Keep Box），确认在右，按钮字用 Title Case。
- 每个对话框都要有标题，读屏软件读的就是它。用 `shadow-float`，没有硬阴影。
- `rf-scrim` 是 `position: fixed` 的遮罩；在预览里给外层套 `rf-pv__stage`，遮罩就只铺满那一块。
