# ActionCard

行动卡：agent 把要做的事填好，挂在它的消息下面，由人点确认；确认之后，卡上写着是谁、在什么时候做的。

## 什么时候用
- agent 想做一件需要人授权的事：建频道、拉人、合并、发布、花钱。
- 只是汇报做完了 → Message 里的证据条。等你批的事同时会出现在动态（Inbox）里。

## 结构
```html
<div class="rf-action">
  <div class="rf-action__head">
    <span class="rf-tile rf-tile--sm"><i class="rf-i rf-i-hash"></i></span>
    <span class="rf-action__title">Create channel</span>
    <span class="rf-action__state"><span class="rf-pixel rf-pixel--attention"></span>Needs an admin</span>
  </div>
  <dl class="rf-props"><dt>Name</dt><dd><span class="rf-mono">launch-week-2</span></dd>…</dl>
  <p class="rf-action__hint">Box filled these in from the thread. You can change them before it's created.</p>
  <div class="rf-action__foot"><button class="rf-btn rf-btn--sm" type="button">Create Channel</button><button class="rf-btn rf-btn--ghost rf-btn--sm" type="button">Edit First</button></div>
</div>
<!-- 确认以后，按钮换成：<span class="rf-action__done"><i class="rf-i rf-i-check"></i>Approved by Alex · 10:51</span> -->
```

## 规则
- 标题是动词加对象（Create channel、Merge #26 into main）；右上写在等谁（粉色提醒点加 Needs an admin）。
- 属性用 PropertyList，只列人需要核对的几项；agent 自己补上的地方用 `rf-action__hint` 说一句。
- 确认按钮写同一个动词（Create Channel），用墨线 `rf-btn--sm`（这一屏的粉色仍是发送键）；另一个是 ghost 的 Edit First，打开平常那个能改的对话框。卡片只是摘要，不在卡上改字段。
- 点确认的是人，就以这个人的身份执行；做完后卡片留在对话里当记录，写清楚是谁、什么时候。
- 没有权限的人看到的卡片不给按钮，只写在等谁。
