# Toast

轻提示：刚做完的一件事的回执，一块深色浮层，几秒后消失；可以带一个 View 或 Undo。

## 什么时候用
- 你刚做的事有了结果：发出去了、存好了、agent 干完了你刚派的活。
- 错过了会让人困惑的，不用 toast：整个工作区的情况、别处发生的事 → Inbox（通知中心、动态）；要确认的 → Dialog。

## 结构
```html
<div class="rf-toast" role="status">
  <span class="rf-avatar rf-avatar--agent rf-avatar--sm rf-sprite-ghost"></span>   <!-- 谁；没有“谁”时放一个 rf-pixel -->
  <span class="rf-toast__text"><b>Martin</b> finished reviewing <span class="rf-mono">#26</span>.</span>
  <button class="rf-toast__action" type="button">View</button>
</div>
```

## 规则
- `hud` 底、`on-hud` 字、14/20、`radius-lg`、`shadow-float`；补充说明放在 `rf-toast__sub`（`on-hud-2`）。
- 一句话：谁、做了什么、结果如何。动作是带下划线的文字，不是按钮；toast 里不放彩色按钮。
- 没有“谁”时放一个像素说结果：发成任务用 `--todo`，做完用 `--done`，出了问题用 `--error`。
- 同时最多一条；不用黄。
