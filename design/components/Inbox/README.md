# Inbox

别处发生、要你看到的事。两个地方用同一种行：**动态**（Activity：有人提到你、在等你批、交给了你）和**通知中心**（铃铛：电脑离线、额度快满、有更新）。没读的标题加粗、挂粉色提醒点；要你动手的，按钮直接放在行里。

## 什么时候用
- 动态：左边一列，点一条在右边打开；通知中心：铃铛点开的一列。入口放在哪由产品定（Raft Chat：动态在 Rail 和首页的 Activity，铃铛在桌面 Rail 底部和手机首页右上）。
- 你刚做的事的回执 → Toast；表单、对话框里要先读的说明 → Banner。

## 结构
```html
<div class="rf-inbox__head"><h2 class="rf-inbox__title">Activity</h2><button class="rf-btn rf-btn--ghost rf-btn--sm" type="button">Mark All Read</button></div>
<div class="rf-note rf-note--unread">
  <span class="rf-avatar rf-avatar--agent rf-sprite-ghost" role="img" aria-label="Martin"></span>
  <div class="rf-note__body"><div class="rf-note__ctx">#release-review · task #26</div><a class="rf-note__title" href="…">Martin needs your OK</a><div class="rf-note__text">All 14 checks passed.</div></div>
  <div class="rf-note__side"><span class="rf-note__time">10:48</span><span class="rf-pixel rf-pixel--attention" role="img" aria-label="unread"></span></div>
  <div class="rf-note__actions"><button class="rf-btn rf-btn--sm" type="button">Approve</button></div>
</div>
```

## 规则
- 前导是“谁”（头像）；系统通知没有“谁”，用 `rf-tile` 加一个图标：出错 `octagon-alert`、警告 `triangle-alert`（`rf-tile--warn`，浅橙），消息 `info`（`rf-tile--info`，浅青）。通知中心按出错 → 警告 → 消息排，关掉的那条在情况变了之前不再出现。
- 第一行写在哪（频道、任务、电脑），第二行写发生了什么（谁加动词），第三行是摘录，最多两行。
- 标题是链接，铺满整行；行里的按钮浮在上面，各自能点。未读 `rf-note--unread`：标题 `ink` 700，右边一个粉色提醒点；读过的标题 `ink-2` 600。打开的那一条加 `is-selected`（浅青）。
- 行里的按钮用墨线 `rf-btn--sm`，不用粉色：一列里会有好几行在等你批。
