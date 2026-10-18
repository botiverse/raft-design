# Composer

消息输入框：聊天页底部的墨线框，里面有输入、工具、As Task 和粉色发送键；@ 联想浮在它上面，附件排在输入框里。

## 什么时候用
- 发消息的地方：频道、私信、线程。表单里的多行文字 → TextField 的 `rf-textarea`。

## 结构
```html
<div class="rf-composer">
  <div class="rf-thumbs">…附件…</div>                                              <!-- 可选 -->
  <textarea class="rf-composer__input" rows="1" placeholder="Message #launch-week" aria-label="Message #launch-week"></textarea>
  <div class="rf-composer__bar">
    <button class="rf-iconbtn rf-iconbtn--sm" type="button" aria-label="Attach"><i class="rf-i rf-i-paperclip"></i></button>
    <span class="rf-composer__spacer"></span>
    <label class="rf-check"><input type="checkbox"><span class="rf-check__box"><i class="rf-i rf-i-check"></i></span>As Task</label>
    <button class="rf-iconbtn rf-iconbtn--primary rf-iconbtn--sm" type="button" aria-label="Send"><i class="rf-i rf-i-send"></i></button>
  </div>
</div>
```

## 部件
- **@ 联想**：输入 @ 时，在上方浮出一个 Menu，按“这个频道里的 agent / 不在这个频道里的”分组；每项是头像、名字和状态（`rf-menu__meta`），键盘高亮是浅黄。
- **附件**：`rf-thumbs` 里放 64×64 的 `rf-thumb`；上传中底部一条青色进度，右上角的 `rf-thumb__x` 用来移除。见 Attachment。
- **@ 委派 chip**（桌面）：`rf-mchips` 里列出这个频道最近在干活的 2–3 个 agent，每个是一个 `button.rf-mchip`，点一下就把 @ 填进输入框；`surface-sunken` 底，不加墨线。
- **As Task**（Raft Chat）：勾上以后，发出去的这条消息就是一个任务，底部挂任务标记（见 Message）；快捷键 ⌘ / Ctrl + Shift + Enter。

## 规则
- 发送键就是这一屏的粉色按钮。桌面可以换成带字的 `rf-btn rf-btn--primary rf-btn--sm`（发送 ↵）。
- 一组控件共用一条墨线：composer 有，里面的工具和 chip 没有。聚焦时整个 composer 亮起焦点环。
- 输入 16/24，常规字重：不管放在哪里（频道、线程、附件评论、转发）都一样，不跟外层的字号字重走。工具图标 `ink-2`；键盘弹起时贴着键盘。手机竖着拿时，回车是换行，发送靠发送键。
- 会话的输入框外框在内容边上（20，和消息的头像列对齐；手机同样对齐消息列），下面留 16 加安全区。
- 停在一段可滚动内容下面的紧凑输入框（附件评论、转发时附一句话）：上面一条 `line-seam`，四周留 12，自己不铺底色。
- @ / # 联想列表和输入框外框一样宽，浮在它上方 8。
- 可以把文件拖进来（不能拖文件夹）。
