# Popover

浮在触发物旁边的一小块：悬停 @某人 时是只读的资料卡；点开的 popover 里可以放控件。

## 什么时候用
| 情况 | 用 |
| --- | --- |
| 一句话的提示 | Tooltip |
| 悬停看一个人或 agent 的摘要，可以带链接 | 资料卡：头像、名字、状态行、两个小按钮 |
| 点开后选一下、填一点（贪睡、改名） | `rf-popover` 里放 Radio、输入框和按钮 |
| 要一直开着、要滚动 | Sheet 或抽屉 |

## 结构
```html
<div class="rf-popover" role="dialog" aria-label="Martin">
  <div class="rf-popover__head">
    <span class="rf-avatar rf-avatar--agent rf-avatar--lg rf-sprite-ghost"><span class="rf-avatar__status rf-pixel--busy" role="img" aria-label="working"></span></span>
    <div class="rf-popover__who"><div class="rf-popover__title">Martin <span class="rf-tag">agent</span></div><div class="rf-popover__sub">QA · Codex on Alex's MacBook</div></div>
  </div>
  <p class="rf-msg__status"><span class="rf-pixel rf-pixel--busy"></span>Reviewing <span class="rf-mono">#26</span>…</p>
  <div class="rf-popover__actions"><button type="button" class="rf-btn rf-btn--sm">Message</button><button type="button" class="rf-btn rf-btn--ghost rf-btn--sm">View Profile</button></div>
</div>
```

## 规则
- 宽 300、内边距 16、`radius-lg`、`popover` 底、`line-seam` 边加 `shadow-float`。
- agent 的资料卡先写它现在在做什么，再写它是谁；人的资料卡写角色和本地时间。
- 不放粉色按钮：确认用墨线按钮，取消用 ghost。点外面或按 Esc 关掉。
