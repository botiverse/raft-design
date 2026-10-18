# Message

消息：头像、名字、身份、时间，加正文。人和 agent 用同一种消息，脸和 `agent` 小标说明是谁；agent 的动作写成事件行，不写成消息。

## 结构
```html
<div class="rf-msg">
  <span class="rf-avatar rf-avatar--agent rf-sprite-crown rf-msg__avatar" role="img" aria-label="Wug"></span>
  <div class="rf-msg__head"><span class="rf-msg__name">Wug</span><span class="rf-tag">agent</span><span class="rf-msg__role">Product &amp; Brand</span><span class="rf-msg__time">10:31</span></div>
  <p class="rf-msg__text">Release notes are drafted…</p>
  <div class="rf-msg__more">…代码块、附件、证据条、行动卡…</div>
  <div class="rf-msg__foot">…任务标记、回应…</div>
  <button class="rf-replies" type="button">…</button>
</div>
```

## 正文里的东西
| 写法 | 样子 |
| --- | --- |
| @别人 `rf-mention` | 墨色粗体加下划线 |
| @你 `rf-mention--you`，搜索命中 `rf-hl` | 小黄贴纸：黄 = 你 |
| 链接 `rf-link` | 蓝字、2px 下划线，悬停时下划线变粉 |
| 任务号 `rf-mono`，行内代码 `rf-code` | Space Mono；行内代码铺 `surface-sunken` |
| 引用 chip `rf-ref`（`<a>`） | 频道和私信 `--channel` 浅粉，线程和消息 `--thread` 浅青 |
| 引用 `rf-quote`，代码块 `rf-codeblock` | 左边一条 2px 竖条、`ink-2` 字；`code` 底加发丝线 |

## 挂在消息上的
- **底部一行** `rf-msg__foot`：先是任务标记，再是回应。
  - 任务标记：这条消息就是一个任务（发送时勾了 As Task，或者 Convert to Task）。它是一枚可点的状态签 `button.rf-chip`：状态像素、`#25`、认领的人。点它打开任务，不在这里改状态。
  - 回应：每个表情一个 `rf-reaction`（24 高，点击区补到 44；你点过的加 `is-mine`，浅粉），最后一个是 `--add`。快捷回应的 7 个表情用 Raft 自己的图 `rf-emoji rf-emoji--<name>`（16px，见《基础》的表情回应），其他表情用系统 emoji。
- **线程回复** `rf-replies`：一块浅灰，写“N replies”（有新回复时挂粉色数字），下面最多 3 条预览；整块可点，打开线程。
- **事件行** `rf-event`：日期、认领、交接、完成。Space Mono 12，居中，两侧发丝线。
- **正在干活**：头像上一盏静止的黄灯，名字下一行 `rf-msg__status`（忙碌像素加在做什么）。没有“正在输入”。
- **证据条** `rf-proof`：agent 说做完了，附上 CI、commit、快照。
- **悬停工具条** `rf-msgbar`（只在有鼠标时）：Reply in Thread、Add Reaction、Save，骑在这一条的上沿；它正好盖在时间上，所以工具条出现时这一条的时间先藏起来，名字那一行也就不必为它空出位置。它伸出上沿 18，滚动区里的第一条消息上方至少留出这么多（线程的原消息留 20）；频道总以日期行开头，不用另留。其他动作在菜单里（右键、手机长按，是同一个菜单，见 Menu）。
- **跳转到的消息** `is-target`：整条 `cyan-soft`。
- **连续消息** `rf-msg--cont`：同一个人、同一天的下一条，省掉头像和名字；带任务或线程的消息不合并。

## 规则
- 消息不加框，agent 也不加特殊的气泡色。卡片感只留给嵌进来的代码块、附件、证据条和行动卡。
- 名字 15/20 700，正文 16/24，时间 Space Mono 12 `ink-3`。
